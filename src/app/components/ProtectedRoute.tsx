import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/**
 * Layout route that blocks unauthenticated access.
 * Wrap any route that requires a logged-in user.
 * Shows a spinner while auth state is still loading so we
 * don't flash a redirect on a hard refresh.
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

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

  return <Outlet />;
}
