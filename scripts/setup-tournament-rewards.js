const { ethers } = require("hardhat");

/**
 * Setup Tournament NFT Rewards
 *
 * This script configures NFT rewards for existing tournaments
 */

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("⚙️  Configuring Tournament NFT Rewards");
  console.log("Account:", deployer.address);

  // Get contract addresses from environment
  const TOURNAMENT_REWARDS_ADDRESS = process.env.VITE_TOURNAMENT_REWARDS || "";
  const SCORE_MANAGER_ADDRESS = process.env.VITE_GAMELOOP_CONTRACT || "";

  if (!TOURNAMENT_REWARDS_ADDRESS || !SCORE_MANAGER_ADDRESS) {
    console.error("❌ Missing contract addresses");
    console.log("Required: VITE_TOURNAMENT_REWARDS, VITE_GAMELOOP_CONTRACT");
    process.exit(1);
  }

  // Connect to contracts
  const tournamentRewards = await ethers.getContractAt(
    "TournamentNFTRewards",
    TOURNAMENT_REWARDS_ADDRESS
  );

  const scoreManager = await ethers.getContractAt(
    "GameLoopScoreManager",
    SCORE_MANAGER_ADDRESS
  );

  console.log("\n📊 Connected to contracts:");
  console.log("TournamentNFTRewards:", TOURNAMENT_REWARDS_ADDRESS);
  console.log("ScoreManager:", SCORE_MANAGER_ADDRESS);

  // ====================================
  // Get active tournaments
  // ====================================
  console.log("\n🏆 Fetching active tournaments...");
  const activeTournaments = await scoreManager.getActiveTournaments();
  console.log(`Found ${activeTournaments.length} active tournaments`);

  if (activeTournaments.length === 0) {
    console.log("⚠️  No active tournaments found");
    console.log("Create a tournament first using GameLoopScoreManager");
    process.exit(0);
  }

  // ====================================
  // Configure rewards for each tournament
  // ====================================
  console.log("\n⚙️  Configuring rewards for tournaments...");

  for (const tournament of activeTournaments) {
    const tournamentId = tournament.id.toNumber();
    console.log(`\n📋 Tournament #${tournamentId}: ${tournament.name}`);

    // Check if already configured
    const config = await tournamentRewards.tournamentRewards(tournamentId);
    if (config.enabled) {
      console.log("⚠️  Already configured, skipping...");
      continue;
    }

    // Configure based on tournament tier (you can customize this logic)
    let winner1Box, winner2Box, winner3Box, participationBox;

    // Example: Larger prize pool = better loot boxes
    const prizePool = ethers.utils.formatEther(tournament.prizePool);

    if (parseFloat(prizePool) >= 1000) {
      // High-tier tournament
      winner1Box = 4; // Mythic
      winner2Box = 3; // Diamond
      winner3Box = 2; // Gold
      participationBox = 1; // Silver
      console.log("🌟 High-tier rewards (Mythic/Diamond/Gold)");
    } else if (parseFloat(prizePool) >= 500) {
      // Mid-tier tournament
      winner1Box = 3; // Diamond
      winner2Box = 2; // Gold
      winner3Box = 1; // Silver
      participationBox = 0; // Bronze
      console.log("⭐ Mid-tier rewards (Diamond/Gold/Silver)");
    } else {
      // Standard tournament
      winner1Box = 2; // Gold
      winner2Box = 1; // Silver
      winner3Box = 0; // Bronze
      participationBox = 0; // Bronze
      console.log("✨ Standard rewards (Gold/Silver/Bronze)");
    }

    // Achievement URI (you can customize based on tournament)
    const achievementURI = `ipfs://QmTournament${tournamentId}/winner-badge.json`;

    // Configure rewards
    const tx = await tournamentRewards.configureTournamentRewards(
      tournamentId,
      winner1Box,
      winner2Box,
      winner3Box,
      participationBox,
      achievementURI,
      true // Auto-distribute
    );

    await tx.wait();
    console.log("✅ Configured successfully");
    console.log(`   1st Place: Loot Box ${winner1Box}`);
    console.log(`   2nd Place: Loot Box ${winner2Box}`);
    console.log(`   3rd Place: Loot Box ${winner3Box}`);
    console.log(`   Participation: Loot Box ${participationBox}`);
  }

  // ====================================
  // Summary
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ CONFIGURATION COMPLETE!");
  console.log("=".repeat(60));

  console.log("\n📋 Loot Box Tiers:");
  console.log("━".repeat(60));
  console.log("0: Bronze Chest   - Common/Rare items");
  console.log("1: Silver Chest   - Rare/Epic items");
  console.log("2: Gold Chest     - Epic/Legendary items");
  console.log("3: Diamond Chest  - Legendary/Mythic items");
  console.log("4: Mythic Vault   - Mythic items only");
  console.log("━".repeat(60));

  console.log("\n🎯 What happens next:");
  console.log("━".repeat(60));
  console.log("1. Tournament ends");
  console.log("2. Owner calls endTournament()");
  console.log("3. NFT rewards auto-distributed:");
  console.log("   - Winners receive achievement NFTs");
  console.log("   - Winners receive loot box eligibility");
  console.log("   - Participants receive participation boxes");
  console.log("4. Players open loot boxes to receive NFTs");
  console.log("━".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Configuration failed:", error);
    process.exit(1);
  });
