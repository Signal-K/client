"use client";

import { EarthViewLayout } from "@/src/components/ui/scenes/planetScene/layout";
import ProfileSetupForm from "@/src/components/profile/setup/ProfileSetup";
import Navbar from "@/src/components/layout/Navbar";
import { useState } from "react";

export default function AccountPage() {
  const [refresh, setRefresh] = useState(false);

  return (
    <EarthViewLayout>
      <Navbar />
      <ProfileSetupForm onProfileUpdate={() => setRefresh((prev) => !prev)} />
    </EarthViewLayout>
  );
};