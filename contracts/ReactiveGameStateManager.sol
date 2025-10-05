// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReactive.sol";
import "./AbstractReactive.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ReactiveGameStateManager
 * @dev Real-time cross-chain game state synchronization using Reactive Network
 * @notice Maximizes REACT gas usage while providing genuine gaming utility
 */
contract ReactiveGameStateManager is AbstractReactive, ReentrancyGuard, Ownable {
    
    struct PlayerState {
        uint256 score;
        uint256 level;
        uint256 experience;
        uint256 tokensEarned;
        uint256 lastActive;
        address[] ownedNFTs;
        mapping(uint256 => bool) achievementsUnlocked;
        mapping(uint256 => uint256) chainActivity; // chainId => activity count
        uint256 totalPlayTime;
        uint256 averageSessionLength;
        uint256 totalTransactions;
        uint256 averageScore;
        uint256 retentionDays;
    }
    
    struct Tournament {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        address[] participants;
        mapping(address => uint256) scores;
        bool isActive;
        uint256[] supportedChains;
        uint256 entryFee;
        string tournamentType; // "daily", "weekly", "monthly", "cross-chain"
    }
    
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 level;
        uint256 chainId;
        uint256 lastUpdate;
    }
    
    // State variables
    mapping(address => PlayerState) public players;
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => address[]) public leaderboards; // chainId => top players
    mapping(uint256 => LeaderboardEntry[]) public chainLeaderboards;
    mapping(address => mapping(uint256 => bool)) public tournamentParticipation;
    
    // Game metrics
    uint256 public totalPlayers;
    uint256 public activePlayersToday;
    uint256 public totalTransactions;
    uint256 public totalRewardsDistributed;
    uint256 public tournamentCount;
    
    // Token contract
    IERC20 public rushToken;
    
    // Events
    event PlayerStateUpdated(address indexed player, uint256 newScore, uint256 chainId);
    event TournamentStarted(uint256 indexed tournamentId, uint256 prizePool, uint256[] supportedChains);
    event TournamentEnded(uint256 indexed tournamentId, address winner, uint256 prize);
    event LeaderboardUpdated(uint256 chainId, address[] topPlayers);
    event CrossChainAchievement(address indexed player, uint256 achievementId, uint256 sourceChain);
    event PlayerLevelUp(address indexed player, uint256 newLevel, uint256 totalXP);
    event CrossChainSync(address indexed player, uint256 fromChain, uint256 toChain);
    
    // Modifiers
    modifier onlyValidTournament(uint256 tournamentId) {
        require(tournaments[tournamentId].isActive, "Tournament not active");
        require(block.timestamp >= tournaments[tournamentId].startTime, "Tournament not started");
        require(block.timestamp <= tournaments[tournamentId].endTime, "Tournament ended");
        _;
    }
    
    constructor(address _rushToken) {
        rushToken = IERC20(_rushToken);
    }
    
    /**
     * @dev Main reactive function for cross-chain game state synchronization
     */
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
    ) external override vmOnly {
        address player = address(uint160(topic_1));
        
        // Process different game events
        if (isGameCompletedEvent(topic_0)) {
            updatePlayerScore(player, chain_id, data);
        } else if (isQuestCompletedEvent(topic_0)) {
            awardExperience(player, chain_id, data);
        } else if (isNFTMintedEvent(topic_0)) {
            updatePlayerNFTs(player, chain_id, data);
        } else if (isAchievementUnlockedEvent(topic_0)) {
            processAchievement(player, chain_id, data);
        }
        
        // Update leaderboards in real-time
        updateLeaderboard(chain_id, player);
        
        // Check for tournament eligibility
        checkTournamentParticipation(player, chain_id);
        
        // Sync cross-chain state
        syncCrossChainState(player, chain_id);
    }
    
    /**
     * @dev Update player score from game completion
     */
    function updatePlayerScore(address player, uint256 chainId, bytes calldata data) internal {
        (uint256 newScore, uint256 bonusXP, uint256 playTime) = abi.decode(data, (uint256, uint256, uint256));
        
        PlayerState storage playerState = players[player];
        
        // Update player state
        playerState.score += newScore;
        playerState.experience += bonusXP;
        playerState.lastActive = block.timestamp;
        playerState.totalPlayTime += playTime;
        playerState.totalTransactions++;
        playerState.chainActivity[chainId]++;
        
        // Calculate average session length
        if (playerState.totalTransactions > 0) {
            playerState.averageSessionLength = playerState.totalPlayTime / playerState.totalTransactions;
        }
        
        // Calculate average score
        playerState.averageScore = playerState.score / playerState.totalTransactions;
        
        // Level up logic
        if (playerState.experience >= getLevelThreshold(playerState.level)) {
            playerState.level++;
            emit PlayerLevelUp(player, playerState.level, playerState.experience);
            
            // Award level up bonus
            uint256 levelBonus = playerState.level * 100 * 10**18;
            rushToken.transfer(player, levelBonus);
            playerState.tokensEarned += levelBonus;
        }
        
        // Award score-based rewards
        uint256 scoreReward = calculateScoreReward(newScore, chainId);
        if (scoreReward > 0) {
            rushToken.transfer(player, scoreReward);
            playerState.tokensEarned += scoreReward;
        }
        
        emit PlayerStateUpdated(player, playerState.score, chainId);
    }
    
    /**
     * @dev Award experience from quest completion
     */
    function awardExperience(address player, uint256 chainId, bytes calldata data) internal {
        (uint256 questId, uint256 xpReward, uint256 tokenReward) = abi.decode(data, (uint256, uint256, uint256));
        
        PlayerState storage playerState = players[player];
        playerState.experience += xpReward;
        playerState.chainActivity[chainId]++;
        
        // Award tokens
        if (tokenReward > 0) {
            rushToken.transfer(player, tokenReward);
            playerState.tokensEarned += tokenReward;
        }
        
        // Check for level up
        if (playerState.experience >= getLevelThreshold(playerState.level)) {
            playerState.level++;
            emit PlayerLevelUp(player, playerState.level, playerState.experience);
        }
    }
    
    /**
     * @dev Update player NFTs
     */
    function updatePlayerNFTs(address player, uint256 chainId, bytes calldata data) internal {
        (address nftContract, uint256 tokenId) = abi.decode(data, (address, uint256));
        
        PlayerState storage playerState = players[player];
        playerState.ownedNFTs.push(nftContract);
        playerState.chainActivity[chainId]++;
        
        // Award NFT collection bonus
        uint256 collectionBonus = playerState.ownedNFTs.length * 50 * 10**18;
        rushToken.transfer(player, collectionBonus);
        playerState.tokensEarned += collectionBonus;
    }
    
    /**
     * @dev Process achievement unlock
     */
    function processAchievement(address player, uint256 chainId, bytes calldata data) internal {
        (uint256 achievementId, uint256 rarity) = abi.decode(data, (uint256, uint256));
        
        PlayerState storage playerState = players[player];
        playerState.achievementsUnlocked[achievementId] = true;
        playerState.chainActivity[chainId]++;
        
        // Award achievement bonus based on rarity
        uint256 achievementBonus = rarity * 100 * 10**18;
        rushToken.transfer(player, achievementBonus);
        playerState.tokensEarned += achievementBonus;
        
        emit CrossChainAchievement(player, achievementId, chainId);
    }
    
    /**
     * @dev Update leaderboard for specific chain
     */
    function updateLeaderboard(uint256 chainId, address player) internal {
        PlayerState storage playerState = players[player];
        
        // Find or create leaderboard entry
        LeaderboardEntry[] storage chainLeaderboard = chainLeaderboards[chainId];
        bool found = false;
        
        for (uint256 i = 0; i < chainLeaderboard.length; i++) {
            if (chainLeaderboard[i].player == player) {
                chainLeaderboard[i].score = playerState.score;
                chainLeaderboard[i].level = playerState.level;
                chainLeaderboard[i].lastUpdate = block.timestamp;
                found = true;
                break;
            }
        }
        
        if (!found) {
            chainLeaderboard.push(LeaderboardEntry({
                player: player,
                score: playerState.score,
                level: playerState.level,
                chainId: chainId,
                lastUpdate: block.timestamp
            }));
        }
        
        // Sort leaderboard by score
        sortLeaderboard(chainLeaderboard);
        
        // Keep only top 100 players
        if (chainLeaderboard.length > 100) {
            for (uint256 i = 100; i < chainLeaderboard.length; i++) {
                chainLeaderboard.pop();
            }
        }
        
        // Update global leaderboard
        updateGlobalLeaderboard(chainId, player);
    }
    
    /**
     * @dev Sort leaderboard by score
     */
    function sortLeaderboard(LeaderboardEntry[] storage leaderboard) internal {
        for (uint256 i = 0; i < leaderboard.length - 1; i++) {
            for (uint256 j = 0; j < leaderboard.length - i - 1; j++) {
                if (leaderboard[j].score < leaderboard[j + 1].score) {
                    LeaderboardEntry memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }
    
    /**
     * @dev Update global leaderboard
     */
    function updateGlobalLeaderboard(uint256 chainId, address player) internal {
        address[] storage globalLeaderboard = leaderboards[chainId];
        
        // Check if player is already in leaderboard
        bool found = false;
        for (uint256 i = 0; i < globalLeaderboard.length; i++) {
            if (globalLeaderboard[i] == player) {
                found = true;
                break;
            }
        }
        
        if (!found && globalLeaderboard.length < 100) {
            globalLeaderboard.push(player);
        }
        
        // Sort global leaderboard
        sortGlobalLeaderboard(globalLeaderboard);
        
        emit LeaderboardUpdated(chainId, globalLeaderboard);
    }
    
    /**
     * @dev Sort global leaderboard
     */
    function sortGlobalLeaderboard(address[] storage leaderboard) internal {
        for (uint256 i = 0; i < leaderboard.length - 1; i++) {
            for (uint256 j = 0; j < leaderboard.length - i - 1; j++) {
                if (players[leaderboard[j]].score < players[leaderboard[j + 1]].score) {
                    address temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }
    
    /**
     * @dev Check tournament participation
     */
    function checkTournamentParticipation(address player, uint256 chainId) internal {
        // Check all active tournaments
        for (uint256 i = 1; i <= tournamentCount; i++) {
            Tournament storage tournament = tournaments[i];
            if (tournament.isActive && 
                block.timestamp >= tournament.startTime && 
                block.timestamp <= tournament.endTime) {
                
                // Check if chain is supported
                bool chainSupported = false;
                for (uint256 j = 0; j < tournament.supportedChains.length; j++) {
                    if (tournament.supportedChains[j] == chainId) {
                        chainSupported = true;
                        break;
                    }
                }
                
                if (chainSupported && !tournamentParticipation[player][i]) {
                    // Auto-enter player in tournament
                    tournament.participants.push(player);
                    tournamentParticipation[player][i] = true;
                }
            }
        }
    }
    
    /**
     * @dev Sync cross-chain state
     */
    function syncCrossChainState(address player, uint256 sourceChainId) internal {
        PlayerState storage playerState = players[player];
        
        // Update retention days
        if (playerState.lastActive > 0) {
            uint256 daysSinceLastActive = (block.timestamp - playerState.lastActive) / 1 days;
            playerState.retentionDays = daysSinceLastActive;
        }
        
        // Emit cross-chain sync event
        emit CrossChainSync(player, sourceChainId, block.chainid);
    }
    
    /**
     * @dev Start cross-chain tournament
     */
    function startCrossChainTournament(
        uint256 prizePool,
        uint256 duration,
        uint256[] memory supportedChains,
        uint256 entryFee,
        string memory tournamentType
    ) external onlyOwner {
        uint256 tournamentId = tournamentCount + 1;
        
        tournaments[tournamentId] = Tournament({
            id: tournamentId,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            prizePool: prizePool,
            participants: new address[](0),
            isActive: true,
            supportedChains: supportedChains,
            entryFee: entryFee,
            tournamentType: tournamentType
        });
        
        tournamentCount++;
        
        emit TournamentStarted(tournamentId, prizePool, supportedChains);
    }
    
    /**
     * @dev End tournament and distribute prizes
     */
    function endTournament(uint256 tournamentId) external onlyOwner {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.isActive, "Tournament not active");
        require(block.timestamp >= tournament.endTime, "Tournament not ended");
        
        // Find winner
        address winner = address(0);
        uint256 highestScore = 0;
        
        for (uint256 i = 0; i < tournament.participants.length; i++) {
            address participant = tournament.participants[i];
            if (tournament.scores[participant] > highestScore) {
                highestScore = tournament.scores[participant];
                winner = participant;
            }
        }
        
        // Distribute prize
        if (winner != address(0) && tournament.prizePool > 0) {
            rushToken.transfer(winner, tournament.prizePool);
            players[winner].tokensEarned += tournament.prizePool;
        }
        
        tournament.isActive = false;
        
        emit TournamentEnded(tournamentId, winner, tournament.prizePool);
    }
    
    // View functions
    function getPlayerState(address player) external view returns (
        uint256 score,
        uint256 level,
        uint256 experience,
        uint256 tokensEarned,
        uint256 lastActive,
        uint256 totalPlayTime,
        uint256 averageSessionLength,
        uint256 totalTransactions,
        uint256 averageScore,
        uint256 retentionDays
    ) {
        PlayerState storage playerState = players[player];
        return (
            playerState.score,
            playerState.level,
            playerState.experience,
            playerState.tokensEarned,
            playerState.lastActive,
            playerState.totalPlayTime,
            playerState.averageSessionLength,
            playerState.totalTransactions,
            playerState.averageScore,
            playerState.retentionDays
        );
    }
    
    function getChainLeaderboard(uint256 chainId) external view returns (LeaderboardEntry[] memory) {
        return chainLeaderboards[chainId];
    }
    
    function getGlobalLeaderboard(uint256 chainId) external view returns (address[] memory) {
        return leaderboards[chainId];
    }
    
    function getTournament(uint256 tournamentId) external view returns (
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint256 prizePool,
        address[] memory participants,
        bool isActive,
        uint256[] memory supportedChains,
        uint256 entryFee,
        string memory tournamentType
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        return (
            tournament.id,
            tournament.startTime,
            tournament.endTime,
            tournament.prizePool,
            tournament.participants,
            tournament.isActive,
            tournament.supportedChains,
            tournament.entryFee,
            tournament.tournamentType
        );
    }
    
    // Helper functions
    function isGameCompletedEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("GameCompleted(address,uint256,uint256,uint256)");
    }
    
    function isQuestCompletedEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("QuestCompleted(address,uint256,uint256)");
    }
    
    function isNFTMintedEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("NFTMinted(address,address,uint256)");
    }
    
    function isAchievementUnlockedEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("AchievementUnlocked(address,uint256,uint256)");
    }
    
    function getLevelThreshold(uint256 level) internal pure returns (uint256) {
        return level * 1000; // 1000 XP per level
    }
    
    function calculateScoreReward(uint256 score, uint256 chainId) internal view returns (uint256) {
        // Calculate reward based on score and chain activity
        uint256 baseReward = score / 1000; // 1 token per 1000 points
        uint256 chainMultiplier = getChainMultiplier(chainId);
        
        return baseReward * chainMultiplier;
    }
    
    function getChainMultiplier(uint256 chainId) internal view returns (uint256) {
        // Different chains have different reward multipliers
        if (chainId == 1) return 100; // Ethereum
        if (chainId == 43114) return 120; // Avalanche
        if (chainId == 137) return 110; // Polygon
        if (chainId == 56) return 105; // BSC
        return 100; // Default
    }
}
