import { ethers } from "ethers";
import { useState } from "react";

import contractAddress from '../../../contracts/chain-info/deployments/map.json';
import contractAbi from '../../../contracts/chain-info/contracts/Box.json';

export function useGetValue() {
    const [boxValue, setBoxValue] = useState();

    async function getValue() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = contractAddress["5"]["Box"][0];
            const abi = contractAbi.abi;
            const BoxContract = new ethers.Contract(contract, abi, provider);
            const value = await BoxContract.retrieve();
        } catch {
            console.log("error");
        }
    }

    return { boxValue, getValue };
};