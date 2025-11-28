import express from "express";
import * as authController from "./auth.controller.js";
import { registerValidation, loginValidation } from "./auth.validation.js";
import { validate } from "#src/middleware/validate.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerValidation), authController.register);
router.post("/login", validate(loginValidation), authController.login);
router.post("/access-token", authController.refreshToken);

export default router;
