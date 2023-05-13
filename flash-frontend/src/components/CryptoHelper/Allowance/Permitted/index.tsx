import { FC } from 'react';

import { formatTimePeriod } from 'helpers/format/time';
import { msToSec, useNowMs } from 'helpers/time';

export type AllowancePermittedData = { permitExpiresAt: Date };

type Props = {
  data: AllowancePermittedData;
};

export const Permitted: FC<Props> = ({ data }) => {
  const nowMs = useNowMs();
  const expiresAtMs = data.permitExpiresAt.getTime();
  const msLeft = expiresAtMs - nowMs;
  const secLeft = msToSec(msLeft);

  return <>Permitted ({formatTimePeriod(secLeft)})</>;
};
