import { FC } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Stack } from '@mui/material';

import { AllowanceHelperData } from 'components/CryptoHelper/Allowance';
import { CryptoInput } from 'components/CryptoInput';
import { ReverseButton } from 'components/ReverseButton';

import { isNotNull, isNull } from 'helpers/null';

import { useSwapAllowance } from 'logic/swapAllowance';
import { fromAmountSelector, fromCryptoSelector, sameCryptoSelector, toCryptoSelector } from 'logic/swapParams';
import { toAmountLoadingSelector, toAmountSelector } from 'logic/swapQuote';

export const BuySellForm: FC = () => {
  const [fromCrypto, setFromCrypto] = useRecoilState(fromCryptoSelector);
  const [fromAmount, setFromAmount] = useRecoilState(fromAmountSelector);
  const [toCrypto, setToCrypto] = useRecoilState(toCryptoSelector);
  const sameCrypto = useRecoilValue(sameCryptoSelector);
  const toAmount = useRecoilValue(toAmountSelector);
  const toAmountLoading = useRecoilValue(toAmountLoadingSelector);
  const allowance = useSwapAllowance();

  const getAllowanceHelper = (): AllowanceHelperData | undefined => {
    if (isNull(fromCrypto) || isNull(allowance)) {
      return undefined;
    }

    if (allowance.loading) {
      return 'loading';
    }

    if (allowance.shouldProvide) {
      switch (allowance.actionType) {
        case 'approve':
          return 'needs-approve';
        case 'permit':
          return 'needs-permit';
      }
    }

    if (isNotNull(allowance.permit)) {
      return { permitExpiresAt: allowance.permit.expiresAt };
    }

    return undefined;
  };

  return (
    <Stack sx={{ position: 'relative', gap: 2 }}>
      <CryptoInput
        id='from-crypto'
        label='You sell'
        crypto={fromCrypto}
        cryptoType='swap-from'
        onCryptoSelect={setFromCrypto}
        amount={fromAmount}
        onAmountChange={setFromAmount}
        allowanceHelper={getAllowanceHelper()}
      />

      <Stack
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          alignItems: 'center',
        }}
      >
        <ReverseButton />
      </Stack>

      <CryptoInput
        id='to-crypto'
        label='You buy'
        crypto={toCrypto}
        cryptoType='swap-to'
        onCryptoSelect={setToCrypto}
        showSameCrypto={sameCrypto}
        amount={toAmount}
        loading={toAmountLoading}
        readonly
      />
    </Stack>
  );
};
