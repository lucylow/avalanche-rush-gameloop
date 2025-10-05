// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReactive.sol";

/**
 * @title AbstractReactive
 * @dev Abstract base contract for Reactive Network integration
 */
abstract contract AbstractReactive is IReactive {
    
    // Modifier to ensure only the VM can call reactive functions
    modifier vmOnly() {
        require(msg.sender == address(this), "Only VM can call this function");
        _;
    }
    
    // Abstract function that must be implemented by derived contracts
    function react(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3,
        bytes calldata data,
        uint256 block_number,
        uint256 op_code
    ) external virtual override;
}
