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
                // <div className='w-80%'><Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme='dark' /></div>
                <Layout><LoginPage /></Layout>
            ) : (
                <Layout>Logged in</Layout>
            )}
        </div>
    );
};

export default Login;

/*
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@wasp/auth/forms/Login';
import { AuthWrapper } from './authWrapper';
import useAuth from '@wasp/auth/useAuth';

export default function Login() {
  const history = useHistory();

  const { data: user } = useAuth();

  useEffect(() => {
    if (user) {
      history.push('/');
    }
  }, [user, history]);

  return (
    <AuthWrapper>
      <LoginForm />
      <br />
      <span className='text-sm font-medium text-gray-900 dark:text-gray-900'>
        Don't have an account yet?{' '}
        <Link to='/signup' className='underline'>
          go to signup
        </Link>
        .
      </span>
      <br />
      <span className='text-sm font-medium text-gray-900'>
        Forgot your password?{' '}
        <Link to='/request-password-reset' className='underline'>
          reset it
        </Link>
        .
      </span>
    </AuthWrapper>
  );
}
*/