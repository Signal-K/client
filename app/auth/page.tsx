"use client";

import { useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";

const Login = () => {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    return <EnhancedAuthPage />;
};

export default Login;