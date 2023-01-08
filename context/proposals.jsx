import React, { useContext, createContext } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const { contract } = useContract('0xed6e837Fda815FBf78E8E7266482c5Be80bC4bF9'); // Goerli contract -> will update to Polygon mainnet when in production
    const { mutateAsync: createProposal } = useContractWrite(contract, 'createProposal'); // Call function & create a proposal, passing in params from the form
    const address = useAddress();
    const connect = useMetamask();

    // Publish a proposal on-chain
    const publishProposal = async (form) => {
        try {
            const data = await createProposal([
                address, // Owner - creator of the campaign. useMetamask();
                form.title, // From CreateProposal.jsx
                form.description,
                form.target,
                new Date(form.deadline).getTime(),
                form.image,
            ]);

            console.log("Contract call success: ", data);
        } catch (error) {
            console.error('Contract call resulted in a failure, ', error);
        }
    }

    // Retrieve proposals from on-chain
    const getProposals = async () => {
        const proposals = await contract.call('getProposals'); // Essentially a get request to the contract
        const parsedProposals = proposals.map((proposal) => ({ // Take an individual proposal, immediate return
            owner: proposal.owner,
            title: proposal.title,
            description: proposal.description,
            target: ethers.utils.formatEther(proposal.target.toString()),
            deadline: proposal.deadline.toNumber(), // Will transform to date format later
            amountCollected: ethers.utils.formatEther(proposal.amountCollected.toString()),
            image: proposal.image,
            pId: proposal.i, // Index of proposal
        }));

        console.log(parsedProposals);
        console.log(proposals);
        return parsedProposals; // This is sent to the `useEffect` in `Home.jsx` page
    }

    const getUserProposals = async () => { // Get proposals that a specific user (authed) has created
        const allProposals = await getProposals();
        const filteredProposals = allProposals.filter((proposal) =>
            proposal.owner === address
        );
        return filteredProposals;
    }

    const vote = async (pId, amount) => {
        const data = await contract.call('voteForProposal', pId, { value: ethers.utils.parseEther(amount) });
    
        return data;
    }

    const getVotes = async (pId) => {
        const votes = await contract.call('getVoters', pId);
        const numberOfVotes = votes[0].length;
        const parsedVotes = [];

        for (let i = 0; i < numberOfVotes; i++) {
            parsedVotes.push({
                donator: donations[0][i],
                donation: ethers.utils.formatEther(donations[1][i].toString)
            })
        }

        return parsedVotes;
    }

    return(
        <StateContext.Provider
            value={{ address,
                contract,
                connect,
                createProposal: publishProposal,
                getProposals,
                getUserProposals,
                vote,
                getVotes,
            }}
        >
            {children}
        </StateContext.Provider>
    )
}

// Hook to get the context returned to node frontend
export const useStateContext = () => useContext(StateContext);