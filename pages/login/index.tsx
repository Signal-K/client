import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import React, { useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router'; // Import the useRouter hook
import Layout from '../../components/Section/Layout';
import LoginPage from '../../components/Authentication/LoginModal';

const Login = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const router = useRouter(); // Initialize the useRouter hook
    
    useEffect(() => {
        // Check if the user is logged in and then redirect
        if (session) {
            router.push('/feed');
        }
    }, [session, router]);

    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            {!session ? (
                <Layout><LoginPage /></Layout>
            ) : (
                <Layout>Logged in</Layout>
            )}
        </div>
    );
};

export default Login;