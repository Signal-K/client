"use client"

import { ReactNode } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import { MicroscopeIcon, CodeIcon, FilesIcon } from "lucide-react";

interface AuthPageProps {
    children: ReactNode;
};

const Navbar = () => {
    return (
        <header className="bg-white shadow">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <div className="flex items-center">
                    <Link legacyBehavior href="/">
                        <a className="text-2xl font-bold text-gray-800">Star Sailors</a>
                    </Link>
                </div>
                <nav className="flex items-center space-x-6">
                    <Link legacyBehavior href="https://twitter.com/TheMrScrooby">
                        <a className="text-gray-600 hover:text-gray-800">Updates</a>
                    </Link>
                    <Link legacyBehavior href="https://github.com/signal-k">
                        <a className="text-gray-600 hover:text-gray-800">We're open-source!</a>
                    </Link>
                    {/* <Link legacyBehavior href="" aria-disabled>
                        <a className="text-gray-600 hover:text-gray-800">Tutorial coming soon</a>
                    </Link> */}
                </nav>
            </div>
        </header>
    );
};

function SupabaseAuthWrapper({ children }: { children: ReactNode }) {
    return (
        <div>
            <Navbar />
                <div className="flex flex-col md:flex-row min-h-screen">
                    {/* Left Panel */}
                    <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-blue-500 text-white p-10">
                        <Image src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media/garden.png" alt="Landing" width={400} height={300} />
                        <h1 className="text-4xl font-bold mt-6">Star Sailors</h1>
                        <p className="mt-4 text-lg">Explore the cosmos & catalogue discoveries in different scientific disciplines</p>
                        <div className="flex flex-col gap-2 py-6">
                            {/* <h3 className="text-lg font-bold text-nord-4 dark:text-nord-6">Connect</h3> */}
                            <Link href="https://threads.net/droidology" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
                                <MicroscopeIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
                                Threads
                            </Link>
                            <Link href="https://github.com/signal-k" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
                                <CodeIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
                                Github
                            </Link>
                            <Link href="https://github.com/signal-k/manuscript" className="flex items-center gap-2 hover:underline text-nord-3 dark:text-nord-5" prefetch={false}>
                                <FilesIcon className="h-5 w-5 text-nord-3 dark:text-nord-5" />
                                Documentation
                            </Link>
                        </div>
                    </div>
                    {/* Right Panel */}
                    <div className="md:w-1/2 w-full flex flex-col justify-center p-10 bg-white">
                        <div className="max-w-md w-full mx-auto">
                            <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                                {children}
                            </div>
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
            <Auth 
                supabaseClient={supabase} 
                providers={['google']} 
                socialLayout="horizontal"
                theme="light" 
            />
        </AuthPage>
    );
};
