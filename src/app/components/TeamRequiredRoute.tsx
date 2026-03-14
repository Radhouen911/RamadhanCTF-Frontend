import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export function TeamRequiredRoute() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060b15]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isAdmin) {
    return <Outlet />;
  }

  if (!user?.team_id) {
    return <Navigate to="/team" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
