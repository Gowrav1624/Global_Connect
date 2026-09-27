const User = require("../models/User");
const Job = require("../models/Job");
const Post = require("../models/post");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -passwordResetToken -passwordResetExpires")
      .populate("connections", "name email profilePic banner")
      .populate(
        "connectionRequests",
        "name email profilePic banner"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      experience,
      education,
      skills,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
     * Only the logged-in user should be able
     * to update their own profile.
     */
    if (
      req.user.userId.toString() !==
      req.params.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this profile",
      });
    }

    // Basic profile information
    if (name !== undefined) {
      user.name = name;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    /*
     * FormData sends these values as strings.
     * Convert JSON strings back into arrays.
     */
    if (skills !== undefined) {
      try {
        user.skills =
          typeof skills === "string"
            ? JSON.parse(skills)
            : skills;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid skills data",
        });
      }
    }

    if (experience !== undefined) {
      try {
        user.experience =
          typeof experience === "string"
            ? JSON.parse(experience)
            : experience;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid experience data",
        });
      }
    }

    if (education !== undefined) {
      try {
        user.education =
          typeof education === "string"
            ? JSON.parse(education)
            : education;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid education data",
        });
      }
    }

    /*
     * Handle uploaded profile picture.
     */
    if (
      req.files &&
      req.files.profilePic &&
      req.files.profilePic[0]
    ) {
      user.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
    }

    /*
     * Handle uploaded banner.
     */
    if (
      req.files &&
      req.files.banner &&
      req.files.banner[0]
    ) {
      user.banner = `/uploads/${req.files.banner[0].filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profilePic: user.profilePic,
        banner: user.banner,
        experience: user.experience,
        education: user.education,
        skills: user.skills,
        connections: user.connections,
        connectionRequests:
          user.connectionRequests,
        savedJobs: user.savedJobs,
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error.message,
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          email: {
            $regex: query,
            $options: "i",
          },
        },
        {
          bio: {
            $regex: query,
            $options: "i",
          },
        },
        {
          skills: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    })
      .select(
        "-password -passwordResetToken -passwordResetExpires"
      )
      .limit(20);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
};

// Global search
const globalSearch = async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = {
      $regex: query.trim(),
      $options: "i",
    };

    const results = {
      users: [],
      jobs: [],
      posts: [],
    };

    if (!type || type === "users") {
      results.users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { bio: searchRegex },
          { skills: searchRegex },
        ],
      })
        .select(
          "-password -passwordResetToken -passwordResetExpires"
        )
        .limit(20);
    }

    if (!type || type === "jobs") {
      results.jobs = await Job.find({
        $or: [
          { title: searchRegex },
          { company: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { skills: searchRegex },
        ],
      })
        .populate(
          "postedBy",
          "name email profilePic banner"
        )
        .limit(20);
    }

    if (!type || type === "posts") {
      results.posts = await Post.find({
        $or: [
          { content: searchRegex },
        ],
      })
        .populate(
          "userId",
          "name email profilePic banner"
        )
        .limit(20);
    }

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Global search error:", error);

    res.status(500).json({
      success: false,
      message: "Global search failed",
      error: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  globalSearch,
};