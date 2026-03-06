"use client";

import { ReactNode } from "react";
import { Auth } from "@supabase/auth-ui-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/src/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface AuthPageProps {
  children: ReactNode;
}

function SupabaseAuthWrapper({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowserClient();

  return (
    <div className="min-h-screen relative overflow-hidden">      
      {/* Two Panel Layout */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Branding/Info with solid dark background */}
        <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-8 lg:p-16 bg-gray-900">
          <div className="relative z-10 text-center max-w-md">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl shadow-2xl">
              <span className="text-white font-bold text-2xl sm:text-3xl">⭐</span>
            </div>
            
            {/* Branding Content */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-green-200 to-blue-300 bg-clip-text text-transparent">
              Star Sailors
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-6 font-light">
              Explore the cosmos & catalogue discoveries
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              {/* Join thousands of cosmic explorers in mapping the universe and discovering new frontiers in space science. */}
            </p>
          </div>
        </div>
        
        {/* Right Panel - Authentication with background image */}
        <div className="lg:w-1/2 w-full flex items-center justify-center p-4 sm:p-8 lg:p-16 relative">
          {/* Background Image only for right panel */}
          <div className="absolute inset-0">
            <Image
              src="/assets/Backdrops/garden.png"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay for right panel */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md"></div>
          </div>
          
          {/* Glass Authentication Card */}
          <div className="relative z-10 w-full max-w-sm sm:max-w-md">
            {/* Subtle glow effect behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-3xl blur-xl"></div>
            
            <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:bg-white/15 hover:border-white/30">
              {/* Inner glass reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                      Sign up
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Create your Star Sailors account and grow your share of the cosmic discoveries.
                    </p>
                  </div>

                  {/* Auth UI Component with glass styling */}
                  <div className="space-y-4">
                    <div className="[&_.supabase-auth-ui_*]:text-white [&_.supabase-auth-ui_input]:bg-white/10 [&_.supabase-auth-ui_input]:backdrop-blur-sm [&_.supabase-auth-ui_input]:border-white/20 [&_.supabase-auth-ui_input]:rounded-2xl [&_.supabase-auth-ui_input]:text-sm [&_.supabase-auth-ui_input]:h-12 [&_.supabase-auth-ui_button]:bg-white/20 [&_.supabase-auth-ui_button]:backdrop-blur-sm [&_.supabase-auth-ui_button]:text-white [&_.supabase-auth-ui_button]:rounded-2xl [&_.supabase-auth-ui_button]:h-12 [&_.supabase-auth-ui_button]:border-white/30 [&_.supabase-auth-ui_button]:hover:bg-white/30 [&_.supabase-auth-ui_button]:transition-all [&_.supabase-auth-ui_button]:duration-300">
                      <Auth
                        supabaseClient={supabase}
                        providers={["google"]}
                        socialLayout="vertical"
                        appearance={{
                          variables: {
                            default: {
                              colors: {
                                brand: 'rgba(255, 255, 255, 0.2)',
                                brandAccent: 'rgba(255, 255, 255, 0.3)',
                                inputBackground: 'rgba(255, 255, 255, 0.1)',
                                inputBorder: 'rgba(255, 255, 255, 0.2)',
                                inputText: '#ffffff',
                              },
                              radii: {
                                borderRadiusButton: '1rem',
                                inputBorderRadius: '1rem',
                              },
                              space: {
                                inputPadding: '12px 16px',
                                buttonPadding: '12px 16px',
                              },
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <span className="text-white/70 text-sm">Already Have An Account? </span>
                    <Link href="/auth" className="text-green-300 hover:text-green-200 text-sm font-medium underline transition-colors duration-200">
                      Login
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
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
