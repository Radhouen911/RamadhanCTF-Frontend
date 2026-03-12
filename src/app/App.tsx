import { RouterProvider } from "react-router";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes";

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
