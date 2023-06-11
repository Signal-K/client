import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import React from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { SocialGraphHomeModal } from '../posts';

const Login = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    
    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            {!session ? (
                // <><SocialGraphHome />
                <div className='w-80%'><Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa}} theme='dark' /></div>//</>
            ) : (
                // <SocialGraphHome />
                <SocialGraphHomeModal />
            )}
        </div>
    );
}

export default Login;