// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RushToken - ERC20 token for Avalanche Rush rewards
 * @dev Token used for automated reward distribution and raffle prizes
 * @notice Integrates with the enhanced rewards system for transparent distribution
 */
contract RushToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18; // 10M tokens max supply
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1M tokens initial supply
    
    // Reward system contract address
    address public rewardSystem;
    
    // Staking contract address
    address public stakingContract;
    
    // Tokenomics
    uint256 public constant REWARD_RATE = 100; // 100 tokens per reward point
    uint256 public constant STAKING_REWARD_RATE = 50; // 50 tokens per day staked
    uint256 public constant BURN_RATE = 5; // 5% burn rate on transfers
    
    // ============ EVENTS ============
    
    event RewardSystemUpdated(address indexed oldSystem, address indexed newSystem);
    event StakingContractUpdated(address indexed oldContract, address indexed newContract);
    event TokensMintedForRewards(address indexed to, uint256 amount, uint256 rewardPoints);
    event TokensBurnedOnTransfer(address indexed from, address indexed to, uint256 burnAmount);
    event StakingRewardsDistributed(address indexed staker, uint256 amount, uint256 stakingDays);
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC20("Avalanche Rush Token", "RUSH") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    // ============ REWARD DISTRIBUTION FUNCTIONS ============
    
    /**
     * @dev Mint tokens for reward distribution
     * @param to The recipient address
     * @param rewardPoints The reward points earned
     */
    function mintRewardTokens(address to, uint256 rewardPoints) external onlyRewardSystem {
        require(to != address(0), "Cannot mint to zero address");
        require(rewardPoints > 0, "No reward points");
        
        uint256 amount = rewardPoints * REWARD_RATE;
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(to, amount);
        
        emit TokensMintedForRewards(to, amount, rewardPoints);
    }
    
    /**
     * @dev Distribute staking rewards
     * @param staker The staker's address
     * @param stakingDays The number of days staked
     */
    function distributeStakingRewards(address staker, uint256 stakingDays) external onlyStakingContract {
        require(staker != address(0), "Invalid staker address");
        require(stakingDays > 0, "No staking days");
        
        uint256 amount = stakingDays * STAKING_REWARD_RATE;
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(staker, amount);
        
        emit StakingRewardsDistributed(staker, amount, stakingDays);
    }
    
    // ============ ENHANCED TRANSFER FUNCTIONS ============
    
    /**
     * @dev Override transfer to include burn mechanism
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        uint256 burnAmount = (amount * BURN_RATE) / 100;
        uint256 transferAmount = amount - burnAmount;
        
        // Burn tokens
        if (burnAmount > 0) {
            _burn(msg.sender, burnAmount);
            emit TokensBurnedOnTransfer(msg.sender, to, burnAmount);
        }
        
        // Transfer remaining amount
        return super.transfer(to, transferAmount);
    }
    
    /**
     * @dev Override transferFrom to include burn mechanism
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 burnAmount = (amount * BURN_RATE) / 100;
        uint256 transferAmount = amount - burnAmount;
        
        // Burn tokens
        if (burnAmount > 0) {
            _burn(from, burnAmount);
            emit TokensBurnedOnTransfer(from, to, burnAmount);
        }
        
        // Transfer remaining amount
        return super.transferFrom(from, to, transferAmount);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Set reward system contract address
     */
    function setRewardSystem(address _rewardSystem) external onlyOwner {
        require(_rewardSystem != address(0), "Invalid reward system address");
        emit RewardSystemUpdated(rewardSystem, _rewardSystem);
        rewardSystem = _rewardSystem;
    }
    
    /**
     * @dev Set staking contract address
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid staking contract address");
        emit StakingContractUpdated(stakingContract, _stakingContract);
        stakingContract = _stakingContract;
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency mint function for owner
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get token information
     */
    function getTokenInfo() external view returns (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        uint256 maxSupply,
        uint256 remainingSupply
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY,
            MAX_SUPPLY - totalSupply()
        );
    }
    
    /**
     * @dev Get reward rates
     */
    function getRewardRates() external pure returns (
        uint256 rewardRate,
        uint256 stakingRewardRate,
        uint256 burnRate
    ) {
        return (REWARD_RATE, STAKING_REWARD_RATE, BURN_RATE);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Override _beforeTokenTransfer to include pausable functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyRewardSystem() {
        require(msg.sender == rewardSystem, "Only reward system can call this");
        _;
    }
    
    modifier onlyStakingContract() {
        require(msg.sender == stakingContract, "Only staking contract can call this");
        _;
    }
}