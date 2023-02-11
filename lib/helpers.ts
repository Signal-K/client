// Web3 Interaction
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { EIP712Domain } from "@thirdweb-dev/sdk/dist/declarations/src/evm/common/sign";
import { ethers } from "ethers";
import omitDeep from 'omit-deep';
//import { omitDeep } from "@lens-protocol/shared-kernel";

export function omitTypename ( object: any ) { // Sign typed data with omitted __typename values using `omit-deep`
    return omitDeep(object, ['__typename']);
};

export async function signTypedDataWithOmittedTypename ( sdk: ThirdwebSDK, // Performs signing using SDK
    domain: EIP712Domain,
    types: Record<string, any>,
    value: Record<string, any>,
) {
    return await sdk.wallet.signTypedData(
        omitTypename(domain) as EIP712Domain,
        omitTypename(types) as Record<string, any>,
        omitTypename(value) as Record<string, any>,
    );
};

export function splitSignature ( signature: string ) { // Split signature from user [auth] to extra v r s
    return ethers.utils.splitSignature(signature);
}