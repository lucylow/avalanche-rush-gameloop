const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Avalanche Rush VRF Contract...");

  // Get the contract factory
  const AvalancheRushVRF = await ethers.getContractFactory("AvalancheRushVRF");

  // VRF configuration for different networks
  const vrfConfig = {
    // Avalanche Fuji Testnet
    43113: {
      vrfCoordinator: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610",
      linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
      keyHash: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f2",
      fee: ethers.utils.parseEther("0.1") // 0.1 LINK
    },
    // Avalanche Mainnet
    43114: {
      vrfCoordinator: "0xd5D517aBE5cF79B7e95eC9dB29AcC4b0e4a5E02E",
      linkToken: "0x5947BB275c521040051D82396192181b01222790",
      keyHash: "0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d",
      fee: ethers.utils.parseEther("0.25") // 0.25 LINK
    },
    // Reactive Network (example configuration)
    42: {
      vrfCoordinator: "0x...", // To be configured
      linkToken: "0x...", // To be configured
      keyHash: "0x...", // To be configured
      fee: ethers.utils.parseEther("0.1")
    }
  };

  // Get current network
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log(`📡 Network: ${network.name} (Chain ID: ${chainId})`);

  // Check if network is supported
  if (!vrfConfig[chainId]) {
    throw new Error(`❌ Unsupported network: ${chainId}`);
  }

  const config = vrfConfig[chainId];
  console.log("🔧 VRF Configuration:", {
    vrfCoordinator: config.vrfCoordinator,
    linkToken: config.linkToken,
    keyHash: config.keyHash,
    fee: ethers.utils.formatEther(config.fee) + " LINK"
  });

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const avalancheRushVRF = await AvalancheRushVRF.deploy(
    config.vrfCoordinator,
    config.linkToken,
    config.keyHash,
    config.fee
  );

  await avalancheRushVRF.deployed();

  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", avalancheRushVRF.address);
  console.log("👤 Deployer:", await avalancheRushVRF.signer.getAddress());

  // Verify contract on block explorer (if supported)
  if (chainId === 43113 || chainId === 43114) {
    console.log("🔍 Verifying contract on Snowtrace...");
    try {
      await hre.run("verify:verify", {
        address: avalancheRushVRF.address,
        constructorArguments: [
          config.vrfCoordinator,
          config.linkToken,
          config.keyHash,
          config.fee
        ],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }

  // Fund contract with LINK tokens (if deployer has LINK)
  console.log("💰 Checking LINK balance...");
  const linkToken = await ethers.getContractAt(
    "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol:LinkTokenInterface",
    config.linkToken
  );

  const deployerAddress = await avalancheRushVRF.signer.getAddress();
  const linkBalance = await linkToken.balanceOf(deployerAddress);
  
  console.log(`💳 Deployer LINK Balance: ${ethers.utils.formatEther(linkBalance)} LINK`);

  if (linkBalance.gte(config.fee.mul(10))) {
    console.log("💸 Funding contract with LINK tokens...");
    const fundAmount = config.fee.mul(10); // Fund with 10x the fee amount
    
    const fundTx = await linkToken.transfer(avalancheRushVRF.address, fundAmount);
    await fundTx.wait();
    
    console.log(`✅ Contract funded with ${ethers.utils.formatEther(fundAmount)} LINK`);
    
    // Verify funding
    const contractLinkBalance = await avalancheRushVRF.getLinkBalance();
    console.log(`💳 Contract LINK Balance: ${ethers.utils.formatEther(contractLinkBalance)} LINK`);
  } else {
    console.log("⚠️ Insufficient LINK balance to fund contract");
    console.log("💡 Please fund the contract manually with LINK tokens");
  }

  // Display contract information
  console.log("\n📋 Contract Information:");
  console.log("=" .repeat(50));
  console.log(`Contract Address: ${avalancheRushVRF.address}`);
  console.log(`Network: ${network.name} (${chainId})`);
  console.log(`VRF Coordinator: ${config.vrfCoordinator}`);
  console.log(`LINK Token: ${config.linkToken}`);
  console.log(`Key Hash: ${config.keyHash}`);
  console.log(`VRF Fee: ${ethers.utils.formatEther(config.fee)} LINK`);
  
  // Display event types and their max values
  console.log("\n🎲 Event Types Configuration:");
  console.log("=" .repeat(50));
  const eventTypes = [
    "DAILY_CHALLENGE",
    "NFT_REWARD_RARITY", 
    "POWER_UP_SPAWN",
    "OBSTACLE_PATTERN",
    "TOURNAMENT_MATCH",
    "QUEST_REWARD",
    "SPECIAL_EVENT",
    "BONUS_MULTIPLIER"
  ];

  for (let i = 0; i < eventTypes.length; i++) {
    const stats = await avalancheRushVRF.getEventTypeStats(i);
    console.log(`${i}. ${eventTypes[i]}: Max Value = ${stats.maxValue}`);
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: avalancheRushVRF.address,
    network: network.name,
    chainId: chainId,
    deployer: deployerAddress,
    vrfCoordinator: config.vrfCoordinator,
    linkToken: config.linkToken,
    keyHash: config.keyHash,
    vrfFee: ethers.utils.formatEther(config.fee),
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `avalanche-rush-vrf-${chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("🔗 Next steps:");
  console.log("1. Update the VRF_CONTRACT_ADDRESSES in useChainlinkVRF.ts");
  console.log("2. Test the VRF functionality with a small request");
  console.log("3. Monitor the contract for events and requests");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
