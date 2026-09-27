import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

function Search() {
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

  const [results, setResults] = useState({
    users: [],
    posts: [],
    jobs: [],
  });

  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // CONNECTION REQUEST
  // ==========================================

  const [actionLoading, setActionLoading] = useState(null);

  // ==========================================
  // OPTIONAL CLIENT-SIDE FILTERS
  // ==========================================

  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");

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
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${SERVER_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  const getUserName = (user) => {
    return user?.name || "Unknown User";
  };

  const getSkills = (item) => {
    if (!item?.skills) {
      return [];
    }

    if (Array.isArray(item.skills)) {
      return item.skills;
    }

    if (typeof item.skills === "string") {
      return item.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const getPoster = (post) => {
    return (
      post?.userId ||
      post?.user ||
      post?.author ||
      null
    );
  };

  const getJobPoster = (job) => {
    return (
      job?.postedBy ||
      job?.userId ||
      job?.user ||
      null
    );
  };

  const getPostContent = (post) => {
    return (
      post?.content ||
      post?.text ||
      ""
    );
  };

  const getJobDescription = (job) => {
    return (
      job?.description ||
      job?.desc ||
      ""
    );
  };

  const getJobLocation = (job) => {
    return (
      job?.location ||
      "Location not specified"
    );
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

  // ==========================================
  // SEND CONNECTION REQUEST
  // ==========================================

  const sendRequest = async (receiverId) => {
    if (!receiverId) {
      return;
    }

    try {
      setActionLoading(receiverId);
      setError("");

      const response = await fetch(
        `${API_URL}/connections/request`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            receiverId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send connection request."
        );
      }

      alert(
        data.message ||
          "Connection request sent successfully."
      );
    } catch (err) {
      console.error(
        "Send connection request error:",
        err
      );

      setError(
        err.message ||
          "Failed to send connection request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // FILTER MATCHING
  // ==========================================

  const matchesFilters = (item) => {
    const skillText =
      getSkills(item)
        .join(" ")
        .toLowerCase();

    const locationText = String(
      item?.location || ""
    ).toLowerCase();

    const experienceText = String(
      item?.experience ||
        item?.experienceLevel ||
        item?.yearsOfExperience ||
        ""
    ).toLowerCase();

    if (
      skillFilter.trim() &&
      !skillText.includes(
        skillFilter
          .trim()
          .toLowerCase()
      )
    ) {
      return false;
    }

    if (
      locationFilter.trim() &&
      !locationText.includes(
        locationFilter
          .trim()
          .toLowerCase()
      )
    ) {
      return false;
    }

    if (
      experienceFilter.trim() &&
      !experienceText.includes(
        experienceFilter
          .trim()
          .toLowerCase()
      )
    ) {
      return false;
    }

    return true;
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async (
    event
  ) => {
    event?.preventDefault();

    const searchTerm =
      query.trim();

    if (!searchTerm) {
      setError(
        "Please enter something to search."
      );
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response =
        await fetch(
          `${API_URL}/search?q=${encodeURIComponent(
            searchTerm
          )}&type=${encodeURIComponent(
            searchType
          )}`,
          {
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Search failed."
        );
      }

      setResults({
        users:
          data.users || [],
        posts:
          data.posts || [],
        jobs:
          data.jobs || [],
      });
    } catch (err) {
      console.error(
        "Search error:",
        err
      );

      setError(err.message);

      setResults({
        users: [],
        posts: [],
        jobs: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const clearSearch = () => {
    setQuery("");

    setResults({
      users: [],
      posts: [],
      jobs: [],
    });

    setSearched(false);
    setError("");

    setSkillFilter("");
    setLocationFilter("");
    setExperienceFilter("");
  };

  // ==========================================
  // FILTERED RESULTS
  // ==========================================

  const filteredUsers =
    results.users.filter(
      (user) =>
        matchesFilters(user)
    );

  const filteredPosts =
    results.posts.filter(
      (post) => {
        const poster =
          getPoster(post);

        return (
          matchesFilters(post) ||
          matchesFilters(poster)
        );
      }
    );

  const filteredJobs =
    results.jobs.filter(
      (job) =>
        matchesFilters(job)
    );

  const totalResults =
    filteredUsers.length +
    filteredPosts.length +
    filteredJobs.length;

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
            Search
          </h1>

          <p className="text-gray-500 mt-1">
            Find professionals, posts, and
            job opportunities.
          </p>

        </div>

        {/* ================================= */}
        {/* SEARCH BOX */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

          <form
            onSubmit={handleSearch}
            className="flex flex-col lg:flex-row gap-3"
          >

            <div className="flex-1">

              <input
                type="text"
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                placeholder="Search users, jobs, posts..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <select
              value={searchType}
              onChange={(e) =>
                setSearchType(
                  e.target.value
                )
              }
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option value="all">
                Everything
              </option>

              <option value="users">
                People
              </option>

              <option value="posts">
                Posts
              </option>

              <option value="jobs">
                Jobs
              </option>

            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold"
            >
              {loading
                ? "Searching..."
                : "Search"}
            </button>

            {searched && (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold"
              >
                Clear
              </button>
            )}

          </form>

          {/* ================================= */}
          {/* FILTERS */}
          {/* ================================= */}

          <div className="mt-4 pt-4 border-t border-gray-100">

            <div className="flex items-center justify-between mb-3">

              <h2 className="text-sm font-semibold text-gray-700">
                Filters
              </h2>

              {(skillFilter ||
                locationFilter ||
                experienceFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSkillFilter("");
                    setLocationFilter("");
                    setExperienceFilter("");
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              <input
                type="text"
                value={skillFilter}
                onChange={(e) =>
                  setSkillFilter(
                    e.target.value
                  )
                }
                placeholder="Skill e.g. React"
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                value={locationFilter}
                onChange={(e) =>
                  setLocationFilter(
                    e.target.value
                  )
                }
                placeholder="Location e.g. Bangalore"
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                value={experienceFilter}
                onChange={(e) =>
                  setExperienceFilter(
                    e.target.value
                  )
                }
                placeholder="Experience e.g. 2 years"
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <p className="text-xs text-gray-400 mt-2">
              Search is performed by the backend;
              these additional filters refine the
              returned results on the client.
            </p>

          </div>

        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center justify-between">

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
        {/* SEARCH SUMMARY */}
        {/* ================================= */}

        {searched && !loading && (
          <div className="mt-5 bg-white border border-gray-200 rounded-xl px-5 py-4">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

              <p className="text-sm text-gray-600">

                Results for{" "}

                <span className="font-semibold text-gray-800">
                  "{query}"
                </span>

              </p>

              <p className="text-sm text-gray-500">
                {totalResults} result
                {totalResults === 1
                  ? ""
                  : "s"} found
              </p>

            </div>

          </div>
        )}

        {/* ================================= */}
        {/* LOADING */}
        {/* ================================= */}

        {loading && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-10 text-center">

            <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="text-sm text-gray-500 mt-4">
              Searching Global_Connect...
            </p>

          </div>
        )}

        {/* ================================= */}
        {/* RESULTS */}
        {/* ================================= */}

        {searched && !loading && (
          <div className="mt-6 space-y-6">

            {/* ================================= */}
            {/* USERS */}
            {/* ================================= */}

            {(searchType === "all" ||
              searchType === "users") && (
              <section>

                <div className="flex items-center justify-between mb-3">

                  <h2 className="text-xl font-bold text-gray-800">
                    People
                  </h2>

                  <span className="text-sm text-gray-500">
                    {filteredUsers.length}
                  </span>

                </div>

                {filteredUsers.length ===
                0 ? (

                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">

                    <div className="text-4xl">
                      👤
                    </div>

                    <p className="font-semibold text-gray-700 mt-3">
                      No people found
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Try another search term
                      or filter.
                    </p>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {filteredUsers.map(
                      (user) => {

                        const userId =
                          getId(user);

                        const image =
                          getImageUrl(
                            user.profilePic
                          );

                        const skills =
                          getSkills(user);

                        return (
                          <div
                            key={
                              userId
                            }
                            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition"
                          >

                            <div className="flex items-center gap-4">

                              {image ? (

                                <img
                                  src={image}
                                  alt={getUserName(
                                    user
                                  )}
                                  className="w-14 h-14 rounded-full object-cover"
                                />

                              ) : (

                                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">

                                  {getUserName(
                                    user
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}

                                </div>

                              )}

                              <div className="min-w-0">

                                <Link
                                  to={`/profile/${userId}`}
                                  className="font-bold text-gray-800 hover:text-blue-600"
                                >
                                  {getUserName(
                                    user
                                  )}
                                </Link>

                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {user.email ||
                                    "Professional"}
                                </p>

                                {user.role && (
                                  <span className="inline-block mt-2 text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {user.role}
                                  </span>
                                )}

                              </div>

                            </div>

                            {user.bio && (
                              <p className="text-sm text-gray-600 mt-4 line-clamp-3">
                                {user.bio}
                              </p>
                            )}

                            {skills.length >
                              0 && (
                              <div className="flex flex-wrap gap-2 mt-4">

                                {skills
                                  .slice(
                                    0,
                                    5
                                  )
                                  .map(
                                    (
                                      skill,
                                      index
                                    ) => (
                                      <span
                                        key={`${skill}-${index}`}
                                        className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}

                              </div>
                            )}

                            {/* ================================= */}
                            {/* PROFILE + CONNECT BUTTONS */}
                            {/* ================================= */}

                            <div className="flex gap-2 mt-4">

                              <Link
                                to={`/profile/${userId}`}
                                className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg py-2 text-sm font-semibold"
                              >
                                View Profile
                              </Link>

                              <button
                                onClick={() =>
                                  sendRequest(
                                    userId
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  userId
                                }
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
                              >
                                {actionLoading ===
                                userId
                                  ? "Sending..."
                                  : "Connect"}
                              </button>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </section>
            )}

            {/* ================================= */}
            {/* POSTS */}
            {/* ================================= */}

            {(searchType === "all" ||
              searchType === "posts") && (
              <section>

                <div className="flex items-center justify-between mb-3">

                  <h2 className="text-xl font-bold text-gray-800">
                    Posts
                  </h2>

                  <span className="text-sm text-gray-500">
                    {filteredPosts.length}
                  </span>

                </div>

                {filteredPosts.length ===
                0 ? (

                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">

                    <div className="text-4xl">
                      📝
                    </div>

                    <p className="font-semibold text-gray-700 mt-3">
                      No posts found
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {filteredPosts.map(
                      (post, index) => {

                        const postId =
                          getId(post);

                        const poster =
                          getPoster(post);

                        const posterId =
                          getId(
                            poster
                          );

                        const image =
                          getImageUrl(
                            poster?.profilePic
                          );

                        return (
                          <div
                            key={
                              postId ||
                              index
                            }
                            className="bg-white rounded-2xl border border-gray-200 p-5"
                          >

                            <div className="flex items-center gap-3">

                              {image ? (

                                <img
                                  src={image}
                                  alt={getUserName(
                                    poster
                                  )}
                                  className="w-11 h-11 rounded-full object-cover"
                                />

                              ) : (

                                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">

                                  {getUserName(
                                    poster
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}

                                </div>

                              )}

                              <div>

                                {posterId ? (

                                  <Link
                                    to={`/profile/${posterId}`}
                                    className="font-semibold text-gray-800 hover:text-blue-600"
                                  >
                                    {getUserName(
                                      poster
                                    )}
                                  </Link>

                                ) : (

                                  <p className="font-semibold text-gray-800">
                                    {getUserName(
                                      poster
                                    )}
                                  </p>

                                )}

                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(
                                    post.createdAt
                                  )}
                                </p>

                              </div>

                            </div>

                            <p className="text-gray-700 mt-4 whitespace-pre-wrap break-words">
                              {getPostContent(
                                post
                              )}
                            </p>

                            {post.image && (
                              <img
                                src={getImageUrl(
                                  post.image
                                )}
                                alt="Post"
                                className="mt-4 rounded-xl max-h-96 object-cover w-full"
                              />
                            )}

                            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">

                              <span>
                                ❤️{" "}
                                {Array.isArray(
                                  post.likes
                                )
                                  ? post.likes
                                      .length
                                  : post.likeCount ||
                                    0}{" "}
                                likes
                              </span>

                              <span>
                                💬{" "}
                                {Array.isArray(
                                  post.comments
                                )
                                  ? post.comments
                                      .length
                                  : post.commentCount ||
                                    0}{" "}
                                comments
                              </span>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </section>
            )}

            {/* ================================= */}
            {/* JOBS */}
            {/* ================================= */}

            {(searchType === "all" ||
              searchType === "jobs") && (
              <section>

                <div className="flex items-center justify-between mb-3">

                  <h2 className="text-xl font-bold text-gray-800">
                    Jobs
                  </h2>

                  <span className="text-sm text-gray-500">
                    {filteredJobs.length}
                  </span>

                </div>

                {filteredJobs.length ===
                0 ? (

                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">

                    <div className="text-4xl">
                      💼
                    </div>

                    <p className="font-semibold text-gray-700 mt-3">
                      No jobs found
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Try another search term
                      or filter.
                    </p>

                  </div>

                ) : (

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {filteredJobs.map(
                      (job, index) => {

                        const jobId =
                          getId(job);

                        const poster =
                          getJobPoster(
                            job
                          );

                        /*
                         * IMPORTANT:
                         * Previous file had:
                         *
                         * getUserId(poster)
                         *
                         * but that helper did
                         * not exist.
                         *
                         * We use getId(poster)
                         * consistently.
                         */

                        const posterId =
                          getId(
                            poster
                          );

                        const skills =
                          getSkills(job);

                        return (
                          <div
                            key={
                              jobId ||
                              index
                            }
                            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition"
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div>

                                <h3 className="text-lg font-bold text-gray-800">
                                  {job.title ||
                                    "Untitled Job"}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                  {job.company ||
                                    "Company not specified"}
                                </p>

                              </div>

                              <span className="text-2xl">
                                💼
                              </span>

                            </div>

                            <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">

                              <span className="bg-gray-100 px-2.5 py-1 rounded-full">
                                📍{" "}
                                {getJobLocation(
                                  job
                                )}
                              </span>

                              {job.experience && (
                                <span className="bg-gray-100 px-2.5 py-1 rounded-full">
                                  Experience:{" "}
                                  {
                                    job.experience
                                  }
                                </span>
                              )}

                            </div>

                            <p className="text-sm text-gray-600 mt-4 line-clamp-4">
                              {getJobDescription(
                                job
                              )}
                            </p>

                            {skills.length >
                              0 && (
                              <div className="flex flex-wrap gap-2 mt-4">

                                {skills.map(
                                  (
                                    skill,
                                    skillIndex
                                  ) => (
                                    <span
                                      key={`${skill}-${skillIndex}`}
                                      className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )}

                              </div>
                            )}

                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">

                              <div>

                                {posterId ? (

                                  <Link
                                    to={`/profile/${posterId}`}
                                    className="text-xs text-gray-500 hover:text-blue-600"
                                  >
                                    Posted by{" "}
                                    <span className="font-semibold">
                                      {getUserName(
                                        poster
                                      )}
                                    </span>
                                  </Link>

                                ) : (

                                  <p className="text-xs text-gray-500">
                                    Posted by{" "}
                                    <span className="font-semibold">
                                      {getUserName(
                                        poster
                                      )}
                                    </span>
                                  </p>

                                )}

                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(
                                    job.createdAt
                                  )}
                                </p>

                              </div>

                              <Link
                                to="/jobs"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                              >
                                View Jobs
                              </Link>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </section>
            )}

          </div>
        )}

        {/* ================================= */}
        {/* EMPTY INITIAL STATE */}
        {/* ================================= */}

        {!searched && !loading && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-12 text-center">

            <div className="text-6xl mb-5">
              🔎
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Search Global_Connect
            </h2>

            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              Find professionals, discover
              posts, and explore job
              opportunities across the platform.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">

              <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-sm">
                People
              </span>

              <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-sm">
                Jobs
              </span>

              <span className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full text-sm">
                Posts
              </span>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Search;