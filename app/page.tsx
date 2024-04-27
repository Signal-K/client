"use client"

import { OnboardingLayout } from "@/app/components/Template";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Landing } from "@/app/components/landing";
import { useEffect, useState } from "react";
import LoginPage from "./auth/LoginModal";
import OnboardingWindow from "./components/(scenes)/chapters/(onboarding)/window";

export default function Home() {
  const supabase = useSupabaseClient();
  const session = useSession();

  if (!session) {
    return (
      <LoginPage />
    );
  };
  const renderContent = () => {
    return (
      <OnboardingLayout bg={true}>
        <OnboardingWindow />
      </OnboardingLayout>
    )
  }

  return (
    <>
      {renderContent()} 
    </>
  );
}; 