const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only",
      });
    }

    req.admin = user;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify admin access",
      error: error.message,
    });
  }
};

module.exports = adminMiddleware;