import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import anomalyGovernorABI from '../../../contracts/chain-info/contracts/AnomalyGovernor.json';
import contractAddress from '../../../contracts/chain-info/deployments/map.json';
import boxContractAbi from '../../../contracts/chain-info/contracts/Box.json';
import { useLocalStorage } from './useLocalStorage';

export function useCreateProposal() {
    const [proposal, setProposal] = useState();
    const [proposalDescription, setProposalDescription] = useState();
    const [newValue, setValue] = useState();
    const { setLocalStorage, clearLocalStorage, getLocalStorage } = useLocalStorage()

    useEffect(() => {
        if (getLocalStorage('id')) {
            setProposal(getLocalStorage('id'))
        };
    }, []);

    async function createProposal(signer, proposalDescription, value) {
        try {
            clearLocalStorage()
            const boxContract = contractAddress["5"]["Box"][0];
            const anomalyGovernor = contractAddress["5"]["AnomalyGovernor"][0];
            const boxAbi = boxContractAbi.abi;
            const anomalyGovernorAbi = anomalyGovernorABI.abi;
            const anomalyGovernorContractInstance = new ethers.Contract(anomalyGovernor, anomalyGovernorABI, signer);
            const boxInterface = new ethers.utils.Interface(boxAbi);
            const encodedFunction = boxInterface.encodeFunctionData('store', [value]);

            const proposeTx = await anomalyGovernorContractInstance.propose([boxContract], [0], [encodedFunction], proposalDescription, { gasLimit: 1000000 })
            const proposeReceipt = await proposeTx.wait(3)

            const proposalId = proposeReceipt.events[0].args.proposalId

            const bnValue = ethers.BigNumber.from(proposalId);

            setProposal(bnValue.toString());
            setValue(value);
            setProposalDescription(proposalDescription);

            setLocalStorage('id', proposalId);
            console.log('id', proposalId);
        } catch (err) {
            console.log(err)
        }
    }
    return { createProposal, proposal, newValue, proposalDescription }
}