// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IReactive
 * @dev Interface for Reactive Network integration
 */
interface IReactive {
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
    ) external;
}
