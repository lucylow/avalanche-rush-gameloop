const { ethers } = require("hardhat");

async function main() {
  console.log("🏔️ Deploying Avalanche Rush C-Chain Contract...");

  // Get the contract factory
  const AvalancheRushCChain = await ethers.getContractFactory("AvalancheRushCChain");

  // VRF configuration for Avalanche networks
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
    }
  };

  // Get current network
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  console.log(`🔗 Network: ${network.name} (Chain ID: ${chainId})`);

  // Check if network is Avalanche
  if (chainId !== 43113 && chainId !== 43114) {
    throw new Error(`❌ This contract is specifically for Avalanche C-Chain. Current chain: ${chainId}`);
  }

  const config = vrfConfig[chainId];
  console.log("🔧 Avalanche C-Chain Configuration:", {
    vrfCoordinator: config.vrfCoordinator,
    linkToken: config.linkToken,
    keyHash: config.keyHash,
    fee: ethers.utils.formatEther(config.fee) + " LINK"
  });

  // Deploy the contract
  console.log("⏳ Deploying Avalanche C-Chain contract...");
  const avalancheRushCChain = await AvalancheRushCChain.deploy(
    config.vrfCoordinator,
    config.linkToken,
    config.keyHash,
    config.fee
  );

  await avalancheRushCChain.deployed();

  const deployer = await avalancheRushCChain.signer.getAddress();
  
  console.log("✅ Avalanche C-Chain Contract deployed successfully!");
  console.log("📍 Contract Address:", avalancheRushCChain.address);
  console.log("👤 Deployer:", deployer);

  // Fund contract with initial AVAX for rewards
  console.log("💰 Funding contract with AVAX for quest rewards...");
  const fundAmount = ethers.utils.parseEther("10.0"); // 10 AVAX
  
  const fundTx = await avalancheRushCChain.signer.sendTransaction({
    to: avalancheRushCChain.address,
    value: fundAmount
  });
  await fundTx.wait();
  
  console.log(`✅ Contract funded with ${ethers.utils.formatEther(fundAmount)} AVAX`);

  // Verify contract on Snowtrace
  if (chainId === 43113 || chainId === 43114) {
    console.log("🔍 Verifying contract on Snowtrace...");
    try {
      await hre.run("verify:verify", {
        address: avalancheRushCChain.address,
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

  // Fund contract with LINK tokens for VRF
  console.log("💰 Checking LINK balance for VRF...");
  const linkToken = await ethers.getContractAt(
    "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol:LinkTokenInterface",
    config.linkToken
  );

  const deployerLinkBalance = await linkToken.balanceOf(deployer);
  console.log(`💳 Deployer LINK Balance: ${ethers.utils.formatEther(deployerLinkBalance)} LINK`);

  if (deployerLinkBalance.gte(config.fee.mul(20))) {
    console.log("💸 Funding contract with LINK tokens...");
    const linkFundAmount = config.fee.mul(20); // 20x the fee amount
    
    const linkFundTx = await linkToken.transfer(avalancheRushCChain.address, linkFundAmount);
    await linkFundTx.wait();
    
    console.log(`✅ Contract funded with ${ethers.utils.formatEther(linkFundAmount)} LINK`);
  } else {
    console.log("⚠️ Insufficient LINK balance to fund contract");
    console.log("💡 Please fund the contract manually with LINK tokens for VRF functionality");
  }

  // Display Avalanche-specific features
  console.log("\n🏔️ Avalanche C-Chain Features:");
  console.log("=" .repeat(50));
  
  // Check subnets
  const avalancheSubnet = await avalancheRushCChain.subnets(43114);
  const fujiSubnet = await avalancheRushCChain.subnets(43113);
  const reactiveSubnet = await avalancheRushCChain.subnets(42);
  
  console.log("📡 Supported Subnets:");
  console.log(`• Avalanche C-Chain: ${avalancheSubnet.name} (${avalancheSubnet.isActive ? 'Active' : 'Inactive'})`);
  console.log(`• Fuji Testnet: ${fujiSubnet.name} (${fujiSubnet.isActive ? 'Active' : 'Inactive'})`);
  console.log(`• Reactive Network: ${reactiveSubnet.name} (${reactiveSubnet.isActive ? 'Active' : 'Inactive'})`);

  // Check Avalanche quests
  console.log("\n🎯 Avalanche Quests:");
  for (let i = 1; i <= 3; i++) {
    const quest = await avalancheRushCChain.avalancheQuests(i);
    console.log(`${i}. ${quest.title}: ${ethers.utils.formatEther(quest.avaxReward)} AVAX + ${quest.rushReward} RUSH`);
  }

  // Display staking information
  console.log("\n🔥 AVAX Staking Features:");
  console.log("• Stake AVAX to earn 5% APY");
  console.log("• Minimum stake: 0.01 AVAX");
  console.log("• Lock period: 7 days");
  console.log("• Rewards auto-compound");

  // Display integration information
  console.log("\n🌐 Ecosystem Integrations:");
  console.log("• Chainlink VRF for verifiable randomness");
  console.log("• Cross-chain transfers between subnets");
  console.log("• DeFi protocol integrations (coming soon)");
  console.log("• NFT rewards with on-chain metadata");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: avalancheRushCChain.address,
    network: network.name,
    chainId: chainId,
    deployer: deployer,
    vrfCoordinator: config.vrfCoordinator,
    linkToken: config.linkToken,
    keyHash: config.keyHash,
    vrfFee: ethers.utils.formatEther(config.fee),
    avaxFunded: ethers.utils.formatEther(fundAmount),
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    features: {
      avaxStaking: true,
      subnetSupport: true,
      avalancheQuests: true,
      crossChainTransfers: true,
      vrfRandomness: true,
      nftRewards: true
    }
  };

  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `avalanche-cchain-${chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // Display next steps
  console.log("\n🎉 Avalanche C-Chain deployment completed successfully!");
  console.log("🔗 Next steps:");
  console.log("1. Update CONTRACT_ADDRESSES in useAvalancheCChain.ts");
  console.log("2. Test AVAX staking functionality");
  console.log("3. Join subnets and test cross-chain features");
  console.log("4. Complete Avalanche quests to test reward system");
  console.log("5. Monitor the contract for events and transactions");
  
  console.log("\n📋 Contract Summary:");
  console.log("=" .repeat(50));
  console.log(`🏔️ Contract: AvalancheRushCChain`);
  console.log(`📍 Address: ${avalancheRushCChain.address}`);
  console.log(`🌐 Network: ${network.name} (${chainId})`);
  console.log(`💰 AVAX Balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(avalancheRushCChain.address))}`);
  console.log(`🔗 Snowtrace: https://${chainId === 43113 ? 'testnet.' : ''}snowtrace.io/address/${avalancheRushCChain.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Avalanche C-Chain deployment failed:", error);
    process.exit(1);
  });
