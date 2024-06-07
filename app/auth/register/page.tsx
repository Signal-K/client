"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Register = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            {!session ? (
                <div className='w-80%'><Auth supabaseClient={supabase} theme='dark' /></div>
            ) : (
                <p>Logged in</p>
            )}
        </div>
    );
};

export default Register;
