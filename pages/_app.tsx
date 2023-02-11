// Global imports
import React, { useState } from 'react';

// Styling imports
import '../styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react';

// Offchain/Postgres Session Provider
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

// On-Chain session provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // For Lens graphql queries
// import { ChakraProvider } from '@chakra-ui/react'; -> We're replacing the chakra lens feed (for now) with <Card /> from `./components/`
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const activeChainId = ChainId.Polygon; // Set to `.Mumbai` for testnet interaction (with lens) or Goerli (for testnet interaction with other contracts. Maybe move those over to Mumbai? Can we set this per page, or duplicate with Moralis?)
  const queryClient = new QueryClient();

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider
          desiredChainId={activeChainId}
          authConfig={{
            domain: "sailors.skinetics.tech",
            authUrl: "/api/auth",
          }}
        >
          <ChakraProvider>
            {/* <MoralisProvider initializeOnMount={false}>/> */}
            <Component {...pageProps} />
          </ChakraProvider>
        </ThirdwebProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  );
}

export default MyApp;