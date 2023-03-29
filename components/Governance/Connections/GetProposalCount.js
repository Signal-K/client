import { ethers } from "ethers";
import { useState } from "react";
import contractAddress from '../../../contracts/chain-info/deployments/map.json';
import contractAbi from '../../../contracts/chain-info/contracts/AnomalyGovernor.json';

export function useGetProposals() {
    const [proposalCount, setProposalCount] = useState();
    async function getProposalCount() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = contractAddress["5"]["AnomalyGovernor"][0];
            const abi = contractAbi.abi;
            const GovernanceContract = new ethers.Contract(contract, abi, provider);
            const value = await GovernanceContract.getNumberOfProposals(); // Call this from AnomalyGenerator.sol contract
            setProposalCount(value.toString());
        } catch (err) {
            console.log(err);
        }
    }

    return { proposalCount, getProposalCount };
}