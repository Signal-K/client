import React from "react";
import styles from '../../styles/Staking-P2E/planetInteraction.module.css';

import { ThirdwebNftMedia, useAddress, useMetadata, useContractRead, useTokenBalance, Web3Button } from "@thirdweb-dev/react";
import { SmartContract, Token } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { HELPER_ADDRESS } from "../../constants/contractAddresses"; // Create a param/argument so that the helper contract can be changed per page like the rewards/planet (aka character) contracts

import ApproxRewards from "./ApproxRewards";

type Props = { helperContract: SmartContract<any>; rewardsContract: Token; };

export default function Rewards({ helperContract, rewardsContract }: Props ) { // Shows the token metadata, amount of tokens in wlalet, claimable amount (reward)
    const address = useAddress();
    const { data: tokenMetadata } = useMetadata(rewardsContract);
    const { data: currentBalance } = useTokenBalance(rewardsContract, address);
    const { data: unclaimedAmount } = useContractRead(
        helperContract,
        'calculateRewards',
        address
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p>Your <b>Minerals</b></p>
            {tokenMetadata && ( // If exists/loaded
                <ThirdwebNftMedia
                    // @ts-ignore
                    metadata={tokenMetadata}
                    height={'48'}
                />
            )}
            <p className={styles.noGapBottom}>
                Balance: <b>{currentBalance?.displayValue}</b>
            </p>
            <p>
                Unclaimed: {" "}
                <b>{unclaimedAmount && ethers.utils.formatUnits(unclaimedAmount)}</b>
            </p>
            <ApproxRewards helperContract={helperContract} />
            <div className={styles.smallMargin}>
                <Web3Button
                    contractAddress={HELPER_ADDRESS}
                    action={(contract) => contract.call('claim')}
                >Claim Rewards</Web3Button>
            </div>
        </div>
    );
}