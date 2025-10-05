import React from 'react';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';

const WalletTest: React.FC = () => {
  const { 
    isConnected, 
    account, 
    chainId, 
    networkName, 
    isLoading, 
    error,
    connectWallet,
    switchNetwork,
    getRushBalance 
  } = useAdvancedWeb3();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await switchNetwork(43113); // Avalanche Fuji Testnet
    } catch (err) {
      console.error('Network switch failed:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Wallet Connection Test</h2>
      
      <div className="space-y-4">
        <div className="p-3 bg-gray-100 rounded">
          <p><strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Not Connected'}</p>
          <p><strong>Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}</p>
          <p><strong>Account:</strong> {account || 'None'}</p>
          <p><strong>Chain ID:</strong> {chainId || 'None'}</p>
          <p><strong>Network:</strong> {networkName || 'Unknown'}</p>
          {error && <p><strong>Error:</strong> <span className="text-red-600">{error}</span></p>}
        </div>

        <div className="space-y-2">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ Wallet Connected!</p>
              {chainId !== 43113 && chainId !== 43114 && (
                <button
                  onClick={handleSwitchToAvalanche}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
                >
                  Switch to Avalanche Fuji
                </button>
              )}
              {chainId === 43113 && (
                <p className="text-green-600">✅ Connected to Avalanche Fuji Testnet</p>
              )}
              {chainId === 43114 && (
                <p className="text-green-600">✅ Connected to Avalanche Mainnet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTest;

