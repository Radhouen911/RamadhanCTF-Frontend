import { createBrowserRouter } from "react-router";
import { Challenges } from "./pages/Challenges";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { Scoreboard } from "./pages/Scoreboard";
import { Teams } from "./pages/Teams";

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
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
]);
