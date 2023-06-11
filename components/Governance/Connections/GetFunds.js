import { ethers } from "ethers";
import { useState } from "react";
import contractAddress from '../../../contracts/chain-info/deployments/map.json';
import contractAbi from '../../../contracts/chain-info/contracts/GovernanceToken.json';

export function useRequestFunds() {
    async function requestFunds(signer) {
        try {
            const contract = contractAddress["5"]["GovernanceToken"][0];
            const abi = contractAbi.abi;
            const governanceTokenContract = new ethers.Contract(contract, abi, signer);
            let tx = await governanceTokenContract.claimToken({ gasLimit: 1000000 });
            await tx.wait(1);
        } catch (err) { console.log(err); };
    }

    return { requestFunds };
}