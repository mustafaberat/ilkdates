"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SessionUser } from "@/lib/profile";

type SessionContextValue = {
  initialUser: SessionUser | null | undefined;
};

const SessionContext = createContext<SessionContextValue>({
  initialUser: undefined,
});

export function SessionProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null | undefined;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ initialUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useInitialUser(): SessionUser | null | undefined {
  return useContext(SessionContext).initialUser;
}
