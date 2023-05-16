export default function OwnedGear () {
    return "This export is a stub for the original ownedGear component"
}

/*import React from "react";
import styles from '../../../styles/Staking-P2E/planetInteraction.module.css';

import { ThirdwebNftMedia, useAddress, useOwnedNFTs, Web3Button } from "@thirdweb-dev/react";
import { EditionDrop, SmartContract } from "@thirdweb-dev/sdk";

import LoadingSection from "./LoadingSection";
import { HELPER_ADDRESS } from "../../../constants/contractAddresses";

type Props = { multitoolContract: EditionDrop, helperContract: SmartContract<any>; };

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
      const hasApproval = await multitoolContract.isApproved( // Is the contract approved by the account to be able to transfer the multitool?
          address,
          HELPER_ADDRESS
      );

      if (!hasApproval) {
          await multitoolContract.setApprovalForAll(HELPER_ADDRESS, true);
      };

      await helperContract.call("stake", id);

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

                    <Web3Button
                        contractAddress={HELPER_ADDRESS}
                        action={() => equip(p.metadata.id)}
                    >
                        Equip
                    </Web3Button>
                </div>
            ))}
        </div>
    </>
);
}*/