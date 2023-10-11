// Global imports
import React, { useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';

// Styling imports
import '../styles/globals.css';

// Offchain/Postgres Session Provider
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <>
      <Head>
      </Head>
      <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
>
            <Component {...pageProps} />
    </SessionContextProvider>
    </>
  );
}

export default MyApp;