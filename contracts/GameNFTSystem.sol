// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GameNFTSystem
 * @notice Gamified NFT system with achievements, power-ups, and evolution mechanics
 * @dev Integrates with GameLoopScoreManager for tournament-based rewards
 */
contract GameNFTSystem is ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant GAME_ADMIN = keccak256("GAME_ADMIN");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIds;

    enum NFTType {
        ACHIEVEMENT,    // Tournament wins, milestones
        POWERUP,        // Gameplay bonuses
        EVOLUTION,      // Upgradeable character NFTs
        LOOTBOX,        // Mystery rewards
        SPECIAL         // Limited editions
    }

    enum Rarity {
        COMMON,
        RARE,
        EPIC,
        LEGENDARY,
        MYTHIC
    }

    struct NFTMetadata {
        NFTType nftType;
        Rarity rarity;
        uint256 level;
        uint256 experiencePoints;
        uint256 powerBonus;        // Percentage boost (e.g., 10 = +10%)
        uint256 durationSeconds;   // For power-ups
        uint256 createdAt;
        uint256 lastEvolved;
        bool isActive;
        string category;           // "tournament_winner", "speed_boost", etc.
    }

    struct PlayerStats {
        uint256 totalNFTs;
        uint256 achievementCount;
        uint256 powerUpCount;
        uint256 totalExperience;
        uint256 highestLevel;
    }

    // Token ID => NFT Metadata
    mapping(uint256 => NFTMetadata) public nftMetadata;

    // Player => Stats
    mapping(address => PlayerStats) public playerStats;

    // Category => Achievement granted (prevents duplicate achievements)
    mapping(address => mapping(string => bool)) public hasAchievement;

    // Evolution paths: tokenId => array of token URIs for each level
    mapping(uint256 => string[]) public evolutionURIs;

    // Active power-ups per player
    mapping(address => uint256[]) public activePowerUps;

    // Events
    event NFTMinted(
        address indexed player,
        uint256 indexed tokenId,
        NFTType nftType,
        Rarity rarity,
        string category
    );

    event NFTEvolved(
        uint256 indexed tokenId,
        uint256 newLevel,
        string newURI
    );

    event ExperienceGained(
        uint256 indexed tokenId,
        uint256 amount,
        uint256 totalExperience
    );

    event PowerUpActivated(
        address indexed player,
        uint256 indexed tokenId,
        uint256 expiresAt
    );

    constructor() ERC721("AvalancheRushNFT", "ARNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_ADMIN, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Mint achievement NFT for tournament victory
     */
    function mintAchievementNFT(
        address player,
        string memory category,
        string memory tokenURI,
        Rarity rarity
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(!hasAchievement[player][category], "Achievement already earned");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(player, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        nftMetadata[newTokenId] = NFTMetadata({
            nftType: NFTType.ACHIEVEMENT,
            rarity: rarity,
            level: 1,
            experiencePoints: 0,
            powerBonus: 0,
            durationSeconds: 0,
            createdAt: block.timestamp,
            lastEvolved: block.timestamp,
            isActive: true,
            category: category
        });

        hasAchievement[player][category] = true;
        playerStats[player].achievementCount++;
        playerStats[player].totalNFTs++;

        emit NFTMinted(player, newTokenId, NFTType.ACHIEVEMENT, rarity, category);

        return newTokenId;
    }

    /**
     * @notice Mint power-up NFT with gameplay bonuses
     */
    function mintPowerUpNFT(
        address player,
        string memory tokenURI,
        uint256 powerBonus,
        uint256 durationSeconds,
        Rarity rarity
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(player, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        nftMetadata[newTokenId] = NFTMetadata({
            nftType: NFTType.POWERUP,
            rarity: rarity,
            level: 1,
            experiencePoints: 0,
            powerBonus: powerBonus,
            durationSeconds: durationSeconds,
            createdAt: block.timestamp,
            lastEvolved: 0,
            isActive: false,
            category: "power_up"
        });

        playerStats[player].powerUpCount++;
        playerStats[player].totalNFTs++;

        emit NFTMinted(player, newTokenId, NFTType.POWERUP, rarity, "power_up");

        return newTokenId;
    }

    /**
     * @notice Mint evolution NFT with multiple level URIs
     */
    function mintEvolutionNFT(
        address player,
        string[] memory uris,
        Rarity rarity
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(uris.length > 0, "Need at least one URI");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(player, newTokenId);
        _setTokenURI(newTokenId, uris[0]);

        nftMetadata[newTokenId] = NFTMetadata({
            nftType: NFTType.EVOLUTION,
            rarity: rarity,
            level: 1,
            experiencePoints: 0,
            powerBonus: 0,
            durationSeconds: 0,
            createdAt: block.timestamp,
            lastEvolved: block.timestamp,
            isActive: true,
            category: "evolution_character"
        });

        evolutionURIs[newTokenId] = uris;
        playerStats[player].totalNFTs++;

        emit NFTMinted(player, newTokenId, NFTType.EVOLUTION, rarity, "evolution_character");

        return newTokenId;
    }

    /**
     * @notice Add experience to NFT based on player performance
     */
    function addExperience(uint256 tokenId, uint256 amount)
        external
        onlyRole(GAME_ADMIN)
    {
        require(_exists(tokenId), "Token does not exist");

        NFTMetadata storage metadata = nftMetadata[tokenId];
        metadata.experiencePoints += amount;

        address owner = ownerOf(tokenId);
        playerStats[owner].totalExperience += amount;

        emit ExperienceGained(tokenId, amount, metadata.experiencePoints);

        // Auto-level up at certain thresholds
        _checkLevelUp(tokenId);
    }

    /**
     * @notice Evolve NFT to next level
     */
    function evolveNFT(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        NFTMetadata storage metadata = nftMetadata[tokenId];
        require(metadata.nftType == NFTType.EVOLUTION, "Not evolution type");

        string[] memory uris = evolutionURIs[tokenId];
        require(metadata.level < uris.length, "Max level reached");

        uint256 requiredXP = _getRequiredXP(metadata.level);
        require(metadata.experiencePoints >= requiredXP, "Insufficient experience");

        metadata.level++;
        metadata.lastEvolved = block.timestamp;
        _setTokenURI(tokenId, uris[metadata.level - 1]);

        if (metadata.level > playerStats[msg.sender].highestLevel) {
            playerStats[msg.sender].highestLevel = metadata.level;
        }

        emit NFTEvolved(tokenId, metadata.level, uris[metadata.level - 1]);
    }

    /**
     * @notice Activate power-up NFT
     */
    function activatePowerUp(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        NFTMetadata storage metadata = nftMetadata[tokenId];
        require(metadata.nftType == NFTType.POWERUP, "Not power-up type");
        require(!metadata.isActive, "Already active");

        metadata.isActive = true;
        activePowerUps[msg.sender].push(tokenId);

        uint256 expiresAt = block.timestamp + metadata.durationSeconds;
        emit PowerUpActivated(msg.sender, tokenId, expiresAt);
    }

    /**
     * @notice Get total power bonus for player
     */
    function getPlayerPowerBonus(address player) external view returns (uint256) {
        uint256[] memory powerUps = activePowerUps[player];
        uint256 totalBonus = 0;

        for (uint256 i = 0; i < powerUps.length; i++) {
            NFTMetadata memory metadata = nftMetadata[powerUps[i]];
            if (metadata.isActive) {
                totalBonus += metadata.powerBonus;
            }
        }

        return totalBonus;
    }

    /**
     * @notice Get all NFTs owned by player
     */
    function getPlayerNFTs(address player) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(player);
        uint256[] memory tokens = new uint256[](balance);

        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (_exists(i) && ownerOf(i) == player) {
                tokens[index] = i;
                index++;
            }
        }

        return tokens;
    }

    /**
     * @notice Get NFT full details
     */
    function getNFTDetails(uint256 tokenId)
        external
        view
        returns (NFTMetadata memory, string memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return (nftMetadata[tokenId], tokenURI(tokenId));
    }

    /**
     * @dev Check and auto-level up NFT
     */
    function _checkLevelUp(uint256 tokenId) internal {
        NFTMetadata storage metadata = nftMetadata[tokenId];
        uint256 requiredXP = _getRequiredXP(metadata.level);

        if (metadata.experiencePoints >= requiredXP && metadata.level < 100) {
            metadata.level++;

            address owner = ownerOf(tokenId);
            if (metadata.level > playerStats[owner].highestLevel) {
                playerStats[owner].highestLevel = metadata.level;
            }
        }
    }

    /**
     * @dev Calculate required XP for next level
     */
    function _getRequiredXP(uint256 currentLevel) internal pure returns (uint256) {
        return currentLevel * 100 * (currentLevel + 1) / 2;
    }

    /**
     * @notice Award batch NFTs (for tournament winners)
     */
    function batchMintAchievements(
        address[] memory players,
        string[] memory categories,
        string[] memory uris,
        Rarity[] memory rarities
    ) external onlyRole(MINTER_ROLE) {
        require(
            players.length == categories.length &&
            players.length == uris.length &&
            players.length == rarities.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < players.length; i++) {
            if (!hasAchievement[players[i]][categories[i]]) {
                mintAchievementNFT(players[i], categories[i], uris[i], rarities[i]);
            }
        }
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
