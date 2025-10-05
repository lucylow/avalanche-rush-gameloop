// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title RushNFT
 * @dev Achievement NFT contract for Avalanche Rush game
 * @notice ERC-721 NFTs representing game achievements and collectibles
 */
contract RushNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    // NFT Rarity levels
    enum Rarity {
        BRONZE,    // 0 - Common
        SILVER,    // 1 - Uncommon  
        GOLD,      // 2 - Rare
        PLATINUM   // 3 - Legendary
    }
    
    // Achievement structure
    struct Achievement {
        Rarity rarity;
        uint256 score;
        uint256 timestamp;
        string metadata;
        bool isTradeable;
        uint256 powerLevel;
        string[] attributes;
    }
    
    // State variables
    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256) public userAchievementCount;
    mapping(Rarity => uint256) public rarityCounts;
    mapping(Rarity => uint256) public rarityLimits;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event AchievementMinted(
        address indexed to,
        uint256 indexed tokenId,
        Rarity rarity,
        uint256 score,
        string metadata
    );
    event RarityLimitSet(Rarity rarity, uint256 limit);
    event BaseURIUpdated(string newBaseURI);
    
    constructor(string memory baseURI) ERC721("Rush Achievement NFT", "RUSHNFT") {
        _baseTokenURI = baseURI;
        
        // Set rarity limits (can be updated by owner)
        rarityLimits[Rarity.BRONZE] = 100000;    // 100k bronze NFTs
        rarityLimits[Rarity.SILVER] = 50000;      // 50k silver NFTs
        rarityLimits[Rarity.GOLD] = 10000;        // 10k gold NFTs
        rarityLimits[Rarity.PLATINUM] = 1000;     // 1k platinum NFTs
    }
    
    /**
     * @dev Mint a new achievement NFT
     * @param to Address to mint NFT to
     * @param rarity Rarity level of the achievement
     * @param score Score achieved
     * @param metadata Metadata string
     * @param powerLevel Power level of the achievement
     * @param attributes Array of attributes
     * @return tokenId The minted token ID
     */
    function mintAchievement(
        address to,
        Rarity rarity,
        uint256 score,
        string memory metadata,
        uint256 powerLevel,
        string[] memory attributes
    ) external onlyOwner nonReentrant returns (uint256) {
        require(to != address(0), "RushNFT: Cannot mint to zero address");
        require(rarityCounts[rarity] < rarityLimits[rarity], "RushNFT: Rarity limit exceeded");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        achievements[tokenId] = Achievement({
            rarity: rarity,
            score: score,
            timestamp: block.timestamp,
            metadata: metadata,
            isTradeable: true,
            powerLevel: powerLevel,
            attributes: attributes
        });
        
        userAchievementCount[to]++;
        rarityCounts[rarity]++;
        
        _safeMint(to, tokenId);
        
        emit AchievementMinted(to, tokenId, rarity, score, metadata);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple achievements
     * @param to Address to mint NFTs to
     * @param rarities Array of rarity levels
     * @param scores Array of scores
     * @param metadatas Array of metadata strings
     * @param powerLevels Array of power levels
     * @param attributesArray Array of attributes arrays
     * @return tokenIds Array of minted token IDs
     */
    function batchMintAchievements(
        address to,
        Rarity[] memory rarities,
        uint256[] memory scores,
        string[] memory metadatas,
        uint256[] memory powerLevels,
        string[][] memory attributesArray
    ) external onlyOwner nonReentrant returns (uint256[] memory tokenIds) {
        require(
            rarities.length == scores.length &&
            scores.length == metadatas.length &&
            metadatas.length == powerLevels.length &&
            powerLevels.length == attributesArray.length,
            "RushNFT: Array length mismatch"
        );
        
        tokenIds = new uint256[](rarities.length);
        
        for (uint256 i = 0; i < rarities.length; i++) {
            tokenIds[i] = mintAchievement(
                to,
                rarities[i],
                scores[i],
                metadatas[i],
                powerLevels[i],
                attributesArray[i]
            );
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Set tradeability of an NFT
     * @param tokenId Token ID to update
     * @param tradeable Whether the NFT is tradeable
     */
    function setTradeability(uint256 tokenId, bool tradeable) external {
        require(ownerOf(tokenId) == msg.sender, "RushNFT: Not owner of token");
        achievements[tokenId].isTradeable = tradeable;
    }
    
    /**
     * @dev Get achievement details
     * @param tokenId Token ID to query
     * @return achievement Achievement struct
     */
    function getAchievement(uint256 tokenId) external view returns (Achievement memory achievement) {
        require(_exists(tokenId), "RushNFT: Token does not exist");
        return achievements[tokenId];
    }
    
    /**
     * @dev Get user's achievement count by rarity
     * @param user User address
     * @return counts Array of counts for each rarity
     */
    function getUserAchievementCounts(address user) external view returns (uint256[4] memory counts) {
        uint256 totalCount = userAchievementCount[user];
        uint256[] memory userTokens = getUserTokens(user);
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            Rarity rarity = achievements[userTokens[i]].rarity;
            counts[uint256(rarity)]++;
        }
        
        return counts;
    }
    
    /**
     * @dev Get all tokens owned by a user
     * @param user User address
     * @return tokens Array of token IDs
     */
    function getUserTokens(address user) public view returns (uint256[] memory tokens) {
        uint256 balance = balanceOf(user);
        tokens = new uint256[](balance);
        
        uint256 index = 0;
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (ownerOf(i) == user) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }
    
    /**
     * @dev Get rarity statistics
     * @return counts Array of counts for each rarity
     * @return limits Array of limits for each rarity
     */
    function getRarityStats() external view returns (uint256[4] memory counts, uint256[4] memory limits) {
        for (uint256 i = 0; i < 4; i++) {
            counts[i] = rarityCounts[Rarity(i)];
            limits[i] = rarityLimits[Rarity(i)];
        }
    }
    
    /**
     * @dev Set rarity limits
     * @param rarity Rarity level
     * @param limit New limit
     */
    function setRarityLimit(Rarity rarity, uint256 limit) external onlyOwner {
        rarityLimits[rarity] = limit;
        emit RarityLimitSet(rarity, limit);
    }
    
    /**
     * @dev Set base URI for metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @dev Get token URI
     * @param tokenId Token ID
     * @return Token URI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_exists(tokenId), "RushNFT: Token does not exist");
        
        string memory baseURI = _baseTokenURI;
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString()))
            : "";
    }
    
    /**
     * @dev Override _beforeTokenTransfer to check tradeability
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
        
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Check if NFT is tradeable
        require(achievements[tokenId].isTradeable, "RushNFT: Token is not tradeable");
    }
    
    /**
     * @dev Override _burn to clean up storage
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        
        // Clean up achievement data
        delete achievements[tokenId];
    }
    
    /**
     * @dev Get total supply
     * @return Total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
