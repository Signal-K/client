import { useRouter } from "next/router";
import { GetStaticProps, GetStaticPaths } from "next";
import {
    dehydrate,
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import {
    MediaRenderer,
    useAddress,
    useContract,
    useSigner,
    useSDK,
    Web3Button,
} from '@thirdweb-dev/react';
import useLensUser from "../../lib/auth/useLensUser";

export default function ProfilePage () {
    const router = useRouter();
    const { handle } = router.query;
    const sdk = useSDK();
    const signer = useSigner();
    const queryClient = useQueryClient();
    const address = useAddress();
    //const { isSignedIn } = useLensUser(); // -> Has the user got a lens profile that they've proven is theirs via signature?
}