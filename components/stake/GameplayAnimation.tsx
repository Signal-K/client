import { NFT } from "@thirdweb-dev/sdk"; // Replaces edition drop metadata tag req.
import React from "react";
import styles from '../../styles/Staking-P2E/Gameplay.module.css';

const Minerals = (
    <div className={styles.slide}><img src='../../assets/mineral.png' height='48' width='48' alt='mineral' /></div>
);

type Props = {
    multitool: NFT | undefined;
};

export default function GameplayAnimation({ multitool }: Props) {
    if (!multitool) {
        return <div style={{ marginLeft: 8 }}>I need a multitool</div>;
    }

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