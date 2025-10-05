// contracts/ReactiveQuestRewards.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IReactive } from "@reactive-chain/contracts/Reactive.sol";
import "./ReactiveQuestEngineAdvanced.sol";

interface IRushToken {
    function mintRewards(address to, uint256 amount) external;
}

interface IEducationalNFT {
    function mintAchievement(
        address player,
        uint256 questId,
        uint256 score,
        string calldata metadata
    ) external returns (uint256 tokenId);
}

/**
 * @title ReactiveQuestRewards
 * @dev Concrete implementation that wires Automated Rewards (RUSH), NFT minting, and transparent events
 *      to the abstract ReactiveQuestEngineAdvanced. Designed to run on the Reactive Network and
 *      automatically execute reward logic when quests are completed.
 */
contract ReactiveQuestRewards is ReactiveQuestEngineAdvanced, ReentrancyGuard, Ownable {
    IRushToken public immutable rushToken;
    IEducationalNFT public immutable educationalNFT;

    // Optional native reward in wei (on Reactive chain) to send alongside RUSH/NFT, 0 to disable
    uint256 public nativeTipWei;

    // Transparent events for on-chain reward accounting
    event RewardPaid(address indexed player, uint256 questId, uint256 rushAmount, uint256 nativeTipWei);
    event AchievementNFTMinted(address indexed player, uint256 questId, uint256 tokenId);

    constructor(
        IReactive reactive,
        uint64 subscriptionId,
        address vrfCoordinator,
        address rushTokenAddress,
        address educationalNFTAddress
    ) ReactiveQuestEngineAdvanced(reactive, subscriptionId, vrfCoordinator) Ownable(msg.sender) {
        require(rushTokenAddress != address(0), "rush token required");
        require(educationalNFTAddress != address(0), "nft required");
        rushToken = IRushToken(rushTokenAddress);
        educationalNFT = IEducationalNFT(educationalNFTAddress);
    }

    // --- Admin configuration ---
    function setNativeTipWei(uint256 amountWei) external onlyOwner {
        nativeTipWei = amountWei;
    }

    receive() external payable {}

    // --- Abstract impls ---
    function _distributeTokenRewards(address player, uint256 amount) internal override nonReentrant {
        // Mint RUSH rewards
        rushToken.mintRewards(player, amount);

        // Optional native tip (if contract has balance and tip configured)
        uint256 tip = 0;
        if (nativeTipWei > 0 && address(this).balance >= nativeTipWei) {
            tip = nativeTipWei;
            (bool ok, ) = payable(player).call{ value: tip }("");
            // Silent failure to avoid reverting rewards if tip send fails
            if (!ok) {
                tip = 0;
            }
        }

        // questId is emitted by caller context in QuestCompleted, not available here directly
        emit RewardPaid(player, 0, amount, tip);
    }

    function _mintDynamicAchievementNFT(address player, uint256 questId, uint256 contextValue) internal override {
        // Use contextValue as score-like metric for metadata; metadata string can be enriched later
        uint256 tokenId = educationalNFT.mintAchievement(player, questId, contextValue, "Quest Achievement");
        emit AchievementNFTMinted(player, questId, tokenId);
    }

    // The following handlers map emitted events into quest completion checks.
    // In many demos, quests are preconfigured in _initializeAdvancedQuests().
    // For simplicity, we iterate to find the first active matching quest and complete it.

    function _handleTransferEvent(address emitter, bytes calldata data) internal override {
        (address from, address to, uint256 amount) = abi.decode(data, (address, address, uint256));
        address player = to != address(0) ? to : from;
        _completeFirstMatching(player, QuestType.TRANSFER, amount);
    }

    function _handleSwapEvent(address emitter, bytes calldata data) internal override {
        // Example encoded data: (address trader, uint256 amountIn, uint256 amountOut, uint256 minOut, uint256 price, address pool)
        (address trader, uint256 amountIn, uint256 amountOut,,,) = abi.decode(data, (address, uint256, uint256, uint256, uint256, address));
        uint256 context = amountOut > 0 ? amountOut : amountIn;
        _completeFirstMatching(trader, QuestType.SWAP, context);
    }

    function _handleNFTMintEvent(address emitter, bytes calldata data) internal override {
        // Standard ERC721 Transfer event data can be parsed but we only need the receiver
        (address from, address to, uint256 tokenId) = abi.decode(data, (address, address, uint256));
        _completeFirstMatching(to, QuestType.NFT_MINT, tokenId);
    }

    function _handleLiquidityEvent(address emitter, bytes calldata data) internal override {
        (address provider, uint256 amountA, uint256 amountB) = abi.decode(data, (address, uint256, uint256));
        uint256 context = amountA + amountB;
        _completeFirstMatching(provider, QuestType.LIQUIDITY_PROVISION, context);
    }

    // --- Helpers ---
    function _completeFirstMatching(address player, QuestType qType, uint256 contextValue) internal {
        for (uint256 i = 1; i <= questCounter; i++) {
            Quest storage q = quests[i];
            if (q.isActive && q.qType == qType && !players[player].questCompletions[i]) {
                if (contextValue >= q.minAmount) {
                    _completeAdvancedQuest(player, i, contextValue);
                    break;
                }
            }
        }
    }
}


