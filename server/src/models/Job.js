const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: "",
    },

    salary: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        status: {
          type: String,
          enum: [
            "applied",
            "reviewing",
            "shortlisted",
            "rejected",
            "hired",
          ],
          default: "applied",
        },

        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Job || mongoose.model("Job", jobSchema);