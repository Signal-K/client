import ethers from "hardhat";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import "dotenv/config";
//import { MINERALS_ADDRESS } from "../../constants/contractAddresses";

const MINERALS_ADDRESS = '0xE938775F4ee4913470905885c9744C7FAD482991';
const NETWORK = "goerli";
const GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY;
// const sdk = ThirdwebSDK.fromPrivateKey(GOERLI_PRIVATE_KEY, NETWORK);
const sdk = ThirdwebSDK.fromPrivateKey('71cc30029998f3282069d43e547efd1894f51269e15a833815e5ed5f418a38e7', NETWORK);

(async () => {
    try {
        const vote = await sdk.getContract("0xd0F59Ed6EBf7f754fC3D5Fd7bb3181EBDeEd9E9d", "vote");
        const token = await sdk.getContract("0xa791a3e0F2D2300Ee85eC7105Eee9E9E8eb57908", "token");
        
        // Create a proposal to mint 420,000 new minerals to the treasury
        const amount = 420_000; 
        const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
        const executions = [
            {
                toAddress: token.getAddress(),
                nativeTokenValue: 0,
                transactionData: token.encoder.encode("mintTo", [
                    vote.getAddress(),
                    ethers.utils.parseUnits(amount.toString(), 18),
                ]),
            },
        ];
        await vote.propose(description, executions);

        console.log("✅ Successfully created proposal to mint tokens");
        
        } catch (error) {
            console.error("failed to create first proposal", error);
        process.exit(1);
    };
})