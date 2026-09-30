import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { API_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear old messages while typing.
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    const email = form.email.trim();
    const password = form.password;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      // ==========================================
      // SAFE RESPONSE PARSING
      // ==========================================

      let data = {};

      const contentType =
        response.headers.get("content-type") || "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          message: text || "",
        };
      }

      console.log("Login response:", {
        status: response.status,
        ok: response.ok,
        data,
      });

      // ==========================================
      // BACKEND ERROR
      // ==========================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Login failed (${response.status}).`
        );
      }

      // ==========================================
      // GET TOKEN
      // ==========================================

      const token =
        data.token ||
        data.accessToken ||
        data.user?.token ||
        data.data?.token ||
        data.data?.accessToken;

      // ==========================================
      // GET USER
      // ==========================================

      const user =
        data.user ||
        data.data?.user ||
        data.data ||
        null;

      if (!token) {
        throw new Error(
          "Login succeeded but no authentication token was returned by the server."
        );
      }

      // ==========================================
      // GET USER ID
      // ==========================================

      const userId =
        user?._id ||
        user?.id ||
        data.userId ||
        data.data?.userId;

      if (!userId) {
        console.error(
          "Login succeeded but user ID was not found:",
          data
        );

        throw new Error(
          "Login succeeded but the user ID was not returned by the server."
        );
      }

      // ==========================================
      // CLEAR OLD AUTH DATA
      // ==========================================

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");

      // ==========================================
      // SAVE NEW AUTH DATA
      // ==========================================

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "userId",
        userId.toString()
      );

      if (user?.name) {
        localStorage.setItem(
          "userName",
          user.name
        );
      }

      if (user?.email) {
        localStorage.setItem(
          "userEmail",
          user.email
        );
      } else {
        localStorage.setItem(
          "userEmail",
          email
        );
      }

      if (user?.role) {
        localStorage.setItem(
          "userRole",
          user.role
        );
      }

      // ==========================================
      // SAVE AUTH DATA TO REDUX
      // ==========================================

      dispatch(
        setCredentials({
          token,
          userId,
          userName: user?.name || "",
          userEmail: user?.email || email,
          userRole: user?.role || "",
        })
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      setSuccess(
        "Login successful. Redirecting..."
      );

      // Small delay so the success message
      // can be displayed before navigation.
      setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
        });
      }, 300);
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      // Network/server unavailable
      if (
        err instanceof TypeError &&
        err.message.toLowerCase().includes(
          "fetch"
        )
      ) {
        setError(
          "Unable to connect to the server. Make sure the backend is running on port 5000."
        );
      } else {
        setError(
          err.message ||
            "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = () => {
    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    window.location.href =
      `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* ================================= */}
        {/* BRAND */}
        {/* ================================= */}

        <div className="text-center mb-6">

          <h1 className="text-4xl font-bold text-blue-600">
            Global_Connect
          </h1>

          <p className="text-gray-500 mt-2">
            Connect. Network. Grow.
          </p>

        </div>

        {/* ================================= */}
        {/* LOGIN CARD */}
        {/* ================================= */}

        <div className="bg-white rounded-xl shadow-lg p-7">

          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Welcome Back
          </h2>

          <p className="text-gray-500 text-center mt-1 mb-6">
            Login to your professional network.
          </p>

          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm flex items-start justify-between gap-3"
            >
              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="font-bold text-lg leading-none hover:text-red-900"
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          )}

          {/* ================================= */}
          {/* SUCCESS */}
          {/* ================================= */}

          {success && (
            <div
              role="status"
              className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm"
            >
              {success}
            </div>
          )}

          {/* ================================= */}
          {/* FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Email
              </label>

              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <div className="flex items-center justify-between mb-1">

                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot Password?
                </Link>

              </div>

              <input
                id="login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />

            </div>

            {/* LOGIN */}

            <button
              type="submit"
              disabled={
                loading ||
                !form.email.trim() ||
                !form.password
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* ================================= */}
          {/* DIVIDER */}
          {/* ================================= */}

          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-px bg-gray-200" />

            <span className="text-sm text-gray-400">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-200" />

          </div>

          {/* ================================= */}
          {/* GOOGLE LOGIN */}
          {/* ================================= */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-3"
          >

            <span className="text-lg font-bold">
              G
            </span>

            Continue with Google

          </button>

          {/* ================================= */}
          {/* REGISTER */}
          {/* ================================= */}

          <div className="text-center mt-6 pt-5 border-t border-gray-200">

            <p className="text-gray-500 text-sm">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="inline-block mt-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Create an account
            </Link>

          </div>

        </div>

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()}{" "}
          Global_Connect
        </p>
        

      </div>

    </div>
  );
}

export default Login;