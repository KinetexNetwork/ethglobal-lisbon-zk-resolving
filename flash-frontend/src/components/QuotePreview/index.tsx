import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import { QuoteDetails } from 'components/QuoteDetails';

import { isNull } from 'helpers/null';

import { quoteSelector } from 'logic/swapQuote';

export const QuotePreview: FC = () => {
  const quote = useRecoilValue(quoteSelector);
  if (isNull(quote)) {
    return null;
  }

  return <QuoteDetails quote={quote} />;
};
