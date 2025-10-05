// src/components/game/AvalancheEnhancedGame.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
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
    }, 100);

    return () => clearInterval(gameLoop);
  }, [isPlaying, achievements]);

  // Handle game completion
  const handleGameComplete = useCallback(() => {
    setIsPlaying(false);
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
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
              Complete Game
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subnets">Subnets</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="defi">DeFi</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
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

        {/* Subnets Tab */}
        <TabsContent value="subnets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Subnet</CardTitle>
              <CardDescription>
                Deploy a new Avalanche subnet for enhanced scalability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subnet-name">Subnet Name</Label>
                <Input
                  id="subnet-name"
                  value={subnetForm.name}
                  onChange={(e) => setSubnetForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Subnet"
                />
              </div>
              <div>
                <Label htmlFor="subnet-contract">Subnet Contract Address</Label>
                <Input
                  id="subnet-contract"
                  value={subnetForm.contract}
                  onChange={(e) => setSubnetForm(prev => ({ ...prev, contract: e.target.value }))}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="gas-price">Gas Price (AVAX)</Label>
                <Input
                  id="gas-price"
                  value={subnetForm.gasPrice}
                  onChange={(e) => setSubnetForm(prev => ({ ...prev, gasPrice: e.target.value }))}
                  placeholder="0.001"
                />
              </div>
              <Button onClick={handleCreateSubnet} className="w-full">
                Create Subnet
              </Button>
            </CardContent>
          </Card>

          {/* Existing Subnets */}
          <Card>
            <CardHeader>
              <CardTitle>Active Subnets</CardTitle>
            </CardHeader>
            <CardContent>
              {subnets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No subnets created yet</p>
              ) : (
                <div className="space-y-2">
                  {subnets.map((subnet) => (
                    <div key={subnet.subnetId} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{subnet.subnetName}</div>
                        <div className="text-sm text-gray-600">ID: {subnet.subnetId}</div>
                      </div>
                      <Badge variant={subnet.isActive ? 'default' : 'secondary'}>
                        {subnet.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stake AVAX</CardTitle>
              <CardDescription>
                Stake AVAX tokens to earn validator rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stake-amount">Amount (AVAX)</Label>
                <Input
                  id="stake-amount"
                  value={stakingForm.amount}
                  onChange={(e) => setStakingForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="stake-duration">Duration (days)</Label>
                <Input
                  id="stake-duration"
                  value={stakingForm.duration}
                  onChange={(e) => setStakingForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                />
              </div>
              <Button onClick={handleStakeAVAX} className="w-full">
                Stake AVAX
              </Button>
            </CardContent>
          </Card>

          {/* Staking Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Your Staking Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {stakingPositions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No staking positions</p>
              ) : (
                <div className="space-y-2">
                  {stakingPositions.map((position) => (
                    <div key={position.positionId} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{position.amount} AVAX</div>
                        <div className="text-sm text-gray-600">
                          Duration: {position.duration} days
                        </div>
                        <div className="text-sm text-gray-600">
                          Rewards: {position.rewardsEarned} RUSH
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={position.isActive ? 'default' : 'secondary'}>
                          {position.isActive ? 'Active' : 'Completed'}
                        </Badge>
                        {position.isActive && (
                          <Button 
                            size="sm" 
                            onClick={() => handleClaimStakingRewards(position.positionId)}
                          >
                            Claim Rewards
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DeFi Tab */}
        <TabsContent value="defi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provide Liquidity</CardTitle>
              <CardDescription>
                Add liquidity to earn trading fees and rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token-a">Token A</Label>
                  <Input
                    id="token-a"
                    value={liquidityForm.tokenA}
                    onChange={(e) => setLiquidityForm(prev => ({ ...prev, tokenA: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <Label htmlFor="token-b">Token B</Label>
                  <Input
                    id="token-b"
                    value={liquidityForm.tokenB}
                    onChange={(e) => setLiquidityForm(prev => ({ ...prev, tokenB: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount-a">Amount A</Label>
                  <Input
                    id="amount-a"
                    value={liquidityForm.amountA}
                    onChange={(e) => setLiquidityForm(prev => ({ ...prev, amountA: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="amount-b">Amount B</Label>
                  <Input
                    id="amount-b"
                    value={liquidityForm.amountB}
                    onChange={(e) => setLiquidityForm(prev => ({ ...prev, amountB: e.target.value }))}
                    placeholder="20.0"
                  />
                </div>
              </div>
              <Button onClick={handleProvideLiquidity} className="w-full">
                Provide Liquidity
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flash Loans</CardTitle>
              <CardDescription>
                Execute flash loans for advanced DeFi strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleFlashLoan} className="w-full">
                Execute Flash Loan (1 AVAX)
              </Button>
            </CardContent>
          </Card>

          {/* Liquidity Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Your Liquidity Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {liquidityPositions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No liquidity positions</p>
              ) : (
                <div className="space-y-2">
                  {liquidityPositions.map((position) => (
                    <div key={position.positionId} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          {position.amountA} / {position.amountB}
                        </div>
                        <div className="text-sm text-gray-600">
                          Liquidity: {position.liquidity}
                        </div>
                        <div className="text-sm text-gray-600">
                          Rewards: {position.rewardsEarned} RUSH
                        </div>
                      </div>
                      <Badge variant={position.isActive ? 'default' : 'secondary'}>
                        {position.isActive ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bridge Tab */}
        <TabsContent value="bridge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Chain Bridge</CardTitle>
              <CardDescription>
                Transfer assets between different blockchain networks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bridge-to">Destination Address</Label>
                <Input
                  id="bridge-to"
                  value={bridgeForm.to}
                  onChange={(e) => setBridgeForm(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="bridge-amount">Amount (AVAX)</Label>
                <Input
                  id="bridge-amount"
                  value={bridgeForm.amount}
                  onChange={(e) => setBridgeForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="destination-chain">Destination Chain ID</Label>
                <Input
                  id="destination-chain"
                  value={bridgeForm.destinationChainId}
                  onChange={(e) => setBridgeForm(prev => ({ ...prev, destinationChainId: e.target.value }))}
                  placeholder="43114"
                />
              </div>
              <Button onClick={handleBridgeTransaction} className="w-full">
                Initiate Bridge Transaction
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cross-Subnet Communication</CardTitle>
              <CardDescription>
                Send messages between Avalanche subnets using Warp Messaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCrossSubnetMessage} className="w-full">
                Send Cross-Subnet Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avalanche-Specific Quests</CardTitle>
              <CardDescription>
                Complete quests to earn rewards and learn about Avalanche features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {avalancheQuests.map((quest) => (
                  <div key={quest.questId} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div className="font-medium">
                          {AvalancheQuestType[quest.questType].replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Reward: {quest.rewardAmount} RUSH
                      </div>
                      <div className="text-sm text-gray-600">
                        Difficulty: {quest.difficulty}
                      </div>
                      <div className="text-sm text-gray-600">
                        Completed: {quest.completionCount} times
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={quest.isActive ? 'default' : 'secondary'}>
                        {quest.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteQuest(quest.questId)}
                        disabled={!quest.isActive}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvalancheEnhancedGame;

