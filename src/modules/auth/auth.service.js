import jwt from "jsonwebtoken";
import ApiError from "#src/utils/ApiError.js";
import User from "../users/user.model.js";

class AuthService {
  generateAccessToken(userId, refreshToken) {
    return jwt.sign({ userId, refreshToken }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  async register(userData) {
    try {
      const existingUser = await User.findByEmail(userData.email);

      if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
      }

      const user = await User.create(userData);

      const refreshToken = this.generateRefreshToken(user._id);
      const accessToken = this.generateAccessToken(user._id, refreshToken);

      // Save refresh token
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await user.save();

      return {
        user,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }

      if (!user.isActive()) {
        throw new ApiError(403, "Your account is not active");
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
      }

      const refreshToken = this.generateRefreshToken(user._id);
      const accessToken = this.generateAccessToken(user._id, refreshToken);

      // Update refresh tokens in database
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Keep only last 5 refresh tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }

      user.lastLogin = new Date();
      await user.save();

      // Remove password from response
      user.password = undefined;

      return {
        user,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async logout(userId, refreshToken) {
    try {
      if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
      }

      const user = await User.findById(userId);

      if (!user) {
        throw new ApiError(400, "User not found");
      }

      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
      await user.save();

      return { message: "Logged out successfully" };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      const tokenExists = user.refreshTokens.some(
        (t) => t.token === refreshToken
      );

      if (!tokenExists) {
        throw new ApiError(401, "Invalid refresh token");
      }

      const newAccessToken = this.generateAccessToken(user._id, refreshToken);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select("+password");

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
      }

      user.password = newPassword;
      user.refreshTokens = []; // Clear all refresh tokens
      await user.save();

      return { message: "Password changed successfully" };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }
}

export default new AuthService();
