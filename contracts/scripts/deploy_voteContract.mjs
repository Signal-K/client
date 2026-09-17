import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import "dotenv/config";
import { MINERALS_ADDRESS } from "../../constants/contractAddresses";

const NETWORK = "goerli";
const GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY;
const sdk = ThirdwebSDK.fromPrivateKey(GOERLI_PRIVATE_KEY, NETWORK);

(async () => {
    try {
        const voteContractAddress = await sdk.deployer.deployVote({
            name: "Star Sailors Metadata DAO",
            voting_token_address: MINERALS_ADDRESS,
            voting_delay_in_blocks: 0, // A user can vote on a proposal immediately after it is created
            voting_period_in_blocks: 6570, // Each proposal can be voted on for 1 day after it is created
            voting_quorum_fraction: 0,
            proposal_token_threshold: 0,
        });

        console.log('Successfully deployed vote contract, address: ', voteContractAddress);
    } catch (err) {
        console.error("Failed to deploy vote contract, ", err);
    }
})();

// voting address: 0xEee8EB851e3d528ef3b5C98CD41cb6F25c929415