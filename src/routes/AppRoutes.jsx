import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import StudentRoute from '../components/StudentRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import StudentHomePage from '../pages/StudentHomePage';
import DashboardPage from '../pages/DashboardPage';
import AdminSeatsPage from '../pages/AdminSeatsPage';
import AdminStudentsPage from '../pages/AdminStudentsPage';
import AdminRfidLogsPage from '../pages/AdminRfidLogsPage';
import SettingsPage from '../pages/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/settings" element={<SettingsPage />} />
        <Route element={<StudentRoute />}>
          <Route path="/student" element={<StudentHomePage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/seats" element={<AdminSeatsPage />} />
          <Route path="/admin/students" element={<AdminStudentsPage />} />
          <Route path="/admin/reservations" element={<DashboardPage />} />
          <Route path="/admin/rfid-logs" element={<AdminRfidLogsPage />} />
          <Route path="/admin/settings" element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
