// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

// Import thirdweb contracts
import "@thirdweb-dev/contracts/drop/DropERC1155.sol"; // For my collection of Pickaxes
import "@thirdweb-dev/contracts/token/TokenERC20.sol"; // For my ERC-20 Token contract
import "@thirdweb-dev/contracts/openzeppelin-presets/utils/ERC1155/ERC1155Holder.sol"; // For my ERC-1155 Receiver contract
/* Extra metadata/tags contracts (no function)
import "@thirdweb-dev/contracts/drop/ERC721.sol";
import "@thirdweb-dev/contracts/drop/ERC20.sol";
import "@thirdweb-dev/contracts/token/Token721.sol";*/


// OpenZeppelin (ReentrancyGuard)
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PlanetHelper is ReentrancyGuard, ERC1155Holder {
    DropERC1155 public immutable planetNFTCollection; // Edition drop for the planets (terminology & game item may change around...e.g. PlanetHelper or planetNFTCollection may become a pickaxe/mining bot)
    TokenERC20 public immutable rewardsToken; // Starting off with rewarding Minerals to the user - more resource types will be added

    // Metadata deeplinks (taken out of constructor)
    string public classificationContractArchive = 'goerli/0xed6e837Fda815FBf78E8E7266482c5Be80bC4bF9';  // Archived version of the classification proposal contract on the Mumbai testnet. Used for archival purposes
    string public jupyterNotebook  = 'https://deepnote.com/workspace/star-sailors-49d2efda-376f-4329-9618-7f871ba16007/project/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da/notebook/Light%20Curve%20Demo-0c60a045940145ba950f2c0e51cac7c1'; // Deeplink to a copy of the Deepnote notebook
    string public jupyterNftTagId = 'goerli/0xdf35Bb26d9AAD05EeC5183c6288f13c0136A7b43/1';  // Deep link to a goerli NFT with some metadata relevant to the jupyterNotebook
    // This contract is a 'helper', aka multitool provider for your planets in the Star Sailors game. Using this contract, you'll be able to perform different actions on the planets in your inventory, such as mining, building & customising the terrain and life. More documentation is available on Notion at https://skinetics.notion.site/421c898e3583496bb9dc950e3150b8d0?v=db85a572b6c5409e998451318d6b5187 and on our Github -> https://github.com/signal-k/sytizen
    
    constructor(DropERC1155 planetNFTCollectionAddress, TokenERC20 mineralsTokenAddress) {
        planetNFTCollection = planetNFTCollectionAddress;
        rewardsToken = mineralsTokenAddress; // For this helper function, minerals will be the primary resource (later this trait on the planet nft will determine whcib of the Helpers is called (each helper will have different rewards))
    }

    struct MapValue {
        bool isData; // Is being staked?
        uint256 value; // Token id being staked
    }

    // Map the player address to their current "helper" item
    mapping (address => MapValue) public playerHelper; // TokenID of helper (type of mining/gathering tool) is the reward multiplier. This here lists the type of tool the user is using
    mapping (address => MapValue) public playerLastUpdate; // Map the address to the time they last claimed/staked/withdrew. Default state is null -> not in the mapping. { is there a value, timestamp of last action}

    function stake (uint256 _tokenId) external nonReentrant {
        require (planetNFTCollection.balanceOf(msg.sender, _tokenId) >= 1, "You must have at least one planet to stake");
        if (playerHelper[msg.sender].isData) { // If the user has a helper that is already staked : send it back to address (unstake)
            planetNFTCollection.safeTransferFrom(address(this), msg.sender, playerHelper[msg.sender].value, 1, "Returning your old helper item");
        }
        
        uint256 reward = calculateRewards(msg.sender); // Calculate the rewards owed to the address
        rewardsToken.transfer(msg.sender, reward);

        planetNFTCollection.safeTransferFrom(msg.sender, address(this), _tokenId, 1, "Staking your planet"); // Actual statement that transfers the nft from the user to this staking contract to begin staking
        playerHelper[msg.sender].value = _tokenId; // Update the mapping for the helper NFT once it's been staked
        playerHelper[msg.sender].isData = true;
        playerLastUpdate[msg.sender].value = block.timestamp; // Update the mapping for the playerLastUpdate tag. It's set to the current time (and we can use that and the state of the nft to calculate rewards)
        playerLastUpdate[msg.sender].isData = true;
    }

    function withdraw () external nonReentrant {
        require(playerHelper[msg.sender].isData, "You do not have a helper staked to withdraw"); // The user can't execute this function if they aren't staking anything
        uint256 reward = calculateRewards(msg.sender);
        rewardsToken.transfer(msg.sender, reward);
        planetNFTCollection.safeTransferFrom(address(this), msg.sender, playerHelper[msg.sender].value, 1, "Transferring your previously staked nft to your wallet");
        playerHelper[msg.sender].isData = false; // Update the helper mapping
        playerLastUpdate[msg.sender].isData = true; // There's been a new update -> so update the mapping
        playerLastUpdate[msg.sender].value = block.timestamp;
    }

    function claim () external nonReentrant {
        uint256 reward = calculateRewards(msg.sender);
        rewardsToken.transfer(msg.sender, reward);
        playerLastUpdate[msg.sender].isData = true; // Update mappings for last event for player
        playerLastUpdate[msg.sender].value = block.timestamp;
    }

    function calculateRewards (address _player) public view returns (uint256 _rewards) { // 20,000,000 rewards/minerals per block. Uses block.timestamp & playerLastUpdate. Requires the player to have staked a helper item
        if (!playerLastUpdate[_player].isData || !playerHelper[_player].isData) { // Either nothing is being staked, or the player hasn't ever staked/edited their stake items
            return 0; // No rewards are owed to the player/address
        }

        uint256 timeDifference = block.timestamp - playerLastUpdate[_player].value; // Time difference between now and when the last action on their helper occured
        uint256 rewards = timeDifference * 10_000_000_000_000 * (playerHelper[_player].value + 1); // If there is a higher level helper (see the evolution stage), the reward is greater
        return rewards;
    }
}