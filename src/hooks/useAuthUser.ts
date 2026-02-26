"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function useAuthUser() {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!isMounted) return;

        const sessionUser = data.session?.user ?? null;
        if (sessionUser) {
          setUser(sessionUser);
        }

        try {
          const { data: userData, error } = await supabase.auth.getUser();
          if (!isMounted) return;
          if (!error) {
            setUser(userData.user ?? sessionUser);
          } else if (!sessionUser) {
            setUser(null);
          }
        } catch {
          if (!isMounted || sessionUser) return;
          setUser(null);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, isLoading, supabase };
}
