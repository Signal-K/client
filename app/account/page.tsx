'use client';

import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import ProfileSetupForm from "@/components/Account/ProfileSetup";
import Navbar from "@/components/Layout/Navbar";

export default function AccountPage() {
    return (
        <EarthViewLayout>
            <Navbar />
            <ProfileSetupForm />
        </EarthViewLayout>
    );
};