// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AchievementNFT - NFT rewards for quest completion
 * @dev Simple ERC721 contract for minting achievement NFTs
 *      Only the quest engine contract can mint tokens
 */
contract AchievementNFT is ERC721URIStorage, Ownable {
    
    using Counters for Counters.Counter;
    
    // ============ STATE VARIABLES ============
    
    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;
    
    // Mapping to track player achievements
    mapping(address => uint256[]) public playerAchievements;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Default metadata for achievements
    string private _defaultTokenURI;
    
    // ============ EVENTS ============
    
    event AchievementMinted(
        address indexed player,
        uint256 indexed tokenId,
        string metadata
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        
        // Set default metadata for achievement NFTs
        _defaultTokenURI = string(abi.encodePacked(
            _baseTokenURI,
            "achievement.json"
        ));
    }
    
    // ============ MINTING FUNCTIONS ============
    
    /**
     * @dev Mint an achievement NFT to a player
     * @param player The player's address to receive the NFT
     */
    function mintAchievement(address player) external onlyOwner {
        require(player != address(0), "Cannot mint to zero address");
        
        // Get current token ID and increment
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint the NFT
        _safeMint(player, tokenId);
        
        // Set token URI
        _setTokenURI(tokenId, _defaultTokenURI);
        
        // Track player's achievements
        playerAchievements[player].push(tokenId);
        
        emit AchievementMinted(player, tokenId, _defaultTokenURI);
    }
    
    /**
     * @dev Batch mint multiple achievements
     * @param players Array of player addresses
     */
    function batchMintAchievements(address[] calldata players) external onlyOwner {
        for (uint256 i = 0; i < players.length; i++) {
            mintAchievement(players[i]);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get the current token counter value
     * @return The current token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Get all achievements for a player
     * @param player The player's address
     * @return Array of token IDs owned by the player
     */
    function getPlayerAchievements(address player) external view returns (uint256[] memory) {
        return playerAchievements[player];
    }
    
    /**
     * @dev Get the number of achievements for a player
     * @param player The player's address
     * @return The number of achievements
     */
    function getPlayerAchievementCount(address player) external view returns (uint256) {
        return playerAchievements[player].length;
    }
    
    /**
     * @dev Get the base token URI
     * @return The base URI string
     */
    function getBaseTokenURI() external view returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get the default token URI
     * @return The default URI string
     */
    function getDefaultTokenURI() external view returns (string memory) {
        return _defaultTokenURI;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set the base token URI
     * @param newBaseTokenURI The new base URI
     */
    function setBaseTokenURI(string calldata newBaseTokenURI) external onlyOwner {
        _baseTokenURI = newBaseTokenURI;
        
        // Update default token URI
        _defaultTokenURI = string(abi.encodePacked(
            _baseTokenURI,
            "achievement.json"
        ));
    }
    
    /**
     * @dev Set custom token URI for a specific token
     * @param tokenId The token ID
     * @param newTokenURI The new token URI
     */
    function setCustomTokenURI(uint256 tokenId, string calldata newTokenURI) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newTokenURI);
    }
    
    /**
     * @dev Emergency function to transfer ownership of the contract
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        super.transferOwnership(newOwner);
    }
    
    // ============ OVERRIDE FUNCTIONS ============
    
    /**
     * @dev Override to include base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Override to track transfers
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // If this is a transfer (not mint/burn), update player achievements tracking
        if (from != address(0) && to != address(0)) {
            // Remove from sender's achievements
            _removeFromPlayerAchievements(from, tokenId);
            
            // Add to receiver's achievements
            playerAchievements[to].push(tokenId);
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Remove a token from player's achievements array
     * @param player The player's address
     * @param tokenId The token ID to remove
     */
    function _removeFromPlayerAchievements(address player, uint256 tokenId) internal {
        uint256[] storage achievements = playerAchievements[player];
        
        for (uint256 i = 0; i < achievements.length; i++) {
            if (achievements[i] == tokenId) {
                // Move the last element to the current position
                achievements[i] = achievements[achievements.length - 1];
                achievements.pop();
                break;
            }
        }
    }
}
