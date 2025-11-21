import authService from "./auth.service.js";
import { asyncHandler } from "#src/utils/asyncHandler.js";
import { API_RESPONSE } from "#src/utils/ApiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  return API_RESPONSE.SUCCESS(res, 201, "Registration successful", result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  return API_RESPONSE.SUCCESS(res, 200, "Login successful", result);
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;
  await authService.logout(req.user._id, refreshToken);

  return API_RESPONSE.SUCCESS(res, 200, "Logout successful");
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);

  return API_RESPONSE.SUCCESS(res, 200, "Token refreshed successfully", result);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);

  return API_RESPONSE.SUCCESS(res, 200, "Password changed successfully");
});

// export const getProfile = asyncHandler(async (req, res) => {
//   const user = await authService.getProfile(req.user._id);

//   return API_RESPONSE.SUCCESS(res, 200, "Profile fetched successfully", user);
// });
