// Middleware to sanitize user input
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj
        .replace(/[<>]/g, "") // Remove < and >
        .trim();
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

  // Create new objects instead of modifying read-only properties
  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query && Object.keys(req.query).length > 0) {
    req.query = sanitize(req.query);
  }

  if (req.params && Object.keys(req.params).length > 0) {
    req.params = sanitize(req.params);
  }

  next();
};
