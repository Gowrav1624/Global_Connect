import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken, selectUserId } from "../store/authSelectors";

const API_URL = "http://localhost:5000/api";

function Connections() {
  const token = useSelector(selectToken);
  const currentUserId = useSelector(selectUserId);

  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ==========================================
  // GET USER ID
  // ==========================================

  const getUserId = (user) => {
    return user?._id || user?.id;
  };

  // ==========================================
  // GET USER NAME
  // ==========================================

  const getUserName = (user) => {
    return user?.name || "Unknown User";
  };

  // ==========================================
  // GET PROFILE IMAGE
  // ==========================================

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
  // FETCH CONNECTIONS
  // ==========================================

  const fetchConnections = async () => {
    try {
      const response = await fetch(
        `${API_URL}/connections`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load connections."
        );
      }

      setConnections(
        data.connections || []
      );
    } catch (err) {
      console.error(
        "Connections error:",
        err
      );

      setError(err.message);
    }
  };

  // ==========================================
  // FETCH USER SUGGESTIONS
  // ==========================================

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(
        `${API_URL}/users`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load users."
        );
      }

      const users =
        data.users ||
        data.data ||
        [];

      const connectionIds =
        connections.map(
          (connection) =>
            getUserId(
              connection.user ||
                connection
            )
        );

      const filteredUsers =
        users.filter((user) => {
          const id = getUserId(user);

          return (
            id &&
            id !== currentUserId &&
            !connectionIds.includes(id)
          );
        });

      setSuggestions(
        filteredUsers.slice(0, 12)
      );
    } catch (err) {
      console.error(
        "Suggestions error:",
        err
      );
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await fetchConnections();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchSuggestions();
    }
  }, [connections, loading]);

  // ==========================================
  // SEND CONNECTION REQUEST
  // ==========================================

  const sendRequest = async (receiverId) => {
    try {
      setActionLoading(receiverId);
      setError("");
      setSuccess("");

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

      setSuccess(
        "Connection request sent successfully."
      );

      setSuggestions((previous) =>
        previous.filter(
          (user) =>
            getUserId(user) !== receiverId
        )
      );
    } catch (err) {
      console.error(
        "Send request error:",
        err
      );

      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // REMOVE CONNECTION
  // ==========================================

  const removeConnection = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this connection?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/connections/${userId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove connection."
        );
      }

      setConnections((previous) =>
        previous.filter((connection) => {
          const user =
            connection.user ||
            connection;

          return (
            getUserId(user) !== userId
          );
        })
      );

      setSuccess(
        "Connection removed successfully."
      );
    } catch (err) {
      console.error(
        "Remove connection error:",
        err
      );

      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // CLEAR MESSAGES
  // ==========================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">

          <div className="bg-white rounded-xl shadow p-10 text-center">

            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-500">
              Loading your network...
            </p>

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

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-800">
            My Network
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your professional connections
            and discover new people.
          </p>

        </div>

        {/* ================================= */}
        {/* ALERTS */}
        {/* ================================= */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex justify-between items-center">

            <span>{error}</span>

            <button
              onClick={clearMessages}
              className="font-bold"
            >
              ×
            </button>

          </div>
        )}

        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 flex justify-between items-center">

            <span>{success}</span>

            <button
              onClick={clearMessages}
              className="font-bold"
            >
              ×
            </button>

          </div>
        )}

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              Connections
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-1">
              {connections.length}
            </p>

          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">

            <p className="text-sm text-gray-500">
              People You May Know
            </p>

            <p className="text-3xl font-bold text-purple-600 mt-1">
              {suggestions.length}
            </p>

          </div>

        </div>

        {/* ================================= */}
        {/* MY CONNECTIONS */}
        {/* ================================= */}

        <section className="mb-10">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                My Connections
              </h2>

              <p className="text-sm text-gray-500">
                People in your professional network
              </p>
            </div>

            <Link
              to="/connection-requests"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View Requests →
            </Link>

          </div>

          {connections.length === 0 ? (

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">

              <div className="text-5xl mb-4">
                🤝
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No connections yet
              </h3>

              <p className="text-gray-500 mt-1">
                Start building your professional
                network by connecting with people.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {connections.map((connection) => {

                const person =
                  connection.user ||
                  connection.sender ||
                  connection.receiver ||
                  connection;

                const personId =
                  getUserId(person);

                const image =
                  getProfileImage(person);

                return (
                  <div
                    key={personId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                  >

                    <div className="flex items-center gap-4">

                      {image ? (

                        <img
                          src={image}
                          alt={getUserName(person)}
                          className="w-14 h-14 rounded-full object-cover"
                        />

                      ) : (

                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                          {getUserName(person)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                      )}

                      <div className="min-w-0">

                        <Link
                          to={`/profile/${personId}`}
                          className="font-bold text-gray-800 hover:text-blue-600 truncate block"
                        >
                          {getUserName(person)}
                        </Link>

                        <p className="text-sm text-gray-500 truncate">
                          {person?.email ||
                            "Professional"}
                        </p>

                      </div>

                    </div>

                    <div className="flex gap-2 mt-5">

                      <Link
                        to={`/profile/${personId}`}
                        className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold"
                      >
                        View Profile
                      </Link>

                      <button
                        onClick={() =>
                          removeConnection(
                            personId
                          )
                        }
                        disabled={
                          actionLoading ===
                          personId
                        }
                        className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {actionLoading ===
                        personId
                          ? "..."
                          : "Remove"}
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

        {/* ================================= */}
        {/* SUGGESTIONS */}
        {/* ================================= */}

        <section>

          <div className="mb-4">

            <h2 className="text-xl font-bold text-gray-800">
              People You May Know
            </h2>

            <p className="text-sm text-gray-500">
              Discover professionals and expand
              your network.
            </p>

          </div>

          {suggestions.length === 0 ? (

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">

              <div className="text-5xl mb-4">
                🔎
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No suggestions available
              </h3>

              <p className="text-gray-500 mt-1">
                Try searching for professionals
                using the Search page.
              </p>

              <Link
                to="/search"
                className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Search People
              </Link>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {suggestions.map((person) => {

                const personId =
                  getUserId(person);

                const image =
                  getProfileImage(person);

                return (
                  <div
                    key={personId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                  >

                    <div className="flex items-center gap-4">

                      {image ? (

                        <img
                          src={image}
                          alt={getUserName(person)}
                          className="w-14 h-14 rounded-full object-cover"
                        />

                      ) : (

                        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-bold">
                          {getUserName(person)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                      )}

                      <div className="min-w-0">

                        <Link
                          to={`/profile/${personId}`}
                          className="font-bold text-gray-800 hover:text-blue-600 truncate block"
                        >
                          {getUserName(person)}
                        </Link>

                        <p className="text-sm text-gray-500 truncate">
                          {person?.bio ||
                            person?.email ||
                            "Professional"}
                        </p>

                      </div>

                    </div>

                    <div className="flex gap-2 mt-5">

                      <Link
                        to={`/profile/${personId}`}
                        className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg py-2 text-sm font-semibold"
                      >
                        View
                      </Link>

                      <button
                        onClick={() =>
                          sendRequest(
                            personId
                          )
                        }
                        disabled={
                          actionLoading ===
                          personId
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
                      >
                        {actionLoading ===
                        personId
                          ? "Sending..."
                          : "Connect"}
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default Connections;