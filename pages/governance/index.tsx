import React, { useEffect } from "react";
import { Header } from "../../components/Governance/Header";
import { Footer } from '../../components/Governance/Footer';
import { Navbar } from "../../components/Governance/Navbar";
//import { useMetamaskState } from "../../components/Governance/Connections/ConnectWallet";
//import styles from '../../styles/governance/governance.module.css';
import styles from '../../styles/Staking-P2E/planetInteraction.module.css';
import { NextPage } from "next";
import { useAddress } from "@thirdweb-dev/react";

const GovernanceDAOIndex: NextPage = () => {
    //const { isConnected, account, signer, connectToMetamask } = useMetamaskState();
    const address = useAddress();
    const contractAddress = ''; // Set this to deployed "planetProposal.sol" contract

    return (
        <>
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.card}>

                    </div>
                </main>
            </div>
            {/*<Header connectToMetamask={connectToMetamask} isConnected={isConnected} account={account} signer={signer} />
            <Navbar signer={signer} />
            <Footer />*/}
        </>
    );
};

export default GovernanceDAOIndex;