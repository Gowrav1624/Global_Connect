import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { selectToken, selectUserId } from "../store/authSelectors";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

function Messages() {
  const token = useSelector(selectToken);
  const currentUserId = useSelector(selectUserId);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [connections, setConnections] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [loadingConnections, setLoadingConnections] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

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

  const getImageUrl = (image) => {
    if (!image) return null;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    return `${SOCKET_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  const getMessageSender = (message) => {
    return (
      message?.sender ||
      message?.senderId ||
      {}
    );
  };

  const getMessageReceiver = (message) => {
    return (
      message?.receiver ||
      message?.receiverId ||
      {}
    );
  };

  const isMyMessage = (message) => {
    const sender = getMessageSender(message);
    const senderId = getId(sender);

    return (
      senderId?.toString() ===
      currentUserId?.toString()
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
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

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
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
  // GET USER FROM CONNECTION
  // ==========================================

  const getConnectionUser = (connection) => {
    if (!connection) return null;

    const sender =
      connection.sender ||
      connection.requester;

    const receiver =
      connection.receiver ||
      connection.recipient;

    const senderId = getId(sender);
    const receiverId = getId(receiver);

    if (
      senderId &&
      senderId.toString() ===
        currentUserId?.toString()
    ) {
      return receiver;
    }

    if (
      receiverId &&
      receiverId.toString() ===
        currentUserId?.toString()
    ) {
      return sender;
    }

    if (connection.user) {
      return connection.user;
    }

    if (connection.connectedUser) {
      return connection.connectedUser;
    }

    return connection;
  };

  // ==========================================
  // FETCH CONNECTIONS
  // ==========================================

  const fetchConnections = async () => {
    try {
      setLoadingConnections(true);
      setError("");

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

      const list =
        data.connections ||
        data.data ||
        [];

      setConnections(list);

      if (list.length > 0) {
        const firstUser =
          getConnectionUser(list[0]);

        setSelectedUser(firstUser);
        selectedUserRef.current = firstUser;
      }
    } catch (err) {
      console.error(
        "Fetch connections error:",
        err
      );

      setError(err.message);
    } finally {
      setLoadingConnections(false);
    }
  };

  // ==========================================
  // FETCH MESSAGE HISTORY
  // ==========================================
  //
  // Guide endpoint:
  // GET /api/messages/:sender/:receiver
  //
  // ==========================================

  const fetchMessages = async (userId) => {
    if (!userId || !currentUserId) {
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");

      const response = await fetch(
        `${API_URL}/messages/${userId}`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load messages."
        );
      }

      setMessages(
        data.messages ||
          data.data ||
          []
      );
    } catch (err) {
      console.error(
        "Fetch messages error:",
        err
      );

      setError(err.message);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ==========================================
  // SELECT CONVERSATION
  // ==========================================

  const selectConversation = (user) => {
    const userId = getId(user);

    if (!userId) return;

    setSelectedUser(user);
    selectedUserRef.current = user;

    setMessages([]);
    setError("");
    setUnreadMessages((previous) => {
      const updated = { ...previous };
      delete updated[userId.toString()];
      return updated;
    });

    fetchMessages(userId);
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!token || !currentUserId) {
      setLoadingConnections(false);
      return;
    }

    fetchConnections();
  }, []);

  // ==========================================
  // SOCKET.IO
  // ==========================================

  useEffect(() => {
    if (!token || !currentUserId) {
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(
        "Connected to messaging server:",
        socket.id
      );

      socket.emit(
        "joinRoom",
        currentUserId
      );
    });

    socket.on(
      "receiveMessage",
      (message) => {
        if (!message) return;

        const sender =
          getMessageSender(message);

        const receiver =
          getMessageReceiver(message);

        const senderId =
          getId(sender) || sender;

        const receiverId =
          getId(receiver) || receiver;

        const selectedId =
          getId(
            selectedUserRef.current
          );

        const isCurrentConversation =
          selectedId &&
          (
            (
              senderId?.toString() ===
                selectedId.toString() &&
              receiverId?.toString() ===
                currentUserId.toString()
            ) ||
            (
              receiverId?.toString() ===
                selectedId.toString() &&
              senderId?.toString() ===
                currentUserId.toString()
            )
          );

        if (isCurrentConversation) {
          setMessages((previous) => {

            /*
             * Prevent duplicate messages if
             * the same message is already present.
             */

            const incomingId =
              getId(message);

            if (
              incomingId &&
              previous.some(
                (item) =>
                  getId(item)?.toString() ===
                  incomingId.toString()
              )
            ) {
              return previous;
            }

            return [
              ...previous,
              message,
            ];
          });
        } else {
          const incomingSenderId =
            senderId?.toString();

          if (incomingSenderId && incomingSenderId !== currentUserId?.toString()) {
            setUnreadMessages((previous) => ({
              ...previous,
              [incomingSenderId]:
                (previous[incomingSenderId] || 0) + 1,
            }));
          }
        }
      }
    );

    socket.on(
      "connect_error",
      (err) => {
        console.error(
          "Socket connection error:",
          err.message
        );
      }
    );

    socket.on("disconnect", () => {
      console.log(
        "Disconnected from messaging server"
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, currentUserId]);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  //
  // Guide endpoint:
  // POST /api/messages/
  //
  // Guide Message schema:
  // senderId
  // receiverId
  // content
  // timestamp
  //
  // ==========================================

  const sendMessage = async (e) => {
    e.preventDefault();

    const content = messageText.trim();
    const receiverId =
      getId(selectedUser);

    if (!content || !receiverId) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `${API_URL}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            receiver: receiverId,
            content,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send message."
        );
      }

      const savedMessage =
        data.data ||
        (data.message &&
        typeof data.message === "object"
          ? data.message
          : null);

      if (savedMessage) {
        setMessages((previous) => {

          const savedId =
            getId(savedMessage);

          if (
            savedId &&
            previous.some(
              (item) =>
                getId(item)?.toString() ===
                savedId.toString()
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            savedMessage,
          ];
        });
      } else {
        /*
         * Fallback for APIs that return only
         * success/message text.
         */

        setMessages((previous) => [
          ...previous,
          {
            _id: `local-${Date.now()}`,
            senderId: currentUserId,
            receiverId,
            content,
            timestamp:
              new Date().toISOString(),
          },
        ]);
      }

      setMessageText("");

      /*
       * Send real-time message through Socket.IO.
       */

      if (socketRef.current) {
        socketRef.current.emit(
          "sendMessage",
          {
            sender: currentUserId,
            receiver: receiverId,
            content,
          }
        );
      }
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // ENTER KEY
  // ==========================================

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  // ==========================================
  // CLEAR ERROR
  // ==========================================

  const clearError = () => {
    setError("");
  };

  // ==========================================
  // LOADING CONNECTIONS
  // ==========================================

  if (loadingConnections) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">

        <div className="max-w-6xl mx-auto">

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

            <div className="h-16 border-b border-gray-200 p-5">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="h-[650px] animate-pulse" />

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-6xl mx-auto">

        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <div className="mb-6">

          <h1 className="text-3xl font-bold text-gray-800">
            Messages
          </h1>

          <p className="text-gray-500 mt-1">
            Connect and communicate with your
            professional network.
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
              onClick={clearError}
              className="font-bold text-lg"
            >
              ×
            </button>

          </div>
        )}

        {/* ================================= */}
        {/* CHAT CONTAINER */}
        {/* ================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[680px]">

            {/* ================================= */}
            {/* CONNECTION LIST */}
            {/* ================================= */}

            <aside className="border-r border-gray-200 flex flex-col">

              <div className="p-5 border-b border-gray-200">

                <h2 className="font-bold text-gray-800">
                  Conversations
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {connections.length} connection
                  {connections.length === 1
                    ? ""
                    : "s"}
                </p>

              </div>

              <div className="flex-1 overflow-y-auto">

                {connections.length === 0 ? (

                  <div className="p-6 text-center">

                    <div className="text-4xl mb-3">
                      👥
                    </div>

                    <p className="font-semibold text-gray-700">
                      No connections yet
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Connect with people to start
                      messaging.
                    </p>

                    <Link
                      to="/connections"
                      className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Find Connections
                    </Link>

                  </div>

                ) : (

                  connections.map(
                    (connection, index) => {

                      const user =
                        getConnectionUser(
                          connection
                        );

                      const userId =
                        getId(user);

                      if (!userId) {
                        return null;
                      }

                      const image =
                        getImageUrl(
                          user?.profilePic
                        );

                      const selected =
                        getId(
                          selectedUser
                        )?.toString() ===
                        userId.toString();

                      return (
                        <button
                          type="button"
                          key={
                            getId(
                              connection
                            ) || index
                          }
                          onClick={() =>
                            selectConversation(
                              user
                            )
                          }
                          className={`w-full text-left p-4 border-b border-gray-100 flex items-center gap-3 transition ${
                            selected
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                        >

                          {image ? (

                            <img
                              src={image}
                              alt={getUserName(
                                user
                              )}
                              className="w-11 h-11 rounded-full object-cover shrink-0"
                            />

                          ) : (

                            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                              {getUserName(
                                user
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                          )}

                          <div className="min-w-0">

                            <p className="font-semibold text-gray-800 truncate">
                              {getUserName(
                                user
                              )}
                            </p>

                            <p className="text-xs text-gray-500 truncate mt-1">
                              {user.email ||
                                "Professional connection"}
                            </p>

                            {unreadMessages[userId.toString()] > 0 && (
                              <span className="inline-flex mt-1 bg-blue-600 text-white text-[10px] min-w-5 h-5 px-1.5 items-center justify-center rounded-full font-bold">
                                {unreadMessages[userId.toString()] > 99
                                  ? "99+"
                                  : unreadMessages[userId.toString()]}
                              </span>
                            )}

                          </div>

                        </button>
                      );
                    }
                  )

                )}

              </div>

            </aside>

            {/* ================================= */}
            {/* CHAT AREA */}
            {/* ================================= */}

            <main className="flex flex-col min-w-0">

              {!selectedUser ? (

                <div className="flex-1 flex items-center justify-center text-center p-8">

                  <div>

                    <div className="text-6xl mb-5">
                      💬
                    </div>

                    <h2 className="text-xl font-bold text-gray-800">
                      Select a conversation
                    </h2>

                    <p className="text-gray-500 mt-2 max-w-sm">
                      Choose one of your connections
                      to start a conversation.
                    </p>

                  </div>

                </div>

              ) : (

                <>

                  {/* ================================= */}
                  {/* CHAT HEADER */}
                  {/* ================================= */}

                  <div className="h-20 px-5 border-b border-gray-200 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      {getImageUrl(
                        selectedUser?.profilePic
                      ) ? (

                        <img
                          src={getImageUrl(
                            selectedUser?.profilePic
                          )}
                          alt={getUserName(
                            selectedUser
                          )}
                          className="w-11 h-11 rounded-full object-cover"
                        />

                      ) : (

                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {getUserName(
                            selectedUser
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                      )}

                      <div>

                        <Link
                          to={`/profile/${getId(
                            selectedUser
                          )}`}
                          className="font-bold text-gray-800 hover:text-blue-600"
                        >
                          {getUserName(
                            selectedUser
                          )}
                        </Link>

                        <p className="text-xs text-gray-500">
                          Professional connection
                        </p>

                      </div>

                    </div>

                    <Link
                      to={`/profile/${getId(
                        selectedUser
                      )}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Profile
                    </Link>

                  </div>

                  {/* ================================= */}
                  {/* MESSAGES */}
                  {/* ================================= */}

                  <div className="flex-1 overflow-y-auto p-5 bg-gray-50">

                    {loadingMessages ? (

                      <div className="h-full flex items-center justify-center">

                        <div className="text-center">

                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                          <p className="text-sm text-gray-500 mt-3">
                            Loading messages...
                          </p>

                        </div>

                      </div>

                    ) : messages.length === 0 ? (

                      <div className="h-full flex items-center justify-center text-center">

                        <div>

                          <div className="text-5xl mb-4">
                            👋
                          </div>

                          <h3 className="font-bold text-gray-800">
                            Start the conversation
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Send a message to{" "}
                            {getUserName(
                              selectedUser
                            )}
                            .
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div className="space-y-4">

                        {messages.map(
                          (message, index) => {

                            const mine =
                              isMyMessage(
                                message
                              );

                            const messageDate =
                              message.timestamp ||
                              message.createdAt;

                            return (
                              <div
                                key={
                                  getId(
                                    message
                                  ) ||
                                  `${index}-${messageDate}`
                                }
                                className={`flex ${
                                  mine
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >

                                <div
                                  className={`max-w-[75%] ${
                                    mine
                                      ? "items-end"
                                      : "items-start"
                                  } flex flex-col`}
                                >

                                  <div
                                    className={`px-4 py-3 rounded-2xl ${
                                      mine
                                        ? "bg-blue-600 text-white rounded-br-md"
                                        : "bg-white text-gray-700 border border-gray-200 rounded-bl-md"
                                    }`}
                                  >

                                    <p className="whitespace-pre-wrap break-words">
                                      {message.content ||
                                        message.text ||
                                        message.message ||
                                        ""}
                                    </p>

                                  </div>

                                  <span className="text-[11px] text-gray-400 mt-1 px-1">
                                    {formatTime(
                                      messageDate
                                    )}
                                  </span>

                                </div>

                              </div>
                            );
                          }
                        )}

                        <div
                          ref={
                            messagesEndRef
                          }
                        />

                      </div>

                    )}

                  </div>

                  {/* ================================= */}
                  {/* MESSAGE INPUT */}
                  {/* ================================= */}

                  <form
                    onSubmit={sendMessage}
                    className="p-4 border-t border-gray-200 bg-white"
                  >

                    <div className="flex gap-3">

                      <textarea
                        value={messageText}
                        onChange={(e) =>
                          setMessageText(
                            e.target.value
                          )
                        }
                        onKeyDown={
                          handleKeyDown
                        }
                        rows={2}
                        placeholder={`Message ${getUserName(
                          selectedUser
                        )}...`}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        type="submit"
                        disabled={
                          sending ||
                          !messageText.trim()
                        }
                        className="self-end bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-semibold"
                      >
                        {sending
                          ? "..."
                          : "Send"}
                      </button>

                    </div>

                    <p className="text-[11px] text-gray-400 mt-2">
                      Press Enter to send • Shift
                      + Enter for a new line
                    </p>

                  </form>

                </>

              )}

            </main>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Messages;