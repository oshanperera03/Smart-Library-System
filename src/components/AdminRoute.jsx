import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const AdminRoute = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <LoadingScreen message="Verifying admin access…" />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole !== 'admin') return <Navigate to="/student" replace />;

  return <Outlet />;
};

export default AdminRoute;
