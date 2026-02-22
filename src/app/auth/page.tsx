"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";
import { useAuthUser } from "@/src/hooks/useAuthUser";

const Login = () => {
    const { user } = useAuthUser();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/game');
        }
    }, [user, router]);

    return <EnhancedAuthPage />;
};

export default Login;
