import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

/**
 * UserRoute — protects routes that only regular users (role="user") can access.
 *
 * Access rules:
 *  - No token or role cookie  → redirect to /login
 *  - role === "admin"         → redirect to /dashboard  (admins belong there)
 *  - role === "user"          → render children (or nested <Outlet />)
 *
 * NOTE: This component reads cookies synchronously so there is no loading flash
 * on page refresh — the user stays on their current page.
 */
const UserRoute = ({ children }) => {
  const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
  const role = Cookies.get(import.meta.env.VITE_USER_ROLE);

  // Guest — not authenticated at all
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated admin should not access user-only pages
  if (role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Authenticated user — render the protected content
  return children ? children : <Outlet />;
};

UserRoute.propTypes = {
  children: PropTypes.node,
};

export default UserRoute;
