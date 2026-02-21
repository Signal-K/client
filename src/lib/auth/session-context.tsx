"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type SessionContextValue = {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
};

const ClientSessionContext = createContext<SessionContextValue>({
  session: null,
  isLoading: true,
  error: null,
});

function useSessionBootstrap(initialSession: Session | null = null) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error: authError }) => {
        if (!isMounted) return;
        if (authError) {
          setError(authError);
        }
        setSession(data?.session ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error("Failed to load session"));
        setSession(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { session, isLoading, error };
}

export function SessionContextProvider({
  children,
  initialSession = null,
}: {
  children: ReactNode;
  supabaseClient?: unknown;
  initialSession?: Session | null;
}) {
  const state = useSessionBootstrap(initialSession);
  const value = useMemo(() => state, [state.session, state.isLoading, state.error]);

  return <ClientSessionContext.Provider value={value}>{children}</ClientSessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(ClientSessionContext);
  return {
    session: context.session,
    isLoading: context.isLoading,
    error: context.error,
    supabaseClient: getSupabaseBrowserClient(),
  };
}

export function useSession() {
  return useSessionContext().session;
}

export function useSupabaseClient() {
  return getSupabaseBrowserClient();
}
