import React, { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import { useAddress, useNetwork, useContract, ConnectWallet, useNFTBalance, Web3Button, useContractWrite } from "@thirdweb-dev/react";
import { ChainId } from '@thirdweb-dev/sdk';
import { AddressZero } from '@ethersproject/constants';
import styles from '../../styles/Proposals/proposalsIndex.module.css';

// For testing -> using contracts from pages/stake
import { PLANETS_ADDRESS } from "../../constants/contractAddresses";
import { MINERALS_ADDRESS } from "../../constants/contractAddresses";
import CoreLayout from "../../components/Core/Layout";

// For contract actions
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
//import "dotenv/config";
const NETWORK = "goerli";
//const GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY;
const sdk = ThirdwebSDK.fromPrivateKey('71cc30029998f3282069d43e547efd1894f51269e15a833815e5ed5f418a38e7', NETWORK);

const VotingEntrance = () => {
    const address = useAddress();
    const network = useNetwork();
    console.log("👋🏻 Address: ", address);

    // Initialise edition drop contract
    const editionDropAddress = PLANETS_ADDRESS;
    const { contract: editionDrop } = useContract(
        editionDropAddress,
        'edition-drop',
    );

    // Initialise token contract
    var voteTokenContract = MINERALS_ADDRESS;
    voteTokenContract = "0xa791a3e0F2D2300Ee85eC7105Eee9E9E8eb57908"; // Temporarily testing with a contract deployed based on MINERALS_ADDRESS but immediately separate. Will be able to transfer between the two
    const { contract: token } = useContract(
        voteTokenContract,
        'token',
    );

    // Initialise vote contract
    const voteModuleAddress = "0x4f3338D54520521E755Aa90B7ECCeB6FC7ab1705";
    const { contract: vote } = useContract(
        voteModuleAddress,
        'vote',
    );

    // Mutation for creating proposals
    const { mutateAsync: propose, isLoading } = useContractWrite(vote, "propose")
    async function createProposalTest () {
        const voteContract = await sdk.getContract("0xd0F59Ed6EBf7f754fC3D5Fd7bb3181EBDeEd9E9d", "vote");
        const tokenContract = await sdk.getContract("0xa791a3e0F2D2300Ee85eC7105Eee9E9E8eb57908", "token");
        const description = "Here's the proposal contents";
        const amount = 420_000; 
        const executions = [
            {
                toAddress: tokenContract.getAddress(),
                nativeTokenValue: 0,
                transactionData: token.encoder.encode("mintTo", [
                    voteContract.getAddress(),
                    ethers.utils.parseUnits(amount.toString(), 18),
                ]),
            },
        ];

        await vote.propose(description, executions);
        console.log("✅ Successfully created proposal to mint tokens");
    };

    const createProposal = async () => {
        try {
            const data = await propose({ args: [targets, values, calldatas, description] });
            console.info("contract call successs", data);
        } catch (err) {
            console.error("contract call failure", err);
        }
    }

    // Check if the user has the edition drop (allows them to enter the DAO)
    const { data: nftBalance } = useNFTBalance(editionDrop, address, '0');
    const hasClaimedNFT = useMemo(() => {
        return nftBalance && nftBalance.gt(0);
    }, [nftBalance]);

    // Stores information relating to the user's token balance
    const [memberTokenAmounts, setMemberTokenAmounts] = useState([]); // Save the original contract tokens [amounts] here as well
    const [memberAddresses, setMemberAddresses] = useState([]); // Stores all the users in our DAO

    // Shorten user's wallet address for frontend optimisation
    const shortenAddress = (str) => {
        return str.substring(0, 6) + '...' + str.substring(str.length - 4);
    };

    // Store list of proposals and the voting state/status of the address (authenticated user)
    const [proposals, setProposals] = useState([]);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false); // On specific proposal

    // Retrieve all existing proposals from the vote contract
    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }

        // Grab all proposals
        const getAllProposals = async () => {
            try {
                const proposals = await vote.getAll();
                setProposals(proposals);
                console.log('🌈 Proposals: ', proposals);
            } catch (error) {
                console.log('Failed to get proposals: ', error);
            };
        };
        getAllProposals();
    }, [hasClaimedNFT, vote]);

    // Check if the user has already voted on the specific proposal
    useEffect(() => {
        if (!hasClaimedNFT) { return; };
        if (!proposals.length) { return; }; // If the proposals haven't been fetched yet
        const checkIfUserHasVoted = async () => {
            try {
                const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
                setHasVoted(hasVoted);
                if (hasVoted) {
                    console.log("You've already voted on this proposal");
                } else {
                    console.log("You are able to vote on this proposal");
                };
            } catch (error) {
                console.log('Failed to check if user has voted: ', error);
            };
        };
        checkIfUserHasVoted();
    }, [hasClaimedNFT, proposals, address, vote]);

    // Grab all the addresses of members with the editionDrop NFT (aka holders -> members of the DAO)
    useEffect(() => {
        if (!hasClaimedNFT) { return; };
        const getAllAddresses = async () => {
            try {
                const memberAddresses = await editionDrop?.history.getAllClaimerAddresses(0); // For tokenId 0 on edition drop
                setMemberAddresses(memberAddresses);
                console.log('🚀 Members addresses', memberAddresses);
            } catch ( error ) {
                console.error('Failed to get member list: ', error);
            };
        };
        getAllAddresses();
    }, [hasClaimedNFT, editionDrop?.history]);

    // Grab the quantity of vote tokens each member holds
    useEffect(() => {
        if (!hasClaimedNFT) { return; };
        const getAllBalances = async () => {
            try {
                const amounts = await token?.history.getAllHolderBalances();
                setMemberTokenAmounts(amounts);
                console.log('👜 Amounts', amounts);
            } catch (error) {
                console.error('Failed to get member balances: ', error);
            };
        };
        getAllBalances();
    }, [hasClaimedNFT, token?.history]);

    // Combine memberAddresses & memberTokenAmounts into a single array
    const memberList = useMemo(() => {
        return memberAddresses.map((address) => { // Find the number of tokens each holder has OR return 0
            const member = memberTokenAmounts?.find(
                ({ holder }) => holder === address,
            );
    
            return {
                address,
                tokenAmount: member?.balance.displayValue || '0',
            };
        });
    }, [memberAddresses, memberTokenAmounts]);

    if (address && network?.[0].data.chain.id !== ChainId.Goerli) {
        return (
            <div className="unsupported-network">
                <h2>Please connect to Goerli</h2>
                <p>
                    This dapp only works on the Goerli network, please switch networks in your connected wallet.
                </p>
            </div>
        );
    };

    // If the user hasn't connected their wallet yet
    if (!address) {
        return (
            <div className="landing">
                <h1>Welcome to the voting area</h1>
                <div className="btn-hero">
                    <ConnectWallet />
                </div>
            </div>
        );
    };

    // If the user has connected their wallet, and their wallet has editionDrop[0], display the DAO
    if (hasClaimedNFT) {
        return (
            <CoreLayout>
                <div className="member-page">
                    <h1>🦔 Planet Voting page</h1>
                    <div>
                        <div>
                            <h2>Member list</h2>
                            <table className="card">
                                <thead>
                                    <tr>
                                        <th>Address</th>
                                        <th>Token Amount ($VOTE)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberList.map((member) => {
                                        return (
                                            <tr key={member.address}>
                                                <td>{shortenAddress(member.address)}</td>
                                                <td>{member.tokenAmount}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h2>Active Proposals</h2>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsVoting(true);
                                    const votes = proposals.map((proposal) => {
                                        const voteResult = {
                                            proposalId: proposal.proposalId,
                                            vote: 2,
                                        };

                                        proposal.votes.forEach((vote) => {
                                            const elem = document.getElementById(
                                                proposal.proposalId + '-' + vote.type,
                                            );

                                            if (elem.checked) {
                                                        voteResult.vote = vote.type;
                                                        return;
                                                    }
                                                });

                                                return voteResult;
                                            });

                                            try {
                                                const delegation = await token.getDelegationOf(address);

                                                if (delegation === AddressZero) {
                                                    await token.delegateTo(address);
                                                }

                                                try {
                                                    await Promise.all(
                                                        votes.map(async ({ proposalId, vote: _vote }) => {
                                                            const proposal = await vote.get(proposalId);
                                                            if (proposal.state === 1) {
                                                                return vote.vote(proposalId, _vote);
                                                            }
                                                        return;
                                                    }),
                                                );

                                                try {
                                                    await Promise.all(
                                                        votes.map(async ({ proposalId }) => {
                                                            const proposal = await vote.get(proposalId);
                                                            if (proposal.state === 4) {
                                                                return vote.execute(proposalId);
                                                            }
                                                        }),
                                                    );
                                                    setHasVoted(true);
                                                    console.log('successfully voted');
                                                } catch (err) {
                                                    console.error('failed to execute votes', err);
                                                }
                                            } catch (err) {
                                            console.error('failed to vote', err);
                                        }
                                    } catch (err) {
                                        console.error('failed to delegate tokens');
                                    } finally {
                                        // in *either* case we need to set the isVoting state to false to enable the button again
                                        setIsVoting(false);
                                    }
                                }}
                            >
                                {proposals.map((proposal) => (
                                    <div key={proposal.proposalId} className="card">
                                        <h5>{proposal.description}</h5>
                                        <div>
                                        {proposal.votes.map(({ type, label }) => (
                                        <div key={type}>
                                            <input
                                                type="radio"
                                                id={proposal.proposalId + '-' + type}
                                                name={proposal.proposalId}
                                                value={type}
                                                defaultChecked={type === 2}
                                            />
                                            <label htmlFor={proposal.proposalId + '-' + type}>{label}</label>
                                        </div>
                                        ))};
                                    </div>
                                </div>
                                ))}
                                <button disabled={isVoting || hasVoted} type="submit">{isVoting ? 'Voting...' : hasVoted ? 'You Already Voted' : 'Submit Votes' }</button>
                                {!hasVoted && ( <small>This will trigger multiple transactions that you will need to sign.</small> )}
                            </form>
                            <button onClick={createProposalTest}>Create Proposal</button>
                        </div>
                    </div>
                </div>
            </CoreLayout>
        );
    };

    // Render mint nft screen
    return (
        <CoreLayout>
            <div className="mint-nft">
                <h1>Mint your free 🍪DAO Membership NFT</h1>
                <div className="btn-hero">
                    <Web3Button contractAddress={editionDropAddress} action={(contract) => { contract.erc1155.claim(0, 1); }}
                    onSuccess={() => { console.log( `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`, ); }}
                    onError={(error) => { console.error('Failed to mint NFT', error); }}
                >
                    Mint your NFT (FREE)
                    </Web3Button>
                </div>
            </div>
        </CoreLayout>
    );
};

export default VotingEntrance;