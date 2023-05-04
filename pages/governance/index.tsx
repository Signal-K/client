import React, { useEffect } from "react";
//import { useMetamaskState } from "../../components/Governance/Connections/ConnectWallet";
//import styles from '../../styles/governance/governance.module.css';
import styles from '../../styles/Staking-P2E/planetInteraction.module.css';
import { ConnectWallet, useAddress, useContract, useContractRead, Web3Button } from "@thirdweb-dev/react";
import CoreLayout from "../../components/Core/Layout";

export default function GovernanceDAOIndex () {
    //const { isConnected, account, signer, connectToMetamask } = useMetamaskState();
    const address = useAddress();
    const contractAddress = '0xd606dead5014AfCc5678EeF3EB1C7bEc64718b34';
    const { contract } = useContract("0xd606dead5014AfCc5678EeF3EB1C7bEc64718b34");
    const { data, isLoading } = useContractRead(contract, "proposals");
    const { data: proposal, isLoading: proposalLoading } = useContractRead(contract, 'proposals', 0); // Set the index to the specific planet id, map the planet id to the dao id
    const { data: hasVoted, isLoading: hasVotedLoading } = useContractRead(contract, 'hasVoted', 0, address);

    return (
        <><CoreLayout>
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.card}>
                        <ConnectWallet />
                        <h1>Proposal Voting</h1>
                        <div>
                            {address ? (
                                <div>
                                    {proposalLoading ? (
                                        <div>
                                            <h2>{proposal/*[0]*/}</h2>
                                            {/*<Web3Button
                                                contractAddress={contractAddress}
                                                //action={(contract) => contract.call("vote", 0, true)}
                                            >Yes</Web3Button>*/}
                                            <br />
                                            {/*<Web3Button
                                                contractAddress={contractAddress}
                                                //action={(contract) => contract.call("vote", 0, false)}
                                            >No</Web3Button>*/}
                                        </div>
                                    ) : (
                                        <div><p>Loading</p></div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p>Connect your wallet to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {/*<Header connectToMetamask={connectToMetamask} isConnected={isConnected} account={account} signer={signer} />
            <Navbar signer={signer} />
            <Footer />*/}</CoreLayout>
        </>
    );
};