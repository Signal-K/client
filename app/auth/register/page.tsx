"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EnhancedAuthPage from "@/src/components/profile/auth/EnhancedAuth";

const Register = () => {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    return <EnhancedAuthPage />;
};

export default Register;