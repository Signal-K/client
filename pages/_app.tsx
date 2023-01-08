import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";
import { ChakraProvider } from '@chakra-ui/react';

function MyApp({ Component, pageProps }: AppProps) {
  const AnyComponent = Component as any;
  const activeChainId = ChainId.Polygon; // Set to `.Mumbai` for testnet interaction
  const queryClient = new QueryClient();

  return (
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
  )
}

export default MyApp;