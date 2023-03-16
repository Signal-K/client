import React from "react";
import styles from '../../styles/Staking-P2E/planetInteraction.module.css';

import { ConnectWallet, useAddress, useContract } from "@thirdweb-dev/react";

import { ApproxRewards, CurrentGear, GameplayAnimation, LoadingSection, OwnedGear, Rewards, Shop, ShopItem } from "../../components/Gameplay/Stake";
import { HELPER_ADDRESS, PLANETS_ADDRESS, MINERALS_ADDRESS, MULTITOOLS_ADDRESS } from "../../constants/contractAddresses";

export default function StakePlay () {
    const address = useAddress(); // Connect to user wallet
    const { contract: helperContract } = useContract(HELPER_ADDRESS); // Connect to all the contracts relevant to this page
    const { contract: planetContract } = useContract(PLANETS_ADDRESS, 'edition-drop');
    const { contract: multitoolContract } = useContract(MULTITOOLS_ADDRESS, 'edition-drop');
    const { contract: rewardsContract } = useContract(MINERALS_ADDRESS, 'token'); // Could be for any type of reward/token (e.g. gas, water, minerals). In this case, it's minerals    
    if (!address) { // If user isn't authenticated via Thirdweb
        return ( // This should only happen if an unauthenticated user navigates directly to `/play`, as the only components that point here are locked behind the <ConnectWallet /> component
            <div className={styles.container}>
                <ConnectWallet />
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {helperContract &&
                planetContract &&
                rewardsContract && 
                multitoolContract ? ( // If all the contracts have loaded in
                    <div className={styles.mainSection}>
                        <CurrentGear
                            helperContract={helperContract}
                            planetContract={planetContract}
                            multitoolContract={multitoolContract}
                        />
                        <Rewards
                            helperContract={helperContract}
                            rewardsContract={rewardsContract}
                        />
                    </div>
                ) : ( // Contracts are still loading in
                    <LoadingSection />
                )}

                <hr className={`${styles.divider} ${styles.bigSpacerTop}`} />
                {multitoolContract && helperContract ? (
                    <>
                        <h2 className={`${styles.noGapTop} ${styles.noGapBottom}`}>Your multitools</h2>
                        <div className={styles.shop}>
                            <OwnedGear
                                multitoolContract={multitoolContract}
                                helperContract={helperContract}
                            />
                        </div>
                    </>
                ) : (
                    <LoadingSection />
                )}

                <hr className={`${styles.divider} ${styles.bigSpacerTop}`} />
                {multitoolContract && rewardsContract ? (
                    <>
                        <h2 className={`${styles.noGapTop} ${styles.noGapBottom}`}>Shop</h2>
                        <div className={styles.shop}>
                            <Shop multitoolContract={multitoolContract} />
                        </div>
                    </>
                ) : (
                    <LoadingSection />
                )}
        </div>
    );
};