import dayjs from 'dayjs';

import { SECONDS_IN_HOUR } from 'helpers/time';

export const formatTimePeriod = (seconds: number): string => {
  if (seconds < 0) {
    seconds = 0;
  }

  if (seconds < SECONDS_IN_HOUR) {
    return dayjs.unix(seconds).utc().format('mm:ss');
  }

  const hours = Math.floor(seconds / SECONDS_IN_HOUR);
  if (hours === 1) {
    return '1 hour';
  }

  return `${hours} hours`;
};

export const formatTimeToMinute = (isoDate: string): string => {
  return dayjs.utc(isoDate).local().format('MM/DD/YYYY, HH:mm');
};
