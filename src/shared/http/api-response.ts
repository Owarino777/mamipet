type ApiSuccess<TData> = {
  data: TData;
  meta: Record<string, unknown>;
  error: null;
};

type ApiFailure = {
  data: null;
  meta: Record<string, unknown>;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

export function ok<TData>(
  data: TData,
  meta: Record<string, unknown> = {},
): ApiSuccess<TData> {
  return {
    data,
    meta,
    error: null,
  };
}

export function fail(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiFailure {
  return {
    data: null,
    meta: {},
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
