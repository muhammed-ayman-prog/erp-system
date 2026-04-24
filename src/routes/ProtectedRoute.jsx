import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/useAuth";

export default function ProtectedRoute({ permissions = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ⏳ لسه بيحمل
  if (loading) {
    return <div>Loading...</div>;
  }

  // ❌ مش لوجين
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 👑 Super Admin
  if (user.permissions?.includes("*")) {
    return <Outlet />;
  }

  // 🔐 Check permissions
  const hasAccess =
    permissions.length === 0 ||
    permissions.some((p) => user.permissions?.includes(p));

  // ❌ مفيش صلاحية
  if (!hasAccess) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}