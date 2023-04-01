import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import "dotenv/config";
//import { MINERALS_ADDRESS } from "../../constants/contractAddresses";

const MINERALS_ADDRESS = '0xE938775F4ee4913470905885c9744C7FAD482991';
const NETWORK = "goerli";
const GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY;
const sdk = ThirdwebSDK.fromPrivateKey(GOERLI_PRIVATE_KEY, NETWORK);

(async () => {
    try {
        // This is our governance contract.
        const vote = await sdk.getContract("0xEee8EB851e3d528ef3b5C98CD41cb6F25c929415", "vote");
        // This is our ERC-20 contract.
        const token = await sdk.getContract(MINERALS_ADDRESS, "token");
        // Give our treasury the power to mint additional token if needed.
        await token.roles.grant("minter", vote.getAddress());
  
        console.log(
            "Successfully gave vote contract permissions to act on token contract"
        );
    } catch (error) {
        console.error(
            "failed to grant vote contract permissions on token contract",
            error
        );
        process.exit(1);
    }
  
    try {
        // This is our governance contract.
        const vote = await sdk.getContract("0xEee8EB851e3d528ef3b5C98CD41cb6F25c929415", "vote");
        // This is our ERC-20 contract.
        const token = await sdk.getContract(MINERALS_ADDRESS, "token");
        // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
        const ownedTokenBalance = await token.balanceOf(process.env.WALLET_ADDRESS);

        // Grab 90% of the supply that we hold.
        const ownedAmount = ownedTokenBalance.displayValue;
        const percent90 = (Number(ownedAmount) / 100) * 90;

        // Transfer 90% of the supply to our voting contract.
        await token.transfer(vote.getAddress(), percent90);
  
        console.log(
            "✅ Successfully transferred " + percent90 + " tokens to vote contract"
        );
    } catch (err) {
        console.error("failed to transfer tokens to vote contract", err);
    }
})();