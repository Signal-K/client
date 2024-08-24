"use client";

import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "../components/Template";
import { Header } from "../components/sections/Header";
// import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function TestPageForFuckingAround() {
    // const supabase = useSupabaseClient();
    // const session = useSession();

    return (
        <OnboardingLayout bg={true}> {/* Replace with regular layout */}
            <Header />
            <p>Test</p>
        </OnboardingLayout>
    );
};