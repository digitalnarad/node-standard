import { API_RESPONSE } from "#src/utils/ApiResponse.js";
import { asyncHandler } from "#src/utils/asyncHandler.js";
import userService from "../users/user.service.js";
import adminService from "./admin.service.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);

  return API_RESPONSE.SUCCESS(res, 200, "Users fetched successfully", result);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  return API_RESPONSE.SUCCESS(res, 200, "User deleted successfully");
});

export const changeStatus = asyncHandler(async (req, res) => {
  const user = await adminService.changeUserStatus(
    req.params.id,
    req.body.status
  );

  return API_RESPONSE.SUCCESS(
    res,
    200,
    "User status updated successfully",
    user
  );
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);

  return API_RESPONSE.SUCCESS(res, 200, "User fetched successfully", user);
});
