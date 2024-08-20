import React from "react";
import styles from '../../../styles/Staking-P2E/Gameplay.module.css';
import { NFT } from "@thirdweb-dev/sdk";

//const Minerals = ( <div className={styles.slide}><img src='.stake/mineral.png' height='48' width='48' alt='mineral' /></div>) // This should be changed to the collection picture (via Thirdweb)
const Minerals = ( <div className={styles.slide}><img src='https://gateway.ipfscdn.io/ipfs/QmNsxvqgWqZfRsT1JprA3wZFoxPxg43jVw5YDxUnqtnC6L/9f19e842-cd67-45fe-9ef7-dd67bfabe772-removebg-preview.png' height='48' width='48' alt='mineral' /></div>) 
type Props = { multitool: NFT | undefined; };

export default function GameplayAnimation ({ multitool }: Props ) {
    if (!multitool) { return <div style={{ marginLeft: 8 }}>I need a multitool!</div>; };
    return (
        <div className={styles.slider}>
            <div className={styles.slideTrack}>
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
                {Minerals}
            </div>
        </div>
    );
};