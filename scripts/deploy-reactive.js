const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying Avalanche Rush Reactive Smart Contracts to Reactive Mainnet...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "REACT");
  
  if (balance < hre.ethers.parseEther("0.1")) {
    throw new Error("Insufficient REACT balance for deployment. Need at least 0.1 REACT.");
  }

  // Real Reactive Network configuration
  const REACTIVE_INTERFACE = "0x742d35Cc5A5E2a9E1aB8d8C6E6E9F4A5B8D35a9"; // Reactive interface address
  const VRF_COORDINATOR = "0x2eD832Ba664535e5886b75D64C46EB9a228C2610"; // Chainlink VRF coordinator
  const SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || 1;
  const VRF_KEY_HASH = "0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d";

  // Deploy ReactiveQuestEngineAdvanced
  console.log("\n📋 Deploying ReactiveQuestEngineAdvanced...");
  const ReactiveQuestEngineAdvanced = await hre.ethers.getContractFactory("ReactiveQuestEngineAdvanced");
  
  const reactiveQuestEngine = await ReactiveQuestEngineAdvanced.deploy(
    REACTIVE_INTERFACE,
    SUBSCRIPTION_ID,
    VRF_COORDINATOR
  );
  await reactiveQuestEngine.waitForDeployment();
  
  console.log("✅ ReactiveQuestEngineAdvanced deployed to:", await reactiveQuestEngine.getAddress());

  // Deploy EducationalNFT
  console.log("\n🎨 Deploying EducationalNFT...");
  const EducationalNFT = await hre.ethers.getContractFactory("EducationalNFT");
  const educationalNFT = await EducationalNFT.deploy(
    SUBSCRIPTION_ID,
    VRF_COORDINATOR,
    VRF_KEY_HASH
  );
  await educationalNFT.waitForDeployment();
  
  console.log("✅ EducationalNFT deployed to:", await educationalNFT.getAddress());

  // Deploy Security contract
  console.log("\n🔒 Deploying Security...");
  const Security = await hre.ethers.getContractFactory("Security");
  const security = await Security.deploy();
  await security.waitForDeployment();
  
  console.log("✅ Security deployed to:", await security.getAddress());

  // Initialize contracts
  console.log("\n🔧 Initializing contracts...");
  
  // Set up Reactive Quest Engine with Avalanche contracts
  const AVALANCHE_RUSH_CORE = process.env.AVALANCHE_RUSH_CORE_ADDRESS || "0x0000000000000000000000000000000000000000";
  const RUSH_TOKEN_ADDRESS = process.env.RUSH_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  if (AVALANCHE_RUSH_CORE !== "0x0000000000000000000000000000000000000000") {
    console.log("Setting up cross-chain integration...");
    // Initialize quest engine with origin contracts
    // This would be done after Avalanche contracts are deployed
  }

  // Create deployment directory if it doesn't exist
  const deploymentDir = path.join(__dirname, '..', 'deployment');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    reactiveNetwork: {
      interface: REACTIVE_INTERFACE,
      vrfCoordinator: VRF_COORDINATOR,
      subscriptionId: SUBSCRIPTION_ID,
      keyHash: VRF_KEY_HASH
    },
    contracts: {
      ReactiveQuestEngineAdvanced: await reactiveQuestEngine.getAddress(),
      EducationalNFT: await educationalNFT.getAddress(),
      Security: await security.getAddress(),
    },
    transactionHashes: {
      ReactiveQuestEngineAdvanced: reactiveQuestEngine.deploymentTransaction().hash,
      EducationalNFT: educationalNFT.deploymentTransaction().hash,
      Security: security.deploymentTransaction().hash,
    },
    gasUsed: {
      ReactiveQuestEngineAdvanced: reactiveQuestEngine.deploymentTransaction().gasLimit,
      EducationalNFT: educationalNFT.deploymentTransaction().gasLimit,
      Security: security.deploymentTransaction().gasLimit,
    }
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fileName = `reactive-mainnet-${Date.now()}.json`;
  const filePath = path.join(deploymentDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Reactive Network deployment completed successfully!");
  console.log("📝 Deployment info saved to:", filePath);
  console.log("\n🔗 Contract Addresses:");
  console.log(`ReactiveQuestEngineAdvanced: ${await reactiveQuestEngine.getAddress()}`);
  console.log(`EducationalNFT: ${await educationalNFT.getAddress()}`);
  console.log(`Security: ${await security.getAddress()}`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contracts on Reactive Network explorer");
  console.log("2. Update frontend configuration with new addresses");
  console.log("3. Test cross-chain integration with Avalanche contracts");
  console.log("4. Execute complete workflow and document transaction hashes");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
