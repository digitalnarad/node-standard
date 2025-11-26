import express from "express";
import * as userController from "./user.controller.js";
import { updateUserValidation } from "./user.validation.js";
import { validate } from "#src/middleware/validate.middleware.js";
import { authenticate, authorize } from "#src/middleware/auth.middleware.js";
import {
  uploadMixedFields,
  // uploadMultiple,
  // uploadSingle,
} from "#src/middleware/multer.middleware.js";

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

router.get("/profile", userController.getProfile);
router.patch(
  "/update-profile/:id",
  validate(updateUserValidation),
  userController.updateUser
);

// Profile image routes
router.post(
  "/upload-profile-image",
  // uploadSingle("profileImage", "IMAGE"),
  uploadMixedFields([
    {
      name: "profileImage",
      maxCount: 1,
      fileType: "IMAGE",
    },
  ]),
  userController.uploadProfileImage
);

router.post(
  "/upload-documents",
  // uploadMultiple("documents", 5, "DOCUMENT"),
  uploadMixedFields([
    {
      name: "documents",
      maxCount: 5,
      fileType: "DOCUMENT",
    },
  ]),
  userController.uploadDocuments
);

router.delete("/delete-profile-image", userController.deleteProfileImage);
router.delete("/delete-document", userController.deleteDocument);

// Admin only routes
router.use(authorize("admin"));

router.get("/all", userController.getAllUsers);
router.get("/by-id/:id", userController.getUser);
router.delete("/delete/:id", userController.deleteUser);
router.patch("/:id/status", userController.changeStatus);

export default router;
