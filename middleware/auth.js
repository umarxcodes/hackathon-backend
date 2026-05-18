import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token)
      return res
        .status(401)
        .json({ success: false, error: "Authorization token missing" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ success: false, error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("isActive role");
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "Invalid token user" });
    if (!user.isActive)
      return res
        .status(401)
        .json({ success: false, error: "Account deactivated" });

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    return res
      .status(500)
      .json({ success: false, error: "Auth middleware error" });
  }
};

export default auth;
