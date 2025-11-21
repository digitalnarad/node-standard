import Joi from "joi";

export const updateUserValidation = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string()
    .pattern(/^\+?[\d\s-()]+$/)
    .optional(),
});

export const userIdValidation = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid user ID format",
  }),
});

export const changeStatusValidation = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid user ID format",
  }),
  status: Joi.string()
    .valid("active", "inactive", "blocked")
    .required()
    .messages({
      "any.only": "Invalid status value",
    }),
});
