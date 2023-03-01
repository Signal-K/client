import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React from "react";

export default function Home() {
    const session = useSession();

    return (
        <>
            <div>Entry point to client</div>
            <Link href='/posts'>Test</Link>
        </>
    )
}