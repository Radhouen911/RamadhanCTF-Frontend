import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ctfdApi } from "../../services/ctfdApi";

export type VisibilitySetting = "public" | "private" | "hidden" | "admins";

type RegistrationVisibility = "public" | "private" | "mlc";

type ConfigMap = Record<string, unknown>;

interface ConfigContextValue {
  challengeVisibility: VisibilitySetting;
  accountVisibility: VisibilitySetting;
  scoreVisibility: VisibilitySetting;
  registrationVisibility: RegistrationVisibility;
  userMode: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

const normalizeVisibility = (
  value: unknown,
  fallback: VisibilitySetting,
): VisibilitySetting => {
  if (typeof value === "boolean") {
    return value ? "public" : "hidden";
  }

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    normalized === "public" ||
    normalized === "private" ||
    normalized === "hidden" ||
    normalized === "admins"
  ) {
    return normalized;
  }

  return fallback;
};

const normalizeRegistrationVisibility = (
  value: unknown,
  fallback: RegistrationVisibility,
): RegistrationVisibility => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    normalized === "public" ||
    normalized === "private" ||
    normalized === "mlc"
  ) {
    return normalized;
  }

  return fallback;
};

const normalizeConfigMap = (data: unknown): ConfigMap => {
  if (Array.isArray(data)) {
    return data.reduce<ConfigMap>((acc, entry) => {
      if (entry && typeof entry === "object") {
        const key =
          "key" in entry ? entry.key : "name" in entry ? entry.name : undefined;
        const value = "value" in entry ? entry.value : undefined;

        if (typeof key === "string") {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
  }

  if (data && typeof data === "object") {
    return data as ConfigMap;
  }

  return {};
};

const readBootstrapConfig = () => {
  const init = (window as any).init || {};

  return {
    challengeVisibility: normalizeVisibility(
      init.challengeVisibility,
      "private",
    ),
    accountVisibility: normalizeVisibility(init.accountVisibility, "public"),
    scoreVisibility: normalizeVisibility(
      init.scoreVisibilityValue ?? init.scoreVisibility,
      "private",
    ),
    registrationVisibility: normalizeRegistrationVisibility(
      init.registrationVisibility,
      "public",
    ),
    userMode: String(init.userMode ?? "teams"),
  };
};

const toConfigState = (data: ConfigMap) => ({
  challengeVisibility: normalizeVisibility(
    data.challenge_visibility,
    "private",
  ),
  accountVisibility: normalizeVisibility(data.account_visibility, "public"),
  scoreVisibility: normalizeVisibility(data.score_visibility, "private"),
  registrationVisibility: normalizeRegistrationVisibility(
    data.registration_visibility,
    "public",
  ),
  userMode: String(data.user_mode ?? "teams"),
});

export const canAccessVisibility = (
  visibility: VisibilitySetting,
  options: { isAuthenticated: boolean; isAdmin: boolean },
) => {
  if (options.isAdmin) {
    return true;
  }

  switch (visibility) {
    case "public":
      return true;
    case "private":
      return options.isAuthenticated;
    case "hidden":
    case "admins":
      return false;
    default:
      return options.isAuthenticated;
  }
};

export function ConfigProvider({ children }: { children: ReactNode }) {
  const bootstrap = useMemo(readBootstrapConfig, []);
  const [config, setConfig] = useState(bootstrap);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const response = await ctfdApi.getConfig();
      const normalized = normalizeConfigMap(response?.data);
      setConfig((prev) => ({
        ...prev,
        ...toConfigState(normalized),
      }));
    } catch {
      setConfig((prev) => ({
        ...bootstrap,
        ...prev,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        ...config,
        loading,
        refresh,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useAppConfig must be used within a ConfigProvider");
  }
  return context;
}
