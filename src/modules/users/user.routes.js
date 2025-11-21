import express from "express";
import * as userController from "./user.controller.js";
import {
  changeStatusValidation,
  updateUserValidation,
  userIdValidation,
} from "./user.validation.js";
import { validate } from "#src/middleware/validate.middleware.js";
import { authenticate, authorize } from "#src/middleware/auth.middleware.js";

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

router.get("/profile", userController.getProfile);
router.patch(
  "/update-profile/:id",
  validate(updateUserValidation),
  userController.updateUser
);

// Admin only routes
router.use(authorize("admin"));

router.get("/all", userController.getAllUsers);
router.get("/by-id/:id", userController.getUser);
router.delete("/delete/:id", userController.deleteUser);
router.patch("/:id/status", userController.changeStatus);

export default router;
