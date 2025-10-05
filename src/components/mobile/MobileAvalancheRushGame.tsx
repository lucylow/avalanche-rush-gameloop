import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedWalletConnector from '../game/EnhancedWalletConnector';
import MobileTutorialManager from './MobileTutorialManager';
import MobileGameControls from './MobileGameControls';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { useAudioManager } from '../../hooks/useAudioManager';
import { 
  BookOpen, 
  Play, 
  Trophy, 
  ShoppingCart, 
  Sword, 
  Zap,
  Menu,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

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

const MobileAvalancheRushGame: React.FC = () => {
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

  const audioManager = useAudioManager();

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
    totalGamesPlayed: 0
  });

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  
  // Mobile-specific states
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNFTMarketplace, setShowNFTMarketplace] = useState(false);
  const [showQuestSystem, setShowQuestSystem] = useState(false);
  const [showReactiveDashboard, setShowReactiveDashboard] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Load player profile when wallet connects
  useEffect(() => {
    const loadProfile = async () => {
      if (isConnected && account) {
        const profile = await getPlayerProfile(account);
        setPlayerProfile(profile);
        
        // Check if player has completed tutorial
        const tutorialCompleted = localStorage.getItem('avalanche-rush-tutorial-completed');
        setHasCompletedTutorial(!!tutorialCompleted);
      }
    };
    loadProfile();
  }, [isConnected, account, getPlayerProfile]);

  // Handle tutorial completion
  const handleTutorialComplete = (achievements: string[], totalPoints: number) => {
    setHasCompletedTutorial(true);
    localStorage.setItem('avalanche-rush-tutorial-completed', 'true');
    
    // Add tutorial points to player profile
    if (playerProfile) {
      setPlayerProfile(prev => prev ? {
        ...prev,
        experience: prev.experience + totalPoints,
        totalScore: prev.totalScore + totalPoints,
        achievements: prev.achievements + achievements.length
      } : null);
    }
    
    // Update game state achievements
    setGameState(prev => ({
      ...prev,
      achievements: [...prev.achievements, ...achievements]
    }));
    
    setNotifications(prev => [...prev, `Tutorial completed! +${totalPoints} points earned!`]);
  };

  // Start game function
  const startGame = useCallback(async (mode: GameState['gameMode'], difficulty: GameState['difficulty']) => {
    if (!isConnected) {
      setNotifications(prev => [...prev, 'Please connect your wallet to start playing']);
      return;
    }

    setIsLoading(true);
    try {
      const sessionId = await startGameSession(0, 1, 1);
      setCurrentSessionId(sessionId);
      
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        gameMode: mode,
        difficulty: difficulty,
        score: 0,
        currentLevel: 1,
        lives: 3,
        energy: 100,
        sessionId: sessionId,
        achievements: [],
        skillPoints: {},
        totalGamesPlayed: prev.totalGamesPlayed + 1
      }));
      setShowGameModeSelector(false);
      setShowMobileMenu(false);
      setNotifications(prev => [...prev, `Game started in ${mode} mode!`]);
    } catch (error) {
      console.error('Failed to start game session:', error);
      setNotifications(prev => [...prev, 'Failed to start game. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, startGameSession]);

  // Complete game function
  const completeGame = useCallback(async (finalScore: number, newAchievements: string[] = []) => {
    if (!currentSessionId) {
      console.warn('No active session to complete.');
      return;
    }

    setIsLoading(true);
    try {
      await completeGameSession(currentSessionId, finalScore, newAchievements);
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        sessionId: null,
        highScore: Math.max(prev.highScore, finalScore),
        achievements: [...new Set([...prev.achievements, ...newAchievements])]
      }));
      setNotifications(prev => [...prev, `Game Over! Score: ${finalScore}`]);
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Failed to complete game session:', error);
      setNotifications(prev => [...prev, 'Failed to record game results.']);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, completeGameSession]);

  // Mobile control handlers
  const handleJump = () => {
    // Implement jump logic
    console.log('Jump');
  };

  const handleDuck = () => {
    // Implement duck logic
    console.log('Duck');
  };

  const handleMoveLeft = () => {
    // Implement move left logic
    console.log('Move Left');
  };

  const handleMoveRight = () => {
    // Implement move right logic
    console.log('Move Right');
  };

  const handlePause = () => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  };

  const handleResume = () => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  };

  const handleStop = () => {
    setGameState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    // Implement audio toggle logic
  };

  const handleSettings = () => {
    // Implement settings logic
    console.log('Settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-sm border-b border-white/20">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Avalanche Rush
            </h1>
          </div>
          <EnhancedWalletConnector />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          >
            <div className="w-80 h-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Player Profile */}
                {playerProfile && (
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Player Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{playerProfile.level}</div>
                        <div className="text-xs text-white/70">Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{playerProfile.highScore}</div>
                        <div className="text-xs text-white/70">High Score</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowGameModeSelector(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 transition-all"
                  >
                    <Play className="w-5 h-5" />
                    <span className="font-semibold">Play Game</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowTutorial(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold">Tutorial</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowLeaderboard(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 transition-all"
                  >
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">Leaderboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowNFTMarketplace(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-semibold">NFT Market</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuestSystem(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
                  >
                    <Sword className="w-5 h-5" />
                    <span className="font-semibold">Quests</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowReactiveDashboard(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 transition-all"
                  >
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">Reactive</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        {/* Tutorial Banner for New Players */}
        {!hasCompletedTutorial && isConnected && (
          <div className="mx-4 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 border border-purple-400 shadow-2xl">
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-lg font-bold text-white mb-2">New to Avalanche Rush?</h3>
              <p className="text-purple-100 text-sm mb-3">Learn the basics with our interactive tutorial!</p>
              <button
                onClick={() => setShowTutorial(true)}
                className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Start Tutorial
              </button>
            </div>
          </div>
        )}

        {/* Game Mode Selector */}
        <AnimatePresence>
          {showGameModeSelector && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-white/10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Choose Game Mode</h2>
                  <p className="text-white/70">Select your adventure</p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { mode: 'classic', title: 'Classic', desc: 'Endless runner', icon: '🏃' },
                    { mode: 'tutorial', title: 'Tutorial', desc: 'Learn basics', icon: '📚' },
                    { mode: 'challenge', title: 'Challenge', desc: 'Special objectives', icon: '🎯' },
                    { mode: 'quest', title: 'Quest', desc: 'Blockchain quests', icon: '⚔️' },
                    { mode: 'speedrun', title: 'Speed Run', desc: 'Race time', icon: '⚡' },
                    { mode: 'survival', title: 'Survival', desc: 'Last longest', icon: '🛡️' }
                  ].map(({ mode, title, desc, icon }) => (
                    <button
                      key={mode}
                      onClick={() => startGame(mode as GameState['gameMode'], 'beginner')}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors text-left"
                    >
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className="font-semibold text-white">{title}</div>
                        <div className="text-sm text-white/70">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowGameModeSelector(false)}
                  className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Canvas Area */}
        {gameState.isPlaying && (
          <div className="mx-4 mt-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-white/20">
            <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎮</div>
                <p className="text-white/70">Game Canvas</p>
                <p className="text-sm text-white/50">Score: {gameState.score}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 bg-white text-gray-900 px-4 py-3 rounded-lg shadow-lg z-50 text-center"
          >
            {notification}
          </motion.div>
        ))}
      </main>

      {/* Mobile Game Controls */}
      <MobileGameControls
        isPlaying={gameState.isPlaying}
        isPaused={gameState.isPaused}
        onJump={handleJump}
        onDuck={handleDuck}
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onVolumeToggle={handleVolumeToggle}
        isMuted={isMuted}
        onSettings={handleSettings}
        gameScore={gameState.score}
        lives={gameState.lives}
        level={gameState.currentLevel}
      />

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-900 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Tutorial System */}
      {showTutorial && (
        <MobileTutorialManager
          isActive={showTutorial}
          onClose={() => setShowTutorial(false)}
          onTutorialComplete={handleTutorialComplete}
          playerLevel={playerProfile?.level || 1}
          hasPlayedBefore={hasCompletedTutorial}
        />
      )}
    </div>
  );
};

export default MobileAvalancheRushGame;
