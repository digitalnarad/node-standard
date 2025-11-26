import Joi from "joi";

export const registerValidation = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, and one digit",
      "string.min": "Password must be at least 8 characters long",
    }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s-()]+$/)
    .optional()
    .min(10)
    .messages({
      "string.pattern.base": "Invalid phone number format",
      "string.min": "Phone number must be at least 10 digits long",
    }),
  role: Joi.string().valid("user", "admin", "manager").optional().messages({
    "any.only": "Invalid role value",
  }),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, and one digit",
    }),
});
