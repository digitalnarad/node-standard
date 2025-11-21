import { API_RESPONSE } from "#src/utils/ApiResponse.js";
import { ERROR_MESSAGES } from "#src/utils/constants.js";

export function errorHandler(err, req, res, next) {
  // Log error with timestamp and request details
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    // method: req.method,
    // ip: req.ip,
  });

  // Set default status code
  const statusCode = err.statusCode || err.status || 500;

  // Handle specific error types
  if (err.name === "ValidationError") {
    return API_RESPONSE.ERROR(res, 400, ERROR_MESSAGES.VALIDATION_ERROR, err);
  }

  if (err.name === "CastError") {
    return API_RESPONSE.ERROR(res, 400, ERROR_MESSAGES.INVALID_ID_FORMAT);
  }

  if (err.code === 11000) {
    return API_RESPONSE.ERROR(res, 409, "IDuplicate field value entered");
  }

  if (err.name === "JsonWebTokenError") {
    return API_RESPONSE.ERROR(res, 401, ERROR_MESSAGES.TOKEN_INVALID);
  }

  if (err.name === "TokenExpiredError") {
    return API_RESPONSE.ERROR(res, 401, ERROR_MESSAGES.TOKEN_EXPIRED);
  }

  // Send response
  return API_RESPONSE.ERROR(
    res,
    statusCode,
    err.message || "Internal server error"
  );
}

// Not found handler (use before error handler)
export function notFoundHandler(req, res, next) {
  return API_RESPONSE.ERROR(res, 404, `Route ${req.originalUrl} not found`);
}
