import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
  userId: localStorage.getItem("userId") || null,
  userName: localStorage.getItem("userName") || "",
  userEmail: localStorage.getItem("userEmail") || "",
  userRole: localStorage.getItem("userRole") || "",
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      const { token, userId, userName, userEmail, userRole } =
        action.payload;

      state.token = token || null;
      state.userId = userId || null;
      state.userName = userName || "";
      state.userEmail = userEmail || "";
      state.userRole = userRole || "";

      if (token) {
        localStorage.setItem("token", token);
      }

      if (userId) {
        localStorage.setItem("userId", userId.toString());
      }

      if (userName) {
        localStorage.setItem("userName", userName);
      }

      if (userEmail) {
        localStorage.setItem("userEmail", userEmail);
      }

      if (userRole) {
        localStorage.setItem("userRole", userRole);
      }
    },

    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.userName = "";
      state.userEmail = "";
      state.userRole = "";

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;