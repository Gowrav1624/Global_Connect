import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { API_URL, SERVER_URL } from "../config";

function Jobs() {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);

  const [showPostForm, setShowPostForm] = useState(false);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const [savedJobs, setSavedJobs] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    employmentType: "Full-time",
    salary: "",
    description: "",
    skills: "",
  });

  const [reportJob, setReportJob] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // ==========================================
  // HELPERS
  // ==========================================

  const getId = (item) => {
    if (!item) return null;

    if (typeof item === "string") {
      return item;
    }

    return item._id || item.id || null;
  };

  const getImageUrl = (image) => {
    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    return `${SERVER_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  const getSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills
        .map((skill) => {
          if (typeof skill === "string") {
            return skill.trim();
          }

          return (
            skill?.name ||
            skill?.skill ||
            ""
          ).trim();
        })
        .filter(Boolean);
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const getPostedBy = (job) => {
    return (
      job?.postedBy ||
      job?.user ||
      job?.createdBy ||
      {}
    );
  };

  const getJobTitle = (job) => {
    return job?.title || "Job Opportunity";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const isSaved = (jobId) => {
    return savedJobs.some(
      (id) =>
        id?.toString() ===
        jobId?.toString()
    );
  };

  const isOwnJob = (job) => {
    const postedBy = getPostedBy(job);
    const postedById = getId(postedBy);

    return (
      postedById?.toString() ===
      currentUserId?.toString()
    );
  };

  const getApplicationForJob = (jobId) => {
    return applications.find((application) => {
      const appliedJob =
        application?.job ||
        application?.jobId;

      return (
        getId(appliedJob)?.toString() ===
        jobId?.toString()
      );
    });
  };

  // ==========================================
  // FETCH JOBS
  // ==========================================

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/jobs`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load jobs."
        );
      }

      setJobs(
        data.jobs ||
          data.data ||
          []
      );
    } catch (err) {
      console.error(
        "Fetch jobs error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH APPLICATIONS
  // ==========================================

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${API_URL}/jobs/my-applications`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load applications."
        );
      }

      setApplications(
        data.applications ||
          data.data ||
          []
      );
    } catch (err) {
      console.error(
        "Fetch applications error:",
        err
      );
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch(
        `${API_URL}/jobs/saved`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load saved jobs."
        );
      }

      const saved = data.jobs || data.data || [];

      setSavedJobs(
        saved
          .map((job) => getId(job))
          .filter(Boolean)
      );
    } catch (err) {
      console.error(
        "Fetch saved jobs error:",
        err
      );
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchSavedJobs();
  }, []);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE JOB
  // ==========================================

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.company.trim() ||
      !form.description.trim()
    ) {
      setError(
        "Title, company and description are required."
      );
      return;
    }

    try {
      setPosting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/jobs`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: form.title.trim(),
            company: form.company.trim(),
            location: form.location.trim(),
            employmentType:
              form.employmentType,
            salary: form.salary.trim(),
            description:
              form.description.trim(),
            skills: getSkills(form.skills),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create job."
        );
      }

      const newJob =
        data.job ||
        data.data;

      if (newJob) {
        setJobs((previous) => [
          newJob,
          ...previous,
        ]);
      } else {
        await fetchJobs();
      }

      setForm({
        title: "",
        company: "",
        location: "",
        employmentType: "Full-time",
        salary: "",
        description: "",
        skills: "",
      });

      setShowPostForm(false);

      setSuccess(
        "Job posted successfully."
      );
    } catch (err) {
      console.error(
        "Create job error:",
        err
      );

      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  // ==========================================
  // APPLY JOB
  // ==========================================

  const handleApply = async (jobId) => {
    try {
      setError("");
      setSuccess("");

      setApplyingJobId(jobId);

      const response = await fetch(
        `${API_URL}/jobs/${jobId}/apply`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to apply for job."
        );
      }

      setSuccess(
        "Application submitted successfully."
      );

      await fetchApplications();
    } catch (err) {
      console.error(
        "Apply job error:",
        err
      );

      setError(err.message);
    } finally {
      setApplyingJobId(null);
    }
  };

  // ==========================================
  // SAVE JOB
  // ==========================================

  const toggleSaveJob = async (jobId) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/jobs/${jobId}/save`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save job."
        );
      }

      setSavedJobs((previous) => {
        const exists = previous.some(
          (id) =>
            id?.toString() ===
            jobId?.toString()
        );

        if (data.saved === true) {
          return exists
            ? previous
            : [...previous, jobId];
        }

        return previous.filter(
          (id) =>
            id?.toString() !==
            jobId?.toString()
        );
      });

      setSuccess(
        data.message ||
          (data.saved
            ? "Job saved successfully."
            : "Job removed from saved jobs.")
      );
    } catch (err) {
      console.error(
        "Save job error:",
        err
      );

      setError(err.message);
    }
  };

  // ==========================================
  // DELETE JOB
  // ==========================================

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/jobs/${jobId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete job."
        );
      }

      setJobs((previous) =>
        previous.filter(
          (job) =>
            getId(job) !== jobId
        )
      );

      setSuccess(
        "Job deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete job error:",
        err
      );

      setError(err.message);
    }
  };

  // ==========================================
  // REPORT JOB
  // ==========================================

  const submitReport = async () => {
    if (!reportReason.trim()) {
      setError(
        "Please provide a reason for the report."
      );
      return;
    }

    try {
      setReportLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/reports`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            job: getId(reportJob),
            reason: reportReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit report."
        );
      }

      setReportJob(null);
      setReportReason("");

      setSuccess(
        "Report submitted successfully."
      );
    } catch (err) {
      console.error(
        "Report job error:",
        err
      );

      setError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  // ==========================================
  // FILTER JOBS
  // ==========================================

  const filteredJobs = useMemo(() => {
    const searchTerm =
      search.trim().toLowerCase();

    const locationTerm =
      locationFilter.trim().toLowerCase();

    const skillTerm =
      skillFilter.trim().toLowerCase();

    return jobs.filter((job) => {
      const jobSkills = getSkills(
        job.skills
      );

      const searchableText = [
        job.title,
        job.company,
        job.description,
        job.location,
        job.employmentType,
        ...jobSkills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm ||
        searchableText.includes(
          searchTerm
        );

      const matchesLocation =
        !locationTerm ||
        (job.location || "")
          .toLowerCase()
          .includes(locationTerm);

      const matchesSkill =
        !skillTerm ||
        jobSkills.some((skill) =>
          skill
            .toLowerCase()
            .includes(skillTerm)
        );

      return (
        matchesSearch &&
        matchesLocation &&
        matchesSkill
      );
    });
  }, [
    jobs,
    search,
    locationFilter,
    skillFilter,
  ]);

  // ==========================================
  // CLEAR ALERTS
  // ==========================================

  const clearAlerts = () => {
    setError("");
    setSuccess("");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />

          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">

            <div className="h-5 w-40 bg-gray-200 rounded mb-5" />

            <div className="h-12 bg-gray-200 rounded" />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded mt-3" />
                <div className="h-4 bg-gray-200 rounded mt-6" />
                <div className="h-4 w-4/5 bg-gray-200 rounded mt-2" />
              </div>
            ))}

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-6xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Jobs
            </h1>

            <p className="text-gray-500 mt-1">
              Discover opportunities and grow
              your career.
            </p>
          </div>

          <button
            onClick={() => {
              setShowPostForm(
                (previous) => !previous
              );
              clearAlerts();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            {showPostForm
              ? "Close Form"
              : "+ Post a Job"}
          </button>

        </div>

        {/* ================================= */}
        {/* ALERTS */}
        {/* ================================= */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex justify-between gap-4">
            <span>{error}</span>

            <button
              onClick={clearAlerts}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex justify-between gap-4">
            <span>{success}</span>

            <button
              onClick={clearAlerts}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* ================================= */}
        {/* POST JOB FORM */}
        {/* ================================= */}

        {showPostForm && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-7">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Post a Job
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Share an opportunity with the
                Global_Connect community.
              </p>
            </div>

            <form
              onSubmit={handleCreateJob}
              className="space-y-5"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Job Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Frontend Developer"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Company *
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Remote / Bengaluru / Hyderabad"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Employment Type
                  </label>

                  <select
                    name="employmentType"
                    value={
                      form.employmentType
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-time">
                      Full-time
                    </option>

                    <option value="Part-time">
                      Part-time
                    </option>

                    <option value="Internship">
                      Internship
                    </option>

                    <option value="Contract">
                      Contract
                    </option>

                    <option value="Freelance">
                      Freelance
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Salary
                  </label>

                  <input
                    type="text"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="₹6-10 LPA"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Skills
                  </label>

                  <input
                    type="text"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <p className="text-xs text-gray-400 mt-1">
                    Separate skills with commas.
                  </p>
                </div>

              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Job Description *
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the role, responsibilities and requirements..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowPostForm(false)
                  }
                  disabled={posting}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={posting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-semibold"
                >
                  {posting
                    ? "Posting..."
                    : "Publish Job"}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* ================================= */}
        {/* FILTERS */}
        {/* ================================= */}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-7">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="font-bold text-gray-800">
                Find Jobs
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Search by role, company or skills.
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {filteredJobs.length}{" "}
              result
              {filteredJobs.length === 1
                ? ""
                : "s"}
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search jobs..."
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              value={locationFilter}
              onChange={(e) =>
                setLocationFilter(
                  e.target.value
                )
              }
              placeholder="Filter by location..."
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              value={skillFilter}
              onChange={(e) =>
                setSkillFilter(
                  e.target.value
                )
              }
              placeholder="Filter by skill..."
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </section>

        {/* ================================= */}
        {/* JOB LIST */}
        {/* ================================= */}

        {filteredJobs.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">

            <div className="text-5xl mb-4">
              💼
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No jobs found
            </h2>

            <p className="text-gray-500 mt-2">
              Try changing your search or
              filters.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {filteredJobs.map((job) => {

              const jobId = getId(job);

              const postedBy =
                getPostedBy(job);

              const posterId =
                getId(postedBy);

              const posterImage =
                getImageUrl(
                  postedBy?.profilePic
                );

              const skills = getSkills(
                job.skills
              );

              const application =
                getApplicationForJob(
                  jobId
                );

              return (
                <article
                  key={jobId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                >

                  {/* JOB HEADER */}

                  <div className="flex justify-between gap-4">

                    <div className="flex gap-3">

                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl shrink-0">
                        💼
                      </div>

                      <div>

                        <h2 className="text-xl font-bold text-gray-800">
                          {getJobTitle(job)}
                        </h2>

                        <p className="text-gray-600 font-medium mt-1">
                          {job.company ||
                            "Company"}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        toggleSaveJob(
                          jobId
                        )
                      }
                      className={`text-2xl ${
                        isSaved(jobId)
                          ? "text-yellow-500"
                          : "text-gray-300 hover:text-yellow-500"
                      }`}
                      title={
                        isSaved(jobId)
                          ? "Unsave job"
                          : "Save job"
                      }
                    >
                      ★
                    </button>

                  </div>

                  {/* JOB META */}

                  <div className="flex flex-wrap gap-2 mt-5">

                    {job.location && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">
                        📍 {job.location}
                      </span>
                    )}

                    {job.employmentType && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        🕒{" "}
                        {job.employmentType}
                      </span>
                    )}

                    {job.salary && (
                      <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        💰 {job.salary}
                      </span>
                    )}

                  </div>

                  {/* DESCRIPTION */}

                  {job.description && (
                    <p className="text-gray-600 text-sm leading-6 mt-5 whitespace-pre-wrap">
                      {job.description}
                    </p>
                  )}

                  {/* SKILLS */}

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">

                      {skills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  )}

                  {/* POSTER */}

                  <div className="border-t border-gray-100 mt-5 pt-4 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      {posterImage ? (

                        <img
                          src={
                            posterImage
                          }
                          alt={
                            postedBy?.name ||
                            "Recruiter"
                          }
                          className="w-8 h-8 rounded-full object-cover"
                        />

                      ) : (

                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
                          {(
                            postedBy?.name ||
                            "R"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                      )}

                      <div>

                        <p className="text-xs text-gray-400">
                          Posted by
                        </p>

                        {posterId ? (

                          <Link
                            to={`/profile/${posterId}`}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            {postedBy?.name ||
                              "Recruiter"}
                          </Link>

                        ) : (

                          <p className="text-sm font-semibold text-gray-700">
                            {postedBy?.name ||
                              "Recruiter"}
                          </p>

                        )}

                      </div>

                    </div>

                    {job.createdAt && (
                      <span className="text-xs text-gray-400">
                        {formatDate(
                          job.createdAt
                        )}
                      </span>
                    )}

                  </div>

                  {/* APPLICATION STATUS */}

                  {application && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">

                      <span className="text-sm text-blue-700 font-semibold">
                        Application status:{" "}
                        {application.status ||
                          "Submitted"}
                      </span>

                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="flex gap-2 mt-5">

                    {!isOwnJob(job) && (
                      <button
                        onClick={() =>
                          handleApply(
                            jobId
                          )
                        }
                        disabled={
                          Boolean(application) ||
                          applyingJobId?.toString() ===
                            jobId?.toString()
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-semibold text-sm"
                      >
                        {application
                          ? "Applied"
                          : applyingJobId?.toString() ===
                            jobId?.toString()
                          ? "Applying..."
                          : "Apply Now"}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setReportJob(job);
                        setReportReason("");
                        clearAlerts();
                      }}
                      className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg font-semibold text-sm"
                    >
                      Report
                    </button>

                    {isOwnJob(job) && (
                      <button
                        onClick={() =>
                          handleDelete(
                            jobId
                          )
                        }
                        className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm"
                      >
                        Delete
                      </button>
                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>

      {/* ===================================== */}
      {/* REPORT MODAL */}
      {/* ===================================== */}

      {reportJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Report Job
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {getJobTitle(reportJob)}
                </p>
              </div>

              <button
                onClick={() =>
                  setReportJob(null)
                }
                disabled={reportLoading}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>

            </div>

            <textarea
              value={reportReason}
              onChange={(e) =>
                setReportReason(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Explain why you are reporting this job..."
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => {
                  setReportJob(null);
                  setReportReason("");
                }}
                disabled={reportLoading}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={submitReport}
                disabled={
                  reportLoading ||
                  !reportReason.trim()
                }
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-semibold"
              >
                {reportLoading
                  ? "Submitting..."
                  : "Submit Report"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Jobs;