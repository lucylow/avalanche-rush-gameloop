import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Contract ABIs (simplified for demo)
const GAME_LOGIC_ABI = [
  "function startGame() external returns (uint256)",
  "function completeGame(uint256 sessionId, uint256 score) external",
  "function getPlayerStats(address player) external view returns (uint256, uint256, uint256, uint256, bool)",
  "event GameCompleted(address indexed player, uint256 sessionId, uint256 score, uint256 reward)"
];

const RUSH_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const EDUCATIONAL_NFT_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function achievements(uint256 tokenId) external view returns (uint256, uint256, uint256, string, bool, uint256)"
];

interface ContractAddresses {
  gameLogic: string;
  rushToken: string;
  educationalNFT: string;
  mockDEX: string;
  reactiveQuestEngine: string;
}

interface PlayerStats {
  highScore: number;
  totalGamesPlayed: number;
  totalRewardsEarned: string;
  level: number;
  isActive: boolean;
}

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const CONTRACT_ADDRESSES: ContractAddresses = {
  gameLogic: process.env.REACT_APP_GAME_LOGIC_ADDRESS || '',
  rushToken: process.env.REACT_APP_RUSH_TOKEN_ADDRESS || '',
  educationalNFT: process.env.REACT_APP_EDUCATIONAL_NFT_ADDRESS || '',
  mockDEX: process.env.REACT_APP_MOCK_DEX_ADDRESS || '',
  reactiveQuestEngine: process.env.REACT_APP_REACTIVE_QUEST_ENGINE_ADDRESS || ''
};

export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    signer: null,
    account: '',
    chainId: null,
    isConnected: false,
    isLoading: false,
    error: null
  });

  const [contracts, setContracts] = useState<{
    gameLogic: ethers.Contract | null;
    rushToken: ethers.Contract | null;
    educationalNFT: ethers.Contract | null;
  }>({
    gameLogic: null,
    rushToken: null,
    educationalNFT: null
  });

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

      // Initialize contracts
      const gameLogicContract = CONTRACT_ADDRESSES.gameLogic 
        ? new ethers.Contract(CONTRACT_ADDRESSES.gameLogic, GAME_LOGIC_ABI, signer)
        : null;

      const rushTokenContract = CONTRACT_ADDRESSES.rushToken
        ? new ethers.Contract(CONTRACT_ADDRESSES.rushToken, RUSH_TOKEN_ABI, signer)
        : null;

      const educationalNFTContract = CONTRACT_ADDRESSES.educationalNFT
        ? new ethers.Contract(CONTRACT_ADDRESSES.educationalNFT, EDUCATIONAL_NFT_ABI, signer)
        : null;

      setContracts({
        gameLogic: gameLogicContract,
        rushToken: rushTokenContract,
        educationalNFT: educationalNFTContract
      });

      setWeb3State({
        provider,
        signer,
        account,
        chainId,
        isConnected: true,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Error initializing Web3:', error);
      setWeb3State(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, []);

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

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWeb3State({
      provider: null,
      signer: null,
      account: '',
      chainId: null,
      isConnected: false,
      isLoading: false,
      error: null
    });
    setContracts({
      gameLogic: null,
      rushToken: null,
      educationalNFT: null
    });
  }, []);

  // Get player stats
  const getPlayerStats = useCallback(async (address?: string): Promise<PlayerStats | null> => {
    if (!contracts.gameLogic || !web3State.isConnected) return null;

    try {
      const playerAddress = address || web3State.account;
      const stats = await contracts.gameLogic.getPlayerStats(playerAddress);
      
      return {
        highScore: Number(stats[0]),
        totalGamesPlayed: Number(stats[1]),
        totalRewardsEarned: ethers.formatEther(stats[2]),
        level: Number(stats[3]),
        isActive: stats[4]
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }, [contracts.gameLogic, web3State.isConnected, web3State.account]);

  // Get RUSH token balance
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

  // Start game session
  const startGameSession = useCallback(async (): Promise<number | null> => {
    if (!contracts.gameLogic || !web3State.isConnected) return null;

    try {
      const tx = await contracts.gameLogic.startGame();
      const receipt = await tx.wait();
      
      // Extract session ID from transaction logs or return value
      // This is a simplified implementation
      return Date.now(); // Mock session ID
    } catch (error) {
      console.error('Error starting game session:', error);
      return null;
    }
  }, [contracts.gameLogic, web3State.isConnected]);

  // Complete game session
  const completeGameSession = useCallback(async (sessionId: number, score: number): Promise<boolean> => {
    if (!contracts.gameLogic || !web3State.isConnected) return false;

    try {
      const tx = await contracts.gameLogic.completeGame(sessionId, score);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error completing game session:', error);
      return false;
    }
  }, [contracts.gameLogic, web3State.isConnected]);

  // Switch to Avalanche network
  const switchToAvalanche = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA869' }], // Avalanche Fuji Testnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xA869',
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://testnet.snowtrace.io/'],
            }],
          });
        } catch (addError) {
          console.error('Error adding Avalanche network:', addError);
        }
      }
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeWeb3();

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
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
  }, [initializeWeb3, disconnectWallet]);

  return {
    ...web3State,
    contracts,
    connectWallet,
    disconnectWallet,
    getPlayerStats,
    getRushBalance,
    startGameSession,
    completeGameSession,
    switchToAvalanche,
    contractAddresses: CONTRACT_ADDRESSES
  };
};
