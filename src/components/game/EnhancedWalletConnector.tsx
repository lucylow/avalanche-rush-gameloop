import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';

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
  } = useSmartContracts();

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
    if (!(window as any)?.ethereum) {
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
      if (typeof success === 'boolean' && success) {
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
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWalletModal(true)}
          disabled={walletState.isConnecting}
          className="relative group bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          {walletState.isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span className="relative z-10">Connecting...</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center relative z-10">
                <span className="text-lg">🦊</span>
              </div>
              <span className="relative z-10">Connect Wallet</span>
            </>
          )}
          
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
        </motion.button>
      );
    }

    return (
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl"></div>
          
          <div className="relative z-10 flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm">
                  {formatAddress(walletState.address)}
                </span>
              </div>
              <span className="text-white/70 text-xs font-medium">
                {formatBalance(walletState.balance)} RUSH
              </span>
            </div>
            <div 
              className={`px-3 py-2 rounded-xl text-xs font-bold border-2 ${getNetworkBadgeColor(walletState.networkStatus)} shadow-lg`}
            >
              {networkName}
            </div>
          </div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '1px' }}>
            <div className="w-full h-full bg-slate-900 rounded-2xl"></div>
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
                  <span className="text-xl">🦊</span>
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