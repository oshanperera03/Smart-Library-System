import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingScreen message="Checking access permissions…" />;
  if (!currentUser) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
