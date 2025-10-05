import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface PlayerMetrics {
  totalPlayTime: number;
  averageSessionLength: number;
  totalTransactions: number;
  averageScore: number;
  retentionDays: number;
  engagementScore: number;
  churnRisk: number;
}

interface GameMetrics {
  totalPlayers: number;
  activePlayersToday: number;
  totalTransactions: number;
  averageGasUsed: number;
  totalRewardsDistributed: number;
  averageSessionLength: number;
  playerRetentionRate: number;
  revenuePerPlayer: number;
}

interface OptimizationData {
  optimalRewardRate: number;
  optimalDifficulty: number;
  recommendedChains: number[];
  predictedPlayerGrowth: number;
  gasOptimizationScore: number;
}

interface PredictiveInsight {
  insight: string;
  confidence: number;
  impact: number;
  timestamp: number;
  isActionable: boolean;
}

interface ABTest {
  id: number;
  testName: string;
  variantA: number;
  variantB: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  participantsA: number;
  participantsB: number;
  successRateA: number;
  successRateB: number;
  winningVariant: number;
}

export const useReactiveAnalytics = () => {
  const [playerMetrics, setPlayerMetrics] = useState<PlayerMetrics | null>(null);
  const [gameMetrics, setGameMetrics] = useState<GameMetrics | null>(null);
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [playerInsights, setPlayerInsights] = useState<PredictiveInsight[]>([]);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<string[]>([]);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState<PredictiveInsight[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract addresses (these would be actual deployed contract addresses)
  const REACTIVE_ANALYTICS_CONTRACT = '0x742d35Cc5A6bA1d9F8Bc8aBc35dD7428f35a9E1';

  // Contract ABI (simplified for demonstration)
  const analyticsABI = [
    'function getPlayerMetrics(address player) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)',
    'function getGameMetrics() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256)',
    'function getOptimizationData() external view returns (uint256, uint256, uint256[], uint256, uint256)',
    'function getABTest(uint256 testId) external view returns (uint256, string, uint256, uint256, uint256, uint256, bool, uint256, uint256, uint256, uint256, uint256)',
    'function performABTest(string memory testName, uint256 variantA, uint256 variantB) external',
    'function completeABTest(uint256 testId) external',
    'function generateRealTimeReport() external view returns (uint256, uint256, uint256, uint256[], uint256)',
    'function predictPlayerGrowth() external view returns (uint256, uint256)',
    'event PlayerBehaviorAnalyzed(address indexed player, uint256 engagementScore)',
    'event GameBalanceAdjusted(string parameter, uint256 oldValue, uint256 newValue)',
    'event CrossChainOptimization(uint256[] chains, uint256[] recommendedGasLimits)',
    'event PredictiveInsight(string insight, uint256 confidence, uint256 impact)',
    'event ABTestStarted(uint256 indexed testId, string testName)',
    'event ABTestCompleted(uint256 indexed testId, uint256 winningVariant)'
  ];

  // Get provider and signer
  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
  }, []);

  const getContract = useCallback(() => {
    const provider = getProvider();
    if (!provider) return null;
    
    return new ethers.Contract(REACTIVE_ANALYTICS_CONTRACT, analyticsABI, provider);
  }, [getProvider]);

  // Fetch player metrics
  const fetchPlayerMetrics = useCallback(async (playerAddress: string) => {
    try {
      setIsLoading(true);
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const [
        totalPlayTime,
        averageSessionLength,
        totalTransactions,
        averageScore,
        retentionDays,
        engagementScore,
        churnRisk
      ] = await contract.getPlayerMetrics(playerAddress);

      setPlayerMetrics({
        totalPlayTime: Number(totalPlayTime),
        averageSessionLength: Number(averageSessionLength),
        totalTransactions: Number(totalTransactions),
        averageScore: Number(averageScore),
        retentionDays: Number(retentionDays),
        engagementScore: Number(engagementScore),
        churnRisk: Number(churnRisk)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch player metrics');
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  // Fetch game metrics
  const fetchGameMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const [
        totalPlayers,
        activePlayersToday,
        totalTransactions,
        averageGasUsed,
        totalRewardsDistributed,
        averageSessionLength,
        playerRetentionRate,
        revenuePerPlayer
      ] = await contract.getGameMetrics();

      setGameMetrics({
        totalPlayers: Number(totalPlayers),
        activePlayersToday: Number(activePlayersToday),
        totalTransactions: Number(totalTransactions),
        averageGasUsed: Number(averageGasUsed),
        totalRewardsDistributed: Number(totalRewardsDistributed),
        averageSessionLength: Number(averageSessionLength),
        playerRetentionRate: Number(playerRetentionRate),
        revenuePerPlayer: Number(revenuePerPlayer)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game metrics');
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  // Fetch optimization data
  const fetchOptimizationData = useCallback(async () => {
    try {
      setIsLoading(true);
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const [
        optimalRewardRate,
        optimalDifficulty,
        recommendedChains,
        predictedPlayerGrowth,
        gasOptimizationScore
      ] = await contract.getOptimizationData();

      setOptimizationData({
        optimalRewardRate: Number(optimalRewardRate),
        optimalDifficulty: Number(optimalDifficulty),
        recommendedChains: recommendedChains.map((chain: any) => Number(chain)),
        predictedPlayerGrowth: Number(predictedPlayerGrowth),
        gasOptimizationScore: Number(gasOptimizationScore)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch optimization data');
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  // Fetch AB tests
  const fetchABTests = useCallback(async () => {
    try {
      setIsLoading(true);
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      // Fetch all AB tests (this would need to be implemented in the contract)
      const tests: ABTest[] = [];
      
      // Mock data for demonstration
      tests.push({
        id: 1,
        testName: 'Reward Rate Test',
        variantA: 100,
        variantB: 150,
        startTime: Date.now() - 86400000, // 1 day ago
        endTime: Date.now() + 86400000, // 1 day from now
        isActive: true,
        participantsA: 150,
        participantsB: 160,
        successRateA: 65,
        successRateB: 72,
        winningVariant: 0
      });

      setABTests(tests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AB tests');
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  // Generate real-time report
  const generateRealTimeReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const [
        activeUsers,
        totalTransactions,
        averageGasUsed,
        chainDistribution,
        optimizationScore
      ] = await contract.generateRealTimeReport();

      return {
        activeUsers: Number(activeUsers),
        totalTransactions: Number(totalTransactions),
        averageGasUsed: Number(averageGasUsed),
        chainDistribution: chainDistribution.map((dist: any) => Number(dist)),
        optimizationScore: Number(optimizationScore)
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  // Predict player growth
  const predictPlayerGrowth = useCallback(async () => {
    try {
      setIsLoading(true);
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const [predictedGrowth, confidence] = await contract.predictPlayerGrowth();

      return {
        predictedGrowth: Number(predictedGrowth),
        confidence: Number(confidence)
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict growth');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getContract]);

  // Start AB test
  const startABTest = useCallback(async (testName: string, variantA: number, variantB: number) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      if (!provider) throw new Error('Provider not available');

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(REACTIVE_ANALYTICS_CONTRACT, analyticsABI, signer);

      const tx = await contract.performABTest(testName, variantA, variantB);
      await tx.wait();

      // Refresh AB tests
      await fetchABTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start AB test');
    } finally {
      setIsLoading(false);
    }
  }, [getProvider, fetchABTests]);

  // Complete AB test
  const completeABTest = useCallback(async (testId: number) => {
    try {
      setIsLoading(true);
      const provider = getProvider();
      if (!provider) throw new Error('Provider not available');

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(REACTIVE_ANALYTICS_CONTRACT, analyticsABI, signer);

      const tx = await contract.completeABTest(testId);
      await tx.wait();

      // Refresh AB tests
      await fetchABTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete AB test');
    } finally {
      setIsLoading(false);
    }
  }, [getProvider, fetchABTests]);

  // Listen to events
  useEffect(() => {
    const contract = getContract();
    if (!contract) return;

    const handlePlayerBehaviorAnalyzed = (player: string, engagementScore: number) => {
      console.log('Player behavior analyzed:', player, engagementScore);
      // Update player insights
      setPlayerInsights(prev => [...prev, {
        insight: `Player ${player.slice(0, 6)}... has engagement score of ${engagementScore}`,
        confidence: 85,
        impact: 60,
        timestamp: Date.now(),
        isActionable: true
      }]);
    };

    const handleGameBalanceAdjusted = (parameter: string, oldValue: number, newValue: number) => {
      console.log('Game balance adjusted:', parameter, oldValue, newValue);
      // Update optimization recommendations
      setOptimizationRecommendations(prev => [...prev, 
        `${parameter} adjusted from ${oldValue} to ${newValue}`
      ]);
    };

    const handleCrossChainOptimization = (chains: number[], gasLimits: number[]) => {
      console.log('Cross-chain optimization:', chains, gasLimits);
      // Update optimization data
      setOptimizationData(prev => prev ? {
        ...prev,
        recommendedChains: chains
      } : null);
    };

    const handlePredictiveInsight = (insight: string, confidence: number, impact: number) => {
      console.log('Predictive insight:', insight, confidence, impact);
      // Update predictive analytics
      setPredictiveAnalytics(prev => [...prev, {
        insight,
        confidence,
        impact,
        timestamp: Date.now(),
        isActionable: true
      }]);
    };

    // Set up event listeners
    contract.on('PlayerBehaviorAnalyzed', handlePlayerBehaviorAnalyzed);
    contract.on('GameBalanceAdjusted', handleGameBalanceAdjusted);
    contract.on('CrossChainOptimization', handleCrossChainOptimization);
    contract.on('PredictiveInsight', handlePredictiveInsight);

    // Cleanup
    return () => {
      contract.off('PlayerBehaviorAnalyzed', handlePlayerBehaviorAnalyzed);
      contract.off('GameBalanceAdjusted', handleGameBalanceAdjusted);
      contract.off('CrossChainOptimization', handleCrossChainOptimization);
      contract.off('PredictiveInsight', handlePredictiveInsight);
    };
  }, [getContract]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGameMetrics();
      fetchOptimizationData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchGameMetrics, fetchOptimizationData]);

  return {
    // Data
    playerMetrics,
    gameMetrics,
    optimizationData,
    playerInsights,
    optimizationRecommendations,
    predictiveAnalytics,
    abTests,
    
    // State
    isLoading,
    error,
    
    // Actions
    fetchPlayerMetrics,
    fetchGameMetrics,
    fetchOptimizationData,
    fetchABTests,
    generateRealTimeReport,
    predictPlayerGrowth,
    startABTest,
    completeABTest,
    
    // Utilities
    clearError: () => setError(null)
  };
};
