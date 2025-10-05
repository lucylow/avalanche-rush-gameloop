// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./GameNFTSystem.sol";
import "./LootBoxNFT.sol";
import "./GameLoopScoreManager.sol";

/**
 * @title TournamentNFTRewards
 * @notice Automated NFT reward distribution for tournament winners
 * @dev Integrates GameLoopScoreManager with NFT minting system
 */
contract TournamentNFTRewards is Ownable, ReentrancyGuard {

    GameLoopScoreManager public scoreManager;
    GameNFTSystem public nftSystem;
    LootBoxNFT public lootBoxSystem;

    struct TournamentRewardConfig {
        bool enabled;
        uint256 winner1LootBoxId;      // 1st place
        uint256 winner2LootBoxId;      // 2nd place
        uint256 winner3LootBoxId;      // 3rd place
        uint256 participationLootBoxId; // All participants
        string achievementURI;          // Winner achievement NFT URI
        bool autoDistribute;            // Auto-mint on tournament end
    }

    struct RewardHistory {
        uint256 tournamentId;
        address player;
        uint256[] nftIds;
        uint256 timestamp;
    }

    // Tournament ID => Reward Configuration
    mapping(uint256 => TournamentRewardConfig) public tournamentRewards;

    // Player => Reward History
    mapping(address => RewardHistory[]) public playerRewardHistory;

    // Tournament => Player => Claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // Events
    event TournamentRewardsConfigured(
        uint256 indexed tournamentId,
        uint256 winner1Box,
        uint256 winner2Box,
        uint256 winner3Box
    );

    event RewardsDistributed(
        uint256 indexed tournamentId,
        address indexed player,
        uint256[] nftIds
    );

    event AchievementAwarded(
        uint256 indexed tournamentId,
        address indexed player,
        uint256 indexed nftId
    );

    constructor(
        address _scoreManager,
        address _nftSystem,
        address _lootBoxSystem
    ) Ownable(msg.sender) {
        scoreManager = GameLoopScoreManager(_scoreManager);
        nftSystem = GameNFTSystem(_nftSystem);
        lootBoxSystem = LootBoxNFT(_lootBoxSystem);
    }

    /**
     * @notice Configure NFT rewards for tournament
     */
    function configureTournamentRewards(
        uint256 tournamentId,
        uint256 winner1Box,
        uint256 winner2Box,
        uint256 winner3Box,
        uint256 participationBox,
        string memory achievementURI,
        bool autoDistribute
    ) external onlyOwner {
        tournamentRewards[tournamentId] = TournamentRewardConfig({
            enabled: true,
            winner1LootBoxId: winner1Box,
            winner2LootBoxId: winner2Box,
            winner3LootBoxId: winner3Box,
            participationLootBoxId: participationBox,
            achievementURI: achievementURI,
            autoDistribute: autoDistribute
        });

        emit TournamentRewardsConfigured(
            tournamentId,
            winner1Box,
            winner2Box,
            winner3Box
        );
    }

    /**
     * @notice Distribute rewards to tournament winners
     * @dev Called after tournament ends
     */
    function distributeTournamentRewards(uint256 tournamentId)
        external
        onlyOwner
        nonReentrant
    {
        TournamentRewardConfig memory config = tournamentRewards[tournamentId];
        require(config.enabled, "Rewards not configured");

        // Get leaderboard
        GameLoopScoreManager.LeaderboardEntry[] memory leaderboard =
            scoreManager.getLeaderboard(tournamentId);

        require(leaderboard.length > 0, "No participants");

        // Award top 3
        if (leaderboard.length >= 1) {
            _awardWinnerRewards(
                tournamentId,
                leaderboard[0].player,
                config.winner1LootBoxId,
                GameNFTSystem.Rarity.LEGENDARY,
                config.achievementURI,
                "1st_place"
            );
        }

        if (leaderboard.length >= 2) {
            _awardWinnerRewards(
                tournamentId,
                leaderboard[1].player,
                config.winner2LootBoxId,
                GameNFTSystem.Rarity.EPIC,
                config.achievementURI,
                "2nd_place"
            );
        }

        if (leaderboard.length >= 3) {
            _awardWinnerRewards(
                tournamentId,
                leaderboard[2].player,
                config.winner3LootBoxId,
                GameNFTSystem.Rarity.RARE,
                config.achievementURI,
                "3rd_place"
            );
        }

        // Award participation rewards
        if (config.participationLootBoxId > 0) {
            for (uint256 i = 0; i < leaderboard.length && i < 100; i++) {
                if (!hasClaimed[tournamentId][leaderboard[i].player]) {
                    lootBoxSystem.grantEligibility(
                        leaderboard[i].player,
                        config.participationLootBoxId
                    );
                }
            }
        }
    }

    /**
     * @dev Award winner with achievement NFT and loot box
     */
    function _awardWinnerRewards(
        uint256 tournamentId,
        address player,
        uint256 lootBoxId,
        GameNFTSystem.Rarity rarity,
        string memory achievementURI,
        string memory category
    ) internal {
        require(!hasClaimed[tournamentId][player], "Already claimed");

        uint256[] memory nftIds = new uint256[](1);

        // Mint achievement NFT
        nftIds[0] = nftSystem.mintAchievementNFT(
            player,
            category,
            achievementURI,
            rarity
        );

        emit AchievementAwarded(tournamentId, player, nftIds[0]);

        // Grant loot box
        if (lootBoxId > 0) {
            lootBoxSystem.grantEligibility(player, lootBoxId);
        }

        // Record reward
        playerRewardHistory[player].push(RewardHistory({
            tournamentId: tournamentId,
            player: player,
            nftIds: nftIds,
            timestamp: block.timestamp
        }));

        hasClaimed[tournamentId][player] = true;

        emit RewardsDistributed(tournamentId, player, nftIds);
    }

    /**
     * @notice Claim tournament rewards (if not auto-distributed)
     */
    function claimTournamentRewards(uint256 tournamentId)
        external
        nonReentrant
    {
        TournamentRewardConfig memory config = tournamentRewards[tournamentId];
        require(config.enabled, "Rewards not configured");
        require(!hasClaimed[tournamentId][msg.sender], "Already claimed");

        // Get player rank
        GameLoopScoreManager.LeaderboardEntry[] memory leaderboard =
            scoreManager.getLeaderboard(tournamentId);

        uint256 playerRank = 0;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].player == msg.sender) {
                playerRank = i + 1;
                break;
            }
        }

        require(playerRank > 0, "Not in leaderboard");

        // Award based on rank
        if (playerRank == 1) {
            _awardWinnerRewards(
                tournamentId,
                msg.sender,
                config.winner1LootBoxId,
                GameNFTSystem.Rarity.LEGENDARY,
                config.achievementURI,
                "1st_place"
            );
        } else if (playerRank == 2) {
            _awardWinnerRewards(
                tournamentId,
                msg.sender,
                config.winner2LootBoxId,
                GameNFTSystem.Rarity.EPIC,
                config.achievementURI,
                "2nd_place"
            );
        } else if (playerRank == 3) {
            _awardWinnerRewards(
                tournamentId,
                msg.sender,
                config.winner3LootBoxId,
                GameNFTSystem.Rarity.RARE,
                config.achievementURI,
                "3rd_place"
            );
        } else if (config.participationLootBoxId > 0) {
            // Participation reward
            lootBoxSystem.grantEligibility(msg.sender, config.participationLootBoxId);
            hasClaimed[tournamentId][msg.sender] = true;
        }
    }

    /**
     * @notice Award experience points to NFTs based on tournament performance
     */
    function awardExperiencePoints(
        uint256 tournamentId,
        address player,
        uint256 experienceAmount
    ) external onlyOwner {
        // Get player's NFTs
        uint256[] memory playerNFTs = nftSystem.getPlayerNFTs(player);

        // Award XP to evolution NFTs
        for (uint256 i = 0; i < playerNFTs.length; i++) {
            (GameNFTSystem.NFTMetadata memory metadata, ) =
                nftSystem.getNFTDetails(playerNFTs[i]);

            if (metadata.nftType == GameNFTSystem.NFTType.EVOLUTION) {
                nftSystem.addExperience(playerNFTs[i], experienceAmount);
            }
        }
    }

    /**
     * @notice Get player's tournament reward history
     */
    function getPlayerRewardHistory(address player)
        external
        view
        returns (RewardHistory[] memory)
    {
        return playerRewardHistory[player];
    }

    /**
     * @notice Batch configure multiple tournaments
     */
    function batchConfigureTournaments(
        uint256[] memory tournamentIds,
        uint256[] memory winner1Boxes,
        uint256[] memory winner2Boxes,
        uint256[] memory winner3Boxes,
        string[] memory achievementURIs
    ) external onlyOwner {
        require(
            tournamentIds.length == winner1Boxes.length &&
            tournamentIds.length == winner2Boxes.length &&
            tournamentIds.length == winner3Boxes.length &&
            tournamentIds.length == achievementURIs.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < tournamentIds.length; i++) {
            configureTournamentRewards(
                tournamentIds[i],
                winner1Boxes[i],
                winner2Boxes[i],
                winner3Boxes[i],
                0, // No participation box in batch
                achievementURIs[i],
                false
            );
        }
    }

    /**
     * @notice Update contract addresses
     */
    function updateContracts(
        address newScoreManager,
        address newNFTSystem,
        address newLootBoxSystem
    ) external onlyOwner {
        if (newScoreManager != address(0)) {
            scoreManager = GameLoopScoreManager(newScoreManager);
        }
        if (newNFTSystem != address(0)) {
            nftSystem = GameNFTSystem(newNFTSystem);
        }
        if (newLootBoxSystem != address(0)) {
            lootBoxSystem = LootBoxNFT(newLootBoxSystem);
        }
    }
}
