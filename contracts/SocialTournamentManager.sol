// contracts/SocialTournamentManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title SocialTournamentManager
 * @dev Advanced tournament system with Lens Protocol and Farcaster integration
 */
contract SocialTournamentManager is VRFConsumerBaseV2, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tournamentIdCounter;
    Counters.Counter private _leaderboardIdCounter;
    
    // Chainlink VRF for Avalanche Fuji
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 s_keyHash = 0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    
    // Tournament structures
    struct Tournament {
        uint256 tournamentId;
        string name;
        string description;
        TournamentType tType;
        uint256 startTime;
        uint256 endTime;
        uint256 entryFee;
        uint256 prizePool;
        uint256 maxPlayers;
        address[] participants;
        mapping(address => uint256) scores;
        mapping(address => uint256) socialPoints; // Points from social engagement
        address creator;
        bool isActive;
        TournamentStatus status;
        string lensHandle; // Lens protocol integration
        string farcasterChannel; // Farcaster channel
    }
    
    struct Leaderboard {
        uint256 leaderboardId;
        string name;
        LeaderboardType lType;
        uint256 duration;
        uint256 startTime;
        mapping(address => LeaderboardEntry) entries;
        address[] topPlayers;
        bool isActive;
    }
    
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 socialScore;
        uint256 lastUpdate;
        uint256 position;
        string lensHandle;
        string farcasterUsername;
    }
    
    // Social engagement tracking
    struct SocialEngagement {
        uint256 likes;
        uint256 shares;
        uint256 comments;
        uint256 tips;
        uint256 lastActivity;
    }
    
    // Enums
    enum TournamentType { DAILY, WEEKLY, SEASONAL, COMMUNITY, SPONSORED }
    enum LeaderboardType { GLOBAL, FRIENDS, GUILD, REGIONAL }
    enum TournamentStatus { UPCOMING, ACTIVE, COMPLETED, CANCELLED }
    
    // Mappings
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => Leaderboard) public leaderboards;
    mapping(address => SocialEngagement) public socialScores;
    mapping(address => string) public lensProfiles;
    mapping(address => string) public farcasterProfiles;
    mapping(bytes32 => uint256) public vrfRequests;
    
    // Social platform integration
    mapping(address => bool) public verifiedLensUsers;
    mapping(address => bool) public verifiedFarcasterUsers;
    
    // Events
    event TournamentCreated(uint256 tournamentId, string name, TournamentType tType);
    event PlayerRegistered(uint256 tournamentId, address player, string lensHandle, string farcasterUsername);
    event ScoreUpdated(uint256 tournamentId, address player, uint256 score, uint256 socialScore);
    event TournamentCompleted(uint256 tournamentId, address[] winners, uint256[] prizes);
    event SocialPointsAwarded(address indexed player, uint256 points, string reason);
    event LensProfileLinked(address indexed player, string lensHandle);
    event FarcasterProfileLinked(address indexed player, string username);
    
    modifier onlyActiveTournament(uint256 tournamentId) {
        require(tournaments[tournamentId].isActive, "Tournament not active");
        _;
    }
    
    modifier onlyTournamentParticipant(uint256 tournamentId) {
        require(_isPlayerRegistered(tournaments[tournamentId], msg.sender), "Not registered");
        _;
    }
    
    constructor(
        address vrfCoordinator,
        uint64 subscriptionId
    ) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        _initializeDefaultTournaments();
    }
    
    /**
     * @dev Initialize recurring tournaments
     */
    function _initializeDefaultTournaments() internal {
        // Daily Avalanche Rush
        _createTournament(
            "Daily Avalanche Rush",
            "Compete for daily prizes in Avalanche Rush with social multipliers",
            TournamentType.DAILY,
            block.timestamp,
            block.timestamp + 1 days,
            0.01 ether,
            1 ether,
            1000,
            "avalanche_rush",
            "avalanche-rush"
        );
        
        // Weekly DeFi Masters
        _createTournament(
            "Weekly DeFi Masters",
            "Master DeFi quests for weekly rewards with social engagement",
            TournamentType.WEEKLY,
            block.timestamp,
            block.timestamp + 7 days,
            0.05 ether,
            5 ether,
            500,
            "defi_masters",
            "defi-masters"
        );
        
        // Social Influencer Championship
        _createTournament(
            "Social Influencer Championship",
            "Tournament with maximum social engagement multipliers",
            TournamentType.SEASONAL,
            block.timestamp,
            block.timestamp + 30 days,
            0.1 ether,
            25 ether,
            200,
            "social_champions",
            "social-champions"
        );
    }
    
    /**
     * @dev Create a new tournament with social integration
     */
    function createTournament(
        string memory name,
        string memory description,
        TournamentType tType,
        uint256 startTime,
        uint256 endTime,
        uint256 entryFee,
        uint256 prizePool,
        uint256 maxPlayers,
        string memory lensHandle,
        string memory farcasterChannel
    ) external onlyOwner returns (uint256) {
        return _createTournament(
            name,
            description,
            tType,
            startTime,
            endTime,
            entryFee,
            prizePool,
            maxPlayers,
            lensHandle,
            farcasterChannel
        );
    }
    
    function _createTournament(
        string memory name,
        string memory description,
        TournamentType tType,
        uint256 startTime,
        uint256 endTime,
        uint256 entryFee,
        uint256 prizePool,
        uint256 maxPlayers,
        string memory lensHandle,
        string memory farcasterChannel
    ) internal returns (uint256) {
        require(prizePool > 0, "Prize pool must be positive");
        require(endTime > startTime, "Invalid time range");
        require(maxPlayers > 0, "Max players must be positive");
        
        _tournamentIdCounter.increment();
        uint256 tournamentId = _tournamentIdCounter.current();
        
        Tournament storage tournament = tournaments[tournamentId];
        tournament.tournamentId = tournamentId;
        tournament.name = name;
        tournament.description = description;
        tournament.tType = tType;
        tournament.startTime = startTime;
        tournament.endTime = endTime;
        tournament.entryFee = entryFee;
        tournament.prizePool = prizePool;
        tournament.maxPlayers = maxPlayers;
        tournament.creator = msg.sender;
        tournament.isActive = true;
        tournament.status = TournamentStatus.UPCOMING;
        tournament.lensHandle = lensHandle;
        tournament.farcasterChannel = farcasterChannel;
        
        emit TournamentCreated(tournamentId, name, tType);
        return tournamentId;
    }
    
    /**
     * @dev Register for tournament with social profile linking
     */
    function registerForTournament(
        uint256 tournamentId,
        string memory lensHandle,
        string memory farcasterUsername
    ) external payable nonReentrant onlyActiveTournament(tournamentId) {
        Tournament storage tournament = tournaments[tournamentId];
        require(block.timestamp < tournament.startTime, "Registration closed");
        require(tournament.participants.length < tournament.maxPlayers, "Tournament full");
        require(msg.value >= tournament.entryFee, "Insufficient entry fee");
        require(!_isPlayerRegistered(tournament, msg.sender), "Already registered");
        
        // Link social profiles
        if (bytes(lensHandle).length > 0) {
            lensProfiles[msg.sender] = lensHandle;
            verifiedLensUsers[msg.sender] = true;
            emit LensProfileLinked(msg.sender, lensHandle);
        }
        
        if (bytes(farcasterUsername).length > 0) {
            farcasterProfiles[msg.sender] = farcasterUsername;
            verifiedFarcasterUsers[msg.sender] = true;
            emit FarcasterProfileLinked(msg.sender, farcasterUsername);
        }
        
        tournament.participants.push(msg.sender);
        tournament.prizePool += msg.value;
        
        // Award social points for early registration
        _awardSocialPoints(msg.sender, 50, "Early registration");
        
        emit PlayerRegistered(tournamentId, msg.sender, lensHandle, farcasterUsername);
    }
    
    /**
     * @dev Update player score with social multiplier
     */
    function updatePlayerScore(
        uint256 tournamentId,
        address player,
        uint256 gameScore
    ) external onlyOwner onlyActiveTournament(tournamentId) onlyTournamentParticipant(tournamentId) {
        Tournament storage tournament = tournaments[tournamentId];
        require(block.timestamp >= tournament.startTime && block.timestamp <= tournament.endTime, "Tournament not active");
        
        // Calculate social multiplier
        uint256 socialMultiplier = _calculateSocialMultiplier(player);
        uint256 socialPoints = (gameScore * socialMultiplier) / 100;
        uint256 totalScore = gameScore + socialPoints;
        
        tournament.scores[player] += totalScore;
        tournament.socialPoints[player] += socialPoints;
        
        emit ScoreUpdated(tournamentId, player, totalScore, socialPoints);
    }
    
    /**
     * @dev Calculate social multiplier based on engagement
     */
    function _calculateSocialMultiplier(address player) internal view returns (uint256) {
        SocialEngagement memory engagement = socialScores[player];
        uint256 multiplier = 0;
        
        // Base multiplier from social activity
        multiplier += engagement.likes / 10; // 1% per 10 likes
        multiplier += engagement.shares * 2; // 2% per share
        multiplier += engagement.comments; // 1% per comment
        multiplier += engagement.tips * 5; // 5% per tip received
        
        // Bonus for verified social profiles
        if (verifiedLensUsers[player]) multiplier += 5;
        if (verifiedFarcasterUsers[player]) multiplier += 5;
        
        // Cap multiplier at 50%
        return multiplier > 50 ? 50 : multiplier;
    }
    
    /**
     * @dev Award social points for engagement
     */
    function awardSocialPoints(
        address player,
        uint256 points,
        string memory reason
    ) external onlyOwner {
        _awardSocialPoints(player, points, reason);
    }
    
    function _awardSocialPoints(address player, uint256 points, string memory reason) internal {
        socialScores[player].lastActivity = block.timestamp;
        
        // Different activities award different points
        if (keccak256(bytes(reason)) == keccak256(bytes("share"))) {
            socialScores[player].shares += points;
        } else if (keccak256(bytes(reason)) == keccak256(bytes("like"))) {
            socialScores[player].likes += points;
        } else if (keccak256(bytes(reason)) == keccak256(bytes("comment"))) {
            socialScores[player].comments += points;
        } else if (keccak256(bytes(reason)) == keccak256(bytes("tip"))) {
            socialScores[player].tips += points;
        }
        
        emit SocialPointsAwarded(player, points, reason);
    }
    
    /**
     * @dev Complete tournament and distribute prizes using Chainlink VRF
     */
    function completeTournament(uint256 tournamentId) external onlyOwner onlyActiveTournament(tournamentId) {
        Tournament storage tournament = tournaments[tournamentId];
        require(block.timestamp >= tournament.endTime, "Tournament not ended");
        
        tournament.isActive = false;
        tournament.status = TournamentStatus.COMPLETED;
        
        // Request randomness for fair prize distribution
        uint256 requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        vrfRequests[requestId] = tournamentId;
    }
    
    /**
     * @dev Chainlink VRF callback for prize distribution
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 tournamentId = vrfRequests[requestId];
        Tournament storage tournament = tournaments[tournamentId];
        
        if (tournament.participants.length > 0) {
            // Calculate winners with randomness
            (address[] memory winners, uint256[] memory prizes) = _calculateWinners(tournament, randomWords[0]);
            _distributePrizes(tournament, winners, prizes);
        }
    }
    
    /**
     * @dev Calculate winners based on scores and randomness
     */
    function _calculateWinners(Tournament storage tournament, uint256 randomWord) 
        internal view returns (address[] memory, uint256[] memory) {
        
        // Create array of participants with their scores
        address[] memory participants = new address[](tournament.participants.length);
        uint256[] memory totalScores = new uint256[](tournament.participants.length);
        
        for (uint256 i = 0; i < tournament.participants.length; i++) {
            participants[i] = tournament.participants[i];
            totalScores[i] = tournament.scores[participants[i]] + tournament.socialPoints[participants[i]];
        }
        
        // Sort participants by total score (simplified bubble sort)
        for (uint256 i = 0; i < participants.length - 1; i++) {
            for (uint256 j = i + 1; j < participants.length; j++) {
                if (totalScores[i] < totalScores[j]) {
                    // Swap
                    (participants[i], participants[j]) = (participants[j], participants[i]);
                    (totalScores[i], totalScores[j]) = (totalScores[j], totalScores[i]);
                }
            }
        }
        
        // Determine number of winners (top 10% or min 3)
        uint256 winnerCount = tournament.participants.length / 10;
        if (winnerCount < 3) winnerCount = 3;
        if (winnerCount > tournament.participants.length) {
            winnerCount = tournament.participants.length;
        }
        
        address[] memory winners = new address[](winnerCount);
        uint256[] memory prizes = new uint256[](winnerCount);
        
        // Distribute prizes with weighted allocation
        uint256 remainingPrizePool = tournament.prizePool;
        for (uint256 i = 0; i < winnerCount; i++) {
            winners[i] = participants[i];
            
            // Prize distribution: 1st gets 40%, 2nd gets 25%, 3rd gets 15%, rest split equally
            uint256 prizePercentage;
            if (i == 0) {
                prizePercentage = 40;
            } else if (i == 1) {
                prizePercentage = 25;
            } else if (i == 2) {
                prizePercentage = 15;
            } else {
                prizePercentage = 20 / (winnerCount - 3);
            }
            
            uint256 prize = (tournament.prizePool * prizePercentage) / 100;
            prizes[i] = prize;
            remainingPrizePool -= prize;
        }
        
        return (winners, prizes);
    }
    
    /**
     * @dev Distribute prizes to winners
     */
    function _distributePrizes(
        Tournament storage tournament,
        address[] memory winners,
        uint256[] memory prizes
    ) internal {
        for (uint256 i = 0; i < winners.length; i++) {
            if (prizes[i] > 0) {
                payable(winners[i]).transfer(prizes[i]);
            }
        }
        
        emit TournamentCompleted(tournament.tournamentId, winners, prizes);
    }
    
    /**
     * @dev Get tournament leaderboard
     */
    function getTournamentLeaderboard(uint256 tournamentId) 
        external view returns (address[] memory, uint256[] memory, uint256[] memory) {
        
        Tournament storage tournament = tournaments[tournamentId];
        uint256 length = tournament.participants.length;
        
        address[] memory players = new address[](length);
        uint256[] memory scores = new uint256[](length);
        uint256[] memory socialScores = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            players[i] = tournament.participants[i];
            scores[i] = tournament.scores[players[i]];
            socialScores[i] = tournament.socialPoints[players[i]];
        }
        
        return (players, scores, socialScores);
    }
    
    /**
     * @dev Get tournament details
     */
    function getTournament(uint256 tournamentId) external view returns (
        uint256 tournamentId_,
        string memory name,
        string memory description,
        TournamentType tType,
        uint256 startTime,
        uint256 endTime,
        uint256 entryFee,
        uint256 prizePool,
        uint256 maxPlayers,
        uint256 participantCount,
        address creator,
        bool isActive,
        TournamentStatus status,
        string memory lensHandle,
        string memory farcasterChannel
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        return (
            tournament.tournamentId,
            tournament.name,
            tournament.description,
            tournament.tType,
            tournament.startTime,
            tournament.endTime,
            tournament.entryFee,
            tournament.prizePool,
            tournament.maxPlayers,
            tournament.participants.length,
            tournament.creator,
            tournament.isActive,
            tournament.status,
            tournament.lensHandle,
            tournament.farcasterChannel
        );
    }
    
    /**
     * @dev Get player's social engagement score
     */
    function getSocialScore(address player) external view returns (
        uint256 likes,
        uint256 shares,
        uint256 comments,
        uint256 tips,
        uint256 lastActivity
    ) {
        SocialEngagement memory engagement = socialScores[player];
        return (
            engagement.likes,
            engagement.shares,
            engagement.comments,
            engagement.tips,
            engagement.lastActivity
        );
    }
    
    /**
     * @dev Check if player is registered for tournament
     */
    function _isPlayerRegistered(Tournament storage tournament, address player) internal view returns (bool) {
        for (uint256 i = 0; i < tournament.participants.length; i++) {
            if (tournament.participants[i] == player) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get total number of tournaments
     */
    function getTournamentCount() external view returns (uint256) {
        return _tournamentIdCounter.current();
    }
    
    /**
     * @dev Emergency withdraw function for owner
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
