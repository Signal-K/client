// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract ClassificationProposal {
    struct Classification {
        // What types will this struct/campaign have?
        address owner;
        string title; // Title of the Proposal, type string
        string description;
        uint256 target; // How many coins to get the proposal to pass?
        uint256 deadline;
        uint256 amountCollected; // Goes towards target
        string image; // image uri/url
        address[] voters;
        uint256[] votes; // Consider adding more components to match discussion in wb3-5 task
    }

    mapping(uint256 => Classification) public classifications;
    uint256 public numberOfClassifications = 0;
    
    function createProposal(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) { // Returns id of the classification's proposal
        Classification storage classification = classifications[numberOfClassifications]; // Populates the classifications array
        require(classification.deadline < block.timestamp, "The deadline should be a date in the future"); // Maybe add another modifier to specify a minimum deadline period e.g. 1 day
        
        classification.owner = _owner;
        classification.title = _title;
        classification.description = _description;
        classification.target = _target;
        classification.deadline = _deadline;
        classification.amountCollected = 0;
        classification.image = _image;

        numberOfClassifications++;

        return numberOfClassifications - 1;
    }

    function voteForProposal(uint256 _id) public payable { // Some crypto will be sent with the classificationID used as a param
        uint256 amount = msg.value; // This amount is set by user (typically in frontend); the amount they'll be pledging towards a classification
        Classification storage classification = classifications[_id];
        
        classification.voters.push(msg.sender); // Push the address of user who voted
        classification.votes.push(amount); // Amount of custom erc20 token pledged
        
        (bool sent,) = payable(classification.owner).call{value: amount}("");
        if (sent) {
            classification.amountCollected = classification.amountCollected + amount;
        }
    }

    function getVoters(uint256 _id) view public returns(address[] memory, uint256[] memory) { // Array of votes and number of voters
        return (classifications[_id].voters, classifications[_id].votes);
    }

    function getProposals() public view returns(Classification[] memory) { // Retrieved from memory
        Classification[] memory allClassifications = new Classification[](numberOfClassifications); // Empty array of empty structs referencing each classification/proposal

        for (uint i = 0; i < numberOfClassifications; i++) {
            Classification storage item = classifications[i];
            allClassifications[i] = item; // Fetch the classification from storage and populate it in allClassifications
        }

        return allClassifications;
    }
}