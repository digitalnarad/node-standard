import ApiError from "#src/utils/ApiError.js";
import User from "./user.model.js";

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
        query.$text = { $search: search };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const projection = search ? { score: { $meta: "textScore" } } : {};

      const [users, total] = await Promise.all([
        User.find(query)
          .projection(projection)
          .limit(Number(limit))
          .skip(skip)
          .sort({
            ...(search ? { score: { $meta: "textScore" } } : {}),
            createdAt: -1,
          }),
        User.countDocuments(query),
      ]);

      return {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
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
}

export default new UserService();
