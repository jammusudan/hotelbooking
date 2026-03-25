import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
        <div className="w-12 h-12 border-4 border-[#0B2D72]/20 border-t-[#0B2D72] rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to the appropriate login based on the intended route
    const path = location.pathname;
    if (path.startsWith('/manager')) return <Navigate to="/manager/login" replace />;
    if (path.startsWith('/admin')) return <Navigate to="/admin/login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Defensive check: if their true role is admin, but they are here, bounce to admin dash
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  // Double fail-safe: if the route is /admin but user is NOT admin (should be caught above, but just in case)
  if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
      return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
