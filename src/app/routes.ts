import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Challenges } from "./pages/Challenges";
import { Scoreboard } from "./pages/Scoreboard";
import { Teams } from "./pages/Teams";
import { Profile } from "./pages/Profile";
import { Auth } from "./pages/Auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/challenges",
    Component: Challenges,
  },
  {
    path: "/scoreboard",
    Component: Scoreboard,
  },
  {
    path: "/teams",
    Component: Teams,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/login",
    Component: Auth,
  },
]);
