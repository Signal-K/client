"use client";

import { useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import LoginPage from "@/auth/LoginModal";

const Login = () => {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/test');
        }
    }, [session, router]);

    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            {!session ? (
                <LoginPage />
            ) : (
                <p>Logged in</p>
            )}
        </div>
    );
};

export default Login;