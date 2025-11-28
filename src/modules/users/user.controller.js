import userService from "./user.service.js";
import { asyncHandler } from "#src/utils/asyncHandler.js";
import { API_RESPONSE } from "#src/utils/ApiResponse.js";

export const updateUser = asyncHandler(async (req, res) => {
  const body = req.body;

  // Don't allow updating password, role through this method
  delete body.email;
  delete body.password;
  delete body.role;

  const user = await userService.updateUser(req.params.id, body);

  return API_RESPONSE.SUCCESS(res, 200, "User updated successfully", user);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user._id);

  return API_RESPONSE.SUCCESS(res, 200, "Account deleted successfully");
});

export const getProfile = asyncHandler(async (req, res) => {
  console.log("req.user._id", req.user._id);
  const user = await userService.getProfile(req.user._id);

  return API_RESPONSE.SUCCESS(res, 200, "Profile fetched successfully", user);
});

export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.files?.profileImage?.[0]) {
    return API_RESPONSE.ERROR(res, 400, "No file uploaded");
  }

  const user = await userService.updateProfileImage(
    req.user._id,
    req.files.profileImage[0]
  );

  return API_RESPONSE.SUCCESS(
    res,
    200,
    "Profile image uploaded successfully",
    user
  );
});

export const deleteProfileImage = asyncHandler(async (req, res) => {
  await userService.deleteProfileImage(req.user._id);

  return API_RESPONSE.SUCCESS(res, 200, "Profile image deleted successfully");
});

export const uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files?.documents || req.files.documents.length <= 0) {
    return API_RESPONSE.ERROR(res, 400, "No file uploaded");
  }

  const user = await userService.uploadDocuments(
    req.user._id,
    req.files.documents
  );

  return API_RESPONSE.SUCCESS(
    res,
    200,
    "Documents uploaded successfully",
    user
  );
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { documentIds } = req.body;

  if (!documentIds || documentIds.length <= 0) {
    return API_RESPONSE.ERROR(res, 400, "No document ids provided");
  }

  await userService.deleteDocument(req.user._id, documentIds);

  return API_RESPONSE.SUCCESS(res, 200, "Document deleted successfully");
});

export const logout = asyncHandler(async (req, res) => {
  await userService.logout(req.user._id, req.refreshToken);

  return API_RESPONSE.SUCCESS(res, 200, "Logout successful");
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);

  return API_RESPONSE.SUCCESS(res, 200, "Password changed successfully");
});
