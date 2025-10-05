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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto mb-6 animate-pulse">
              🏔️
            </div>
            <h1 className="text-5xl font-black text-white mb-4">
              Avalanche Rush
            </h1>
            <p className="text-white/90 text-xl mb-6 font-semibold">
              Choose Your Adventure
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Web3 Mode - Full Features */}
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm border-2 border-orange-400/50 rounded-2xl p-6 hover:border-orange-400 transition-all duration-300">
              <div className="text-4xl mb-3">🦊</div>
              <h3 className="text-xl font-bold text-white mb-3">Web3 Mode</h3>
              <p className="text-white/80 text-sm mb-4">
                Connect your wallet to unlock:
              </p>
              <ul className="text-left text-white/70 text-sm space-y-2 mb-6">
                <li>✅ Earn real crypto rewards</li>
                <li>✅ NFT character ownership</li>
                <li>✅ Compete on global leaderboards</li>
                <li>✅ Trade items on marketplace</li>
                <li>✅ Unlock all achievements</li>
                <li>✅ Join tournaments</li>
              </ul>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            </div>

            {/* Web2 Mode - Simplified */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border-2 border-green-400/50 rounded-2xl p-6 hover:border-green-400 transition-all duration-300">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="text-xl font-bold text-white mb-3">Web2 Mode</h3>
              <p className="text-white/80 text-sm mb-4">
                Play instantly without wallet:
              </p>
              <ul className="text-left text-white/70 text-sm space-y-2 mb-6">
                <li>✅ No wallet required</li>
                <li>✅ Instant play</li>
                <li>✅ Local high scores</li>
                <li>✅ Basic character selection</li>
                <li>✅ All game modes</li>
                <li>⚠️ No blockchain rewards</li>
              </ul>
              <button
                onClick={handleDemoMode}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl transition-all duration-300"
              >
                Play Now (Free)
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm">
              New to crypto?{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Get MetaMask
              </a>
              {' '}• Built on Avalanche ⛰️
            </p>
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
