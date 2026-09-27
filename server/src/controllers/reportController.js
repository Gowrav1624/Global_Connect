const Report = require("../models/Report");

// Create a report
const createReport = async (req, res) => {
  try {
    const {
      reportedUser,
      post,
      job,
      reason,
    } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Report reason is required",
      });
    }

    // At least one target is required
    if (!reportedUser && !post && !job) {
      return res.status(400).json({
        success: false,
        message:
          "A user, post or job must be reported",
      });
    }

    const report = await Report.create({
      reporter: req.user.userId,
      reportedUser: reportedUser || null,
      post: post || null,
      job: job || null,
      reason: reason.trim(),
    });

    const populatedReport =
      await Report.findById(report._id)
        .populate(
          "reporter",
          "name email profilePic"
        )
        .populate(
          "reportedUser",
          "name email profilePic"
        )
        .populate({
          path: "post",
          populate: {
            path: "userId",
            select: "name email profilePic",
          },
        })
        .populate(
          "job",
          "title company postedBy"
        );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit report",
      error: error.message,
    });
  }
};

// Get all reports - Admin
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate(
        "reporter",
        "name email profilePic"
      )
      .populate(
        "reportedUser",
        "name email profilePic"
      )
      .populate({
        path: "post",
        populate: {
          path: "userId",
          select: "name email profilePic",
        },
      })
      .populate(
        "job",
        "title company postedBy"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get reports",
      error: error.message,
    });
  }
};

// Update report status - Admin
const updateReportStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewed",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    const report =
      await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.status = status;

    await report.save();

    res.status(200).json({
      success: true,
      message:
        "Report status updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to update report status",
      error: error.message,
    });
  }
};

// Delete report - Admin
const deleteReport = async (
  req,
  res
) => {
  try {
    const report =
      await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    await Report.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to delete report",
      error: error.message,
    });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
};