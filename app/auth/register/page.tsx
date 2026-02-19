"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";
import { useAuthUser } from "@/src/hooks/useAuthUser";

const Register = () => {
    const { user } = useAuthUser();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    return <EnhancedAuthPage />;
};

export default Register;
