import { useQuery } from "@tanstack/react-query";
import { useAddress } from "@thirdweb-dev/react";
import { useDefaultProfileQuery } from "../../graphql/generated";
import { readAccessToken } from "./helpers";

export default function useLensUser() {
    // Make a react query for the local storage key
    const address = useAddress();
    const localStorageQuery = useQuery(
        ['lens-user', address],
        () => readAccessToken(),
    );

    // If wallet is connected, check for the default profile (on Lens) connected to that wallet
    const profileQuery = useDefaultProfileQuery({
        request: {
            ethereumAddress: address,
        }
    },
    {
        enabled: !!address,
    });

    return {
        isSignedInQuery: localStorageQuery,
        profileQuery: profileQuery,
    }
}