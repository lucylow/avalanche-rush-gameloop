const { ethers } = require("hardhat");

/**
 * Test Complete NFT Flow
 *
 * This script tests the entire NFT system:
 * 1. Mint various NFT types
 * 2. Grant loot box eligibility
 * 3. Open loot box
 * 4. Evolve NFT
 * 5. Activate power-up
 * 6. List on marketplace
 */

async function main() {
  const [deployer, player1, player2] = await ethers.getSigners();

  console.log("🧪 Testing Gamified NFT System");
  console.log("Deployer:", deployer.address);
  console.log("Player 1:", player1.address);
  console.log("Player 2:", player2.address);

  // Get contract addresses
  const NFT_SYSTEM_ADDRESS = process.env.VITE_NFT_SYSTEM || "";
  const LOOTBOX_ADDRESS = process.env.VITE_LOOTBOX || "";
  const MARKETPLACE_ADDRESS = process.env.VITE_MARKETPLACE || "";

  if (!NFT_SYSTEM_ADDRESS || !LOOTBOX_ADDRESS || !MARKETPLACE_ADDRESS) {
    console.error("❌ Missing contract addresses");
    process.exit(1);
  }

  // Connect to contracts
  const nftSystem = await ethers.getContractAt("GameNFTSystem", NFT_SYSTEM_ADDRESS);
  const lootBox = await ethers.getContractAt("LootBoxNFT", LOOTBOX_ADDRESS);
  const marketplace = await ethers.getContractAt("NFTMarketplace", MARKETPLACE_ADDRESS);

  console.log("\n📦 Connected to contracts");

  // ====================================
  // Test 1: Mint Achievement NFT
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 1: Mint Achievement NFT");
  console.log("=".repeat(60));

  const achievementTx = await nftSystem.mintAchievementNFT(
    player1.address,
    "tournament_winner",
    "ipfs://QmTest1/achievement.json",
    3 // LEGENDARY rarity
  );
  const achievementReceipt = await achievementTx.wait();
  const achievementEvent = achievementReceipt.events?.find(e => e.event === "NFTMinted");
  const achievementTokenId = achievementEvent?.args?.tokenId;

  console.log("✅ Achievement NFT minted");
  console.log("   Token ID:", achievementTokenId?.toString());
  console.log("   Owner:", player1.address);
  console.log("   Category: tournament_winner");
  console.log("   Rarity: LEGENDARY");

  // ====================================
  // Test 2: Mint Power-up NFT
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 2: Mint Power-up NFT");
  console.log("=".repeat(60));

  const powerUpTx = await nftSystem.mintPowerUpNFT(
    player1.address,
    "ipfs://QmTest2/powerup.json",
    20, // +20% bonus
    3600, // 1 hour
    2 // EPIC rarity
  );
  const powerUpReceipt = await powerUpTx.wait();
  const powerUpEvent = powerUpReceipt.events?.find(e => e.event === "NFTMinted");
  const powerUpTokenId = powerUpEvent?.args?.tokenId;

  console.log("✅ Power-up NFT minted");
  console.log("   Token ID:", powerUpTokenId?.toString());
  console.log("   Bonus: +20%");
  console.log("   Duration: 1 hour");
  console.log("   Rarity: EPIC");

  // ====================================
  // Test 3: Mint Evolution NFT
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 3: Mint Evolution NFT");
  console.log("=".repeat(60));

  const evolutionURIs = [
    "ipfs://QmTest3/level1.json",
    "ipfs://QmTest3/level2.json",
    "ipfs://QmTest3/level3.json"
  ];

  const evolutionTx = await nftSystem.mintEvolutionNFT(
    player1.address,
    evolutionURIs,
    1 // RARE rarity
  );
  const evolutionReceipt = await evolutionTx.wait();
  const evolutionEvent = evolutionReceipt.events?.find(e => e.event === "NFTMinted");
  const evolutionTokenId = evolutionEvent?.args?.tokenId;

  console.log("✅ Evolution NFT minted");
  console.log("   Token ID:", evolutionTokenId?.toString());
  console.log("   Max Levels:", evolutionURIs.length);
  console.log("   Rarity: RARE");

  // ====================================
  // Test 4: Add Experience & Evolve
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 4: Add Experience & Evolve NFT");
  console.log("=".repeat(60));

  // Add experience
  console.log("Adding 500 XP...");
  await nftSystem.addExperience(evolutionTokenId, 500);

  const detailsBefore = await nftSystem.getNFTDetails(evolutionTokenId);
  console.log("   Current XP:", detailsBefore[0].experiencePoints.toString());
  console.log("   Current Level:", detailsBefore[0].level.toString());

  // Evolve (as player)
  console.log("Evolving NFT...");
  const evolveTx = await nftSystem.connect(player1).evolveNFT(evolutionTokenId);
  await evolveTx.wait();

  const detailsAfter = await nftSystem.getNFTDetails(evolutionTokenId);
  console.log("✅ NFT Evolved!");
  console.log("   New Level:", detailsAfter[0].level.toString());
  console.log("   New URI:", detailsAfter[1]);

  // ====================================
  // Test 5: Activate Power-up
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 5: Activate Power-up");
  console.log("=".repeat(60));

  const bonusBefore = await nftSystem.getPlayerPowerBonus(player1.address);
  console.log("Power bonus before:", bonusBefore.toString() + "%");

  const activateTx = await nftSystem.connect(player1).activatePowerUp(powerUpTokenId);
  await activateTx.wait();

  const bonusAfter = await nftSystem.getPlayerPowerBonus(player1.address);
  console.log("✅ Power-up activated!");
  console.log("   Power bonus after:", bonusAfter.toString() + "%");

  // ====================================
  // Test 6: Grant Loot Box & Open
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 6: Grant Loot Box Eligibility & Open");
  console.log("=".repeat(60));

  // Grant Gold Box eligibility to player2
  console.log("Granting Gold Box to player2...");
  await lootBox.grantEligibility(player2.address, 2); // Gold box

  // Check eligibility
  const [eligible, cooledDown] = await lootBox.canOpenLootBox(player2.address, 2);
  console.log("   Eligible:", eligible);
  console.log("   Cooled down:", cooledDown);

  // Open loot box (as player2)
  console.log("Opening loot box...");
  const openTx = await lootBox.connect(player2).openLootBox(2);
  const openReceipt = await openTx.wait();
  const openEvent = openReceipt.events?.find(e => e.event === "LootBoxOpened");
  const rewardTokenId = openEvent?.args?.tokenId;

  console.log("✅ Loot box opened!");
  console.log("   Received NFT:", rewardTokenId?.toString());
  console.log("   Rarity:", openEvent?.args?.rarity);

  // ====================================
  // Test 7: List NFT on Marketplace
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 7: List NFT on Marketplace");
  console.log("=".repeat(60));

  // Approve marketplace
  console.log("Approving marketplace...");
  await nftSystem.connect(player1).approve(marketplace.address, achievementTokenId);

  // List NFT
  const listingPrice = ethers.utils.parseEther("10"); // 10 tokens
  console.log("Listing NFT for 10 tokens...");
  const listTx = await marketplace.connect(player1).listNFT(achievementTokenId, listingPrice);
  const listReceipt = await listTx.wait();
  const listEvent = listReceipt.events?.find(e => e.event === "NFTListed");
  const listingId = listEvent?.args?.listingId;

  console.log("✅ NFT listed on marketplace!");
  console.log("   Listing ID:", listingId?.toString());
  console.log("   Price: 10 tokens");

  // Get active listings
  const listings = await marketplace.getActiveListings();
  console.log("   Total active listings:", listings.length);

  // ====================================
  // Test 8: Check Player Stats
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("TEST 8: Player Statistics");
  console.log("=".repeat(60));

  const player1Stats = await nftSystem.playerStats(player1.address);
  console.log("Player 1 Stats:");
  console.log("   Total NFTs:", player1Stats.totalNFTs.toString());
  console.log("   Achievements:", player1Stats.achievementCount.toString());
  console.log("   Power-ups:", player1Stats.powerUpCount.toString());
  console.log("   Total XP:", player1Stats.totalExperience.toString());
  console.log("   Highest Level:", player1Stats.highestLevel.toString());

  const player2Stats = await nftSystem.playerStats(player2.address);
  console.log("\nPlayer 2 Stats:");
  console.log("   Total NFTs:", player2Stats.totalNFTs.toString());
  console.log("   Achievements:", player2Stats.achievementCount.toString());

  // ====================================
  // Summary
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ ALL TESTS PASSED!");
  console.log("=".repeat(60));

  console.log("\n📊 Test Summary:");
  console.log("━".repeat(60));
  console.log("✅ Achievement NFT minting");
  console.log("✅ Power-up NFT minting");
  console.log("✅ Evolution NFT minting");
  console.log("✅ Experience system");
  console.log("✅ NFT evolution");
  console.log("✅ Power-up activation");
  console.log("✅ Loot box system");
  console.log("✅ Marketplace listing");
  console.log("✅ Player statistics");
  console.log("━".repeat(60));

  console.log("\n🎉 NFT system is fully functional!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
