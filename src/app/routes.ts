import { createBrowserRouter } from "react-router";
// Auth routes removed for static archive
import { Admin } from "./pages/Admin";
import { Angel } from "./pages/Angel";
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

export const router = createBrowserRouter(
  [
    // Public routes — no auth required
    { path: "/", Component: Landing },
    { path: "/angel", Component: Angel },
    { path: "/login", Component: Login },
    { path: "/register", Component: Register },
    { path: "/challenges", Component: Challenges },
    { path: "/scoreboard", Component: Scoreboard },

    { path: "/admin", Component: Admin },
    { path: "/teams", Component: Teams },
    { path: "/team", Component: TeamManagement },
    { path: "/teams/:teamId", Component: PublicTeamProfile },
    { path: "/profile", Component: Profile },
    { path: "/users/:userId", Component: PublicUserProfile },
  ],
  {
    basename: "/RamadhanCTF-Frontend",
  },
);
