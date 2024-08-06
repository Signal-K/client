import { ReactNode } from "react";
import Link from "next/link";
import { Auth } from "@supabase/auth-ui-react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface AuthPageProps {
    children: ReactNode;
};

function SupabaseAuthWrapper({ children }: { children: ReactNode }) {
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

function AuthPage({ children }: AuthPageProps) {
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
            <Auth supabaseClient={supabase} theme='light' />
            <br />
            {/* <span className='text-sm font-medium text-gray-900 dark:text-gray-900'>
                Don't have an account yet?{' '}
                <Link href='/login/register' className='underline'>
                    go to signup
                </Link>.
            </span> */}
        <br />
        </AuthPage>
    );
};