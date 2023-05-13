import { Amount, Permit, Quote } from 'models';
import { useCallback, useEffect } from 'react';
import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { getApiErrorDescription } from 'api/error';
import {
  AllowanceInfoV2,
  GetApproveV2Params,
  GetPermitDataV2Params,
  GetPermitTransactionV2Params,
  PermitDataV2,
  PermitModeV2,
  PermitTransactionV2,
  TransactionDataV2,
  getApproveV2,
  getPermitDataV2,
  getPermitTransactionV2,
  useGetAllowanceV2,
} from 'api/gen/v2';

import { amountToOrder, compareAmountIs } from 'helpers/amount';
import { stringToApiNumber } from 'helpers/api';
import { handleError } from 'helpers/error';
import { isNotNull, isNull } from 'helpers/null';
import { MILLISECONDS_IN_MINUTE, MILLISECONDS_IN_SECOND, dateFromSec } from 'helpers/time';

import { SendTransactionParams, SignTypedDataParams, getWalletErrorDescription, useWallet } from 'logic/wallet';

const ALLOWANCE_UPDATE_INTERVAL = 5 * MILLISECONDS_IN_SECOND;
const SAFE_PERMIT_TTL = 10 * MILLISECONDS_IN_MINUTE;

const ns = (key: string): string => {
  return `swapAllowance/${key}`;
};

const inProgressAtom = atom<boolean>({
  key: ns('inProgressAtom'),
  default: false,
});

const waitingApproveAtom = atom<boolean>({
  key: ns('waitingApproveAtom'),
  default: false,
});

const permitAtom = atom<Permit | undefined>({
  key: ns('permitAtom'),
  default: undefined,
});

export const permitSelector = selector<Permit | undefined>({
  key: ns('permitSelector'),
  get: ({ get }) => get(permitAtom),
});

const lastErrorAtom = atom<string>({
  key: ns('lastErrorAtom'),
  default: '',
});

type ActionType = 'approve' | 'permit';
type ActionTarget = 'xswap' | 'permit2';

type AllowanceVerdict =
  | 'no-action-needed'
  | 'should-approve-permit2'
  | 'should-provide-permit'
  | 'should-provide-permit2'
  | 'should-provide-approve';

const HAS_APPROVE_WAITING_BY_VERDICT: Record<AllowanceVerdict, boolean> = {
  'no-action-needed': false,
  'should-approve-permit2': true,
  'should-provide-permit': false,
  'should-provide-permit2': false,
  'should-provide-approve': true,
};

const ACTION_TYPE_BY_VERDICT: Record<AllowanceVerdict, ActionType> = {
  'no-action-needed': 'approve',
  'should-approve-permit2': 'approve',
  'should-provide-permit': 'permit',
  'should-provide-permit2': 'permit',
  'should-provide-approve': 'approve',
};

const ACTION_TARGET_BY_VERDICT: Record<AllowanceVerdict, ActionTarget> = {
  'no-action-needed': 'xswap',
  'should-approve-permit2': 'permit2',
  'should-provide-permit': 'xswap',
  'should-provide-permit2': 'xswap',
  'should-provide-approve': 'xswap',
};

const checkAllowance = (allowanceInfo: AllowanceInfoV2, quote: Quote): AllowanceVerdict => {
  const checkSufficient = (allowanceValue: string): boolean => {
    const allowance: Amount = {
      v: allowanceValue,
      d: quote.fromCrypto.decimals,
    };
    const sufficient = compareAmountIs(allowance, 'greater-or-equal', quote.fromAmount);
    return sufficient;
  };

  const sufficientXSwap = checkSufficient(allowanceInfo.allowance);
  if (sufficientXSwap) {
    return 'no-action-needed';
  }

  if (quote.fromCrypto.permit) {
    return 'should-provide-permit';
  }

  // Check if chain doesn't support Permit2
  if (isNull(allowanceInfo.allowance_p2)) {
    return 'should-provide-approve';
  }

  const sufficientPermit2 = checkSufficient(allowanceInfo.allowance_p2);
  if (!sufficientPermit2) {
    return 'should-approve-permit2';
  }

  return 'should-provide-permit2';
};

export type AllowanceData = {
  loading: boolean;
  shouldProvide: boolean;
  actionType: ActionType;
  actionTarget: ActionTarget;
  provideAction: () => void;
  inProgress: boolean;
  waitingApprove: boolean;
  permit?: Permit;
  resetPermit: () => void;
  lastError: string;
};

const allowanceDataAtom = atom<AllowanceData | undefined>({
  key: ns('allowanceDataAtom'),
  default: undefined,
});

export const useSwapAllowanceUpdater = (quote: Quote | undefined): AllowanceData => {
  const wallet = useWallet();

  const [inProgress, setInProgress] = useRecoilState(inProgressAtom);
  const [waitingApprove, setWaitingApprove] = useRecoilState(waitingApproveAtom);
  const [permit, setPermit] = useRecoilState(permitAtom);
  const [lastError, setLastError] = useRecoilState(lastErrorAtom);
  const setAllowanceData = useSetRecoilState(allowanceDataAtom);

  const allowanceEnabled = isNotNull(quote) && !!wallet.address;
  const allowanceResult = useGetAllowanceV2(
    {
      chain_id: quote?.fromCrypto?.chain?.id ?? '',
      token_address: quote?.fromCrypto?.address ?? '',
      user_address: wallet.address,
    },
    {
      query: {
        enabled: allowanceEnabled,
        refetchInterval: ALLOWANCE_UPDATE_INTERVAL,
      },
    },
  );

  const allowanceInfo = allowanceResult.data?.data;
  const ready = !allowanceEnabled || isNotNull(allowanceInfo);

  let allowanceVerdict: AllowanceVerdict = 'no-action-needed';
  if (isNotNull(quote) && isNotNull(allowanceInfo)) {
    allowanceVerdict = checkAllowance(allowanceInfo, quote);
  }

  const providePermitVerdict =
    allowanceVerdict === 'should-provide-permit' || allowanceVerdict === 'should-provide-permit2';
  const shouldProvide = allowanceVerdict !== 'no-action-needed' && !(providePermitVerdict && isNotNull(permit));
  const actionType = ACTION_TYPE_BY_VERDICT[allowanceVerdict];
  const actionTarget = ACTION_TARGET_BY_VERDICT[allowanceVerdict];

  // Reset Permit2 approve wait if permit allowance provided
  useEffect(() => {
    const hasApproveWaiting = HAS_APPROVE_WAITING_BY_VERDICT[allowanceVerdict];
    if (!hasApproveWaiting) {
      setWaitingApprove(false);
    }
  }, [setWaitingApprove, allowanceVerdict]);

  // Reset approve wait & error if "from" crypto changed
  const waitingPermit2ApproveFor = quote?.fromCrypto?.id ?? '';
  useEffect(() => {
    setWaitingApprove(false);
    setLastError('');
  }, [setWaitingApprove, setLastError, waitingPermit2ApproveFor]);

  // Invalidate permit if doesn't match offer params or expired
  useEffect(() => {
    if (isNull(permit) || isNull(quote)) {
      return;
    }

    const exceedsMaxAmount = (): boolean => {
      if (isNull(permit.maxAmount)) {
        return false;
      }

      const permitMaxAmount = { v: permit.maxAmount, d: quote.fromCrypto.decimals };
      if (compareAmountIs(quote.fromAmount, 'less-or-equal', permitMaxAmount)) {
        return false;
      }

      return true;
    };

    const expired = (): boolean => {
      const now = new Date().getTime();
      const safeExpiresAt = permit.expiresAt.getTime() - SAFE_PERMIT_TTL;
      return now > safeExpiresAt;
    };

    if (
      permit.userAddress !== wallet.address ||
      permit.chainId !== quote.fromCrypto.chain.id ||
      permit.tokenAddress !== quote.fromCrypto.address ||
      exceedsMaxAmount() ||
      expired()
    ) {
      setPermit(undefined);
    }
  }, [quote, permit, setPermit, wallet.address]);

  const resetPermit = useCallback(() => {
    setPermit(undefined);
  }, [setPermit]);

  const provideAllowanceViaApprove = async (
    allowanceInfo: AllowanceInfoV2,
    target: 'permit2' | 'xswap',
  ): Promise<void> => {
    setLastError('');

    const approveParams: GetApproveV2Params = {
      chain_id: allowanceInfo.chain_id,
      token_address: allowanceInfo.token_address,
      user_address: allowanceInfo.user_address,
      p2_contract: target === 'permit2',
    };

    let transaction: TransactionDataV2;
    try {
      const response = await getApproveV2(approveParams);
      transaction = response.data;
    } catch (e) {
      const error = handleError(e, 'Failed to fetch approve data', getApiErrorDescription(e));
      setLastError(error);
      return;
    }

    const sendTransactionParams: SendTransactionParams = {
      chainId: transaction.chain_id,
      from: transaction.from_address,
      to: transaction.to_address,
      value: transaction.value,
      data: transaction.data,
    };

    try {
      await wallet.sendTransaction(sendTransactionParams);
    } catch (e) {
      const error = handleError(e, 'Failed to approve token', getWalletErrorDescription(e));
      setLastError(error);
      return;
    }

    // We need to wait for approve to appear on blockchain before proceeding
    setWaitingApprove(true);
  };

  const provideAllowanceViaPermit = async (
    allowanceInfo: AllowanceInfoV2,
    mode: PermitModeV2,
    amount: string,
  ): Promise<void> => {
    setPermit(undefined);
    setLastError('');

    const permitDataParams: GetPermitDataV2Params = {
      chain_id: allowanceInfo.chain_id,
      token_address: allowanceInfo.token_address,
      user_address: allowanceInfo.user_address,
      mode,
      amount: stringToApiNumber(amount),
    };

    let permitData: PermitDataV2;
    try {
      const response = await getPermitDataV2(permitDataParams);
      permitData = response.data;
    } catch (e) {
      const error = handleError(e, 'Failed to fetch permit data', getApiErrorDescription(e));
      setLastError(error);
      return;
    }

    const signPermitParams: SignTypedDataParams = {
      chainId: permitData.chain_id,
      from: permitData.user_address,
      data: permitData.permit_data,
    };

    let permitSignature: string;
    try {
      permitSignature = await wallet.signTypedData(signPermitParams);
    } catch (e) {
      const error = handleError(e, 'Failed to sign permit', getWalletErrorDescription(e));
      setLastError(error);
      return;
    }

    const permitTransactionParams: GetPermitTransactionV2Params = {
      chain_id: permitData.chain_id,
      token_address: permitData.token_address,
      user_address: permitData.user_address,
      amount: isNotNull(permitData.amount) ? stringToApiNumber(permitData.amount) : undefined,
      deadline: permitData.deadline,
      mode: permitData.mode,
      permit_signature: permitSignature,
    };

    let permitTransaction: PermitTransactionV2;
    try {
      const response = await getPermitTransactionV2(permitTransactionParams);
      permitTransaction = response.data;
    } catch (e) {
      const error = handleError(e, 'Failed to get permit transaction', getApiErrorDescription(e));
      setLastError(error);
      return;
    }

    setPermit({
      transaction: permitTransaction.transaction,
      expiresAt: dateFromSec(permitData.deadline),
      chainId: permitData.chain_id,
      tokenAddress: permitData.token_address,
      userAddress: permitData.user_address,
      maxAmount: permitData.amount,
    });
  };

  const provideAction = async (): Promise<void> => {
    if (isNull(quote) || isNull(allowanceInfo) || !wallet.isConnected) {
      return;
    }

    const provideByVerdict = async (): Promise<void> => {
      const fromAmount = amountToOrder(quote.fromAmount, quote.fromCrypto.decimals).v;
      switch (allowanceVerdict) {
        case 'should-approve-permit2':
          return await provideAllowanceViaApprove(allowanceInfo, 'permit2');
        case 'should-provide-permit':
          return await provideAllowanceViaPermit(allowanceInfo, 'permit', fromAmount);
        case 'should-provide-permit2':
          return await provideAllowanceViaPermit(allowanceInfo, 'permit2', fromAmount);
        case 'should-provide-approve':
          return await provideAllowanceViaApprove(allowanceInfo, 'xswap');
      }
    };

    setInProgress(true);
    try {
      await provideByVerdict();
    } finally {
      setInProgress(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data: AllowanceData = {
    loading: !ready,
    shouldProvide,
    actionType,
    actionTarget,
    provideAction,
    inProgress,
    waitingApprove,
    permit,
    resetPermit,
    lastError,
  };

  useEffect(() => {
    setAllowanceData(data);
  }, [data, setAllowanceData]);

  return data;
};

export const useSwapAllowance = (): AllowanceData | undefined => {
  const allowance = useRecoilValue(allowanceDataAtom);
  return allowance;
};
