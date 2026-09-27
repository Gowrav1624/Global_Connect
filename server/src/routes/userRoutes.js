const express = require("express");

const {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  globalSearch,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const User = require("../models/User");

const router = express.Router();

// Search users
router.get("/search", authMiddleware, searchUsers);

// Global search
router.get("/global-search", authMiddleware, globalSearch);

// Get all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "-password -passwordResetToken -passwordResetExpires"
      )
      .select(
        "name email bio profilePic banner skills role"
      );

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
});

// Upload profile picture
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.profilePic = `/uploads/${req.file.filename}`;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        profilePic: user.profilePic,
      });
    } catch (error) {
      console.error("Profile picture upload error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to upload profile picture",
        error: error.message,
      });
    }
  }
);

// Get user profile
router.get("/:id", authMiddleware, getUserProfile);

// Update user profile
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
    {
      name: "banner",
      maxCount: 1,
    },
  ]),
  updateUserProfile
);

module.exports = router;