/**
 * Generated by orval v6.15.0 🍺
 * Do not edit manually.
 * v2
 * v2
 * OpenAPI spec version: v0.0.0
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { clientV2 } from '../clients';
import type { ErrorType } from '../clients';

export type GetQuoteV2Params = {
  from_chain_id: string;
  to_chain_id: string;
  from_token_address: string;
  to_token_address: string;
  from_amount: number;
};

export type GetPermitTransactionV2Params = {
  chain_id: string;
  token_address: string;
  user_address: string;
  deadline: number;
  permit_signature: string;
  amount?: number;
  mode?: PermitModeV2;
};

export type GetPermitDataV2Params = {
  chain_id: string;
  token_address: string;
  user_address: string;
  mode?: PermitModeV2;
  amount?: number;
};

export type GetApproveV2Params = {
  chain_id: string;
  token_address: string;
  user_address: string;
  p2_contract?: boolean;
};

export type GetAllowanceV2Params = {
  chain_id: string;
  token_address: string;
  user_address: string;
};

export type ValidationErrorV2LocItem = string | number;

export interface ValidationErrorV2 {
  loc: ValidationErrorV2LocItem[];
  msg: string;
  type: string;
}

export interface TransactionDataV2 {
  chain_id: string;
  data: string;
  value?: string;
  to_address: string;
  from_address: string;
}

export interface TransactionV2 {
  chain_id: string;
  txid: string;
  explorer_url: string;
}

/**
 * An enumeration.
 */
export type SwapStateV2 = (typeof SwapStateV2)[keyof typeof SwapStateV2];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SwapStateV2 = {
  awaiting_signature: 'awaiting_signature',
  awaiting_transactions: 'awaiting_transactions',
  cancelled_no_withdraw: 'cancelled_no_withdraw',
  cancelled_awaiting_withdraw: 'cancelled_awaiting_withdraw',
  cancelled_withdrawn: 'cancelled_withdrawn',
  completed: 'completed',
} as const;

export interface SwapV2 {
  hash: string;
  from_chain_id: string;
  to_chain_id: string;
  from_token_address: string;
  to_token_address: string;
  from_amount: string;
  to_amount: string;
  deadline: number;
  eta: number;
  market_maker: MarketMakerV2;
  collateral: CollateralV2;
  order_data: string;
  order: OrderV2;
  state: SwapStateV2;
  user_to_mm_tx?: TransactionV2;
  mm_to_user_tx?: TransactionV2;
}

export interface QuoteV2 {
  from_chain_id: string;
  to_chain_id: string;
  from_token_address: string;
  to_token_address: string;
  from_amount: string;
  to_amount: string;
  eta: number;
  deadline: number;
  market_maker: MarketMakerV2;
  collateral: CollateralV2;
}

export interface PermitTransactionV2 {
  transaction: string;
}

/**
 * An enumeration.
 */
export type PermitModeV2 = (typeof PermitModeV2)[keyof typeof PermitModeV2];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PermitModeV2 = {
  permit: 'permit',
  permit2: 'permit2',
} as const;

export interface PermitDataV2 {
  chain_id: string;
  token_address: string;
  user_address: string;
  amount?: string;
  deadline: number;
  permit_data: string;
  mode: PermitModeV2;
}

export interface OrderV2 {
  from_actor: string;
  from_chain: string;
  from_token: string;
  from_amount: string;
  to_actor: string;
  to_chain: string;
  to_token: string;
  to_amount: string;
  collateral_chain: string;
  collateral_amount: string;
  deadline: number;
  nonce: number;
}

export interface MarketMakerV2 {
  address: string;
}

export interface HTTPValidationErrorV2 {
  detail?: ValidationErrorV2[];
}

export interface CreateSwapV2 {
  from_chain_id: string;
  to_chain_id: string;
  from_token_address: string;
  to_token_address: string;
  from_amount: number;
  user_address: string;
  permit_transaction?: string;
}

export interface ConfirmSwapV2 {
  signature: string;
}

export interface CollateralV2 {
  chain_id: string;
  token_address: string;
  amount: string;
}

export interface AllowanceInfoV2 {
  chain_id: string;
  token_address: string;
  user_address: string;
  contract_address: string;
  allowance: string;
  allowance_p2?: string;
}

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

// eslint-disable-next-line
type SecondParameter<T extends (...args: any) => any> = T extends (config: any, args: infer P) => any ? P : never;

/**
 * Returns token allowance
 * @summary Get allowance
 */
export const getAllowanceV2 = (
  params: GetAllowanceV2Params,
  options?: SecondParameter<typeof clientV2>,
  signal?: AbortSignal,
) => {
  return clientV2<AllowanceInfoV2>({ url: `/api/v0/allowance`, method: 'get', params, signal }, options);
};

export const getGetAllowanceV2QueryKey = (params: GetAllowanceV2Params) =>
  [`/api/v0/allowance`, ...(params ? [params] : [])] as const;

export const getGetAllowanceV2QueryOptions = <
  TData = Awaited<ReturnType<typeof getAllowanceV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetAllowanceV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAllowanceV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryOptions<Awaited<ReturnType<typeof getAllowanceV2>>, TError, TData> & { queryKey: QueryKey } => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetAllowanceV2QueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getAllowanceV2>>> = ({ signal }) =>
    getAllowanceV2(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions };
};

export type GetAllowanceV2QueryResult = NonNullable<Awaited<ReturnType<typeof getAllowanceV2>>>;
export type GetAllowanceV2QueryError = ErrorType<HTTPValidationErrorV2>;

export const useGetAllowanceV2 = <
  TData = Awaited<ReturnType<typeof getAllowanceV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetAllowanceV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAllowanceV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetAllowanceV2QueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * Returns call data to approve token
 * @summary Get approve
 */
export const getApproveV2 = (
  params: GetApproveV2Params,
  options?: SecondParameter<typeof clientV2>,
  signal?: AbortSignal,
) => {
  return clientV2<TransactionDataV2>({ url: `/api/v0/approve`, method: 'get', params, signal }, options);
};

export const getGetApproveV2QueryKey = (params: GetApproveV2Params) =>
  [`/api/v0/approve`, ...(params ? [params] : [])] as const;

export const getGetApproveV2QueryOptions = <
  TData = Awaited<ReturnType<typeof getApproveV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetApproveV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getApproveV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryOptions<Awaited<ReturnType<typeof getApproveV2>>, TError, TData> & { queryKey: QueryKey } => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetApproveV2QueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getApproveV2>>> = ({ signal }) =>
    getApproveV2(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions };
};

export type GetApproveV2QueryResult = NonNullable<Awaited<ReturnType<typeof getApproveV2>>>;
export type GetApproveV2QueryError = ErrorType<HTTPValidationErrorV2>;

export const useGetApproveV2 = <
  TData = Awaited<ReturnType<typeof getApproveV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetApproveV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getApproveV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetApproveV2QueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * Returns token permit data to sign
 * @summary Get permit data
 */
export const getPermitDataV2 = (
  params: GetPermitDataV2Params,
  options?: SecondParameter<typeof clientV2>,
  signal?: AbortSignal,
) => {
  return clientV2<PermitDataV2>({ url: `/api/v0/permit/data`, method: 'get', params, signal }, options);
};

export const getGetPermitDataV2QueryKey = (params: GetPermitDataV2Params) =>
  [`/api/v0/permit/data`, ...(params ? [params] : [])] as const;

export const getGetPermitDataV2QueryOptions = <
  TData = Awaited<ReturnType<typeof getPermitDataV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetPermitDataV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPermitDataV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryOptions<Awaited<ReturnType<typeof getPermitDataV2>>, TError, TData> & { queryKey: QueryKey } => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetPermitDataV2QueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getPermitDataV2>>> = ({ signal }) =>
    getPermitDataV2(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions };
};

export type GetPermitDataV2QueryResult = NonNullable<Awaited<ReturnType<typeof getPermitDataV2>>>;
export type GetPermitDataV2QueryError = ErrorType<HTTPValidationErrorV2>;

export const useGetPermitDataV2 = <
  TData = Awaited<ReturnType<typeof getPermitDataV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetPermitDataV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPermitDataV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetPermitDataV2QueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * Returns tokens permit signature
 * @summary Gets permit transaction
 */
export const getPermitTransactionV2 = (
  params: GetPermitTransactionV2Params,
  options?: SecondParameter<typeof clientV2>,
  signal?: AbortSignal,
) => {
  return clientV2<PermitTransactionV2>({ url: `/api/v0/permit/transaction`, method: 'get', params, signal }, options);
};

export const getGetPermitTransactionV2QueryKey = (params: GetPermitTransactionV2Params) =>
  [`/api/v0/permit/transaction`, ...(params ? [params] : [])] as const;

export const getGetPermitTransactionV2QueryOptions = <
  TData = Awaited<ReturnType<typeof getPermitTransactionV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetPermitTransactionV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPermitTransactionV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryOptions<Awaited<ReturnType<typeof getPermitTransactionV2>>, TError, TData> & { queryKey: QueryKey } => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetPermitTransactionV2QueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getPermitTransactionV2>>> = ({ signal }) =>
    getPermitTransactionV2(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions };
};

export type GetPermitTransactionV2QueryResult = NonNullable<Awaited<ReturnType<typeof getPermitTransactionV2>>>;
export type GetPermitTransactionV2QueryError = ErrorType<HTTPValidationErrorV2>;

export const useGetPermitTransactionV2 = <
  TData = Awaited<ReturnType<typeof getPermitTransactionV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetPermitTransactionV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPermitTransactionV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetPermitTransactionV2QueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * Returns quote
 * @summary Get quote
 */
export const getQuoteV2 = (
  params: GetQuoteV2Params,
  options?: SecondParameter<typeof clientV2>,
  signal?: AbortSignal,
) => {
  return clientV2<QuoteV2>({ url: `/api/v0/quote`, method: 'get', params, signal }, options);
};

export const getGetQuoteV2QueryKey = (params: GetQuoteV2Params) =>
  [`/api/v0/quote`, ...(params ? [params] : [])] as const;

export const getGetQuoteV2QueryOptions = <
  TData = Awaited<ReturnType<typeof getQuoteV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetQuoteV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuoteV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryOptions<Awaited<ReturnType<typeof getQuoteV2>>, TError, TData> & { queryKey: QueryKey } => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetQuoteV2QueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getQuoteV2>>> = ({ signal }) =>
    getQuoteV2(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions };
};

export type GetQuoteV2QueryResult = NonNullable<Awaited<ReturnType<typeof getQuoteV2>>>;
export type GetQuoteV2QueryError = ErrorType<HTTPValidationErrorV2>;

export const useGetQuoteV2 = <
  TData = Awaited<ReturnType<typeof getQuoteV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  params: GetQuoteV2Params,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getQuoteV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetQuoteV2QueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * Creates swap
 * @summary Create swap
 */
export const createSwapV2 = (createSwapV2: CreateSwapV2, options?: SecondParameter<typeof clientV2>) => {
  return clientV2<SwapV2>(
    { url: `/api/v0/swaps`, method: 'post', headers: { 'Content-Type': 'application/json' }, data: createSwapV2 },
    options,
  );
};

export const getCreateSwapV2MutationOptions = <
  TError = ErrorType<HTTPValidationErrorV2>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSwapV2>>, TError, { data: CreateSwapV2 }, TContext>;
  request?: SecondParameter<typeof clientV2>;
}): UseMutationOptions<Awaited<ReturnType<typeof createSwapV2>>, TError, { data: CreateSwapV2 }, TContext> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof createSwapV2>>, { data: CreateSwapV2 }> = (props) => {
    const { data } = props ?? {};

    return createSwapV2(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type CreateSwapV2MutationResult = NonNullable<Awaited<ReturnType<typeof createSwapV2>>>;
export type CreateSwapV2MutationBody = CreateSwapV2;
export type CreateSwapV2MutationError = ErrorType<HTTPValidationErrorV2>;

export const useCreateSwapV2 = <TError = ErrorType<HTTPValidationErrorV2>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSwapV2>>, TError, { data: CreateSwapV2 }, TContext>;
  request?: SecondParameter<typeof clientV2>;
}) => {
  const mutationOptions = getCreateSwapV2MutationOptions(options);

  return useMutation(mutationOptions);
};

/**
 * Returns swap
 * @summary Get swap
 */
export const getSwapV2 = (swapHash: string, options?: SecondParameter<typeof clientV2>, signal?: AbortSignal) => {
  return clientV2<SwapV2>({ url: `/api/v0/swaps/${swapHash}`, method: 'get', signal }, options);
};

export const getGetSwapV2QueryKey = (swapHash: string) => [`/api/v0/swaps/${swapHash}`] as const;

export const getGetSwapV2QueryOptions = <
  TData = Awaited<ReturnType<typeof getSwapV2>>,
  TError = ErrorType<HTTPValidationErrorV2>,
>(
  swapHash: string,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSwapV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryOptions<Awaited<ReturnType<typeof getSwapV2>>, TError, TData> & { queryKey: QueryKey } => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetSwapV2QueryKey(swapHash);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getSwapV2>>> = ({ signal }) =>
    getSwapV2(swapHash, requestOptions, signal);

  return { queryKey, queryFn, enabled: !!swapHash, ...queryOptions };
};

export type GetSwapV2QueryResult = NonNullable<Awaited<ReturnType<typeof getSwapV2>>>;
export type GetSwapV2QueryError = ErrorType<HTTPValidationErrorV2>;

export const useGetSwapV2 = <TData = Awaited<ReturnType<typeof getSwapV2>>, TError = ErrorType<HTTPValidationErrorV2>>(
  swapHash: string,
  options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSwapV2>>, TError, TData>;
    request?: SecondParameter<typeof clientV2>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = getGetSwapV2QueryOptions(swapHash, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * Sends signed order to MM
 * @summary Confirm swap
 */
export const confirmSwapV2 = (
  swapHash: string,
  confirmSwapV2: ConfirmSwapV2,
  options?: SecondParameter<typeof clientV2>,
) => {
  return clientV2<SwapV2>(
    {
      url: `/api/v0/swaps/${swapHash}/confirm`,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: confirmSwapV2,
    },
    options,
  );
};

export const getConfirmSwapV2MutationOptions = <
  TError = ErrorType<HTTPValidationErrorV2>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof confirmSwapV2>>,
    TError,
    { swapHash: string; data: ConfirmSwapV2 },
    TContext
  >;
  request?: SecondParameter<typeof clientV2>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof confirmSwapV2>>,
  TError,
  { swapHash: string; data: ConfirmSwapV2 },
  TContext
> => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof confirmSwapV2>>,
    { swapHash: string; data: ConfirmSwapV2 }
  > = (props) => {
    const { swapHash, data } = props ?? {};

    return confirmSwapV2(swapHash, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type ConfirmSwapV2MutationResult = NonNullable<Awaited<ReturnType<typeof confirmSwapV2>>>;
export type ConfirmSwapV2MutationBody = ConfirmSwapV2;
export type ConfirmSwapV2MutationError = ErrorType<HTTPValidationErrorV2>;

export const useConfirmSwapV2 = <TError = ErrorType<HTTPValidationErrorV2>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof confirmSwapV2>>,
    TError,
    { swapHash: string; data: ConfirmSwapV2 },
    TContext
  >;
  request?: SecondParameter<typeof clientV2>;
}) => {
  const mutationOptions = getConfirmSwapV2MutationOptions(options);

  return useMutation(mutationOptions);
};
