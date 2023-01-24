import type { NextPage } from "next";
import styles from '../styles/planetInteraction.module.css';
import {
  ConnectWallet,
  useAddress,
  //useEditionDrop,
  useOwnedNFTs,
  useContract,
} from '@thirdweb-dev/react';
import { PLANETS_ADDRESS } from "../constants/contractAddresses";
import { useRouter } from "next/router";
import MintContainer from "../components/MintContainer";

const Home: NextPage = () => {
  const { contract: editionDrop} = useContract(PLANETS_ADDRESS, 'edition-drop');
  const address = useAddress();
  const router = useRouter();
  const { data: ownedNfts, isLoading, isError, } = useOwnedNFTs(editionDrop, address);
  if (!address) { // Enable users to connect their wallet if there isn't a connected wallet
    return (
      <div className={styles.container}>
        <ConnectWallet />
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!ownedNfts || isError) {
    return <div>Error</div>;
  }

  if (ownedNfts.length === 0) { // If the connected wallet has 0 NFTs in the planet collection
    return (
      <div className={styles.container}>
        <MintContainer />
      </div>
    )
  }

  return ( // Show this if the connected address has an NFT from the planet collection
    <div className={styles.container}>
      <button
        className={`${styles.mainButton} ${styles.spacerBottom}`}
        onClick={() => router.push(`/play`)}
      >Planet interaction</button>
    </div>
  );
};

export default Home;