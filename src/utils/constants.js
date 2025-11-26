export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "Unauthorized access",
  TOKEN_EXPIRED: "Token has expired",
  TOKEN_INVALID: "Invalid token",

  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  USER_INACTIVE: "User account is inactive",

  VALIDATION_ERROR: "Validation error",
  INVALID_ID_FORMAT: "Invalid ID format",

  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD:
    "Password must be at least 8 characters with uppercase, lowercase, number and special character",

  INTERNAL_SERVER_ERROR: "Internal server error",
  NOT_FOUND: "Resource not found",
  BAD_REQUEST: "Bad request",
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTER_SUCCESS: "Registration successful",

  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",

  OPERATION_SUCCESS: "Operation completed successfully",
  DATA_FETCHED: "Data fetched successfully",
};

export const FILE_TYPES = {
  IMAGE: {
    extensions: /jpeg|jpg|png|gif|webp|svg/,
    mimetypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    errorMessage:
      "Only image files are allowed (jpeg, jpg, png, gif, webp, svg)",
  },
  DOCUMENT: {
    extensions: /pdf|doc|docx|xls|xlsx|txt|csv|ppt|pptx/,
    mimetypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    errorMessage:
      "Only document files are allowed (pdf, doc, docx, xls, xlsx, txt, csv, ppt, pptx)",
  },
  VIDEO: {
    extensions: /mp4|avi|mov|wmv|flv|mkv|webm/,
    mimetypes: [
      "video/mp4",
      "video/x-msvideo",
      "video/quicktime",
      "video/x-ms-wmv",
      "video/x-flv",
      "video/x-matroska",
      "video/webm",
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    errorMessage:
      "Only video files are allowed (mp4, avi, mov, wmv, flv, mkv, webm)",
  },
  ALL: {
    extensions:
      /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|txt|csv|ppt|pptx|mp4|avi|mov|wmv|flv|mkv|webm/,
    mimetypes: [], // Will accept all from above
    maxSize: 50 * 1024 * 1024, // 50MB
    errorMessage: "Invalid file type",
  },
};
