import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDF7BD]">
        <div className="w-12 h-12 border-4 border-[#0B2D72]/20 border-t-[#0B2D72] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    // Redirect logged-in users to their respective dashboards
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
