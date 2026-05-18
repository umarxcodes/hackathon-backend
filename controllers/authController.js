import User from "../models/User.js";
import signToken from "../utils/signToken.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Name, email, password and role are required",
        });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    const userObject = user.toObject();
    delete userObject.password;

    res
      .status(201)
      .json({
        success: true,
        data: userObject,
        message: "User registered successfully",
        count: 1,
        token,
      });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = signToken(user._id);
    const userObject = user.toObject();
    delete userObject.password;

    res
      .status(200)
      .json({
        success: true,
        data: userObject,
        message: "Login successful",
        count: 1,
        token,
      });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        data: user,
        message: "Current user fetched",
        count: 1,
      });
  } catch (error) {
    next(error);
  }
};
