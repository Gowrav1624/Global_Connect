import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../store/authSelectors";

const API_URL = "http://localhost:5000/api";

function ConnectionRequests() {
  const token = useSelector(selectToken);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ==========================================
  // GET USER
  // ==========================================

  const getUser = (request) => {
    return (
      request?.sender ||
      request?.requester ||
      request?.user ||
      request
    );
  };

  const getUserId = (user) => {
    return user?._id || user?.id;
  };

  const getUserName = (user) => {
    return user?.name || "Unknown User";
  };

  const getProfileImage = (user) => {
    if (!user?.profilePic) {
      return null;
    }

    if (user.profilePic.startsWith("http")) {
      return user.profilePic;
    }

    return `http://localhost:5000${user.profilePic}`;
  };

  // ==========================================
  // FETCH REQUESTS
  // ==========================================

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/connections/requests`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load connection requests."
        );
      }

      setRequests(
        data.requests ||
          data.connectionRequests ||
          []
      );
    } catch (err) {
      console.error(
        "Connection requests error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchRequests();
  }, []);

  // ==========================================
  // ACCEPT REQUEST
  // ==========================================

  const acceptRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/connections/${requestId}/accept`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to accept request."
        );
      }

      setRequests((previous) =>
        previous.filter(
          (request) =>
            (request._id || request.id) !==
            requestId
        )
      );

      setSuccess(
        "Connection request accepted."
      );
    } catch (err) {
      console.error(
        "Accept request error:",
        err
      );

      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // REJECT REQUEST
  // ==========================================

  const rejectRequest = async (requestId) => {
    try {
      setActionLoading(requestId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/connections/${requestId}/reject`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject request."
        );
      }

      setRequests((previous) =>
        previous.filter(
          (request) =>
            (request._id || request.id) !==
            requestId
        )
      );

      setSuccess(
        "Connection request rejected."
      );
    } catch (err) {
      console.error(
        "Reject request error:",
        err
      );

      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-xl shadow-sm p-10 text-center">

            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-500">
              Loading connection requests...
            </p>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-4xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-8">

          <Link
            to="/connections"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Network
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mt-3">
            Connection Requests
          </h1>

          <p className="text-gray-500 mt-1">
            Manage people who want to connect
            with you.
          </p>

        </div>

        {/* ================================= */}
        {/* ALERTS */}
        {/* ================================= */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5">
            {success}
          </div>
        )}

        {/* ================================= */}
        {/* REQUEST COUNT */}
        {/* ================================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">

          <p className="text-sm text-gray-500">
            Pending Requests
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-1">
            {requests.length}
          </p>

        </div>

        {/* ================================= */}
        {/* EMPTY STATE */}
        {/* ================================= */}

        {requests.length === 0 ? (

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">

            <div className="text-6xl mb-5">
              📩
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No pending requests
            </h2>

            <p className="text-gray-500 mt-2">
              You don't have any new connection
              requests right now.
            </p>

            <Link
              to="/connections"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
            >
              Discover People
            </Link>

          </div>

        ) : (

          /* ================================= */
          /* REQUEST LIST */
          /* ================================= */

          <div className="space-y-4">

            {requests.map((request) => {
              const requestId =
                request._id ||
                request.id;

              const user =
                getUser(request);

              const userId =
                getUserId(user);

              const image =
                getProfileImage(user);

              const isLoading =
                actionLoading ===
                requestId;

              return (
                <div
                  key={requestId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                    {/* USER */}

                    <div className="flex items-center gap-4">

                      {image ? (

                        <img
                          src={image}
                          alt={getUserName(user)}
                          className="w-16 h-16 rounded-full object-cover"
                        />

                      ) : (

                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                          {getUserName(user)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                      )}

                      <div>

                        <Link
                          to={`/profile/${userId}`}
                          className="text-lg font-bold text-gray-800 hover:text-blue-600"
                        >
                          {getUserName(user)}
                        </Link>

                        <p className="text-sm text-gray-500 mt-1">
                          {user?.email ||
                            "Professional"}
                        </p>

                        {user?.bio && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {user.bio}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex gap-3 sm:min-w-[230px]">

                      <button
                        onClick={() =>
                          acceptRequest(
                            requestId
                          )
                        }
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50"
                      >
                        {isLoading
                          ? "..."
                          : "Accept"}
                      </button>

                      <button
                        onClick={() =>
                          rejectRequest(
                            requestId
                          )
                        }
                        disabled={isLoading}
                        className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Reject
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default ConnectionRequests;