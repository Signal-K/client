import React, { useState } from "react";

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import {
    Comments,
    AuthModal,
    CommentsProvider,
  } from 'supabase-comments-extension';

const UserOnboarding = () => {
    const session = useSession();
    const supabase = useSupabaseClient();

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>{/*<CommentsProvider
            supabaseClient={supabase}
        >
          <Comments topic="tutorial-one" />
        </CommentsProvider>*/}
        <div>Onboarding</div></>
    );
}

export default UserOnboarding;