import React from "react";
import styles from '../../styles/Staking-P2E/Home.module.css';

import { useAddress, useClaimNFT, useEditionDrop, Web3Button } from "@thirdweb-dev/react";
import { PLANETS_ADDRESS } from "../../constants/contractAddresses";

export default function MintContainer () {
    const editionDrop = useEditionDrop(PLANETS_ADDRESS);
    const { mutate: claim } = useClaimNFT(editionDrop);
    const address = useAddress();

    return (
        <div className={styles.collectionContainer}>
            <h1>Edition drop</h1>
            <p>Claim your planet NFT to start playing</p>
            <div className={`${styles.nftBox} ${styles.spacerBottom}`}>
                <img src='./mine.gif' style={{ height: 200 }} />
            </div>
            <Web3Button contractAddress={PLANETS_ADDRESS}
                action={() => {
                    claim({
                        quantity: 1,
                        to: address!,
                        tokenId: 0, // Claim the first nft/planet in the collection. This mutate function will be updated, with the specific value being generated from our Flask API
                    });
                }}
                accentColor="#f5f"
                colorMode='dark'
            >Claim the first planet!</Web3Button>
        </div>
    );
}