import React, { useState, useEffect } from "react";

import { useAddress } from "@thirdweb-dev/react";
import { SmartContract } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import ContractMappingResponse from "../../../constants/contractMappingResponse";

type Props = { helperContract: SmartContract<any>; };

export default function ApproxRewards ({ helperContract }: Props ) { // Calls contract to estimate the rewards owed to the authenticated player/user
    const address = useAddress();
    const everyMillisecondAmount = parseInt(
        (10_000_000_000_000 / 2.1).toFixed(0) // Assumes each block (on EVM) takes ~2.1 seconds to be mined. Begins when component isMounted
    );

    const [amount, setAmount] = useState<number>(0);
    const [multiplier, setMultiplier] = useState<number>(0);

    useEffect(() => {
        (async () => {
            if (!address) return;
            const p = ( await helperContract.call( 'playerHelper', address, )) as ContractMappingResponse;
            if (p.isData) { // If a multitool owned by the player IS staked/equipped
                setMultiplier(p.value.toNumber() + 1); // A better multitool (derived as tokenId of multitool contract) gives better rewards
            } else { setMultiplier(0); };
        })();
    }, [address, helperContract]);

    useEffect(() => { // Update the amount in state based on everyMillisecondAmount
        const interval = setInterval(() => { setAmount( amount + everyMillisecondAmount ); }, 100); // update token amount (earned from staking)
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