# 🎮 Gamified NFT System - Complete Integration Guide

## Overview

This gamified NFT system provides a comprehensive reward and progression mechanism for Avalanche Rush, featuring:

- **Achievement NFTs** - Tournament victories and milestone rewards
- **Power-up NFTs** - Temporary gameplay bonuses
- **Evolution NFTs** - Upgradeable character NFTs with experience points
- **Loot Box System** - Mystery rewards with weighted probabilities
- **NFT Marketplace** - P2P trading platform for game assets

---

## 📁 File Structure

```
contracts/
├── GameNFTSystem.sol           # Core NFT minting and management
├── LootBoxNFT.sol              # Loot box mechanics and rewards
├── NFTMarketplace.sol          # Trading marketplace
└── TournamentNFTRewards.sol    # Automated tournament rewards

src/
├── hooks/
│   └── useNFTSystem.ts         # React hook for NFT interactions
└── components/
    └── nft/
        ├── NFTGallery.tsx      # NFT collection display
        └── LootBoxSystem.tsx   # Loot box interface
```

---

## 🔧 Smart Contract Deployment

### 1. Deploy Core Contracts

```bash
# Deploy in this order:

# 1. Deploy GameNFTSystem
npx hardhat run scripts/deploy-nft-system.js --network avalanche

# 2. Deploy LootBoxNFT (requires GameNFTSystem address)
npx hardhat run scripts/deploy-lootbox.js --network avalanche

# 3. Deploy NFTMarketplace (requires GameNFTSystem and RushToken addresses)
npx hardhat run scripts/deploy-marketplace.js --network avalanche

# 4. Deploy TournamentNFTRewards (requires all above addresses)
npx hardhat run scripts/deploy-tournament-rewards.js --network avalanche
```

### 2. Configure Contract Addresses

Update your `.env` file:

```env
VITE_NFT_SYSTEM=0x...
VITE_LOOTBOX=0x...
VITE_MARKETPLACE=0x...
VITE_TOURNAMENT_REWARDS=0x...
VITE_RUSH_TOKEN=0x...
VITE_GAMELOOP_CONTRACT=0x...
```

---

## 🎯 Contract Integration

### GameNFTSystem.sol

**Core Features:**
- Mint 5 types of NFTs (Achievement, PowerUp, Evolution, LootBox, Special)
- 5 rarity tiers (Common → Mythic)
- Experience system for Evolution NFTs
- Power bonus tracking for active power-ups
- Role-based access control

**Key Functions:**

```solidity
// Mint achievement NFT
function mintAchievementNFT(
    address player,
    string memory category,
    string memory tokenURI,
    Rarity rarity
) external onlyRole(MINTER_ROLE) returns (uint256)

// Mint power-up NFT
function mintPowerUpNFT(
    address player,
    string memory tokenURI,
    uint256 powerBonus,        // Percentage (e.g., 10 = +10%)
    uint256 durationSeconds,
    Rarity rarity
) external onlyRole(MINTER_ROLE) returns (uint256)

// Mint evolution NFT with multiple level URIs
function mintEvolutionNFT(
    address player,
    string[] memory uris,      // Different URI per level
    Rarity rarity
) external onlyRole(MINTER_ROLE) returns (uint256)

// Evolve NFT to next level
function evolveNFT(uint256 tokenId) external

// Activate power-up
function activatePowerUp(uint256 tokenId) external

// Award experience (game admin only)
function addExperience(uint256 tokenId, uint256 amount) external onlyRole(GAME_ADMIN)
```

---

### LootBoxNFT.sol

**Core Features:**
- Multiple loot box tiers (Bronze → Mythic)
- Weighted random reward pools
- Cooldown system
- Eligibility tracking

**Key Functions:**

```solidity
// Create loot box tier
function createLootBox(
    string memory name,
    LootBoxTier tier,
    uint256 cooldownSeconds
) external onlyOwner returns (uint256)

// Add reward pool to loot box
function addRewardPool(
    uint256 lootBoxId,
    GameNFTSystem.NFTType nftType,
    GameNFTSystem.Rarity rarity,
    uint256 weight,                 // Probability weight
    string[] memory uris,
    uint256 powerBonus,
    uint256 durationSeconds
) external onlyOwner

// Grant eligibility (e.g., tournament reward)
function grantEligibility(address player, uint256 lootBoxId) external onlyOwner

// Open loot box
function openLootBox(uint256 lootBoxId) external returns (uint256)
```

**Setup Example:**

```javascript
// Create Gold Loot Box
const goldBoxId = await lootBox.createLootBox(
  "Gold Chest",
  2, // GOLD tier
  1800 // 30 min cooldown
);

// Add Epic power-up to reward pool (30% chance)
await lootBox.addRewardPool(
  goldBoxId,
  1, // POWERUP type
  2, // EPIC rarity
  30, // 30% weight
  ["ipfs://epic-powerup-1", "ipfs://epic-powerup-2"],
  15, // +15% bonus
  3600 // 1 hour duration
);

// Add Rare achievement (50% chance)
await lootBox.addRewardPool(
  goldBoxId,
  0, // ACHIEVEMENT type
  1, // RARE rarity
  50,
  ["ipfs://achievement-uri"],
  0,
  0
);
```

---

### TournamentNFTRewards.sol

**Core Features:**
- Automated tournament reward distribution
- Configurable rewards per tournament
- Achievement minting for winners
- Experience point awards

**Key Functions:**

```solidity
// Configure tournament rewards
function configureTournamentRewards(
    uint256 tournamentId,
    uint256 winner1LootBoxId,
    uint256 winner2LootBoxId,
    uint256 winner3LootBoxId,
    uint256 participationLootBoxId,
    string memory achievementURI,
    bool autoDistribute
) external onlyOwner

// Distribute rewards after tournament ends
function distributeTournamentRewards(uint256 tournamentId) external onlyOwner

// Players can claim if not auto-distributed
function claimTournamentRewards(uint256 tournamentId) external
```

**Integration with GameLoopScoreManager:**

```javascript
// After creating tournament
const tournamentId = 1;

// Configure NFT rewards
await tournamentRewards.configureTournamentRewards(
  tournamentId,
  3, // Diamond box for 1st place
  2, // Gold box for 2nd place
  1, // Silver box for 3rd place
  0, // Bronze box for all participants
  "ipfs://tournament-1-winner-badge",
  true // Auto-distribute on tournament end
);

// After tournament ends (called by owner)
await scoreManager.endTournament(tournamentId);
await tournamentRewards.distributeTournamentRewards(tournamentId);
```

---

## 💻 Frontend Integration

### Using the NFT Hook

```typescript
import { useNFTSystem } from '@/hooks/useNFTSystem';

function MyComponent() {
  const {
    playerNFTs,        // Array of owned NFTs
    playerStats,       // Total stats
    powerBonus,        // Active power bonus
    isLoading,
    evolveNFT,
    activatePowerUp,
    openLootBox
  } = useNFTSystem();

  // Evolve NFT
  const handleEvolve = async (tokenId: number) => {
    await evolveNFT(tokenId);
  };

  // Activate power-up
  const handleActivate = async (tokenId: number) => {
    await activatePowerUp(tokenId);
  };

  // Open loot box
  const handleOpen = async (lootBoxId: number) => {
    const { tx, tokenId } = await openLootBox(lootBoxId);
    console.log('Received NFT:', tokenId);
  };
}
```

---

## 🎨 NFT Metadata Structure

### Achievement NFT

```json
{
  "name": "Tournament Champion",
  "description": "Winner of Avalanche Rush Tournament #1",
  "image": "ipfs://QmXxx.../champion.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Achievement"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Tournament",
      "value": "1"
    },
    {
      "trait_type": "Date",
      "value": "2025-10-05"
    }
  ]
}
```

### Power-up NFT

```json
{
  "name": "Speed Boost",
  "description": "+15% speed for 1 hour",
  "image": "ipfs://QmYyy.../speed-boost.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Power-up"
    },
    {
      "trait_type": "Rarity",
      "value": "Epic"
    },
    {
      "trait_type": "Bonus",
      "value": "15"
    },
    {
      "trait_type": "Duration",
      "value": "3600"
    }
  ]
}
```

### Evolution NFT (Level 1)

```json
{
  "name": "Avalanche Rider - Level 1",
  "description": "Your evolving character",
  "image": "ipfs://QmZzz.../rider-level-1.png",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Evolution"
    },
    {
      "trait_type": "Rarity",
      "value": "Rare"
    },
    {
      "trait_type": "Level",
      "value": "1"
    }
  ]
}
```

---

## 🎮 Gameplay Integration

### 1. Award Tournament Winners

After tournament ends, automatically distribute NFT rewards:

```javascript
// In your game backend/admin script
async function endTournamentWithRewards(tournamentId) {
  // End tournament in score manager
  await scoreManager.endTournament(tournamentId);

  // Distribute NFT rewards
  await tournamentRewards.distributeTournamentRewards(tournamentId);
}
```

### 2. Apply Power Bonuses to Gameplay

In your game loop, apply active power bonuses:

```typescript
// In game logic
const applyPlayerBonuses = async (playerAddress: string) => {
  const { powerBonus } = useNFTSystem();

  // Apply bonus to game mechanics
  const baseScore = calculateScore();
  const finalScore = baseScore * (1 + powerBonus / 100);

  return finalScore;
};
```

### 3. Award Experience for Gameplay

Grant XP to Evolution NFTs based on performance:

```javascript
// After each game
async function awardGameplayExperience(playerAddress, score) {
  // Calculate XP based on score
  const experiencePoints = Math.floor(score / 100);

  // Award to player's evolution NFTs
  await tournamentRewards.awardExperiencePoints(
    tournamentId,
    playerAddress,
    experiencePoints
  );
}
```

---

## 🏪 NFT Marketplace Usage

### List NFT for Sale

```typescript
import { useNFTSystem } from '@/hooks/useNFTSystem';

function ListNFTButton({ tokenId }: { tokenId: number }) {
  const { listNFTForSale } = useNFTSystem();

  const handleList = async () => {
    await listNFTForSale(tokenId, "10.0"); // 10 RUSH tokens
  };

  return <button onClick={handleList}>List for Sale</button>;
}
```

### Buy NFT

```typescript
function BuyNFTButton({ listingId, price }: { listingId: number, price: string }) {
  const { buyNFT } = useNFTSystem();

  const handleBuy = async () => {
    await buyNFT(listingId, price);
  };

  return <button onClick={handleBuy}>Buy for {price} RUSH</button>;
}
```

---

## 📊 Analytics & Tracking

### Track Player Engagement

```solidity
// Get player NFT stats
PlayerStats memory stats = nftSystem.playerStats(playerAddress);

console.log("Total NFTs:", stats.totalNFTs);
console.log("Achievements:", stats.achievementCount);
console.log("Total XP:", stats.totalExperience);
console.log("Highest Level:", stats.highestLevel);
```

### Market Statistics

```javascript
const marketStats = await marketplace.marketStats();

console.log("Total Sales:", marketStats.totalSales);
console.log("Total Volume:", ethers.utils.formatEther(marketStats.totalVolume));
console.log("Average Price:", ethers.utils.formatEther(marketStats.averagePrice));
```

---

## 🔐 Security Considerations

1. **Access Control**: Use OpenZeppelin's AccessControl for role-based permissions
2. **Reentrancy Protection**: All state-changing functions use ReentrancyGuard
3. **Randomness**: For production, replace pseudo-random with Chainlink VRF
4. **Approval Checks**: NFT transfers require explicit approval
5. **Cooldown Enforcement**: Prevent spam and exploitation

---

## 🚀 Deployment Checklist

- [ ] Deploy GameNFTSystem contract
- [ ] Grant MINTER_ROLE to LootBoxNFT contract
- [ ] Grant GAME_ADMIN to TournamentNFTRewards contract
- [ ] Deploy LootBoxNFT with GameNFTSystem address
- [ ] Create loot box tiers (Bronze → Mythic)
- [ ] Add reward pools to each loot box
- [ ] Deploy NFTMarketplace
- [ ] Deploy TournamentNFTRewards
- [ ] Configure tournament reward settings
- [ ] Update frontend environment variables
- [ ] Upload NFT metadata to IPFS
- [ ] Test complete flow on testnet

---

## 📚 Example Tournament Flow

```javascript
// 1. Create tournament
const tournamentId = await scoreManager.createTournament(
  "Weekly Rush",
  startTime,
  endTime,
  prizePool,
  entryFee,
  maxPlayers
);

// 2. Configure NFT rewards
await tournamentRewards.configureTournamentRewards(
  tournamentId,
  3, // Diamond box
  2, // Gold box
  1, // Silver box
  0, // Bronze box
  "ipfs://tournament-badge-uri",
  true
);

// 3. Players register and play
await scoreManager.registerForTournament(tournamentId);
await scoreManager.submitScore(tournamentId, playerScore);

// 4. Tournament ends
await scoreManager.endTournament(tournamentId);
await tournamentRewards.distributeTournamentRewards(tournamentId);

// 5. Winners receive:
//    - Achievement NFT badge
//    - Loot box eligibility
//    - Tournament rewards from score manager

// 6. Winners open loot boxes
await lootBox.openLootBox(lootBoxId);
```

---

## 🎨 UI Components

### NFTGallery Component

Displays player's NFT collection with:
- Tabbed interface by NFT type
- Rarity badges
- Level and XP progress bars
- Evolve/Activate buttons
- Player statistics overview

### LootBoxSystem Component

Shows available loot boxes with:
- Tier-based styling
- Drop rate visualization
- Eligibility status
- Cooldown timers
- Opening animations

---

## 🔄 Future Enhancements

1. **NFT Crafting**: Combine multiple NFTs to create rare items
2. **Staking**: Lock NFTs for passive rewards
3. **Seasonal Events**: Limited-time exclusive NFTs
4. **Cross-Game Utility**: Use NFTs across multiple games
5. **Dynamic NFTs**: Metadata updates based on achievements
6. **Social Features**: NFT gifting and trading
7. **Rental System**: Temporary NFT loans for new players

---

## 📞 Support & Resources

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Avalanche Documentation](https://docs.avax.network/)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [IPFS Documentation](https://docs.ipfs.tech/)

---

**Built with ❄️ for Avalanche Rush**
