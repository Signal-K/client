// Global imports
import React, { useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThirdwebProvider } from "@thirdweb-dev/react";

// Styling imports
import '../styles/globals.css';

// Offchain/Postgres Session Provider
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const activeChain = "ethereum";

  return (
    <>
      <Head>
      </Head>
      <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain={activeChain}
    >
      <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
>
            <Component {...pageProps} />
    </SessionContextProvider>
    </ThirdwebProvider>
    </>
  );
}

export default MyApp;