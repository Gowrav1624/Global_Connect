export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://global-connect-backend-2uub.onrender.com/api");

export const SERVER_URL = API_URL.replace(/\/api$/, "");

export const SOCKET_URL = SERVER_URL;