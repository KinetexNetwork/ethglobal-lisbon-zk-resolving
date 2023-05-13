import { AxiosError } from 'axios';

import { isNull } from 'helpers/null';

/**
 * Extracts API error description from Axios exception.
 * May return empty string if no description available
 */
export const getApiErrorDescription = (error: unknown, context = ''): string => {
  if (!(error instanceof AxiosError)) {
    return '';
  }

  const data = error.response?.data;
  if (!isNull(data)) {
    const dataError = data.error;
    if (typeof dataError === 'string' && dataError) {
      return dataError;
    }

    const dataDetail = data.detail;
    if (typeof dataDetail === 'string' && dataDetail) {
      return dataDetail;
    }
  }

  if (error.message) {
    if (context) {
      return `${context}: ${error.message}`;
    }
    return error.message;
  }

  return '';
};
