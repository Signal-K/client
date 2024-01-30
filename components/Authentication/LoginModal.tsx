import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export function SupabaseAuthWrapper({ children }: { children: ReactNode }) {
    return (
        <div className='flex min-h-full flex-col justify-center pt-10 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
            <div className='bg-white py-8 px-4 shadow-xl ring-1 ring-gray-900/10 sm:rounded-lg sm:px-10 dark:bg-white dark:text-gray-900'>
            <div className='-mt-8'>
                {children}
            </div>
            </div>
        </div>
        </div>
    );
};

interface AuthPageProps {
  children: ReactNode;
}

export function AuthPage({ children }: AuthPageProps) {
//   const history = useHistory();
  const session = useSession();
  const router = useRouter();

//   useEffect(() => {
//     if (session) {
//       router.push('/')
//     }
//   }, [session, history]);

  return (
    <SupabaseAuthWrapper>
      {children}
    </SupabaseAuthWrapper>
  );
};

export default function LoginPage() {
    const supabase = useSupabaseClient();

    return (
      <AuthPage>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme='dark' />
        <br />
        <span className='text-sm font-medium text-gray-900 dark:text-gray-900'>
          Don't have an account yet?{' '}
          <Link href='/signup' className='underline'>
            go to signup
          </Link>
          .
        </span>
        <br />
      </AuthPage>
    );
};