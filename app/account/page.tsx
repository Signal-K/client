"use client";

import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import ProfileSetupForm from "@/components/Account/ProfileSetup";
import Navbar from "@/components/Layout/Navbar";
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