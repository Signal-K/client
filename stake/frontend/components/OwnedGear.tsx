import { 
    ThirdwebNftMedia,
    useAddress,
    useOwnedNFTs,
    Web3Button,
} from "@thirdweb-dev/react";
import { EditionDrop, SmartContract } from "@thirdweb-dev/sdk";
import React from "react";
import LoadingSection from "./LoadingSection";
import styles from '../styles/planetInteraction.module.css';
import { HELPER_ADDRESS } from "../constants/contractAddresses";

type Props = {
    multitoolContract: EditionDrop,
    helperContract: SmartContract<any>;
};

export default function OwnedGear ({ multitoolContract, helperContract }: Props) { // Shows the multitools in a user's wallet and allows them to stake/equip said multitools
    const address = useAddress();
    const { data: ownedMultitools, isLoading } = useOwnedNFTs( // Which nfts does the user hold from the multitools contract
        multitoolContract,
        address,
    );

    if (isLoading) {
        return <LoadingSection />
    }

    async function equip(id: string) {
        if (!address) return;
        const hasApproval = await multitoolContract.isApproved( // The contract requires approval to be able to transfer/transact the multitool
            address, HELPER_ADDRESS, // Does the helper contract have the ability to transfer NFTs from the multitool contract?
        );

        if (!hasApproval) {
            await multitoolContract.setApprovalForAll(HELPER_ADDRESS, true);
        }

        await helperContract.call('stake', id);
        window.location.reload();
    }

    return (
        <>
          <div className={styles.nftBoxGrid}>
            {ownedMultitools?.map((p) => (
              <div className={styles.nftBox} key={p.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={p.metadata}
                  className={`${styles.nftMedia} ${styles.spacerTop}`}
                  height={"64"}
                />
                <h3>{p.metadata.name}</h3>
    
                <div className={styles.smallMargin}>
                  <Web3Button
                    colorMode="light"
                    contractAddress={HELPER_ADDRESS}
                    action={() => equip(p.metadata.id)}
                  >
                    Equip
                  </Web3Button>
                </div>
              </div>
            ))}
          </div>
        </>
    );
}