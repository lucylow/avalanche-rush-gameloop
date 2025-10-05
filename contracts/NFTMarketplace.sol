// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @notice P2P marketplace for trading gamified NFTs
 * @dev Allows players to buy/sell achievement, power-up, and evolution NFTs
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {

    IERC721 public nftContract;
    IERC20 public paymentToken;

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        uint256 listedAt;
        bool isActive;
    }

    struct Offer {
        address buyer;
        uint256 amount;
        uint256 expiresAt;
        bool isActive;
    }

    struct MarketStats {
        uint256 totalListings;
        uint256 totalSales;
        uint256 totalVolume;
        uint256 averagePrice;
    }

    // Listing ID => Listing details
    mapping(uint256 => Listing) public listings;
    uint256 public listingCounter;

    // Token ID => Listing ID
    mapping(uint256 => uint256) public tokenListings;

    // Listing ID => Offers
    mapping(uint256 => Offer[]) public listingOffers;

    // Marketplace fee (in basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFee = 250;
    uint256 public constant MAX_FEE = 1000; // 10%

    // Market statistics
    MarketStats public marketStats;

    // Events
    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );

    event NFTSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 tokenId,
        uint256 price
    );

    event ListingCancelled(
        uint256 indexed listingId,
        uint256 indexed tokenId
    );

    event OfferMade(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount
    );

    event OfferAccepted(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount
    );

    event PriceUpdated(
        uint256 indexed listingId,
        uint256 oldPrice,
        uint256 newPrice
    );

    constructor(
        address _nftContract,
        address _paymentToken
    ) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @notice List NFT for sale
     */
    function listNFT(uint256 tokenId, uint256 price)
        external
        nonReentrant
        returns (uint256)
    {
        require(price > 0, "Price must be positive");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(tokenListings[tokenId] == 0, "Already listed");

        // Transfer NFT to marketplace
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        uint256 listingId = ++listingCounter;

        listings[listingId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            listedAt: block.timestamp,
            isActive: true
        });

        tokenListings[tokenId] = listingId;
        marketStats.totalListings++;

        emit NFTListed(listingId, msg.sender, tokenId, price);

        return listingId;
    }

    /**
     * @notice Buy listed NFT
     */
    function buyNFT(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy own NFT");

        uint256 price = listing.price;
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;

        // Transfer payment
        require(
            paymentToken.transferFrom(msg.sender, listing.seller, sellerAmount),
            "Payment to seller failed"
        );

        if (fee > 0) {
            require(
                paymentToken.transferFrom(msg.sender, owner(), fee),
                "Fee payment failed"
            );
        }

        // Transfer NFT
        nftContract.transferFrom(address(this), msg.sender, listing.tokenId);

        // Update listing
        listing.isActive = false;
        delete tokenListings[listing.tokenId];

        // Update stats
        marketStats.totalSales++;
        marketStats.totalVolume += price;
        marketStats.averagePrice = marketStats.totalVolume / marketStats.totalSales;

        emit NFTSold(listingId, listing.seller, msg.sender, listing.tokenId, price);
    }

    /**
     * @notice Cancel listing and return NFT
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");

        // Return NFT
        nftContract.transferFrom(address(this), msg.sender, listing.tokenId);

        // Update listing
        listing.isActive = false;
        delete tokenListings[listing.tokenId];

        emit ListingCancelled(listingId, listing.tokenId);
    }

    /**
     * @notice Update listing price
     */
    function updatePrice(uint256 listingId, uint256 newPrice) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");
        require(newPrice > 0, "Price must be positive");

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit PriceUpdated(listingId, oldPrice, newPrice);
    }

    /**
     * @notice Make offer on listing
     */
    function makeOffer(uint256 listingId, uint256 amount, uint256 duration)
        external
        nonReentrant
    {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(amount > 0, "Invalid offer amount");
        require(msg.sender != listing.seller, "Cannot offer on own listing");

        // Lock offer amount
        require(
            paymentToken.transferFrom(msg.sender, address(this), amount),
            "Payment lock failed"
        );

        listingOffers[listingId].push(Offer({
            buyer: msg.sender,
            amount: amount,
            expiresAt: block.timestamp + duration,
            isActive: true
        }));

        emit OfferMade(listingId, msg.sender, amount);
    }

    /**
     * @notice Accept offer on listing
     */
    function acceptOffer(uint256 listingId, uint256 offerIndex)
        external
        nonReentrant
    {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");

        Offer storage offer = listingOffers[listingId][offerIndex];
        require(offer.isActive, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");

        uint256 amount = offer.amount;
        uint256 fee = (amount * marketplaceFee) / 10000;
        uint256 sellerAmount = amount - fee;

        // Transfer payment from locked funds
        require(
            paymentToken.transfer(listing.seller, sellerAmount),
            "Payment to seller failed"
        );

        if (fee > 0) {
            require(
                paymentToken.transfer(owner(), fee),
                "Fee payment failed"
            );
        }

        // Transfer NFT
        nftContract.transferFrom(address(this), offer.buyer, listing.tokenId);

        // Update listing and offer
        listing.isActive = false;
        offer.isActive = false;
        delete tokenListings[listing.tokenId];

        // Update stats
        marketStats.totalSales++;
        marketStats.totalVolume += amount;
        marketStats.averagePrice = marketStats.totalVolume / marketStats.totalSales;

        emit OfferAccepted(listingId, offer.buyer, amount);
        emit NFTSold(listingId, listing.seller, offer.buyer, listing.tokenId, amount);
    }

    /**
     * @notice Get all active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;

        // Count active listings
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].isActive) {
                activeCount++;
            }
        }

        // Create array
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].isActive) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }

    /**
     * @notice Get offers for listing
     */
    function getListingOffers(uint256 listingId)
        external
        view
        returns (Offer[] memory)
    {
        return listingOffers[listingId];
    }

    /**
     * @notice Update marketplace fee
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        marketplaceFee = newFee;
    }

    /**
     * @notice Emergency withdraw stuck NFTs (admin only)
     */
    function emergencyWithdrawNFT(uint256 tokenId) external onlyOwner {
        nftContract.transferFrom(address(this), owner(), tokenId);
    }
}
