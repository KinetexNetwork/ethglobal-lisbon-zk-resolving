import { Amount, Crypto, Quote, Swap, SwapState, SwapTransaction } from 'models';
import { makeCryptoId } from 'models/cryptoId';
import { makeUnknownCrypto } from 'models/unknown';
import { useCallback, useEffect } from 'react';
import { atom, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { getApiErrorDescription } from 'api/error';
import { SwapStateV2, SwapV2, TransactionV2, createSwapV2, getSwapV2 } from 'api/gen/v2';

import { amountToOrder } from 'helpers/amount';
import { stringToApiNumber } from 'helpers/api';
import { handleError } from 'helpers/error';
import { isNotNull, isNull } from 'helpers/null';
import { MILLISECONDS_IN_SECOND } from 'helpers/time';

import { CryptoGetter, useGetCrypto } from 'logic/crypto';
import { permitSelector } from 'logic/swapAllowance';

const ns = (key: string) => {
  return `swapProcess/${key}`;
};

export const swapCreateLoadingSelector = atom<boolean>({
  key: ns('swapCreateLoadingSelector'),
  default: false,
});

export const swapCreateErrorSelector = atom<string>({
  key: ns('swapCreateErrorSelector'),
  default: '',
});

export const swapSelector = atom<Swap | undefined>({
  key: ns('swapSelector'),
  default: undefined,
});

const SWAP_STATE_MAP: Record<SwapStateV2, SwapState> = {
  awaiting_signature: SwapState.AwaitingSignature,
  awaiting_transactions: SwapState.AwaitingTransactions,
  cancelled_no_withdraw: SwapState.CancelledNoWithdraw,
  cancelled_awaiting_withdraw: SwapState.CancelledAwaitingWithdraw,
  cancelled_withdrawn: SwapState.CancelledWithdrawn,
  completed: SwapState.Completed,
};

const mapSwapState = (state: SwapStateV2): SwapState => {
  return SWAP_STATE_MAP[state];
};

const mapSwapTransaction = (tx?: TransactionV2): SwapTransaction | undefined => {
  if (isNull(tx)) {
    return undefined;
  }

  const swapTransaction: SwapTransaction = {
    txid: tx.txid,
    explorerUrl: tx.explorer_url,
  };
  return swapTransaction;
};

const mapSwap = (s: SwapV2, getCrypto: CryptoGetter): Swap => {
  const getCryptoWithFallback = (chainId: string, address: string) => {
    const crypto = getCrypto(makeCryptoId({ chainId, address }));
    return crypto ?? makeUnknownCrypto(chainId, address);
  };

  const getCryptoAmount = (value: string, crypto: Crypto): Amount => {
    const amount: Amount = { v: value, d: crypto.decimals };
    return amount;
  };

  const fromCrypto = getCryptoWithFallback(s.from_chain_id, s.from_token_address);
  const toCrypto = getCryptoWithFallback(s.to_chain_id, s.to_token_address);
  const collateralCrypto = getCryptoWithFallback(s.collateral.chain_id, s.collateral.token_address);

  const fromAmount = getCryptoAmount(s.from_amount, fromCrypto);
  const toAmount = getCryptoAmount(s.to_amount, toCrypto);
  const collateralAmount = getCryptoAmount(s.collateral.amount, collateralCrypto);

  const swap: Swap = {
    fromCrypto,
    fromAmount,
    toCrypto,
    toAmount,
    collateralCrypto,
    collateralAmount,
    marketMakerAddress: s.market_maker.address,
    timeEstimate: s.eta,
    deadline: s.deadline,
    hash: s.hash,
    state: mapSwapState(s.state),
    orderData: s.order_data,
    userToMarketMakerTx: mapSwapTransaction(s.user_to_mm_tx),
    marketMakerToUserTx: mapSwapTransaction(s.mm_to_user_tx),
  };
  return swap;
};

export type SwapCreator = (quote: Quote, walletAddress: string) => void;

export const useCreateSwap = (): SwapCreator => {
  const getCrypto = useGetCrypto();

  const setSwapCreateLoading = useSetRecoilState(swapCreateLoadingSelector);
  const setSwapCreateError = useSetRecoilState(swapCreateErrorSelector);
  const setSwap = useSetRecoilState(swapSelector);

  const permit = useRecoilValue(permitSelector);
  const permitTransaction = permit?.transaction;

  const createSwap: SwapCreator = useCallback(
    async (quote, walletAddress) => {
      setSwapCreateLoading(true);
      setSwapCreateError('');
      setSwap(undefined);

      let error = '';
      let swap: Swap | undefined;
      try {
        const swapResult = await createSwapV2({
          from_chain_id: quote.fromCrypto.chain.id,
          from_token_address: quote.fromCrypto.address,
          from_amount: stringToApiNumber(amountToOrder(quote.fromAmount, quote.fromCrypto.decimals).v),
          to_chain_id: quote.toCrypto.chain.id,
          to_token_address: quote.toCrypto.address,
          user_address: walletAddress,
          permit_transaction: permitTransaction,
        });
        swap = mapSwap(swapResult.data, getCrypto);
      } catch (e) {
        error = handleError(e, 'Failed to create swap', getApiErrorDescription(e));
      }

      setSwapCreateLoading(false);
      setSwapCreateError(error);
      setSwap(swap);
    },
    [getCrypto, setSwap, setSwapCreateError, setSwapCreateLoading, permitTransaction],
  );

  return createSwap;
};

const SWAP_UPDATE_PERIOD = 5 * MILLISECONDS_IN_SECOND;
const FINAL_SWAP_STATES = new Set<SwapState>([
  SwapState.CancelledNoWithdraw,
  SwapState.CancelledWithdrawn,
  SwapState.Completed,
]);

export const useSwapUpdater = (): void => {
  const getCrypto = useGetCrypto();
  const [swap, setSwap] = useRecoilState(swapSelector);

  let swapHashToUpdate: string | undefined;
  if (isNotNull(swap) && !FINAL_SWAP_STATES.has(swap.state)) {
    swapHashToUpdate = swap.hash;
  }

  useEffect(() => {
    const swapHash = swapHashToUpdate;
    if (isNull(swapHash)) {
      return;
    }

    const updateSwap = async (): Promise<void> => {
      try {
        const swapResult = await getSwapV2(swapHash);
        const swap = mapSwap(swapResult.data, getCrypto);
        setSwap(swap);
      } catch (e) {
        handleError(e, 'Failed to update swap', getApiErrorDescription(e));
      }
    };

    updateSwap();
    const id = setInterval(() => {
      updateSwap();
    }, SWAP_UPDATE_PERIOD);

    return () => {
      clearInterval(id);
    };
  }, [swapHashToUpdate, getCrypto, setSwap]);
};
