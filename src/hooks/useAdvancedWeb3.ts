import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import SmartContractService from '../services/SmartContractService';

// Enhanced contract ABIs with full functionality
const AVALANCHE_RUSH_CORE_ABI = [
  "function startGame(uint8 mode, uint256 difficulty, uint256 levelId) external returns (uint256)",
  "function completeGame(uint256 sessionId, uint256 finalScore, string[] calldata achievementsUnlocked, uint256[] calldata skillPointsEarned, string[] calldata skillNames) external",
  "function getPlayerProfile(address player) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function getGameSession(uint256 sessionId) external view returns (address, uint256, uint256, uint256, uint256, uint8, bool)",
  "function getLeaderboard(uint8 mode, uint256 limit) external view returns (address[], uint256[], uint256[])",
  "function getSkillPoints(address player, string calldata skill) external view returns (uint256)",
  "function hasAchievement(address player, string calldata achievement) external view returns (bool)",
  "function getLevel(uint256 levelId) external view returns (string, uint256, uint256, uint256, bool)",
  "event GameStarted(address indexed player, uint256 sessionId, uint8 mode, uint256 timestamp)",
  "event GameCompleted(address indexed player, uint256 sessionId, uint256 finalScore, uint256 reward)",
  "event LevelCompleted(address indexed player, uint256 level, uint256 score)",
  "event HighScoreBeat(address indexed player, uint256 newScore, uint256 previousScore)",
  "event AchievementUnlocked(address indexed player, string achievement, uint8 aType)",
  "event StreakAchieved(address indexed player, uint256 streakDays)"
];

const REACTIVE_QUEST_ENGINE_ABI = [
  "function getPlayerProfile(address player) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
  "function getCurrentRaffle() external view returns (uint256, uint256, uint256, uint256, uint256, bool)",
  "function questCompletions(address player, uint256 questId) external view returns (bool)",
  "function quests(uint256 questId) external view returns (uint256, uint8, uint8, address, uint256, uint256, uint256, bool, uint256, uint256, string)",
  "event QuestCompleted(address indexed player, uint256 questId, uint256 reward, uint256 timestamp)",
  "event RaffleEntered(address indexed player, uint256 raffleId, uint256 tickets)",
  "event RaffleWinner(uint256 raffleId, address winner, uint256 prize)"
];

const EDUCATIONAL_NFT_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function achievements(uint256 tokenId) external view returns (uint256, uint256, uint256, string, bool, uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function getCurrentRaffleId() external view returns (uint256)",
  "function raffleParticipants(uint256 raffleId, uint256 index) external view returns (address)",
  "event RareNFTMinted(address indexed player, uint256 tokenId, uint256 raffleId)"
];

const RUSH_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const MOCK_DEX_ABI = [
  "function swapAVAXForUSDC(uint256 minUSDCOut) external payable",
  "function swapUSDCForAVAX(uint256 usdcIn, uint256 minAVAXOut) external",
  "function getBalance(address account) external view returns (uint256)",
  "function getReserves() external view returns (uint256, uint256)",
  "function addLiquidity() external payable",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)"
];

// Enhanced interfaces
interface ContractAddresses {
  avalancheRushCore: string;
  reactiveQuestEngine: string;
  educationalNFT: string;
  rushToken: string;
  mockDEX: string;
}

interface PlayerProfile {
  totalScore: number;
  highestScore: number;
  currentLevel: number;
  experience: number;
  totalGamesPlayed: number;
  streakDays: number;
  totalRewardsEarned: string;
  isActive: boolean;
}

interface ReactiveProfile {
  totalScore: number;
  highestScore: number;
  level: number;
  experience: number;
  streakDays: number;
  totalQuestsCompleted: number;
  totalRewardsEarned: string;
}

interface GameSession {
  player: string;
  startTime: number;
  endTime: number;
  finalScore: number;
  level: number;
  mode: number;
  isCompleted: boolean;
}

interface Quest {
  questId: number;
  qType: number;
  difficulty: number;
  verificationContract: string;
  minAmount: string;
  baseReward: string;
  bonusMultiplier: number;
  isActive: boolean;
  completionCount: number;
  maxCompletions: number;
  metadata: string;
}

interface NFTAchievement {
  tokenId: number;
  questId: number;
  score: number;
  timestamp: number;
  metadata: string;
  isRare: boolean;
  raffleTickets: number;
}

interface RaffleInfo {
  raffleId: number;
  startTime: number;
  endTime: number;
  prizePool: string;
  participantCount: number;
  isActive: boolean;
}

interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: number;
}

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  networkName: string;
}

// Network configurations
const NETWORKS = {
  AVALANCHE_FUJI: {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorer: 'https://testnet.snowtrace.io',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 }
  },
  REACTIVE_MAINNET: {
    chainId: 5318008,
    name: 'Reactive Network',
    rpcUrl: 'https://rpc.reactive.network',
    blockExplorer: 'https://explorer.reactive.network',
    nativeCurrency: { name: 'REACT', symbol: 'REACT', decimals: 18 }
  }
};

const CONTRACT_ADDRESSES: ContractAddresses = {
  avalancheRushCore: import.meta.env.VITE_AVALANCHE_RUSH_CORE_ADDRESS || '0x742d35Cc5A5E2a9E1aB8d8C6E6E9F4A5B8D35a9',
  reactiveQuestEngine: import.meta.env.VITE_REACTIVE_QUEST_ENGINE_ADDRESS || '0x6a1d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35d2',
  educationalNFT: import.meta.env.VITE_EDUCATIONAL_NFT_ADDRESS || '0x7b2d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35e3',
  rushToken: import.meta.env.VITE_RUSH_TOKEN_ADDRESS || '0x8a1d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35b0',
  mockDEX: import.meta.env.VITE_MOCK_DEX_ADDRESS || '0x9b2d5C5E3A5E2a9E1aB8d8C6E6E9F4A5B8D35c1'
};

export const useAdvancedWeb3 = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    signer: null,
    account: '',
    chainId: null,
    isConnected: false,
    isLoading: false,
    error: null,
    networkName: ''
  });

  const [contracts, setContracts] = useState<{
    avalancheRushCore: ethers.Contract | null;
    reactiveQuestEngine: ethers.Contract | null;
    educationalNFT: ethers.Contract | null;
    rushToken: ethers.Contract | null;
    mockDEX: ethers.Contract | null;
  }>({
    avalancheRushCore: null,
    reactiveQuestEngine: null,
    educationalNFT: null,
    rushToken: null,
    mockDEX: null
  });

  // Memoized contract instances
  const contractInstances = useMemo(() => {
    if (!web3State.signer) return null;

    return {
      avalancheRushCore: new ethers.Contract(
        CONTRACT_ADDRESSES.avalancheRushCore,
        AVALANCHE_RUSH_CORE_ABI,
        web3State.signer
      ),
      reactiveQuestEngine: new ethers.Contract(
        CONTRACT_ADDRESSES.reactiveQuestEngine,
        REACTIVE_QUEST_ENGINE_ABI,
        web3State.signer
      ),
      educationalNFT: new ethers.Contract(
        CONTRACT_ADDRESSES.educationalNFT,
        EDUCATIONAL_NFT_ABI,
        web3State.signer
      ),
      rushToken: new ethers.Contract(
        CONTRACT_ADDRESSES.rushToken,
        RUSH_TOKEN_ABI,
        web3State.signer
      ),
      mockDEX: new ethers.Contract(
        CONTRACT_ADDRESSES.mockDEX,
        MOCK_DEX_ABI,
        web3State.signer
      )
    };
  }, [web3State.signer]);

  // Initialize Web3 connection
  const initializeWeb3 = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setWeb3State(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return;
    }

    try {
      setWeb3State(prev => ({ ...prev, isLoading: true, error: null }));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        setWeb3State(prev => ({ 
          ...prev, 
          provider, 
          isLoading: false 
        }));
        return;
      }

      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const networkName = getNetworkName(chainId);

      setWeb3State({
        provider,
        signer,
        account,
        chainId,
        networkName,
        isConnected: true,
        isLoading: false,
        error: null
      });

      // Set contracts
      if (contractInstances) {
        setContracts(contractInstances);
      }

    } catch (error) {
      console.error('Error initializing Web3:', error);
      setWeb3State(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [contractInstances]);

  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 43113: return 'Avalanche Fuji';
      case 43114: return 'Avalanche Mainnet';
      case 5318008: return 'Reactive Network';
      case 1: return 'Ethereum Mainnet';
      default: return `Unknown (${chainId})`;
    }
  };

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    try {
      setWeb3State(prev => ({ ...prev, isLoading: true, error: null }));
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initializeWeb3();
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWeb3State(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to connect wallet' 
      }));
    }
  }, [initializeWeb3]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (typeof window.ethereum === 'undefined') return false;

    try {
      const chainIdHex = `0x${targetChainId.toString(16)}`;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      return true;
    } catch (switchError: unknown) {
      if (switchError && typeof switchError === 'object' && 'code' in switchError && (switchError as { code: number }).code === 4902) {
        // Network not added, try to add it
        const network = targetChainId === 43113 ? NETWORKS.AVALANCHE_FUJI : NETWORKS.REACTIVE_MAINNET;
        
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorer],
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  }, []);

  // Game session management
  const startGameSession = useCallback(async (
    mode: number = 0, 
    difficulty: number = 1, 
    levelId: number = 1
  ): Promise<number | null> => {
    if (!contracts.avalancheRushCore || !web3State.isConnected) return null;

    try {
      // Ensure we're on Avalanche network
      if (web3State.chainId !== 43113) {
        const switched = await switchNetwork(43113);
        if (!switched) throw new Error('Please switch to Avalanche Fuji network');
      }

      const tx = await contracts.avalancheRushCore.startGame(mode, difficulty, levelId);
      const receipt = await tx.wait();
      
      // Extract session ID from events
      const gameStartedEvent = receipt.logs.find((log: ethers.Log) => {
        try {
          const parsed = contracts.avalancheRushCore!.interface.parseLog(log);
          return parsed?.name === 'GameStarted';
        } catch {
          return false;
        }
      });

      if (gameStartedEvent) {
        const parsed = contracts.avalancheRushCore!.interface.parseLog(gameStartedEvent);
        return Number(parsed?.args?.sessionId || 0);
      }

      return Date.now(); // Fallback session ID
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  }, [contracts.avalancheRushCore, web3State.isConnected, web3State.chainId, switchNetwork]);

  const completeGameSession = useCallback(async (
    sessionId: number,
    finalScore: number,
    achievementsUnlocked: string[] = [],
    skillPointsEarned: number[] = [],
    skillNames: string[] = []
  ): Promise<boolean> => {
    if (!contracts.avalancheRushCore || !web3State.isConnected) return false;

    try {
      // Ensure we're on Avalanche network
      if (web3State.chainId !== 43113) {
        const switched = await switchNetwork(43113);
        if (!switched) throw new Error('Please switch to Avalanche Fuji network');
      }

      const tx = await contracts.avalancheRushCore.completeGame(
        sessionId,
        finalScore,
        achievementsUnlocked,
        skillPointsEarned,
        skillNames
      );
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error completing game session:', error);
      return false;
    }
  }, [contracts.avalancheRushCore, web3State.isConnected, web3State.chainId, switchNetwork]);

  // Player data fetching
  const getPlayerProfile = useCallback(async (address?: string): Promise<PlayerProfile | null> => {
    if (!contracts.avalancheRushCore || !web3State.isConnected) return null;

    try {
      const playerAddress = address || web3State.account;
      const profile = await contracts.avalancheRushCore.getPlayerProfile(playerAddress);
      
      return {
        totalScore: Number(profile[0]),
        highestScore: Number(profile[1]),
        currentLevel: Number(profile[2]),
        experience: Number(profile[3]),
        totalGamesPlayed: Number(profile[4]),
        streakDays: Number(profile[5]),
        totalRewardsEarned: ethers.formatEther(profile[6]),
        isActive: profile[7]
      };
    } catch (error) {
      console.error('Error fetching player profile:', error);
      return null;
    }
  }, [contracts.avalancheRushCore, web3State.isConnected, web3State.account]);

  const getReactiveProfile = useCallback(async (address?: string): Promise<ReactiveProfile | null> => {
    if (!contracts.reactiveQuestEngine || !web3State.isConnected) return null;

    try {
      const playerAddress = address || web3State.account;
      const profile = await contracts.reactiveQuestEngine.getPlayerProfile(playerAddress);
      
      return {
        totalScore: Number(profile[0]),
        highestScore: Number(profile[1]),
        level: Number(profile[2]),
        experience: Number(profile[3]),
        streakDays: Number(profile[4]),
        totalQuestsCompleted: Number(profile[5]),
        totalRewardsEarned: ethers.formatEther(profile[6])
      };
    } catch (error) {
      console.error('Error fetching reactive profile:', error);
      return null;
    }
  }, [contracts.reactiveQuestEngine, web3State.isConnected, web3State.account]);

  // Token operations
  const getRushBalance = useCallback(async (address?: string): Promise<string> => {
    if (!contracts.rushToken || !web3State.isConnected) return '0';

    try {
      const playerAddress = address || web3State.account;
      const balance = await contracts.rushToken.balanceOf(playerAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching RUSH balance:', error);
      return '0';
    }
  }, [contracts.rushToken, web3State.isConnected, web3State.account]);

  // NFT operations
  const getPlayerNFTs = useCallback(async (address?: string): Promise<NFTAchievement[]> => {
    if (!contracts.educationalNFT || !web3State.isConnected) return [];

    try {
      const playerAddress = address || web3State.account;
      const balance = await contracts.educationalNFT.balanceOf(playerAddress);
      const nfts: NFTAchievement[] = [];

      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await contracts.educationalNFT.tokenOfOwnerByIndex(playerAddress, i);
        const achievement = await contracts.educationalNFT.achievements(tokenId);
        
        nfts.push({
          tokenId: Number(tokenId),
          questId: Number(achievement[0]),
          score: Number(achievement[1]),
          timestamp: Number(achievement[2]),
          metadata: achievement[3],
          isRare: achievement[4],
          raffleTickets: Number(achievement[5])
        });
      }

      return nfts;
    } catch (error) {
      console.error('Error fetching player NFTs:', error);
      return [];
    }
  }, [contracts.educationalNFT, web3State.isConnected, web3State.account]);

  // DEX operations
  const performSwap = useCallback(async (
    swapType: 'avax-to-usdc' | 'usdc-to-avax',
    amount: string,
    minOut: string = '0'
  ): Promise<boolean> => {
    if (!contracts.mockDEX || !web3State.isConnected) return false;

    try {
      let tx;
      
      if (swapType === 'avax-to-usdc') {
        tx = await contracts.mockDEX.swapAVAXForUSDC(
          ethers.parseEther(minOut),
          { value: ethers.parseEther(amount) }
        );
      } else {
        tx = await contracts.mockDEX.swapUSDCForAVAX(
          ethers.parseEther(amount),
          ethers.parseEther(minOut)
        );
      }
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error performing swap:', error);
      return false;
    }
  }, [contracts.mockDEX, web3State.isConnected]);

  // Leaderboard
  const getLeaderboard = useCallback(async (
    mode: number = 0,
    limit: number = 10
  ): Promise<LeaderboardEntry[]> => {
    if (!contracts.avalancheRushCore || !web3State.isConnected) return [];

    try {
      const [players, scores, timestamps] = await contracts.avalancheRushCore.getLeaderboard(mode, limit);
      
      return players.map((player: string, index: number) => ({
        player,
        score: Number(scores[index]),
        timestamp: Number(timestamps[index])
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }, [contracts.avalancheRushCore, web3State.isConnected]);

  // Current raffle info
  const getCurrentRaffle = useCallback(async (): Promise<RaffleInfo | null> => {
    if (!contracts.reactiveQuestEngine || !web3State.isConnected) return null;

    try {
      const raffle = await contracts.reactiveQuestEngine.getCurrentRaffle();
      
      return {
        raffleId: Number(raffle[0]),
        startTime: Number(raffle[1]),
        endTime: Number(raffle[2]),
        prizePool: ethers.formatEther(raffle[3]),
        participantCount: Number(raffle[4]),
        isActive: raffle[5]
      };
    } catch (error) {
      console.error('Error fetching current raffle:', error);
      return null;
    }
  }, [contracts.reactiveQuestEngine, web3State.isConnected]);

  // Event listeners
  useEffect(() => {
    if (!contractInstances) return;

    const setupEventListeners = () => {
      try {
        // Game events
        contractInstances.avalancheRushCore.on('GameCompleted', (player, sessionId, finalScore, reward) => {
          console.log('Game completed:', { player, sessionId: Number(sessionId), finalScore: Number(finalScore), reward: ethers.formatEther(reward) });
        });

        contractInstances.avalancheRushCore.on('HighScoreBeat', (player, newScore, previousScore) => {
          console.log('High score beaten:', { player, newScore: Number(newScore), previousScore: Number(previousScore) });
        });

        // Quest events
        contractInstances.reactiveQuestEngine.on('QuestCompleted', (player, questId, reward, timestamp) => {
          console.log('Quest completed:', { player, questId: Number(questId), reward: ethers.formatEther(reward), timestamp: Number(timestamp) });
        });

        // NFT events
        contractInstances.educationalNFT.on('RareNFTMinted', (player, tokenId, raffleId) => {
          console.log('Rare NFT minted:', { player, tokenId: Number(tokenId), raffleId: Number(raffleId) });
        });
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
    };

    setupEventListeners();

    return () => {
      // Cleanup event listeners
      try {
        if (contractInstances.avalancheRushCore) {
          contractInstances.avalancheRushCore.removeAllListeners();
        }
        if (contractInstances.reactiveQuestEngine) {
          contractInstances.reactiveQuestEngine.removeAllListeners();
        }
        if (contractInstances.educationalNFT) {
          contractInstances.educationalNFT.removeAllListeners();
        }
      } catch (error) {
        console.error('Error cleaning up event listeners:', error);
      }
    };
  }, [contractInstances]);

  // Initialize contracts when signer changes
  useEffect(() => {
    if (contractInstances) {
      setContracts(contractInstances);
    }
  }, [contractInstances]);

  // Initialize on mount and handle account/chain changes
  useEffect(() => {
    if (web3State.account && web3State.chainId && web3State.provider) {
      initializeWeb3();
    }
    
    return () => {
      // Cleanup event listeners
      if (web3State.provider) {
        web3State.provider.removeAllListeners();
      }
    };
  }, [web3State.account, web3State.chainId, web3State.provider, initializeWeb3]);

  // Handle MetaMask events
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWeb3State(prev => ({ ...prev, isConnected: false, account: '' }));
        } else {
          initializeWeb3();
        }
      };

      const handleChainChanged = () => {
        initializeWeb3();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [initializeWeb3]);

  return {
    // State
    ...web3State,
    contracts,
    
    // Actions
    connectWallet,
    switchNetwork,
    
    // Game operations
    startGameSession,
    completeGameSession,
    
    // Data fetching
    getPlayerProfile,
    getReactiveProfile,
    getRushBalance,
    getPlayerNFTs,
    getLeaderboard,
    getCurrentRaffle,
    
    // DEX operations
    performSwap,
    
    // Constants
    contractAddresses: CONTRACT_ADDRESSES,
    networks: NETWORKS
  };
};