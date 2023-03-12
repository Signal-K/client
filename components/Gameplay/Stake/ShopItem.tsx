import React from "react";
import styles from '../../../styles/Staking-P2E/planetInteraction.module.css';

import { ThirdwebNftMedia, useActiveClaimCondition, Web3Button } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { NFT, EditionDrop } from "@thirdweb-dev/sdk";

import { MULTITOOLS_ADDRESS } from "../../../constants/contractAddresses";

type Props = { multitoolContract: EditionDrop; item: NFT; };

export default function ShopItem ({ item, multitoolContract }: Props ) {
    const { data: claimCondition } = useActiveClaimCondition(
        multitoolContract,
        item.metadata.id,
    );
    
    return (
        <div className={styles.nftBox} key={item.metadata.id.toString()}>
            <ThirdwebNftMedia
                metadata={item.metadata}
                className={`${styles.nftMedia} ${styles.spacerTop}`}
                height={"64"}
            />
            <h3>{item.metadata.name}</h3>
            <p>
                Price:{" "}
                <b>
                    {claimCondition && ethers.utils.formatUnits(claimCondition?.price)}{" "}
                     Minerals
                </b>
            </p>
  
            <div className={styles.smallMargin}>
                <Web3Button
                    colorMode="dark"
                    contractAddress={MULTITOOLS_ADDRESS}
                    action={(contract) => contract.erc1155.claim(item.metadata.id, 1)}
                    onSuccess={() => alert("Purchased!")}
                    onError={(error) => alert(error)}
                >Buy</Web3Button>
            </div>
        </div>
    );
};