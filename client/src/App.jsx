import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Connections from "./pages/Connections";
import Search from "./pages/Search";
import ConnectionRequests from "./pages/ConnectionRequests";
import Feed from "./pages/Feed";
import Jobs from "./pages/Jobs";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Admin from "./pages/Admin";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================================= */}
        {/* PUBLIC ROUTES */}
        {/* ================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* ================================= */}
        {/* PROTECTED ROUTES */}
        {/* ================================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={
              <>
                <Navbar />
                <Dashboard />
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <>
                <Navbar />
                <Profile />
              </>
            }
          />

          <Route
            path="/profile/:id"
            element={
              <>
                <Navbar />
                <Profile />
              </>
            }
          />

          <Route
            path="/connections"
            element={
              <>
                <Navbar />
                <Connections />
              </>
            }
          />

          <Route
            path="/connection-requests"
            element={
              <>
                <Navbar />
                <ConnectionRequests />
              </>
            }
          />

          <Route
            path="/search"
            element={
              <>
                <Navbar />
                <Search />
              </>
            }
          />

          <Route
            path="/feed"
            element={
              <>
                <Navbar />
                <Feed />
              </>
            }
          />

          <Route
            path="/jobs"
            element={
              <>
                <Navbar />
                <Jobs />
              </>
            }
          />

          <Route
            path="/messages"
            element={
              <>
                <Navbar />
                <Messages />
              </>
            }
          />

          <Route
            path="/notifications"
            element={
              <>
                <Navbar />
                <Notifications />
              </>
            }
          />

          <Route
            path="/admin"
            element={
              <>
                <Navbar />
                <Admin />
              </>
            }
          />

        </Route>

        {/* ================================= */}
        {/* DEFAULT ROUTES */}
        {/* ================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;