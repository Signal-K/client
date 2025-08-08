"use client";

import { ReactNode, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import { MicroscopeIcon, CodeIcon, FilesIcon, UserX, Mail, ArrowRight } from "lucide-react";
import { Flexbox } from 'react-layout-kit';
import { createStyles } from 'antd-style';
import { Card, CardContent } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

interface AuthPageProps {
  children: ReactNode;
}

const useStyles = createStyles(({ css, token }) => {
    return {
      desc: css`
        font-size: min(24px, 4vw);
        font-weight: 400;
        text-align: center;
        text-wrap: balance;
      `,
      title: css`
        margin-block-end: 0;
        font-size: min(56px, 7vw);
        font-weight: 800;
        line-height: 1;
        text-align: center;
        text-wrap: balance;
      `,
    };
});

function SupabaseAuthWrapper({ children }: { children: ReactNode }) {
  const supabase = useSupabaseClient();
  const [showAnonymousSignIn, setShowAnonymousSignIn] = useState(false);
  const [isLoadingAnonymous, setIsLoadingAnonymous] = useState(false);
  const [anonymousError, setAnonymousError] = useState<string | null>(null);
  
  const { styles } = useStyles();

  const handleAnonymousSignIn = async () => {
    setIsLoadingAnonymous(true);
    setAnonymousError(null);

    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        setAnonymousError(error.message);
        console.error('Anonymous sign-in error:', error);
      } else {
        // Successfully signed in anonymously
        console.log('Anonymous sign-in successful:', data);
      }
    } catch (err: any) {
      setAnonymousError('An unexpected error occurred');
      console.error('Anonymous sign-in error:', err);
    } finally {
      setIsLoadingAnonymous(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left Panel */}
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-gray-100 p-10">
          <div className="w-full h-full relative">
            <Image
              src="assets/Backdrops/background1.jpg"
              alt="Application UI"
              layout="fill"
              objectFit="cover"
              className="absolute inset-0"
            />
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="md:w-1/2 w-full flex flex-col justify-center p-10 bg-white">
          <Flexbox
            align={'center'}
            as={'h1'}
            className={styles.title}
            gap={16}
            horizontal
            justify={'center'}
            wrap={'wrap'}
          >
            <strong className="font-extrabold text-transparent text-8xl bg-clip-text bg-gradient-to-r from-green-200 to-amber-300" style={{ fontSize: 'min(56px, 8vw)' }}>
              Star Sailors
            </strong>
          </Flexbox>
          <p className="max-w-[600px] text-blue-800 md:text-xl mb-6">
            Explore the cosmos & catalogue discoveries in different scientific disciplines
          </p>

          <div className="max-w-md w-full mx-auto py-5">
            <Card>
              <CardContent className="pt-6">
                {/* Anonymous Sign-In Section */}
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Quick Start
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Jump right in without creating an account. You can always add your email later.
                    </p>
                  </div>
                  
                  {anonymousError && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {anonymousError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleAnonymousSignIn}
                    disabled={isLoadingAnonymous}
                    className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                    size="lg"
                  >
                    {isLoadingAnonymous ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating temporary account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserX className="w-4 h-4" />
                        Continue as Guest
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 text-center mb-4">
                    No email required • Your progress will be saved temporarily
                  </div>
                </div>

                {/* Separator */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground">Or create a permanent account</span>
                  </div>
                </div>

                {/* Traditional Auth */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-800 mb-2">Sign up with email or Google</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      Keep your progress forever and access from any device
                    </p>
                  </div>
                  
                  <Auth
                    supabaseClient={supabase}
                    providers={["google"]}
                    socialLayout="horizontal"
                    theme="light"
                  />
                </div>

                {/* Benefits of permanent account */}
                <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Permanent Account Benefits:</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Access from multiple devices</li>
                        <li>• Never lose your progress</li>
                        <li>• Get updates on new discoveries</li>
                        <li>• Join the community leaderboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connect Section */}
            <div className="mt-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-center">Connect with Star Sailors</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Link 
                    href="https://threads.net/droidology" 
                    className="flex items-center gap-2 p-2 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
                  >
                    <MicroscopeIcon className="h-4 w-4" />
                    Follow us on Threads
                  </Link>
                  <Link 
                    href="https://github.com/signal-k" 
                    className="flex items-center gap-2 p-2 rounded-md bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black transition-colors text-sm"
                  >
                    <CodeIcon className="h-4 w-4" />
                    View on GitHub
                  </Link>
                  <Link 
                    href="https://github.com/signal-k/manuscript" 
                    className="flex items-center gap-2 p-2 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-colors text-sm"
                  >
                    <FilesIcon className="h-4 w-4" />
                    Read Documentation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ children }: AuthPageProps) {
  return <SupabaseAuthWrapper>{children}</SupabaseAuthWrapper>;
}

export default function EnhancedAuthPage() {
  return (
    <AuthPage>
      <div />
    </AuthPage>
  );
}
