import React, { useState, useEffect } from 'react';
import AvalancheRushGame from '../../components/game/AvalancheRushGame';
import { useSmartContracts } from '../../hooks/useSmartContracts';

const GamePage: React.FC = () => {
  const { isConnected, connectWallet, isLoading } = useSmartContracts();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (!isConnected && !isLoading && !demoMode) {
      setShowWalletPrompt(true);
    } else {
      setShowWalletPrompt(false);
    }
  }, [isConnected, isLoading, demoMode]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setShowWalletPrompt(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    setShowWalletPrompt(false);
  };

  if (showWalletPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto mb-6">
              🏔️
            </div>
            <h1 className="text-4xl font-black text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Avalanche Rush
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Connect your wallet to start playing and earning rewards!
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🦊</span>
                  <span>Connect MetaMask</span>
                </>
              )}
            </button>

            {/* Demo Mode Button */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
              <button
                onClick={handleDemoMode}
                className="relative w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <span className="text-xl">🎮</span>
                <span>🚀 Hackathon Demo Mode</span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-white/60 text-sm">
                Don't have MetaMask?{' '}
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Install it here
                </a>
                {' '}or try{' '}
                <button
                  onClick={handleDemoMode}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Demo Mode
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AvalancheRushGame demoMode={demoMode} />
    </div>
  );
};

export default GamePage;
