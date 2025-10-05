import React, { useState, useEffect, useCallback } from 'react';
import EnhancedWalletConnector from './EnhancedWalletConnector';
import RewardPsychologyEngine from './RewardPsychologyEngine';
import QuestSystem from './QuestSystem';
import LeaderboardSystem from './LeaderboardSystem';
import NFTMarketplace from './NFTMarketplace';
import CharacterSelection from '../character/CharacterSelection';
import StoryProgressionUI from '../character/StoryProgressionUI';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { useCharacterStats } from '../../hooks/useCharacterStats';
import { Zap, Shield, Star } from 'lucide-react';

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

const AvalancheRushGame = () => {
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

  const {
    selectedCharacter,
    classModifiers,
    recordGameScore,
    calculateModifiedScore,
    rollCriticalHit
  } = useCharacterStats();

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
  const [showQuestSystem, setShowQuestSystem] = useState(false);
  const [showLeaderboardSystem, setShowLeaderboardSystem] = useState(false);
  const [showNFTMarketplace, setShowNFTMarketplace] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [showStoryProgression, setShowStoryProgression] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState(1);

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
      const sessionId = await startGameSession(0, 1, 1);
      setCurrentSessionId(sessionId);
      
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
      // Apply character modifiers to final score
      const modifiedScore = calculateModifiedScore(finalScore, comboMultiplier);

      await completeGameSession(currentSessionId, modifiedScore, [], [], []);

      // Record score with character NFT (awards XP and checks for story progression)
      if (selectedCharacter) {
        const baseXP = Math.floor(modifiedScore / 10); // 10 points = 1 XP
        const result = await recordGameScore(modifiedScore, baseXP);

        // Show progression notifications
        if (result.leveledUp) {
          setNotifications(prev => [...prev, `🎉 Level Up! Now level ${result.newLevel}`]);
        }
        if (result.storyUnlocked) {
          setNotifications(prev => [...prev, `📖 Story unlocked: Arc ${result.arc}, Chapter ${result.chapter}`]);
          setShowStoryProgression(true);
        }
        if (result.loreDiscovered) {
          setNotifications(prev => [...prev, `✨ Lore fragment discovered!`]);
        }
      }

      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        sessionId: null,
        highScore: Math.max(prev.highScore, modifiedScore),
        totalGamesPlayed: prev.totalGamesPlayed + 1
      }));

      setCurrentSessionId(null);
      setComboMultiplier(1);
      setNotifications(prev => [...prev, `🏆 Game completed! Score: ${modifiedScore}`]);
    } catch (error) {
      console.error('Error ending game:', error);
      setNotifications(prev => [...prev, 'Failed to complete game session']);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, completeGameSession, selectedCharacter, recordGameScore, calculateModifiedScore, comboMultiplier]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      <RewardPsychologyEngine />

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
          {/* Character Card */}
          {selectedCharacter && (
            <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-purple-500/50 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {['Rush Runner', 'Guardian Towers', 'Pixel Sharpshooter', 'Tinker Tech'][selectedCharacter.characterClass]}
                    </h3>
                    <p className="text-sm text-purple-300">Level {selectedCharacter.level} • {selectedCharacter.experience} XP</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCharacterSelection(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm"
                >
                  Change Character
                </button>
              </div>

              {/* Character Stats */}
              {classModifiers && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Score</div>
                    <div className="text-sm font-bold text-white">+{((classModifiers.scoreMultiplier - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Combo</div>
                    <div className="text-sm font-bold text-white">+{((classModifiers.comboBonus - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Defense</div>
                    <div className="text-sm font-bold text-white">+{((classModifiers.defenseBonus - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <Star className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-400">Critical</div>
                    <div className="text-sm font-bold text-white">{classModifiers.criticalChance.toFixed(0)}%</div>
                  </div>
                </div>
              )}

              {/* Story Progress */}
              {selectedCharacter.currentArc > 0 && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-purple-300">
                      📖 Story Arc {selectedCharacter.currentArc} • Chapter {selectedCharacter.currentChapter}
                    </div>
                    <button
                      onClick={() => setShowStoryProgression(true)}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      View Story
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <button
              onClick={() => setShowGameModeSelector(true)}
              disabled={!isConnected || isLoading || !selectedCharacter}
              className="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">🎮</div>
              <div className="text-lg font-bold">Play Game</div>
              {!selectedCharacter && <div className="text-xs mt-1">Select character first</div>}
            </button>

            <button
              onClick={() => setShowCharacterSelection(true)}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">🦸</div>
              <div className="text-lg font-bold">Characters</div>
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
              onClick={() => setShowQuestSystem(true)}
              className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-8 px-6 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">⚔️</div>
              <div className="text-lg font-bold">Quests</div>
            </button>
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
        <QuestSystem 
          isOpen={showQuestSystem} 
          onClose={() => setShowQuestSystem(false)} 
        />
      )}

      {showLeaderboardSystem && (
        <LeaderboardSystem 
          isOpen={showLeaderboardSystem} 
          onClose={() => setShowLeaderboardSystem(false)} 
        />
      )}

      {showNFTMarketplace && (
        <NFTMarketplace
          isOpen={showNFTMarketplace}
          onClose={() => setShowNFTMarketplace(false)}
        />
      )}

      {/* Character Selection Modal */}
      {showCharacterSelection && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCharacterSelection(false)}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold"
              >
                Close
              </button>
            </div>
            <CharacterSelection
              onCharacterSelected={() => setShowCharacterSelection(false)}
            />
          </div>
        </div>
      )}

      {/* Story Progression Modal */}
      {showStoryProgression && selectedCharacter && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowStoryProgression(false)}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold"
              >
                Close
              </button>
            </div>
            <StoryProgressionUI characterId={selectedCharacter.tokenId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AvalancheRushGame;
