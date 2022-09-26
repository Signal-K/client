import {
    CheckInCircleIcon,
    CheckIcon,
    EditIcon,
    GitHubIcon,
    LoadingDots,
    UploadIcon,
    XIcon
} from '../../../components/icons';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TextareaAutosize } from '@mui/material';

import { ProfileContent } from '../../../components/Posts/ProfileCard';
import { UserContextProvider } from '../../../context/UserContext';
import CoreLayout from '../../../components/Core/Layout';

export const profileWidth = 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8';

export default function ProfilePage ({
    settings,
    user
}: {
    settings?: boolean;
    user: string
}) {
    const router = useRouter();
}