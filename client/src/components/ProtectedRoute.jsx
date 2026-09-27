import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectToken,
  selectUserId,
} from "../store/authSelectors";

function ProtectedRoute() {
  const location = useLocation();

  const token = useSelector(selectToken);
  const userId = useSelector(selectUserId);

  // User is not authenticated
  if (!token || !userId) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // User is authenticated
  return <Outlet />;
}

export default ProtectedRoute;