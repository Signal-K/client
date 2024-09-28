"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function IntroduceUserToResearch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    // SSM-7
};