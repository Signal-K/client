// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/Extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    event TokenTransferred (
        address indexed from,
        address indexed to,
        uint256 amount
    );

    event TokenMinted(address indexed to, uint256 amount);
    event TokenBurned(address indexed from, uint256 amount);

    uint256 constant TOTAL_SUPPLY = 1000000 * 10**18;

    // Free token airdrop
    uint256 constant TOKENS_PER_USER = 1000; // Each user can receive 1,000 tokens for free
    mapping(address => bool) public s_claimedTokens; // Allow users to only claim their free tokens once
    address[] public s_holders;

    constructor(uint256 _keepPercentage) ERC20("Kinetika", "SKK") ERC20Permit("Kinetika") {
        uint256 keepAmount = (TOTAL_SUPPLY * _keepPercentage) / 100;
        _mint(msg.sender, TOTAL_SUPPLY);
        _transfer(msg.sender, address(this), TOTAL_SUPPLY - keepAmount);
        s_holders.push(msg.sender);
    }

    // Prevent users from claiming their free airdrop >1
    function claimTokens () external {
        require(!s_claimedTokens[msg.sender], "You've already claimed your free tokens");
        s_claimedTokens[msg.sender] = true;
        _transfer(address(this), msg.sender, TOKENS_PER_USER * 10**18);
        s_holders.push(msg.sender);
    }

    // How many holders does this contract have?
    function getHolderLength() external view returns (uint256) {
        return s_holders.length;
    }

    // Solidity overrides
    function _afterTokenTransfer (
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
        emit TokenTransferred(from, to, amount);
    }

    function _mint(
        address to, uint256 amount
    ) internal override(ERC20Votes) {
        super._mint(to, amount);
        emit TokenMinted(to, amount);
    }

    function _burn(
        address account,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._burn(account, amount);
        emit TokenBurned(account, amount);
    }
}