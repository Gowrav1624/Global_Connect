import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

function Feed() {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [commentText, setCommentText] = useState({});
  const [openComments, setOpenComments] = useState({});

  const [reportPost, setReportPost] = useState(null);
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

  const getPostUser = (post) => {
    return (
      post?.userId ||
      post?.user ||
      post?.author ||
      {}
    );
  };

  const getUserName = (user) => {
    return user?.name || "Unknown User";
  };

  const getComments = (post) => {
    return (
      post?.comments ||
      post?.commentList ||
      []
    );
  };

  const getCommentUser = (comment) => {
    return (
      comment?.user ||
      comment?.userId ||
      comment?.author ||
      comment?.commenter ||
      {}
    );
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const isLikedByCurrentUser = (post) => {
    const likes =
      post?.likes ||
      post?.likedBy ||
      [];

    if (!Array.isArray(likes)) {
      return false;
    }

    return likes.some((like) => {
      const likeId = getId(like);

      return (
        likeId?.toString() ===
        currentUserId?.toString()
      );
    });
  };

  const getLikeCount = (post) => {
    if (
      typeof post?.likesCount === "number"
    ) {
      return post.likesCount;
    }

    if (Array.isArray(post?.likes)) {
      return post.likes.length;
    }

    return post?.likes || 0;
  };

  const getPostContent = (post) => {
    return post?.content || post?.text || "";
  };

  const getPostImage = (post) => {
    return getImageUrl(
      post?.image ||
      post?.imageUrl ||
      post?.media
    );
  };

  const isRepost = (post) => {
    return (
      post?.isRepost === true ||
      post?.type === "repost" ||
      post?.repostOf
    );
  };

  // ==========================================
  // FETCH POSTS
  // ==========================================

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/posts`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load posts."
        );
      }

      setPosts(
        data.posts ||
          data.data ||
          []
      );
    } catch (err) {
      console.error(
        "Fetch posts error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ==========================================
  // CREATE POST
  // ==========================================

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (
      !postText.trim() &&
      !postImage.trim()
    ) {
      setError(
        "Please write something or add an image before posting."
      );
      return;
    }

    if (
      postImage.trim() &&
      !/^https?:\/\/.+/i.test(
        postImage.trim()
      )
    ) {
      setError(
        "Please enter a valid image URL."
      );
      return;
    }

    try {
      setPosting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/posts`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            content: postText.trim(),
            text: postText.trim(),
            image:
              postImage.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create post."
        );
      }

      const newPost =
        data.post ||
        data.data;

      if (newPost) {
        setPosts((previous) => [
          newPost,
          ...previous,
        ]);
      } else {
        await fetchPosts();
      }

      setPostText("");
      setPostImage("");

      setSuccess(
        "Post published successfully."
      );
    } catch (err) {
      console.error(
        "Create post error:",
        err
      );

      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  // ==========================================
  // LIKE POST
  // ==========================================

  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}/like`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to like post."
        );
      }

      const updatedPost =
        data.post ||
        data.data;

      if (updatedPost) {
        setPosts((previous) =>
          previous.map((post) =>
            getId(post)?.toString() ===
            postId?.toString()
              ? updatedPost
              : post
          )
        );
      } else {
        await fetchPosts();
      }
    } catch (err) {
      console.error(
        "Like post error:",
        err
      );

      setError(err.message);
    }
  };

  // ==========================================
  // ADD COMMENT
  // ==========================================

  const handleComment = async (
    postId
  ) => {
    const text =
      commentText[postId]?.trim();

    if (!text) {
      setError(
        "Please write a comment."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}/comment`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            text,
            content: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add comment."
        );
      }

      setCommentText((previous) => ({
        ...previous,
        [postId]: "",
      }));

      const updatedPost =
        data.post ||
        data.data;

      if (updatedPost) {
        setPosts((previous) =>
          previous.map((post) =>
            getId(post)?.toString() ===
            postId?.toString()
              ? updatedPost
              : post
          )
        );
      } else {
        await fetchPosts();
      }
    } catch (err) {
      console.error(
        "Comment error:",
        err
      );

      setError(err.message);
    }
  };

  // ==========================================
  // REPOST
  // ==========================================

  const handleRepost = async (post) => {
    const postId = getId(post);

    if (!postId) {
      setError(
        "Unable to repost this post."
      );
      return;
    }

    const originalUser =
      getPostUser(post);

    const originalUserName =
      getUserName(originalUser);

    const originalContent =
      getPostContent(post);

    try {
      setPosting(true);
      setError("");
      setSuccess("");

      const repostText =
        `Reposted from ${originalUserName}\n\n${originalContent}`;

      const response = await fetch(
        `${API_URL}/posts`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            content: repostText,
            text: repostText,
            repostOf: postId,
            isRepost: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to repost."
        );
      }

      const newPost =
        data.post ||
        data.data;

      if (newPost) {
        setPosts((previous) => [
          newPost,
          ...previous,
        ]);
      } else {
        await fetchPosts();
      }

      setSuccess(
        "Post reposted successfully."
      );
    } catch (err) {
      console.error(
        "Repost error:",
        err
      );

      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  // ==========================================
  // DELETE POST
  // ==========================================

  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete post."
        );
      }

      setPosts((previous) =>
        previous.filter(
          (post) =>
            getId(post)?.toString() !==
            postId?.toString()
        )
      );

      setSuccess(
        "Post deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete post error:",
        err
      );

      setError(err.message);
    }
  };

  // ==========================================
  // REPORT POST
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
            post: getId(reportPost),
            reason:
              reportReason.trim(),
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

      setReportPost(null);
      setReportReason("");

      setSuccess(
        "Report submitted successfully."
      );
    } catch (err) {
      console.error(
        "Report post error:",
        err
      );

      setError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  // ==========================================
  // TOGGLE COMMENTS
  // ==========================================

  const toggleComments = (postId) => {
    setOpenComments((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }));
  };

  // ==========================================
  // CLEAR ALERT
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
        <div className="max-w-3xl mx-auto">

          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-24 bg-gray-200 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 rounded mt-4" />
          </div>

          <div className="mt-6 space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200" />

                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded mt-2" />
                  </div>
                </div>

                <div className="h-4 bg-gray-200 rounded mt-6" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-4/5" />
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-3xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Professional Feed
          </h1>

          <p className="text-gray-500 mt-1">
            Share ideas, updates and
            professional experiences.
          </p>
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
        {/* CREATE POST */}
        {/* ================================= */}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {(
                localStorage.getItem(
                  "userName"
                ) || "U"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                Create a post
              </h2>

              <p className="text-xs text-gray-500">
                Share something with your
                network.
              </p>
            </div>

          </div>

          <form
            onSubmit={handleCreatePost}
          >

            {/* TEXT */}

            <textarea
              value={postText}
              onChange={(e) =>
                setPostText(e.target.value)
              }
              rows={5}
              maxLength={3000}
              placeholder="What do you want to share with your professional network?"
              className="w-full border border-gray-300 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {postText.length}/3000
              </span>
            </div>

            {/* IMAGE URL */}

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add image
                <span className="font-normal text-gray-400">
                  {" "}
                  (optional)
                </span>
              </label>

              <input
                type="url"
                value={postImage}
                onChange={(e) =>
                  setPostImage(e.target.value)
                }
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* IMAGE PREVIEW */}

            {postImage.trim() && (
              <div className="mt-4 relative">

                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Image preview
                </p>

                <img
                  src={postImage}
                  alt="Post preview"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                  className="w-full max-h-80 object-cover rounded-xl border border-gray-200"
                />

              </div>
            )}

            <div className="flex justify-end mt-4">

              <button
                type="submit"
                disabled={
                  posting ||
                  (!postText.trim() &&
                    !postImage.trim())
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-semibold"
              >
                {posting
                  ? "Publishing..."
                  : "Publish Post"}
              </button>

            </div>

          </form>

        </section>

        {/* ================================= */}
        {/* POSTS */}
        {/* ================================= */}

        {posts.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">

            <div className="text-5xl mb-4">
              📝
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No posts yet
            </h2>

            <p className="text-gray-500 mt-2">
              Be the first person to share
              something with the network.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {posts.map((post) => {

              const postId = getId(post);

              const user =
                getPostUser(post);

              const userId =
                getId(user);

              const userImage =
                getImageUrl(
                  user?.profilePic
                );

              const comments =
                getComments(post);

              const liked =
                isLikedByCurrentUser(
                  post
                );

              const likeCount =
                getLikeCount(post);

              const isOwnPost =
                userId?.toString() ===
                currentUserId?.toString();

              const postImage =
                getPostImage(post);

              const repost =
                isRepost(post);

              return (
                <article
                  key={postId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >

                  {/* POST HEADER */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-3">

                        {userImage ? (

                          <img
                            src={userImage}
                            alt={getUserName(
                              user
                            )}
                            className="w-11 h-11 rounded-full object-cover"
                          />

                        ) : (

                          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {getUserName(
                              user
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                        )}

                        <div>

                          {userId ? (

                            <Link
                              to={`/profile/${userId}`}
                              className="font-bold text-gray-800 hover:text-blue-600"
                            >
                              {getUserName(
                                user
                              )}
                            </Link>

                          ) : (

                            <p className="font-bold text-gray-800">
                              {getUserName(
                                user
                              )}
                            </p>

                          )}

                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(
                              post.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                      {/* POST MENU */}

                      <div className="flex items-center gap-2">

                        {isOwnPost ? (

                          <button
                            onClick={() =>
                              handleDelete(
                                postId
                              )
                            }
                            className="text-gray-400 hover:text-red-600 text-sm font-semibold"
                          >
                            Delete
                          </button>

                        ) : (

                          <button
                            onClick={() => {
                              setReportPost(
                                post
                              );
                              setReportReason(
                                ""
                              );
                              clearAlerts();
                            }}
                            className="text-gray-400 hover:text-red-600 text-sm font-semibold"
                          >
                            Report
                          </button>

                        )}

                      </div>

                    </div>

                    {/* REPOST LABEL */}

                    {repost && (
                      <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                        <span>🔁</span>
                        <span>
                          Reposted content
                        </span>
                      </div>
                    )}

                    {/* POST CONTENT */}

                    <div className="mt-5">

                      {getPostContent(post) && (
                        <p className="text-gray-700 leading-7 whitespace-pre-wrap">
                          {getPostContent(
                            post
                          )}
                        </p>
                      )}

                    </div>

                    {/* POST IMAGE */}

                    {postImage && (
                      <div className="mt-5">

                        <img
                          src={postImage}
                          alt="Post"
                          className="w-full max-h-[550px] object-cover rounded-xl border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      </div>
                    )}

                  </div>

                  {/* POST STATS */}

                  <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">

                    <span>
                      {likeCount}{" "}
                      {likeCount === 1
                        ? "like"
                        : "likes"}
                    </span>

                    <button
                      onClick={() =>
                        toggleComments(
                          postId
                        )
                      }
                      className="hover:text-blue-600"
                    >
                      {comments.length}{" "}
                      {comments.length === 1
                        ? "comment"
                        : "comments"}
                    </button>

                  </div>

                  {/* ACTIONS */}

                  <div className="px-5 py-2 border-t border-gray-100 flex gap-2">

                    <button
                      onClick={() =>
                        handleLike(postId)
                      }
                      className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${
                        liked
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {liked
                        ? "👍 Liked"
                        : "👍 Like"}
                    </button>

                    <button
                      onClick={() =>
                        toggleComments(
                          postId
                        )
                      }
                      className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-50"
                    >
                      💬 Comment
                    </button>

                    <button
                      onClick={() =>
                        handleRepost(post)
                      }
                      disabled={posting}
                      className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-50 disabled:text-gray-300"
                    >
                      🔁 Repost
                    </button>

                  </div>

                  {/* COMMENTS */}

                  {openComments[postId] && (

                    <div className="border-t border-gray-100 bg-gray-50 p-5">

                      {/* COMMENT INPUT */}

                      <div className="flex gap-2">

                        <input
                          type="text"
                          value={
                            commentText[
                              postId
                            ] || ""
                          }
                          onChange={(e) =>
                            setCommentText(
                              (previous) => ({
                                ...previous,
                                [postId]:
                                  e.target.value,
                              })
                            )
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key ===
                              "Enter"
                            ) {
                              e.preventDefault();

                              handleComment(
                                postId
                              );
                            }
                          }}
                          placeholder="Write a comment..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                          onClick={() =>
                            handleComment(
                              postId
                            )
                          }
                          disabled={
                            !commentText[
                              postId
                            ]?.trim()
                          }
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 rounded-lg font-semibold"
                        >
                          Post
                        </button>

                      </div>

                      {/* COMMENT LIST */}

                      {comments.length >
                      0 ? (

                        <div className="mt-5 space-y-4">

                          {comments.map(
                            (
                              comment,
                              index
                            ) => {

                              const commentUser =
                                getCommentUser(
                                  comment
                                );

                              const commentUserId =
                                getId(
                                  commentUser
                                );

                              const commentImage =
                                getImageUrl(
                                  commentUser?.profilePic
                                );

                              return (
                                <div
                                  key={
                                    getId(
                                      comment
                                    ) ||
                                    index
                                  }
                                  className="flex gap-3"
                                >

                                  {commentImage ? (

                                    <img
                                      src={
                                        commentImage
                                      }
                                      alt={
                                        getUserName(
                                          commentUser
                                        )
                                      }
                                      className="w-9 h-9 rounded-full object-cover"
                                    />

                                  ) : (

                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold">
                                      {getUserName(
                                        commentUser
                                      )
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()}
                                    </div>

                                  )}

                                  <div className="flex-1">

                                    <div className="bg-white rounded-xl px-4 py-3 border border-gray-200">

                                      {commentUserId ? (

                                        <Link
                                          to={`/profile/${commentUserId}`}
                                          className="font-semibold text-gray-800 text-sm hover:text-blue-600"
                                        >
                                          {getUserName(
                                            commentUser
                                          )}
                                        </Link>

                                      ) : (

                                        <p className="font-semibold text-gray-800 text-sm">
                                          {getUserName(
                                            commentUser
                                          )}
                                        </p>

                                      )}

                                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">
                                        {comment.text ||
                                          comment.content ||
                                          ""}
                                      </p>

                                    </div>

                                    {comment.createdAt && (
                                      <p className="text-xs text-gray-400 mt-1 ml-2">
                                        {formatDate(
                                          comment.createdAt
                                        )}
                                      </p>
                                    )}

                                  </div>

                                </div>
                              );
                            }
                          )}

                        </div>

                      ) : (

                        <p className="text-sm text-gray-400 text-center py-5">
                          No comments yet. Be the
                          first to comment.
                        </p>

                      )}

                    </div>
                  )}

                </article>
              );
            })}

          </div>
        )}

      </div>

      {/* ===================================== */}
      {/* REPORT MODAL */}
      {/* ===================================== */}

      {reportPost && (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Report Post
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Tell us why you are reporting
                  this post.
                </p>

              </div>

              <button
                onClick={() =>
                  setReportPost(null)
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
              placeholder="Enter the reason for reporting..."
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => {
                  setReportPost(null);
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

export default Feed;