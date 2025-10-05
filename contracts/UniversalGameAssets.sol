// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UniversalGameAssets
 * @dev Universal gaming asset protocol for cross-chain asset portability
 * @notice Demonstrates advanced cross-chain gaming asset management
 */
contract UniversalGameAssets is CCIPReceiver, ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    // ============ STRUCTS ============
    
    struct GameAsset {
        uint256 assetId;
        string assetType;           // "character", "weapon", "powerup", "achievement"
        bytes metadata;             // Asset metadata
        uint256[] compatibleChains; // Chains where this asset can exist
        mapping(uint256 => address) chainContracts; // chainId => contract address
        mapping(uint256 => bool) chainPresence;     // chainId => exists on chain
        address owner;
        uint256 creationTimestamp;
        uint256 lastMigration;
        bool isMigrating;
        uint256 rarity;             // 1-5 rarity level
        uint256 powerLevel;         // Asset power/strength
    }
    
    struct MigrationRequest {
        uint256 assetId;
        address fromPlayer;
        address toPlayer;
        uint64 destinationChain;
        uint256 timestamp;
        bool isCompleted;
        bytes32 ccipMessageId;
        uint256 fee;
    }
    
    struct ChainConfig {
        uint64 chainSelector;
        address assetContract;
        bool isActive;
        uint256 migrationFee;
        uint256 maxAssetsPerMigration;
    }
    
    struct AssetMetadata {
        string name;
        string description;
        string image;
        string[] attributes;
        uint256 rarity;
        uint256 powerLevel;
        string gameVersion;
        uint256 createdOnChain;
    }
    
    struct MigrationMetrics {
        uint256 totalMigrations;
        uint256 successfulMigrations;
        uint256 failedMigrations;
        uint256 totalFeesCollected;
        uint256 averageMigrationTime;
        uint256 crossChainAssets;
    }
    
    // ============ STATE VARIABLES ============
    
    Counters.Counter private _tokenIdCounter;
    
    mapping(uint256 => GameAsset) public gameAssets;
    mapping(bytes32 => MigrationRequest) public migrationRequests;
    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(address => uint256[]) public playerAssets;
    mapping(bytes32 => uint256) public ccipMessageToAsset;
    
    MigrationMetrics public migrationMetrics;
    
    uint256 public totalAssets;
    uint256 public totalMigrations;
    uint256 public migrationTimeout = 3600; // 1 hour timeout
    
    // Asset type configurations
    mapping(string => bool) public supportedAssetTypes;
    mapping(string => uint256) public assetTypeLimits;
    
    // ============ EVENTS ============
    
    event AssetCreated(
        uint256 indexed assetId,
        address indexed owner,
        string assetType,
        uint256 rarity,
        uint256 powerLevel,
        uint256 creationChain
    );
    
    event AssetMigrated(
        uint256 indexed assetId,
        address indexed from,
        address indexed to,
        uint64 sourceChain,
        uint64 destinationChain,
        bytes32 ccipMessageId
    );
    
    event MigrationRequested(
        uint256 indexed assetId,
        address indexed player,
        uint64 destinationChain,
        bytes32 requestId,
        uint256 fee
    );
    
    event MigrationCompleted(
        uint256 indexed assetId,
        address indexed player,
        uint64 destinationChain,
        bool success
    );
    
    event ChainConfigured(
        uint256 indexed chainId,
        uint64 chainSelector,
        address assetContract,
        bool isActive
    );
    
    event AssetBurned(
        uint256 indexed assetId,
        address indexed owner,
        uint256 chainId,
        string reason
    );
    
    event AssetMinted(
        uint256 indexed assetId,
        address indexed owner,
        uint256 chainId,
        bytes metadata
    );
    
    event MigrationMetricsUpdated(
        uint256 totalMigrations,
        uint256 successRate,
        uint256 totalFees
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyAssetOwner(uint256 assetId) {
        require(ownerOf(assetId) == msg.sender, "Not asset owner");
        _;
    }
    
    modifier assetExists(uint256 assetId) {
        require(_exists(assetId), "Asset does not exist");
        _;
    }
    
    modifier validAssetType(string memory assetType) {
        require(supportedAssetTypes[assetType], "Unsupported asset type");
        _;
    }
    
    modifier chainSupported(uint256 chainId) {
        require(chainConfigs[chainId].isActive, "Chain not supported");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address router,
        string memory name,
        string memory symbol
    ) CCIPReceiver(router) ERC721(name, symbol) {
        _initializeSupportedAssetTypes();
        _initializeDefaultChains();
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Create a new game asset
     */
    function createAsset(
        string memory assetType,
        bytes memory metadata,
        uint256[] memory compatibleChains,
        uint256 rarity,
        uint256 powerLevel
    ) external 
        validAssetType(assetType)
        nonReentrant
        returns (uint256)
    {
        // Check asset type limits
        require(_checkAssetTypeLimit(msg.sender, assetType), "Asset type limit exceeded");
        
        // Generate new asset ID
        uint256 assetId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Create asset
        GameAsset storage asset = gameAssets[assetId];
        asset.assetId = assetId;
        asset.assetType = assetType;
        asset.metadata = metadata;
        asset.compatibleChains = compatibleChains;
        asset.owner = msg.sender;
        asset.creationTimestamp = block.timestamp;
        asset.rarity = rarity;
        asset.powerLevel = powerLevel;
        
        // Set presence on current chain
        asset.chainPresence[block.chainid] = true;
        asset.chainContracts[block.chainid] = address(this);
        
        // Mint NFT
        _safeMint(msg.sender, assetId);
        _setTokenURI(assetId, _generateTokenURI(assetId, metadata));
        
        // Update player assets
        playerAssets[msg.sender].push(assetId);
        totalAssets++;
        
        emit AssetCreated(assetId, msg.sender, assetType, rarity, powerLevel, block.chainid);
        
        return assetId;
    }
    
    /**
     * @dev Migrate asset to another chain
     */
    function migrateAsset(
        uint256 assetId,
        uint64 destinationChainSelector,
        address recipient
    ) external 
        payable
        onlyAssetOwner(assetId)
        assetExists(assetId)
        nonReentrant
    {
        GameAsset storage asset = gameAssets[assetId];
        require(!asset.isMigrating, "Asset already migrating");
        require(asset.chainPresence[block.chainid], "Asset not present on this chain");
        
        // Find destination chain config
        ChainConfig memory destConfig = _getChainConfigBySelector(destinationChainSelector);
        require(destConfig.isActive, "Destination chain not active");
        
        // Check if asset is compatible with destination chain
        require(_isChainCompatible(assetId, _getChainIdBySelector(destinationChainSelector)), "Chain not compatible");
        
        // Calculate migration fee
        uint256 fee = destConfig.migrationFee;
        require(msg.value >= fee, "Insufficient migration fee");
        
        // Set asset as migrating
        asset.isMigrating = true;
        asset.lastMigration = block.timestamp;
        
        // Create migration request
        bytes32 requestId = keccak256(abi.encodePacked(assetId, msg.sender, destinationChainSelector, block.timestamp));
        migrationRequests[requestId] = MigrationRequest({
            assetId: assetId,
            fromPlayer: msg.sender,
            toPlayer: recipient,
            destinationChain: destinationChainSelector,
            timestamp: block.timestamp,
            isCompleted: false,
            ccipMessageId: bytes32(0),
            fee: fee
        });
        
        // Prepare cross-chain message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(destConfig.assetContract),
            data: abi.encodeWithSignature(
                "mintMigratedAsset(uint256,address,bytes,uint256,uint256,uint256)",
                assetId,
                recipient,
                asset.metadata,
                asset.rarity,
                asset.powerLevel,
                block.chainid
            ),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0)
        });
        
        // Send CCIP message
        IRouterClient router = IRouterClient(getRouter());
        uint256 fees = router.getFee(destinationChainSelector, message);
        require(msg.value >= fees, "Insufficient CCIP fee");
        
        bytes32 ccipMessageId = router.ccipSend{value: fees}(destinationChainSelector, message);
        
        // Update migration request with CCIP message ID
        migrationRequests[requestId].ccipMessageId = ccipMessageId;
        ccipMessageToAsset[ccipMessageId] = assetId;
        
        // Burn asset on current chain
        _burn(assetId);
        asset.chainPresence[block.chainid] = false;
        
        totalMigrations++;
        migrationMetrics.totalMigrations++;
        
        emit MigrationRequested(assetId, msg.sender, destinationChainSelector, requestId, fee);
    }
    
    /**
     * @dev Handle incoming CCIP messages (asset migration)
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        bytes32 messageId = any2EvmMessage.messageId;
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector;
        
        // Decode message data
        (uint256 assetId, address recipient, bytes memory metadata, uint256 rarity, uint256 powerLevel, uint256 originalChain) = abi.decode(
            any2EvmMessage.data[4:], // Skip function selector
            (uint256, address, bytes, uint256, uint256, uint256)
        );
        
        // Find migration request
        bytes32 requestId = keccak256(abi.encodePacked(assetId, recipient, sourceChainSelector, block.timestamp - 3600));
        MigrationRequest storage request = migrationRequests[requestId];
        
        if (request.assetId == assetId && !request.isCompleted) {
            // Complete migration
            _completeMigration(assetId, recipient, metadata, rarity, powerLevel, originalChain, sourceChainSelector);
            request.isCompleted = true;
            
            migrationMetrics.successfulMigrations++;
            migrationMetrics.totalFeesCollected += request.fee;
        }
    }
    
    /**
     * @dev Mint migrated asset on destination chain
     */
    function mintMigratedAsset(
        uint256 assetId,
        address recipient,
        bytes memory metadata,
        uint256 rarity,
        uint256 powerLevel,
        uint256 originalChain
    ) external {
        require(msg.sender == address(this) || msg.sender == owner(), "Unauthorized");
        
        // Create asset on this chain
        GameAsset storage asset = gameAssets[assetId];
        asset.assetId = assetId;
        asset.metadata = metadata;
        asset.owner = recipient;
        asset.rarity = rarity;
        asset.powerLevel = powerLevel;
        asset.creationTimestamp = block.timestamp;
        asset.lastMigration = block.timestamp;
        asset.isMigrating = false;
        
        // Set presence on current chain
        asset.chainPresence[block.chainid] = true;
        asset.chainContracts[block.chainid] = address(this);
        
        // Mint NFT
        _safeMint(recipient, assetId);
        _setTokenURI(assetId, _generateTokenURI(assetId, metadata));
        
        // Update player assets
        playerAssets[recipient].push(assetId);
        
        emit AssetMinted(assetId, recipient, block.chainid, metadata);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Complete asset migration
     */
    function _completeMigration(
        uint256 assetId,
        address recipient,
        bytes memory metadata,
        uint256 rarity,
        uint256 powerLevel,
        uint256 originalChain,
        uint64 sourceChainSelector
    ) internal {
        // Mint asset on this chain
        mintMigratedAsset(assetId, recipient, metadata, rarity, powerLevel, originalChain);
        
        emit MigrationCompleted(assetId, recipient, sourceChainSelector, true);
        emit AssetMigrated(assetId, address(0), recipient, sourceChainSelector, uint64(block.chainid), bytes32(0));
    }
    
    /**
     * @dev Check if player can create more assets of this type
     */
    function _checkAssetTypeLimit(address player, string memory assetType) internal view returns (bool) {
        uint256 limit = assetTypeLimits[assetType];
        if (limit == 0) return true; // No limit
        
        uint256 currentCount = 0;
        for (uint256 i = 0; i < playerAssets[player].length; i++) {
            uint256 assetId = playerAssets[player][i];
            if (keccak256(bytes(gameAssets[assetId].assetType)) == keccak256(bytes(assetType))) {
                currentCount++;
            }
        }
        
        return currentCount < limit;
    }
    
    /**
     * @dev Check if chain is compatible with asset
     */
    function _isChainCompatible(uint256 assetId, uint256 chainId) internal view returns (bool) {
        GameAsset storage asset = gameAssets[assetId];
        for (uint256 i = 0; i < asset.compatibleChains.length; i++) {
            if (asset.compatibleChains[i] == chainId) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get chain config by chain selector
     */
    function _getChainConfigBySelector(uint64 chainSelector) internal view returns (ChainConfig memory) {
        // This is simplified - in production, maintain a mapping
        if (chainSelector == 16015286601757825753) { // Ethereum Sepolia
            return chainConfigs[11155111];
        } else if (chainSelector == 14767482510784806043) { // Avalanche Fuji
            return chainConfigs[43113];
        } else if (chainSelector == 12532609583862916517) { // Polygon Mumbai
            return chainConfigs[80001];
        }
        revert("Unsupported chain selector");
    }
    
    /**
     * @dev Get chain ID by chain selector
     */
    function _getChainIdBySelector(uint64 chainSelector) internal pure returns (uint256) {
        if (chainSelector == 16015286601757825753) return 11155111; // Ethereum Sepolia
        if (chainSelector == 14767482510784806043) return 43113; // Avalanche Fuji
        if (chainSelector == 12532609583862916517) return 80001; // Polygon Mumbai
        revert("Unsupported chain selector");
    }
    
    /**
     * @dev Generate token URI for NFT metadata
     */
    function _generateTokenURI(uint256 assetId, bytes memory metadata) internal pure returns (string memory) {
        return string(abi.encodePacked("data:application/json;base64,", _encodeMetadata(assetId, metadata)));
    }
    
    /**
     * @dev Encode metadata as base64
     */
    function _encodeMetadata(uint256 assetId, bytes memory metadata) internal pure returns (string memory) {
        // Simplified metadata encoding for hackathon demo
        string memory json = string(abi.encodePacked(
            '{"name":"Game Asset #', assetId.toString(), '",',
            '"description":"Cross-chain gaming asset",',
            '"image":"data:image/svg+xml;base64,', _generateSVG(assetId), '",',
            '"attributes":[',
            '{"trait_type":"Asset ID","value":', assetId.toString(), '},',
            '{"trait_type":"Cross-Chain","value":"true"}',
            ']}'
        ));
        
        return _base64Encode(bytes(json));
    }
    
    /**
     * @dev Generate SVG image for asset
     */
    function _generateSVG(uint256 assetId) internal pure returns (string memory) {
        return _base64Encode(bytes(string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
            '<rect width="100" height="100" fill="#', _getColor(assetId), '"/>',
            '<text x="50" y="50" text-anchor="middle" fill="white" font-size="12">#', assetId.toString(), '</text>',
            '</svg>'
        ))));
    }
    
    /**
     * @dev Get color based on asset ID
     */
    function _getColor(uint256 assetId) internal pure returns (string memory) {
        uint256 colorIndex = assetId % 6;
        string[6] memory colors = ["FF6B6B", "4ECDC4", "45B7D1", "96CEB4", "FFEAA7", "DDA0DD"];
        return colors[colorIndex];
    }
    
    /**
     * @dev Base64 encoding function
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, 32)), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return result;
    }
    
    /**
     * @dev Initialize supported asset types
     */
    function _initializeSupportedAssetTypes() internal {
        supportedAssetTypes["character"] = true;
        supportedAssetTypes["weapon"] = true;
        supportedAssetTypes["powerup"] = true;
        supportedAssetTypes["achievement"] = true;
        supportedAssetTypes["cosmetic"] = true;
        
        assetTypeLimits["character"] = 10;
        assetTypeLimits["weapon"] = 20;
        assetTypeLimits["powerup"] = 50;
        assetTypeLimits["achievement"] = 100;
        assetTypeLimits["cosmetic"] = 30;
    }
    
    /**
     * @dev Initialize default chain configurations
     */
    function _initializeDefaultChains() internal {
        // Ethereum Sepolia
        chainConfigs[11155111] = ChainConfig({
            chainSelector: 16015286601757825753,
            assetContract: address(this),
            isActive: true,
            migrationFee: 0.001 ether,
            maxAssetsPerMigration: 10
        });
        
        // Avalanche Fuji
        chainConfigs[43113] = ChainConfig({
            chainSelector: 14767482510784806043,
            assetContract: address(this),
            isActive: true,
            migrationFee: 0.01 ether,
            maxAssetsPerMigration: 10
        });
        
        // Polygon Mumbai
        chainConfigs[80001] = ChainConfig({
            chainSelector: 12532609583862916517,
            assetContract: address(this),
            isActive: true,
            migrationFee: 0.005 ether,
            maxAssetsPerMigration: 10
        });
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get player's assets
     */
    function getPlayerAssets(address player) external view returns (uint256[] memory) {
        return playerAssets[player];
    }
    
    /**
     * @dev Get asset details
     */
    function getAssetDetails(uint256 assetId) external view returns (
        string memory assetType,
        bytes memory metadata,
        uint256[] memory compatibleChains,
        uint256 rarity,
        uint256 powerLevel,
        bool isMigrating
    ) {
        GameAsset storage asset = gameAssets[assetId];
        return (
            asset.assetType,
            asset.metadata,
            asset.compatibleChains,
            asset.rarity,
            asset.powerLevel,
            asset.isMigrating
        );
    }
    
    /**
     * @dev Get migration metrics
     */
    function getMigrationMetrics() external view returns (MigrationMetrics memory) {
        return migrationMetrics;
    }
    
    /**
     * @dev Get chain configuration
     */
    function getChainConfig(uint256 chainId) external view returns (ChainConfig memory) {
        return chainConfigs[chainId];
    }
    
    /**
     * @dev Check if asset exists on chain
     */
    function assetExistsOnChain(uint256 assetId, uint256 chainId) external view returns (bool) {
        return gameAssets[assetId].chainPresence[chainId];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Configure chain for cross-chain operations
     */
    function configureChain(
        uint256 chainId,
        uint64 chainSelector,
        address assetContract,
        bool isActive,
        uint256 migrationFee,
        uint256 maxAssets
    ) external onlyOwner {
        chainConfigs[chainId] = ChainConfig({
            chainSelector: chainSelector,
            assetContract: assetContract,
            isActive: isActive,
            migrationFee: migrationFee,
            maxAssetsPerMigration: maxAssets
        });
        
        emit ChainConfigured(chainId, chainSelector, assetContract, isActive);
    }
    
    /**
     * @dev Add new asset type
     */
    function addAssetType(string memory assetType, uint256 limit) external onlyOwner {
        supportedAssetTypes[assetType] = true;
        assetTypeLimits[assetType] = limit;
    }
    
    /**
     * @dev Update migration timeout
     */
    function updateMigrationTimeout(uint256 newTimeout) external onlyOwner {
        migrationTimeout = newTimeout;
    }
    
    /**
     * @dev Emergency burn asset
     */
    function emergencyBurnAsset(uint256 assetId, string memory reason) external onlyOwner {
        require(_exists(assetId), "Asset does not exist");
        
        address assetOwner = ownerOf(assetId);
        _burn(assetId);
        
        // Remove from player assets
        uint256[] storage assets = playerAssets[assetOwner];
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i] == assetId) {
                assets[i] = assets[assets.length - 1];
                assets.pop();
                break;
            }
        }
        
        emit AssetBurned(assetId, assetOwner, block.chainid, reason);
    }
    
    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    // ============ REQUIRED OVERRIDES ============
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}





