import type { AppProps } from "next/app";
import React, { useState } from "react";

/* For proposals smart contract
import { StateContextProvider } from "../context/proposals";*/
import { ThirdwebProvider, ChainId } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
/*import { MoralisProvider } from "react-moralis";
// Styling provider
import { ChakraProvider } from '@chakra-ui/react';
import Header from "../components/Header"; */

// For off-chain authentication (Supabase)
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';

/* For threejs generator components
import 'bootstrap/dist/css/bootstrap.min.css';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css'; */

function MyApp({ Component, pageProps }: AppProps<{
    initialSession: Session, // Supabase user session
  }>) {
  //const [supabase] = useState(() => createBrowserSupabaseClient());
  const AnyComponent = Component as any;
  const activeChainId = ChainId.Polygon; // Set to `.Mumbai` for testnet interaction
  const queryClient = new QueryClient();

  return (
    <AnyComponent {...pageProps} />
  )

  {/* return (<SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider 
          desiredChainId={activeChainId}
          authConfig={{
            domain: "sailors.skinetics.tech",
            authUrl: "/api/auth",
          }}
        >
          {/*<MoralisProvider initializeOnMount={false}>
            {/*<StateContextProvider>
              <ChakraProvider> 
                <AnyComponent {...pageProps} />
              {/*</ChakraProvider>
            </StateContextProvider>
          </MoralisProvider>
        </ThirdwebProvider>
      {/*</QueryClientProvider>*/}
    {/*</SessionContextProvider>*/}
}

export default MyApp;