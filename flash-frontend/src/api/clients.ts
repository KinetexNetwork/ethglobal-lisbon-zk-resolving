import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { getConfigBaseUrl } from './config';
import { normalizeBaseUrl, paramsSerializer } from './transforms';
import { ApiClient } from './variant';

const createAxiosInstance = (apiClient: ApiClient): AxiosInstance => {
  const cfgBaseUrl = getConfigBaseUrl(apiClient);
  const baseURL = normalizeBaseUrl(cfgBaseUrl);
  const axiosInstance = Axios.create({ baseURL, paramsSerializer });
  return axiosInstance;
};

const AXIOS_V2_INSTANCE = createAxiosInstance(ApiClient.V2);
const AXIOS_META_INSTANCE = createAxiosInstance(ApiClient.Meta);

type Client = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;

export const clientV2: Client = (config, options) => {
  return AXIOS_V2_INSTANCE.request({ ...config, ...options });
};

export const clientMeta: Client = (config, options) => {
  return AXIOS_META_INSTANCE.request({ ...config, ...options });
};

export type ErrorType<Error> = AxiosError<Error>;
