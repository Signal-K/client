"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

type MinimalSession = {
  user: {
    id: string;
    email: string | null;
    is_anonymous: boolean;
  };
};

type SessionContextValue = {
  session: MinimalSession | null;
  isLoading: boolean;
  error: Error | null;
};

const ClientSessionContext = createContext<SessionContextValue>({
  session: null,
  isLoading: true,
  error: null,
});

function useSessionBootstrap(): SessionContextValue {
  const { isLoaded, isSignedIn, user } = useUser();

  return useMemo(() => {
    if (!isLoaded) {
      return { session: null, isLoading: true, error: null };
    }

    if (!isSignedIn || !user) {
      return { session: null, isLoading: false, error: null };
    }

    return {
      session: {
        user: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? null,
          is_anonymous: Boolean(user.publicMetadata?.guest),
        },
      },
      isLoading: false,
      error: null,
    };
  }, [isLoaded, isSignedIn, user]);
}

export function SessionContextProvider({ children }: { children: ReactNode }) {
  const state = useSessionBootstrap();

  return <ClientSessionContext.Provider value={state}>{children}</ClientSessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(ClientSessionContext);
  return {
    session: context.session,
    isLoading: context.isLoading,
    error: context.error,
  };
}

export function useSession() {
  return useSessionContext().session;
}

export function useClerkAuth() {
  return useAuth();
}
