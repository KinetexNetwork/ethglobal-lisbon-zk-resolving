import { useEffect, useState } from 'react';

export const MILLISECONDS_IN_SECOND = 1000;
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;

export const MILLISECONDS_IN_MINUTE = MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE;
export const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;
export const SECONDS_IN_DAY = SECONDS_IN_HOUR * HOURS_IN_DAY;

export const getNowInMs = (): number => {
  return new Date().getTime();
};

export const msToSec = (ms: number): number => {
  return Math.floor(ms / MILLISECONDS_IN_SECOND);
};

export const getNowInSec = (): number => {
  return msToSec(getNowInMs());
};

export const dateFromIso = (isoDate: string): Date => {
  if (!isoDate.includes('Z')) {
    isoDate += 'Z';
  }
  return new Date(isoDate);
};

export const dateFromMs = (ms: number): Date => {
  return new Date(ms);
};

export const dateFromSec = (sec: number): Date => {
  return dateFromMs(sec * MILLISECONDS_IN_SECOND);
};

export const isoFromMs = (ms: number): string => {
  return dateFromMs(ms).toISOString();
};

export const isoFromSec = (sec: number): string => {
  return dateFromSec(sec).toISOString();
};

type NowOptions = {
  updatePeriod?: number;
};

export const useNowMs = ({ updatePeriod = 1000 }: NowOptions = {}): number => {
  const [nowMs, setNowMs] = useState(getNowInMs());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowMs(getNowInMs());
    }, updatePeriod);

    return () => {
      clearInterval(intervalId);
    };
  }, [updatePeriod]);

  return nowMs;
};

export const useNowSec = (options?: NowOptions): number => {
  const nowMs = useNowMs(options);
  const nowSec = msToSec(nowMs);
  return nowSec;
};
