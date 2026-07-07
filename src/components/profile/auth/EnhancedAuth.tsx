"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { Card, CardContent } from "@/src/components/ui/card";

const clerkAppearance = {
  variables: {
    colorPrimary: "rgba(255, 255, 255, 0.3)",
    colorBackground: "transparent",
    colorText: "#ffffff",
    colorInputBackground: "rgba(255, 255, 255, 0.1)",
    colorInputText: "#ffffff",
    borderRadius: "1rem",
  },
  elements: {
    card: "bg-transparent shadow-none",
    headerTitle: "text-white",
    headerSubtitle: "text-white/70",
    socialButtonsBlockButton: "bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-2xl h-12",
    dividerLine: "bg-white/20",
    dividerText: "text-white/50",
    formFieldLabel: "text-white/80",
    formFieldInput: "bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl text-sm h-12 text-white",
    formButtonPrimary: "bg-white/20 backdrop-blur-sm text-white rounded-2xl h-12 border border-white/30 hover:bg-white/30 transition-all duration-300",
    footerActionText: "text-white/70",
    footerActionLink: "text-green-300 hover:text-green-200",
    identityPreviewText: "text-white",
    identityPreviewEditButtonIcon: "text-white",
  },
};

interface EnhancedAuthProps {
  mode: "sign-in" | "sign-up";
}

export default function EnhancedAuthPage({ mode }: EnhancedAuthProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className="lg:w-1/2 w-full flex flex-col justify-center items-center p-8 lg:p-16 bg-gray-900">
          <div className="relative z-10 text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl shadow-2xl">
              <span className="text-white font-bold text-2xl sm:text-3xl">⭐</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-green-200 to-blue-300 bg-clip-text text-transparent">
              Star Sailors
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-6 font-light">
              Explore the cosmos & catalogue discoveries
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 w-full flex items-center justify-center p-4 sm:p-8 lg:p-16 relative">
          <div className="absolute inset-0">
            <Image
              src="/assets/Backdrops/garden.png"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md"></div>
          </div>

          <div className="relative z-10 w-full max-w-sm sm:max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-3xl blur-xl"></div>

            <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:bg-white/15 hover:border-white/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none"></div>

              <CardContent className="relative p-6 sm:p-8">
                {/*
                  Hash-based routing keeps /auth and /auth/register as plain pages
                  (no catch-all [[...rest]] segments needed) — Clerk manages its
                  internal steps (factor-one, sso-callback, etc.) via URL hash.
                */}
                {mode === "sign-up" ? (
                  <SignUp
                    routing="hash"
                    signInUrl="/auth"
                    appearance={clerkAppearance}
                  />
                ) : (
                  <SignIn
                    routing="hash"
                    signUpUrl="/auth/register"
                    appearance={clerkAppearance}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
