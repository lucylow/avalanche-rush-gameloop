const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Deployment configuration
const DEPLOYMENT_CONFIG = {
  avalanche: {
    networkName: 'Avalanche Fuji Testnet',
    chainId: 43113,
    gasPrice: '25000000000', // 25 gwei
    gasLimit: 8000000,
    confirmations: 3
  },
  reactive: {
    networkName: 'Reactive Network',
    chainId: 5318008,
    gasPrice: '1000000000', // 1 gwei
    gasLimit: 10000000,
    confirmations: 1
  }
};

// Contract deployment order and dependencies
const DEPLOYMENT_ORDER = {
  avalanche: [
    'RushToken',
    'MockDEX',
    'AvalancheRushCore'
  ],
  reactive: [
    'ReactiveQuestEngineAdvanced',
    'EducationalNFT'
  ]
};

class DeploymentManager {
  constructor() {
    this.deployedContracts = {};
    this.deploymentLog = [];
    this.gasUsed = {};
    this.startTime = Date.now();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.deploymentLog.push(logEntry);
    
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
  }

  async deployContract(contractName, constructorArgs = [], options = {}) {
    try {
      this.log(`🚀 Deploying ${contractName}...`);
      
      const ContractFactory = await hre.ethers.getContractFactory(contractName);
      
      // Estimate gas
      const deploymentData = ContractFactory.interface.encodeDeploy(constructorArgs);
      const estimatedGas = await hre.ethers.provider.estimateGas({
        data: deploymentData
      });
      
      this.log(`⛽ Estimated gas: ${estimatedGas.toString()}`);
      
      // Deploy with gas optimization
      const contract = await ContractFactory.deploy(...constructorArgs, {
        gasLimit: estimatedGas * 120n / 100n, // 20% buffer
        ...options
      });
      
      this.log(`📝 Transaction hash: ${contract.deploymentTransaction().hash}`);
      
      // Wait for deployment
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      
      // Get deployment receipt
      const receipt = await contract.deploymentTransaction().wait();
      const gasUsed = receipt.gasUsed;
      const gasCost = gasUsed * receipt.gasPrice;
      
      this.deployedContracts[contractName] = {
        address,
        contract,
        deploymentHash: contract.deploymentTransaction().hash,
        gasUsed: gasUsed.toString(),
        gasCost: gasCost.toString(),
        blockNumber: receipt.blockNumber
      };
      
      this.gasUsed[contractName] = gasUsed;
      
      this.log(`✅ ${contractName} deployed to: ${address}`, 'success');
      this.log(`⛽ Gas used: ${gasUsed.toString()}`);
      this.log(`💰 Gas cost: ${hre.ethers.formatEther(gasCost)} ETH`);
      
      return contract;
    } catch (error) {
      this.log(`❌ Failed to deploy ${contractName}: ${error.message}`, 'error');
      throw error;
    }
  }

  async verifyContract(contractName, constructorArgs = []) {
    try {
      const contractInfo = this.deployedContracts[contractName];
      if (!contractInfo) {
        throw new Error(`Contract ${contractName} not found in deployment records`);
      }

      this.log(`🔍 Verifying ${contractName} on ${hre.network.name}...`);
      
      await hre.run("verify:verify", {
        address: contractInfo.address,
        constructorArguments: constructorArgs,
      });
      
      this.log(`✅ ${contractName} verified successfully`, 'success');
    } catch (error) {
      if (error.message.includes('Already Verified')) {
        this.log(`ℹ️ ${contractName} already verified`, 'info');
      } else {
        this.log(`❌ Failed to verify ${contractName}: ${error.message}`, 'error');
      }
    }
  }

  async setupContractInteractions() {
    try {
      this.log('🔧 Setting up contract interactions...');
      
      // Setup token minting permissions
      if (this.deployedContracts.RushToken && this.deployedContracts.AvalancheRushCore) {
        const rushToken = this.deployedContracts.RushToken.contract;
        const coreAddress = this.deployedContracts.AvalancheRushCore.address;
        
        this.log('🎫 Adding AvalancheRushCore as RUSH token minter...');
        const tx1 = await rushToken.addMinter(coreAddress);
        await tx1.wait();
        this.log('✅ Minter permission granted', 'success');
      }

      // Setup DEX liquidity
      if (this.deployedContracts.MockDEX) {
        const mockDEX = this.deployedContracts.MockDEX.contract;
        
        this.log('💧 Adding initial liquidity to DEX...');
        const tx2 = await mockDEX.addLiquidity({
          value: hre.ethers.parseEther('10') // 10 AVAX
        });
        await tx2.wait();
        this.log('✅ Initial liquidity added', 'success');
      }

      // Initialize quest system
      if (this.deployedContracts.ReactiveQuestEngineAdvanced) {
        this.log('🎯 Quest system initialized automatically via constructor');
      }

      this.log('✅ Contract interactions setup complete', 'success');
    } catch (error) {
      this.log(`❌ Failed to setup contract interactions: ${error.message}`, 'error');
      throw error;
    }
  }

  async deployToAvalanche() {
    this.log('🏔️ Starting Avalanche deployment...', 'info');
    
    const [deployer] = await hre.ethers.getSigners();
    this.log(`👤 Deployer: ${deployer.address}`);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    this.log(`💰 Balance: ${hre.ethers.formatEther(balance)} AVAX`);
    
    if (balance < hre.ethers.parseEther('1')) {
      this.log('⚠️ Low balance warning: Consider adding more AVAX for deployment', 'warning');
    }

    // Deploy RUSH Token
    const rushToken = await this.deployContract('RushToken');
    
    // Deploy MockDEX
    const mockDEX = await this.deployContract('MockDEX');
    
    // Deploy AvalancheRushCore
    const avalancheRushCore = await this.deployContract('AvalancheRushCore', [
      await rushToken.getAddress()
    ]);

    // Setup interactions
    await this.setupContractInteractions();

    this.log('🎉 Avalanche deployment completed!', 'success');
    return {
      rushToken,
      mockDEX,
      avalancheRushCore
    };
  }

  async deployToReactive() {
    this.log('⚡ Starting Reactive Network deployment...', 'info');
    
    const [deployer] = await hre.ethers.getSigners();
    this.log(`👤 Deployer: ${deployer.address}`);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    this.log(`💰 Balance: ${hre.ethers.formatEther(balance)} REACT`);

    // Mock addresses for Reactive deployment
    const mockReactiveInterface = "0x0000000000000000000000000000000000000001";
    const mockVRFCoordinator = "0x2eD832Ba664535e5886b75D64C46EB9a228C2610";
    const subscriptionId = 1;

    // Deploy ReactiveQuestEngineAdvanced
    const reactiveQuestEngine = await this.deployContract('ReactiveQuestEngineAdvanced', [
      mockReactiveInterface,
      subscriptionId,
      mockVRFCoordinator
    ]);

    // Deploy EducationalNFT
    const educationalNFT = await this.deployContract('EducationalNFT', [
      subscriptionId
    ]);

    this.log('🎉 Reactive Network deployment completed!', 'success');
    return {
      reactiveQuestEngine,
      educationalNFT
    };
  }

  async runTests() {
    this.log('🧪 Running post-deployment tests...');
    
    try {
      // Test basic contract functionality
      if (this.deployedContracts.RushToken) {
        const rushToken = this.deployedContracts.RushToken.contract;
        const totalSupply = await rushToken.totalSupply();
        this.log(`✅ RUSH Token total supply: ${hre.ethers.formatEther(totalSupply)}`);
      }

      if (this.deployedContracts.AvalancheRushCore) {
        const core = this.deployedContracts.AvalancheRushCore.contract;
        const [deployer] = await hre.ethers.getSigners();
        
        // Test game session creation
        this.log('🎮 Testing game session creation...');
        const tx = await core.startGame(0, 1, 1); // Classic mode, difficulty 1, level 1
        const receipt = await tx.wait();
        this.log('✅ Game session created successfully');
      }

      if (this.deployedContracts.MockDEX) {
        const dex = this.deployedContracts.MockDEX.contract;
        const [avaxReserve, usdcReserve] = await dex.getReserves();
        this.log(`✅ DEX reserves - AVAX: ${hre.ethers.formatEther(avaxReserve)}, USDC: ${hre.ethers.formatEther(usdcReserve)}`);
      }

      this.log('✅ All tests passed!', 'success');
    } catch (error) {
      this.log(`❌ Tests failed: ${error.message}`, 'error');
    }
  }

  generateDeploymentReport() {
    const endTime = Date.now();
    const totalTime = (endTime - this.startTime) / 1000;
    
    const report = {
      deployment: {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        timestamp: new Date().toISOString(),
        duration: `${totalTime}s`,
        deployer: this.deployedContracts.RushToken?.contract ? 
          this.deployedContracts.RushToken.contract.deploymentTransaction().from : 'unknown'
      },
      contracts: Object.entries(this.deployedContracts).map(([name, info]) => ({
        name,
        address: info.address,
        deploymentHash: info.deploymentHash,
        gasUsed: info.gasUsed,
        gasCost: info.gasCost,
        blockNumber: info.blockNumber
      })),
      gasUsage: {
        total: Object.values(this.gasUsed).reduce((a, b) => a + b, 0n).toString(),
        breakdown: Object.entries(this.gasUsed).map(([contract, gas]) => ({
          contract,
          gasUsed: gas.toString()
        }))
      },
      logs: this.deploymentLog
    };

    return report;
  }

  saveDeploymentReport(report) {
    const deploymentDir = path.join(__dirname, '..', 'deployment');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const filename = `deployment-${hre.network.name}-${Date.now()}.json`;
    const filepath = path.join(deploymentDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    this.log(`📄 Deployment report saved: ${filepath}`, 'success');
    
    // Also save a latest.json for easy access
    const latestPath = path.join(deploymentDir, `latest-${hre.network.name}.json`);
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
    
    return filepath;
  }

  generateFrontendConfig() {
    const config = {
      contracts: Object.entries(this.deployedContracts).reduce((acc, [name, info]) => {
        acc[name] = {
          address: info.address,
          deploymentBlock: info.blockNumber
        };
        return acc;
      }, {}),
      network: {
        name: hre.network.name,
        chainId: hre.network.config.chainId
      }
    };

    const configPath = path.join(__dirname, '..', 'frontend', 'src', 'config', 'contracts.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.log(`⚙️ Frontend config saved: ${configPath}`, 'success');
    
    return config;
  }
}

async function main() {
  const deploymentManager = new DeploymentManager();
  
  try {
    deploymentManager.log('🚀 Starting comprehensive deployment process...', 'info');
    deploymentManager.log(`📍 Network: ${hre.network.name}`, 'info');
    deploymentManager.log(`🔗 Chain ID: ${hre.network.config.chainId}`, 'info');

    let deployedContracts;

    if (hre.network.name === 'fuji' || hre.network.name === 'avalanche') {
      deployedContracts = await deploymentManager.deployToAvalanche();
    } else if (hre.network.name === 'reactive') {
      deployedContracts = await deploymentManager.deployToReactive();
    } else {
      throw new Error(`Unsupported network: ${hre.network.name}`);
    }

    // Run post-deployment tests
    await deploymentManager.runTests();

    // Generate and save reports
    const report = deploymentManager.generateDeploymentReport();
    const reportPath = deploymentManager.saveDeploymentReport(report);
    
    // Generate frontend configuration
    const frontendConfig = deploymentManager.generateFrontendConfig();

    // Final summary
    deploymentManager.log('🎉 Deployment Summary:', 'success');
    deploymentManager.log(`📊 Contracts deployed: ${Object.keys(deploymentManager.deployedContracts).length}`, 'info');
    deploymentManager.log(`⛽ Total gas used: ${report.gasUsage.total}`, 'info');
    deploymentManager.log(`⏱️ Total time: ${report.deployment.duration}`, 'info');
    deploymentManager.log(`📄 Report saved: ${reportPath}`, 'info');

    // Contract addresses for easy reference
    deploymentManager.log('📋 Contract Addresses:', 'info');
    Object.entries(deploymentManager.deployedContracts).forEach(([name, info]) => {
      deploymentManager.log(`   ${name}: ${info.address}`, 'info');
    });

    // Verification instructions
    deploymentManager.log('🔍 To verify contracts, run:', 'info');
    Object.keys(deploymentManager.deployedContracts).forEach(contractName => {
      deploymentManager.log(`   npx hardhat verify --network ${hre.network.name} ${deploymentManager.deployedContracts[contractName].address}`, 'info');
    });

    deploymentManager.log('✨ Deployment completed successfully!', 'success');

  } catch (error) {
    deploymentManager.log(`💥 Deployment failed: ${error.message}`, 'error');
    deploymentManager.log(`📚 Stack trace: ${error.stack}`, 'error');
    
    // Save error report
    const errorReport = deploymentManager.generateDeploymentReport();
    errorReport.error = {
      message: error.message,
      stack: error.stack
    };
    deploymentManager.saveDeploymentReport(errorReport);
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
