import { useMutation } from "@tanstack/react-query";
import { useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { PublicationMainFocus, useCreatePostTypedDataMutation } from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import { signTypedDataWithOmittedTypename, splitSignature } from "./helpers";
import { v4 as uuidv4 } from "uuid";
import { LENS_CONTRACT_ABI, LENS_CONTRACT_ADDRESS } from "../constants/contracts";
import useLogin from "./auth/useLogin";

type CreatePostArgs = {
    image: File;
    title: string;
    description: string;
    content: string;
    classificationMetadata: string;
}

export default function useCreatePost() {
    const { mutateAsync: requestTypedData } = useCreatePostTypedDataMutation();
    const { mutateAsync: uploadToIpfs } = useStorageUpload();
    const { mutateAsync: loginUser } = useLogin();
    const { profileQuery } = useLensUser();
    const sdk = useSDK();

    async function createPost({
        image,
        title,
        description,
        content,
        classificationMetadata
    }: CreatePostArgs) {
        // Require login
        await loginUser();
        // Upload contents/image to IPFS
        const imageIpfsUrl = (await uploadToIpfs({ data: [image] }))[0]; // Array of strings. Currently only getting the first item (which will be the image). To-Do: Remove the indexer and replace that when requesting the content on the IPFS hash when returning post[s] [content]
        // Upload publication content to IPFS (contains image field as well)
        const postMetadata = {
            version: '2.0.0',
            mainContentFocus: PublicationMainFocus.TextOnly, // This can be changed -> what post type is being created?
            matadata_id: uuidv4(),
            description: description,
            locale: 'en-us',
            content: content,
            external_url: null,
            image: imageIpfsUrl,
            imageMimeType: null,
            name: title,
            attributes: [],
            classificationMetadata: classificationMetadata,
            tags: ['0xed6e837Fda815FBf78E8E7266482c5Be80bC4bF9'],
            appId: 'ssk_example',
        };
        const postMetadataIpfsUrl = (await uploadToIpfs({ data: [ postMetadata ] }))[0];

        // Lens provides typed data for request
        const typedData = await requestTypedData({
            request: {
                collectModule: { // Set this to be custom DAO contract?
                    freeCollectModule: {
                        followerOnly: false,
                    },
                },
                contentURI: 'todo', // IPFS Hash (upload ALL content to IPFS)
                profileId: profileQuery.data?.defaultProfile?.id,
                referenceModule: {
                    followerOnlyReferenceModule: false,
                }
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

        const { v, r, s } = splitSignature(signature.signature);

        // Send the transaction data & ipfs hash to the custom publication module
        const lensHubContract = await sdk.getContractFromAbi(
            LENS_CONTRACT_ADDRESS,
            LENS_CONTRACT_ABI,
        );

        // Destructure value fields
        const {
            collectModule,
            collectModuleInitData,
            contentURI,
            deadline,
            nonce,
            profileId,
            referenceModule,
            referenceModuleInitData
        } = typedData.createPostTypedData.typedData.value
        const result = await lensHubContract.call("postWithSig", {
            profileId: profileId,
            contentURI: contentURI,
            collectModule,
            collectModuleInitData,
            referenceModule,
            referenceModuleInitData,
            sig: {
                v,
                r,
                s,
                deadline: deadline,
            },
        });
        console.log(result);
    }

    return useMutation(createPost);
}