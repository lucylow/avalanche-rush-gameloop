import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import EnhancedWalletConnector from './EnhancedWalletConnector';
import RewardPsychologyEngine from './RewardPsychologyEngine';
import ReactiveNetworkDashboard from '../reactive/ReactiveNetworkDashboard';
import QuestSystem from './QuestSystem';
import QuestDashboard from '../quest/QuestDashboard';
import LeaderboardSystem from './LeaderboardSystem';
import NFTMarketplace from './NFTMarketplace';
import TutorialManager from '../tutorial/TutorialManager';
import EnhancedGameEngine, { GameEngineRef } from './EnhancedGameEngine';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { BookOpen, Play } from 'lucide-react';

// Import new enhancement components
import CrossChainQuestSystem from '../quest/CrossChainQuestSystem';
import ProceduralContentGenerator from './ProceduralContentGenerator';
import AutomatedRewardSystem from './AutomatedRewardSystem';
import ProgressiveOnboarding from '../onboarding/ProgressiveOnboarding';
import GasOptimizationSystem from './GasOptimizationSystem';
import RealTimeMultiplayer from './RealTimeMultiplayer';
import ModularContractSystem from './ModularContractSystem';

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

interface AvalancheRushGameProps {
  demoMode?: boolean;
}

const AvalancheRushGame: React.FC<AvalancheRushGameProps> = ({ demoMode = false }) => {
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

  // No demo mode - require real wallet connection
  const effectiveIsConnected = isConnected;
  const effectiveAccount = account;

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
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const gameEngineRef = useRef<GameEngineRef>(null);
  const [showQuestSystem, setShowQuestSystem] = useState(false);
  const [showQuestDashboard, setShowQuestDashboard] = useState(false);
  const [showLeaderboardSystem, setShowLeaderboardSystem] = useState(false);
  const [showNFTMarketplace, setShowNFTMarketplace] = useState(false);
  const [showReactiveDashboard, setShowReactiveDashboard] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  
  // New enhancement component states
  const [showCrossChainQuests, setShowCrossChainQuests] = useState(false);
  const [showProceduralContent, setShowProceduralContent] = useState(false);
  const [showAutomatedRewards, setShowAutomatedRewards] = useState(false);
  const [showProgressiveOnboarding, setShowProgressiveOnboarding] = useState(false);
  const [showGasOptimization, setShowGasOptimization] = useState(false);
  const [showRealTimeMultiplayer, setShowRealTimeMultiplayer] = useState(false);
  const [showModularContracts, setShowModularContracts] = useState(false);

  // Load player profile when wallet connects
  useEffect(() => {
    const loadProfile = async () => {
      if (effectiveIsConnected && effectiveAccount) {
        const profile = await getPlayerProfile(effectiveAccount);
        setPlayerProfile(profile);
        
        // Check if player has completed tutorial
        const tutorialCompleted = localStorage.getItem('avalanche-rush-tutorial-completed');
        setHasCompletedTutorial(!!tutorialCompleted);
      }
    };
    loadProfile();
  }, [effectiveIsConnected, effectiveAccount, getPlayerProfile]);

  // Game loop for score increase
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        currentLevel: Math.floor(prev.score / 1000) + 1
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.isPaused]);

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
    setIsLoading(true);
    
    try {
      let sessionId = Date.now(); // Use timestamp as fallback session ID
      
      // Try to start blockchain session if wallet is connected
      if (effectiveIsConnected) {
        try {
          sessionId = await startGameSession(0, 1, 1);
          setCurrentSessionId(sessionId);
        } catch (error) {
          console.warn('Blockchain session failed, continuing with offline mode:', error);
          // Continue anyway with fallback sessionId
        }
      }

      // Start the game regardless of blockchain connection
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        gameMode: mode,
        difficulty: difficulty,
        sessionId: sessionId,
        score: 0,
        lives: 3,
        energy: 100
      }));

      setShowGameModeSelector(false);
      setNotifications(prev => [...prev, `🎮 Started ${mode} game!`]);
      
      // Start the game engine
      setTimeout(() => {
        gameEngineRef.current?.startGame();
      }, 100);
    } catch (error) {
      console.error('Error starting game:', error);
      setNotifications(prev => [...prev, 'Game started in offline mode']);
      
      // Force start the game even if there's an error
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        gameMode: mode,
        difficulty: difficulty,
        sessionId: Date.now(),
        score: 0,
        lives: 3,
        energy: 100
      }));
      
      setShowGameModeSelector(false);
      
      setTimeout(() => {
        gameEngineRef.current?.startGame();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveIsConnected, startGameSession]);

  // End game function
  const endGame = useCallback(async (finalScore: number) => {
    setIsLoading(true);
    
    try {
      // Try to complete game session on blockchain if connected and session exists
      if (effectiveIsConnected && currentSessionId) {
        try {
          await completeGameSession(currentSessionId, finalScore, [], [], []);
        } catch (error) {
          console.warn('Blockchain completion failed, continuing anyway:', error);
        }
      }
      
      // Update game state regardless of blockchain
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
      
      // Force end the game even if there's an error
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        sessionId: null,
        highScore: Math.max(prev.highScore, finalScore),
        totalGamesPlayed: prev.totalGamesPlayed + 1
      }));
      
      setCurrentSessionId(null);
      setNotifications(prev => [...prev, `Game ended! Score: ${finalScore}`]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, completeGameSession, effectiveIsConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      <RewardPsychologyEngine />

      {demoMode && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 text-center relative z-20">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🚀</span>
            <span className="font-bold">HACKATHON DEMO MODE</span>
            <span className="text-xl">🎮</span>
            <span className="text-sm opacity-90">Play without wallet connection</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
            🏔️
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
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Player Dashboard</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">{playerProfile.level}</span>
                  </div>
                  <div className="text-white font-semibold">Level</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-white">💎</span>
                  </div>
                  <div className="text-white font-semibold">RUSH Tokens</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-white">🎨</span>
                  </div>
                  <div className="text-white font-semibold">NFTs</div>
                </div>
              </div>
            </div>
          )}

          {/* Tutorial Banner for New Players */}
          {!hasCompletedTutorial && isConnected && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-8 border border-purple-400 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">📚</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">New to Avalanche Rush?</h3>
                    <p className="text-purple-100">Learn the basics with our interactive tutorial and earn bonus rewards!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Start Tutorial
                </button>
              </div>
            </div>
          )}

          {/* Game Canvas */}
          {gameState.isPlaying && (
            <div className="mb-8">
              <EnhancedGameEngine
                ref={gameEngineRef}
                gameState={{
                  isPlaying: gameState.isPlaying,
                  isPaused: gameState.isPaused,
                  score: gameState.score,
                  level: gameState.currentLevel,
                  lives: gameState.lives,
                  speed: 1 + (gameState.currentLevel * 0.1),
                  difficulty: gameState.difficulty,
                  mode: gameState.gameMode,
                  achievements: gameState.achievements,
                  skillPoints: gameState.skillPoints
                }}
                onScoreUpdate={(score) => setGameState(prev => ({ ...prev, score }))}
                onGameEnd={(score) => endGame(score)}
                onLevelComplete={(level) => {
                  setGameState(prev => ({ ...prev, currentLevel: level }));
                  setNotifications(prev => [...prev, `🎉 Level ${level} complete!`]);
                }}
                isPaused={gameState.isPaused}
              />
              
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => {
                    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
                    if (gameState.isPaused) {
                      gameEngineRef.current?.resumeGame();
                    } else {
                      gameEngineRef.current?.pauseGame();
                    }
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  {gameState.isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => {
                    gameEngineRef.current?.endGame();
                    endGame(gameState.score);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  End Game
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            <button
              onClick={() => setShowGameModeSelector(true)}
              disabled={isLoading}
              className="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">🎮</div>
              <div className="text-lg font-bold">Play Game</div>
            </button>

            <button
              onClick={() => setShowTutorial(true)}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">📚</div>
              <div className="text-lg font-bold">Tutorial</div>
              {!hasCompletedTutorial && (
                <div className="text-xs text-yellow-300 mt-1">New!</div>
              )}
            </button>

            <button
              onClick={() => setShowLeaderboardSystem(true)}
              className="bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-lg font-bold">Leaderboard</div>
            </button>

            <button
              onClick={() => setShowNFTMarketplace(true)}
              className="bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">🎨</div>
              <div className="text-lg font-bold">NFT Market</div>
            </button>

            <button
              onClick={() => setShowQuestDashboard(true)}
              className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">⚔️</div>
              <div className="text-lg font-bold">Quests</div>
            </button>

            <button
              onClick={() => setShowReactiveDashboard(true)}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-lg font-bold">Reactive</div>
            </button>
              </div>

          {/* Enhancement Features */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">🚀 Hackathon Enhancement Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setShowCrossChainQuests(true)}
                className="bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">🌐</div>
                <div className="text-sm font-bold">Cross-Chain Quests</div>
                <div className="text-xs text-blue-100 mt-1">Multi-blockchain</div>
              </button>

              <button
                onClick={() => setShowProceduralContent(true)}
                className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">🎲</div>
                <div className="text-sm font-bold">Procedural Content</div>
                <div className="text-xs text-green-100 mt-1">AI + VRF</div>
              </button>

              <button
                onClick={() => setShowAutomatedRewards(true)}
                className="bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">💰</div>
                <div className="text-sm font-bold">Automated Rewards</div>
                <div className="text-xs text-yellow-100 mt-1">RSC System</div>
              </button>

              <button
                onClick={() => setShowProgressiveOnboarding(true)}
                className="bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">🔗</div>
                <div className="text-sm font-bold">Progressive Onboarding</div>
                <div className="text-xs text-purple-100 mt-1">Web2 → Web3</div>
              </button>

              <button
                onClick={() => setShowGasOptimization(true)}
                className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-sm font-bold">Gas Optimization</div>
                <div className="text-xs text-red-100 mt-1">Batching</div>
              </button>

              <button
                onClick={() => setShowRealTimeMultiplayer(true)}
                className="bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">👥</div>
                <div className="text-sm font-bold">Multiplayer</div>
                <div className="text-xs text-teal-100 mt-1">Real-time</div>
              </button>

              <button
                onClick={() => setShowModularContracts(true)}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">🧩</div>
                <div className="text-sm font-bold">Modular Contracts</div>
                <div className="text-xs text-indigo-100 mt-1">Composable</div>
              </button>

              <button
                onClick={() => {
                  // Show all enhancement features
                  setShowCrossChainQuests(true);
                  setTimeout(() => setShowProceduralContent(true), 100);
                  setTimeout(() => setShowAutomatedRewards(true), 200);
                  setTimeout(() => setShowProgressiveOnboarding(true), 300);
                  setTimeout(() => setShowGasOptimization(true), 400);
                  setTimeout(() => setShowRealTimeMultiplayer(true), 500);
                  setTimeout(() => setShowModularContracts(true), 600);
                }}
                className="bg-gradient-to-br from-gray-500 to-slate-600 hover:from-gray-400 hover:to-slate-500 text-white font-bold py-6 px-4 rounded-2xl shadow-2xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">🚀</div>
                <div className="text-sm font-bold">Show All Features</div>
                <div className="text-xs text-gray-100 mt-1">Demo Mode</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
        {notifications.map((notification, index) => (
        <div
            key={index}
          className="fixed top-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {notification}
        </div>
        ))}

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-900 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Game Mode Selector */}
      {showGameModeSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-white mb-2">Choose Your Adventure</h2>
              <p className="text-white/70 text-lg">Select a game mode and start earning rewards</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { mode: 'classic', title: 'Classic', desc: 'Traditional endless runner', icon: '🏃' },
                { mode: 'tutorial', title: 'Tutorial', desc: 'Learn the basics', icon: '📚' },
                { mode: 'challenge', title: 'Challenge', desc: 'Special objectives', icon: '🎯' },
                { mode: 'quest', title: 'Quest', desc: 'Blockchain quests', icon: '⚔️' },
                { mode: 'speedrun', title: 'Speed Run', desc: 'Race against time', icon: '⚡' },
                { mode: 'survival', title: 'Survival', desc: 'Last as long as possible', icon: '🛡️' }
              ].map(({ mode, title, desc, icon }) => (
                <button
                  key={mode}
                  onClick={() => startGame(mode as GameState['gameMode'], 'beginner')}
                  className="bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 text-left"
                >
                  <div className="text-2xl mb-4">{icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/70">{desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowGameModeSelector(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* System Modals */}
       {showQuestSystem && (
         <Suspense fallback={
           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 flex flex-col items-center space-y-4 border border-purple-500/30">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
               <p className="text-white">Loading Quest System...</p>
             </div>
           </div>
         }>
           <QuestSystem 
             isOpen={showQuestSystem} 
             onClose={() => setShowQuestSystem(false)} 
           />
         </Suspense>
       )}
       {showQuestDashboard && (
         <Suspense fallback={
           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 flex flex-col items-center space-y-4 border border-purple-500/30">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
               <p className="text-white">Loading Quest Dashboard...</p>
             </div>
           </div>
         }>
           <QuestDashboard 
             isOpen={showQuestDashboard} 
             onClose={() => setShowQuestDashboard(false)} 
           />
         </Suspense>
       )}

      {showLeaderboardSystem && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 flex flex-col items-center space-y-4 border border-purple-500/30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-white">Loading Leaderboard...</p>
            </div>
          </div>
        }>
          <LeaderboardSystem 
            isOpen={showLeaderboardSystem} 
            onClose={() => setShowLeaderboardSystem(false)} 
          />
        </Suspense>
      )}

      {showNFTMarketplace && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 flex flex-col items-center space-y-4 border border-purple-500/30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-white">Loading NFT Marketplace...</p>
            </div>
          </div>
        }>
          <NFTMarketplace 
            isOpen={showNFTMarketplace} 
            onClose={() => setShowNFTMarketplace(false)} 
          />
        </Suspense>
      )}

      {/* Reactive Network Dashboard */}
      {showReactiveDashboard && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReactiveDashboard(false)}>
          </div>
          <div className="absolute inset-0 overflow-auto">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
                <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 flex flex-col items-center space-y-4 border border-purple-500/30">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                  <p className="text-white">Loading Reactive Network Dashboard...</p>
                </div>
              </div>
            }>
              <ReactiveNetworkDashboard />
            </Suspense>
          </div>
          <button
            onClick={() => setShowReactiveDashboard(false)}
            className="fixed top-6 right-6 z-60 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors duration-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tutorial System */}
      {showTutorial && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 flex flex-col items-center space-y-4 border border-purple-500/30">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-white">Loading Tutorial...</p>
            </div>
          </div>
        }>
          <TutorialManager
            isActive={showTutorial}
            onClose={() => setShowTutorial(false)}
            onTutorialComplete={handleTutorialComplete}
            playerLevel={playerProfile?.level || 1}
            hasPlayedBefore={hasCompletedTutorial}
          />
        </Suspense>
      )}

      {/* New Enhancement Components */}
      {showCrossChainQuests && (
        <CrossChainQuestSystem
          isOpen={showCrossChainQuests}
          onClose={() => setShowCrossChainQuests(false)}
          onQuestComplete={(questId, rewards) => {
            console.log('Cross-chain quest completed:', questId, rewards);
            setNotifications(prev => [...prev, `Cross-chain quest completed! Earned ${rewards.length} rewards!`]);
          }}
        />
      )}

      {showProceduralContent && (
        <ProceduralContentGenerator
          isOpen={showProceduralContent}
          onClose={() => setShowProceduralContent(false)}
          onEventGenerated={(event) => {
            console.log('Procedural event generated:', event);
            setNotifications(prev => [...prev, `New ${event.type} event generated!`]);
          }}
          playerLevel={playerProfile?.level || 1}
          playerScore={gameState.score}
          playerHistory={[]}
        />
      )}

      {showAutomatedRewards && (
        <AutomatedRewardSystem
          isOpen={showAutomatedRewards}
          onClose={() => setShowAutomatedRewards(false)}
          onRewardProcessed={(rewardId, transactionHash) => {
            console.log('Reward processed:', rewardId, transactionHash);
            setNotifications(prev => [...prev, `Reward processed! TX: ${transactionHash.substring(0, 10)}...`]);
          }}
        />
      )}

      {showProgressiveOnboarding && (
        <ProgressiveOnboarding
          isOpen={showProgressiveOnboarding}
          onClose={() => setShowProgressiveOnboarding(false)}
          onComplete={(userData) => {
            console.log('Onboarding completed:', userData);
            setNotifications(prev => [...prev, 'Welcome to Avalanche Rush!']);
          }}
        />
      )}

      {showGasOptimization && (
        <GasOptimizationSystem
          isOpen={showGasOptimization}
          onClose={() => setShowGasOptimization(false)}
          onOptimizationApplied={(optimization) => {
            console.log('Optimization applied:', optimization);
            setNotifications(prev => [...prev, `${optimization.title} optimization activated!`]);
          }}
        />
      )}

      {showRealTimeMultiplayer && (
        <RealTimeMultiplayer
          isOpen={showRealTimeMultiplayer}
          onClose={() => setShowRealTimeMultiplayer(false)}
          onJoinRoom={(roomId) => {
            console.log('Joining room:', roomId);
            setNotifications(prev => [...prev, `Joined room ${roomId}!`]);
          }}
          onShareAchievement={(achievement) => {
            console.log('Sharing achievement:', achievement);
            setNotifications(prev => [...prev, 'Achievement shared to social feed!']);
          }}
        />
      )}

      {showModularContracts && (
        <ModularContractSystem
          isOpen={showModularContracts}
          onClose={() => setShowModularContracts(false)}
          onModuleDeployed={(module) => {
            console.log('Module deployed:', module);
            setNotifications(prev => [...prev, `${module.name} module deployed successfully!`]);
          }}
        />
      )}
    </div>
  );
};

export default AvalancheRushGame;
