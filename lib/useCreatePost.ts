import { useMutation } from "@tanstack/react-query";
import { useSDK } from "@thirdweb-dev/react";
import { useCreatePostTypedDataMutation } from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import { signTypedDataWithOmittedTypename } from "./helpers";

export default function useCreatePost() {
    const { mutateAsync: requestTypedData } = useCreatePostTypedDataMutation();
    const { profileQuery } = useLensUser();
    const sdk = useSDK();

    async function createPost(
        image: File,
        title: string,
        description: string,
        content: string,
        classificationMetadata: string
    ) {
        const typedData = await requestTypedData({
            request: {
                collectModule: { // Set this to be custom DAO contract?
                    freeCollectModule: {
                        followerOnly: false,
                    },
                },
                contentURI: 'todo', // IPFS Hash (upload ALL content to IPFS)
                profileId: profileQuery.data?.defaultProfile?.id,
            },
        });

        const {domain, types, value} = typedData.createPostTypedData.typedData;
        if (!sdk) return;

        // Sign typed data
        const signature = await signTypedDataWithOmittedTypename(
            sdk,
            domain,
            types,
            value
        );

        // Send the transaction data & ipfs hash to the custom publication module
        // todo
    }

    //return useMutation(createPost);
}