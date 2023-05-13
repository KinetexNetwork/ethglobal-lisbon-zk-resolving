import { ApiClient } from './variant';

const getConfigBaseUrlV2 = (): string | undefined => {
  return process.env.REACT_APP_API_V2_BASE_URL;
};

const getConfigBaseUrlMeta = (): string | undefined => {
  return process.env.REACT_APP_API_META_BASE_URL;
};

const BASE_URL_GETTERS: Record<ApiClient, () => string | undefined> = {
  [ApiClient.V2]: getConfigBaseUrlV2,
  [ApiClient.Meta]: getConfigBaseUrlMeta,
};

export const getConfigBaseUrl = (apiClient: ApiClient): string | undefined => {
  const getBaseUrl = BASE_URL_GETTERS[apiClient];
  const baseUrl = getBaseUrl();
  return baseUrl;
};
