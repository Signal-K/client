import { useAddress, useNetworkMismatch, useNetwork, ConnectWallet, ChainId, MediaRenderer } from '@thirdweb-dev/react';
import { profile } from 'console';
import React from 'react';
import useLensUser from '../lib/auth/useLensUser';
import useLogin from '../lib/auth/useLogin';

type Props = {};

export default function SignInButton({}: Props) {
    const address = useAddress(); // Detect connected wallet
    const isOnWrongNetwork = useNetworkMismatch(); // Is different to `activeChainId` in `_app.tsx`
    const [, switchNetwork] = useNetwork(); // Switch network to `activeChainId`
    const { isSignedInQuery, profileQuery } = useLensUser();
    const { mutate: requestLogin } = useLogin();
    
    // Connect wallet
    if (!address) {
        return (
            <ConnectWallet />
        );
    }

    // Switch network to polygon
    if (!isOnWrongNetwork) {
        return (
            <button
                onClick={() => switchNetwork?.(ChainId.Polygon)}
            >Switch Network</button>
        )
    }

    if (isSignedInQuery.isLoading) { // Loading signed in state
        return <div>Loading</div>
    }

    // Sign in with Lens
    if (!isSignedInQuery.data) { // Request a login to Lens
        return (
            <button
                onClick={() => requestLogin()}
            >Sign in with Lens</button>
        )
    };

    if (profileQuery.isLoading) { // Show user their Lens Profile
        return <div>Loading...</div>;
    };

    if (!profileQuery.data?.defaultProfile) { // If there's no Lens profile for the connected wallet
        return <div>No Lens Profile</div>;
    };

    if (profileQuery.data?.defaultProfile) { // If profile exists
        return <div>
            {/* @ts-ignore */}
            <MediaRenderer src={profileQuery?.data?.defaultProfile?.picture?.original?.url || ""} alt="Profile Picture" style={({
                width: 48,
                height: 48,
                marginTop: 5,
                borderRadius: 20,
            })}/>
        </div>
    };

    return (
        <div>Something went wrong</div>
    );
}