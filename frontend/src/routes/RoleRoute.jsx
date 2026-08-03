import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';

/**
 * RoleRoute — allows only users with specified roles
 * Redirects to home if role doesn't match
 */
const RoleRoute = ({ children, roles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
