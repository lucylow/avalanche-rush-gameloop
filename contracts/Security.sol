```solidity
// contracts/Security.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Security {
    address public reactiveNetwork;
    mapping(uint256 => bool) public activeQuests;
    mapping(address => mapping(uint256 => bool)) public questCompletions;

    // Reentrancy protection
    bool private _locked;

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    modifier onlyReactive() {
        require(msg.sender == reactiveNetwork, "Only Reactive Network can call");
        _;
    }

    modifier onlyVerifiedQuest(uint256 questId) {
        require(activeQuests[questId], "Quest not active");
        require(questCompletions[msg.sender][questId] == false, "Quest already completed");
        _;
    }

    function _validateQuestCompletion(address player, bytes memory proof) internal pure returns (bool) {
        require(player != address(0), "Invalid player address");
        require(proof.length > 0, "Proof required");
        return true;
    }
}
```
