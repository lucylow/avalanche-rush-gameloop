const { ethers } = require("hardhat");

/**
 * Deploy Gamified NFT System
 *
 * Deployment order:
 * 1. GameNFTSystem
 * 2. LootBoxNFT
 * 3. NFTMarketplace
 * 4. TournamentNFTRewards
 */

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying Gamified NFT System with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Get existing contract addresses (update these as needed)
  const RUSH_TOKEN_ADDRESS = process.env.RUSH_TOKEN || "";
  const SCORE_MANAGER_ADDRESS = process.env.SCORE_MANAGER || "";

  if (!RUSH_TOKEN_ADDRESS || !SCORE_MANAGER_ADDRESS) {
    console.error("❌ Missing required contract addresses in .env");
    console.log("Required: RUSH_TOKEN, SCORE_MANAGER");
    process.exit(1);
  }

  // ====================================
  // 1. Deploy GameNFTSystem
  // ====================================
  console.log("\n📦 Deploying GameNFTSystem...");
  const GameNFTSystem = await ethers.getContractFactory("GameNFTSystem");
  const nftSystem = await GameNFTSystem.deploy();
  await nftSystem.deployed();
  console.log("✅ GameNFTSystem deployed to:", nftSystem.address);

  // ====================================
  // 2. Deploy LootBoxNFT
  // ====================================
  console.log("\n📦 Deploying LootBoxNFT...");
  const LootBoxNFT = await ethers.getContractFactory("LootBoxNFT");
  const lootBox = await LootBoxNFT.deploy(nftSystem.address);
  await lootBox.deployed();
  console.log("✅ LootBoxNFT deployed to:", lootBox.address);

  // ====================================
  // 3. Deploy NFTMarketplace
  // ====================================
  console.log("\n📦 Deploying NFTMarketplace...");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy(
    nftSystem.address,
    RUSH_TOKEN_ADDRESS
  );
  await marketplace.deployed();
  console.log("✅ NFTMarketplace deployed to:", marketplace.address);

  // ====================================
  // 4. Deploy TournamentNFTRewards
  // ====================================
  console.log("\n📦 Deploying TournamentNFTRewards...");
  const TournamentNFTRewards = await ethers.getContractFactory("TournamentNFTRewards");
  const tournamentRewards = await TournamentNFTRewards.deploy(
    SCORE_MANAGER_ADDRESS,
    nftSystem.address,
    lootBox.address
  );
  await tournamentRewards.deployed();
  console.log("✅ TournamentNFTRewards deployed to:", tournamentRewards.address);

  // ====================================
  // 5. Setup Access Control
  // ====================================
  console.log("\n🔐 Setting up access control...");

  // Grant MINTER_ROLE to LootBoxNFT
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  await nftSystem.grantRole(MINTER_ROLE, lootBox.address);
  console.log("✅ Granted MINTER_ROLE to LootBoxNFT");

  // Grant MINTER_ROLE to TournamentNFTRewards
  await nftSystem.grantRole(MINTER_ROLE, tournamentRewards.address);
  console.log("✅ Granted MINTER_ROLE to TournamentNFTRewards");

  // Grant GAME_ADMIN to TournamentNFTRewards
  const GAME_ADMIN = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("GAME_ADMIN"));
  await nftSystem.grantRole(GAME_ADMIN, tournamentRewards.address);
  console.log("✅ Granted GAME_ADMIN to TournamentNFTRewards");

  // Grant MINTER_ROLE to deployer (for testing)
  await nftSystem.grantRole(MINTER_ROLE, deployer.address);
  console.log("✅ Granted MINTER_ROLE to deployer");

  // ====================================
  // 6. Setup Loot Boxes
  // ====================================
  console.log("\n🎁 Setting up loot boxes...");

  // Create Bronze Loot Box
  console.log("Creating Bronze Loot Box...");
  const bronzeTx = await lootBox.createLootBox(
    "Bronze Chest",
    0, // BRONZE tier
    300 // 5 minute cooldown
  );
  await bronzeTx.wait();
  console.log("✅ Bronze Chest created (ID: 0)");

  // Create Silver Loot Box
  console.log("Creating Silver Loot Box...");
  const silverTx = await lootBox.createLootBox(
    "Silver Chest",
    1, // SILVER tier
    900 // 15 minute cooldown
  );
  await silverTx.wait();
  console.log("✅ Silver Chest created (ID: 1)");

  // Create Gold Loot Box
  console.log("Creating Gold Loot Box...");
  const goldTx = await lootBox.createLootBox(
    "Gold Chest",
    2, // GOLD tier
    1800 // 30 minute cooldown
  );
  await goldTx.wait();
  console.log("✅ Gold Chest created (ID: 2)");

  // Create Diamond Loot Box
  console.log("Creating Diamond Loot Box...");
  const diamondTx = await lootBox.createLootBox(
    "Diamond Chest",
    3, // DIAMOND tier
    3600 // 1 hour cooldown
  );
  await diamondTx.wait();
  console.log("✅ Diamond Chest created (ID: 3)");

  // Create Mythic Loot Box
  console.log("Creating Mythic Vault...");
  const mythicTx = await lootBox.createLootBox(
    "Mythic Vault",
    4, // MYTHIC tier
    7200 // 2 hour cooldown
  );
  await mythicTx.wait();
  console.log("✅ Mythic Vault created (ID: 4)");

  // ====================================
  // 7. Add Sample Reward Pools
  // ====================================
  console.log("\n🎯 Adding reward pools to loot boxes...");

  // Gold Box - Epic Power-up (30% chance)
  await lootBox.addRewardPool(
    2, // Gold box
    1, // POWERUP type
    2, // EPIC rarity
    30, // 30% weight
    ["ipfs://QmExample1/epic-powerup"],
    15, // +15% bonus
    3600 // 1 hour duration
  );
  console.log("✅ Added Epic power-up to Gold Chest");

  // Gold Box - Rare Achievement (50% chance)
  await lootBox.addRewardPool(
    2, // Gold box
    0, // ACHIEVEMENT type
    1, // RARE rarity
    50,
    ["ipfs://QmExample2/rare-achievement"],
    0,
    0
  );
  console.log("✅ Added Rare achievement to Gold Chest");

  // Diamond Box - Legendary Achievement (60% chance)
  await lootBox.addRewardPool(
    3, // Diamond box
    0, // ACHIEVEMENT type
    3, // LEGENDARY rarity
    60,
    ["ipfs://QmExample3/legendary-achievement"],
    0,
    0
  );
  console.log("✅ Added Legendary achievement to Diamond Chest");

  // Diamond Box - Epic Power-up (40% chance)
  await lootBox.addRewardPool(
    3, // Diamond box
    1, // POWERUP type
    2, // EPIC rarity
    40,
    ["ipfs://QmExample4/epic-powerup-2"],
    20, // +20% bonus
    7200 // 2 hour duration
  );
  console.log("✅ Added Epic power-up to Diamond Chest");

  // ====================================
  // 8. Summary
  // ====================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployed Contracts:");
  console.log("━".repeat(60));
  console.log(`GameNFTSystem:          ${nftSystem.address}`);
  console.log(`LootBoxNFT:             ${lootBox.address}`);
  console.log(`NFTMarketplace:         ${marketplace.address}`);
  console.log(`TournamentNFTRewards:   ${tournamentRewards.address}`);
  console.log("━".repeat(60));

  console.log("\n📝 Update your .env file with:");
  console.log("━".repeat(60));
  console.log(`VITE_NFT_SYSTEM=${nftSystem.address}`);
  console.log(`VITE_LOOTBOX=${lootBox.address}`);
  console.log(`VITE_MARKETPLACE=${marketplace.address}`);
  console.log(`VITE_TOURNAMENT_REWARDS=${tournamentRewards.address}`);
  console.log("━".repeat(60));

  console.log("\n✅ Loot Boxes Created:");
  console.log("━".repeat(60));
  console.log("ID 0: Bronze Chest   (5 min cooldown)");
  console.log("ID 1: Silver Chest   (15 min cooldown)");
  console.log("ID 2: Gold Chest     (30 min cooldown)");
  console.log("ID 3: Diamond Chest  (1 hour cooldown)");
  console.log("ID 4: Mythic Vault   (2 hour cooldown)");
  console.log("━".repeat(60));

  console.log("\n🔑 Access Control Setup:");
  console.log("━".repeat(60));
  console.log("✅ LootBoxNFT has MINTER_ROLE");
  console.log("✅ TournamentNFTRewards has MINTER_ROLE");
  console.log("✅ TournamentNFTRewards has GAME_ADMIN");
  console.log("✅ Deployer has MINTER_ROLE (for testing)");
  console.log("━".repeat(60));

  console.log("\n🚀 Next Steps:");
  console.log("━".repeat(60));
  console.log("1. Update .env file with contract addresses");
  console.log("2. Upload NFT metadata to IPFS");
  console.log("3. Update reward pool URIs");
  console.log("4. Configure tournament rewards");
  console.log("5. Test complete flow on testnet");
  console.log("6. Verify contracts on SnowTrace");
  console.log("━".repeat(60));

  // ====================================
  // 9. Verification Commands
  // ====================================
  console.log("\n📜 Verification Commands:");
  console.log("━".repeat(60));
  console.log(`npx hardhat verify --network avalanche ${nftSystem.address}`);
  console.log(`npx hardhat verify --network avalanche ${lootBox.address} ${nftSystem.address}`);
  console.log(`npx hardhat verify --network avalanche ${marketplace.address} ${nftSystem.address} ${RUSH_TOKEN_ADDRESS}`);
  console.log(`npx hardhat verify --network avalanche ${tournamentRewards.address} ${SCORE_MANAGER_ADDRESS} ${nftSystem.address} ${lootBox.address}`);
  console.log("━".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
