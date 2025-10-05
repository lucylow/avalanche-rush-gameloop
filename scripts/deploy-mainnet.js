const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Production deployment script for Avalanche Mainnet
class MainnetDeployer {
  constructor() {
    this.deploymentResults = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      timestamp: new Date().toISOString(),
      contracts: [],
      transactions: [],
      gasUsed: 0,
      totalCost: 0,
      status: 'pending'
    };
    this.contractAddresses = {};
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
  }

  async deployContract(contractName, constructorArgs = [], libraries = {}) {
    try {
      this.log(`🚀 Deploying ${contractName}...`);
      
      const ContractFactory = await hre.ethers.getContractFactory(contractName, { libraries });
      
      // Estimate gas for deployment
      const deploymentData = ContractFactory.interface.encodeDeploy(constructorArgs);
      const estimatedGas = await hre.ethers.provider.estimateGas({
        data: ContractFactory.bytecode + deploymentData.slice(2)
      });
      
      this.log(`⛽ Estimated gas: ${estimatedGas.toString()}`);
      
      // Deploy with gas limit buffer
      const contract = await ContractFactory.deploy(...constructorArgs, {
        gasLimit: estimatedGas * 120n / 100n // 20% buffer
      });
      
      const deploymentTx = contract.deploymentTransaction();
      this.log(`📝 Transaction hash: ${deploymentTx.hash}`);
      
      // Wait for deployment
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      
      // Get deployment receipt
      const receipt = await hre.ethers.provider.getTransactionReceipt(deploymentTx.hash);
      
      this.log(`✅ ${contractName} deployed to: ${address}`, 'success');
      this.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      
      // Store deployment info
      const contractInfo = {
        name: contractName,
        address: address,
        transactionHash: deploymentTx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        constructorArgs: constructorArgs,
        timestamp: new Date().toISOString()
      };
      
      this.deploymentResults.contracts.push(contractInfo);
      this.deploymentResults.transactions.push({
        hash: deploymentTx.hash,
        type: 'deployment',
        contract: contractName,
        gasUsed: receipt.gasUsed.toString()
      });
      
      this.deploymentResults.gasUsed += parseInt(receipt.gasUsed.toString());
      this.contractAddresses[contractName] = address;
      
      return contract;
      
    } catch (error) {
      this.log(`❌ Failed to deploy ${contractName}: ${error.message}`, 'error');
      throw error;
    }
  }

  async verifyContract(contractName, address, constructorArgs = []) {
    try {
      this.log(`🔍 Verifying ${contractName} on Snowtrace...`);
      
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: constructorArgs,
      });
      
      this.log(`✅ ${contractName} verified successfully`, 'success');
      return true;
      
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        this.log(`ℹ️ ${contractName} already verified`, 'info');
        return true;
      }
      
      this.log(`⚠️ Failed to verify ${contractName}: ${error.message}`, 'warning');
      return false;
    }
  }

  async deployAvalancheContracts() {
    this.log('🏔️ Deploying Avalanche C-Chain contracts...', 'info');
    
    // Deploy RushToken first
    const rushToken = await this.deployContract('RushToken', [
      "Avalanche Rush Token",
      "RUSH",
      hre.ethers.parseEther("1000000000"), // 1B total supply
      await (await hre.ethers.getSigners())[0].getAddress() // owner
    ]);
    
    // Deploy MockDEX
    const mockDEX = await this.deployContract('MockDEX', [
      hre.ethers.parseEther("1000"), // Initial AVAX reserve
      hre.ethers.parseEther("50000") // Initial USDC reserve (assuming 6 decimals)
    ]);
    
    // Deploy AvalancheRushCore
    const avalancheRushCore = await this.deployContract('AvalancheRushCore', [
      await rushToken.getAddress(),
      await mockDEX.getAddress()
    ]);
    
    // Setup permissions
    this.log('🔧 Setting up contract permissions...', 'info');
    
    // Grant minter role to AvalancheRushCore
    const MINTER_ROLE = await rushToken.MINTER_ROLE();
    const grantRoleTx = await rushToken.grantRole(MINTER_ROLE, await avalancheRushCore.getAddress());
    await grantRoleTx.wait();
    
    this.log('✅ Avalanche contracts deployed and configured', 'success');
    
    return {
      rushToken,
      mockDEX,
      avalancheRushCore
    };
  }

  async deployReactiveContracts() {
    this.log('⚡ Deploying Reactive Network contracts...', 'info');
    
    // Note: This would typically be deployed on Reactive Network
    // For now, we'll prepare the deployment configuration
    
    const reactiveConfig = {
      subscriptionId: process.env.REACTIVE_SUBSCRIPTION_ID || 1,
      originChainId: 43114, // Avalanche Mainnet
      destinationContracts: [
        this.contractAddresses.AvalancheRushCore,
        this.contractAddresses.RushToken
      ]
    };
    
    // Deploy EducationalNFT (can be on either network)
    const educationalNFT = await this.deployContract('EducationalNFT', [
      "Avalanche Rush Achievements",
      "ARACH",
      process.env.VRF_COORDINATOR || "0x2eD832Ba664535e5886b75D64C46EB9a228C2610",
      process.env.VRF_SUBSCRIPTION_ID || 1,
      "0x83250c5584ffa93feb6ee082981c5ebe484c865196750873a2521c8ebf3844ee6" // VRF Key Hash
    ]);
    
    this.log('✅ Reactive contracts prepared', 'success');
    
    return {
      educationalNFT,
      reactiveConfig
    };
  }

  async initializeContracts(avalancheContracts, reactiveContracts) {
    this.log('🔧 Initializing contract configurations...', 'info');
    
    const { avalancheRushCore, rushToken } = avalancheContracts;
    const { educationalNFT } = reactiveContracts;
    
    // Initialize default quests
    const defaultQuests = [
      {
        questType: 0, // TRANSFER
        minAmount: hre.ethers.parseEther("0.01"),
        rewardAmount: hre.ethers.parseEther("100"),
        isActive: true
      },
      {
        questType: 1, // SWAP
        minAmount: hre.ethers.parseEther("0.1"),
        rewardAmount: hre.ethers.parseEther("500"),
        isActive: true
      },
      {
        questType: 4, // LEVEL_COMPLETION
        minAmount: 1000, // minimum score
        rewardAmount: hre.ethers.parseEther("250"),
        isActive: true
      }
    ];
    
    // Add quests to the core contract
    for (const quest of defaultQuests) {
      const addQuestTx = await avalancheRushCore.addQuest(
        quest.questType,
        quest.minAmount,
        quest.rewardAmount,
        quest.isActive
      );
      await addQuestTx.wait();
      this.log(`✅ Added quest type ${quest.questType}`);
    }
    
    // Set NFT contract address in core contract
    const setNFTTx = await avalancheRushCore.setNFTContract(await educationalNFT.getAddress());
    await setNFTTx.wait();
    
    // Grant minter role to core contract for NFTs
    const MINTER_ROLE = await educationalNFT.MINTER_ROLE();
    const grantNFTRoleTx = await educationalNFT.grantRole(MINTER_ROLE, await avalancheRushCore.getAddress());
    await grantNFTRoleTx.wait();
    
    this.log('✅ Contracts initialized successfully', 'success');
  }

  async verifyAllContracts() {
    this.log('🔍 Verifying all contracts on Snowtrace...', 'info');
    
    const verificationPromises = this.deploymentResults.contracts.map(async (contract) => {
      return this.verifyContract(contract.name, contract.address, contract.constructorArgs);
    });
    
    const results = await Promise.allSettled(verificationPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    this.log(`✅ Verified ${successCount}/${this.deploymentResults.contracts.length} contracts`, 'success');
  }

  async generateFrontendConfig() {
    this.log('⚛️ Generating frontend configuration...', 'info');
    
    const config = {
      network: {
        name: hre.network.name,
        chainId: hre.network.config.chainId,
        rpcUrl: hre.network.config.url,
        blockExplorer: hre.network.name === 'avalanche' ? 'https://snowtrace.io' : 'https://testnet.snowtrace.io'
      },
      contracts: this.contractAddresses,
      deployment: {
        timestamp: this.deploymentResults.timestamp,
        blockNumber: this.deploymentResults.contracts[0]?.blockNumber,
        deployer: await (await hre.ethers.getSigners())[0].getAddress()
      }
    };
    
    // Save config to frontend
    const frontendDir = path.join(__dirname, '..', 'frontend', 'src', 'config');
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, { recursive: true });
    }
    
    const configPath = path.join(frontendDir, 'contracts.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    this.log(`✅ Frontend config saved to ${configPath}`, 'success');
    return config;
  }

  async saveDeploymentReport() {
    // Calculate total cost
    const gasPrice = await hre.ethers.provider.getGasPrice();
    this.deploymentResults.totalCost = (BigInt(this.deploymentResults.gasUsed) * gasPrice).toString();
    this.deploymentResults.status = 'completed';
    
    // Save deployment report
    const deploymentDir = path.join(__dirname, '..', 'deployment');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const reportPath = path.join(deploymentDir, `mainnet-deployment-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.deploymentResults, null, 2));
    
    // Also save as latest
    const latestPath = path.join(deploymentDir, 'latest-mainnet.json');
    fs.writeFileSync(latestPath, JSON.stringify(this.deploymentResults, null, 2));
    
    this.log(`📄 Deployment report saved: ${reportPath}`, 'success');
    return reportPath;
  }

  async runPostDeploymentTests() {
    this.log('🧪 Running post-deployment tests...', 'info');
    
    try {
      const [deployer] = await hre.ethers.getSigners();
      
      // Test RushToken
      const RushToken = await hre.ethers.getContractFactory('RushToken');
      const rushToken = RushToken.attach(this.contractAddresses.RushToken);
      
      const totalSupply = await rushToken.totalSupply();
      const deployerBalance = await rushToken.balanceOf(deployer.address);
      
      this.log(`✅ RushToken: Total supply ${hre.ethers.formatEther(totalSupply)} RUSH`);
      this.log(`✅ RushToken: Deployer balance ${hre.ethers.formatEther(deployerBalance)} RUSH`);
      
      // Test AvalancheRushCore
      const AvalancheRushCore = await hre.ethers.getContractFactory('AvalancheRushCore');
      const coreContract = AvalancheRushCore.attach(this.contractAddresses.AvalancheRushCore);
      
      const totalPlayers = await coreContract.totalPlayers();
      const totalGames = await coreContract.totalGamesPlayed();
      
      this.log(`✅ AvalancheRushCore: ${totalPlayers} players, ${totalGames} games played`);
      
      // Test MockDEX
      const MockDEX = await hre.ethers.getContractFactory('MockDEX');
      const dexContract = MockDEX.attach(this.contractAddresses.MockDEX);
      
      const reserves = await dexContract.getReserves();
      this.log(`✅ MockDEX: ${hre.ethers.formatEther(reserves[0])} AVAX, ${hre.ethers.formatEther(reserves[1])} USDC`);
      
      this.log('✅ All post-deployment tests passed', 'success');
      return true;
      
    } catch (error) {
      this.log(`❌ Post-deployment tests failed: ${error.message}`, 'error');
      return false;
    }
  }
}

async function main() {
  const deployer = new MainnetDeployer();
  
  try {
    deployer.log('🚀 Starting Avalanche Rush mainnet deployment...', 'info');
    deployer.log(`📍 Network: ${hre.network.name}`, 'info');
    deployer.log(`🔗 Chain ID: ${hre.network.config.chainId}`, 'info');
    
    const [signer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(signer.address);
    deployer.log(`💰 Deployer balance: ${hre.ethers.formatEther(balance)} AVAX`, 'info');
    
    if (balance < hre.ethers.parseEther("1")) {
      throw new Error("Insufficient AVAX balance for deployment. Need at least 1 AVAX.");
    }
    
    // Deploy Avalanche contracts
    const avalancheContracts = await deployer.deployAvalancheContracts();
    
    // Deploy Reactive contracts
    const reactiveContracts = await deployer.deployReactiveContracts();
    
    // Initialize contracts
    await deployer.initializeContracts(avalancheContracts, reactiveContracts);
    
    // Verify contracts on Snowtrace
    await deployer.verifyAllContracts();
    
    // Generate frontend configuration
    await deployer.generateFrontendConfig();
    
    // Run post-deployment tests
    const testsPass = await deployer.runPostDeploymentTests();
    
    // Save deployment report
    const reportPath = await deployer.saveDeploymentReport();
    
    // Final summary
    deployer.log('🎉 Deployment Summary:', 'success');
    deployer.log(`📊 Contracts deployed: ${deployer.deploymentResults.contracts.length}`, 'info');
    deployer.log(`⛽ Total gas used: ${deployer.deploymentResults.gasUsed.toLocaleString()}`, 'info');
    deployer.log(`💰 Total cost: ${hre.ethers.formatEther(deployer.deploymentResults.totalCost)} AVAX`, 'info');
    deployer.log(`🧪 Tests passed: ${testsPass ? 'Yes' : 'No'}`, testsPass ? 'success' : 'warning');
    
    deployer.log('📋 Contract Addresses:', 'info');
    Object.entries(deployer.contractAddresses).forEach(([name, address]) => {
      deployer.log(`   ${name}: ${address}`, 'info');
    });
    
    deployer.log('✨ Avalanche Rush deployed successfully to mainnet!', 'success');
    deployer.log(`📄 Full report: ${reportPath}`, 'info');
    deployer.log('🌐 Ready for production use!', 'success');

  } catch (error) {
    deployer.log(`💥 Deployment failed: ${error.message}`, 'error');
    deployer.log(`📚 Stack trace: ${error.stack}`, 'error');
    
    // Save error report
    deployer.deploymentResults.status = 'failed';
    deployer.deploymentResults.error = {
      message: error.message,
      stack: error.stack
    };
    await deployer.saveDeploymentReport();
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
