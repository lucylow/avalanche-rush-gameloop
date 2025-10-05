```solidity
// contracts/EducationalNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EducationalNFT is ERC721URIStorage, VRFConsumerBaseV2 {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    // Chainlink VRF configuration for Avalanche
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 s_keyHash =
        0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d; // Avalanche Fuji
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    // NFT Properties
    struct Achievement {
        uint256 questId;
        uint256 score;
        uint256 timestamp;
        string metadata;
        bool isRare;
        uint256 raffleTickets;
    }

    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public playerAchievements;
    mapping(uint256 => address) public vrfRequests;

    // Rare NFT raffle system
    mapping(uint256 => address[]) public raffleParticipants;
    mapping(uint256 => uint256) public raffleRandomness;

    event RareNFTMinted(address indexed player, uint256 tokenId, uint256 raffleId);
    event RaffleEntered(address indexed player, uint256 raffleId, uint256 tickets);

    modifier onlyReactive() {
        // Replace with your actual Reactive network address
        require(msg.sender == address(0x742d35Cc5A5E2a9E1aB8d8C6E6E9F4A5B8D35a9), "Only Reactive Network can call");
        _;
    }

    modifier onlyOwner() {
        // Replace with the actual owner address
        require(msg.sender == address(0x0), "Only owner can call");
        _;
    }

    constructor(uint64 subscriptionId)
        ERC721("AvalancheRushAchievements", "ARA")
        VRFConsumerBaseV2(0x2eD832Ba664535e5886b75D64C46EB9a228C2610) // Avalanche Fuji Coordinator
    {
        COORDINATOR =
            VRFCoordinatorV2Interface(0x2eD832Ba664535e5886b75D64C46EB9a228C2610);
        s_subscriptionId = subscriptionId;
    }

    function mintAchievement(
        address player,
        uint256 questId,
        uint256 score,
        string memory metadata
    ) external onlyReactive returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(player, tokenId);

        // Determine if this is a rare NFT (5% chance)
        bool isRare = (uint256(keccak256(abi.encodePacked(block.timestamp, player))) % 20) == 0;
        uint256 raffleTickets = isRare ? 0 : score / 100; // 1 ticket per 100 points

        achievements[tokenId] = Achievement({
            questId: questId,
            score: score,
            timestamp: block.timestamp,
            metadata: metadata,
            isRare: isRare,
            raffleTickets: raffleTickets
        });
        playerAchievements[player].push(tokenId);

        // Set dynamic NFT metadata
        _setTokenURI(tokenId, _generateTokenURI(tokenId));

        if (isRare) {
            emit RareNFTMinted(player, tokenId, 0);
        } else if (raffleTickets > 0) {
            _enterRaffle(player, tokenId, raffleTickets);
        }

        return tokenId;
    }

    function _enterRaffle(address player, uint256 tokenId, uint256 tickets) internal {
        uint256 currentRaffle = getCurrentRaffleId();
        for (uint256 i = 0; i < tickets; i++) {
            raffleParticipants[currentRaffle].push(player);
        }
        emit RaffleEntered(player, currentRaffle, tickets);
    }

    function requestRaffleWinner(uint256 raffleId) external onlyOwner returns (uint256 requestId) {
        require(raffleParticipants[raffleId].length > 0, "No participants");
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        vrfRequests[requestId] = raffleId;
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 raffleId = vrfRequests[requestId];
        uint256 randomIndex = randomWords[0] % raffleParticipants[raffleId].length;
        address winner = raffleParticipants[raffleId][randomIndex];

        // Mint special raffle NFT to winner
        _mintRafflePrize(winner, raffleId);
    }

    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        Achievement memory achievement = achievements[tokenId];
        return string(abi.encodePacked(
            'data:application/json;base64,',
            Base64.encode(bytes(abi.encodePacked(
                '{"name": "', achievement.isRare ? "Rare " : "", 'Avalanche Rush Achievement",',
                '"description": "Educational achievement NFT for completing Web3 quests",',
                '"image": "', _generateSVG(achievement), '",',
                '"attributes": [',
                '{"trait_type": "Quest", "value": "', achievement.questId.toString(), '"},',
                '{"trait_type": "Score", "value": ', achievement.score.toString(), '},',
                '{"trait_type": "Rarity", "value": "', achievement.isRare ? "Rare" : "Common", '"},',
                '{"trait_type": "Tickets", "value": ', achievement.raffleTickets.toString(), '}'
                ']}'
            )))
        ));
    }

    function _generateSVG(Achievement memory achievement) internal pure returns (string memory) {
        // Placeholder for SVG generation logic
        return "<svg></svg>";
    }

    function getCurrentRaffleId() internal pure returns (uint256) {
        // Placeholder for raffle ID logic
        return 1;
    }

    function _mintRafflePrize(address winner, uint256 raffleId) internal {
        // Placeholder for minting raffle prize
    }
}
```
