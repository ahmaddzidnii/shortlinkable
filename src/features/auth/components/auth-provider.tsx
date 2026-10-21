"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";

import { authClient } from "@/lib/auth-client";

export type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  expiresAt: number;
};

type AuthContextType = {
  user: SessionData["user"];
  expiresAt: number;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  initialSession: SessionData;
  children: React.ReactNode;
};

export function AuthProvider({ initialSession, children }: AuthProviderProps) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const expiresAt = session?.session.expiresAt ? new Date(session.session.expiresAt).getTime() : initialSession.expiresAt;

  useEffect(() => {
    const checkSessionExpiry = () => {
      if (expiresAt <= Date.now()) {
        router.replace("/login?reason=session_expired");
        return true;
      }

      return false;
    };

    if (checkSessionExpiry()) return;

    const timer = window.setTimeout(checkSessionExpiry, expiresAt - Date.now());

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSessionExpiry();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [expiresAt, router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: {
        ...initialSession.user,
        ...session?.user,
      },
      expiresAt,
      isLoading: isPending,
    }),
    [initialSession.user, session, expiresAt, isPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
