import { User, Session } from '@supabase/supabase-js'
import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from './createSupabase';

export default function useSupabaseUser() { // Hook to get the currently authenticated user
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const { auth } = createSupabaseClient();
    // Fetch the user & session
    const refreshUser = useCallback(async () => {
        const {
          data: { user },
        } = await auth.getUser();
        setUser(user || null);
    
        const {
          data: { session },
        } = await auth.getSession();
        setSession(session ?? null);
    }, [auth]);

    useEffect(() => { // Listener to refetch the user when session changes
        const {
            data: { subscription },
        } = auth.onAuthStateChange(async (event, session) => {
            refreshUser();
        });
    }, [auth]);

    return { user, session, refresh: refreshUser };
}