import express from "express";
import * as userController from "./user.controller.js";
import {
  changePasswordValidation,
  updateUserValidation,
} from "./user.validation.js";
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

router.delete("/delete-profile", userController.deleteAccount);

router.post("/logout", userController.logout);

router.post(
  "/change-password",
  validate(changePasswordValidation),
  userController.changePassword
);

export default router;
