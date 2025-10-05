// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReactive.sol";
import "./AbstractReactive.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ReactiveEducationRewards
 * @dev Automated DeFi education rewards system using Reactive Network
 * @notice Maximizes educational value and Reactive Network transaction volume
 */
contract ReactiveEducationRewards is AbstractReactive, ReentrancyGuard, Ownable {
    
    struct EducationModule {
        uint256 id;
        string name;
        string description;
        address[] requiredProtocols;
        uint256[] requiredActions; // 1=swap, 2=lend, 3=borrow, 4=stake, 5=vote, 6=bridge
        uint256 rewardAmount;
        uint256 nftCertificateId;
        bool isActive;
        uint256 difficulty; // 1-5 scale
        uint256 timeLimit; // 0 = no limit
        uint256 startTime;
        uint256 endTime;
        uint256 completionCount;
        uint256 maxCompletions;
    }
    
    struct StudentProgress {
        mapping(uint256 => bool) modulesCompleted;
        mapping(uint256 => uint256) actionCounts;
        mapping(address => uint256) protocolInteractions;
        uint256 totalRewardsEarned;
        uint256 educationLevel;
        uint256[] certificatesEarned;
        uint256 totalStudyTime;
        uint256 lastActivity;
        uint256 streak;
    }
    
    struct DeFiAction {
        address protocol;
        string actionType;
        uint256 amount;
        uint256 timestamp;
        uint256 chainId;
    }
    
    // State variables
    mapping(uint256 => EducationModule) public modules;
    mapping(address => StudentProgress) public students;
    mapping(address => mapping(address => uint256)) public protocolInteractions;
    mapping(address => DeFiAction[]) public studentActions;
    mapping(bytes32 => bool) public eventProcessed;
    
    // Education tracking
    uint256 public moduleCount;
    uint256 public totalStudents;
    uint256 public totalRewardsDistributed;
    uint256 public totalCertificatesIssued;
    
    // Token and NFT contracts
    IERC20 public educationToken;
    IERC721 public certificateNFT;
    
    // Events
    event ModuleCompleted(address indexed student, uint256 indexed moduleId, uint256 reward);
    event CertificateEarned(address indexed student, uint256 certificateId);
    event EducationLevelUp(address indexed student, uint256 newLevel);
    event DeFiActionDetected(address indexed user, address protocol, string action, uint256 amount);
    event DynamicModuleCreated(uint256 indexed moduleId, string name, uint256 marketCondition);
    event StudyStreakUpdated(address indexed student, uint256 newStreak);
    event CrossChainEducationVerified(address indexed student, uint256 sourceChain, uint256 moduleId);
    
    // Modifiers
    modifier onlyValidModule(uint256 moduleId) {
        require(modules[moduleId].isActive, "Module not active");
        require(block.timestamp >= modules[moduleId].startTime, "Module not started");
        require(modules[moduleId].endTime == 0 || block.timestamp <= modules[moduleId].endTime, "Module expired");
        _;
    }
    
    modifier onlyEducator() {
        require(hasRole(EDUCATOR_ROLE, msg.sender), "Only educators can call this");
        _;
    }
    
    bytes32 public constant EDUCATOR_ROLE = keccak256("EDUCATOR_ROLE");
    
    constructor(address _educationToken, address _certificateNFT) {
        educationToken = IERC20(_educationToken);
        certificateNFT = IERC721(_certificateNFT);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(EDUCATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Main reactive function for DeFi education tracking
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
        bytes32 eventHash = keccak256(abi.encodePacked(chain_id, _contract, topic_0, topic_1, block_number));
        
        // Prevent duplicate processing
        if (eventProcessed[eventHash]) return;
        eventProcessed[eventHash] = true;
        
        address user = address(uint160(topic_1));
        
        // Track different DeFi actions for education
        if (isSwapEvent(topic_0)) {
            trackSwapEducation(user, _contract, data, chain_id);
        } else if (isLendingEvent(topic_0)) {
            trackLendingEducation(user, _contract, data, chain_id);
        } else if (isStakingEvent(topic_0)) {
            trackStakingEducation(user, _contract, data, chain_id);
        } else if (isGovernanceEvent(topic_0)) {
            trackGovernanceEducation(user, _contract, data, chain_id);
        } else if (isBridgeEvent(topic_0)) {
            trackBridgeEducation(user, _contract, data, chain_id);
        }
        
        // Check for module completion
        checkModuleCompletion(user);
        
        // Update student activity
        updateStudentActivity(user);
    }
    
    /**
     * @dev Track swap education
     */
    function trackSwapEducation(address user, address dex, bytes calldata data, uint256 chainId) internal {
        (uint256 amountIn, uint256 amountOut, address tokenIn, address tokenOut) = 
            abi.decode(data, (uint256, uint256, address, address));
        
        protocolInteractions[user][dex]++;
        students[user].actionCounts[1]++; // Swap action
        students[user].protocolInteractions[dex]++;
        
        // Record action
        studentActions[user].push(DeFiAction({
            protocol: dex,
            actionType: "swap",
            amount: amountIn,
            timestamp: block.timestamp,
            chainId: chainId
        }));
        
        emit DeFiActionDetected(user, dex, "swap", amountIn);
        
        // Award immediate micro-rewards for educational actions
        if (protocolInteractions[user][dex] == 1) {
            // First time using this DEX - educational bonus
            awardEducationTokens(user, 100 * 10**18);
        }
        
        // Large swap bonus
        if (amountIn >= 1000 * 10**18) { // $1000+ swap
            awardEducationTokens(user, 200 * 10**18);
        }
    }
    
    /**
     * @dev Track lending education
     */
    function trackLendingEducation(address user, address protocol, bytes calldata data, uint256 chainId) internal {
        (uint256 amount, uint256 interestRate, uint256 duration) = 
            abi.decode(data, (uint256, uint256, uint256));
        
        students[user].actionCounts[2]++; // Lending action
        protocolInteractions[user][protocol]++;
        students[user].protocolInteractions[protocol]++;
        
        // Record action
        studentActions[user].push(DeFiAction({
            protocol: protocol,
            actionType: "lend",
            amount: amount,
            timestamp: block.timestamp,
            chainId: chainId
        }));
        
        // Award compound interest education rewards
        uint256 reward = calculateLendingEducationReward(user, protocol, amount, interestRate);
        awardEducationTokens(user, reward);
        
        emit DeFiActionDetected(user, protocol, "lend", amount);
    }
    
    /**
     * @dev Track staking education
     */
    function trackStakingEducation(address user, address protocol, bytes calldata data, uint256 chainId) internal {
        (uint256 amount, uint256 duration, uint256 apy) = 
            abi.decode(data, (uint256, uint256, uint256));
        
        students[user].actionCounts[4]++; // Staking action
        protocolInteractions[user][protocol]++;
        students[user].protocolInteractions[protocol]++;
        
        // Record action
        studentActions[user].push(DeFiAction({
            protocol: protocol,
            actionType: "stake",
            amount: amount,
            timestamp: block.timestamp,
            chainId: chainId
        }));
        
        // Award staking education rewards
        uint256 reward = calculateStakingEducationReward(user, protocol, amount, apy);
        awardEducationTokens(user, reward);
        
        emit DeFiActionDetected(user, protocol, "stake", amount);
    }
    
    /**
     * @dev Track governance education
     */
    function trackGovernanceEducation(address user, address protocol, bytes calldata data, uint256 chainId) internal {
        (uint256 proposalId, uint256 vote, uint256 weight) = 
            abi.decode(data, (uint256, uint256, uint256));
        
        students[user].actionCounts[5]++; // Governance action
        protocolInteractions[user][protocol]++;
        students[user].protocolInteractions[protocol]++;
        
        // Record action
        studentActions[user].push(DeFiAction({
            protocol: protocol,
            actionType: "vote",
            amount: weight,
            timestamp: block.timestamp,
            chainId: chainId
        }));
        
        // Award governance participation rewards
        uint256 reward = calculateGovernanceEducationReward(user, protocol, weight);
        awardEducationTokens(user, reward);
        
        emit DeFiActionDetected(user, protocol, "vote", weight);
    }
    
    /**
     * @dev Track bridge education
     */
    function trackBridgeEducation(address user, address bridge, bytes calldata data, uint256 chainId) internal {
        (uint256 amount, uint256 destinationChain, address token) = 
            abi.decode(data, (uint256, uint256, address));
        
        students[user].actionCounts[6]++; // Bridge action
        protocolInteractions[user][bridge]++;
        students[user].protocolInteractions[bridge]++;
        
        // Record action
        studentActions[user].push(DeFiAction({
            protocol: bridge,
            actionType: "bridge",
            amount: amount,
            timestamp: block.timestamp,
            chainId: chainId
        }));
        
        // Award cross-chain education rewards
        uint256 reward = calculateBridgeEducationReward(user, bridge, amount, destinationChain);
        awardEducationTokens(user, reward);
        
        emit DeFiActionDetected(user, bridge, "bridge", amount);
        emit CrossChainEducationVerified(user, chainId, 0); // Module ID 0 for general cross-chain
    }
    
    /**
     * @dev Check for module completion
     */
    function checkModuleCompletion(address user) internal {
        // Check all active modules for completion
        for (uint256 i = 1; i <= moduleCount; i++) {
            if (modules[i].isActive && !students[user].modulesCompleted[i]) {
                if (isModuleCompleted(user, i)) {
                    completeModule(user, i);
                }
            }
        }
    }
    
    /**
     * @dev Check if module is completed
     */
    function isModuleCompleted(address user, uint256 moduleId) internal view returns (bool) {
        EducationModule memory module = modules[moduleId];
        StudentProgress storage progress = students[user];
        
        // Check if all required actions are completed
        for (uint256 i = 0; i < module.requiredActions.length; i++) {
            uint256 actionType = module.requiredActions[i];
            if (progress.actionCounts[actionType] == 0) {
                return false;
            }
        }
        
        // Check if all required protocols are interacted with
        for (uint256 i = 0; i < module.requiredProtocols.length; i++) {
            address protocol = module.requiredProtocols[i];
            if (progress.protocolInteractions[protocol] == 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Complete module and award rewards
     */
    function completeModule(address user, uint256 moduleId) internal {
        EducationModule storage module = modules[moduleId];
        StudentProgress storage progress = students[user];
        
        // Mark module as completed
        progress.modulesCompleted[moduleId] = true;
        progress.totalRewardsEarned += module.rewardAmount;
        progress.certificatesEarned.push(module.nftCertificateId);
        
        // Award tokens and NFT certificate
        awardEducationTokens(user, module.rewardAmount);
        mintEducationNFT(user, module.nftCertificateId);
        
        // Update module completion count
        module.completionCount++;
        
        // Update global stats
        totalRewardsDistributed += module.rewardAmount;
        totalCertificatesIssued++;
        
        emit ModuleCompleted(user, moduleId, module.rewardAmount);
        emit CertificateEarned(user, module.nftCertificateId);
        
        // Check for level up
        checkEducationLevelUp(user);
    }
    
    /**
     * @dev Check for education level up
     */
    function checkEducationLevelUp(address user) internal {
        StudentProgress storage progress = students[user];
        uint256 requiredModules = progress.educationLevel * 3; // 3 modules per level
        
        if (progress.certificatesEarned.length >= requiredModules) {
            progress.educationLevel++;
            emit EducationLevelUp(user, progress.educationLevel);
            
            // Award level up bonus
            uint256 levelBonus = progress.educationLevel * 500 * 10**18;
            awardEducationTokens(user, levelBonus);
        }
    }
    
    /**
     * @dev Update student activity
     */
    function updateStudentActivity(address user) internal {
        StudentProgress storage progress = students[user];
        
        if (block.timestamp - progress.lastActivity > 1 days) {
            progress.streak = 1; // Reset streak
        } else {
            progress.streak++;
        }
        
        progress.lastActivity = block.timestamp;
        emit StudyStreakUpdated(user, progress.streak);
    }
    
    /**
     * @dev Award education tokens
     */
    function awardEducationTokens(address user, uint256 amount) internal {
        educationToken.transfer(user, amount);
        students[user].totalRewardsEarned += amount;
    }
    
    /**
     * @dev Mint education NFT
     */
    function mintEducationNFT(address user, uint256 certificateId) internal {
        certificateNFT.transferFrom(address(this), user, certificateId);
    }
    
    /**
     * @dev Create dynamic education module
     */
    function createDynamicEducationModule(
        string memory name,
        address[] memory protocols,
        uint256[] memory requiredActions,
        uint256 rewardAmount
    ) external onlyEducator {
        uint256 moduleId = moduleCount + 1;
        
        modules[moduleId] = EducationModule({
            id: moduleId,
            name: name,
            description: "",
            requiredProtocols: protocols,
            requiredActions: requiredActions,
            rewardAmount: rewardAmount,
            nftCertificateId: moduleId,
            isActive: true,
            difficulty: calculateModuleDifficulty(protocols, requiredActions),
            timeLimit: 0,
            startTime: block.timestamp,
            endTime: 0,
            completionCount: 0,
            maxCompletions: 10000
        });
        
        moduleCount++;
        
        emit DynamicModuleCreated(moduleId, name, getMarketVolatility());
    }
    
    /**
     * @dev Generate market-based curriculum
     */
    function generateMarketBasedCurriculum() external onlyEducator {
        // Create education modules based on current market conditions
        // High volatility = risk management modules
        // New protocol launches = integration tutorials
        // Market crashes = DCA and hedging education
        
        uint256 marketVolatility = getMarketVolatility();
        
        if (marketVolatility > 80) {
            // Create risk management module
            createDynamicEducationModule(
                "Risk Management in High Volatility",
                getRiskManagementProtocols(),
                getRiskManagementActions(),
                1000 * 10**18
            );
        } else if (marketVolatility < 20) {
            // Create yield farming module
            createDynamicEducationModule(
                "Yield Farming in Stable Markets",
                getYieldFarmingProtocols(),
                getYieldFarmingActions(),
                800 * 10**18
            );
        }
    }
    
    // View functions
    function getStudentProgress(address student) external view returns (
        uint256 totalRewardsEarned,
        uint256 educationLevel,
        uint256[] memory certificatesEarned,
        uint256 totalStudyTime,
        uint256 streak,
        uint256 lastActivity
    ) {
        StudentProgress storage progress = students[student];
        return (
            progress.totalRewardsEarned,
            progress.educationLevel,
            progress.certificatesEarned,
            progress.totalStudyTime,
            progress.streak,
            progress.lastActivity
        );
    }
    
    function getModule(uint256 moduleId) external view returns (EducationModule memory) {
        return modules[moduleId];
    }
    
    function getStudentActions(address student) external view returns (DeFiAction[] memory) {
        return studentActions[student];
    }
    
    function getActiveModules() external view returns (uint256[] memory) {
        uint256[] memory activeModules = new uint256[](moduleCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= moduleCount; i++) {
            if (modules[i].isActive) {
                activeModules[count] = i;
                count++;
            }
        }
        
        return activeModules;
    }
    
    // Helper functions
    function isSwapEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Swap(address,uint256,uint256,address)");
    }
    
    function isLendingEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Lent(address,uint256,uint256)");
    }
    
    function isStakingEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("Staked(address,uint256,uint256)");
    }
    
    function isGovernanceEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("VoteCast(address,uint256,uint256,uint256)");
    }
    
    function isBridgeEvent(uint256 topic0) internal pure returns (bool) {
        return topic0 == keccak256("BridgeTransfer(address,uint256,uint256,address)");
    }
    
    function calculateLendingEducationReward(address user, address protocol, uint256 amount, uint256 interestRate) internal view returns (uint256) {
        uint256 baseReward = 50 * 10**18;
        uint256 amountBonus = (amount / 1000) * 10**18; // 1 token per $1000
        uint256 interestBonus = (interestRate / 100) * 10**18; // 1 token per 1% interest
        
        return baseReward + amountBonus + interestBonus;
    }
    
    function calculateStakingEducationReward(address user, address protocol, uint256 amount, uint256 apy) internal view returns (uint256) {
        uint256 baseReward = 75 * 10**18;
        uint256 amountBonus = (amount / 1000) * 10**18;
        uint256 apyBonus = (apy / 100) * 10**18;
        
        return baseReward + amountBonus + apyBonus;
    }
    
    function calculateGovernanceEducationReward(address user, address protocol, uint256 weight) internal view returns (uint256) {
        uint256 baseReward = 100 * 10**18;
        uint256 weightBonus = (weight / 1000) * 10**18;
        
        return baseReward + weightBonus;
    }
    
    function calculateBridgeEducationReward(address user, address bridge, uint256 amount, uint256 destinationChain) internal view returns (uint256) {
        uint256 baseReward = 150 * 10**18;
        uint256 amountBonus = (amount / 1000) * 10**18;
        uint256 crossChainBonus = destinationChain != block.chainid ? 50 * 10**18 : 0;
        
        return baseReward + amountBonus + crossChainBonus;
    }
    
    function calculateModuleDifficulty(address[] memory protocols, uint256[] memory actions) internal pure returns (uint256) {
        uint256 protocolCount = protocols.length;
        uint256 actionCount = actions.length;
        
        if (protocolCount >= 5 && actionCount >= 4) return 5; // Very hard
        if (protocolCount >= 3 && actionCount >= 3) return 4; // Hard
        if (protocolCount >= 2 && actionCount >= 2) return 3; // Medium
        if (protocolCount >= 1 && actionCount >= 1) return 2; // Easy
        return 1; // Very easy
    }
    
    function getMarketVolatility() internal view returns (uint256) {
        // Placeholder for market volatility calculation
        return 75; // 75% volatility
    }
    
    function getRiskManagementProtocols() internal pure returns (address[] memory) {
        // Return addresses of risk management protocols
        address[] memory protocols = new address[](3);
        // This would be populated with actual protocol addresses
        return protocols;
    }
    
    function getRiskManagementActions() internal pure returns (uint256[] memory) {
        uint256[] memory actions = new uint256[](2);
        actions[0] = 1; // Swap
        actions[1] = 2; // Lend
        return actions;
    }
    
    function getYieldFarmingProtocols() internal pure returns (address[] memory) {
        // Return addresses of yield farming protocols
        address[] memory protocols = new address[](2);
        // This would be populated with actual protocol addresses
        return protocols;
    }
    
    function getYieldFarmingActions() internal pure returns (uint256[] memory) {
        uint256[] memory actions = new uint256[](2);
        actions[0] = 4; // Stake
        actions[1] = 2; // Lend
        return actions;
    }
}
