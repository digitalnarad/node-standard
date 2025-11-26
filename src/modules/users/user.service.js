import ApiError from "#src/utils/ApiError.js";
import User from "./user.model.js";
import path from "path";
import { fileURLToPath } from "url";
import { deleteFile, deleteFiles } from "#src/middleware/multer.middleware.js";

class UserService {
  async createUser(userData) {
    try {
      const existingUser = await User.findByEmail(userData.email);

      if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
      }

      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return user;
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async getAllUsers(filters = {}) {
    try {
      const { page = 1, limit = 10, status, role, search } = filters;

      const query = {};

      if (status) query.status = status;
      if (role) query.role = role;

      if (search) {
        const searchRegex = new RegExp(search, "i"); // 'i' for case-insensitive
        query.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find(query)
          .limit(Number(limit))
          .skip(skip)
          .sort({ createdAt: -1 }),
        User.countDocuments(query),
      ]);

      return {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit), // Math.ceil() to maximum round up
        },
      };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async updateUser(userId, updateData) {
    try {
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
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async deleteUser(userId) {
    try {
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
        const documentsPath = user.documents.map((document) =>
          path.join(process.cwd(), "public", document.url)
        );
        deleteFiles(documentsPath);
      }

      await user.deleteOne();
      return { message: "User deleted successfully" };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async changeUserStatus(userId, status) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      user.status = status;
      await user.save();

      return user;
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async getProfile(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return user;
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async updateProfileImage(userId, fileData) {
    try {
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
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async deleteProfileImage(userId) {
    try {
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
      const imagePath = path.join(
        process.cwd(),
        "public",
        user.profileImage.url
      );

      console.log("Attempting to delete:", imagePath);
      const deleted = deleteFile(imagePath);

      if (!deleted) {
        console.warn("Failed to delete file, but continuing with DB update");
      }

      user.profileImage = null;
      await user.save();

      return { message: "Profile image deleted successfully" };
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async uploadDocuments(userId, documents) {
    try {
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
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }

  async deleteDocument(userId, documentId) {
    try {
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
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong", error);
    }
  }
}

export default new UserService();
