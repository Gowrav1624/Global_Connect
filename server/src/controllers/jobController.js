const Job = require("../models/Job");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// Create job
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      location,
      salary,
      skills,
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, company and description are required",
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      location: location || "",
      salary: salary || "",
      skills: skills || [],
      postedBy: req.user.userId,
    });

    const populatedJob = await Job.findById(job._id).populate(
      "postedBy",
      "name email profilePic"
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: populatedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

// Get all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "name email profilePic")
      .populate("applicants.user", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get jobs",
      error: error.message,
    });
  }
};

// Search jobs
const searchJobs = async (req, res) => {
  try {
    const { query, location, skill } = req.query;

    const filter = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { company: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (skill) {
      filter.skills = {
        $regex: skill,
        $options: "i",
      };
    }

    const jobs = await Job.find(filter)
      .populate("postedBy", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search jobs",
      error: error.message,
    });
  }
};

// Apply for job
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const alreadyApplied = job.applicants.some(
      (applicant) =>
        applicant.user?.toString() ===
        req.user.userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    job.applicants.push({
      user: req.user.userId,
      status: "applied",
    });

    await job.save();

    await createNotification({
      recipient: job.postedBy,
      sender: req.user.userId,
      type: "job",
      message: "Someone applied for your job posting",
    });

    res.status(200).json({
      success: true,
      message: "Job application submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to apply for job",
      error: error.message,
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "applied",
      "reviewing",
      "shortlisted",
      "rejected",
      "hired",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      job.postedBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the job owner can update application status",
      });
    }

    const applicant = job.applicants.id(
      req.params.applicantId
    );

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found",
      });
    }

    applicant.status = status;

    await job.save();

    await createNotification({
      recipient: applicant.user,
      sender: req.user.userId,
      type: "job",
      message: `Your application status was updated to ${status}`,
    });

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

// Get my applications
const getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({
      "applicants.user": req.user.userId,
    })
      .populate("postedBy", "name email profilePic")
      .sort({ createdAt: -1 });

    const applications = jobs.map((job) => {
      const application = job.applicants.find(
        (applicant) =>
          applicant.user?.toString() ===
          req.user.userId.toString()
      );

      return {
        job,
        status: application?.status || "applied",
        appliedAt: application?.appliedAt,
      };
    });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get applications",
      error: error.message,
    });
  }
};

// Save / unsave job
const saveJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadySaved = user.savedJobs.some(
      (id) => id.toString() === jobId.toString()
    );

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(
        (id) => id.toString() !== jobId.toString()
      );

      await user.save();

      return res.status(200).json({
        success: true,
        saved: false,
        message: "Job removed from saved jobs",
      });
    }

    user.savedJobs.push(jobId);

    await user.save();

    res.status(200).json({
      success: true,
      saved: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save job",
      error: error.message,
    });
  }
};

// Get saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: "savedJobs",
        populate: {
          path: "postedBy",
          select: "name email profilePic",
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      jobs: user.savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get saved jobs",
      error: error.message,
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      job.postedBy.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the job owner can delete this job",
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    await User.updateMany(
      { savedJobs: req.params.id },
      { $pull: { savedJobs: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  searchJobs,
  applyForJob,
  updateApplicationStatus,
  getMyApplications,
  saveJob,
  getSavedJobs,
  deleteJob,
};