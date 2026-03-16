import { RouterProvider } from "react-router";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import { router } from "./routes";

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ConfigProvider>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
