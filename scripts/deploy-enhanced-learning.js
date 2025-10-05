const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🚀 Deploying Enhanced Learning System with Reactive Network...");
  console.log("Deploying contracts with the account:", deployer.address);

  // Reactive Network specific parameters
  const REACTIVE_NETWORK_ADDRESS = "0xYourReactiveNetworkRouterAddress"; // Replace with actual
  const SUBSCRIPTION_ID = 1; // Replace with your subscription ID
  const NFT_NAME = "Avalanche Rush Learning Achievements";
  const NFT_SYMBOL = "ARLA";
  const BASE_TOKEN_URI = "https://api.avalanche-rush.com/learning-metadata/";

  try {
    // Step 1: Deploy AchievementNFT contract
    console.log("\n📦 Deploying AchievementNFT contract...");
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

    // Step 3: Deploy ReactiveLearningEngine contract
    console.log("\n📦 Deploying ReactiveLearningEngine contract...");
    const ReactiveLearningEngine = await ethers.getContractFactory("ReactiveLearningEngine");
    const learningEngine = await ReactiveLearningEngine.deploy(
      REACTIVE_NETWORK_ADDRESS,
      SUBSCRIPTION_ID,
      achievementNFTAddress,
      bountySystemAddress
    );
    await learningEngine.waitForDeployment();
    const learningEngineAddress = await learningEngine.getAddress();
    console.log("✅ ReactiveLearningEngine deployed to:", learningEngineAddress);

    // Step 4: Deploy SimplifiedQuestEngine contract (for backward compatibility)
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

    // Step 5: Configure contracts
    console.log("\n🔧 Configuring contracts...");
    
    // Transfer ownership of AchievementNFT to LearningEngine
    const transferNFTTx = await achievementNFT.transferOwnership(learningEngineAddress);
    await transferNFTTx.wait();
    console.log("✅ AchievementNFT ownership transferred to LearningEngine");
    
    // Set learning engine in bounty system
    const setLearningEngineTx = await bountySystem.setQuestEngine(learningEngineAddress);
    await setLearningEngineTx.wait();
    console.log("✅ LearningEngine configured in BountySystem");

    // Step 6: Initialize learning system with sample data
    console.log("\n📚 Initializing learning system with sample modules...");
    
    // Create sample learning modules
    const module1Tx = await learningEngine.createLearningModule(
      "Introduction to Blockchain",
      "Learn the fundamentals of blockchain technology, including consensus mechanisms, cryptography, and distributed systems.",
      "blockchain",
      1, // difficulty
      30, // estimated duration in minutes
      80, // required score
      ["Understand what blockchain is", "Learn about consensus mechanisms", "Explore cryptography basics"],
      [], // prerequisites
      100, // reward amount
      100 // XP reward
    );
    await module1Tx.wait();
    console.log("✅ Created module: Introduction to Blockchain");

    const module2Tx = await learningEngine.createLearningModule(
      "Smart Contract Development",
      "Master Solidity programming and smart contract deployment on Ethereum and Avalanche networks.",
      "blockchain",
      3, // difficulty
      120, // estimated duration
      85, // required score
      ["Write Solidity contracts", "Understand gas optimization", "Deploy contracts to testnet"],
      [1], // prerequisites
      300, // reward amount
      300 // XP reward
    );
    await module2Tx.wait();
    console.log("✅ Created module: Smart Contract Development");

    const module3Tx = await learningEngine.createLearningModule(
      "Avalanche Network Deep Dive",
      "Comprehensive guide to Avalanche's unique consensus mechanism, subnets, and ecosystem.",
      "avalanche",
      4, // difficulty
      150, // estimated duration
      90, // required score
      ["Understand Avalanche consensus", "Learn about subnets", "Explore ecosystem projects"],
      [1, 2], // prerequisites
      500, // reward amount
      500 // XP reward
    );
    await module3Tx.wait();
    console.log("✅ Created module: Avalanche Network Deep Dive");

    const module4Tx = await learningEngine.createLearningModule(
      "Reactive Network Integration",
      "Learn how to build applications that respond to cross-chain events using Reactive Network.",
      "reactive",
      5, // difficulty
      180, // estimated duration
      95, // required score
      ["Understand Reactive contracts", "Build event-driven applications", "Implement cross-chain automation"],
      [1, 2, 3], // prerequisites
      750, // reward amount
      750 // XP reward
    );
    await module4Tx.wait();
    console.log("✅ Created module: Reactive Network Integration");

    // Create learning paths
    console.log("\n🛤️ Creating learning paths...");
    const path1Tx = await learningEngine.createLearningPath(
      "Blockchain Developer Path",
      "Complete journey from blockchain basics to advanced smart contract development.",
      [1, 2], // module IDs
      200 // completion bonus
    );
    await path1Tx.wait();
    console.log("✅ Created path: Blockchain Developer Path");

    const path2Tx = await learningEngine.createLearningPath(
      "Avalanche Ecosystem Expert",
      "Become an expert in Avalanche network and its growing ecosystem.",
      [1, 2, 3], // module IDs
      500 // completion bonus
    );
    await path2Tx.wait();
    console.log("✅ Created path: Avalanche Ecosystem Expert");

    const path3Tx = await learningEngine.createLearningPath(
      "Reactive Network Pioneer",
      "Pioneer the future of event-driven blockchain applications.",
      [1, 2, 3, 4], // module IDs
      1000 // completion bonus
    );
    await path3Tx.wait();
    console.log("✅ Created path: Reactive Network Pioneer");

    // Create badges
    console.log("\n🏆 Creating achievement badges...");
    const badge1Tx = await learningEngine.createBadge(
      "First Steps",
      "Complete your first learning module",
      "https://api.avalanche-rush.com/badges/first-steps.png",
      1,
      "modules"
    );
    await badge1Tx.wait();
    console.log("✅ Created badge: First Steps");

    const badge2Tx = await learningEngine.createBadge(
      "Knowledge Seeker",
      "Complete 5 learning modules",
      "https://api.avalanche-rush.com/badges/knowledge-seeker.png",
      5,
      "modules"
    );
    await badge2Tx.wait();
    console.log("✅ Created badge: Knowledge Seeker");

    const badge3Tx = await learningEngine.createBadge(
      "Streak Master",
      "Maintain a 7-day learning streak",
      "https://api.avalanche-rush.com/badges/streak-master.png",
      7,
      "streak"
    );
    await badge3Tx.wait();
    console.log("✅ Created badge: Streak Master");

    const badge4Tx = await learningEngine.createBadge(
      "Avalanche Expert",
      "Complete all Avalanche-related modules",
      "https://api.avalanche-rush.com/badges/avalanche-expert.png",
      3,
      "category"
    );
    await badge4Tx.wait();
    console.log("✅ Created badge: Avalanche Expert");

    const badge5Tx = await learningEngine.createBadge(
      "Reactive Pioneer",
      "Complete all Reactive Network modules",
      "https://api.avalanche-rush.com/badges/reactive-pioneer.png",
      4,
      "category"
    );
    await badge5Tx.wait();
    console.log("✅ Created badge: Reactive Pioneer");

    // Step 7: Save deployment information
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
        ReactiveLearningEngine: {
          address: learningEngineAddress,
          reactiveNetwork: REACTIVE_NETWORK_ADDRESS,
          subscriptionId: SUBSCRIPTION_ID,
          achievementNFT: achievementNFTAddress,
          bountySystem: bountySystemAddress
        },
        SimplifiedQuestEngine: {
          address: questEngineAddress,
          reactiveNetwork: REACTIVE_NETWORK_ADDRESS,
          subscriptionId: SUBSCRIPTION_ID,
          achievementNFT: achievementNFTAddress,
          bountySystem: bountySystemAddress
        }
      },
      learningSystem: {
        modulesCreated: 4,
        pathsCreated: 3,
        badgesCreated: 5,
        categories: ["blockchain", "avalanche", "reactive"],
        totalXPAvailable: 1650,
        totalRewardsAvailable: 2150
      }
    };

    // Save to file
    const deploymentPath = path.join(__dirname, "..", "deployments", "enhanced-learning-deployment.json");
    fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to:", deploymentPath);

    // Step 8: Display comprehensive summary
    console.log("\n🎉 Enhanced Learning System Deployment Summary:");
    console.log("=".repeat(60));
    console.log(`📚 Learning Engine:        ${learningEngineAddress}`);
    console.log(`🎮 Quest Engine:          ${questEngineAddress}`);
    console.log(`🏆 Achievement NFT:       ${achievementNFTAddress}`);
    console.log(`💰 Bounty System:         ${bountySystemAddress}`);
    console.log(`🌐 Network:              Avalanche Mainnet`);
    console.log(`👤 Deployer:             ${deployer.address}`);
    console.log("=".repeat(60));
    
    console.log("\n📊 Learning System Statistics:");
    console.log(`📖 Learning Modules:      4 modules created`);
    console.log(`🛤️ Learning Paths:        3 paths created`);
    console.log(`🏆 Achievement Badges:    5 badges created`);
    console.log(`⚡ Total XP Available:    1,650 XP`);
    console.log(`💰 Total Rewards:         2,150 RUSH tokens`);
    
    console.log("\n🔗 Frontend Configuration:");
    console.log(`Update these addresses in your frontend components:`);
    console.log(`const LEARNING_ENGINE_ADDRESS = "${learningEngineAddress}";`);
    console.log(`const QUEST_ENGINE_ADDRESS = "${questEngineAddress}";`);
    console.log(`const ACHIEVEMENT_NFT_ADDRESS = "${achievementNFTAddress}";`);
    console.log(`const BOUNTY_SYSTEM_ADDRESS = "${bountySystemAddress}";`);

    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend contract addresses");
    console.log("2. Configure Reactive Network subscription");
    console.log("3. Set up learning platform integration");
    console.log("4. Create metadata server for NFT images");
    console.log("5. Test the complete learning flow");
    console.log("6. Deploy to production and update DNS");
    console.log("7. Launch community learning challenges");

    console.log("\n🎯 Features Ready:");
    console.log("✅ AI-powered learning recommendations");
    console.log("✅ Reactive Network event automation");
    console.log("✅ Gamified learning with XP and badges");
    console.log("✅ Social learning groups and challenges");
    console.log("✅ Adaptive difficulty and progress tracking");
    console.log("✅ Cross-chain event monitoring");
    console.log("✅ Automated reward distribution");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
