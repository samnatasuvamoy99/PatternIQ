export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new ApiError(400, code, message);
  }
  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
    return new ApiError(401, code, message);
  }
  static forbidden(message = "Forbidden", code = "FORBIDDEN") {
    return new ApiError(403, code, message);
  }
  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new ApiError(404, code, message);
  }
  static conflict(message: string, code = "CONFLICT") {
    return new ApiError(409, code, message);
  }
  static tooMany(message = "Too many requests", code = "RATE_LIMITED") {
    return new ApiError(429, code, message);
  }
  static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
    return new ApiError(500, code, message);
  }
}
