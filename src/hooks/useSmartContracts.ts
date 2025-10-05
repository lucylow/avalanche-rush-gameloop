import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import SmartContractService, { 
  CONTRACT_ADDRESSES, 
  NETWORKS, 
  PlayerProfile, 
  Quest, 
  NFTAchievement, 
  RaffleInfo 
} from '../services/SmartContractService';

interface Web3State {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  networkName: string;
  isLoading: boolean;
  error: string | null;
}

interface ContractInstances {
  avalancheRushCore: ethers.Contract | null;
  reactiveQuestEngine: ethers.Contract | null;
  educationalNFT: ethers.Contract | null;
  rushToken: ethers.Contract | null;
  mockDEX: ethers.Contract | null;
}

export const useSmartContracts = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    chainId: null,
    networkName: 'Unknown',
    isLoading: false,
    error: null
  });

  const [contractService] = useState(() => new SmartContractService());
  const [contracts, setContracts] = useState<ContractInstances>({
    avalancheRushCore: null,
    reactiveQuestEngine: null,
    educationalNFT: null,
    rushToken: null,
    mockDEX: null
  });

  // Initialize Web3 connection
  const initializeWeb3 = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setWeb3State(prev => ({ ...prev, error: 'MetaMask not detected' }));
      return;
    }

    try {
      setWeb3State(prev => ({ ...prev, isLoading: true, error: null }));

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      if (accounts.length > 0) {
        const account = await accounts[0].getAddress();
        const chainId = Number(network.chainId);
        
        // Initialize contract service
        contractService.initializeContracts(provider, await provider.getSigner());
        
        // Get contract instances
        const contractInstances = {
          avalancheRushCore: (contractService as any).contracts.avalancheRushCore,
          reactiveQuestEngine: (contractService as any).contracts.reactiveQuestEngine,
          educationalNFT: (contractService as any).contracts.educationalNFT,
          rushToken: (contractService as any).contracts.rushToken,
          mockDEX: (contractService as any).contracts.mockDEX
        };

        setContracts(contractInstances);

        setWeb3State({
          isConnected: true,
          account,
          chainId,
          networkName: getNetworkName(chainId),
          isLoading: false,
          error: null
        });

        // Set up event listeners
        setupEventListeners();
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      setWeb3State(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize Web3' 
      }));
    }
  }, [contractService]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    try {
      setWeb3State(prev => ({ ...prev, isLoading: true, error: null }));

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      // Initialize contract service
      contractService.initializeContracts(provider, await provider.getSigner());

      // Get contract instances
      const contractInstances = {
        avalancheRushCore: (contractService as any).contracts.avalancheRushCore,
        reactiveQuestEngine: (contractService as any).contracts.reactiveQuestEngine,
        educationalNFT: (contractService as any).contracts.educationalNFT,
        rushToken: (contractService as any).contracts.rushToken,
        mockDEX: (contractService as any).contracts.mockDEX
      };

      setContracts(contractInstances);

      setWeb3State({
        isConnected: true,
        account: accounts[0],
        chainId: Number(network.chainId),
        networkName: getNetworkName(Number(network.chainId)),
        isLoading: false,
        error: null
      });

      // Set up event listeners
      setupEventListeners();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWeb3State(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to connect wallet' 
      }));
      throw error;
    }
  }, [contractService]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        const network = getNetworkConfig(targetChainId);
        if (network) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl],
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
            }],
          });
        }
      } else {
        throw error;
      }
    }
  }, []);

  // Game functions
  const startGameSession = useCallback(async (
    mode: number = 0, 
    difficulty: number = 1, 
    levelId: number = 1
  ): Promise<number | null> => {
    if (!contracts.avalancheRushCore || !web3State.isConnected) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      // Ensure we're on the correct network
      if (web3State.chainId !== NETWORKS.AVALANCHE_FUJI.chainId) {
        await switchNetwork(NETWORKS.AVALANCHE_FUJI.chainId);
      }

      const sessionId = await contractService.startGame(mode, difficulty, levelId);
      return sessionId;
    } catch (error) {
      console.error('Error starting game session:', error);
      throw error;
    }
  }, [contracts.avalancheRushCore, web3State.isConnected, web3State.chainId, switchNetwork, contractService]);

  const completeGameSession = useCallback(async (
    sessionId: number, 
    finalScore: number, 
    achievementsUnlocked: string[] = [], 
    skillPointsEarned: number[] = [], 
    skillNames: string[] = []
  ): Promise<boolean> => {
    if (!contracts.avalancheRushCore || !web3State.isConnected) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      return await contractService.completeGame(
        sessionId,
        finalScore,
        achievementsUnlocked,
        skillPointsEarned,
        skillNames
      );
    } catch (error) {
      console.error('Error completing game session:', error);
      throw error;
    }
  }, [contracts.avalancheRushCore, web3State.isConnected, contractService]);

  // Player profile functions
  const getPlayerProfile = useCallback(async (address?: string): Promise<PlayerProfile | null> => {
    if (!contracts.avalancheRushCore || !web3State.isConnected) {
      return null;
    }

    const targetAddress = address || web3State.account;
    if (!targetAddress) return null;

    try {
      return await contractService.getPlayerProfile(targetAddress);
    } catch (error) {
      console.error('Error fetching player profile:', error);
      return null;
    }
  }, [contracts.avalancheRushCore, web3State.isConnected, web3State.account, contractService]);

  const getRushBalance = useCallback(async (address?: string): Promise<string> => {
    if (!contracts.rushToken || !web3State.isConnected) {
      return '0';
    }

    const targetAddress = address || web3State.account;
    if (!targetAddress) return '0';

    try {
      return await contractService.getRushBalance(targetAddress);
    } catch (error) {
      console.error('Error fetching RUSH balance:', error);
      return '0';
    }
  }, [contracts.rushToken, web3State.isConnected, web3State.account, contractService]);

  // Quest functions
  const getQuest = useCallback(async (questId: number): Promise<Quest | null> => {
    if (!contracts.reactiveQuestEngine) {
      return null;
    }

    try {
      return await contractService.getQuest(questId);
    } catch (error) {
      console.error('Error fetching quest:', error);
      return null;
    }
  }, [contracts.reactiveQuestEngine, contractService]);

  const completeQuest = useCallback(async (questId: number): Promise<boolean> => {
    if (!contracts.reactiveQuestEngine || !web3State.isConnected) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      return await contractService.completeQuest(questId);
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }, [contracts.reactiveQuestEngine, web3State.isConnected, contractService]);

  // NFT functions
  const getPlayerNFTs = useCallback(async (address?: string): Promise<NFTAchievement[]> => {
    if (!contracts.educationalNFT || !web3State.isConnected) {
      return [];
    }

    const targetAddress = address || web3State.account;
    if (!targetAddress) return [];

    try {
      return await contractService.getPlayerNFTs(targetAddress);
    } catch (error) {
      console.error('Error fetching player NFTs:', error);
      return [];
    }
  }, [contracts.educationalNFT, web3State.isConnected, web3State.account, contractService]);

  // DEX functions
  const getTokenPrice = useCallback(async (tokenA: string, tokenB: string): Promise<number> => {
    if (!contracts.mockDEX) {
      return 0;
    }

    try {
      return await contractService.getTokenPrice(tokenA, tokenB);
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }, [contracts.mockDEX, contractService]);

  const swapTokens = useCallback(async (
    tokenIn: string, 
    tokenOut: string, 
    amountIn: string, 
    minAmountOut: string
  ): Promise<string> => {
    if (!contracts.mockDEX || !web3State.isConnected) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      return await contractService.swapTokens(tokenIn, tokenOut, amountIn, minAmountOut);
    } catch (error) {
      console.error('Error swapping tokens:', error);
      throw error;
    }
  }, [contracts.mockDEX, web3State.isConnected, contractService]);

  // Leaderboard functions
  const getLeaderboard = useCallback(async (mode: number, limit: number = 10) => {
    if (!contracts.avalancheRushCore) {
      return [];
    }

    try {
      return await contractService.getLeaderboard(mode, limit);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }, [contracts.avalancheRushCore, contractService]);

  // Raffle functions
  const getCurrentRaffle = useCallback(async (): Promise<RaffleInfo | null> => {
    if (!contracts.reactiveQuestEngine) {
      return null;
    }

    try {
      return await contractService.getCurrentRaffle();
    } catch (error) {
      console.error('Error fetching current raffle:', error);
      return null;
    }
  }, [contracts.reactiveQuestEngine, contractService]);

  const enterRaffle = useCallback(async (tickets: number): Promise<boolean> => {
    if (!contracts.reactiveQuestEngine || !web3State.isConnected) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      return await contractService.enterRaffle(tickets);
    } catch (error) {
      console.error('Error entering raffle:', error);
      throw error;
    }
  }, [contracts.reactiveQuestEngine, web3State.isConnected, contractService]);

  // Event listeners
  const setupEventListeners = useCallback(() => {
    // Game events
    contractService.onGameStarted((player, sessionId, mode, timestamp) => {
      console.log('Game started:', { player, sessionId, mode, timestamp });
      // Trigger any UI updates or notifications
    });

    contractService.onGameCompleted((player, sessionId, finalScore, reward) => {
      console.log('Game completed:', { player, sessionId, finalScore, reward });
      // Trigger any UI updates or notifications
    });

    contractService.onQuestCompleted((player, questId, reward, timestamp) => {
      console.log('Quest completed:', { player, questId, reward, timestamp });
      // Trigger any UI updates or notifications
    });
  }, [contractService]);

  // Helper functions
  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case NETWORKS.AVALANCHE_FUJI.chainId:
        return 'Avalanche Fuji Testnet';
      case NETWORKS.AVALANCHE_MAINNET.chainId:
        return 'Avalanche C-Chain';
      case NETWORKS.REACTIVE_CHAIN.chainId:
        return 'Reactive Chain';
      default:
        return 'Unknown Network';
    }
  };

  const getNetworkConfig = (chainId: number) => {
    switch (chainId) {
      case NETWORKS.AVALANCHE_FUJI.chainId:
        return NETWORKS.AVALANCHE_FUJI;
      case NETWORKS.AVALANCHE_MAINNET.chainId:
        return NETWORKS.AVALANCHE_MAINNET;
      case NETWORKS.REACTIVE_CHAIN.chainId:
        return NETWORKS.REACTIVE_CHAIN;
      default:
        return null;
    }
  };

  // Initialize on mount and handle account/chain changes
  useEffect(() => {
    initializeWeb3();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWeb3State(prev => ({ ...prev, isConnected: false, account: null }));
        setContracts({
          avalancheRushCore: null,
          reactiveQuestEngine: null,
          educationalNFT: null,
          rushToken: null,
          mockDEX: null
        });
      } else {
        initializeWeb3();
      }
    };

    const handleChainChanged = (chainId: string) => {
      initializeWeb3();
    };

    if (window.ethereum) {
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
    isConnected: web3State.isConnected,
    account: web3State.account,
    chainId: web3State.chainId,
    networkName: web3State.networkName,
    isLoading: web3State.isLoading,
    error: web3State.error,
    contracts,

    // Actions
    connectWallet,
    switchNetwork,
    initializeWeb3,

    // Game functions
    startGameSession,
    completeGameSession,
    getPlayerProfile,
    getRushBalance,

    // Quest functions
    getQuest,
    completeQuest,

    // NFT functions
    getPlayerNFTs,

    // DEX functions
    getTokenPrice,
    swapTokens,

    // Leaderboard functions
    getLeaderboard,

    // Raffle functions
    getCurrentRaffle,
    enterRaffle,

    // Utility functions
    formatEther: contractService.formatEther.bind(contractService),
    parseEther: contractService.parseEther.bind(contractService)
  };
};

export default useSmartContracts;
