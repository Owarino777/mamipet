/** Bound upstream requests while retaining an existing caller cancellation signal. */
export const fetchWithTimeout: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(15000);
  const callerSignal =
    init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, timeout])
    : timeout;
  return fetch(input, { ...init, signal });
};
