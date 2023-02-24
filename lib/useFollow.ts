// Web3 interaction & setup
import { useAddress, useSDK } from "@thirdweb-dev/react";
import { signTypedDataWithOmittedTypename, splitSignature } from "./helpers";

// Tanstack/Graphql queries
import { useCreateFollowTypedDataMutation } from "../graphql/generated";
import { omitTypename } from "./helpers";
//import { omitTypename } from "@lens-protocol/api-bindings";
import { LENS_CONTRACT_ABI, LENS_CONTRACT_ADDRESS } from "../constants/contracts";
import { useMutation } from "@tanstack/react-query"; // aka apollo client
import useLogin from "./auth/useLogin";

export function useFollow () {
    const { mutateAsync: requestTypedData } = useCreateFollowTypedDataMutation(); // Get typed data for signing by user
    const sdk = useSDK();
    const address = useAddress();
    const { mutateAsync: loginUser } = useLogin();

    async function follow ( userId: string ) { // Follow interaction - which user is to be followed?
        await loginUser();
        const typedData = await requestTypedData({
            request: {
                follow: [
                    { profile: userId, },
                ],
            },
        });

        const { domain, types, value } = typedData.createFollowTypedData.typedData;
        if (!sdk) return
        const signature = await signTypedDataWithOmittedTypename ( // Ask user to sign using @Thirdweb-dev/sdk
            sdk, domain, types, value
        );
        const { v, r, s } = splitSignature( signature.signature );
        const lensHubContract = await sdk.getContractFromAbi ( // Send typed data to smart contract
            LENS_CONTRACT_ADDRESS, LENS_CONTRACT_ABI, // Would these need to be updated (in general for contracts, not specific to Lens?)
        );
        const result = await lensHubContract.call('followWithSig', { // Call contract function `followWithSig`
            follower: address, // Address of authed user
            profileIds: [userId], // Follow this profile id (follow : [ { profile: userId, }, ], );
            datas: value.datas,
            sig: { // The signature is used to 'prove' the right of authed user to follow
                v,
                r,
                s,
                deadline: value.deadline, // From Lens sig -> timeout/deadline
            },
        });
    };

    return useMutation(follow);
}