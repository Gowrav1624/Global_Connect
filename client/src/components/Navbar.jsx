import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import {
  selectToken,
  selectUserId,
  selectUserName,
  selectUserRole,
} from "../store/authSelectors";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ==========================================
  // REDUX AUTH STATE
  // ==========================================

  const token = useSelector(selectToken);
  const userId = useSelector(selectUserId);
  const userName = useSelector(selectUserName);
  const userRole = useSelector(selectUserRole);

  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ==========================================
  // FETCH CURRENT USER
  // ==========================================

  const fetchUser = async () => {
    if (!token || !userId) return;

    try {
      const response = await fetch(
        `${API_URL}/users/${userId}`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) return;

      setUser(data.user || data.profile);
    } catch (error) {
      console.error(
        "Navbar user error:",
        error
      );
    }
  };

  // ==========================================
  // FETCH UNREAD NOTIFICATIONS
  // ==========================================

  const fetchUnreadNotifications = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/notifications`,
        {
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) return;

      const notifications =
        data.notifications || [];

      const unread =
        notifications.filter(
          (notification) =>
            !notification.isRead
        ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Navbar notifications error:",
        error
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!token || !userId) return;

    fetchUser();
    fetchUnreadNotifications();
  }, [token, userId]);

  // ==========================================
  // REAL-TIME NOTIFICATIONS
  // ==========================================

  useEffect(() => {
    if (!token || !userId) return;

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      socket.emit("joinRoom", userId);
    });

    socket.on(
      "newNotification",
      (data) => {
        if (!data?.notification) return;

        setUnreadCount(
          (previous) => previous + 1
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [token, userId]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    // Redux logout
    dispatch(logout());

    // Keep localStorage cleanup as a safety backup
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    setUser(null);

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================
  // NAVIGATION STYLE
  // ==========================================

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-blue-100 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg font-medium ${
      isActive
        ? "bg-blue-100 text-blue-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  // ==========================================
  // PROFILE IMAGE
  // ==========================================

  const getProfileImage = () => {
    if (!user?.profilePic) {
      return null;
    }

    if (user.profilePic.startsWith("http")) {
      return user.profilePic;
    }

    return `http://localhost:5000${user.profilePic}`;
  };

  const profileImage =
    getProfileImage();

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!token) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">

      <div className="max-w-7xl mx-auto px-4">

        {/* ================================= */}
        {/* DESKTOP / MAIN BAR */}
        {/* ================================= */}

        <div className="h-16 flex items-center justify-between">

          {/* LOGO */}

          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            onClick={() =>
              setMobileOpen(false)
            }
          >

            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              GC
            </div>

            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              Global_
              <span className="text-blue-600">
                Connect
              </span>
            </span>

          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden lg:flex items-center gap-1">

            <NavLink
              to="/dashboard"
              className={navClass}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/feed"
              className={navClass}
            >
              Feed
            </NavLink>

            <NavLink
              to="/connections"
              className={navClass}
            >
              Network
            </NavLink>

            <NavLink
              to="/search"
              className={navClass}
            >
              Search
            </NavLink>

            <NavLink
              to="/jobs"
              className={navClass}
            >
              Jobs
            </NavLink>

            <NavLink
              to="/messages"
              className={navClass}
            >
              Messages
            </NavLink>

            <NavLink
              to="/notifications"
              className={navClass}
            >
              <span className="relative">
                Notifications

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </span>
            </NavLink>

          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-2">

            {/* PROFILE */}

            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100"
            >

              {profileImage ? (

                <img
                  src={profileImage}
                  alt={user?.name || "Profile"}
                  className="w-9 h-9 rounded-full object-cover"
                />

              ) : (

                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                  {(user?.name || userName || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

              )}

              <span className="hidden xl:block text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                {user?.name ||
                  userName ||
                  "Profile"}
              </span>

            </Link>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="hidden lg:block border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold"
            >
              Logout
            </button>

            {/* MOBILE MENU BUTTON */}

            <button
              onClick={() =>
                setMobileOpen(
                  (previous) => !previous
                )
              }
              className="lg:hidden w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <span className="text-2xl">
                  ×
                </span>
              ) : (
                <span className="text-2xl">
                  ☰
                </span>
              )}
            </button>

          </div>

        </div>

        {/* ================================= */}
        {/* MOBILE NAVIGATION */}
        {/* ================================= */}

        {mobileOpen && (

          <div className="lg:hidden border-t border-gray-200 py-4">

            <nav className="space-y-1">

              <NavLink
                to="/dashboard"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                🏠 Dashboard
              </NavLink>

              <NavLink
                to="/profile"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                👤 Profile
              </NavLink>

              <NavLink
                to="/feed"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                📝 Feed
              </NavLink>

              <NavLink
                to="/connections"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                🤝 Network
              </NavLink>

              <NavLink
                to="/connection-requests"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                📩 Connection Requests
              </NavLink>

              <NavLink
                to="/search"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                🔍 Search
              </NavLink>

              <NavLink
                to="/jobs"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                💼 Jobs
              </NavLink>

              <NavLink
                to="/messages"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                💬 Messages
              </NavLink>

              <NavLink
                to="/notifications"
                className={
                  mobileNavClass
                }
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                🔔 Notifications

                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full items-center justify-center">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </NavLink>

              {user?.role === "admin" ||
              userRole === "admin" ? (

                <NavLink
                  to="/admin"
                  className={
                    mobileNavClass
                  }
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  🛡️ Admin Panel
                </NavLink>

              ) : null}

            </nav>

            {/* MOBILE PROFILE */}

            <div className="border-t border-gray-200 mt-4 pt-4">

              <Link
                to="/profile"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex items-center gap-3 px-4 py-3"
              >

                {profileImage ? (

                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />

                ) : (

                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {(user?.name || userName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                )}

                <div>

                  <p className="font-semibold text-gray-800">
                    {user?.name ||
                      userName ||
                      "Profile"}
                  </p>

                  <p className="text-xs text-gray-500">
                    View profile
                  </p>

                </div>

              </Link>

              {/* MOBILE LOGOUT */}

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-lg"
              >
                🚪 Logout
              </button>

            </div>

          </div>

        )}

      </div>

    </header>
  );
}

export default Navbar;