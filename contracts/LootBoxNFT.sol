// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./GameNFTSystem.sol";

/**
 * @title LootBoxNFT
 * @notice Loot box system with weighted random rewards
 * @dev Integrates with GameNFTSystem for distributing NFT rewards
 */
contract LootBoxNFT is Ownable, ReentrancyGuard {

    GameNFTSystem public nftSystem;

    enum LootBoxTier {
        BRONZE,
        SILVER,
        GOLD,
        DIAMOND,
        MYTHIC
    }

    struct LootBox {
        string name;
        LootBoxTier tier;
        uint256 cooldownSeconds;
        bool isActive;
        RewardPool[] rewardPools;
    }

    struct RewardPool {
        GameNFTSystem.NFTType nftType;
        GameNFTSystem.Rarity rarity;
        uint256 weight;           // Probability weight
        string[] uris;            // Possible token URIs
        uint256 powerBonus;       // For power-ups
        uint256 durationSeconds;  // For power-ups
    }

    struct PlayerLootState {
        uint256 lastOpenTime;
        uint256 totalBoxesOpened;
        uint256 totalRewardsReceived;
        mapping(LootBoxTier => uint256) boxesOpenedByTier;
    }

    // Loot box definitions
    mapping(uint256 => LootBox) public lootBoxes;
    uint256 public lootBoxCount;

    // Player states
    mapping(address => PlayerLootState) public playerStates;

    // Eligibility tracking
    mapping(address => mapping(uint256 => bool)) public playerEligibility;

    // Events
    event LootBoxCreated(uint256 indexed lootBoxId, string name, LootBoxTier tier);
    event LootBoxOpened(
        address indexed player,
        uint256 indexed lootBoxId,
        uint256 indexed tokenId,
        GameNFTSystem.Rarity rarity
    );
    event EligibilityGranted(address indexed player, uint256 indexed lootBoxId);

    constructor(address _nftSystem) Ownable(msg.sender) {
        nftSystem = GameNFTSystem(_nftSystem);
    }

    /**
     * @notice Create a new loot box tier
     */
    function createLootBox(
        string memory name,
        LootBoxTier tier,
        uint256 cooldownSeconds
    ) external onlyOwner returns (uint256) {
        uint256 lootBoxId = lootBoxCount++;

        LootBox storage newBox = lootBoxes[lootBoxId];
        newBox.name = name;
        newBox.tier = tier;
        newBox.cooldownSeconds = cooldownSeconds;
        newBox.isActive = true;

        emit LootBoxCreated(lootBoxId, name, tier);
        return lootBoxId;
    }

    /**
     * @notice Add reward pool to loot box
     */
    function addRewardPool(
        uint256 lootBoxId,
        GameNFTSystem.NFTType nftType,
        GameNFTSystem.Rarity rarity,
        uint256 weight,
        string[] memory uris,
        uint256 powerBonus,
        uint256 durationSeconds
    ) external onlyOwner {
        require(lootBoxId < lootBoxCount, "Invalid loot box");

        LootBox storage box = lootBoxes[lootBoxId];
        box.rewardPools.push(RewardPool({
            nftType: nftType,
            rarity: rarity,
            weight: weight,
            uris: uris,
            powerBonus: powerBonus,
            durationSeconds: durationSeconds
        }));
    }

    /**
     * @notice Grant loot box eligibility to player (tournament reward, etc.)
     */
    function grantEligibility(address player, uint256 lootBoxId) external onlyOwner {
        require(lootBoxId < lootBoxCount, "Invalid loot box");
        playerEligibility[player][lootBoxId] = true;
        emit EligibilityGranted(player, lootBoxId);
    }

    /**
     * @notice Batch grant eligibility (for tournament winners)
     */
    function batchGrantEligibility(
        address[] memory players,
        uint256 lootBoxId
    ) external onlyOwner {
        for (uint256 i = 0; i < players.length; i++) {
            grantEligibility(players[i], lootBoxId);
        }
    }

    /**
     * @notice Open loot box and receive random NFT
     */
    function openLootBox(uint256 lootBoxId) external nonReentrant returns (uint256) {
        LootBox storage box = lootBoxes[lootBoxId];
        require(box.isActive, "Loot box not active");
        require(playerEligibility[msg.sender][lootBoxId], "Not eligible");

        PlayerLootState storage state = playerStates[msg.sender];
        require(
            block.timestamp >= state.lastOpenTime + box.cooldownSeconds,
            "Cooldown active"
        );

        // Clear eligibility
        playerEligibility[msg.sender][lootBoxId] = false;

        // Select random reward
        RewardPool memory selectedReward = _selectReward(box);

        // Mint NFT based on reward type
        uint256 tokenId = _mintReward(selectedReward);

        // Update player state
        state.lastOpenTime = block.timestamp;
        state.totalBoxesOpened++;
        state.totalRewardsReceived++;
        state.boxesOpenedByTier[box.tier]++;

        emit LootBoxOpened(msg.sender, lootBoxId, tokenId, selectedReward.rarity);

        return tokenId;
    }

    /**
     * @dev Select random reward from pool using weighted probability
     */
    function _selectReward(LootBox storage box)
        internal
        view
        returns (RewardPool memory)
    {
        require(box.rewardPools.length > 0, "No rewards in pool");

        // Calculate total weight
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < box.rewardPools.length; i++) {
            totalWeight += box.rewardPools[i].weight;
        }

        // Generate pseudo-random number
        uint256 randomValue = _generateRandomNumber() % totalWeight;

        // Select reward based on weight
        uint256 cumulativeWeight = 0;
        for (uint256 i = 0; i < box.rewardPools.length; i++) {
            cumulativeWeight += box.rewardPools[i].weight;
            if (randomValue < cumulativeWeight) {
                return box.rewardPools[i];
            }
        }

        return box.rewardPools[0]; // Fallback
    }

    /**
     * @dev Mint NFT reward to player
     */
    function _mintReward(RewardPool memory reward) internal returns (uint256) {
        // Select random URI from pool
        string memory selectedURI = reward.uris[
            _generateRandomNumber() % reward.uris.length
        ];

        if (reward.nftType == GameNFTSystem.NFTType.ACHIEVEMENT) {
            return nftSystem.mintAchievementNFT(
                msg.sender,
                "lootbox_reward",
                selectedURI,
                reward.rarity
            );
        } else if (reward.nftType == GameNFTSystem.NFTType.POWERUP) {
            return nftSystem.mintPowerUpNFT(
                msg.sender,
                selectedURI,
                reward.powerBonus,
                reward.durationSeconds,
                reward.rarity
            );
        } else if (reward.nftType == GameNFTSystem.NFTType.EVOLUTION) {
            string[] memory uris = new string[](1);
            uris[0] = selectedURI;
            return nftSystem.mintEvolutionNFT(
                msg.sender,
                uris,
                reward.rarity
            );
        }

        revert("Invalid NFT type");
    }

    /**
     * @dev Generate pseudo-random number
     * NOTE: For production, use Chainlink VRF for true randomness
     */
    function _generateRandomNumber() internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    playerStates[msg.sender].totalBoxesOpened
                )
            )
        );
    }

    /**
     * @notice Get player's loot box statistics
     */
    function getPlayerStats(address player)
        external
        view
        returns (
            uint256 totalOpened,
            uint256 totalRewards,
            uint256 lastOpened
        )
    {
        PlayerLootState storage state = playerStates[player];
        return (
            state.totalBoxesOpened,
            state.totalRewardsReceived,
            state.lastOpenTime
        );
    }

    /**
     * @notice Check if player can open loot box
     */
    function canOpenLootBox(address player, uint256 lootBoxId)
        external
        view
        returns (bool eligible, bool cooledDown)
    {
        LootBox storage box = lootBoxes[lootBoxId];
        PlayerLootState storage state = playerStates[player];

        eligible = playerEligibility[player][lootBoxId];
        cooledDown = block.timestamp >= state.lastOpenTime + box.cooldownSeconds;

        return (eligible, cooledDown);
    }

    /**
     * @notice Get loot box reward pools
     */
    function getLootBoxRewards(uint256 lootBoxId)
        external
        view
        returns (RewardPool[] memory)
    {
        require(lootBoxId < lootBoxCount, "Invalid loot box");
        return lootBoxes[lootBoxId].rewardPools;
    }

    /**
     * @notice Update NFT system contract
     */
    function updateNFTSystem(address newNFTSystem) external onlyOwner {
        nftSystem = GameNFTSystem(newNFTSystem);
    }
}
