const hre = require("hardhat");

async function main() {
  console.log("🏔️ Deploying Enhanced Avalanche Rush contracts with advanced features...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy RUSH Token (ERC-20)
  console.log("\n💰 Deploying RUSH Token...");
  const RushToken = await hre.ethers.getContractFactory("RushToken");
  const rushToken = await RushToken.deploy();
  await rushToken.waitForDeployment();
  
  console.log("✅ RUSH Token deployed to:", await rushToken.getAddress());

  // Deploy AvalancheRushCore
  console.log("\n🎮 Deploying AvalancheRushCore...");
  const AvalancheRushCore = await hre.ethers.getContractFactory("AvalancheRushCore");
  const avalancheRushCore = await AvalancheRushCore.deploy(await rushToken.getAddress());
  await avalancheRushCore.waitForDeployment();
  
  console.log("✅ AvalancheRushCore deployed to:", await avalancheRushCore.getAddress());

  // Deploy EducationalNFT
  console.log("\n🎨 Deploying EducationalNFT...");
  const EducationalNFT = await hre.ethers.getContractFactory("EducationalNFT");
  const educationalNFT = await EducationalNFT.deploy();
  await educationalNFT.waitForDeployment();
  
  console.log("✅ EducationalNFT deployed to:", await educationalNFT.getAddress());

  // Deploy MockDEX
  console.log("\n🔄 Deploying MockDEX...");
  const MockDEX = await hre.ethers.getContractFactory("MockDEX");
  const mockDEX = await MockDEX.deploy();
  await mockDEX.waitForDeployment();
  
  console.log("✅ MockDEX deployed to:", await mockDEX.getAddress());

  // Deploy ReactiveQuestEngineAdvanced
  console.log("\n⚡ Deploying ReactiveQuestEngineAdvanced...");
  const ReactiveQuestEngineAdvanced = await hre.ethers.getContractFactory("ReactiveQuestEngineAdvanced");
  const reactiveQuestEngine = await ReactiveQuestEngineAdvanced.deploy(
    "0x0000000000000000000000000000000000000000", // Reactive contract address (placeholder)
    1, // Subscription ID (placeholder)
    "0x0000000000000000000000000000000000000000"  // VRF Coordinator (placeholder)
  );
  await reactiveQuestEngine.waitForDeployment();
  
  console.log("✅ ReactiveQuestEngineAdvanced deployed to:", await reactiveQuestEngine.getAddress());

  // Deploy AvalancheSubnetIntegration
  console.log("\n🌐 Deploying AvalancheSubnetIntegration...");
  const AvalancheSubnetIntegration = await hre.ethers.getContractFactory("AvalancheSubnetIntegration");
  const avalancheSubnetIntegration = await AvalancheSubnetIntegration.deploy(await rushToken.getAddress());
  await avalancheSubnetIntegration.waitForDeployment();
  
  console.log("✅ AvalancheSubnetIntegration deployed to:", await avalancheSubnetIntegration.getAddress());

  // Deploy AvalancheDeFiIntegration
  console.log("\n💎 Deploying AvalancheDeFiIntegration...");
  const AvalancheDeFiIntegration = await hre.ethers.getContractFactory("AvalancheDeFiIntegration");
  const avalancheDeFiIntegration = await AvalancheDeFiIntegration.deploy(await rushToken.getAddress());
  await avalancheDeFiIntegration.waitForDeployment();
  
  console.log("✅ AvalancheDeFiIntegration deployed to:", await avalancheDeFiIntegration.getAddress());

  // Deploy Security Contract
  console.log("\n🔒 Deploying Security Contract...");
  const Security = await hre.ethers.getContractFactory("Security");
  const security = await Security.deploy();
  await security.waitForDeployment();
  
  console.log("✅ Security Contract deployed to:", await security.getAddress());

  // Configure contracts
  console.log("\n⚙️ Configuring contracts...");
  
  // Add minters to RUSH token
  await rushToken.addMinter(await avalancheRushCore.getAddress());
  await rushToken.addMinter(await avalancheSubnetIntegration.getAddress());
  await rushToken.addMinter(await avalancheDeFiIntegration.getAddress());
  console.log("✅ Added minters to RUSH token");

  // Initialize default subnets
  await avalancheSubnetIntegration.createSubnet(
    "Avalanche Rush Gaming Subnet",
    await avalancheRushCore.getAddress(),
    ethers.parseEther("0.001")
  );
  await avalancheSubnetIntegration.createSubnet(
    "Avalanche Rush DeFi Subnet", 
    await avalancheDeFiIntegration.getAddress(),
    ethers.parseEther("0.001")
  );
  console.log("✅ Created default subnets");

  // Initialize yield pools
  const wavaxAddress = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"; // WAVAX on Avalanche
  const usdcAddress = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"; // USDC on Avalanche
  
  await avalancheDeFiIntegration.createYieldPool(
    wavaxAddress,
    await rushToken.getAddress(),
    ethers.parseEther("1000"), // 1000 RUSH per day
    "WAVAX-RUSH Yield Pool"
  );
  
  await avalancheDeFiIntegration.createYieldPool(
    usdcAddress,
    await rushToken.getAddress(),
    ethers.parseEther("500"), // 500 RUSH per day
    "USDC-RUSH Yield Pool"
  );
  console.log("✅ Created yield pools");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      RushToken: await rushToken.getAddress(),
      AvalancheRushCore: await avalancheRushCore.getAddress(),
      EducationalNFT: await educationalNFT.getAddress(),
      MockDEX: await mockDEX.getAddress(),
      ReactiveQuestEngineAdvanced: await reactiveQuestEngine.getAddress(),
      AvalancheSubnetIntegration: await avalancheSubnetIntegration.getAddress(),
      AvalancheDeFiIntegration: await avalancheDeFiIntegration.getAddress(),
      Security: await security.getAddress()
    },
    transactionHashes: {
      RushToken: rushToken.deploymentTransaction().hash,
      AvalancheRushCore: avalancheRushCore.deploymentTransaction().hash,
      EducationalNFT: educationalNFT.deploymentTransaction().hash,
      MockDEX: mockDEX.deploymentTransaction().hash,
      ReactiveQuestEngineAdvanced: reactiveQuestEngine.deploymentTransaction().hash,
      AvalancheSubnetIntegration: avalancheSubnetIntegration.deploymentTransaction().hash,
      AvalancheDeFiIntegration: avalancheDeFiIntegration.deploymentTransaction().hash,
      Security: security.deploymentTransaction().hash
    },
    features: {
      subnetIntegration: true,
      defiIntegration: true,
      avaxStaking: true,
      crossChainBridge: true,
      warpMessaging: true,
      twapPricing: true,
      flashLoans: true,
      yieldFarming: true,
      liquidityMining: true,
      avalancheQuests: true
    },
    avalancheTokens: {
      AVAX: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      JOE: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd"
    },
    dexRouters: {
      TraderJoe: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
      Pangolin: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106"
    }
  };

  console.log("\n📄 Enhanced Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require('fs');
  if (!fs.existsSync('./deployment')) {
    fs.mkdirSync('./deployment');
  }
  fs.writeFileSync(
    `./deployment/avalanche-enhanced-${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Create environment file for frontend
  const envContent = `# Avalanche Rush Enhanced - Environment Variables
REACT_APP_RUSH_TOKEN_ADDRESS=${await rushToken.getAddress()}
REACT_APP_AVALANCHE_RUSH_CORE_ADDRESS=${await avalancheRushCore.getAddress()}
REACT_APP_EDUCATIONAL_NFT_ADDRESS=${await educationalNFT.getAddress()}
REACT_APP_MOCK_DEX_ADDRESS=${await mockDEX.getAddress()}
REACT_APP_REACTIVE_QUEST_ENGINE_ADDRESS=${await reactiveQuestEngine.getAddress()}
REACT_APP_AVALANCHE_SUBNET_INTEGRATION_ADDRESS=${await avalancheSubnetIntegration.getAddress()}
REACT_APP_AVALANCHE_DEFI_INTEGRATION_ADDRESS=${await avalancheDeFiIntegration.getAddress()}
REACT_APP_SECURITY_ADDRESS=${await security.getAddress()}

# Avalanche Network Configuration
REACT_APP_AVALANCHE_CHAIN_ID=43114
REACT_APP_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
REACT_APP_AVALANCHE_BLOCK_EXPLORER=https://snowtrace.io

# Avalanche Fuji Testnet Configuration
REACT_APP_AVALANCHE_FUJI_CHAIN_ID=43113
REACT_APP_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
REACT_APP_AVALANCHE_FUJI_BLOCK_EXPLORER=https://testnet.snowtrace.io

# Avalanche Token Addresses
REACT_APP_WAVAX_ADDRESS=0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7
REACT_APP_USDC_ADDRESS=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
REACT_APP_USDT_ADDRESS=0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7
REACT_APP_JOE_ADDRESS=0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd

# DEX Router Addresses
REACT_APP_TRADER_JOE_ROUTER=0x60aE616a2155Ee3d9A68541Ba4544862310933d4
REACT_APP_PANGOLIN_ROUTER=0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106

# Feature Flags
REACT_APP_ENABLE_SUBNET_INTEGRATION=true
REACT_APP_ENABLE_DEFI_INTEGRATION=true
REACT_APP_ENABLE_AVAX_STAKING=true
REACT_APP_ENABLE_CROSS_CHAIN_BRIDGE=true
REACT_APP_ENABLE_WARP_MESSAGING=true
REACT_APP_ENABLE_TWAP_PRICING=true
REACT_APP_ENABLE_FLASH_LOANS=true
REACT_APP_ENABLE_YIELD_FARMING=true
REACT_APP_ENABLE_LIQUIDITY_MINING=true
REACT_APP_ENABLE_AVALANCHE_QUESTS=true
`;

  fs.writeFileSync('./deployment/.env.example', envContent);

  console.log("\n🎉 Enhanced Avalanche deployment completed successfully!");
  console.log("📝 Deployment info saved to deployment directory");
  console.log("📄 Environment variables saved to .env.example");
  console.log("\n🚀 New Features Deployed:");
  console.log("   ✅ Avalanche Subnet Integration");
  console.log("   ✅ Advanced DeFi Features");
  console.log("   ✅ AVAX Staking Mechanics");
  console.log("   ✅ Cross-Chain Bridge Support");
  console.log("   ✅ Warp Messaging");
  console.log("   ✅ TWAP Price Oracle");
  console.log("   ✅ Flash Loan Support");
  console.log("   ✅ Yield Farming Pools");
  console.log("   ✅ Liquidity Mining");
  console.log("   ✅ Avalanche-Specific Quests");
  
  console.log("\n📋 Next Steps:");
  console.log("   1. Copy .env.example to .env and update with your values");
  console.log("   2. Update frontend contract addresses");
  console.log("   3. Test all features on testnet");
  console.log("   4. Deploy to mainnet when ready");
  console.log("   5. Verify contracts on Snowtrace");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Enhanced deployment failed:", error);
    process.exit(1);
  });

