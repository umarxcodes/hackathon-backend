import User from "../models/User.js";
import signToken from "../utils/signToken.js";
import ApiResponse from "../utils/ApiResponse.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return ApiResponse.error(res, "Email already registered", 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true,
    });
    const token = signToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.success(
      res,
      { user, token },
      "User registered successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return ApiResponse.error(res, "Invalid email or password", 401);
    }
    if (!user.isActive) {
      return ApiResponse.error(res, "Account has been deactivated", 401);
    }

    const token = signToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.success(res, { user, token }, "Login successful");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return ApiResponse.error(res, "User not found", 404);
    }
    return ApiResponse.success(res, { user }, "Current user fetched");
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: "strict",
  });
  return ApiResponse.success(res, {}, "Logged out successfully");
};
