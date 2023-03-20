import React from "react";

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const UserOnboarding = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
}