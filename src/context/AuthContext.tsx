import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isChecking: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

import { DISABLE_BACKEND_CHECKS } from "@/config/dev";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<"unknown" | "authenticated" | "unauthenticated">("unknown");
  const [isChecking, setIsChecking] = useState(!DISABLE_BACKEND_CHECKS);

  const refresh = useCallback(async () => {
    if (DISABLE_BACKEND_CHECKS) {
      // В режиме без бэкенда считаем пользователя аутентифицированным
      setStatus("authenticated");
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    try {
      await api.get("/auth/check-auth");
      setStatus("authenticated");
    } catch {
      setStatus("unauthenticated");
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (DISABLE_BACKEND_CHECKS) {
      // В режиме без бэкенда сразу устанавливаем статус
      setStatus("authenticated");
      setIsChecking(false);
    } else {
      void refresh();
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    if (DISABLE_BACKEND_CHECKS) {
      // В режиме без бэкенда просто меняем статус
      setStatus("unauthenticated");
      return;
    }

    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Не удалось выйти из аккаунта", error);
    } finally {
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: status === "authenticated",
      isChecking,
      refresh,
      logout,
    }),
    [isChecking, logout, refresh, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};








