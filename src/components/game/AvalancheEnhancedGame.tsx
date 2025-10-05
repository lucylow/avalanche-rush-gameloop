// src/components/game/AvalancheEnhancedGame.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useAvalancheFeatures, AvalancheQuestType } from '../../hooks/useAvalancheFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Mountain, 
  Zap, 
  Link, 
  Coins, 
  TrendingUp, 
  Network, 
  Shield, 
  Star,
  Trophy,
  Wallet,
  Activity,
  BarChart3
} from 'lucide-react';
import { AuthProvider, AuthContext } from '../../auth/AuthProvider'; // new context

interface AvalancheEnhancedGameProps {
  onGameComplete?: (score: number, achievements: string[]) => void;
}

const AvalancheEnhancedGame: React.FC<AvalancheEnhancedGameProps> = ({ onGameComplete }) => {
  const {
    // State
    subnets,
    stakingPositions,
    yieldPools,
    liquidityPositions,
    avalancheQuests,
    twapPrices,
    isLoading,
    error,
    
    // Connection
    account,
    
    // Functions
    createSubnet,
    stakeAVAX,
    claimStakingRewards,
    initiateBridgeTransaction,
    provideLiquidity,
    executeFlashLoan,
    completeAvalancheQuest,
    sendCrossSubnetMessage,
    loadAvalancheData,
    
    // Constants
    AVALANCHE_TOKENS,
    AvalancheQuestType
  } = useAvalancheFeatures();

  const auth = React.useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('overview');
  const [gameScore, setGameScore] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Game state
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    experience: 0,
    totalScore: 0,
    avalancheScore: 0,
    subnetContributions: 0,
    stakingRewards: 0,
    liquidityProvided: 0,
    questsCompleted: 0
  });

  // Form states
  const [subnetForm, setSubnetForm] = useState({
    name: '',
    contract: '',
    gasPrice: ''
  });

  const [stakingForm, setStakingForm] = useState({
    amount: '',
    duration: '30'
  });

  const [bridgeForm, setBridgeForm] = useState({
    to: '',
    amount: '',
    destinationChainId: '43114'
  });

  const [liquidityForm, setLiquidityForm] = useState({
    tokenA: AVALANCHE_TOKENS.AVAX,
    tokenB: AVALANCHE_TOKENS.USDC,
    amountA: '',
    amountB: '',
    minAmountA: '',
    minAmountB: ''
  });

  // Load data on mount
  useEffect(() => {
    if (account) {
      loadAvalancheData();
    }
  }, [account, loadAvalancheData]);

  // Centralized game loop using requestAnimationFrame
  const animationFrameId = useRef<number | null>(null);
  const gameLoopTick = useCallback(() => {
    if (!isPlaying) return;
    setGameScore(prev => {
      const newScore = prev + Math.floor(Math.random() * 10) + 1;
      
      // Check for achievements
      const newAchievements = [...achievements];
      if (newScore >= 1000 && !achievements.includes('avalanche_pioneer')) {
        newAchievements.push('avalanche_pioneer');
      }
      if (newScore >= 5000 && !achievements.includes('subnet_master')) {
        newAchievements.push('subnet_master');
      }
      if (newScore >= 10000 && !achievements.includes('defi_expert')) {
        newAchievements.push('defi_expert');
      }
      
      setAchievements(newAchievements);
      
      // Update player stats
      setPlayerStats(prev => ({
        ...prev,
        totalScore: newScore,
        avalancheScore: newScore,
        experience: prev.experience + 1
      }));

      return newScore;
    });
    animationFrameId.current = requestAnimationFrame(gameLoopTick);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(gameLoopTick);
      return () => {
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [isPlaying, gameLoopTick]);

  // Score submission (explicit, not reactive)
  const handleGameComplete = useCallback(async () => {
    setIsPlaying(false);
    // Submit score to Avalanche contract or backend
    // Example: await submitScore(account, gameScore, signer);
    if (onGameComplete) {
      onGameComplete(gameScore, achievements);
    }
  }, [gameScore, achievements, onGameComplete]);

  // Subnet functions
  const handleCreateSubnet = async () => {
    try {
      await createSubnet(subnetForm.name, subnetForm.contract, subnetForm.gasPrice);
      setSubnetForm({ name: '', contract: '', gasPrice: '' });
      // Complete subnet creation quest
      await completeAvalancheQuest(5); // SUBNET_CREATION
    } catch (error) {
      console.error('Failed to create subnet:', error);
    }
  };

  // Staking functions
  const handleStakeAVAX = async () => {
    try {
      await stakeAVAX(stakingForm.amount, parseInt(stakingForm.duration));
      setStakingForm({ amount: '', duration: '30' });
      // Complete staking quest
      await completeAvalancheQuest(2); // AVAX_STAKING
    } catch (error) {
      console.error('Failed to stake AVAX:', error);
    }
  };

  const handleClaimStakingRewards = async (positionId: string) => {
    try {
      await claimStakingRewards(positionId);
    } catch (error) {
      console.error('Failed to claim staking rewards:', error);
    }
  };

  // Bridge functions
  const handleBridgeTransaction = async () => {
    try {
      await initiateBridgeTransaction(bridgeForm.to, bridgeForm.amount, parseInt(bridgeForm.destinationChainId));
      setBridgeForm({ to: '', amount: '', destinationChainId: '43114' });
      // Complete bridge quest
      await completeAvalancheQuest(1); // BRIDGE_TRANSACTION
    } catch (error) {
      console.error('Failed to initiate bridge transaction:', error);
    }
  };

  // DeFi functions
  const handleProvideLiquidity = async () => {
    try {
      await provideLiquidity(
        liquidityForm.tokenA,
        liquidityForm.tokenB,
        liquidityForm.amountA,
        liquidityForm.amountB,
        liquidityForm.minAmountA,
        liquidityForm.minAmountB
      );
      setLiquidityForm({
        tokenA: AVALANCHE_TOKENS.AVAX,
        tokenB: AVALANCHE_TOKENS.USDC,
        amountA: '',
        amountB: '',
        minAmountA: '',
        minAmountB: ''
      });
      // Complete DeFi quest
      await completeAvalancheQuest(7); // AVALANCHE_DEFI_INTERACTION
    } catch (error) {
      console.error('Failed to provide liquidity:', error);
    }
  };

  const handleFlashLoan = async () => {
    try {
      const flashLoanData = ethers.AbiCoder.defaultAbiCoder().encode(['string'], ['flash_loan_test']);
      await executeFlashLoan(AVALANCHE_TOKENS.AVAX, '1', flashLoanData);
    } catch (error) {
      console.error('Failed to execute flash loan:', error);
    }
  };

  // Quest functions
  const handleCompleteQuest = async (questId: number) => {
    try {
      await completeAvalancheQuest(questId);
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  // Cross-subnet communication
  const handleCrossSubnetMessage = async () => {
    try {
      await sendCrossSubnetMessage(1, 2, 'Hello from Avalanche Rush!');
      // Complete cross-subnet quest
      await completeAvalancheQuest(6); // CROSS_SUBNET_COMMUNICATION
    } catch (error) {
      console.error('Failed to send cross-subnet message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <AuthProvider>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          {/* Login Section */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            {/* Guest or wallet connect, not required upfront */}
            {auth?.user ? (
              <span className="text-sm text-gray-500">
                {auth.user.isGuest
                  ? `Guest (${auth.user.guestId})`
                  : `Wallet: ${auth.user.address?.slice(0, 8)}...`}
              </span>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={auth?.loginWithWallet} disabled={auth?.isConnecting}>
                  {auth?.isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
                <Button size="sm" variant="outline" onClick={auth?.continueAsGuest}>
                  Play as Guest
                </Button>
              </div>
            )}
            {auth?.user && (
              <Button size="sm" variant="ghost" onClick={auth.logout}>
                Logout
              </Button>
            )}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Mountain className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Avalanche Rush Enhanced
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Experience the full power of Avalanche blockchain features
          </p>
        </div>

        {/* Game Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Game Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{gameScore}</div>
                <div className="text-sm text-gray-600">Current Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{playerStats.level}</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{playerStats.questsCompleted}</div>
                <div className="text-sm text-gray-600">Quests Completed</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Experience Progress</span>
                <span>{playerStats.experience}/1000</span>
              </div>
              <Progress value={(playerStats.experience / 1000) * 100} className="h-2" />
            </div>

            <div className="mt-4 flex space-x-2">
              <Button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              >
                {isPlaying ? 'Stop Game' : 'Start Game'}
              </Button>
              <Button onClick={handleGameComplete} variant="outline">
                Submit Score
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
            <TabsTrigger value="play">Play</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Subnet Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Network className="h-5 w-5" />
                    <span>Subnets</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subnets.length}</div>
                  <div className="text-sm text-gray-600">Active Subnets</div>
                  <Button 
                    onClick={() => setActiveTab('subnets')} 
                    className="mt-2 w-full"
                    variant="outline"
                  >
                    Manage Subnets
                  </Button>
                </CardContent>
              </Card>

              {/* Staking Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Staking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stakingPositions.length}</div>
                  <div className="text-sm text-gray-600">Active Positions</div>
                  <Button 
                    onClick={() => setActiveTab('staking')} 
                    className="mt-2 w-full"
                    variant="outline"
                  >
                    Manage Staking
                  </Button>
                </CardContent>
              </Card>

              {/* DeFi Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>DeFi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{liquidityPositions.length}</div>
                  <div className="text-sm text-gray-600">Liquidity Positions</div>
                  <Button 
                    onClick={() => setActiveTab('defi')} 
                    className="mt-2 w-full"
                    variant="outline"
                  >
                    Manage DeFi
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* TWAP Prices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Real-Time Prices (TWAP)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(twapPrices).map(([symbol, price]) => (
                    <div key={symbol} className="text-center">
                      <div className="text-lg font-bold">{symbol}</div>
                      <div className="text-sm text-gray-600">${price}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            {/* Leaderboard polling hook (to be implemented) */}
            {/* <Leaderboard tournamentId={currentTournamentId} /> */}
            <div className="text-center text-gray-500">Leaderboard coming soon...</div>
          </TabsContent>

          {/* Tournament Tab */}
          <TabsContent value="tournament" className="space-y-4">
            {/* Tournament registration and info (to be implemented) */}
            <div className="text-center text-gray-500">Tournament registration coming soon...</div>
          </TabsContent>

          {/* Play Tab */}
          <TabsContent value="play" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Play Avalanche Rush</CardTitle>
                <CardDescription>
                  Start a game and submit your score to the leaderboard!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                  >
                    {isPlaying ? 'Stop Game' : 'Start Game'}
                  </Button>
                  <Button onClick={handleGameComplete} variant="outline">
                    Submit Score
                  </Button>
                  <div className="text-2xl font-bold text-blue-500">{gameScore}</div>
                  <div className="text-sm text-gray-600">Current Score</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthProvider>
  );
};

export default AvalancheEnhancedGame;

