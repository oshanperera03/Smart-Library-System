import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const StudentRoute = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <LoadingScreen message="Preparing student workspace…" />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userRole !== 'student') return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
};

export default StudentRoute;
