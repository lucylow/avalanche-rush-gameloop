import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Brain, 
  Network, 
  Trophy, 
  Star,
  ArrowRight,
  Clock,
  Target,
  Award,
  Rocket,
  Shield,
  Cpu,
  Globe
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action: string;
  result: string;
  metrics: {
    tps?: number;
    gasSaved?: number;
    crossChainOps?: number;
    aiOptimizations?: number;
    retentionImprovement?: number;
  };
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  steps: DemoStep[];
  totalDuration: number;
  keyMetrics: {
    tps: number;
    gasEfficiency: number;
    crossChainOps: number;
    aiOptimizations: number;
    retentionRate: number;
  };
}

const HackathonDemoScenarios: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<DemoScenario | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [liveMetrics, setLiveMetrics] = useState({
    tps: 0,
    gasSaved: 0,
    crossChainOps: 0,
    aiOptimizations: 0,
    retentionRate: 0
  });

  const scenarios: DemoScenario[] = [
    {
      id: 'cross-chain-quest',
      title: 'Cross-Chain Quest Mastery',
      description: 'Demonstrate seamless cross-chain quest completion with automated rewards',
      steps: [
        {
          id: 'start-quest',
          title: 'Start Quest on Avalanche',
          description: 'Player initiates a cross-chain quest on Avalanche C-Chain',
          action: 'Quest started with 3-chain requirement',
          result: 'Quest ID generated, player profile updated',
          metrics: { tps: 1500, gasSaved: 0 },
          duration: 2000,
          status: 'pending'
        },
        {
          id: 'complete-ethereum',
          title: 'Complete Action on Ethereum',
          description: 'Player completes required action on Ethereum mainnet',
          action: 'Smart contract interaction on Ethereum',
          result: 'Action verified, cross-chain event triggered',
          metrics: { tps: 2000, crossChainOps: 1 },
          duration: 3000,
          status: 'pending'
        },
        {
          id: 'reactive-detection',
          title: 'Reactive Contract Detection',
          description: 'Reactive Smart Contract automatically detects cross-chain event',
          action: 'Event processing and verification',
          result: 'Cross-chain event validated, rewards calculated',
          metrics: { tps: 2500, crossChainOps: 2 },
          duration: 1500,
          status: 'pending'
        },
        {
          id: 'automated-rewards',
          title: 'Automated Reward Distribution',
          description: 'System automatically distributes rewards with cross-chain bonus',
          action: 'Reward calculation with 20% cross-chain multiplier',
          result: 'Rewards distributed, NFT evolved to rare tier',
          metrics: { tps: 3000, crossChainOps: 3 },
          duration: 2000,
          status: 'pending'
        }
      ],
      totalDuration: 8500,
      keyMetrics: {
        tps: 3000,
        gasEfficiency: 95,
        crossChainOps: 3,
        aiOptimizations: 0,
        retentionRate: 92
      }
    },
    {
      id: 'ai-difficulty',
      title: 'AI-Powered Dynamic Difficulty',
      description: 'Show real-time AI difficulty adjustment for optimal player engagement',
      steps: [
        {
          id: 'analyze-player',
          title: 'Analyze Player Profile',
          description: 'AI analyzes player performance, skill level, and retention patterns',
          action: 'ML model processes player data',
          result: 'Player profile analyzed, skill level: 7/10',
          metrics: { aiOptimizations: 1 },
          duration: 2000,
          status: 'pending'
        },
        {
          id: 'calculate-difficulty',
          title: 'Calculate Optimal Difficulty',
          description: 'Chainlink Functions calls ML model to calculate optimal difficulty',
          action: 'AI model calculates difficulty: 75/100',
          result: 'Difficulty adjusted from 50 to 75',
          metrics: { aiOptimizations: 2 },
          duration: 3000,
          status: 'pending'
        },
        {
          id: 'adjust-gameplay',
          title: 'Adjust Gameplay Experience',
          description: 'Game dynamically adjusts obstacles, rewards, and pacing',
          action: 'Game parameters updated in real-time',
          result: 'Player engagement increased by 25%',
          metrics: { aiOptimizations: 3, retentionImprovement: 25 },
          duration: 2500,
          status: 'pending'
        },
        {
          id: 'measure-improvement',
          title: 'Measure Retention Improvement',
          description: 'System measures and reports retention improvement',
          action: 'Analytics show improved player retention',
          result: 'Retention rate improved from 68% to 93%',
          metrics: { aiOptimizations: 4, retentionImprovement: 25 },
          duration: 1500,
          status: 'pending'
        }
      ],
      totalDuration: 9000,
      keyMetrics: {
        tps: 2000,
        gasEfficiency: 90,
        crossChainOps: 0,
        aiOptimizations: 4,
        retentionRate: 93
      }
    },
    {
      id: 'high-performance',
      title: 'High-Performance Gaming Subnet',
      description: 'Demonstrate 5000+ TPS gaming performance with zero-gas transactions',
      steps: [
        {
          id: 'deploy-subnet',
          title: 'Deploy Custom Gaming Subnet',
          description: 'Deploy Avalanche custom subnet optimized for gaming',
          action: 'Subnet deployed with 1-second block time',
          result: 'Gaming subnet active, ready for high-frequency updates',
          metrics: { tps: 1000 },
          duration: 2000,
          status: 'pending'
        },
        {
          id: 'zero-gas-updates',
          title: 'Zero-Gas Game State Updates',
          description: 'Players update game state with zero gas costs',
          action: '1000+ players updating game state simultaneously',
          result: 'Game states updated, gas costs eliminated',
          metrics: { tps: 3000, gasSaved: 50000 },
          duration: 3000,
          status: 'pending'
        },
        {
          id: 'warp-messaging',
          title: 'Cross-Subnet Warp Messaging',
          description: 'Send messages between gaming subnets using Warp',
          action: 'Warp messages sent between subnets',
          result: 'Cross-subnet communication established',
          metrics: { tps: 4000, crossChainOps: 5 },
          duration: 2000,
          status: 'pending'
        },
        {
          id: 'peak-performance',
          title: 'Peak Performance Achievement',
          description: 'Achieve target 5000+ TPS with anti-cheat verification',
          action: 'Anti-cheat system validates all transactions',
          result: '5000+ TPS achieved with 99.9% accuracy',
          metrics: { tps: 5000, gasSaved: 100000 },
          duration: 2500,
          status: 'pending'
        }
      ],
      totalDuration: 9500,
      keyMetrics: {
        tps: 5000,
        gasEfficiency: 100,
        crossChainOps: 5,
        aiOptimizations: 0,
        retentionRate: 95
      }
    }
  ];

  const startScenario = (scenario: DemoScenario) => {
    setCurrentScenario(scenario);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setIsRunning(true);
    setLiveMetrics({
      tps: 0,
      gasSaved: 0,
      crossChainOps: 0,
      aiOptimizations: 0,
      retentionRate: 0
    });
  };

  const runStep = async (step: DemoStep, stepIndex: number) => {
    // Update step status to running
    if (currentScenario) {
      currentScenario.steps[stepIndex].status = 'running';
    }

    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, step.duration));

    // Update metrics
    setLiveMetrics(prev => ({
      tps: Math.max(prev.tps, step.metrics.tps || 0),
      gasSaved: prev.gasSaved + (step.metrics.gasSaved || 0),
      crossChainOps: prev.crossChainOps + (step.metrics.crossChainOps || 0),
      aiOptimizations: prev.aiOptimizations + (step.metrics.aiOptimizations || 0),
      retentionRate: Math.max(prev.retentionRate, step.metrics.retentionImprovement || 0)
    }));

    // Mark step as completed
    if (currentScenario) {
      currentScenario.steps[stepIndex].status = 'completed';
    }
    setCompletedSteps(prev => new Set([...prev, stepIndex]));

    // Move to next step
    if (stepIndex < currentScenario!.steps.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
    } else {
      setIsRunning(false);
    }
  };

  const resetDemo = () => {
    setCurrentScenario(null);
    setCurrentStepIndex(0);
    setIsRunning(false);
    setCompletedSteps(new Set());
    setLiveMetrics({
      tps: 0,
      gasSaved: 0,
      crossChainOps: 0,
      aiOptimizations: 0,
      retentionRate: 0
    });
  };

  // Auto-run current step when scenario is running
  useEffect(() => {
    if (isRunning && currentScenario && currentStepIndex < currentScenario.steps.length) {
      const currentStep = currentScenario.steps[currentStepIndex];
      if (currentStep.status === 'pending') {
        runStep(currentStep, currentStepIndex);
      }
    }
  }, [isRunning, currentScenario, currentStepIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            🏆 Hackathon Demo Scenarios
          </h1>
          <p className="text-xl text-gray-300">
            Interactive demonstrations showcasing Avalanche Rush's winning features
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center">
            <Cpu className="w-8 h-8 text-blue-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{liveMetrics.tps.toLocaleString()}</div>
            <div className="text-blue-200 text-sm">TPS</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-center">
            <Zap className="w-8 h-8 text-green-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{liveMetrics.gasSaved.toLocaleString()}</div>
            <div className="text-green-200 text-sm">Gas Saved</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center">
            <Network className="w-8 h-8 text-purple-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{liveMetrics.crossChainOps}</div>
            <div className="text-purple-200 text-sm">Cross-Chain Ops</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-center">
            <Brain className="w-8 h-8 text-orange-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{liveMetrics.aiOptimizations}</div>
            <div className="text-orange-200 text-sm">AI Optimizations</div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 text-center">
            <Target className="w-8 h-8 text-pink-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{liveMetrics.retentionRate}%</div>
            <div className="text-pink-200 text-sm">Retention Rate</div>
          </div>
        </div>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {scenarios.map((scenario) => (
            <motion.div
              key={scenario.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">{scenario.title}</h3>
              <p className="text-gray-300 mb-6">{scenario.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white font-bold">{(scenario.totalDuration / 1000).toFixed(1)}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Steps</span>
                  <span className="text-white font-bold">{scenario.steps.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Target TPS</span>
                  <span className="text-white font-bold">{scenario.keyMetrics.tps.toLocaleString()}</span>
                </div>
              </div>
              
              <button
                onClick={() => startScenario(scenario)}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isRunning && currentScenario?.id === scenario.id ? 'Running...' : 'Start Demo'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Current Demo Progress */}
        {currentScenario && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{currentScenario.title}</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={resetDemo}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                {isRunning && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Running</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Progress</span>
                <span className="text-white font-bold">
                  {completedSteps.size} / {currentScenario.steps.length} steps
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSteps.size / currentScenario.steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {currentScenario.steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`p-6 rounded-xl border transition-all duration-300 ${
                    step.status === 'completed'
                      ? 'bg-green-500/10 border-green-500/50'
                      : step.status === 'running'
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-white/5 border-white/20'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : step.status === 'running' ? (
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-gray-300 mb-3">{step.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">Action:</span>
                          <p className="text-white text-sm">{step.action}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Result:</span>
                          <p className="text-white text-sm">{step.result}</p>
                        </div>
                      </div>
                      
                      {Object.keys(step.metrics).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {step.metrics.tps && (
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                              TPS: {step.metrics.tps.toLocaleString()}
                            </span>
                          )}
                          {step.metrics.gasSaved && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                              Gas Saved: {step.metrics.gasSaved.toLocaleString()}
                            </span>
                          )}
                          {step.metrics.crossChainOps && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                              Cross-Chain: {step.metrics.crossChainOps}
                            </span>
                          )}
                          {step.metrics.aiOptimizations && (
                            <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                              AI: {step.metrics.aiOptimizations}
                            </span>
                          )}
                          {step.metrics.retentionImprovement && (
                            <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                              Retention: +{step.metrics.retentionImprovement}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Hackathon Winning Points */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-center">
            <Award className="w-8 h-8 text-yellow-200 mx-auto mb-2" />
            <div className="text-white font-bold">Technical Innovation</div>
            <div className="text-yellow-200 text-sm">40 points</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-center">
            <Rocket className="w-8 h-8 text-green-200 mx-auto mb-2" />
            <div className="text-white font-bold">User Experience</div>
            <div className="text-green-200 text-sm">30 points</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-center">
            <Globe className="w-8 h-8 text-blue-200 mx-auto mb-2" />
            <div className="text-white font-bold">Market Potential</div>
            <div className="text-blue-200 text-sm">20 points</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 text-purple-200 mx-auto mb-2" />
            <div className="text-white font-bold">Implementation</div>
            <div className="text-purple-200 text-sm">10 points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDemoScenarios;




