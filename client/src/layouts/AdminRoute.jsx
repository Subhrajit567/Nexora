import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

/**
 * AdminRoute — protects routes that only admins (role="admin") can access.
 *
 * Access rules:
 *  - No token or role cookie  → redirect to /login
 *  - role === "user"          → redirect to /profile  (users belong there)
 *  - role === "admin"         → render children (or nested <Outlet />)
 *
 * NOTE: This component reads cookies synchronously so there is no loading flash
 * on page refresh — the admin stays on their current dashboard page.
 */
const AdminRoute = ({ children }) => {
  const token = Cookies.get(import.meta.env.VITE_TOKEN_KEY);
  const role = Cookies.get(import.meta.env.VITE_USER_ROLE);

  // Guest — not authenticated at all
  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated user should not access admin-only pages
  if (role === "user") {
    return <Navigate to="/profile" replace />;
  }

  // Authenticated admin — render the protected content
  return children ? children : <Outlet />;
};

AdminRoute.propTypes = {
  children: PropTypes.node,
};

export default AdminRoute;
