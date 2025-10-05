import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Avalanche C-Chain Contract ABI
const AVALANCHE_CCHAIN_ABI = [
  "function stakeAVAX() external payable",
  "function unstakeAVAX(uint256 amount) external",
  "function calculateStakingRewards(address player) external view returns (uint256)",
  "function joinSubnet(uint256 subnetId) external",
  "function completeAvalancheQuest(uint256 questId) external",
  "function initiateCrossChainTransfer(uint256 amount, uint256 toChain) external payable",
  "function openDeFiPosition(address protocol, uint256 amount, uint256 apy) external payable",
  "function closeDeFiPosition(uint256 positionIndex) external",
  "function getPlayerAvalancheStats(address player) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
  "event AVAXStaked(address indexed player, uint256 amount, uint256 timestamp)",
  "event AvalancheQuestCompleted(address indexed player, uint256 questId, uint256 avaxReward)",
  "event SubnetJoined(address indexed player, uint256 subnetId, string subnetName)"
];

interface AvalancheStats {
  stakedAVAX: string;
  stakingRewards: string;
  subnetId: number;
  completedQuests: number;
  deFiPositions: number;
  totalAVAXEarned: string;
}

interface SubnetInfo {
  name: string;
  chainId: number;
  isActive: boolean;
  totalPlayers: number;
}

interface AvalancheQuest {
  id: number;
  title: string;
  description: string;
  avaxReward: string;
  rushReward: number;
  difficulty: number;
  isActive: boolean;
  isCompleted: boolean;
}

export const useAvalancheCChain = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerStats, setPlayerStats] = useState<AvalancheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Avalanche C-Chain contract addresses
  const CONTRACT_ADDRESSES = {
    43114: '0x...', // Avalanche Mainnet (to be deployed)
    43113: '0x...', // Avalanche Fuji Testnet (to be deployed)
  };

  // Avalanche subnets
  const AVALANCHE_SUBNETS: Record<number, SubnetInfo> = {
    43114: {
      name: "Avalanche C-Chain",
      chainId: 43114,
      isActive: true,
      totalPlayers: 0
    },
    43113: {
      name: "Fuji Testnet", 
      chainId: 43113,
      isActive: true,
      totalPlayers: 0
    },
    42: {
      name: "Reactive Network",
      chainId: 42,
      isActive: true,
      totalPlayers: 0
    }
  };

  // Avalanche quests
  const AVALANCHE_QUESTS: AvalancheQuest[] = [
    {
      id: 1,
      title: "AVAX Staking Master",
      description: "Stake 1 AVAX for 7 days to earn rewards",
      avaxReward: "0.1",
      rushReward: 1000,
      difficulty: 2,
      isActive: true,
      isCompleted: false
    },
    {
      id: 2,
      title: "Subnet Explorer", 
      description: "Complete games on 3 different Avalanche subnets",
      avaxReward: "0.2",
      rushReward: 2000,
      difficulty: 3,
      isActive: true,
      isCompleted: false
    },
    {
      id: 3,
      title: "DeFi Pioneer",
      description: "Provide liquidity to an Avalanche DeFi protocol",
      avaxReward: "0.3",
      rushReward: 3000,
      difficulty: 4,
      isActive: true,
      isCompleted: false
    }
  ];

  // Initialize contract
  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setCurrentChainId(Number(network.chainId));
          
          const contractAddress = CONTRACT_ADDRESSES[Number(network.chainId) as keyof typeof CONTRACT_ADDRESSES];
          
          if (contractAddress) {
            const avalancheContract = new ethers.Contract(contractAddress, AVALANCHE_CCHAIN_ABI, signer);
            setContract(avalancheContract);
            setIsConnected(true);
            
            // Load player stats
            await loadPlayerStats((signer as any).address);
            
            // Setup event listeners
            setupEventListeners(avalancheContract);
          }
        } catch (error) {
          console.error('Failed to initialize Avalanche C-Chain contract:', error);
        }
      }
    };

    initializeContract();
  }, []);

  // Setup event listeners
  const setupEventListeners = (contract: ethers.Contract) => {
    // AVAX Staking events
    contract.on('AVAXStaked', (player, amount, timestamp) => {
      console.log('AVAX Staked:', { player, amount: ethers.formatEther(amount), timestamp });
      if ((window as any).triggerReward) {
        (window as any).triggerReward('avaxStaked', { amount: ethers.formatEther(amount) });
      }
    });

    // Quest completion events
    contract.on('AvalancheQuestCompleted', (player, questId, avaxReward) => {
      console.log('Avalanche Quest Completed:', { player, questId, avaxReward: ethers.formatEther(avaxReward) });
      if ((window as any).triggerReward) {
        (window as any).triggerReward('avalancheQuest', { questId, reward: ethers.formatEther(avaxReward) });
      }
    });

    // Subnet events
    contract.on('SubnetJoined', (player, subnetId, subnetName) => {
      console.log('Subnet Joined:', { player, subnetId, subnetName });
      if ((window as any).triggerReward) {
        (window as any).triggerReward('subnetJoined', { subnetId, subnetName });
      }
    });
  };

  // Load player statistics
  const loadPlayerStats = useCallback(async (playerAddress: string) => {
    if (!contract) return;

    try {
      const [
        stakedAVAX,
        stakingRewards,
        subnetId,
        completedQuests,
        deFiPositions,
        totalAVAXEarned
      ] = await contract.getPlayerAvalancheStats(playerAddress);

      setPlayerStats({
        stakedAVAX: ethers.formatEther(stakedAVAX),
        stakingRewards: ethers.formatEther(stakingRewards),
        subnetId: Number(subnetId),
        completedQuests: Number(completedQuests),
        deFiPositions: Number(deFiPositions),
        totalAVAXEarned: ethers.formatEther(totalAVAXEarned)
      });
    } catch (error) {
      console.error('Failed to load Avalanche stats:', error);
    }
  }, [contract]);

  // Stake AVAX
  const stakeAVAX = useCallback(async (amount: string): Promise<boolean> => {
    if (!contract) return false;

    try {
      setIsLoading(true);
      
      const tx = await contract.stakeAVAX({
        value: ethers.parseEther(amount)
      });
      
      await tx.wait();
      
      // Reload stats
      const signer = contract.runner;
      if (signer && (signer as any).address) {
        await loadPlayerStats((signer as any).address);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to stake AVAX:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract, loadPlayerStats]);

  // Unstake AVAX
  const unstakeAVAX = useCallback(async (amount: string): Promise<boolean> => {
    if (!contract) return false;

    try {
      setIsLoading(true);
      
      const tx = await contract.unstakeAVAX(ethers.parseEther(amount));
      await tx.wait();
      
      // Reload stats
      const signer = contract.runner;
      if (signer && (signer as any).address) {
        await loadPlayerStats((signer as any).address);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to unstake AVAX:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract, loadPlayerStats]);

  // Join subnet
  const joinSubnet = useCallback(async (subnetId: number): Promise<boolean> => {
    if (!contract) return false;

    try {
      setIsLoading(true);
      
      const tx = await contract.joinSubnet(subnetId);
      await tx.wait();
      
      // Reload stats
      const signer = contract.runner;
      if (signer && (signer as any).address) {
        await loadPlayerStats((signer as any).address);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to join subnet:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract, loadPlayerStats]);

  // Complete Avalanche quest
  const completeAvalancheQuest = useCallback(async (questId: number): Promise<boolean> => {
    if (!contract) return false;

    try {
      setIsLoading(true);
      
      const tx = await contract.completeAvalancheQuest(questId);
      await tx.wait();
      
      // Reload stats
      const signer = contract.runner;
      if (signer && (signer as any).address) {
        await loadPlayerStats((signer as any).address);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to complete Avalanche quest:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract, loadPlayerStats]);

  // Initiate cross-chain transfer
  const initiateCrossChainTransfer = useCallback(async (amount: string, toChain: number): Promise<boolean> => {
    if (!contract) return false;

    try {
      setIsLoading(true);
      
      const tx = await contract.initiateCrossChainTransfer(
        ethers.parseEther(amount),
        toChain,
        {
          value: ethers.parseEther(amount)
        }
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to initiate cross-chain transfer:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Open DeFi position
  const openDeFiPosition = useCallback(async (
    protocol: string,
    amount: string,
    apy: number
  ): Promise<boolean> => {
    if (!contract) return false;

    try {
      setIsLoading(true);
      
      const tx = await contract.openDeFiPosition(
        protocol,
        ethers.parseEther(amount),
        apy,
        {
          value: ethers.parseEther(amount)
        }
      );
      
      await tx.wait();
      
      // Reload stats
      const signer = contract.runner;
      if (signer && (signer as any).address) {
        await loadPlayerStats((signer as any).address);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to open DeFi position:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract, loadPlayerStats]);

  // Close DeFi position
  const closeDeFiPosition = useCallback(async (positionIndex: number): Promise<boolean> => {
    if (!contract) return false;

    try {
      setIsLoading(true);
      
      const tx = await contract.closeDeFiPosition(positionIndex);
      await tx.wait();
      
      // Reload stats
      const signer = contract.runner;
      if (signer && (signer as any).address) {
        await loadPlayerStats((signer as any).address);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to close DeFi position:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract, loadPlayerStats]);

  // Calculate staking rewards
  const calculateStakingRewards = useCallback(async (playerAddress: string): Promise<string> => {
    if (!contract) return '0';

    try {
      const rewards = await contract.calculateStakingRewards(playerAddress);
      return ethers.formatEther(rewards);
    } catch (error) {
      console.error('Failed to calculate staking rewards:', error);
      return '0';
    }
  }, [contract]);

  // Check if on Avalanche C-Chain
  const isOnAvalancheChain = useCallback(() => {
    return currentChainId === 43114 || currentChainId === 43113;
  }, [currentChainId]);

  // Get subnet info
  const getSubnetInfo = useCallback((subnetId: number): SubnetInfo | null => {
    return AVALANCHE_SUBNETS[subnetId] || null;
  }, []);

  // Get available quests
  const getAvalancheQuests = useCallback((): AvalancheQuest[] => {
    return AVALANCHE_QUESTS;
  }, []);

  return {
    // State
    isConnected,
    isLoading,
    playerStats,
    currentChainId,
    
    // Functions
    stakeAVAX,
    unstakeAVAX,
    joinSubnet,
    completeAvalancheQuest,
    initiateCrossChainTransfer,
    openDeFiPosition,
    closeDeFiPosition,
    calculateStakingRewards,
    loadPlayerStats,
    
    // Utilities
    isOnAvalancheChain,
    getSubnetInfo,
    getAvalancheQuests,
    
    // Constants
    AVALANCHE_SUBNETS,
    AVALANCHE_QUESTS
  };
};
