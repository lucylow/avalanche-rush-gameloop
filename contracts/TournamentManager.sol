// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RushToken.sol";

/**
 * @title TournamentManager
 * @dev Manages tournaments and prize distributions
 * @notice Handles tournament creation, participation, and prize distribution
 */
contract TournamentManager is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Tournament structure
    struct Tournament {
        uint256 id;
        string name;
        string description;
        uint256 entryFee;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        uint256 maxParticipants;
        bool isActive;
        bool isCompleted;
        address[] participants;
        mapping(address => uint256) participantScores;
        address[] winners;
        uint256[] winnerPrizes;
    }
    
    // Tournament types
    enum TournamentType {
        DAILY,
        WEEKLY,
        MONTHLY,
        SPECIAL
    }
    
    // State variables
    Counters.Counter private _tournamentIdCounter;
    mapping(uint256 => Tournament) public tournaments;
    mapping(address => mapping(uint256 => bool)) public userParticipations;
    mapping(TournamentType => uint256) public typeEntryFees;
    mapping(TournamentType => uint256) public typePrizeMultipliers;
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFeePercent = 1000; // 10%
    uint256 public totalPlatformFees;
    
    // Events
    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        TournamentType tournamentType,
        uint256 entryFee,
        uint256 startTime,
        uint256 endTime
    );
    event TournamentJoined(uint256 indexed tournamentId, address indexed participant);
    event TournamentCompleted(uint256 indexed tournamentId, address[] winners, uint256[] prizes);
    event PrizeDistributed(uint256 indexed tournamentId, address indexed winner, uint256 amount);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    // RushToken contract
    RushToken public rushToken;
    
    constructor(address _rushToken) {
        rushToken = RushToken(_rushToken);
        
        // Set default entry fees
        typeEntryFees[TournamentType.DAILY] = 10 * 10**18;    // 10 RUSH
        typeEntryFees[TournamentType.WEEKLY] = 100 * 10**18;   // 100 RUSH
        typeEntryFees[TournamentType.MONTHLY] = 1000 * 10**18; // 1000 RUSH
        typeEntryFees[TournamentType.SPECIAL] = 500 * 10**18;   // 500 RUSH
        
        // Set prize multipliers
        typePrizeMultipliers[TournamentType.DAILY] = 5;    // 5x entry fee
        typePrizeMultipliers[TournamentType.WEEKLY] = 10;  // 10x entry fee
        typePrizeMultipliers[TournamentType.MONTHLY] = 20; // 20x entry fee
        typePrizeMultipliers[TournamentType.SPECIAL] = 15; // 15x entry fee
    }
    
    /**
     * @dev Create a new tournament
     * @param name Tournament name
     * @param description Tournament description
     * @param tournamentType Type of tournament
     * @param duration Duration in seconds
     * @param maxParticipants Maximum number of participants
     * @return tournamentId The created tournament ID
     */
    function createTournament(
        string memory name,
        string memory description,
        TournamentType tournamentType,
        uint256 duration,
        uint256 maxParticipants
    ) external onlyOwner returns (uint256) {
        uint256 tournamentId = _tournamentIdCounter.current();
        _tournamentIdCounter.increment();
        
        uint256 entryFee = typeEntryFees[tournamentType];
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;
        
        Tournament storage tournament = tournaments[tournamentId];
        tournament.id = tournamentId;
        tournament.name = name;
        tournament.description = description;
        tournament.entryFee = entryFee;
        tournament.prizePool = 0;
        tournament.startTime = startTime;
        tournament.endTime = endTime;
        tournament.maxParticipants = maxParticipants;
        tournament.isActive = true;
        tournament.isCompleted = false;
        
        emit TournamentCreated(tournamentId, name, tournamentType, entryFee, startTime, endTime);
        
        return tournamentId;
    }
    
    /**
     * @dev Join a tournament
     * @param tournamentId Tournament ID to join
     */
    function joinTournament(uint256 tournamentId) external nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.isActive, "TournamentManager: Tournament not active");
        require(block.timestamp >= tournament.startTime, "TournamentManager: Tournament not started");
        require(block.timestamp < tournament.endTime, "TournamentManager: Tournament ended");
        require(!userParticipations[msg.sender][tournamentId], "TournamentManager: Already joined");
        require(tournament.participants.length < tournament.maxParticipants, "TournamentManager: Tournament full");
        
        // Transfer entry fee
        rushToken.transferFrom(msg.sender, address(this), tournament.entryFee);
        
        // Add to prize pool
        tournament.prizePool += tournament.entryFee;
        tournament.participants.push(msg.sender);
        userParticipations[msg.sender][tournamentId] = true;
        
        emit TournamentJoined(tournamentId, msg.sender);
    }
    
    /**
     * @dev Submit score for a tournament
     * @param tournamentId Tournament ID
     * @param score Score achieved
     */
    function submitScore(uint256 tournamentId, uint256 score) external {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(userParticipations[msg.sender][tournamentId], "TournamentManager: Not a participant");
        require(block.timestamp >= tournament.startTime, "TournamentManager: Tournament not started");
        require(block.timestamp < tournament.endTime, "TournamentManager: Tournament ended");
        
        tournament.participantScores[msg.sender] = score;
    }
    
    /**
     * @dev Complete tournament and distribute prizes
     * @param tournamentId Tournament ID
     * @param winners Array of winner addresses
     * @param winnerPrizes Array of prize amounts
     */
    function completeTournament(
        uint256 tournamentId,
        address[] memory winners,
        uint256[] memory winnerPrizes
    ) external onlyOwner nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.isActive, "TournamentManager: Tournament not active");
        require(block.timestamp >= tournament.endTime, "TournamentManager: Tournament not ended");
        require(!tournament.isCompleted, "TournamentManager: Tournament already completed");
        require(winners.length == winnerPrizes.length, "TournamentManager: Array length mismatch");
        
        tournament.isActive = false;
        tournament.isCompleted = true;
        tournament.winners = winners;
        tournament.winnerPrizes = winnerPrizes;
        
        // Calculate platform fee
        uint256 totalPrizes = 0;
        for (uint256 i = 0; i < winnerPrizes.length; i++) {
            totalPrizes += winnerPrizes[i];
        }
        
        uint256 platformFee = (totalPrizes * platformFeePercent) / 10000;
        totalPlatformFees += platformFee;
        
        // Distribute prizes
        for (uint256 i = 0; i < winners.length; i++) {
            if (winnerPrizes[i] > 0) {
                rushToken.transfer(winners[i], winnerPrizes[i]);
                emit PrizeDistributed(tournamentId, winners[i], winnerPrizes[i]);
            }
        }
        
        // Transfer platform fee to owner
        if (platformFee > 0) {
            rushToken.transfer(owner(), platformFee);
        }
        
        emit TournamentCompleted(tournamentId, winners, winnerPrizes);
    }
    
    /**
     * @dev Get tournament participants
     * @param tournamentId Tournament ID
     * @return participants Array of participant addresses
     */
    function getTournamentParticipants(uint256 tournamentId) external view returns (address[] memory participants) {
        return tournaments[tournamentId].participants;
    }
    
    /**
     * @dev Get tournament winners
     * @param tournamentId Tournament ID
     * @return winners Array of winner addresses
     */
    function getTournamentWinners(uint256 tournamentId) external view returns (address[] memory winners) {
        return tournaments[tournamentId].winners;
    }
    
    /**
     * @dev Get tournament winner prizes
     * @param tournamentId Tournament ID
     * @return prizes Array of prize amounts
     */
    function getTournamentWinnerPrizes(uint256 tournamentId) external view returns (uint256[] memory prizes) {
        return tournaments[tournamentId].winnerPrizes;
    }
    
    /**
     * @dev Get participant score
     * @param tournamentId Tournament ID
     * @param participant Participant address
     * @return score Participant's score
     */
    function getParticipantScore(uint256 tournamentId, address participant) external view returns (uint256 score) {
        return tournaments[tournamentId].participantScores[participant];
    }
    
    /**
     * @dev Get tournament leaderboard
     * @param tournamentId Tournament ID
     * @return participants Array of participant addresses sorted by score
     * @return scores Array of scores sorted by score
     */
    function getTournamentLeaderboard(uint256 tournamentId) external view returns (
        address[] memory participants,
        uint256[] memory scores
    ) {
        Tournament storage tournament = tournaments[tournamentId];
        uint256 participantCount = tournament.participants.length;
        
        participants = new address[](participantCount);
        scores = new uint256[](participantCount);
        
        // Copy participants and scores
        for (uint256 i = 0; i < participantCount; i++) {
            participants[i] = tournament.participants[i];
            scores[i] = tournament.participantScores[tournament.participants[i]];
        }
        
        // Sort by score (bubble sort for simplicity)
        for (uint256 i = 0; i < participantCount - 1; i++) {
            for (uint256 j = 0; j < participantCount - i - 1; j++) {
                if (scores[j] < scores[j + 1]) {
                    // Swap scores
                    uint256 tempScore = scores[j];
                    scores[j] = scores[j + 1];
                    scores[j + 1] = tempScore;
                    
                    // Swap participants
                    address tempParticipant = participants[j];
                    participants[j] = participants[j + 1];
                    participants[j + 1] = tempParticipant;
                }
            }
        }
        
        return (participants, scores);
    }
    
    /**
     * @dev Set platform fee percentage
     * @param newFeePercent New fee percentage in basis points
     */
    function setPlatformFeePercent(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 2000, "TournamentManager: Fee too high"); // Max 20%
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @dev Set entry fee for tournament type
     * @param tournamentType Tournament type
     * @param entryFee New entry fee
     */
    function setEntryFee(TournamentType tournamentType, uint256 entryFee) external onlyOwner {
        typeEntryFees[tournamentType] = entryFee;
    }
    
    /**
     * @dev Set prize multiplier for tournament type
     * @param tournamentType Tournament type
     * @param multiplier New prize multiplier
     */
    function setPrizeMultiplier(TournamentType tournamentType, uint256 multiplier) external onlyOwner {
        typePrizeMultipliers[tournamentType] = multiplier;
    }
    
    /**
     * @dev Get tournament statistics
     * @return totalTournaments Total number of tournaments
     * @return activeTournaments Number of active tournaments
     * @return totalPlatformFees_ Total platform fees collected
     */
    function getTournamentStats() external view returns (
        uint256 totalTournaments,
        uint256 activeTournaments,
        uint256 totalPlatformFees_
    ) {
        totalTournaments = _tournamentIdCounter.current();
        totalPlatformFees_ = totalPlatformFees;
        
        // Count active tournaments
        for (uint256 i = 0; i < totalTournaments; i++) {
            if (tournaments[i].isActive) {
                activeTournaments++;
            }
        }
    }
}
