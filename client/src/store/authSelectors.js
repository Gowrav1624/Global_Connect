export const selectAuth = (state) => state.auth;

export const selectToken = (state) =>
  state.auth.token;

export const selectUserId = (state) =>
  state.auth.userId;

export const selectUserName = (state) =>
  state.auth.userName;

export const selectUserEmail = (state) =>
  state.auth.userEmail;

export const selectUserRole = (state) =>
  state.auth.userRole;