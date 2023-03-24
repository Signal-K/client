import React from "react";

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import {
    Comments,
    AuthModal,
    CommentsProvider,
  } from 'supabase-comments-extension';

const UserOnboarding = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
}