import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsInitializing } from '../features/auth/authSlice';

/**
 * ProtectedRoute — redirects unauthenticated users to login
 * Preserves the intended destination in location state
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);
  const location = useLocation();

  // While checking auth state (initial app load), show nothing
  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
