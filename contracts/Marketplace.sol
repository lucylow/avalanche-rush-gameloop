// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RushToken.sol";
import "./RushNFT.sol";

/**
 * @title Marketplace
 * @dev NFT marketplace for trading Rush NFTs
 * @notice Handles NFT listings, sales, and fee distribution
 */
contract Marketplace is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Listing structure
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 listingTime;
        uint256 expirationTime;
    }
    
    // Offer structure
    struct Offer {
        address offerer;
        uint256 price;
        uint256 expirationTime;
        bool isActive;
    }
    
    // State variables
    Counters.Counter private _listingIdCounter;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userOffers;
    
    // Fee structure (in basis points, 100 = 1%)
    uint256 public platformFeePercent = 250; // 2.5%
    uint256 public creatorRoyaltyPercent = 250; // 2.5%
    uint256 public totalPlatformFees;
    uint256 public totalCreatorRoyalties;
    
    // Contracts
    RushToken public rushToken;
    RushNFT public rushNFT;
    
    // Events
    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 expirationTime
    );
    event NFTSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 platformFee,
        uint256 creatorRoyalty
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event OfferMade(
        uint256 indexed tokenId,
        address indexed offerer,
        uint256 price,
        uint256 expirationTime
    );
    event OfferAccepted(
        uint256 indexed tokenId,
        address indexed offerer,
        address indexed seller,
        uint256 price
    );
    event OfferCancelled(uint256 indexed tokenId, address indexed offerer);
    event FeeUpdated(uint256 newPlatformFee, uint256 newCreatorRoyalty);
    
    constructor(address _rushToken, address _rushNFT) {
        rushToken = RushToken(_rushToken);
        rushNFT = RushNFT(_rushNFT);
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId Token ID to list
     * @param price Sale price in RUSH tokens
     * @param expirationTime Listing expiration time
     */
    function listNFT(
        uint256 tokenId,
        uint256 price,
        uint256 expirationTime
    ) external nonReentrant {
        require(rushNFT.ownerOf(tokenId) == msg.sender, "Marketplace: Not owner of token");
        require(rushNFT.getApproved(tokenId) == address(this), "Marketplace: Contract not approved");
        require(price > 0, "Marketplace: Price must be greater than 0");
        require(expirationTime > block.timestamp, "Marketplace: Invalid expiration time");
        require(!listings[tokenId].isActive, "Marketplace: Token already listed");
        
        // Check if NFT is tradeable
        RushNFT.Achievement memory achievement = rushNFT.getAchievement(tokenId);
        require(achievement.isTradeable, "Marketplace: Token is not tradeable");
        
        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            listingTime: block.timestamp,
            expirationTime: expirationTime
        });
        
        userListings[msg.sender].push(tokenId);
        
        emit NFTListed(tokenId, msg.sender, price, expirationTime);
    }
    
    /**
     * @dev Buy an NFT
     * @param tokenId Token ID to buy
     */
    function buyNFT(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Marketplace: Listing not active");
        require(block.timestamp < listing.expirationTime, "Marketplace: Listing expired");
        require(msg.sender != listing.seller, "Marketplace: Cannot buy own NFT");
        
        uint256 price = listing.price;
        uint256 platformFee = (price * platformFeePercent) / 10000;
        uint256 creatorRoyalty = (price * creatorRoyaltyPercent) / 10000;
        uint256 sellerAmount = price - platformFee - creatorRoyalty;
        
        // Transfer RUSH tokens
        rushToken.transferFrom(msg.sender, address(this), price);
        rushToken.transfer(listing.seller, sellerAmount);
        rushToken.transfer(owner(), platformFee);
        
        // Transfer NFT
        rushNFT.transferFrom(listing.seller, msg.sender, tokenId);
        
        // Update statistics
        totalPlatformFees += platformFee;
        totalCreatorRoyalties += creatorRoyalty;
        
        // Deactivate listing
        listing.isActive = false;
        
        // Cancel all offers for this token
        _cancelAllOffers(tokenId);
        
        emit NFTSold(tokenId, listing.seller, msg.sender, price, platformFee, creatorRoyalty);
    }
    
    /**
     * @dev Cancel a listing
     * @param tokenId Token ID to cancel listing for
     */
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Marketplace: Listing not active");
        require(listing.seller == msg.sender, "Marketplace: Not the seller");
        
        listing.isActive = false;
        
        // Cancel all offers for this token
        _cancelAllOffers(tokenId);
        
        emit ListingCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev Make an offer for an NFT
     * @param tokenId Token ID to make offer for
     * @param price Offer price in RUSH tokens
     * @param expirationTime Offer expiration time
     */
    function makeOffer(
        uint256 tokenId,
        uint256 price,
        uint256 expirationTime
    ) external nonReentrant {
        require(rushNFT.ownerOf(tokenId) != msg.sender, "Marketplace: Cannot offer on own NFT");
        require(price > 0, "Marketplace: Offer price must be greater than 0");
        require(expirationTime > block.timestamp, "Marketplace: Invalid expiration time");
        
        // Transfer RUSH tokens to escrow
        rushToken.transferFrom(msg.sender, address(this), price);
        
        offers[tokenId].push(Offer({
            offerer: msg.sender,
            price: price,
            expirationTime: expirationTime,
            isActive: true
        }));
        
        userOffers[msg.sender].push(tokenId);
        
        emit OfferMade(tokenId, msg.sender, price, expirationTime);
    }
    
    /**
     * @dev Accept an offer
     * @param tokenId Token ID
     * @param offerIndex Index of the offer to accept
     */
    function acceptOffer(uint256 tokenId, uint256 offerIndex) external nonReentrant {
        require(rushNFT.ownerOf(tokenId) == msg.sender, "Marketplace: Not owner of token");
        require(rushNFT.getApproved(tokenId) == address(this), "Marketplace: Contract not approved");
        require(offerIndex < offers[tokenId].length, "Marketplace: Invalid offer index");
        
        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.isActive, "Marketplace: Offer not active");
        require(block.timestamp < offer.expirationTime, "Marketplace: Offer expired");
        
        uint256 price = offer.price;
        uint256 platformFee = (price * platformFeePercent) / 10000;
        uint256 creatorRoyalty = (price * creatorRoyaltyPercent) / 10000;
        uint256 sellerAmount = price - platformFee - creatorRoyalty;
        
        // Transfer RUSH tokens
        rushToken.transfer(msg.sender, sellerAmount);
        rushToken.transfer(owner(), platformFee);
        
        // Transfer NFT
        rushNFT.transferFrom(msg.sender, offer.offerer, tokenId);
        
        // Update statistics
        totalPlatformFees += platformFee;
        totalCreatorRoyalties += creatorRoyalty;
        
        // Deactivate offer
        offer.isActive = false;
        
        // Cancel all other offers for this token
        _cancelAllOffers(tokenId);
        
        // Cancel listing if exists
        if (listings[tokenId].isActive) {
            listings[tokenId].isActive = false;
        }
        
        emit OfferAccepted(tokenId, offer.offerer, msg.sender, price);
    }
    
    /**
     * @dev Cancel an offer
     * @param tokenId Token ID
     * @param offerIndex Index of the offer to cancel
     */
    function cancelOffer(uint256 tokenId, uint256 offerIndex) external nonReentrant {
        require(offerIndex < offers[tokenId].length, "Marketplace: Invalid offer index");
        
        Offer storage offer = offers[tokenId][offerIndex];
        require(offer.isActive, "Marketplace: Offer not active");
        require(offer.offerer == msg.sender, "Marketplace: Not the offerer");
        
        // Return RUSH tokens
        rushToken.transfer(msg.sender, offer.price);
        
        // Deactivate offer
        offer.isActive = false;
        
        emit OfferCancelled(tokenId, msg.sender);
    }
    
    /**
     * @dev Get listing details
     * @param tokenId Token ID
     * @return listing Listing details
     */
    function getListing(uint256 tokenId) external view returns (Listing memory listing) {
        return listings[tokenId];
    }
    
    /**
     * @dev Get offers for a token
     * @param tokenId Token ID
     * @return tokenOffers Array of offers
     */
    function getOffers(uint256 tokenId) external view returns (Offer[] memory tokenOffers) {
        return offers[tokenId];
    }
    
    /**
     * @dev Get user's listings
     * @param user User address
     * @return userListingIds Array of token IDs
     */
    function getUserListings(address user) external view returns (uint256[] memory userListingIds) {
        return userListings[user];
    }
    
    /**
     * @dev Get user's offers
     * @param user User address
     * @return userOfferIds Array of token IDs
     */
    function getUserOffers(address user) external view returns (uint256[] memory userOfferIds) {
        return userOffers[user];
    }
    
    /**
     * @dev Get marketplace statistics
     * @return stats Array of statistics
     */
    function getMarketplaceStats() external view returns (
        uint256 totalListings,
        uint256 activeListings,
        uint256 totalOffers,
        uint256 totalPlatformFees_,
        uint256 totalCreatorRoyalties_
    ) {
        totalListings = _listingIdCounter.current();
        totalPlatformFees_ = totalPlatformFees;
        totalCreatorRoyalties_ = totalCreatorRoyalties;
        
        // Count active listings and offers
        for (uint256 i = 0; i < totalListings; i++) {
            if (listings[i].isActive && block.timestamp < listings[i].expirationTime) {
                activeListings++;
            }
        }
        
        // Count total offers (this is expensive for large numbers)
        // In production, this should be maintained off-chain
    }
    
    /**
     * @dev Set fee percentages
     * @param newPlatformFee New platform fee percentage
     * @param newCreatorRoyalty New creator royalty percentage
     */
    function setFees(uint256 newPlatformFee, uint256 newCreatorRoyalty) external onlyOwner {
        require(newPlatformFee <= 1000, "Marketplace: Platform fee too high"); // Max 10%
        require(newCreatorRoyalty <= 1000, "Marketplace: Creator royalty too high"); // Max 10%
        
        platformFeePercent = newPlatformFee;
        creatorRoyaltyPercent = newCreatorRoyalty;
        
        emit FeeUpdated(newPlatformFee, newCreatorRoyalty);
    }
    
    /**
     * @dev Cancel all offers for a token (internal function)
     * @param tokenId Token ID
     */
    function _cancelAllOffers(uint256 tokenId) internal {
        for (uint256 i = 0; i < offers[tokenId].length; i++) {
            if (offers[tokenId][i].isActive) {
                offers[tokenId][i].isActive = false;
                rushToken.transfer(offers[tokenId][i].offerer, offers[tokenId][i].price);
            }
        }
    }
    
    /**
     * @dev Withdraw RUSH tokens from contract
     */
    function withdrawRushTokens() external onlyOwner {
        uint256 balance = rushToken.balanceOf(address(this));
        require(balance > 0, "Marketplace: No RUSH tokens to withdraw");
        
        rushToken.transfer(owner(), balance);
    }
}
