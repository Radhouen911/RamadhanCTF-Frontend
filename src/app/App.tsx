import { RouterProvider } from "react-router";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { NotificationDebugBadge } from "./components/NotificationDebugBadge";
import { NotificationToastProvider } from "./components/NotificationToast";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import { NotificationProvider } from "./context/NotificationContext";
import { router } from "./routes";

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <ConfigProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
            <NotificationToastProvider />
            <NotificationDebugBadge />
          </NotificationProvider>
        </ConfigProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
