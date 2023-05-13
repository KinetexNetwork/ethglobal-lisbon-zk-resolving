import { ParamsSerializerOptions } from 'axios';
import qs from 'qs';

import { isNull } from 'helpers/null';

export const normalizeBaseUrl = (baseUrl: string | undefined): string | undefined => {
  if (isNull(baseUrl)) {
    return undefined;
  }

  const isPortOnly = baseUrl.startsWith(':');
  if (isPortOnly) {
    const port = baseUrl.replace(':', '');
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  return baseUrl;
};

export const paramsSerializer: ParamsSerializerOptions = {
  serialize: (params: unknown): string => {
    return qs.stringify(params, { indices: false });
  },
};
