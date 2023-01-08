import { useAddress, useSDK } from "@thirdweb-dev/react";
import { useCreateFollowTypedDataMutation } from "../graphql/generated";
import { omitTypename } from "@lens-protocol/api-bindings";
import { signTypedDataWithOmittedTypename, splitSignature } from "./helpers";
import { LENS_CONTRACT_ABI, LENS_CONTRACT_ADDRESS } from "../constants/contracts";
import { useMutation } from "@tanstack/react-query";
import useLogin from "./auth/useLogin";

export function useFollow () {
    // Use mutation to get typed data for user to sign
    const { mutateAsync: requestTypedData } = useCreateFollowTypedDataMutation();
    const sdk = useSDK();
    const address = useAddress();
    const { mutateAsync: loginUser } = useLogin();

    async function follow (userId: string) { // which user we want to follow
        await loginUser();
        const typedData = await requestTypedData({
            request: {
                follow: [
                    {
                        profile: userId,
                    },
                ],
            },
        });

        const { domain, types, value } = typedData.createFollowTypedData.typedData;
        if (!sdk) return;

        // Ask user to sign using @Thirdweb-dev/sdk
        const signature = await signTypedDataWithOmittedTypename (
            sdk,
            domain,
            types,
            value
        );

        const { v, r, s } = splitSignature( signature.signature );

        // Send typed data to smart contract
        const lensHubContract = await sdk.getContractFromAbi (
            LENS_CONTRACT_ADDRESS,
            LENS_CONTRACT_ABI
        );

        // Call contract function `followWithSig`
        const result = await lensHubContract.call('followWithSig', {
            follower: address,
            profileIds: [userId],
            datas: value.datas,
            sig: {
                v,
                r,
                s,
                deadline: value.deadline,
            },
        });
    };

    return useMutation(follow);
};