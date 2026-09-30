import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { API_URL, SERVER_URL } from "../config";
function Dashboard() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getId = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    return item._id || item.id || null;
  };

  const getImageUrl = (image) => {
    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${SERVER_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  const getSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills.filter(Boolean);
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const getConnectionUser = (connection) => {
    if (!connection) return null;

    const sender =
      connection.sender ||
      connection.requester;

    const receiver =
      connection.receiver ||
      connection.recipient;

    if (
      getId(sender)?.toString() ===
      userId?.toString()
    ) {
      return receiver;
    }

    if (
      getId(receiver)?.toString() ===
      userId?.toString()
    ) {
      return sender;
    }

    return (
      connection.user ||
      connection.connectedUser ||
      connection
    );
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const results =
        await Promise.allSettled([
          fetch(
            `${API_URL}/users/${userId}`,
            { headers }
          ),
          fetch(
            `${API_URL}/connections`,
            { headers }
          ),
          fetch(
            `${API_URL}/posts`,
            { headers }
          ),
          fetch(
            `${API_URL}/jobs`,
            { headers }
          ),
          fetch(
            `${API_URL}/notifications`,
            { headers }
          ),
        ]);

      const [
        userResult,
        connectionsResult,
        postsResult,
        jobsResult,
        notificationsResult,
      ] = results;

      if (
        userResult.status === "fulfilled" &&
        userResult.value.ok
      ) {
        const data =
          await userResult.value.json();

        setUser(
          data.user ||
            data.profile ||
            data.data
        );
      }

      if (
        connectionsResult.status ===
          "fulfilled" &&
        connectionsResult.value.ok
      ) {
        const data =
          await connectionsResult.value.json();

        setConnections(
          data.connections ||
            data.data ||
            []
        );
      }

      if (
        postsResult.status === "fulfilled" &&
        postsResult.value.ok
      ) {
        const data =
          await postsResult.value.json();

        setPosts(
          data.posts ||
            data.data ||
            []
        );
      }

      if (
        jobsResult.status === "fulfilled" &&
        jobsResult.value.ok
      ) {
        const data =
          await jobsResult.value.json();

        setJobs(
          data.jobs ||
            data.data ||
            []
        );
      }

      if (
        notificationsResult.status ===
          "fulfilled" &&
        notificationsResult.value.ok
      ) {
        const data =
          await notificationsResult.value.json();

        setNotifications(
          data.notifications ||
            data.data ||
            []
        );
      }
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) {
      fetchDashboard();
    }
  }, [token, userId]);

  const skills = getSkills(user?.skills);

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  const profileFields = [
    user?.name,
    user?.bio,
    skills.length > 0,
    user?.experience,
    user?.education,
    user?.profilePic,
  ];

  const completedFields =
    profileFields.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedFields /
      profileFields.length) *
      100
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">

            <div className="h-8 w-64 bg-gray-200 rounded" />

            <div className="h-4 w-80 bg-gray-200 rounded mt-3" />

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded mt-3" />
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

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* HEADER */}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">

              {getImageUrl(
                user?.profilePic
              ) ? (
                <img
                  src={getImageUrl(
                    user.profilePic
                  )}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                  {(user?.name || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>

                <p className="text-sm text-gray-500">
                  Welcome back,
                </p>

                <h1 className="text-3xl font-bold text-gray-800">
                  {user?.name ||
                    localStorage.getItem(
                      "userName"
                    ) ||
                    "User"}
                </h1>

                <p className="text-gray-500 mt-1">
                  {user?.email}
                </p>

              </div>

            </div>

            <div className="flex gap-3">

              <Link
                to="/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                View Profile
              </Link>

              <Link
                to="/feed"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-semibold"
              >
                Open Feed
              </Link>

            </div>

          </div>

        </section>

        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

          <div className="bg-white rounded-xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Connections
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {connections.length}
            </p>

          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Posts
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {posts.length}
            </p>

          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Jobs
            </p>

            <p className="text-3xl font-bold text-gray-800 mt-2">
              {jobs.length}
            </p>

          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Unread Notifications
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {unreadNotifications}
            </p>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* LEFT */}

          <div className="lg:col-span-2 space-y-6">

            {/* QUICK ACTIONS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                <Link
                  to="/connections"
                  className="bg-blue-50 hover:bg-blue-100 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl">
                    👥
                  </div>

                  <p className="text-sm font-semibold text-blue-700 mt-2">
                    Network
                  </p>
                </Link>

                <Link
                  to="/search"
                  className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl">
                    🔍
                  </div>

                  <p className="text-sm font-semibold text-purple-700 mt-2">
                    Search
                  </p>
                </Link>

                <Link
                  to="/jobs"
                  className="bg-green-50 hover:bg-green-100 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl">
                    💼
                  </div>

                  <p className="text-sm font-semibold text-green-700 mt-2">
                    Jobs
                  </p>
                </Link>

                <Link
                  to="/messages"
                  className="bg-orange-50 hover:bg-orange-100 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl">
                    💬
                  </div>

                  <p className="text-sm font-semibold text-orange-700 mt-2">
                    Messages
                  </p>
                </Link>

              </div>

            </section>

            {/* RECENT POSTS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Recent Posts
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Latest activity on the platform.
                  </p>
                </div>

                <Link
                  to="/feed"
                  className="text-blue-600 hover:underline text-sm font-semibold"
                >
                  View Feed
                </Link>

              </div>

              {posts.length === 0 ? (

                <div className="text-center py-10">

                  <div className="text-4xl mb-3">
                    📝
                  </div>

                  <p className="font-semibold text-gray-700">
                    No posts yet
                  </p>

                  <Link
                    to="/feed"
                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                  >
                    Create your first post
                  </Link>

                </div>

              ) : (

                <div className="space-y-4 mt-5">

                  {posts
                    .slice(0, 3)
                    .map((post) => {

                      const postUser =
                        post.userId ||
                        post.user ||
                        {};

                      return (
                        <div
                          key={getId(post)}
                          className="border border-gray-100 rounded-xl p-4"
                        >

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {(
                                postUser.name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <p className="font-semibold text-gray-800">
                                {postUser.name ||
                                  "User"}
                              </p>

                              <p className="text-xs text-gray-400">
                                {post.createdAt
                                  ? new Date(
                                      post.createdAt
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : ""}
                              </p>

                            </div>

                          </div>

                          <p className="text-gray-600 mt-3 line-clamp-3">
                            {post.content ||
                              post.text ||
                              ""}
                          </p>

                        </div>
                      );
                    })}

                </div>

              )}

            </section>

            {/* RECENT JOBS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Job Opportunities
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Explore the latest jobs.
                  </p>
                </div>

                <Link
                  to="/jobs"
                  className="text-blue-600 hover:underline text-sm font-semibold"
                >
                  View Jobs
                </Link>

              </div>

              {jobs.length === 0 ? (

                <p className="text-gray-400 text-center py-8">
                  No jobs available.
                </p>

              ) : (

                <div className="space-y-3 mt-5">

                  {jobs
                    .slice(0, 3)
                    .map((job) => (
                      <div
                        key={getId(job)}
                        className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4"
                      >

                        <div>

                          <h3 className="font-bold text-gray-800">
                            {job.title ||
                              "Job"}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {job.company ||
                              "Company"}
                          </p>

                          {job.location && (
                            <p className="text-xs text-gray-400 mt-1">
                              📍{" "}
                              {job.location}
                            </p>
                          )}

                        </div>

                        <Link
                          to="/jobs"
                          className="text-blue-600 hover:underline text-sm font-semibold"
                        >
                          View
                        </Link>

                      </div>
                    ))}

                </div>

              )}

            </section>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* PROFILE COMPLETION */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                Profile Completion
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Complete your profile to help
                others know you better.
              </p>

              <div className="mt-5">

                <div className="flex justify-between text-sm mb-2">

                  <span className="font-semibold text-gray-700">
                    Completion
                  </span>

                  <span className="font-bold text-blue-600">
                    {profileCompletion}%
                  </span>

                </div>

                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />

                </div>

              </div>

              {profileCompletion < 100 && (
                <Link
                  to="/profile"
                  className="block text-center mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm"
                >
                  Complete Profile
                </Link>
              )}

            </section>

            {/* SKILLS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <h2 className="text-xl font-bold text-gray-800">
                Your Skills
              </h2>

              {skills.length === 0 ? (

                <div className="mt-4">

                  <p className="text-sm text-gray-400">
                    Add skills to your profile.
                  </p>

                  <Link
                    to="/profile"
                    className="inline-block mt-3 text-blue-600 hover:underline text-sm font-semibold"
                  >
                    Add Skills
                  </Link>

                </div>

              ) : (

                <div className="flex flex-wrap gap-2 mt-4">

                  {skills
                    .slice(0, 10)
                    .map(
                      (skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      )
                    )}

                </div>

              )}

            </section>

            {/* NETWORK */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-800">
                  Your Network
                </h2>

                <Link
                  to="/connections"
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  View All
                </Link>

              </div>

              {connections.length === 0 ? (

                <div className="text-center py-7">

                  <div className="text-4xl">
                    👥
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Start building your network.
                  </p>

                  <Link
                    to="/connections"
                    className="inline-block mt-3 text-blue-600 hover:underline text-sm font-semibold"
                  >
                    Find People
                  </Link>

                </div>

              ) : (

                <div className="space-y-3 mt-5">

                  {connections
                    .slice(0, 4)
                    .map(
                      (
                        connection,
                        index
                      ) => {

                        const connectedUser =
                          getConnectionUser(
                            connection
                          );

                        const connectedUserId =
                          getId(
                            connectedUser
                          );

                        return (
                          <div
                            key={
                              getId(
                                connection
                              ) ||
                              index
                            }
                            className="flex items-center gap-3"
                          >

                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                              {(
                                connectedUser?.name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">

                              {connectedUserId ? (
                                <Link
                                  to={`/profile/${connectedUserId}`}
                                  className="font-semibold text-gray-700 hover:text-blue-600 text-sm truncate block"
                                >
                                  {connectedUser?.name ||
                                    "User"}
                                </Link>
                              ) : (
                                <p className="font-semibold text-gray-700 text-sm">
                                  {connectedUser?.name ||
                                    "User"}
                                </p>
                              )}

                              <p className="text-xs text-gray-400">
                                Connection
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )}

                </div>

              )}

            </section>

            {/* NOTIFICATIONS */}

            <section className="bg-white rounded-2xl border border-gray-200 p-6">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-800">
                  Notifications
                </h2>

                <Link
                  to="/notifications"
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  View All
                </Link>

              </div>

              {notifications.length === 0 ? (

                <p className="text-sm text-gray-400 text-center py-6">
                  No notifications.
                </p>

              ) : (

                <div className="space-y-3 mt-5">

                  {notifications
                    .slice(0, 4)
                    .map(
                      (notification) => (
                        <div
                          key={getId(
                            notification
                          )}
                          className={`p-3 rounded-lg ${
                            notification.isRead
                              ? "bg-gray-50"
                              : "bg-blue-50"
                          }`}
                        >

                          <p className="text-sm text-gray-700 line-clamp-2">
                            {notification.message ||
                              "New notification"}
                          </p>

                        </div>
                      )
                    )}

                </div>

              )}

            </section>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;