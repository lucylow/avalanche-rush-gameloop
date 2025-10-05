// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StoryDrivenCharacterNFT
 * @notice Enhanced character NFT with narrative progression and dynamic gameplay
 * @dev Optimized for Avalanche C-Chain with story-based evolution
 */
contract StoryDrivenCharacterNFT is ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant GAME_SERVER = keccak256("GAME_SERVER");
    bytes32 public constant STORY_WRITER = keccak256("STORY_WRITER");

    uint256 public nextCharacterId;

    enum CharacterClass {
        RushRunner,         // Speed-focused cyberpunk racer
        GuardianTowers,     // Defense-oriented protector
        PixelSharpshooter,  // Precision-based marksman
        TinkerTech          // Tech specialist with utilities
    }

    enum StoryArc {
        TheAwakening,       // Tutorial arc
        NeonGenesis,        // Early game
        DigitalFrontier,    // Mid game
        QuantumRealm,       // Late game
        AscendedLegend      // Endgame
    }

    struct CharacterStats {
        CharacterClass class;
        uint256 level;
        uint256 experiencePoints;
        uint256 totalGamesPlayed;
        uint256 highScore;
        uint256 lastPlayedTimestamp;

        // Class-specific stats
        uint256 speedBonus;       // Rush Runner
        uint256 shieldStrength;   // Guardian Towers
        uint256 accuracyBonus;    // Pixel Sharpshooter
        uint256 techPower;        // Tinker Tech

        // Story progression
        StoryArc currentArc;
        uint256 storyProgress;    // Chapter within arc (0-9)
        bool[] chaptersUnlocked;  // Track unlocked chapters

        // Personalization
        string characterName;
        string customTitle;
    }

    struct StoryChapter {
        uint256 scoreRequirement;
        uint256 levelRequirement;
        string chapterTitle;
        string chapterDescription;
        string chapterURI;          // IPFS link to full story
        uint256 xpReward;
        bool isEpic;                // Major story milestone
    }

    struct LoreFragment {
        string title;
        string content;
        uint256 discoveredAt;
        StoryArc relatedArc;
    }

    // Character data
    mapping(uint256 => CharacterStats) public characters;
    mapping(uint256 => LoreFragment[]) public characterLore;
    mapping(uint256 => mapping(uint256 => bool)) public achievementsEarned;

    // Story content
    mapping(CharacterClass => mapping(StoryArc => StoryChapter[])) public storyContent;
    mapping(CharacterClass => string) public classLore;
    mapping(StoryArc => string) public arcDescriptions;

    // Class modifiers for scoring
    mapping(CharacterClass => uint256) public scoringModifiers; // Basis points (10000 = 100%)

    // Events
    event CharacterMinted(
        address indexed owner,
        uint256 indexed tokenId,
        CharacterClass class,
        string characterName
    );

    event CharacterLeveledUp(
        uint256 indexed tokenId,
        uint256 newLevel,
        string newTitle
    );

    event StoryProgressionUnlocked(
        uint256 indexed tokenId,
        StoryArc arc,
        uint256 chapter,
        string chapterTitle
    );

    event LoreFragmentDiscovered(
        uint256 indexed tokenId,
        string fragmentTitle,
        StoryArc arc
    );

    event GameCompleted(
        uint256 indexed tokenId,
        uint256 score,
        uint256 xpGained,
        bool newHighScore
    );

    constructor() ERC721("AvalancheRushCharacter", "ARCHR") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_SERVER, msg.sender);
        _grantRole(STORY_WRITER, msg.sender);

        _initializeClassModifiers();
        _initializeClassLore();
        _initializeStoryContent();
    }

    /**
     * @notice Initialize scoring modifiers for each class
     */
    function _initializeClassModifiers() internal {
        scoringModifiers[CharacterClass.RushRunner] = 11000;      // +10% speed bonus
        scoringModifiers[CharacterClass.GuardianTowers] = 9000;   // -10% but higher defense
        scoringModifiers[CharacterClass.PixelSharpshooter] = 12000; // +20% precision
        scoringModifiers[CharacterClass.TinkerTech] = 10000;      // Balanced
    }

    /**
     * @notice Set class background lore
     */
    function _initializeClassLore() internal {
        classLore[CharacterClass.RushRunner] = "Born in the neon-lit streets of Neo-Avalanche, Rush Runners are cybernetic speedsters who merge with the digital flow of the blockchain itself.";

        classLore[CharacterClass.GuardianTowers] = "Ancient protectors awakened to defend the sacred protocols. Their shields are forged from crystallized consensus algorithms.";

        classLore[CharacterClass.PixelSharpshooter] = "Elite marksmen from the Precision Collective, trained to exploit vulnerabilities in the enemy's code with pixel-perfect accuracy.";

        classLore[CharacterClass.TinkerTech] = "Brilliant engineers who bend reality itself through technological innovation. Their inventions blur the line between hardware and smart contracts.";
    }

    /**
     * @notice Initialize story chapters for each class/arc combination
     */
    function _initializeStoryContent() internal {
        // Example: Rush Runner - The Awakening arc
        storyContent[CharacterClass.RushRunner][StoryArc.TheAwakening].push(StoryChapter({
            scoreRequirement: 0,
            levelRequirement: 1,
            chapterTitle: "First Steps in the Digital Void",
            chapterDescription: "You awaken in a world of pure data...",
            chapterURI: "ipfs://QmStory/RushRunner/Awakening/Ch1",
            xpReward: 100,
            isEpic: false
        }));

        storyContent[CharacterClass.RushRunner][StoryArc.TheAwakening].push(StoryChapter({
            scoreRequirement: 5000,
            levelRequirement: 2,
            chapterTitle: "The Neon Calling",
            chapterDescription: "The blockchain calls to those who can hear it...",
            chapterURI: "ipfs://QmStory/RushRunner/Awakening/Ch2",
            xpReward: 250,
            isEpic: false
        }));

        storyContent[CharacterClass.RushRunner][StoryArc.TheAwakening].push(StoryChapter({
            scoreRequirement: 10000,
            levelRequirement: 3,
            chapterTitle: "Baptism by Fire",
            chapterDescription: "Face your first true challenge...",
            chapterURI: "ipfs://QmStory/RushRunner/Awakening/Ch3",
            xpReward: 500,
            isEpic: true
        }));
    }

    /**
     * @notice Mint a new character NFT
     */
    function mintCharacter(
        address to,
        CharacterClass class,
        string memory characterName,
        string memory initialURI
    ) external onlyRole(GAME_SERVER) returns (uint256) {
        uint256 tokenId = nextCharacterId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, initialURI);

        // Initialize character with base stats
        (uint256 speed, uint256 shield, uint256 accuracy, uint256 tech) = _getBaseStats(class);

        bool[] memory unlockedChapters = new bool[](50); // Max chapters across all arcs
        unlockedChapters[0] = true; // First chapter always unlocked

        characters[tokenId] = CharacterStats({
            class: class,
            level: 1,
            experiencePoints: 0,
            totalGamesPlayed: 0,
            highScore: 0,
            lastPlayedTimestamp: block.timestamp,
            speedBonus: speed,
            shieldStrength: shield,
            accuracyBonus: accuracy,
            techPower: tech,
            currentArc: StoryArc.TheAwakening,
            storyProgress: 0,
            chaptersUnlocked: unlockedChapters,
            characterName: characterName,
            customTitle: "Novice"
        });

        emit CharacterMinted(to, tokenId, class, characterName);
        return tokenId;
    }

    /**
     * @notice Get base stats for character class
     */
    function _getBaseStats(CharacterClass class) internal pure returns (
        uint256 speed,
        uint256 shield,
        uint256 accuracy,
        uint256 tech
    ) {
        if (class == CharacterClass.RushRunner) {
            return (20, 5, 10, 8);
        } else if (class == CharacterClass.GuardianTowers) {
            return (5, 25, 8, 5);
        } else if (class == CharacterClass.PixelSharpshooter) {
            return (12, 8, 25, 10);
        } else { // TinkerTech
            return (15, 12, 15, 20);
        }
    }

    /**
     * @notice Record game completion and award XP
     */
    function recordGameCompletion(
        uint256 tokenId,
        uint256 score,
        uint256 baseXP
    ) external onlyRole(GAME_SERVER) nonReentrant {
        require(_exists(tokenId), "Character does not exist");

        CharacterStats storage char = characters[tokenId];

        // Apply class modifier to score
        uint256 modifiedScore = (score * scoringModifiers[char.class]) / 10000;

        // Check for new high score
        bool isNewHighScore = modifiedScore > char.highScore;
        if (isNewHighScore) {
            char.highScore = modifiedScore;
        }

        // Calculate XP with bonuses
        uint256 xpGained = _calculateXPGain(baseXP, modifiedScore, isNewHighScore);
        char.experiencePoints += xpGained;
        char.totalGamesPlayed++;
        char.lastPlayedTimestamp = block.timestamp;

        // Check for level up
        uint256 newLevel = _calculateLevel(char.experiencePoints);
        if (newLevel > char.level) {
            _levelUpCharacter(tokenId, newLevel);
        }

        // Check for story progression
        _checkStoryProgression(tokenId, modifiedScore);

        // Random lore fragment discovery (5% chance if score > 10k)
        if (modifiedScore > 10000 && _random(tokenId) % 100 < 5) {
            _discoverLoreFragment(tokenId);
        }

        emit GameCompleted(tokenId, modifiedScore, xpGained, isNewHighScore);
    }

    /**
     * @notice Calculate XP gain with various bonuses
     */
    function _calculateXPGain(
        uint256 baseXP,
        uint256 score,
        bool isHighScore
    ) internal pure returns (uint256) {
        uint256 xp = baseXP;

        // Score milestone bonuses
        if (score >= 50000) xp += 500;
        else if (score >= 25000) xp += 250;
        else if (score >= 10000) xp += 100;

        // High score bonus
        if (isHighScore) xp += baseXP / 2;

        return xp;
    }

    /**
     * @notice Calculate character level from XP
     */
    function _calculateLevel(uint256 xp) internal pure returns (uint256) {
        if (xp < 1000) return 1;
        if (xp < 3000) return 2;
        if (xp < 6000) return 3;
        if (xp < 10000) return 4;
        if (xp < 15000) return 5;
        if (xp < 22000) return 6;
        if (xp < 30000) return 7;
        if (xp < 40000) return 8;
        if (xp < 52000) return 9;
        if (xp < 66000) return 10;

        // Level 11+: quadratic scaling
        return 10 + ((xp - 66000) / 8000);
    }

    /**
     * @notice Level up character and upgrade stats
     */
    function _levelUpCharacter(uint256 tokenId, uint256 newLevel) internal {
        CharacterStats storage char = characters[tokenId];
        char.level = newLevel;

        // Upgrade class-specific stats with diminishing returns
        uint256 levelBonus = newLevel > 10 ? newLevel - 5 : newLevel;

        if (char.class == CharacterClass.RushRunner) {
            char.speedBonus += levelBonus * 2;
        } else if (char.class == CharacterClass.GuardianTowers) {
            char.shieldStrength += levelBonus * 3;
        } else if (char.class == CharacterClass.PixelSharpshooter) {
            char.accuracyBonus += levelBonus * 2;
        } else {
            char.techPower += levelBonus * 2;
        }

        // Update title
        char.customTitle = _getTitleForLevel(newLevel);

        // Update metadata
        _updateMetadata(tokenId);

        emit CharacterLeveledUp(tokenId, newLevel, char.customTitle);
    }

    /**
     * @notice Check and unlock story progression
     */
    function _checkStoryProgression(uint256 tokenId, uint256 score) internal {
        CharacterStats storage char = characters[tokenId];
        StoryChapter[] storage chapters = storyContent[char.class][char.currentArc];

        for (uint256 i = char.storyProgress + 1; i < chapters.length; i++) {
            StoryChapter storage chapter = chapters[i];

            if (score >= chapter.scoreRequirement && char.level >= chapter.levelRequirement) {
                // Unlock chapter
                char.chaptersUnlocked[_getGlobalChapterIndex(char.currentArc, i)] = true;
                char.storyProgress = i;

                // Award chapter XP
                char.experiencePoints += chapter.xpReward;

                emit StoryProgressionUnlocked(
                    tokenId,
                    char.currentArc,
                    i,
                    chapter.chapterTitle
                );

                // Check if arc is complete
                if (i == chapters.length - 1) {
                    _advanceStoryArc(tokenId);
                }

                break; // Only unlock one chapter per game
            }
        }
    }

    /**
     * @notice Advance to next story arc
     */
    function _advanceStoryArc(uint256 tokenId) internal {
        CharacterStats storage char = characters[tokenId];

        if (char.currentArc == StoryArc.TheAwakening) {
            char.currentArc = StoryArc.NeonGenesis;
        } else if (char.currentArc == StoryArc.NeonGenesis) {
            char.currentArc = StoryArc.DigitalFrontier;
        } else if (char.currentArc == StoryArc.DigitalFrontier) {
            char.currentArc = StoryArc.QuantumRealm;
        } else if (char.currentArc == StoryArc.QuantumRealm) {
            char.currentArc = StoryArc.AscendedLegend;
        }

        char.storyProgress = 0;
        _updateMetadata(tokenId);
    }

    /**
     * @notice Discover random lore fragment
     */
    function _discoverLoreFragment(uint256 tokenId) internal {
        CharacterStats storage char = characters[tokenId];

        string[10] memory fragmentTitles = [
            "The Origin Protocol",
            "Whispers of the Blockchain",
            "Legends of Old Validators",
            "The Great Consensus War",
            "Encrypted Memories",
            "Digital Prophecies",
            "The First Smart Contract",
            "Chronicles of the C-Chain",
            "Avalanche Mythology",
            "The Quantum Shift"
        ];

        uint256 index = _random(tokenId) % fragmentTitles.length;

        characterLore[tokenId].push(LoreFragment({
            title: fragmentTitles[index],
            content: "Lore content stored off-chain",
            discoveredAt: block.timestamp,
            relatedArc: char.currentArc
        }));

        emit LoreFragmentDiscovered(tokenId, fragmentTitles[index], char.currentArc);
    }

    /**
     * @notice Get title based on level
     */
    function _getTitleForLevel(uint256 level) internal pure returns (string memory) {
        if (level < 5) return "Novice";
        if (level < 10) return "Adept";
        if (level < 15) return "Expert";
        if (level < 20) return "Veteran";
        if (level < 30) return "Master";
        if (level < 50) return "Grandmaster";
        return "Legend";
    }

    /**
     * @notice Update character metadata
     */
    function _updateMetadata(uint256 tokenId) internal {
        CharacterStats storage char = characters[tokenId];

        string memory newURI = string(abi.encodePacked(
            "ipfs://QmCharacters/",
            _toString(uint256(char.class)),
            "/",
            _toString(char.level),
            "/",
            _toString(uint256(char.currentArc)),
            ".json"
        ));

        _setTokenURI(tokenId, newURI);
    }

    /**
     * @notice Get global chapter index across all arcs
     */
    function _getGlobalChapterIndex(StoryArc arc, uint256 chapterInArc) internal pure returns (uint256) {
        return uint256(arc) * 10 + chapterInArc;
    }

    /**
     * @notice Pseudo-random number generator
     */
    function _random(uint256 tokenId) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            tokenId,
            characters[tokenId].totalGamesPlayed
        )));
    }

    /**
     * @notice Convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice Get complete character data
     */
    function getCharacterData(uint256 tokenId) external view returns (
        CharacterStats memory stats,
        LoreFragment[] memory lore,
        StoryChapter[] memory currentStoryline
    ) {
        require(_exists(tokenId), "Character does not exist");
        stats = characters[tokenId];
        lore = characterLore[tokenId];
        currentStoryline = storyContent[stats.class][stats.currentArc];
    }

    /**
     * @notice Add new story chapter (Story Writer role)
     */
    function addStoryChapter(
        CharacterClass class,
        StoryArc arc,
        StoryChapter memory chapter
    ) external onlyRole(STORY_WRITER) {
        storyContent[class][arc].push(chapter);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
