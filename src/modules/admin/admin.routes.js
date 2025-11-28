import express from "express";
import { authenticate, authorize } from "#src/middleware/auth.middleware.js";
import * as adminController from "./admin.controller.js";

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);
// only admin can access
router.use(authorize("admin"));

router.get("/all", adminController.getAllUsers);
router.get("/by-id/:id", adminController.getUser);
router.delete("/delete/:id", adminController.deleteUser);
router.patch("/:id/status", adminController.changeStatus);

export default router;
