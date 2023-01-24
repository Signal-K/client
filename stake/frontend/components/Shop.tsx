import { ThirdwebNftMedia, useNFTs } from "@thirdweb-dev/react";
import { EditionDrop } from "@thirdweb-dev/sdk";
import React, { useEffect } from "react";
import styles from '../styles/planetInteraction.module.css';
import ShopItem from "./ShopItem";

type Props = {
    multitoolContract: EditionDrop;
};

export default function Shop ({ multitoolContract }: Props ) { // Shows all available multitools, their price, and a button to purchase them
    const { data: availableMultitools } = useNFTs(multitoolContract);
    return (
        <>
            <div className={styles.nftBoxGrid}>
                {availableMultitools?.map((p) => (
                    <ShopItem
                        multitoolContract={multitoolContract}
                        item={p}
                        key={p.metadata.id.toString()}
                    />
                ))}
            </div>
        </>
    )
}