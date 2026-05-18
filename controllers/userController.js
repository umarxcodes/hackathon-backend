import User from "../models/User.js";

export const getUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit).select("-password");
    const total = await User.countDocuments();
    res
      .status(200)
      .json({
        success: true,
        data: users,
        message: "Users retrieved",
        count: users.length,
        total,
      });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, subscriptionPlan, avatar } = req.body;
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
        .json({ success: false, error: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      subscriptionPlan,
      avatar,
    });
    const userObject = user.toObject();
    delete userObject.password;

    res
      .status(201)
      .json({
        success: true,
        data: userObject,
        message: "User created",
        count: 1,
      });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, data: user, message: "User retrieved", count: 1 });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowed = ["name", "role", "isActive", "subscriptionPlan", "avatar"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, data: user, message: "User updated", count: 1 });
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
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        data: user,
        message: "User soft deleted",
        count: 1,
      });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor", isActive: true }).select(
      "-password"
    );
    res
      .status(200)
      .json({
        success: true,
        data: doctors,
        message: "Doctors retrieved",
        count: doctors.length,
      });
  } catch (error) {
    next(error);
  }
};
