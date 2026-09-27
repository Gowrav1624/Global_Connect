const Post = require("../models/post");
const User = require("../models/User");

// Create post
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content?.trim() && !image) {
      return res.status(400).json({
        success: false,
        message: "Post must contain text or an image",
      });
    }

    const post = await Post.create({
      userId: req.user.userId,
      content: content?.trim() || "",
      image: image || "",
    });

    const populatedPost = await Post.findById(post._id)
      .populate("userId", "name email profilePic");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

// Get all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name email profilePic")
      .populate("likes", "name")
      .populate("comments.userId", "name profilePic")
      .populate({
        path: "repostOf",
        populate: {
          path: "userId",
          select: "name email profilePic",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get posts",
      error: error.message,
    });
  }
};

// Get user's own + connections' feed
const getUserFeed = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user and their connections
    const user = await User.findById(userId).select("connections");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Include the user themselves + all their connections
    const feedUserIds = [
      user._id,
      ...(user.connections || []),
    ];

    // Remove duplicate IDs
    const uniqueUserIds = [
      ...new Set(feedUserIds.map((id) => id.toString())),
    ];

    const posts = await Post.find({
      userId: { $in: uniqueUserIds },
    })
      .populate("userId", "name email profilePic")
      .populate("likes", "name")
      .populate("comments.userId", "name profilePic")
      .populate({
        path: "repostOf",
        populate: {
          path: "userId",
          select: "name email profilePic",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      userId,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user feed",
      error: error.message,
    });
  }
};

// Like / unlike
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user.userId;

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likes: post.likes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update like",
      error: error.message,
    });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      userId: req.user.userId,
      text: text.trim(),
    });

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "comments.userId",
      "name profilePic"
    );

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comments: updatedPost.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// Repost
const repostPost = async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: "Original post not found",
      });
    }

    // Prevent reposting your own repost endlessly
    const originalId =
      originalPost.repostOf || originalPost._id;

    const repost = await Post.create({
      userId: req.user.userId,
      content: "",
      image: "",
      repostOf: originalId,
    });

    const populatedRepost = await Post.findById(repost._id)
      .populate("userId", "name email profilePic")
      .populate({
        path: "repostOf",
        populate: {
          path: "userId",
          select: "name email profilePic",
        },
      });

    res.status(201).json({
      success: true,
      message: "Post reposted successfully",
      post: populatedRepost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to repost",
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getUserFeed,
  toggleLike,
  addComment,
  repostPost,
};