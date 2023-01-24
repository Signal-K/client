import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { supabase } from '../../lib/threads/initSupabase';
import { definitions } from '../../lib/threads/supabase-types';

interface AuthSessionProps {
    user: User | null;
    session: Session | null;
    profile?: definitions['profiles'] | null
    loading: boolean;
    refresh: any;
}

const UserContext = createContext<AuthSessionProps>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    refresh: null,
});

interface Props {
    supabaseClient: SupabaseClient;
    [propName: string]: any;
}

export const UserContextProvider = (props: Props): JSX.Element => {
    const { supabaseClient } = props;
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const { data: profile, error, isValidating, mutate } = useSWR<definitions['profiles']>(
        user?.id ? ['user_data', user.id] : null,
    )

    return <UserContext.Provider value={value} {...props} />
}