import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

export function Admin() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdmin = Boolean(user?.isAdmin);
  const params = new URLSearchParams(location.search);
  const alreadyTriedRedirect = params.get("spaAdminRedirect") === "1";

  useEffect(() => {
    if (!loading && isAdmin && !alreadyTriedRedirect) {
      window.location.assign("/admin?spaAdminRedirect=1");
    }
  }, [loading, isAdmin, alreadyTriedRedirect]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060b15] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060b15] px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-bold text-red-300 mb-2">Access denied</h1>
          <p className="text-sm text-red-200/80 mb-4">
            Admin panel is only available to administrator accounts.
          </p>
          <Link
            to="/"
            className="inline-block rounded-lg border border-amber-500/40 px-4 py-2 text-amber-300 hover:bg-amber-500/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (alreadyTriedRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060b15] px-4">
        <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center text-white">
          <h1 className="text-xl font-bold text-amber-300 mb-2">
            Unable to open admin panel
          </h1>
          <p className="text-sm text-white/80 mb-4">
            Backend did not serve the admin page from this route.
          </p>
          <a
            href="/admin"
            className="inline-block rounded-lg border border-amber-500/40 px-4 py-2 text-amber-300 hover:bg-amber-500/10"
          >
            Try direct admin link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b15] text-white">
      <p className="text-sm uppercase tracking-wider text-amber-300">
        Opening admin panel...
      </p>
    </div>
  );
}
