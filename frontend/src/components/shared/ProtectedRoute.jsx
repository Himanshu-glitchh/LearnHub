import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
