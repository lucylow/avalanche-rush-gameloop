const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Avalanche Rush Monetization Deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "AVAX\n");

  // Deploy contracts in order
  const deployedContracts = {};

  try {
    // 1. Deploy RushToken
    console.log("📄 Deploying RushToken...");
    const RushToken = await ethers.getContractFactory("RushToken");
    const rushToken = await RushToken.deploy();
    await rushToken.waitForDeployment();
    deployedContracts.rushToken = await rushToken.getAddress();
    console.log("✅ RushToken deployed to:", deployedContracts.rushToken);

    // 2. Deploy RushNFT
    console.log("\n📄 Deploying RushNFT...");
    const baseURI = "https://api.avalanche-rush.com/nft/";
    const RushNFT = await ethers.getContractFactory("RushNFT");
    const rushNFT = await RushNFT.deploy(baseURI);
    await rushNFT.waitForDeployment();
    deployedContracts.rushNFT = await rushNFT.getAddress();
    console.log("✅ RushNFT deployed to:", deployedContracts.rushNFT);

    // 3. Deploy SubscriptionManager
    console.log("\n📄 Deploying SubscriptionManager...");
    const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
    const subscriptionManager = await SubscriptionManager.deploy(deployedContracts.rushToken);
    await subscriptionManager.waitForDeployment();
    deployedContracts.subscriptionManager = await subscriptionManager.getAddress();
    console.log("✅ SubscriptionManager deployed to:", deployedContracts.subscriptionManager);

    // 4. Deploy TournamentManager
    console.log("\n📄 Deploying TournamentManager...");
    const TournamentManager = await ethers.getContractFactory("TournamentManager");
    const tournamentManager = await TournamentManager.deploy(deployedContracts.rushToken);
    await tournamentManager.waitForDeployment();
    deployedContracts.tournamentManager = await tournamentManager.getAddress();
    console.log("✅ TournamentManager deployed to:", deployedContracts.tournamentManager);

    // 5. Deploy Marketplace
    console.log("\n📄 Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(deployedContracts.rushToken, deployedContracts.rushNFT);
    await marketplace.waitForDeployment();
    deployedContracts.marketplace = await marketplace.getAddress();
    console.log("✅ Marketplace deployed to:", deployedContracts.marketplace);

    // Configure contracts
    console.log("\n🔧 Configuring contracts...");
    
    // Add TournamentManager as minter for RushToken
    console.log("Adding TournamentManager as RushToken minter...");
    await rushToken.addMinter(deployedContracts.tournamentManager);
    
    // Add SubscriptionManager as minter for RushToken (for rewards)
    console.log("Adding SubscriptionManager as RushToken minter...");
    await rushToken.addMinter(deployedContracts.subscriptionManager);

    // Add Marketplace as minter for RushNFT (if needed)
    console.log("Setting up NFT permissions...");
    // The marketplace doesn't mint NFTs directly, so no additional setup needed

    console.log("\n✅ Contract configuration completed!");

    // Display deployment summary
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("=" * 50);
    console.log(`RushToken:           ${deployedContracts.rushToken}`);
    console.log(`RushNFT:             ${deployedContracts.rushNFT}`);
    console.log(`SubscriptionManager: ${deployedContracts.subscriptionManager}`);
    console.log(`TournamentManager:   ${deployedContracts.tournamentManager}`);
    console.log(`Marketplace:         ${deployedContracts.marketplace}`);
    console.log("=" * 50);

    // Generate environment variables
    console.log("\n📝 Environment Variables:");
    console.log(`VITE_RUSH_TOKEN_ADDRESS=${deployedContracts.rushToken}`);
    console.log(`VITE_RUSH_NFT_ADDRESS=${deployedContracts.rushNFT}`);
    console.log(`VITE_SUBSCRIPTION_MANAGER_ADDRESS=${deployedContracts.subscriptionManager}`);
    console.log(`VITE_TOURNAMENT_MANAGER_ADDRESS=${deployedContracts.tournamentManager}`);
    console.log(`VITE_MARKETPLACE_ADDRESS=${deployedContracts.marketplace}`);

    // Create initial tournament
    console.log("\n🏆 Creating initial tournament...");
    try {
      await tournamentManager.createTournament(
        "Launch Tournament",
        "Welcome tournament for the launch of Avalanche Rush monetization",
        0, // DAILY
        24 * 60 * 60, // 24 hours
        100 // max participants
      );
      console.log("✅ Initial tournament created!");
    } catch (error) {
      console.log("⚠️  Failed to create initial tournament:", error.message);
    }

    // Mint some initial NFTs for testing
    console.log("\n🎨 Minting test NFTs...");
    try {
      // Mint a few test NFTs to the deployer
      await rushNFT.mintAchievement(
        deployer.address,
        0, // BRONZE
        1000,
        "Genesis Achievement",
        100,
        ["First", "Genesis", "Rare"]
      );

      await rushNFT.mintAchievement(
        deployer.address,
        2, // GOLD
        5000,
        "Legendary Player",
        500,
        ["Legendary", "High Score", "Elite"]
      );

      console.log("✅ Test NFTs minted!");
    } catch (error) {
      console.log("⚠️  Failed to mint test NFTs:", error.message);
    }

    // Display token information
    console.log("\n💰 Token Information:");
    const totalSupply = await rushToken.totalSupply();
    const rewardPool = await rushToken.getRewardPoolRemaining();
    console.log(`Total Supply: ${ethers.formatEther(totalSupply)} RUSH`);
    console.log(`Reward Pool Remaining: ${ethers.formatEther(rewardPool)} RUSH`);

    console.log("\n🎉 Monetization system deployment completed successfully!");
    console.log("\n🔗 Next Steps:");
    console.log("1. Update frontend environment variables");
    console.log("2. Verify contracts on block explorer");
    console.log("3. Test subscription functionality");
    console.log("4. Test tournament participation");
    console.log("5. Test NFT marketplace");
    console.log("6. Set up monitoring and analytics");

    // Save deployment information
    const deploymentInfo = {
      network: await deployer.provider.getNetwork(),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
      gasUsed: "TBD", // Would need to track gas usage
      blockNumber: await deployer.provider.getBlockNumber()
    };

    const fs = require('fs');
    fs.writeFileSync(
      'deployment-monetization.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n📄 Deployment info saved to deployment-monetization.json");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment script error:", error);
    process.exit(1);
  });
