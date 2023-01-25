import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";
import { ChakraProvider } from '@chakra-ui/react';

import { useState } from "react";

// For off-chain authentication (Supabase)
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';

// For threejs generator components
import 'bootstrap/dist/css/bootstrap.min.css';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

function MyApp({ Component, pageProps }: AppProps<{
    initialSession: Session, // Supabase user session
  }>) {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const AnyComponent = Component as any;
  const activeChainId = ChainId.Polygon; // Set to `.Mumbai` for testnet interaction
  const queryClient = new QueryClient();

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider 
          desiredChainId={activeChainId}
          authConfig={{
            domain: "sailors.skinetics.tech",
            authUrl: "/api/auth",
            loginRedirect: "/"
          }}
        >
          <MoralisProvider initializeOnMount={false}>
            <ChakraProvider>
              <Header />
              <AnyComponent {...pageProps} />
            </ChakraProvider>
          </MoralisProvider>
        </ThirdwebProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  )
}

export default MyApp;