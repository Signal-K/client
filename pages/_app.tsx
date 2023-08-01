// Global imports
import React, { useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';

// Styling imports
import '../styles/globals.css';
import { ChakraProvider } from '@chakra-ui/react';

// Offchain/Postgres Session Provider
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

// On-Chain session provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // For Lens graphql queries
// import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
// import { StateContextProvider } from "../context/proposals";
// import { MoralisProvider } from "react-moralis";

// Anomaly/Generator Providers
import 'bootstrap/dist/css/bootstrap.min.css';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  // const activeChainId = ChainId.Goerli; // Set to `.Mumbai` for testnet interaction, or Polygon for mainnet (with lens) or Goerli (for testnet interaction with other contracts. Maybe move those over to Mumbai? Can we set this per page, or duplicate with Moralis?)
  const queryClient = new QueryClient();

  return (
    <>
      <Head>
        {/* <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              window.$widget = window.$widget || {};
              window.WIDGET_SITE_ID = 'aadf2cc9-4de3-42e2-af04-845ccc65785c';
              (function(w,d){
                var s = d.createElement('script');
                s.defer = true;
                s.src = '//www.widgetscripts.com/embed.js';
                d.getElementsByTagName('head')[0].appendChild(s);
              })(window,document);
            `,
          }}
        /> */}
        <script async data-nf='{"formurl":"https://noteforms.com/forms/user-feedback-rkkndz","emoji":"💬","position":"right","bgcolor":"#3B82F6","width":"500"}' src='https://d29ykaszcd1t1v.cloudfront.net/173eb069-229a-481a-98ad-4a70caf83ee6/widgets/embed-min.js'></script>
      </Head>
      <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <QueryClientProvider client={queryClient}>
        {/*<ThirdwebProvider
          desiredChainId={5} // Because our staking contracts are on Goerli, we'll need to move them onto Polygon/Mumbai so they work with the provider here. To-Do: Set to mumbai and confirm if Lens still works || Lens is using the contract ABI & Graphql -> write might require being set back to Polygon (with the Lens Mumbai/Polygon ABI & address)
          authConfig={{
            domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN, // originally set to sailors.skinetics.tech
            authUrl: "/api/auth",
          }}
        >*/}
          <ChakraProvider>
            {/* <MoralisProvider initializeOnMount={false}>/> */}
            <Component {...pageProps} />
            
          </ChakraProvider>
        {/* </ThirdwebProvider> */}
      </QueryClientProvider>
    </SessionContextProvider>
    </>
  );
}

export default MyApp;