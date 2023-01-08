import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { EIP712Domain } from "@thirdweb-dev/sdk/dist/declarations/src/evm/common/sign";
import { ethers } from "ethers";
import omitDeep from "omit-deep";

export function omitTypename (object: any) { // Sign typed data with omitted __typename values using omit-deep
    return omitDeep(object,  ['__typename'])
};

export async function signTypedDataWithOmittedTypename (sdk: ThirdwebSDK, // Perform signing using SDK
    domain: EIP712Domain,
    types: Record<string, any>,
    value: Record<string, any>,
    ) { 
    return await sdk.wallet.signTypedData(
        omitTypename(domain) as EIP712Domain,
        omitTypename(types) as Record<string, any>,
        omitTypename(value) as Record<string, any>,
    )
}

export function splitSignature (signature: string) { // Split signature to extract v r s values
    return ethers.utils.splitSignature(signature);
}