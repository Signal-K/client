import {
    CheckInCircleIcon,
    CheckIcon,
    EditIcon,
    GitHubIcon,
    LoadingDots,
    UploadIcon,
    XIcon
  } from '../../components/icons';
  import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
  import { useCallback, useEffect, useState } from 'react';
  import Link from 'next/link';
  import { useRouter } from 'next/router';
  import { TextareaAutosize } from '@mui/material';
  
  import { ProfileContent } from '../../components/Posts/ProfileCard';
  import { UserContextProvider } from '../../context/UserContext';
  import CoreLayout from '../../components/Core/Layout';
  
  export const profileWidth = 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8';
  import { getGradient } from '../../lib/ui/gradient';
  import { ProfileCard } from '../../components/Card';
  
  export default function ProfilePage ({
    // settings,
    // user
  }: {
    // settings?: boolean;
    // user: string
  }) {
    // page setup
    const router = useRouter();
    const userId = router.query.id;
    // const settingsPage = 
    //     settings ||
    //     (router.query.settings === 'true' && router.asPath === '/settings');
  
    // const handleDismiss = useCallback(() => {
    //     if (settingsPage) router.replace('/')
    // })
  
    // supabase setup
    const session = useSession();
    const supabase = useSupabaseClient();
    const [profile, setProfile] = useState(null);
  
    // User data
    function fetchProfile () {
        supabase.from('profiles')
            .select()
            .eq('id', userId)
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setProfile(result.data[0]); };
            }
        )
    }
  
    useEffect(() => {
        if (!userId) { return; };
        fetchProfile();
    }, [userId]);
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
  
    return (
        <CoreLayout>
          <div className='min-h-screen pb-20'>
                  <div>
                    {profile?.id}
                   {/* <div
                      className={`h-48 w-full lg:h-64 
                      ${getGradient(profile?.username)}`}
                  /> */}
                      <div className={`${profileWidth} -mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5`}>
                          <div className="relative group h-24 w-24 rounded-full overflow-hidden sm:h-32 sm:w-32">
                              {/* {settingsPage && (
                                  <button
                                      className="absolute bg-gray-800 bg-opacity-50 hover:bg-opacity-70 w-full h-full z-10 transition-all flex items-center justify-center"
                                      onClick={() =>
                                          alert('Image upload has been disabled for demo purposes.')
                                      }
                                  >
                                      <UploadIcon className="h-6 w-6 text-white" />
                                  </button>
                              )} */}
                              {/* image card */}
                          </div>
                          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                              <div className="flex min-w-0 flex-1 items-center space-x-2">
                              <h1 className="text-2xl font-semibold text-white truncate">{profile?.id}</h1>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
        </CoreLayout>
    )
  }