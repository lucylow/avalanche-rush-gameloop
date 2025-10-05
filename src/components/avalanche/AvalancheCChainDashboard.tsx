import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvalancheCChain } from '../../hooks/useAvalancheCChain';

const AvalancheCChainDashboard: React.FC = () => {
  const {
    isConnected,
    isLoading,
    playerStats,
    currentChainId,
    stakeAVAX,
    unstakeAVAX,
    joinSubnet,
    completeAvalancheQuest,
    initiateCrossChainTransfer,
    openDeFiPosition,
    isOnAvalancheChain,
    getSubnetInfo,
    getAvalancheQuests,
    AVALANCHE_SUBNETS
  } = useAvalancheCChain();

  const [selectedTab, setSelectedTab] = useState<'staking' | 'subnets' | 'quests' | 'defi'>('staking');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [selectedSubnet, setSelectedSubnet] = useState<number>(43114);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Add notification
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  // Handle AVAX staking
  const handleStakeAVAX = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      addNotification('Please enter a valid stake amount');
      return;
    }

    const success = await stakeAVAX(stakeAmount);
    if (success) {
      addNotification(`Successfully staked ${stakeAmount} AVAX!`);
      setStakeAmount('');
    } else {
      addNotification('Failed to stake AVAX. Please try again.');
    }
  };

  // Handle AVAX unstaking
  const handleUnstakeAVAX = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      addNotification('Please enter a valid unstake amount');
      return;
    }

    const success = await unstakeAVAX(unstakeAmount);
    if (success) {
      addNotification(`Successfully unstaked ${unstakeAmount} AVAX!`);
      setUnstakeAmount('');
    } else {
      addNotification('Failed to unstake AVAX. Please try again.');
    }
  };

  // Handle subnet joining
  const handleJoinSubnet = async (subnetId: number) => {
    const success = await joinSubnet(subnetId);
    if (success) {
      const subnetInfo = getSubnetInfo(subnetId);
      addNotification(`Successfully joined ${subnetInfo?.name}!`);
    } else {
      addNotification('Failed to join subnet. Please try again.');
    }
  };

  // Handle quest completion
  const handleCompleteQuest = async (questId: number) => {
    const success = await completeAvalancheQuest(questId);
    if (success) {
      addNotification(`Quest completed! Rewards claimed.`);
    } else {
      addNotification('Failed to complete quest. Check requirements.');
    }
  };

  if (!isConnected || !isOnAvalancheChain()) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-6"
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center border border-red-500/30">
          <div className="text-6xl mb-6">🏔️</div>
          <h2 className="text-3xl font-bold text-white mb-4">Avalanche C-Chain Required</h2>
          <p className="text-red-200 mb-6">
            {!isConnected 
              ? 'Please connect your wallet to access Avalanche C-Chain features.'
              : 'Please switch to Avalanche C-Chain (Mainnet or Fuji Testnet) to use these features.'
            }
          </p>
          <div className="text-sm text-red-300">
            <p>Supported Networks:</p>
            <ul className="mt-2 space-y-1">
              <li>🔴 Avalanche C-Chain (43114)</li>
              <li>🟡 Fuji Testnet (43113)</li>
            </ul>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">🏔️</div>
            <div>
              <h1 className="text-4xl font-black text-white">Avalanche C-Chain</h1>
              <p className="text-red-200">Advanced features powered by AVAX</p>
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
            <div className="text-sm text-red-200">Chain ID: {currentChainId}</div>
            <div className="text-xs text-red-300">
              {currentChainId === 43114 ? 'Mainnet' : 'Fuji Testnet'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player Stats Card */}
      {playerStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-red-500/30"
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="mr-3">📊</span>
            Your Avalanche Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-red-500/20 rounded-xl">
              <div className="text-2xl font-bold text-red-300">{parseFloat(playerStats.stakedAVAX).toFixed(4)}</div>
              <div className="text-sm text-red-200">Staked AVAX</div>
            </div>
            <div className="text-center p-4 bg-orange-500/20 rounded-xl">
              <div className="text-2xl font-bold text-orange-300">{parseFloat(playerStats.stakingRewards).toFixed(4)}</div>
              <div className="text-sm text-orange-200">Rewards</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/20 rounded-xl">
              <div className="text-2xl font-bold text-yellow-300">{playerStats.subnetId || 'None'}</div>
              <div className="text-sm text-yellow-200">Subnet ID</div>
            </div>
            <div className="text-center p-4 bg-green-500/20 rounded-xl">
              <div className="text-2xl font-bold text-green-300">{playerStats.completedQuests}</div>
              <div className="text-sm text-green-200">Quests Done</div>
            </div>
            <div className="text-center p-4 bg-blue-500/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-300">{playerStats.deFiPositions}</div>
              <div className="text-sm text-blue-200">DeFi Positions</div>
            </div>
            <div className="text-center p-4 bg-purple-500/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-300">{parseFloat(playerStats.totalAVAXEarned).toFixed(4)}</div>
              <div className="text-sm text-purple-200">Total Earned</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-black/40 rounded-xl p-1">
        {[
          { id: 'staking', label: 'AVAX Staking', icon: '🔥' },
          { id: 'subnets', label: 'Subnets', icon: '🌐' },
          { id: 'quests', label: 'Quests', icon: '🎯' },
          { id: 'defi', label: 'DeFi', icon: '💰' }
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setSelectedTab(id as 'staking' | 'subnets' | 'quests' | 'defi')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
              selectedTab === id
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-red-200 hover:bg-red-500/20 hover:text-white'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* AVAX Staking Tab */}
          {selectedTab === 'staking' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Stake AVAX */}
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🔥</span>
                  Stake AVAX
                </h3>
                <p className="text-red-200 mb-6">
                  Stake your AVAX tokens to earn rewards and unlock exclusive features.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-200 mb-2">
                      Amount (AVAX)
                    </label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white placeholder-red-300 focus:border-red-400 focus:outline-none"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStakeAVAX}
                    disabled={isLoading || !stakeAmount}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200"
                  >
                    {isLoading ? 'Staking...' : 'Stake AVAX'}
                  </motion.button>
                </div>
                <div className="mt-4 text-sm text-red-300">
                  <p>• Minimum stake: 0.01 AVAX</p>
                  <p>• APY: 5% (example)</p>
                  <p>• Lock period: 7 days</p>
                </div>
              </div>

              {/* Unstake AVAX */}
              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">💸</span>
                  Unstake AVAX
                </h3>
                <p className="text-red-200 mb-6">
                  Unstake your AVAX and claim accumulated rewards.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-200 mb-2">
                      Amount (AVAX)
                    </label>
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-lg text-white placeholder-red-300 focus:border-red-400 focus:outline-none"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUnstakeAVAX}
                    disabled={isLoading || !unstakeAmount || parseFloat(playerStats?.stakedAVAX || '0') === 0}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200"
                  >
                    {isLoading ? 'Unstaking...' : 'Unstake AVAX'}
                  </motion.button>
                </div>
                <div className="mt-4 text-sm text-red-300">
                  <p>• Available: {playerStats?.stakedAVAX || '0'} AVAX</p>
                  <p>• Pending rewards: {playerStats?.stakingRewards || '0'} AVAX</p>
                </div>
              </div>
            </div>
          )}

          {/* Subnets Tab */}
          {selectedTab === 'subnets' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(AVALANCHE_SUBNETS).map(([chainId, subnet]) => (
                <motion.div
                  key={chainId}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {chainId === '43114' ? '🔴' : chainId === '43113' ? '🟡' : '🟢'}
                    </div>
                    <h3 className="text-xl font-bold text-white">{subnet.name}</h3>
                    <p className="text-sm text-red-200">Chain ID: {subnet.chainId}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-200">Status:</span>
                      <span className={subnet.isActive ? 'text-green-400' : 'text-red-400'}>
                        {subnet.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-200">Players:</span>
                      <span className="text-white">{subnet.totalPlayers}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoinSubnet(subnet.chainId)}
                    disabled={isLoading || !subnet.isActive || playerStats?.subnetId === subnet.chainId}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    {playerStats?.subnetId === subnet.chainId ? 'Joined' : 'Join Subnet'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quests Tab */}
          {selectedTab === 'quests' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getAvalancheQuests().map((quest) => (
                <motion.div
                  key={quest.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {quest.id === 1 ? '🔥' : quest.id === 2 ? '🌐' : '💰'}
                    </div>
                    <h3 className="text-xl font-bold text-white">{quest.title}</h3>
                    <p className="text-sm text-red-200 mt-2">{quest.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-200">AVAX Reward:</span>
                      <span className="text-yellow-400">{quest.avaxReward} AVAX</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-200">RUSH Reward:</span>
                      <span className="text-blue-400">{quest.rushReward} RUSH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-200">Difficulty:</span>
                      <span className="text-white">{'⭐'.repeat(quest.difficulty)}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCompleteQuest(quest.id)}
                    disabled={isLoading || !quest.isActive || quest.isCompleted}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    {quest.isCompleted ? 'Completed' : isLoading ? 'Processing...' : 'Complete Quest'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          {/* DeFi Tab */}
          {selectedTab === 'defi' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🚧</div>
              <h3 className="text-2xl font-bold text-white mb-4">DeFi Integration Coming Soon</h3>
              <p className="text-red-200 max-w-md mx-auto">
                We're working on integrating with major Avalanche DeFi protocols like Trader Joe, 
                Pangolin, and Benqi to provide yield farming opportunities.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-6 right-6 bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-xl shadow-2xl border border-red-400/30 backdrop-blur-sm z-50"
            style={{ marginTop: `${index * 80}px` }}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏔️</div>
              <div>
                <div className="font-bold">{notification}</div>
                <div className="text-red-200 text-sm">Avalanche C-Chain</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AvalancheCChainDashboard;
