import ApiError from "#src/utils/ApiError.js";
import User from "../users/user.model.js";

class AdminService {
  async getAllUsers(filters = {}) {
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
      User.find(query).limit(Number(limit)).skip(skip).sort({ createdAt: -1 }),
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
  }

  async changeUserStatus(userId, status) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.status = status;
    await user.save();

    return user;
  }

  async getUserById(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }
}

export default new AdminService();
