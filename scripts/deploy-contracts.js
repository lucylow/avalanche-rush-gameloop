const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Avalanche Rush Smart Contract Deployment...");

  // Get the contract factories
  const RushToken = await ethers.getContractFactory("RushToken");
  const AvalancheRushCore = await ethers.getContractFactory("AvalancheRushCore");
  const ReactiveQuestEngine = await ethers.getContractFactory("ReactiveQuestEngine");
  const EducationalNFT = await ethers.getContractFactory("EducationalNFT");
  const MockDEX = await ethers.getContractFactory("MockDEX");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  // Deploy RUSH Token first
  console.log("\n📦 Deploying RUSH Token...");
  const rushToken = await RushToken.deploy();
  await rushToken.deployed();
  console.log("✅ RUSH Token deployed to:", rushToken.address);

  // Deploy Educational NFT
  console.log("\n📦 Deploying Educational NFT...");
  const educationalNFT = await EducationalNFT.deploy();
  await educationalNFT.deployed();
  console.log("✅ Educational NFT deployed to:", educationalNFT.address);

  // Deploy Mock DEX
  console.log("\n📦 Deploying Mock DEX...");
  const mockDEX = await MockDEX.deploy(rushToken.address);
  await mockDEX.deployed();
  console.log("✅ Mock DEX deployed to:", mockDEX.address);

  // Deploy Avalanche Rush Core
  console.log("\n📦 Deploying Avalanche Rush Core...");
  const avalancheRushCore = await AvalancheRushCore.deploy(
    rushToken.address,
    educationalNFT.address
  );
  await avalancheRushCore.deployed();
  console.log("✅ Avalanche Rush Core deployed to:", avalancheRushCore.address);

  // Deploy Reactive Quest Engine
  console.log("\n📦 Deploying Reactive Quest Engine...");
  const reactiveQuestEngine = await ReactiveQuestEngine.deploy(
    rushToken.address,
    avalancheRushCore.address,
    educationalNFT.address
  );
  await reactiveQuestEngine.deployed();
  console.log("✅ Reactive Quest Engine deployed to:", reactiveQuestEngine.address);

  // Initialize contracts
  console.log("\n🔧 Initializing contracts...");

  // Set up roles and permissions
  await avalancheRushCore.setQuestEngine(reactiveQuestEngine.address);
  console.log("✅ Set quest engine in core contract");

  await reactiveQuestEngine.setCoreContract(avalancheRushCore.address);
  console.log("✅ Set core contract in quest engine");

  // Mint initial RUSH tokens to the core contract
  const initialSupply = ethers.utils.parseEther("1000000"); // 1M RUSH tokens
  await rushToken.mint(avalancheRushCore.address, initialSupply);
  console.log("✅ Minted initial RUSH tokens to core contract");

  // Create some sample quests
  console.log("\n🎯 Creating sample quests...");
  
  const sampleQuests = [
    {
      questId: 1,
      questType: 0, // Tutorial
      difficulty: 0, // Beginner
      reward: ethers.utils.parseEther("100"), // 100 RUSH
      duration: 3600, // 1 hour
      maxParticipants: 1000,
      description: "Complete your first game session and earn your first RUSH tokens!"
    },
    {
      questId: 2,
      questType: 1, // Speed Run
      difficulty: 1, // Intermediate
      reward: ethers.utils.parseEther("250"), // 250 RUSH
      duration: 1800, // 30 minutes
      maxParticipants: 500,
      description: "Achieve a high score in Speed Run mode within 30 minutes!"
    },
    {
      questId: 3,
      questType: 2, // Survival
      difficulty: 2, // Advanced
      reward: ethers.utils.parseEther("500"), // 500 RUSH
      duration: 3600, // 1 hour
      maxParticipants: 200,
      description: "Survive for 10 minutes in Survival mode without losing all lives!"
    }
  ];

  for (const quest of sampleQuests) {
    await reactiveQuestEngine.createQuest(
      quest.questId,
      quest.questType,
      quest.difficulty,
      deployer.address, // creator
      quest.reward,
      quest.duration,
      quest.maxParticipants,
      true, // isActive
      Math.floor(Date.now() / 1000), // startTime
      Math.floor(Date.now() / 1000) + 86400, // endTime (24 hours from now)
      quest.description
    );
    console.log(`✅ Created quest ${quest.questId}: ${quest.description}`);
  }

  // Create initial raffle
  console.log("\n🎫 Creating initial raffle...");
  const rafflePrize = ethers.utils.parseEther("1000"); // 1000 RUSH
  const ticketPrice = ethers.utils.parseEther("10"); // 10 RUSH per ticket
  
  await reactiveQuestEngine.createRaffle(
    rafflePrize,
    ticketPrice,
    Math.floor(Date.now() / 1000) + 604800 // 7 days from now
  );
  console.log("✅ Created initial raffle");

  // Create sample levels
  console.log("\n🎮 Creating sample levels...");
  
  const sampleLevels = [
    {
      levelId: 1,
      name: "Tutorial Level",
      requiredScore: 1000,
      reward: ethers.utils.parseEther("50"),
      isUnlocked: true,
      description: "Learn the basics of Avalanche Rush"
    },
    {
      levelId: 2,
      name: "Speed Challenge",
      requiredScore: 5000,
      reward: ethers.utils.parseEther("100"),
      isUnlocked: false,
      description: "Test your speed and reflexes"
    },
    {
      levelId: 3,
      name: "Survival Master",
      requiredScore: 10000,
      reward: ethers.utils.parseEther("200"),
      isUnlocked: false,
      description: "Survive as long as possible"
    }
  ];

  for (const level of sampleLevels) {
    await avalancheRushCore.createLevel(
      level.levelId,
      level.name,
      level.requiredScore,
      level.reward,
      level.isUnlocked,
      level.description
    );
    console.log(`✅ Created level ${level.levelId}: ${level.name}`);
  }

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("====================");
  console.log("RUSH Token:", rushToken.address);
  console.log("Educational NFT:", educationalNFT.address);
  console.log("Mock DEX:", mockDEX.address);
  console.log("Avalanche Rush Core:", avalancheRushCore.address);
  console.log("Reactive Quest Engine:", reactiveQuestEngine.address);
  console.log("\n📋 Contract Configuration:");
  console.log("- Initial RUSH supply: 1,000,000 tokens");
  console.log("- Sample quests created: 3");
  console.log("- Sample levels created: 3");
  console.log("- Initial raffle created with 1000 RUSH prize");
  console.log("\n🔗 Network:", await deployer.provider.getNetwork());
  console.log("✅ Deployment completed successfully!");

  // Save deployment info
  const deploymentInfo = {
    network: (await deployer.provider.getNetwork()).name,
    chainId: (await deployer.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      rushToken: rushToken.address,
      educationalNFT: educationalNFT.address,
      mockDEX: mockDEX.address,
      avalancheRushCore: avalancheRushCore.address,
      reactiveQuestEngine: reactiveQuestEngine.address
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
