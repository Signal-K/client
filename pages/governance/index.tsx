import React, { useEffect } from "react";
import { Header } from "../../components/Governance/Header";
import { Footer } from '../../components/Governance/Footer';
import { Navbar } from "../../components/Governance/Navbar";
import { useMetamaskState } from "../../components/Governance/Connections/ConnectWallet";
import styles from '../../styles/governance/governance.module.css';

export default function GovernanceDAOIndex() {
    const { isConnected, account, signer, connectToMetamask } = useMetamaskState();

    return (
        <>
            <Header connectToMetamask={connectToMetamask} isConnected={isConnected} account={account} signer={signer} />
            <Navbar signer={signer} />
            <Footer />
        </>
    )
}