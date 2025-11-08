"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "@/lib/types/auth";

type SessionContextType = {
  session: Session | null;
  setSession: (session: Session | null) => void;
  isLoading: boolean;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("session");
      if (stored) {
        const sessionData: Session = JSON.parse(stored);
        if (sessionData.expiresAt > Date.now()) setSessionState(sessionData);
        else localStorage.removeItem("session");
      }
    } catch {
      localStorage.removeItem("session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSession = (newSession: Session | null) => {
    setSessionState(newSession);
    if (newSession) localStorage.setItem("session", JSON.stringify(newSession));
    else localStorage.removeItem("session");
  };

  // Auto logout effect
  useEffect(() => {
    if (!session) return;

    const timeout = session.expiresAt - Date.now();
    if (timeout <= 0) {
      setSession(null);
      if (pathname !== "/login") router.push("/login");
      return;
    }

    const timer = setTimeout(() => {
      setSession(null);
      if (pathname !== "/login") router.push("/login");
    }, timeout);

    return () => clearTimeout(timer);
  }, [session, pathname, router]);

  const signOut = () => {
    setSession(null);
    if (pathname !== "/login") router.push("/login");
  };

  return (
    <SessionContext.Provider value={{ session, setSession, isLoading, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};
