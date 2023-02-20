import React, { useState, useEffect } from "react";
import styles from '../../styles/Staking-P2E/planetInteraction.module.css';

import { ThirdwebNftMedia, useAddress, useNFT } from "@thirdweb-dev/react"; // https://www.notion.so/skinetics/February-Flow-Planets-8c864b66147c447f82136772336e9bc6?pvs=4#3f8fd072ce514882a1a05e89a6cf63db
import { EditionDrop, NFT, SmartContract } from "@thirdweb-dev/sdk";
import ContractMappingResponse from "../../constants/contractMappingResponse";
import GameplayAnimation from "./GameplayAnimation";
import { PLANETS_ADDRESS } from "../../constants/contractAddresses";

type Props = {
    helperContract: SmartContract<any>;
    planetContract: EditionDrop;
    multitoolContract: EditionDrop;
};

export default function CurrentGear ({ // Shows the currently equipped planet character & currently equipped multitool
    helperContract,
    planetContract,
    multitoolContract,
}: Props) {
    const address = useAddress();
    const { data: planetNft } = useNFT(planetContract, 0); // Maps the data to the first planet nft (as for this version of the demo, we're only interacting with WASP-48b aka token id 1)
    const [multitool, setMultitool] = useState<NFT>(); // If user has any multitools staked onto the helper contract. Previously <EditionDropMetadata>()
    useEffect(() => {
        (async () => {
            if (!address) return;
            const p = ( await helperContract.call( // Connect to the helper contract
                'playerHelper', // Referred on contract as `playerHelper`, in terms of the frontend/ux it's essentially the `playerMultitool` from `multitoolContract`
                address,
            )) as ContractMappingResponse;
            if (p.isData) { // If there is an equipped (staked) multitool, fetch its metadata
                const multitoolMetadata = await multitoolContract.get(p.value);
                setMultitool(multitoolMetadata);
            }
        })();
    }, [address, helperContract, multitoolContract]); // Refresh this function if any of these values change. This component is reusable across multiple contracts (the contract addresses are defined in the page, not the component)

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className={`${styles.noGapTop}`}>Equipped items</h2>
            <div
                style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                }}
            >
                <div style={{ outline: '1px solid grey', borderRadius: 16}}> {/* Currently equipped player */}
                    {planetNft && (
                        <ThirdwebNftMedia metadata={planetNft?.metadata} height={"64"} />
                    )}
                </div>
                <div style={{ outline: '1px solid grey', borderRadius: 16, marginLeft: 8 }}> {/* Currently equipped multitool */}
                    {multitool && (
                    // @ts-ignore
                    <ThirdwebNftMedia metadata={multitool.metadata} height={'64'} />
                    )}
                </div>
            </div>
            <div // Gameplay animation
                style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 24
                }}
            >
                <img src='./mine.gif' height={64} alt='planet-mining' />
                <GameplayAnimation multitool={multitool} />
            </div>
        </div>
    );
};