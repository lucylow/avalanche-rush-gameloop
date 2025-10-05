// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ReactiveNetwork - Interface for Reactive Network integration
 * @dev Based on Reactive Network's official implementation patterns
 * @notice This interface defines the core Reactive Network functionality
 */
interface IReactiveNetwork {
    /**
     * @dev Subscribe to events from a specific chain
     * @param chainId The chain ID to monitor (e.g., Avalanche C-Chain = 43114)
     * @param contractAddress The contract address to monitor (0x0 for native transfers)
     * @param eventSignature The event signature to monitor (keccak256 hash)
     * @param subscriptionId The subscription ID for billing
     */
    function subscribeToEvents(
        uint256 chainId,
        address contractAddress,
        bytes32 eventSignature,
        uint256 subscriptionId
    ) external;

    /**
     * @dev Unsubscribe from events
     * @param subscriptionId The subscription ID to cancel
     */
    function unsubscribeFromEvents(uint256 subscriptionId) external;

    /**
     * @dev Check if a subscription is active
     * @param subscriptionId The subscription ID to check
     * @return Whether the subscription is active
     */
    function isSubscriptionActive(uint256 subscriptionId) external view returns (bool);
}

/**
 * @title ReactiveContract - Base contract for Reactive Smart Contracts
 * @dev Provides the foundation for contracts that react to cross-chain events
 */
abstract contract ReactiveContract {
    IReactiveNetwork public immutable reactiveNetwork;
    uint256 public immutable subscriptionId;
    
    // Event emitted when the contract reacts to an external event
    event ReactiveEventProcessed(
        uint256 indexed chainId,
        address indexed contractAddress,
        bytes32 indexed eventSignature,
        bytes eventData,
        uint256 timestamp
    );

    constructor(address _reactiveNetwork, uint256 _subscriptionId) {
        reactiveNetwork = IReactiveNetwork(_reactiveNetwork);
        subscriptionId = _subscriptionId;
    }

    /**
     * @dev The main reactive function called by Reactive Network
     * @param chainId The source chain ID
     * @param contractAddress The source contract address
     * @param eventSignature The event signature that triggered this reaction
     * @param eventData The decoded event data
     */
    function react(
        uint256 chainId,
        address contractAddress,
        bytes32 eventSignature,
        bytes calldata eventData
    ) external virtual {
        // Verify the call is from Reactive Network
        require(msg.sender == address(reactiveNetwork), "Only Reactive Network can call react");
        
        // Process the reactive event
        _processReactiveEvent(chainId, contractAddress, eventSignature, eventData);
        
        // Emit the processed event
        emit ReactiveEventProcessed(
            chainId,
            contractAddress,
            eventSignature,
            eventData,
            block.timestamp
        );
    }

    /**
     * @dev Internal function to process reactive events
     * Must be implemented by derived contracts
     */
    function _processReactiveEvent(
        uint256 chainId,
        address contractAddress,
        bytes32 eventSignature,
        bytes calldata eventData
    ) internal virtual;

    /**
     * @dev Subscribe to Avalanche C-Chain Transfer events
     * @param avalancheContractAddress The contract to monitor (0x0 for native AVAX)
     */
    function subscribeToAvalancheTransfers(address avalancheContractAddress) internal {
        // Transfer event signature: keccak256("Transfer(address,address,uint256)")
        bytes32 transferEventSignature = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef;
        
        reactiveNetwork.subscribeToEvents(
            43114, // Avalanche C-Chain chain ID
            avalancheContractAddress,
            transferEventSignature,
            subscriptionId
        );
    }

    /**
     * @dev Subscribe to Avalanche C-Chain native AVAX transfers
     */
    function subscribeToNativeAVAXTransfers() internal {
        subscribeToAvalancheTransfers(address(0));
    }

    /**
     * @dev Check if subscription is active
     */
    function isSubscriptionActive() public view returns (bool) {
        return reactiveNetwork.isSubscriptionActive(subscriptionId);
    }
}
