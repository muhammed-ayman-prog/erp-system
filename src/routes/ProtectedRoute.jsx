import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";

import { useAuth }
from "../store/useAuth";

import {
  hasPermission
}
from "../utils/Permissions";

export default function ProtectedRoute({
  permissions = []
}) {

  const {
    user,
    loading
  } = useAuth();

  const location =
    useLocation();

  // ⏳ loading
  if (loading) {

    return (
      <div>
        Loading...
      </div>
    );
  }

  // ❌ not logged in
  if (!user) {

    return (
      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace
      />
    );
  }

  // 👑 owner
  if (
    user?.role === "owner"
  ) {

    return <Outlet />;
  }

  // 🔐 permissions
  const hasAccess =

    permissions.length === 0 ||

    permissions.some((p) =>
      hasPermission(user, p)
    );

  // ❌ denied
  if (!hasAccess) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}