import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedWalletConnector from './EnhancedWalletConnector';
import RewardPsychologyEngine from './RewardPsychologyEngine';
import CharacterSelectionModal from './CharacterSelectionModal';
import QuestSystem from './QuestSystem';
import LeaderboardSystem from './LeaderboardSystem';
import NFTMarketplace from './NFTMarketplace';
import EnhancedGameEngine from './EnhancedGameEngine';
import { useSmartContracts } from '../../hooks/useSmartContracts';

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: 'classic' | 'tutorial' | 'challenge' | 'quest' | 'speedrun' | 'survival';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  currentLevel: number;
  score: number;
  highScore: number;
  lives: number;
  energy: number;
  sessionId: number | null;
  achievements: string[];
  skillPoints: { [key: string]: number };
  totalGamesPlayed: number;
  level: number;
  speed: number;
  mode: 'classic' | 'tutorial' | 'challenge' | 'quest' | 'speedrun' | 'survival';
}

interface PlayerProfile {
  level: number;
  experience: number;
  totalGames: number;
  totalScore: number;
  highScore: number;
  achievements: number;
  skillPoints: { [key: string]: number };
  isActive: boolean;
}

const AvalancheRushGame: React.FC = () => {
  const {
    isConnected,
    account,
    chainId,
    startGameSession,
    completeGameSession,
    getPlayerProfile,
    getRushBalance,
    getPlayerNFTs
  } = useSmartContracts();

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    gameMode: 'classic',
    difficulty: 'beginner',
    currentLevel: 1,
    score: 0,
    highScore: 0,
    lives: 3,
    energy: 100,
    sessionId: null,
    achievements: [],
    skillPoints: {},
    totalGamesPlayed: 0,
    level: 1,
    speed: 1,
    mode: 'classic'
  });

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showQuestSystem, setShowQuestSystem] = useState(false);
  const [showLeaderboardSystem, setShowLeaderboardSystem] = useState(false);
  const [showNFTMarketplace, setShowNFTMarketplace] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const gameEngineRef = useRef<any>(null);

  // Load player profile when wallet connects
  useEffect(() => {
    const loadProfile = async () => {
      if (isConnected && account) {
        const profile = await getPlayerProfile(account);
        setPlayerProfile(profile);
      }
    };
    loadProfile();
  }, [isConnected, account, getPlayerProfile]);

  // Start game function
  const startGame = useCallback(async (mode: GameState['gameMode'], difficulty: GameState['difficulty']) => {
    if (!isConnected) {
      setNotifications(prev => [...prev, 'Please connect your wallet to start playing']);
      return;
    }

    setIsLoading(true);
    try {
      const sessionId = await startGameSession(0, 1, 1); // mode, difficulty, level
      setCurrentSessionId(sessionId);
      
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        gameMode: mode,
        difficulty: difficulty,
        sessionId: sessionId,
        score: 0,
        lives: 3,
        energy: 100,
        gameStartTime: Date.now()
      }));
      
      setShowGameModeSelector(false);
      setNotifications(prev => [...prev, `🎮 Started ${mode} game!`]);
    } catch (error) {
      console.error('Error starting game:', error);
      setNotifications(prev => [...prev, 'Failed to start game session']);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, startGameSession]);

  // End game function
  const endGame = useCallback(async (finalScore: number) => {
    if (!currentSessionId) return;

    setIsLoading(true);
    try {
      await completeGameSession(currentSessionId, finalScore, [], [], []);
      
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        sessionId: null,
        highScore: Math.max(prev.highScore, finalScore),
        totalGamesPlayed: prev.totalGamesPlayed + 1
      }));
      
      setCurrentSessionId(null);
      setNotifications(prev => [...prev, `🏆 Game completed! Score: ${finalScore}`]);
    } catch (error) {
      console.error('Error ending game:', error);
      setNotifications(prev => [...prev, 'Failed to complete game session']);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, completeGameSession]);

  // Game Mode Selector Component
  const GameModeSelector = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      onClick={() => setShowGameModeSelector(false)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/10 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-3xl">🎮</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-2">
              Choose Your Adventure
            </h2>
            <p className="text-white/70 text-lg">
              Select a game mode and start earning rewards
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-4 rounded-full"></div>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { mode: 'classic', title: 'Classic', desc: 'Traditional endless runner', icon: '🏃', color: 'from-blue-500 to-cyan-500' },
              { mode: 'tutorial', title: 'Tutorial', desc: 'Learn the basics', icon: '📚', color: 'from-green-500 to-emerald-500' },
              { mode: 'challenge', title: 'Challenge', desc: 'Special objectives', icon: '🎯', color: 'from-orange-500 to-red-500' },
              { mode: 'quest', title: 'Quest', desc: 'Blockchain quests', icon: '⚔️', color: 'from-purple-500 to-violet-500' },
              { mode: 'speedrun', title: 'Speed Run', desc: 'Race against time', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
              { mode: 'survival', title: 'Survival', desc: 'Last as long as possible', icon: '🛡️', color: 'from-indigo-500 to-blue-500' }
            ].map(({ mode, title, desc, icon, color }) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(mode as GameState['gameMode'], 'beginner')}
                className="relative group bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, ${color.split(' ')[1]} 0%, ${color.split(' ')[3]} 100%)` }}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl">{icon}</span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
                  
                  <div className="mt-4 flex items-center text-xs text-white/60">
                    <span className="bg-white/10 px-2 py-1 rounded-full">Beginner Friendly</span>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // Main Menu Component
  const MainMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-2xl animate-pulse">
              🏔️
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-5xl font-black text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Avalanche Rush
            </h1>
            <div className="text-sm text-white/70 font-medium tracking-wide">
              Learn • Play • Earn
            </div>
          </div>
        </div>
        <EnhancedWalletConnector />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Player Profile Card */}
          {playerProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Player Dashboard</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <span className="text-2xl font-bold text-white">{playerProfile.level}</span>
                    </div>
                    <div className="text-white font-semibold">Level</div>
                    <div className="text-white/60 text-sm">Player Level</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <span className="text-lg font-bold text-white">💎</span>
                    </div>
                    <div className="text-white font-semibold">RUSH Tokens</div>
                    <div className="text-white/60 text-sm">Available Balance</div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <span className="text-lg font-bold text-white">🎨</span>
                    </div>
                    <div className="text-white font-semibold">NFTs</div>
                    <div className="text-white/60 text-sm">Achievements</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGameModeSelector(true)}
              disabled={!isConnected || isLoading}
              className="relative group bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3 drop-shadow-lg">🎮</div>
                <div className="text-lg font-bold">Play Game</div>
                <div className="text-xs opacity-80 mt-1">Start Playing</div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLeaderboardSystem(true)}
              className="relative group bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3 drop-shadow-lg">🏆</div>
                <div className="text-lg font-bold">Leaderboard</div>
                <div className="text-xs opacity-80 mt-1">View Rankings</div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNFTMarketplace(true)}
              className="relative group bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3 drop-shadow-lg">🎨</div>
                <div className="text-lg font-bold">NFT Market</div>
                <div className="text-xs opacity-80 mt-1">Trade NFTs</div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuestSystem(true)}
              className="relative group bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3 drop-shadow-lg">⚔️</div>
                <div className="text-lg font-bold">Quests</div>
                <div className="text-xs opacity-80 mt-1">Complete Tasks</div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <RewardPsychologyEngine />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {notification}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-900 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Main Game Interface */}
      {!gameState.isPlaying ? (
        <MainMenu />
      ) : (
        <EnhancedGameEngine
          ref={gameEngineRef}
          gameState={gameState}
          onScoreUpdate={(score) => setGameState(prev => ({ ...prev, score }))}
          onGameEnd={endGame}
          onLevelComplete={(level) => {
            setGameState(prev => ({ ...prev, currentLevel: level + 1 }));
          }}
          isPaused={gameState.isPaused}
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {showGameModeSelector && <GameModeSelector />}
      </AnimatePresence>

      <AnimatePresence>
        {showQuestSystem && (
          <QuestSystem 
            isOpen={showQuestSystem} 
            onClose={() => setShowQuestSystem(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderboardSystem && (
          <LeaderboardSystem 
            isOpen={showLeaderboardSystem} 
            onClose={() => setShowLeaderboardSystem(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNFTMarketplace && (
          <NFTMarketplace 
            isOpen={showNFTMarketplace} 
            onClose={() => setShowNFTMarketplace(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvalancheRushGame;
