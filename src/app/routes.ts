import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Admin } from "./pages/Admin";
import { Challenges } from "./pages/Challenges";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { PublicTeamProfile } from "./pages/PublicTeamProfile";
import { PublicUserProfile } from "./pages/PublicUserProfile";
import { Register } from "./pages/Register";
import { Scoreboard } from "./pages/Scoreboard";
import { TeamManagement } from "./pages/TeamManagement";
import { Teams } from "./pages/Teams";

export const router = createBrowserRouter([
  // Public routes — no auth required
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },

  // Protected routes — redirect to /login when not authenticated
  {
    Component: ProtectedRoute,
    children: [
      { path: "/admin", Component: Admin },
      { path: "/challenges", Component: Challenges },
      { path: "/scoreboard", Component: Scoreboard },
      { path: "/teams", Component: Teams },
      { path: "/team", Component: TeamManagement },
      { path: "/teams/:teamId", Component: PublicTeamProfile },
      { path: "/profile", Component: Profile },
      { path: "/users/:userId", Component: PublicUserProfile },
    ],
  },
]);
