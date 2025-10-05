// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GameLoopScoreManager
 * @notice GameLoop-compatible score submission and tournament management
 * @dev Replaces Reactive Network with standard Avalanche C-Chain events
 */
contract GameLoopScoreManager is Ownable, ReentrancyGuard {
    IERC20 public rushToken;

    struct PlayerScore {
        address player;
        uint256 score;
        uint256 timestamp;
        uint256 tournamentId;
        bool verified;
    }

    struct Tournament {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        uint256 entryFee;
        bool active;
        uint256 maxPlayers;
        uint256 playerCount;
    }

    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 rank;
        uint256 reward;
    }

    // Events for off-chain indexing (replaces Reactive triggers)
    event ScoreSubmitted(
        address indexed player,
        uint256 indexed tournamentId,
        uint256 score,
        uint256 timestamp
    );

    event TournamentCreated(
        uint256 indexed tournamentId,
        string name,
        uint256 startTime,
        uint256 endTime,
        uint256 prizePool
    );

    event TournamentEnded(
        uint256 indexed tournamentId,
        address[] winners,
        uint256[] rewards
    );

    event RewardClaimed(
        address indexed player,
        uint256 indexed tournamentId,
        uint256 amount
    );

    event PlayerRegistered(
        address indexed player,
        uint256 indexed tournamentId
    );

    // Storage
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => mapping(address => PlayerScore)) public playerScores;
    mapping(uint256 => address[]) public tournamentPlayers;
    mapping(uint256 => mapping(address => uint256)) public playerRewards;
    mapping(uint256 => mapping(address => bool)) public hasRegistered;
    mapping(address => uint256) public playerTotalScore;
    mapping(address => uint256) public playerTotalRewards;

    uint256 public tournamentCounter;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;

    constructor(address _rushToken) Ownable(msg.sender) {
        rushToken = IERC20(_rushToken);
    }

    /**
     * @notice Create a new tournament
     */
    function createTournament(
        string memory _name,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _prizePool,
        uint256 _entryFee,
        uint256 _maxPlayers
    ) external onlyOwner returns (uint256) {
        require(_endTime > _startTime, "Invalid time range");
        require(_endTime > block.timestamp, "End time must be future");

        uint256 tournamentId = ++tournamentCounter;

        tournaments[tournamentId] = Tournament({
            id: tournamentId,
            name: _name,
            startTime: _startTime,
            endTime: _endTime,
            prizePool: _prizePool,
            entryFee: _entryFee,
            active: true,
            maxPlayers: _maxPlayers,
            playerCount: 0
        });

        emit TournamentCreated(
            tournamentId,
            _name,
            _startTime,
            _endTime,
            _prizePool
        );

        return tournamentId;
    }

    /**
     * @notice Register for a tournament
     */
    function registerForTournament(uint256 _tournamentId) external nonReentrant {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.active, "Tournament not active");
        require(block.timestamp < tournament.endTime, "Tournament ended");
        require(!hasRegistered[_tournamentId][msg.sender], "Already registered");
        require(tournament.playerCount < tournament.maxPlayers, "Tournament full");

        if (tournament.entryFee > 0) {
            require(
                rushToken.transferFrom(msg.sender, address(this), tournament.entryFee),
                "Entry fee transfer failed"
            );
        }

        hasRegistered[_tournamentId][msg.sender] = true;
        tournamentPlayers[_tournamentId].push(msg.sender);
        tournament.playerCount++;

        emit PlayerRegistered(msg.sender, _tournamentId);
    }

    /**
     * @notice Submit score for a tournament
     * @dev This replaces Reactive automatic triggers with explicit submission
     */
    function submitScore(
        uint256 _tournamentId,
        uint256 _score
    ) external nonReentrant {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.active, "Tournament not active");
        require(hasRegistered[_tournamentId][msg.sender], "Not registered");
        require(
            block.timestamp >= tournament.startTime &&
            block.timestamp <= tournament.endTime,
            "Tournament not in progress"
        );

        PlayerScore storage playerScore = playerScores[_tournamentId][msg.sender];

        // Only update if new score is higher
        if (_score > playerScore.score) {
            playerScore.player = msg.sender;
            playerScore.score = _score;
            playerScore.timestamp = block.timestamp;
            playerScore.tournamentId = _tournamentId;

            playerTotalScore[msg.sender] += _score;

            emit ScoreSubmitted(msg.sender, _tournamentId, _score, block.timestamp);
        }
    }

    /**
     * @notice End tournament and calculate winners
     * @dev This can be called by owner or automated via Chainlink Keeper
     */
    function endTournament(uint256 _tournamentId) external onlyOwner {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.active, "Tournament not active");
        require(block.timestamp > tournament.endTime, "Tournament not ended");

        tournament.active = false;

        // Get sorted leaderboard
        address[] memory players = tournamentPlayers[_tournamentId];
        LeaderboardEntry[] memory leaderboard = getLeaderboard(_tournamentId);

        // Calculate rewards (top 10 get prizes)
        uint256 prizeCount = leaderboard.length > 10 ? 10 : leaderboard.length;
        address[] memory winners = new address[](prizeCount);
        uint256[] memory rewards = new uint256[](prizeCount);

        uint256 totalPrize = tournament.prizePool;
        uint256[] memory distribution = new uint256[](10);
        distribution[0] = 40; // 1st: 40%
        distribution[1] = 20; // 2nd: 20%
        distribution[2] = 15; // 3rd: 15%
        distribution[3] = 10; // 4th: 10%
        distribution[4] = 5;  // 5th: 5%
        distribution[5] = 3;  // 6th: 3%
        distribution[6] = 3;  // 7th: 3%
        distribution[7] = 2;  // 8th: 2%
        distribution[8] = 1;  // 9th: 1%
        distribution[9] = 1;  // 10th: 1%

        for (uint256 i = 0; i < prizeCount; i++) {
            winners[i] = leaderboard[i].player;
            rewards[i] = (totalPrize * distribution[i]) / 100;
            playerRewards[_tournamentId][winners[i]] = rewards[i];
            playerTotalRewards[winners[i]] += rewards[i];
        }

        emit TournamentEnded(_tournamentId, winners, rewards);
    }

    /**
     * @notice Claim tournament rewards
     */
    function claimReward(uint256 _tournamentId) external nonReentrant {
        uint256 reward = playerRewards[_tournamentId][msg.sender];
        require(reward > 0, "No reward to claim");
        require(!tournaments[_tournamentId].active, "Tournament still active");

        playerRewards[_tournamentId][msg.sender] = 0;

        require(
            rushToken.transfer(msg.sender, reward),
            "Reward transfer failed"
        );

        emit RewardClaimed(msg.sender, _tournamentId, reward);
    }

    /**
     * @notice Get tournament leaderboard
     */
    function getLeaderboard(uint256 _tournamentId)
        public
        view
        returns (LeaderboardEntry[] memory)
    {
        address[] memory players = tournamentPlayers[_tournamentId];
        uint256 playerCount = players.length;

        // Create array of entries
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](playerCount);

        for (uint256 i = 0; i < playerCount; i++) {
            address player = players[i];
            PlayerScore memory score = playerScores[_tournamentId][player];
            entries[i] = LeaderboardEntry({
                player: player,
                score: score.score,
                rank: 0,
                reward: playerRewards[_tournamentId][player]
            });
        }

        // Sort by score (descending)
        for (uint256 i = 0; i < playerCount; i++) {
            for (uint256 j = i + 1; j < playerCount; j++) {
                if (entries[j].score > entries[i].score) {
                    LeaderboardEntry memory temp = entries[i];
                    entries[i] = entries[j];
                    entries[j] = temp;
                }
            }
        }

        // Assign ranks
        for (uint256 i = 0; i < playerCount; i++) {
            entries[i].rank = i + 1;
        }

        // Return top 100
        uint256 returnCount = playerCount > MAX_LEADERBOARD_SIZE
            ? MAX_LEADERBOARD_SIZE
            : playerCount;

        LeaderboardEntry[] memory topEntries = new LeaderboardEntry[](returnCount);
        for (uint256 i = 0; i < returnCount; i++) {
            topEntries[i] = entries[i];
        }

        return topEntries;
    }

    /**
     * @notice Get player's score for a tournament
     */
    function getPlayerScore(uint256 _tournamentId, address _player)
        external
        view
        returns (uint256)
    {
        return playerScores[_tournamentId][_player].score;
    }

    /**
     * @notice Get active tournaments
     */
    function getActiveTournaments()
        external
        view
        returns (Tournament[] memory)
    {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= tournamentCounter; i++) {
            if (tournaments[i].active) {
                activeCount++;
            }
        }

        Tournament[] memory activeTournaments = new Tournament[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= tournamentCounter; i++) {
            if (tournaments[i].active) {
                activeTournaments[index] = tournaments[i];
                index++;
            }
        }

        return activeTournaments;
    }

    /**
     * @notice Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = rushToken.balanceOf(address(this));
        require(rushToken.transfer(owner(), balance), "Withdraw failed");
    }
}
