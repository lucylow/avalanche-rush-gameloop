import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedWeb3 } from '../../hooks/useAdvancedWeb3';

interface WalletState {
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  networkStatus: 'correct' | 'wrong' | 'unknown';
  balance: string;
  address: string;
}

interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
}

const EnhancedWalletConnector: React.FC = () => {
  const { 
    isConnected, 
    account, 
    chainId, 
    networkName, 
    isLoading, 
    error: web3Error,
    connectWallet, 
    switchNetwork,
    getRushBalance 
  } = useAdvancedWeb3();

  const [walletState, setWalletState] = useState<WalletState>({
    isConnecting: false,
    isConnected: false,
    error: null,
    networkStatus: 'unknown',
    balance: '0',
    address: ''
  });

  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const supportedNetworks: NetworkInfo[] = [
    {
      chainId: 43113,
      name: 'Avalanche Fuji Testnet',
      symbol: 'AVAX',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      blockExplorer: 'https://testnet.snowtrace.io'
    },
    {
      chainId: 43114,
      name: 'Avalanche Mainnet',
      symbol: 'AVAX',
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      blockExplorer: 'https://snowtrace.io'
    },
    {
      chainId: 5318008,
      name: 'Reactive Network',
      symbol: 'REACT',
      rpcUrl: 'https://rpc.reactive.network',
      blockExplorer: 'https://explorer.reactive.network'
    }
  ];

  // Update wallet state based on Web3 hook
  useEffect(() => {
    setWalletState(prev => ({
      ...prev,
      isConnected,
      isConnecting: isLoading,
      address: account,
      error: web3Error,
      networkStatus: chainId === 43113 || chainId === 43114 ? 'correct' : 'wrong'
    }));
  }, [isConnected, isLoading, account, web3Error, chainId]);

  // Fetch RUSH balance when connected
  useEffect(() => {
    if (isConnected && account) {
      getRushBalance(account).then(balance => {
        setWalletState(prev => ({ ...prev, balance }));
      });
    }
  }, [isConnected, account, getRushBalance]);

  const handleConnectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState(prev => ({ 
        ...prev, 
        error: 'MetaMask not detected. Please install MetaMask to continue.' 
      }));
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
      await connectWallet();
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      setShowWalletModal(false);
    } catch (error: any) {
      setWalletState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: getUserFriendlyError(error) 
      }));
    }
  }, [connectWallet]);

  const handleSwitchNetwork = useCallback(async (targetChainId: number) => {
    try {
      setWalletState(prev => ({ ...prev, error: null }));
      const success = await switchNetwork(targetChainId);
      if (success) {
        setShowNetworkModal(false);
      } else {
        setWalletState(prev => ({ 
          ...prev, 
          error: 'Failed to switch network. Please try manually in your wallet.' 
        }));
      }
    } catch (error: any) {
      setWalletState(prev => ({ 
        ...prev, 
        error: getUserFriendlyError(error) 
      }));
    }
  }, [switchNetwork]);

  const getUserFriendlyError = (error: any): string => {
    const errorMap: Record<string, string> = {
      'User rejected': 'Connection cancelled by user',
      'Already processing': 'Please check your wallet for pending requests',
      'No provider': 'Please install MetaMask or similar wallet',
      'Network not supported': 'Please switch to a supported network',
      'Insufficient funds': 'Insufficient funds for transaction',
      'Transaction failed': 'Transaction failed. Please try again.',
      'User denied': 'Request denied by user'
    };

    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    for (const [key, friendlyMessage] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return friendlyMessage;
      }
    }

    return 'Something went wrong. Please try again.';
  };

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '<0.001';
    if (num < 1) return num.toFixed(3);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const getNetworkBadgeColor = (status: string): string => {
    switch (status) {
      case 'correct': return 'bg-green-100 text-green-800 border-green-200';
      case 'wrong': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const WalletButton = () => {
    if (!isConnected) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowWalletModal(true)}
          disabled={walletState.isConnecting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {walletState.isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>🦊</span>
              <span>Connect Wallet</span>
            </>
          )}
        </motion.button>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="text-white font-semibold text-sm">
                {formatAddress(walletState.address)}
              </span>
              <span className="text-white/70 text-xs">
                {formatBalance(walletState.balance)} RUSH
              </span>
            </div>
            <div 
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getNetworkBadgeColor(walletState.networkStatus)}`}
            >
              {networkName}
            </div>
          </div>
        </div>
        
        {walletState.networkStatus === 'wrong' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNetworkModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Switch Network
          </motion.button>
        )}
      </div>
    );
  };

  return (
    <>
      <WalletButton />

      {/* Error Display */}
      <AnimatePresence>
        {walletState.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50"
          >
            <div className="flex items-start space-x-2">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-sm">Connection Error</p>
                <p className="text-xs mt-1 opacity-90">{walletState.error}</p>
              </div>
              <button
                onClick={() => setWalletState(prev => ({ ...prev, error: null }))}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 text-sm">
                  Connect your wallet to start playing and earning rewards
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleConnectWallet}
                  disabled={walletState.isConnecting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-3"
                >
                  <span className="text-2xl">🦊</span>
                  <span>MetaMask</span>
                  {walletState.isConnecting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Don't have MetaMask?{' '}
                    <a 
                      href="https://metamask.io/download/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Install it here
                    </a>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Switch Modal */}
      <AnimatePresence>
        {showNetworkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowNetworkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Switch Network
                </h3>
                <p className="text-gray-600 text-sm">
                  Please switch to a supported network to continue
                </p>
              </div>

              <div className="space-y-3">
                {supportedNetworks.map((network) => (
                  <button
                    key={network.chainId}
                    onClick={() => handleSwitchNetwork(network.chainId)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      chainId === network.chainId
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {network.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {network.symbol} • Chain ID: {network.chainId}
                        </p>
                      </div>
                      {chainId === network.chainId && (
                        <span className="text-green-500 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNetworkModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedWalletConnector;

