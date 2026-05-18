import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.js";

const buildUserQuery = ({ search, role, isActive }) => {
  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (role) query.role = role;
  if (typeof isActive !== "undefined") {
    query.isActive = isActive === "true" || isActive === true;
  }
  return query;
};

export const getUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = buildUserQuery(req.query);

    const [users, total] = await Promise.all([
      User.find(query).select("-password").skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return ApiResponse.successList(res, users, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, subscriptionPlan, avatar } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return ApiResponse.error(res, "Email already exists", 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      subscriptionPlan,
      avatar,
    });

    return ApiResponse.success(res, user, "User created", 201);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }
    return ApiResponse.success(res, user, "User retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "role",
      "isActive",
      "subscriptionPlan",
      "avatar",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }
    return ApiResponse.success(res, user, "User updated");
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }
    return ApiResponse.success(res, user, "User soft deleted");
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor", isActive: true }).select(
      "-password"
    );
    return ApiResponse.success(res, doctors, "Doctors retrieved");
  } catch (error) {
    next(error);
  }
};
