import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUserRole } from "../store/authSelectors";
import { API_URL, SERVER_URL } from "../config";


function Admin() {
  const token = useSelector(selectToken);
  const storedRole = useSelector(selectUserRole);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingReports, setLoadingReports] =
    useState(true);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState("users");

  const [deletingUserId, setDeletingUserId] =
    useState(null);

  const [deletingPostId, setDeletingPostId] =
    useState(null);

  const [deletingJobId, setDeletingJobId] =
    useState(null);

  const [deletingReportId, setDeletingReportId] =
    useState(null);

  const [updatingReportId, setUpdatingReportId] =
    useState(null);

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

  const getUserName = (user) => {
    return user?.name || "Unknown User";
  };

  const getUserEmail = (user) => {
    return user?.email || "No email";
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getReportTarget = (report) => {
    if (report.reportedUser) {
      return `User: ${getUserName(
        report.reportedUser
      )}`;
    }

    if (report.post) {
      return "Post";
    }

    if (report.job) {
      return `Job: ${
        report.job.title ||
        "Untitled Job"
      }`;
    }

    return "Unknown content";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";

      case "reviewed":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response =
        await fetch(
          `${API_URL}/admin/users`,
          {
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load users."
        );
      }

      setUsers(
        data.users ||
          data.data ||
          []
      );
    } catch (err) {
      console.error(
        "Fetch admin users error:",
        err
      );

      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ==========================================
  // FETCH REPORTS
  // ==========================================

  const fetchReports = async () => {
    try {
      setLoadingReports(true);

      const response =
        await fetch(
          `${API_URL}/reports`,
          {
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load reports."
        );
      }

      setReports(
        data.reports ||
          data.data ||
          []
      );
    } catch (err) {
      console.error(
        "Fetch reports error:",
        err
      );

      setError(err.message);
    } finally {
      setLoadingReports(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!token) {
      setLoadingUsers(false);
      setLoadingReports(false);
      return;
    }

    fetchUsers();
    fetchReports();
  }, []);

  // ==========================================
  // DELETE USER
  // ==========================================

  const deleteUser = async (
    userId
  ) => {
    if (!userId) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      );

    if (!confirmed) return;

    try {
      setDeletingUserId(userId);
      setError("");

      const response =
        await fetch(
          `${API_URL}/admin/users/${userId}`,
          {
            method: "DELETE",
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete user."
        );
      }

      setUsers(
        (previous) =>
          previous.filter(
            (user) =>
              getId(user)?.toString() !==
              userId.toString()
          )
      );
    } catch (err) {
      console.error(
        "Delete user error:",
        err
      );

      setError(err.message);
    } finally {
      setDeletingUserId(null);
    }
  };

  // ==========================================
  // DELETE POST
  // ==========================================

  const deletePost = async (
    postId
  ) => {
    if (!postId) return;

    const confirmed =
      window.confirm(
        "Delete this post?"
      );

    if (!confirmed) return;

    try {
      setDeletingPostId(postId);
      setError("");

      const response =
        await fetch(
          `${API_URL}/admin/posts/${postId}`,
          {
            method: "DELETE",
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete post."
        );
      }

      setReports(
        (previous) =>
          previous.filter(
            (report) =>
              getId(report.post)?.toString() !==
              postId.toString()
          )
      );

      await fetchReports();
    } catch (err) {
      console.error(
        "Delete post error:",
        err
      );

      setError(err.message);
    } finally {
      setDeletingPostId(null);
    }
  };

  // ==========================================
  // DELETE JOB
  // ==========================================

  const deleteJob = async (
    jobId
  ) => {
    if (!jobId) return;

    const confirmed =
      window.confirm(
        "Delete this job?"
      );

    if (!confirmed) return;

    try {
      setDeletingJobId(jobId);
      setError("");

      const response =
        await fetch(
          `${API_URL}/admin/jobs/${jobId}`,
          {
            method: "DELETE",
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete job."
        );
      }

      await fetchReports();
    } catch (err) {
      console.error(
        "Delete job error:",
        err
      );

      setError(err.message);
    } finally {
      setDeletingJobId(null);
    }
  };

  // ==========================================
  // UPDATE REPORT STATUS
  // ==========================================

  const updateReportStatus =
    async (
      reportId,
      status
    ) => {
      if (!reportId || !status) {
        return;
      }

      try {
        setUpdatingReportId(
          reportId
        );
        setError("");

        const response =
          await fetch(
            `${API_URL}/reports/${reportId}/status`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({
                status,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update report."
          );
        }

        setReports(
          (previous) =>
            previous.map(
              (report) =>
                getId(report)?.toString() ===
                reportId.toString()
                  ? {
                      ...report,
                      status,
                    }
                  : report
            )
        );
      } catch (err) {
        console.error(
          "Update report error:",
          err
        );

        setError(err.message);
      } finally {
        setUpdatingReportId(
          null
        );
      }
    };

  // ==========================================
  // DELETE REPORT
  // ==========================================

  const deleteReport = async (
    reportId
  ) => {
    if (!reportId) return;

    const confirmed =
      window.confirm(
        "Delete this report?"
      );

    if (!confirmed) return;

    try {
      setDeletingReportId(
        reportId
      );
      setError("");

      const response =
        await fetch(
          `${API_URL}/reports/${reportId}`,
          {
            method: "DELETE",
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete report."
        );
      }

      setReports(
        (previous) =>
          previous.filter(
            (report) =>
              getId(report)?.toString() !==
              reportId.toString()
          )
      );
    } catch (err) {
      console.error(
        "Delete report error:",
        err
      );

      setError(err.message);
    } finally {
      setDeletingReportId(
        null
      );
    }
  };

  // ==========================================
  // ADMIN ACCESS
  // ==========================================

  if (
    storedRole &&
    storedRole !== "admin"
  ) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">

          <div className="text-6xl mb-5">
            🔒
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Admin Access Required
          </h1>

          <p className="text-gray-500 mt-2">
            You do not have permission to
            access the admin panel.
          </p>

          <a
            href="/dashboard"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            Back to Dashboard
          </a>

        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-6">

          <h1 className="text-3xl font-bold text-gray-800">
            Admin Panel
          </h1>

          <p className="text-gray-500 mt-1">
            Manage users and handle reported
            content.
          </p>

        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center justify-between">

            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="font-bold text-lg"
            >
              ×
            </button>

          </div>
        )}

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {users.length}
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Total Reports
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {reports.length}
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Pending Reports
            </p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {
                reports.filter(
                  (report) =>
                    report.status ===
                    "pending"
                ).length
              }
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Resolved Reports
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {
                reports.filter(
                  (report) =>
                    report.status ===
                    "resolved"
                ).length
              }
            </p>

          </div>

        </div>

        {/* ================================= */}
        {/* TABS */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="border-b border-gray-200 px-5">

            <div className="flex gap-6">

              <button
                type="button"
                onClick={() =>
                  setActiveTab("users")
                }
                className={`py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === "users"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Users
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("reports")
                }
                className={`py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === "reports"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Reports

                {reports.filter(
                  (report) =>
                    report.status ===
                    "pending"
                ).length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                    {
                      reports.filter(
                        (report) =>
                          report.status ===
                          "pending"
                      ).length
                    }
                  </span>
                )}

              </button>

            </div>

          </div>

          {/* ================================= */}
          {/* USERS TAB */}
          {/* ================================= */}

          {activeTab === "users" && (

            <div className="p-5">

              {loadingUsers ? (

                <div className="py-16 text-center">

                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                  <p className="text-sm text-gray-500 mt-3">
                    Loading users...
                  </p>

                </div>

              ) : users.length === 0 ? (

                <div className="py-16 text-center">

                  <div className="text-5xl">
                    👥
                  </div>

                  <p className="font-semibold text-gray-700 mt-3">
                    No users found
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px]">

                    <thead>

                      <tr className="border-b border-gray-200">

                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          User
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Email
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Role
                        </th>

                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Joined
                        </th>

                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {users.map(
                        (user) => {

                          const userId =
                            getId(user);

                          return (
                            <tr
                              key={
                                userId
                              }
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >

                              <td className="px-4 py-4">

                                <div className="flex items-center gap-3">

                                  {user.profilePic ? (

                                    <img
                                      src={
                                        user.profilePic.startsWith(
                                          "http"
                                        )
                                          ? user.profilePic
                                          : `${SERVER_URL}${
                                              user.profilePic.startsWith(
                                                "/"
                                              )
                                                ? ""
                                                : "/"
                                            }${user.profilePic}`
                                      }
                                      alt={getUserName(
                                        user
                                      )}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />

                                  ) : (

                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                      {getUserName(
                                        user
                                      )
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()}
                                    </div>

                                  )}

                                  <div>

                                    <p className="font-semibold text-gray-800">
                                      {getUserName(
                                        user
                                      )}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                      {userId}
                                    </p>

                                  </div>

                                </div>

                              </td>

                              <td className="px-4 py-4 text-sm text-gray-600">
                                {getUserEmail(
                                  user
                                )}
                              </td>

                              <td className="px-4 py-4">

                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    user.role ===
                                    "admin"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {user.role ||
                                    "user"}
                                </span>

                              </td>

                              <td className="px-4 py-4 text-sm text-gray-500">
                                {formatDate(
                                  user.createdAt
                                )}
                              </td>

                              <td className="px-4 py-4 text-right">

                                {user.role ===
                                "admin" ? (

                                  <span className="text-xs text-gray-400">
                                    Admin
                                  </span>

                                ) : (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteUser(
                                        userId
                                      )
                                    }
                                    disabled={
                                      deletingUserId ===
                                      userId
                                    }
                                    className="text-red-600 hover:text-red-800 disabled:text-red-300 text-sm font-semibold"
                                  >
                                    {deletingUserId ===
                                    userId
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>

                                )}

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

          {/* ================================= */}
          {/* REPORTS TAB */}
          {/* ================================= */}

          {activeTab === "reports" && (

            <div className="p-5">

              {loadingReports ? (

                <div className="py-16 text-center">

                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                  <p className="text-sm text-gray-500 mt-3">
                    Loading reports...
                  </p>

                </div>

              ) : reports.length === 0 ? (

                <div className="py-16 text-center">

                  <div className="text-5xl">
                    ✅
                  </div>

                  <p className="font-semibold text-gray-700 mt-3">
                    No reports
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    There are currently no
                    reported items to review.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {reports.map(
                    (report) => {

                      const reportId =
                        getId(report);

                      const reporter =
                        report.reporter;

                      const reportedUser =
                        report.reportedUser;

                      const post =
                        report.post;

                      const job =
                        report.job;

                      return (
                        <div
                          key={
                            reportId
                          }
                          className="border border-gray-200 rounded-xl p-5"
                        >

                          {/* REPORT HEADER */}

                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                            <div>

                              <div className="flex items-center gap-3">

                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                                    report.status
                                  )}`}
                                >
                                  {report.status ||
                                    "pending"}
                                </span>

                                <span className="text-xs text-gray-400">
                                  {formatDate(
                                    report.createdAt
                                  )}
                                </span>

                              </div>

                              <h3 className="font-bold text-gray-800 mt-3">
                                {getReportTarget(
                                  report
                                )}
                              </h3>

                            </div>

                            <div className="text-right">

                              <p className="text-xs text-gray-400">
                                Reported by
                              </p>

                              <p className="text-sm font-semibold text-gray-700">
                                {getUserName(
                                  reporter
                                )}
                              </p>

                            </div>

                          </div>

                          {/* REASON */}

                          <div className="mt-4 bg-gray-50 rounded-lg p-4">

                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Reason
                            </p>

                            <p className="text-sm text-gray-700 mt-1">
                              {report.reason ||
                                "No reason provided."}
                            </p>

                          </div>

                          {/* TARGET DETAILS */}

                          {reportedUser && (
                            <div className="mt-4 text-sm">

                              <span className="text-gray-500">
                                Reported user:
                              </span>{" "}

                              <span className="font-semibold text-gray-800">
                                {getUserName(
                                  reportedUser
                                )}
                              </span>

                              <span className="text-gray-400 ml-2">
                                {getUserEmail(
                                  reportedUser
                                )}
                              </span>

                            </div>
                          )}

                          {post && (
                            <div className="mt-4 bg-blue-50 rounded-lg p-4">

                              <p className="text-xs font-semibold text-blue-600 uppercase">
                                Reported Post
                              </p>

                              <p className="text-sm text-gray-700 mt-1">
                                {post.content ||
                                  post.text ||
                                  "Post content unavailable."}
                              </p>

                              {post.userId && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Posted by{" "}
                                  {getUserName(
                                    post.userId
                                  )}
                                </p>
                              )}

                            </div>
                          )}

                          {job && (
                            <div className="mt-4 bg-green-50 rounded-lg p-4">

                              <p className="text-xs font-semibold text-green-600 uppercase">
                                Reported Job
                              </p>

                              <p className="font-semibold text-gray-800 mt-1">
                                {job.title ||
                                  "Untitled Job"}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                {job.company ||
                                  "Company not specified"}
                              </p>

                            </div>
                          )}

                          {/* ACTIONS */}

                          <div className="mt-5 flex flex-wrap items-center gap-3">

                            <select
                              value={
                                report.status ||
                                "pending"
                              }
                              onChange={(e) =>
                                updateReportStatus(
                                  reportId,
                                  e.target.value
                                )
                              }
                              disabled={
                                updatingReportId ===
                                reportId
                              }
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                            >
                              <option value="pending">
                                Pending
                              </option>

                              <option value="reviewed">
                                Reviewed
                              </option>

                              <option value="resolved">
                                Resolved
                              </option>

                            </select>

                            {post && (
                              <button
                                type="button"
                                onClick={() =>
                                  deletePost(
                                    getId(
                                      post
                                    )
                                  )
                                }
                                disabled={
                                  deletingPostId ===
                                  getId(
                                    post
                                  )
                                }
                                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold"
                              >
                                {deletingPostId ===
                                getId(
                                  post
                                )
                                  ? "Deleting..."
                                  : "Delete Post"}
                              </button>
                            )}

                            {job && (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteJob(
                                    getId(
                                      job
                                    )
                                  )
                                }
                                disabled={
                                  deletingJobId ===
                                  getId(
                                    job
                                  )
                                }
                                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold"
                              >
                                {deletingJobId ===
                                getId(
                                  job
                                )
                                  ? "Deleting..."
                                  : "Delete Job"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                deleteReport(
                                  reportId
                                )
                              }
                              disabled={
                                deletingReportId ===
                                reportId
                              }
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold"
                            >
                              {deletingReportId ===
                              reportId
                                ? "Deleting..."
                                : "Delete Report"}
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Admin;