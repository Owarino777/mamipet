export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class ConfigurationError extends HttpError {
  constructor(message: string) {
    super(message, 500, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Authentication is required.") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "You do not have access to this resource.") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found.") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Resource conflict.") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}
