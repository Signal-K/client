import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddress, useSDK } from "@thirdweb-dev/react";
import { useAuthenticateMutation } from "../../graphql/generated";
import generateChallenge from "./generateChallenge";
import { setAccessToken } from "./helpers";

// Store access token inside local storage

export default function useLogin() {
    const address = useAddress(); // Ensure user has connected wallet
    const sdk = useSDK();
    const { mutateAsync: sendSignedMessage } = useAuthenticateMutation();
    const client = useQueryClient();

    async function login() {
        if (!address) return;
        const { challenge } = await generateChallenge(address); // Generate a challenge (for auth) from Lens API
        const signature = await sdk?.wallet.sign(challenge.text); // Sign the challenge
        const { authenticate } = await sendSignedMessage({
            request: {
                address,
                signature,
            },
        });

        const { accessToken, refreshToken } = authenticate;
        setAccessToken(accessToken, refreshToken);
        client.invalidateQueries(['lens-user', address]);
    }

    return useMutation(login);
}