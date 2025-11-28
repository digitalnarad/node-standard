import ApiError from "#src/utils/ApiError.js";
import User from "./user.model.js";
import path from "path";
import { deleteFile } from "#src/middleware/multer.middleware.js";

class UserService {
  async createUser(userData) {
    const existingUser = await User.findByEmail(userData.email);

    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create(userData);
    return user;
  }

  async updateUser(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Don't allow updating password, role through this method
    delete updateData.password;
    delete updateData.role;

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  async deleteUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Delete profile image if exists
    if (user.profileImage?.url) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        user.profileImage.url
      );
      deleteFile(imagePath);
    }

    if (user.documents && user.documents?.length > 0) {
      user.documents.map((document) =>
        deleteFile(path.join(process.cwd(), "public", document.url))
      );
    }

    await user.deleteOne();
    return { message: "User deleted successfully" };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async updateProfileImage(userId, fileData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Delete old profile image if exists
    if (user.profileImage?.url) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        user.profileImage.url
      );
      deleteFile(oldImagePath);
    }

    // Set new profile image with full file details
    user.profileImage = {
      name: fileData.originalname,
      url: fileData.url,
      size: fileData.size,
      mimeType: fileData.mimetype,
    };

    // Save with validateModifiedOnly to avoid validating unchanged fields
    await user.save({ validateModifiedOnly: true });

    return user;
  }

  async deleteProfileImage(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.profileImage) {
      throw new ApiError(404, "No profile image found");
    }

    // Delete profile image file
    // user.profileImage is object with url
    // We need to get the full path from project root
    const imagePath = path.join(process.cwd(), "public", user.profileImage.url);

    console.log("Attempting to delete:", imagePath);
    const deleted = deleteFile(imagePath);

    if (!deleted) {
      console.warn("Failed to delete file, but continuing with DB update");
    }

    user.profileImage = null;
    await user.save();

    return { message: "Profile image deleted successfully" };
  }

  async uploadDocuments(userId, documents) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.documents = [
      ...user.documents,
      ...documents.map((file) => ({
        name: file.originalname,
        url: file.url,
        size: file.size,
        mimeType: file.mimetype,
      })),
    ];
    await user.save();

    return user;
  }

  async deleteDocument(userId, documentId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Validate all docs exist
    const existingDocs = user.documents.map((doc) => doc._id.toString());
    if (!documentId.every((doc) => existingDocs.includes(doc)))
      throw new ApiError(404, "Document not found");

    // Remove documents from array
    user.documents = user.documents.filter((doc) => {
      const isDelete = documentId.includes(doc._id.toString());
      if (isDelete) {
        const imagePath = path.join(process.cwd(), "public", doc.url);
        deleteFile(imagePath);
      }
      return !isDelete;
    });

    await user.save();
  }

  async logout(userId, refreshToken) {
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
  }

  async changePassword(userId, currentPassword, newPassword) {
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
  }
}

export default new UserService();
