import express from "express";
import * as authController from "./auth.controller.js";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from "./auth.validation.js";
import { authenticate } from "#src/middleware/auth.middleware.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerValidation), authController.register);
router.post("/login", validate(loginValidation), authController.login);
router.post("/access-token", authController.refreshToken);

// Protected routes
router.use(authenticate);
router.post("/logout", authController.logout);
router.post(
  "/change-password",
  validate(changePasswordValidation),
  authController.changePassword
);

export default router;
