import { API_RESPONSE } from "#src/utils/ApiResponse.js";

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));

      const newMessage = errors
        .map((error) => `${error.field}: ${error.message}`)
        .join(", ");

      return API_RESPONSE.ERROR(res, 400, newMessage, errors);
    }

    req[source] = value;
    next();
  };
};
