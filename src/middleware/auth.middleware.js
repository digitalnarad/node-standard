import jwt from "jsonwebtoken";
import ApiError from "#src/utils/ApiError.js";
import { asyncHandler } from "#src/utils/asyncHandler.js";
import User from "#src/modules/users/user.model.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  const refreshTokenDecoded = jwt.verify(
    decoded.refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!refreshTokenDecoded.userId || !decoded.userId) {
    throw new ApiError(401, "Invalid token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "Invalid token user not found");
  }

  if (!user.isActive()) {
    throw new ApiError(403, "Your account is not active");
  }

  if (!user.refreshTokens.find((t) => t.token === decoded.refreshToken)) {
    throw new ApiError(404, "Token not found");
  }

  req.user = user;
  req.refreshToken = decoded.refreshToken;

  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action"
      );
    }
    next();
  };
};
