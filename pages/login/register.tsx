import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import React, { useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router'; // Import the useRouter hook
import { SpareLayout } from '../../components/_Core/Section/Layout';
import LoginPage from '../../components/Authentication/LoginModal';

const Register = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const router = useRouter(); // Initialize the useRouter hook
    
    useEffect(() => {
        // Check if the user is logged in and then redirect
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            {!session ? (
                <SpareLayout><div className='w-80%'><Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme='dark' /></div></SpareLayout>
            ) : (
                <SpareLayout>Logged in</SpareLayout>
            )}
        </div>
    );
};

export default Register;