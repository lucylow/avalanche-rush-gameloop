const hre = require("hardhat");

async function main() {
  console.log("🏔️ Deploying Avalanche Rush contracts to Avalanche network...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy RUSH Token (ERC-20)
  console.log("\n💰 Deploying RUSH Token...");
  const RushToken = await hre.ethers.getContractFactory("RushToken");
  const rushToken = await RushToken.deploy();
  await rushToken.waitForDeployment();
  
  console.log("✅ RUSH Token deployed to:", await rushToken.getAddress());

  // Deploy MockDEX for quest verification
  console.log("\n🔄 Deploying MockDEX...");
  const MockDEX = await hre.ethers.getContractFactory("MockDEX");
  const mockDEX = await MockDEX.deploy();
  await mockDEX.waitForDeployment();
  
  console.log("✅ MockDEX deployed to:", await mockDEX.getAddress());

  // Deploy Game Logic Contract
  console.log("\n🎮 Deploying GameLogic...");
  const GameLogic = await hre.ethers.getContractFactory("GameLogic");
  const gameLogic = await GameLogic.deploy(
    await rushToken.getAddress(),
    await mockDEX.getAddress()
  );
  await gameLogic.waitForDeployment();
  
  console.log("✅ GameLogic deployed to:", await gameLogic.getAddress());

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      RushToken: await rushToken.getAddress(),
      MockDEX: await mockDEX.getAddress(),
      GameLogic: await gameLogic.getAddress(),
    },
    transactionHashes: {
      RushToken: rushToken.deploymentTransaction().hash,
      MockDEX: mockDEX.deploymentTransaction().hash,
      GameLogic: gameLogic.deploymentTransaction().hash,
    }
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require('fs');
  if (!fs.existsSync('./deployment')) {
    fs.mkdirSync('./deployment');
  }
  fs.writeFileSync(
    `./deployment/avalanche-${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Deployment info saved to deployment directory");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
