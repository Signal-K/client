import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const Navbar: React.FC = () => {
    const supabase  = useSupabaseClient();
    const session = useSession();
    
    return (
        <nav className="py-4 border-bg">
            <div className="container flex justify-between items-center">
                <Link href="/" className="font-bold text-xl">Star Sailors<span className="text-red-600"></span></Link>
                <Link href="/profile">
                    <Avatar className="cursor-pointer rounded-md">
                        <AvatarImage src="https://avatars.githubusercontent.com/u/78838067?s=200&v=4" />
                    </Avatar>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;