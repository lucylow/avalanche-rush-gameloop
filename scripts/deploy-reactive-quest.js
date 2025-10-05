const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Avalanche Rush Reactive Quest Deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deployment configuration
  const REACTIVE_NETWORK_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual Reactive Network address
  const SUBSCRIPTION_ID = 1; // Replace with your Reactive Network subscription ID
  const NFT_NAME = "Avalanche Rush Achievements";
  const NFT_SYMBOL = "AVAXACH";
  const BASE_TOKEN_URI = "https://api.avalanche-rush.com/metadata/"; // Replace with your metadata endpoint

  try {
    // Step 1: Deploy AchievementNFT contract
    console.log("📦 Deploying AchievementNFT contract...");
    const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await AchievementNFT.deploy(
      NFT_NAME,
      NFT_SYMBOL,
      BASE_TOKEN_URI
    );
    await achievementNFT.waitForDeployment();
    const achievementNFTAddress = await achievementNFT.getAddress();
    
    console.log("✅ AchievementNFT deployed to:", achievementNFTAddress);

    // Step 2: Deploy ReactiveBountySystem contract
    console.log("\n📦 Deploying ReactiveBountySystem contract...");
    const ReactiveBountySystem = await ethers.getContractFactory("ReactiveBountySystem");
    const bountySystem = await ReactiveBountySystem.deploy();
    await bountySystem.waitForDeployment();
    const bountySystemAddress = await bountySystem.getAddress();
    
    console.log("✅ ReactiveBountySystem deployed to:", bountySystemAddress);

    // Step 3: Deploy SimplifiedQuestEngine contract
    console.log("\n📦 Deploying SimplifiedQuestEngine contract...");
    const SimplifiedQuestEngine = await ethers.getContractFactory("SimplifiedQuestEngine");
    const questEngine = await SimplifiedQuestEngine.deploy(
      REACTIVE_NETWORK_ADDRESS,
      SUBSCRIPTION_ID,
      achievementNFTAddress,
      bountySystemAddress
    );
    await questEngine.waitForDeployment();
    const questEngineAddress = await questEngine.getAddress();
    
    console.log("✅ SimplifiedQuestEngine deployed to:", questEngineAddress);

    // Step 4: Configure contracts
    console.log("\n🔧 Configuring contracts...");
    
    // Transfer ownership of AchievementNFT to QuestEngine
    const transferNFTTx = await achievementNFT.transferOwnership(questEngineAddress);
    await transferNFTTx.wait();
    console.log("✅ AchievementNFT ownership transferred to QuestEngine");
    
    // Set quest engine in bounty system
    const setQuestEngineTx = await bountySystem.setQuestEngine(questEngineAddress);
    await setQuestEngineTx.wait();
    console.log("✅ QuestEngine configured in BountySystem");

    // Step 5: Verify contracts (optional - requires verification setup)
    console.log("\n🔍 Contract verification (manual step required):");
    console.log(`Run: npx hardhat verify --network avalanche ${achievementNFTAddress} "${NFT_NAME}" "${NFT_SYMBOL}" "${BASE_TOKEN_URI}"`);
    console.log(`Run: npx hardhat verify --network avalanche ${bountySystemAddress}`);
    console.log(`Run: npx hardhat verify --network avalanche ${questEngineAddress} "${REACTIVE_NETWORK_ADDRESS}" ${SUBSCRIPTION_ID} "${achievementNFTAddress}" "${bountySystemAddress}"`);

    // Step 6: Save deployment info
    const deploymentInfo = {
      network: "avalanche",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        AchievementNFT: {
          address: achievementNFTAddress,
          name: NFT_NAME,
          symbol: NFT_SYMBOL,
          baseURI: BASE_TOKEN_URI
        },
        ReactiveBountySystem: {
          address: bountySystemAddress
        },
        SimplifiedQuestEngine: {
          address: questEngineAddress,
          reactiveNetwork: REACTIVE_NETWORK_ADDRESS,
          subscriptionId: SUBSCRIPTION_ID,
          achievementNFT: achievementNFTAddress,
          bountySystem: bountySystemAddress
        }
      }
    };

    // Save to file
    const deploymentPath = path.join(__dirname, "..", "deployments", "reactive-quest-deployment.json");
    fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n📄 Deployment info saved to:", deploymentPath);

    // Step 7: Display summary
    console.log("\n🎉 Deployment Summary:");
    console.log("=" * 50);
    console.log(`AchievementNFT:     ${achievementNFTAddress}`);
    console.log(`ReactiveBountySystem: ${bountySystemAddress}`);
    console.log(`QuestEngine:        ${questEngineAddress}`);
    console.log(`Network:           Avalanche Mainnet`);
    console.log(`Deployer:          ${deployer.address}`);
    console.log("=" * 50);

    // Step 8: Next steps
    console.log("\n📋 Next Steps:");
    console.log("1. Update contract addresses in the frontend");
    console.log("2. Configure Reactive Network subscription");
    console.log("3. Set up metadata server for NFT images");
    console.log("4. Test the quest completion flow");
    console.log("5. Deploy to production and update DNS");

    console.log("\n🔗 Frontend Configuration:");
    console.log(`Update these addresses in src/pages/ReactiveQuestPage.tsx:`);
    console.log(`const QUEST_ENGINE_ADDRESS = "${questEngineAddress}";`);
    console.log(`const ACHIEVEMENT_NFT_ADDRESS = "${achievementNFTAddress}";`);
    console.log(`const BOUNTY_SYSTEM_ADDRESS = "${bountySystemAddress}";`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => {
    console.log("\n✨ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });
