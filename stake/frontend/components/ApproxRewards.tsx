import { useAddress } from "@thirdweb-dev/react";
import { SmartContract } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import ContractMappingResponse from "../types/contractMappingResponse";

type Props = {
    helperContract: SmartContract<any>;
};

export default function ApproxRewards({ helperContract }: Props) { // Calls the contract in Props to estimate the rewards owed to the authenticated player
    const address = useAddress();
    const everyMillisecondAmount = parseInt(
        (10_000_000_000_000 / 2.1).toFixed(0) // Assumes each block takes roughly 2.1 seconds to be mined -> so the tokens earned will be updated. Started when the component is mounted
    );
    
    const [amount, setAmount] = useState<number>(0);
    const [multiplier, setMultiplier] = useState<number>(0);
    useEffect(() => {
        (async () => {
            if (!address) return;
            const p = (await helperContract.call(
                'playerHelper',
                address,
            )) as ContractMappingResponse;
            if (p.isData) { // If a multitool owned by the player IS staked/equipped
                setMultiplier(p.value.toNumber() + 1); // A better multiool (derived as tokenId of multiool contract) gives better rewards
            } else {
                setMultiplier(0);
            };
        })();
    }, [address, helperContract]);

    useEffect(() => { // Update the amount in state based on everyMillisecondAmount
        const interval = setInterval(() => {
            setAmount(amount + everyMillisecondAmount); // update tokens amount (earned)
        }, 100);
        return () => clearInterval(interval); // Clear when the component unmounts
    }, [amount, everyMillisecondAmount]);

    return (
        <p style={{ width: 370, overflow: 'hidden' }}>
            Earned this session: {" "}
            <b>
                {ethers.utils.formatEther((amount * multiplier).toFixed(0)) || "Error..."}
            </b>
        </p>
    );
}