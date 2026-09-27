    const User = require("../models/User");
    const Post = require("../models/post");
    const Job = require("../models/Job");

    const globalSearch = async (req, res) => {
    try {
        const { q = "", type = "all" } = req.query;

        const searchTerm = q.trim();

        if (!searchTerm) {
        return res.status(400).json({
            success: false,
            message: "Search query is required",
        });
        }

        const regex = new RegExp(searchTerm, "i");

        const results = {
        users: [],
        posts: [],
        jobs: [],
        };

        // ==========================================
        // USERS
        // ==========================================

        if (type === "all" || type === "users") {
        results.users = await User.find({
            $or: [
            { name: regex },
            { email: regex },
            { bio: regex },
            { skills: regex },
            ],
        })
            .select(
            "name email bio skills profilePic banner role"
            )
            .limit(30)
            .sort({ name: 1 });
        }

        // ==========================================
        // POSTS
        // ==========================================

        if (type === "all" || type === "posts") {
        results.posts = await Post.find({
            $or: [
            { content: regex },
            { text: regex },
            ],
        })
            .populate(
            "userId",
            "name email profilePic"
            )
            .limit(30)
            .sort({ createdAt: -1 });
        }

        // ==========================================
        // JOBS
        // ==========================================

        if (type === "all" || type === "jobs") {
        results.jobs = await Job.find({
            $or: [
            { title: regex },
            { company: regex },
            { description: regex },
            { location: regex },
            { skills: regex },
            ],
        })
            .populate(
            "postedBy",
            "name email profilePic"
            )
            .limit(30)
            .sort({ createdAt: -1 });
        }

        return res.status(200).json({
        success: true,
        query: searchTerm,
        type,
        users: results.users,
        posts: results.posts,
        jobs: results.jobs,
        });
    } catch (error) {
        console.error(
        "Global search error:",
        error.message
        );

        return res.status(500).json({
        success: false,
        message: "Search failed",
        error: error.message,
        });
    }
    };

    module.exports = {
    globalSearch,
    };