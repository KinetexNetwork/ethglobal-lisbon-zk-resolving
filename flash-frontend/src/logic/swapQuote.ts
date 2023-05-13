import { Amount, Crypto, Quote } from 'models';
import { makeCryptoId } from 'models/cryptoId';
import { makeUnknownCrypto } from 'models/unknown';
import { useCallback, useEffect } from 'react';
import { atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { getApiErrorDescription } from 'api/error';
import { QuoteV2, getQuoteV2 } from 'api/gen/v2';

import { ZERO_AMOUNT, amountToOrder, compareAmountIs } from 'helpers/amount';
import { stringToApiNumber } from 'helpers/api';
import { cancellable } from 'helpers/cancellable';
import { handleError } from 'helpers/error';
import { isNotNull, isNull } from 'helpers/null';

import { CryptoGetter, useGetCrypto } from 'logic/crypto';
import { fromAmountSelector, fromCryptoSelector, sameCryptoSelector, toCryptoSelector } from 'logic/swapParams';

const ns = (key: string) => {
  return `swapQuote/${key}`;
};

export const quoteLoadingSelector = atom<boolean>({
  key: ns('quoteLoadingSelector'),
  default: false,
});

export const quoteErrorSelector = atom<string>({
  key: ns('quoteErrorSelector'),
  default: '',
});

const originalQuoteSelector = atom<QuoteV2 | undefined>({
  key: ns('originalQuoteSelector'),
  default: undefined,
});

export const quoteSelector = atom<Quote | undefined>({
  key: ns('quoteSelector'),
  default: undefined,
});

const quoteRefreshTriggerSelector = atom<object>({
  key: ns('quoteRefreshTriggerSelector'),
  default: {},
});

export const toAmountSelector = selector<Amount>({
  key: ns('toAmountSelector'),
  get: ({ get }) => {
    const quote = get(quoteSelector);
    if (isNull(quote)) {
      return ZERO_AMOUNT;
    }

    return quote.toAmount;
  },
});

export const toAmountLoadingSelector = selector<boolean>({
  key: ns('toAmountLoadingSelector'),
  get: ({ get }) => {
    const quoteLoading = get(quoteLoadingSelector);
    return quoteLoading;
  },
});

const mapQuote = (q: QuoteV2, getCrypto: CryptoGetter): Quote => {
  const getCryptoWithFallback = (chainId: string, address: string) => {
    const crypto = getCrypto(makeCryptoId({ chainId, address }));
    return crypto ?? makeUnknownCrypto(chainId, address);
  };

  const getCryptoAmount = (value: string, crypto: Crypto): Amount => {
    const amount: Amount = { v: value, d: crypto.decimals };
    return amount;
  };

  const fromCrypto = getCryptoWithFallback(q.from_chain_id, q.from_token_address);
  const toCrypto = getCryptoWithFallback(q.to_chain_id, q.to_token_address);
  const collateralCrypto = getCryptoWithFallback(q.collateral.chain_id, q.collateral.token_address);

  const fromAmount = getCryptoAmount(q.from_amount, fromCrypto);
  const toAmount = getCryptoAmount(q.to_amount, toCrypto);
  const collateralAmount = getCryptoAmount(q.collateral.amount, collateralCrypto);

  const quote: Quote = {
    fromCrypto,
    fromAmount,
    toCrypto,
    toAmount,
    collateralCrypto,
    collateralAmount,
    marketMakerAddress: q.market_maker.address,
    timeEstimate: q.eta,
    deadline: q.deadline,
  };
  return quote;
};

export const useSwapQuoteLoader = (): void => {
  const getCrypto = useGetCrypto();

  const fromCrypto = useRecoilValue(fromCryptoSelector);
  const fromAmount = useRecoilValue(fromAmountSelector);
  const toCrypto = useRecoilValue(toCryptoSelector);
  const sameCrypto = useRecoilValue(sameCryptoSelector);

  const [originalQuote, setOriginalQuote] = useRecoilState(originalQuoteSelector);
  const setQuote = useSetRecoilState(quoteSelector);
  const setQuoteLoading = useSetRecoilState(quoteLoadingSelector);
  const setQuoteError = useSetRecoilState(quoteErrorSelector);
  const quoteRefreshTrigger = useRecoilValue(quoteRefreshTriggerSelector);

  const readyToLoad =
    isNotNull(fromCrypto) && isNotNull(toCrypto) && compareAmountIs(fromAmount, 'greater', ZERO_AMOUNT) && !sameCrypto;

  const fromChainId = fromCrypto?.chain?.id ?? '';
  const toChainId = toCrypto?.chain?.id ?? '';
  const fromTokenAddress = fromCrypto?.address ?? '';
  const toTokenAddress = toCrypto?.address ?? '';
  const fromAmountValue = amountToOrder(fromAmount, fromCrypto?.decimals ?? 0).v;

  useEffect(() => {
    if (!readyToLoad) {
      setOriginalQuote(undefined);
      setQuoteLoading(false);
      setQuoteError('');
      return;
    }

    return cancellable(async (c) => {
      if (c.cancelled) {
        return;
      }

      setOriginalQuote(undefined);
      setQuoteLoading(true);
      setQuoteError('');

      let quote: QuoteV2 | undefined;
      let error = '';
      try {
        const quoteResult = await getQuoteV2({
          from_chain_id: fromChainId,
          from_token_address: fromTokenAddress,
          from_amount: stringToApiNumber(fromAmountValue),
          to_chain_id: toChainId,
          to_token_address: toTokenAddress,
        });
        quote = quoteResult.data;
      } catch (e) {
        error = handleError(e, 'Failed to get quote', getApiErrorDescription(e));
      }

      if (c.cancelled) {
        return;
      }

      setOriginalQuote(quote);
      setQuoteLoading(false);
      setQuoteError(error);
    });
  }, [
    fromAmountValue,
    fromChainId,
    fromTokenAddress,
    readyToLoad,
    setOriginalQuote,
    setQuoteError,
    setQuoteLoading,
    toChainId,
    toTokenAddress,
    quoteRefreshTrigger,
  ]);

  useEffect(() => {
    if (isNull(originalQuote)) {
      setQuote(undefined);
    } else {
      const quote = mapQuote(originalQuote, getCrypto);
      setQuote(quote);
    }
  }, [getCrypto, originalQuote, setQuote]);
};

export type SwapQuoteReloader = () => void;

export const useReloadSwapQuote = (): SwapQuoteReloader => {
  const setQuoteRefreshTrigger = useSetRecoilState(quoteRefreshTriggerSelector);

  const reloadSwap = useCallback(() => {
    setQuoteRefreshTrigger({});
  }, [setQuoteRefreshTrigger]);

  return reloadSwap;
};
