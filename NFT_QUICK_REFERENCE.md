# 🎮 NFT System Quick Reference

## Contract Addresses (Update After Deployment)

```env
VITE_NFT_SYSTEM=0x...
VITE_LOOTBOX=0x...
VITE_MARKETPLACE=0x...
VITE_TOURNAMENT_REWARDS=0x...
```

---

## 🚀 Common Operations

### Mint Achievement NFT

```javascript
await nftSystem.mintAchievementNFT(
  playerAddress,
  "tournament_winner",
  "ipfs://achievement-uri",
  3 // LEGENDARY
);
```

### Mint Power-up NFT

```javascript
await nftSystem.mintPowerUpNFT(
  playerAddress,
  "ipfs://powerup-uri",
  20,    // +20% bonus
  3600,  // 1 hour duration
  2      // EPIC
);
```

### Grant Loot Box

```javascript
await lootBox.grantEligibility(playerAddress, 3); // Diamond box
```

### Open Loot Box

```javascript
const tx = await lootBox.openLootBox(boxId);
const receipt = await tx.wait();
const tokenId = receipt.events[0].args.tokenId;
```

### Evolve NFT

```javascript
// Add XP
await nftSystem.addExperience(tokenId, 500);

// Player evolves
await nftSystem.connect(player).evolveNFT(tokenId);
```

### Activate Power-up

```javascript
await nftSystem.connect(player).activatePowerUp(tokenId);
```

### List on Marketplace

```javascript
// Approve
await nftSystem.connect(player).approve(marketplaceAddress, tokenId);

// List
await marketplace.connect(player).listNFT(
  tokenId,
  ethers.utils.parseEther("10.0")
);
```

---

## 📊 Data Queries

### Get Player NFTs

```javascript
const tokenIds = await nftSystem.getPlayerNFTs(playerAddress);
```

### Get NFT Details

```javascript
const [metadata, uri] = await nftSystem.getNFTDetails(tokenId);
console.log('Level:', metadata.level);
console.log('XP:', metadata.experiencePoints);
console.log('Rarity:', metadata.rarity);
```

### Get Player Stats

```javascript
const stats = await nftSystem.playerStats(playerAddress);
console.log('Total NFTs:', stats.totalNFTs);
console.log('Achievements:', stats.achievementCount);
```

### Get Power Bonus

```javascript
const bonus = await nftSystem.getPlayerPowerBonus(playerAddress);
console.log('Active bonus: +' + bonus + '%');
```

### Check Loot Box Eligibility

```javascript
const [eligible, cooledDown] = await lootBox.canOpenLootBox(
  playerAddress,
  boxId
);
```

### Get Marketplace Listings

```javascript
const listings = await marketplace.getActiveListings();
```

---

## 🎯 Loot Box IDs

| ID | Name | Tier | Cooldown | Rarity Range |
|----|------|------|----------|--------------|
| 0 | Bronze Chest | Bronze | 5 min | Common-Rare |
| 1 | Silver Chest | Silver | 15 min | Rare-Epic |
| 2 | Gold Chest | Gold | 30 min | Epic-Legendary |
| 3 | Diamond Chest | Diamond | 1 hour | Legendary-Mythic |
| 4 | Mythic Vault | Mythic | 2 hours | Legendary-Mythic |

---

## 🏆 NFT Types

| Type | ID | Purpose | Examples |
|------|-----|---------|----------|
| Achievement | 0 | Permanent badges | Tournament wins |
| PowerUp | 1 | Temporary bonuses | Speed boost |
| Evolution | 2 | Upgradeable NFTs | Characters |
| LootBox | 3 | Mystery rewards | - |
| Special | 4 | Limited editions | Event exclusives |

---

## 💎 Rarity Tiers

| Rarity | ID | Drop Rate* |
|--------|-----|-----------|
| Common | 0 | 50-70% |
| Rare | 1 | 20-35% |
| Epic | 2 | 10-20% |
| Legendary | 3 | 5-15% |
| Mythic | 4 | 1-10% |

*Varies by loot box tier

---

## 🔑 Access Roles

```javascript
// Grant MINTER_ROLE
const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
await nftSystem.grantRole(MINTER_ROLE, address);

// Grant GAME_ADMIN
const GAME_ADMIN = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("GAME_ADMIN"));
await nftSystem.grantRole(GAME_ADMIN, address);
```

---

## 🎮 Tournament Integration

### Configure Tournament Rewards

```javascript
await tournamentRewards.configureTournamentRewards(
  tournamentId,
  4, // 1st: Mythic box
  3, // 2nd: Diamond box
  2, // 3rd: Gold box
  0, // Participation: Bronze box
  "ipfs://achievement-uri",
  true // Auto-distribute
);
```

### Distribute Rewards

```javascript
// After tournament ends
await scoreManager.endTournament(tournamentId);
await tournamentRewards.distributeTournamentRewards(tournamentId);
```

### Award Experience

```javascript
await tournamentRewards.awardExperiencePoints(
  tournamentId,
  playerAddress,
  1000 // XP amount
);
```

---

## 📱 Frontend Integration

### React Hook Usage

```typescript
import { useNFTSystem } from '@/hooks/useNFTSystem';

function Component() {
  const {
    playerNFTs,
    playerStats,
    powerBonus,
    evolveNFT,
    activatePowerUp,
    openLootBox
  } = useNFTSystem();

  return (
    <div>
      <p>Power Bonus: +{powerBonus}%</p>
      <p>Total NFTs: {playerStats?.totalNFTs}</p>
    </div>
  );
}
```

### Display NFT Gallery

```typescript
import { NFTGallery } from '@/components/nft/NFTGallery';

<NFTGallery />
```

### Display Loot Boxes

```typescript
import { LootBoxSystem } from '@/components/nft/LootBoxSystem';

<LootBoxSystem />
```

---

## 🧮 XP Calculations

**Required XP for level N:**
```
XP = N × 100 × (N + 1) / 2
```

| Level | Required XP | Total XP |
|-------|-------------|----------|
| 1 | 0 | 0 |
| 2 | 300 | 300 |
| 3 | 600 | 900 |
| 4 | 1000 | 1900 |
| 5 | 1500 | 3400 |
| 10 | 5500 | 27500 |

---

## 💰 Marketplace Operations

### Update Listing Price

```javascript
await marketplace.connect(seller).updatePrice(listingId, newPrice);
```

### Cancel Listing

```javascript
await marketplace.connect(seller).cancelListing(listingId);
```

### Make Offer

```javascript
// Approve tokens first
await rushToken.connect(buyer).approve(marketplaceAddress, offerAmount);

// Make offer
await marketplace.connect(buyer).makeOffer(
  listingId,
  offerAmount,
  86400 // 1 day duration
);
```

### Accept Offer

```javascript
await marketplace.connect(seller).acceptOffer(listingId, offerIndex);
```

### Get Market Stats

```javascript
const stats = await marketplace.marketStats();
console.log('Total Sales:', stats.totalSales);
console.log('Total Volume:', ethers.utils.formatEther(stats.totalVolume));
```

---

## 🎨 Metadata Template

### Achievement NFT

```json
{
  "name": "Tournament Champion",
  "description": "Winner of Tournament #1",
  "image": "ipfs://QmXxx.../image.png",
  "attributes": [
    { "trait_type": "Type", "value": "Achievement" },
    { "trait_type": "Rarity", "value": "Legendary" },
    { "trait_type": "Tournament", "value": "1" }
  ]
}
```

### Power-up NFT

```json
{
  "name": "Speed Boost",
  "description": "+20% speed for 1 hour",
  "image": "ipfs://QmYyy.../boost.png",
  "attributes": [
    { "trait_type": "Type", "value": "Power-up" },
    { "trait_type": "Bonus", "value": "20" },
    { "trait_type": "Duration", "value": "3600" }
  ]
}
```

---

## 🔧 Deployment Commands

```bash
# Deploy all contracts
npx hardhat run scripts/deploy-gamified-nfts.js --network avalanche

# Setup tournament rewards
npx hardhat run scripts/setup-tournament-rewards.js --network avalanche

# Test complete flow
npx hardhat run scripts/test-nft-flow.js --network avalanche

# Verify contract
npx hardhat verify --network avalanche CONTRACT_ADDRESS
```

---

## ⚠️ Common Errors & Solutions

### "Already awarded"
**Cause:** Player already has this achievement
**Solution:** Check `hasAchievement[player][category]` before minting

### "Cooldown active"
**Cause:** Player opened box recently
**Solution:** Check `canOpenLootBox()` before allowing

### "Not token owner"
**Cause:** User doesn't own the NFT
**Solution:** Verify ownership with `ownerOf(tokenId)`

### "Insufficient experience"
**Cause:** Not enough XP to evolve
**Solution:** Check XP threshold before evolution

### "Not eligible"
**Cause:** Player not granted loot box access
**Solution:** Call `grantEligibility()` first

---

## 📞 Event Signatures

```javascript
// Listen for NFT mints
nftSystem.on("NFTMinted", (player, tokenId, nftType, rarity, category) => {
  console.log(`Player ${player} received NFT #${tokenId}`);
});

// Listen for loot box opens
lootBox.on("LootBoxOpened", (player, lootBoxId, tokenId, rarity) => {
  console.log(`Player opened box ${lootBoxId}, received NFT #${tokenId}`);
});

// Listen for marketplace sales
marketplace.on("NFTSold", (listingId, seller, buyer, tokenId, price) => {
  console.log(`NFT #${tokenId} sold for ${ethers.utils.formatEther(price)}`);
});
```

---

## 🎯 Pro Tips

1. **Batch operations** to save gas
2. **Cache NFT data** on frontend
3. **Use events** for real-time updates
4. **Test on Fuji** before mainnet
5. **Upload to IPFS** for metadata
6. **Monitor gas prices** on Avalanche
7. **Set realistic cooldowns** to prevent spam
8. **Track player engagement** metrics

---

**Quick Links:**
- [Full Guide](GAMIFIED_NFT_GUIDE.md)
- [Implementation Summary](NFT_IMPLEMENTATION_SUMMARY.md)
- [Contract Source](contracts/)
- [Frontend Components](src/components/nft/)
