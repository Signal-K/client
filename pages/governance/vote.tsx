import React, { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import { useAddress, useNetwork, useContract, ConnectWallet, useNFTBalance, Web3Button } from "@thirdweb-dev/react";
import { ChainId } from '@thirdweb-dev/sdk';
// import { AddressZero } from '@ethersproject/constants';

// For testing -> using contracts from pages/stake
import { PLANETS_ADDRESS } from "../../constants/contractAddresses";
import { MINERALS_ADDRESS } from "../../constants/contractAddresses";

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
}