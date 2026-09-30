import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { selectToken, selectUserId } from "../store/authSelectors";

import { API_URL, SOCKET_URL } from "../config";
function Notifications() {
  const token = useSelector(selectToken);
  const currentUserId = useSelector(selectUserId);

  const socketRef = useRef(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [markingAll, setMarkingAll] =
    useState(false);

  const [markingId, setMarkingId] =
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

  const getSender = (notification) => {
    return (
      notification?.sender ||
      null
    );
  };

  const getSenderName = (notification) => {
    const sender =
      getSender(notification);

    if (sender?.name) {
      return sender.name;
    }

    return "Someone";
  };

  const getSenderImage = (notification) => {
    const sender =
      getSender(notification);

    if (!sender?.profilePic) {
      return null;
    }

    if (
      sender.profilePic.startsWith(
        "http://"
      ) ||
      sender.profilePic.startsWith(
        "https://"
      )
    ) {
      return sender.profilePic;
    }

    return `${SOCKET_URL}${
      sender.profilePic.startsWith("/")
        ? ""
        : "/"
    }${sender.profilePic}`;
  };

  const getNotificationIcon = (
    type
  ) => {
    switch (type) {
      case "connection":
      case "connection_request":
        return "👥";

      case "message":
        return "💬";

      case "job":
      case "job_update":
        return "💼";

      case "like":
        return "❤️";

      case "comment":
        return "💭";

      case "post":
        return "📝";

      default:
        return "🔔";
    }
  };

  const getNotificationColor = (
    type
  ) => {
    switch (type) {
      case "connection":
      case "connection_request":
        return "bg-blue-100 text-blue-600";

      case "message":
        return "bg-purple-100 text-purple-600";

      case "job":
      case "job_update":
        return "bg-green-100 text-green-600";

      case "like":
        return "bg-red-100 text-red-600";

      case "comment":
        return "bg-yellow-100 text-yellow-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
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

  const formatTime = (date) => {
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

    return parsedDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const formatNotificationText = (
    notification
  ) => {
    if (notification?.message) {
      return notification.message;
    }

    switch (notification?.type) {
      case "connection":
      case "connection_request":
        return `${getSenderName(
          notification
        )} sent you a connection request.`;

      case "message":
        return `${getSenderName(
          notification
        )} sent you a message.`;

      case "like":
        return `${getSenderName(
          notification
        )} liked your post.`;

      case "comment":
        return `${getSenderName(
          notification
        )} commented on your post.`;

      case "job":
      case "job_update":
        return "There is an update related to a job.";

      default:
        return "You have a new notification.";
    }
  };

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/notifications`,
            {
              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load notifications."
          );
        }

        setNotifications(
          data.notifications ||
            data.data ||
            []
        );
      } catch (err) {
        console.error(
          "Fetch notifications error:",
          err
        );

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!token || !currentUserId) {
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, []);

  // ==========================================
  // SOCKET.IO
  // ==========================================

  useEffect(() => {
    if (!token || !currentUserId) {
      return;
    }

    const socket = io(
      SOCKET_URL,
      {
        transports: ["websocket"],
      }
    );

    socketRef.current = socket;

    socket.on(
      "connect",
      () => {
        console.log(
          "Connected to notification server:",
          socket.id
        );

        socket.emit(
          "joinRoom",
          currentUserId
        );
      }
    );

    socket.on(
      "newNotification",
      (data) => {
        if (!data) return;

        /*
         * Backend normally sends:
         *
         * {
         *   notification: {...}
         * }
         *
         * But the message socket may send
         * a direct notification object.
         */

        const incoming =
          data.notification ||
          data;

        if (
          !incoming ||
          typeof incoming !==
            "object"
        ) {
          return;
        }

        setNotifications(
          (previous) => {
            const incomingId =
              getId(incoming);

            /*
             * Prevent duplicate
             * notifications.
             */

            if (
              incomingId &&
              previous.some(
                (item) =>
                  getId(
                    item
                  )?.toString() ===
                  incomingId.toString()
              )
            ) {
              return previous;
            }

            return [
              incoming,
              ...previous,
            ];
          }
        );
      }
    );

    socket.on(
      "connect_error",
      (err) => {
        console.error(
          "Notification socket error:",
          err.message
        );
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "Disconnected from notification server"
        );
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    token,
    currentUserId,
  ]);

  // ==========================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==========================================

  const markAsRead = async (
    notificationId
  ) => {
    if (!notificationId) {
      return;
    }

    try {
      setMarkingId(
        notificationId
      );
      setError("");

      const response =
        await fetch(
          `${API_URL}/notifications/${notificationId}/read`,
          {
            method: "PUT",
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read."
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              getId(
                notification
              )?.toString() ===
              notificationId.toString()
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification
          )
      );
    } catch (err) {
      console.error(
        "Mark notification read error:",
        err
      );

      setError(err.message);
    } finally {
      setMarkingId(null);
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead =
    async () => {
      try {
        setMarkingAll(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/notifications/read-all`,
            {
              method: "PUT",
              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to mark all notifications as read."
          );
        }

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );
      } catch (err) {
        console.error(
          "Mark all notifications error:",
          err
        );

        setError(err.message);
      } finally {
        setMarkingAll(false);
      }
    };

  // ==========================================
  // COUNTS
  // ==========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">

        <div className="max-w-5xl mx-auto">

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

            <div className="p-6 border-b border-gray-200">

              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />

              <div className="h-4 w-72 bg-gray-200 rounded mt-3 animate-pulse" />

            </div>

            <div className="p-5 space-y-4">

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
                  >

                    <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />

                    <div className="flex-1">

                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />

                      <div className="h-3 w-1/3 bg-gray-200 rounded mt-2 animate-pulse" />

                    </div>

                  </div>
                )
              )}

            </div>

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

      <div className="max-w-5xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-gray-200">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <div className="flex items-center gap-3">

                  <h1 className="text-3xl font-bold text-gray-800">
                    Notifications
                  </h1>

                  {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}

                </div>

                <p className="text-gray-500 mt-1">
                  Stay updated with your
                  professional network.
                </p>

              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={
                    markAllAsRead
                  }
                  disabled={
                    markingAll
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
                >
                  {markingAll
                    ? "Marking..."
                    : "Mark All as Read"}
                </button>
              )}

            </div>

          </div>

          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <div className="mx-5 mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center justify-between">

              <span>
                {error}
              </span>

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
          {/* NOTIFICATION LIST */}
          {/* ================================= */}

          <div className="p-5">

            {notifications.length ===
            0 ? (

              <div className="py-20 text-center">

                <div className="text-6xl mb-5">
                  🔔
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  No notifications
                </h2>

                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  You're all caught up.
                  New connection requests,
                  messages, and updates will
                  appear here.
                </p>

                <Link
                  to="/connections"
                  className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
                >
                  Explore Network
                </Link>

              </div>

            ) : (

              <div className="space-y-3">

                {notifications.map(
                  (
                    notification,
                    index
                  ) => {

                    const notificationId =
                      getId(
                        notification
                      );

                    const senderImage =
                      getSenderImage(
                        notification
                      );

                    const sender =
                      getSender(
                        notification
                      );

                    const senderId =
                      getId(sender);

                    const icon =
                      getNotificationIcon(
                        notification.type
                      );

                    const iconColor =
                      getNotificationColor(
                        notification.type
                      );

                    const isUnread =
                      !notification.isRead;

                    const createdAt =
                      notification.createdAt ||
                      notification.timestamp;

                    return (
                      <div
                        key={
                          notificationId ||
                          `${index}-${createdAt}`
                        }
                        className={`relative rounded-xl border transition ${
                          isUnread
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200"
                        }`}
                      >

                        {/* UNREAD INDICATOR */}

                        {isUnread && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl" />
                        )}

                        <div className="p-4 md:p-5">

                          <div className="flex items-start gap-4">

                            {/* SENDER IMAGE / ICON */}

                            <div className="shrink-0">

                              {senderImage ? (

                                <img
                                  src={
                                    senderImage
                                  }
                                  alt={
                                    getSenderName(
                                      notification
                                    )
                                  }
                                  className="w-12 h-12 rounded-full object-cover"
                                />

                              ) : (

                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${iconColor}`}
                                >
                                  {icon}
                                </div>

                              )}

                            </div>

                            {/* CONTENT */}

                            <div className="flex-1 min-w-0">

                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">

                                <div>

                                  <p
                                    className={`text-sm leading-6 ${
                                      isUnread
                                        ? "font-semibold text-gray-800"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {formatNotificationText(
                                      notification
                                    )}
                                  </p>

                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatDate(
                                      createdAt
                                    )}{" "}
                                    •{" "}
                                    {formatTime(
                                      createdAt
                                    )}
                                  </p>

                                </div>

                                {isUnread && (
                                  <span className="shrink-0 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    New
                                  </span>
                                )}

                              </div>

                              {/* ACTIONS */}

                              <div className="flex flex-wrap items-center gap-3 mt-3">

                                {senderId && (
                                  <Link
                                    to={`/profile/${senderId}`}
                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                  >
                                    View Profile
                                  </Link>
                                )}

                                {notification.type ===
                                  "message" && (
                                  <Link
                                    to="/messages"
                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                  >
                                    Open Messages
                                  </Link>
                                )}

                                {notification.type ===
                                  "connection_request" && (
                                  <Link
                                    to="/connection-requests"
                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                  >
                                    View Requests
                                  </Link>
                                )}

                                {isUnread &&
                                  notificationId && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        markAsRead(
                                          notificationId
                                        )
                                      }
                                      disabled={
                                        markingId ===
                                        notificationId
                                      }
                                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:text-gray-300"
                                    >
                                      {markingId ===
                                      notificationId
                                        ? "Marking..."
                                        : "Mark as read"}
                                    </button>
                                  )}

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Notifications;