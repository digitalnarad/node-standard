// Middleware to sanitize user input
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj.trim();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitize(item));
    }

    if (typeof obj === "object" && obj !== null) {
      const sanitized = {};
      Object.keys(obj).forEach((key) => {
        sanitized[key] = sanitize(obj[key]);
      });
      return sanitized;
    }

    return obj;
  };

  // Sanitize body (can be reassigned)
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // For query and params, modify in-place instead of reassigning
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = sanitize(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, sanitizedQuery);
  }

  if (req.params && Object.keys(req.params).length > 0) {
    const sanitizedParams = sanitize(req.params);
    Object.keys(req.params).forEach((key) => delete req.params[key]);
    Object.assign(req.params, sanitizedParams);
  }

  next();
};
