import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { X, Code, Puzzle, Zap, Settings, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface SmartContractModule {
  id: string;
  name: string;
  type: 'core' | 'quest' | 'reward' | 'nft' | 'marketplace' | 'utility';
  description: string;
  version: string;
  isDeployed: boolean;
  isActive: boolean;
  gasCost: number;
  dependencies: string[];
  functions: ContractFunction[];
  events: ContractEvent[];
  lastUpdated: number;
  deploymentAddress?: string;
  transactionHash?: string;
}

interface ContractFunction {
  name: string;
  description: string;
  parameters: string[];
  returnType: string;
  gasEstimate: number;
  isPublic: boolean;
  isView: boolean;
}

interface ContractEvent {
  name: string;
  description: string;
  parameters: string[];
  isIndexed: boolean;
}

interface ModularContractSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleDeployed: (module: SmartContractModule) => void;
}

const ModularContractSystem: React.FC<ModularContractSystemProps> = ({
  isOpen,
  onClose,
  onModuleDeployed
}) => {
  const [modules, setModules] = useState<SmartContractModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<SmartContractModule | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'events' | 'dependencies'>('overview');

  // Mock data
  useEffect(() => {
    if (isOpen) {
      const mockModules: SmartContractModule[] = [
        {
          id: 'core-game',
          name: 'AvalancheRushCore',
          type: 'core',
          description: 'Core game logic and state management',
          version: '2.1.0',
          isDeployed: true,
          isActive: true,
          gasCost: 0.0025,
          dependencies: [],
          functions: [
            {
              name: 'startGame',
              description: 'Initialize a new game session',
              parameters: ['uint256 gameMode', 'uint256 difficulty'],
              returnType: 'uint256',
              gasEstimate: 45000,
              isPublic: true,
              isView: false
            },
            {
              name: 'endGame',
              description: 'End current game session and calculate rewards',
              parameters: ['uint256 score', 'uint256[] achievements'],
              returnType: 'bool',
              gasEstimate: 65000,
              isPublic: true,
              isView: false
            },
            {
              name: 'getPlayerStats',
              description: 'Get player statistics and progress',
              parameters: ['address player'],
              returnType: 'PlayerStats',
              gasEstimate: 25000,
              isPublic: true,
              isView: true
            }
          ],
          events: [
            {
              name: 'GameStarted',
              description: 'Emitted when a new game session begins',
              parameters: ['address indexed player', 'uint256 gameMode', 'uint256 timestamp'],
              isIndexed: true
            },
            {
              name: 'GameEnded',
              description: 'Emitted when a game session ends',
              parameters: ['address indexed player', 'uint256 score', 'uint256[] achievements'],
              isIndexed: true
            }
          ],
          lastUpdated: Date.now() - 3600000,
          deploymentAddress: '0x1234...5678',
          transactionHash: '0xabcd...efgh'
        },
        {
          id: 'quest-engine',
          name: 'ReactiveQuestEngine',
          type: 'quest',
          description: 'Dynamic quest generation and completion tracking',
          version: '1.8.0',
          isDeployed: true,
          isActive: true,
          gasCost: 0.0018,
          dependencies: ['core-game'],
          functions: [
            {
              name: 'generateQuest',
              description: 'Generate a new quest using VRF',
              parameters: ['address player', 'uint256 questType'],
              returnType: 'Quest',
              gasEstimate: 35000,
              isPublic: true,
              isView: false
            },
            {
              name: 'completeQuest',
              description: 'Mark a quest as completed and distribute rewards',
              parameters: ['uint256 questId', 'bytes32 proof'],
              returnType: 'bool',
              gasEstimate: 55000,
              isPublic: true,
              isView: false
            },
            {
              name: 'getActiveQuests',
              description: 'Get all active quests for a player',
              parameters: ['address player'],
              returnType: 'Quest[]',
              gasEstimate: 30000,
              isPublic: true,
              isView: true
            }
          ],
          events: [
            {
              name: 'QuestGenerated',
              description: 'Emitted when a new quest is generated',
              parameters: ['address indexed player', 'uint256 questId', 'uint256 questType'],
              isIndexed: true
            },
            {
              name: 'QuestCompleted',
              description: 'Emitted when a quest is completed',
              parameters: ['address indexed player', 'uint256 questId', 'uint256 rewards'],
              isIndexed: true
            }
          ],
          lastUpdated: Date.now() - 7200000,
          deploymentAddress: '0x2345...6789',
          transactionHash: '0xbcde...fghi'
        },
        {
          id: 'reward-system',
          name: 'AutomatedRewardSystem',
          type: 'reward',
          description: 'Automated reward distribution with batching',
          version: '1.5.0',
          isDeployed: true,
          isActive: true,
          gasCost: 0.0012,
          dependencies: ['core-game', 'quest-engine'],
          functions: [
            {
              name: 'batchRewards',
              description: 'Process multiple rewards in a single transaction',
              parameters: ['RewardData[] rewards'],
              returnType: 'bool',
              gasEstimate: 75000,
              isPublic: true,
              isView: false
            },
            {
              name: 'distributeReward',
              description: 'Distribute a single reward to a player',
              parameters: ['address player', 'uint256 amount', 'string rewardType'],
              returnType: 'bool',
              gasEstimate: 40000,
              isPublic: true,
              isView: false
            },
            {
              name: 'getPendingRewards',
              description: 'Get all pending rewards for a player',
              parameters: ['address player'],
              returnType: 'RewardData[]',
              gasEstimate: 20000,
              isPublic: true,
              isView: true
            }
          ],
          events: [
            {
              name: 'RewardDistributed',
              description: 'Emitted when a reward is distributed',
              parameters: ['address indexed player', 'uint256 amount', 'string rewardType'],
              isIndexed: true
            },
            {
              name: 'BatchProcessed',
              description: 'Emitted when a batch of rewards is processed',
              parameters: ['uint256 batchId', 'uint256 totalRewards', 'uint256 gasUsed'],
              isIndexed: false
            }
          ],
          lastUpdated: Date.now() - 10800000,
          deploymentAddress: '0x3456...7890',
          transactionHash: '0xcdef...ghij'
        },
        {
          id: 'nft-marketplace',
          name: 'NFTMarketplace',
          type: 'marketplace',
          description: 'NFT trading and marketplace functionality',
          version: '1.3.0',
          isDeployed: false,
          isActive: false,
          gasCost: 0.0022,
          dependencies: ['core-game'],
          functions: [
            {
              name: 'listNFT',
              description: 'List an NFT for sale',
              parameters: ['uint256 tokenId', 'uint256 price'],
              returnType: 'bool',
              gasEstimate: 50000,
              isPublic: true,
              isView: false
            },
            {
              name: 'buyNFT',
              description: 'Purchase an NFT from the marketplace',
              parameters: ['uint256 tokenId'],
              returnType: 'bool',
              gasEstimate: 60000,
              isPublic: true,
              isView: false
            },
            {
              name: 'getListings',
              description: 'Get all active NFT listings',
              parameters: [],
              returnType: 'Listing[]',
              gasEstimate: 25000,
              isPublic: true,
              isView: true
            }
          ],
          events: [
            {
              name: 'NFTListed',
              description: 'Emitted when an NFT is listed for sale',
              parameters: ['uint256 indexed tokenId', 'address indexed seller', 'uint256 price'],
              isIndexed: true
            },
            {
              name: 'NFTSold',
              description: 'Emitted when an NFT is sold',
              parameters: ['uint256 indexed tokenId', 'address indexed buyer', 'uint256 price'],
              isIndexed: true
            }
          ],
          lastUpdated: Date.now() - 14400000
        }
      ];

      setModules(mockModules);
    }
  }, [isOpen]);

  const deployModule = useCallback(async (moduleId: string) => {
    setIsDeploying(true);
    setDeploymentProgress(0);

    // Simulate deployment process
    for (let i = 0; i <= 100; i += 10) {
      setDeploymentProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Update module status
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { 
            ...module, 
            isDeployed: true, 
            isActive: true,
            deploymentAddress: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
            transactionHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
            lastUpdated: Date.now()
          }
        : module
    ));

    const module = modules.find(m => m.id === moduleId);
    if (module) {
      onModuleDeployed(module);
    }

    setIsDeploying(false);
    setDeploymentProgress(0);
  }, [modules, onModuleDeployed]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'core': return '⚙️';
      case 'quest': return '🎯';
      case 'reward': return '💰';
      case 'nft': return '🎨';
      case 'marketplace': return '🏪';
      case 'utility': return '🔧';
      default: return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'core': return 'from-blue-500 to-blue-600';
      case 'quest': return 'from-green-500 to-green-600';
      case 'reward': return 'from-yellow-500 to-yellow-600';
      case 'nft': return 'from-purple-500 to-purple-600';
      case 'marketplace': return 'from-orange-500 to-orange-600';
      case 'utility': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-7xl w-full mx-4 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Modular Smart Contract System</h2>
              <p className="text-white/70 text-lg">Composable and maintainable contract architecture</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Modules List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Smart Contract Modules</h3>
              <div className="space-y-3">
                {modules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(module.type)}</span>
                        <div>
                          <div className="text-white font-medium">{module.name}</div>
                          <div className="text-white/60 text-sm">{module.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {module.isDeployed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Deployed
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-white/60 text-sm mb-2">{module.description}</div>
                    
                    <div className="flex items-center justify-between text-white/60 text-xs">
                      <span>v{module.version}</span>
                      <span>{module.gasCost.toFixed(4)} AVAX</span>
                    </div>

                    {!module.isDeployed && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deployModule(module.id);
                        }}
                        disabled={isDeploying}
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        {isDeploying ? 'Deploying...' : 'Deploy Module'}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Module Details */}
            <div className="lg:col-span-2">
              {selectedModule ? (
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getTypeIcon(selectedModule.type)}</span>
                      <div>
                        <CardTitle className="text-white text-xl">{selectedModule.name}</CardTitle>
                        <CardDescription className="text-white/70">
                          {selectedModule.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={selectedModule.isDeployed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {selectedModule.isDeployed ? 'Deployed' : 'Pending'}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        v{selectedModule.version}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        {selectedModule.gasCost.toFixed(4)} AVAX
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex items-center space-x-4">
                      {[
                        { id: 'overview', label: 'Overview', icon: '📋' },
                        { id: 'functions', label: 'Functions', icon: '⚙️' },
                        { id: 'events', label: 'Events', icon: '📡' },
                        { id: 'dependencies', label: 'Dependencies', icon: '🔗' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                            activeTab === tab.id
                              ? 'bg-white/10 text-white'
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-sm">{tab.icon}</span>
                          <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px]">
                      {activeTab === 'overview' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="text-white/70 text-sm">Deployment Status</div>
                              <div className="text-white font-bold text-lg">
                                {selectedModule.isDeployed ? 'Deployed' : 'Pending'}
                              </div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="text-white/70 text-sm">Gas Cost</div>
                              <div className="text-white font-bold text-lg">{selectedModule.gasCost.toFixed(4)} AVAX</div>
                            </div>
                          </div>

                          {selectedModule.deploymentAddress && (
                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="text-white/70 text-sm mb-2">Deployment Address</div>
                              <div className="text-white text-sm font-mono break-all">
                                {selectedModule.deploymentAddress}
                              </div>
                            </div>
                          )}

                          {selectedModule.transactionHash && (
                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="text-white/70 text-sm mb-2">Transaction Hash</div>
                              <div className="text-white text-sm font-mono break-all">
                                {selectedModule.transactionHash}
                              </div>
                            </div>
                          )}

                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/70 text-sm mb-2">Last Updated</div>
                            <div className="text-white text-sm">
                              {new Date(selectedModule.lastUpdated).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'functions' && (
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold">Contract Functions</h4>
                          {selectedModule.functions.map((func, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-white font-medium">{func.name}</div>
                                <div className="flex space-x-2">
                                  {func.isPublic && <Badge className="bg-green-100 text-green-800">Public</Badge>}
                                  {func.isView && <Badge className="bg-blue-100 text-blue-800">View</Badge>}
                                </div>
                              </div>
                              <div className="text-white/60 text-sm mb-2">{func.description}</div>
                              <div className="text-white/60 text-xs">
                                <div>Parameters: {func.parameters.join(', ')}</div>
                                <div>Returns: {func.returnType}</div>
                                <div>Gas Estimate: {func.gasEstimate.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'events' && (
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold">Contract Events</h4>
                          {selectedModule.events.map((event, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-white font-medium">{event.name}</div>
                                {event.isIndexed && <Badge className="bg-purple-100 text-purple-800">Indexed</Badge>}
                              </div>
                              <div className="text-white/60 text-sm mb-2">{event.description}</div>
                              <div className="text-white/60 text-xs">
                                Parameters: {event.parameters.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'dependencies' && (
                        <div className="space-y-4">
                          <h4 className="text-white font-semibold">Dependencies</h4>
                          {selectedModule.dependencies.length > 0 ? (
                            <div className="space-y-3">
                              {selectedModule.dependencies.map((dep, index) => {
                                const depModule = modules.find(m => m.id === dep);
                                return (
                                  <div key={index} className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-2xl">{getTypeIcon(depModule?.type || 'utility')}</span>
                                      <div>
                                        <div className="text-white font-medium">{depModule?.name || dep}</div>
                                        <div className="text-white/60 text-sm">{depModule?.description || 'Dependency'}</div>
                                      </div>
                                      <div className="ml-auto">
                                        {depModule?.isDeployed ? (
                                          <Badge className="bg-green-100 text-green-800">Deployed</Badge>
                                        ) : (
                                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center text-white/60 py-8">
                              <Puzzle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <p>No dependencies</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Deployment Progress */}
                    {isDeploying && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium">Deploying Module...</span>
                          <span className="text-sm">{deploymentProgress}%</span>
                        </div>
                        <Progress value={deploymentProgress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                  <div className="text-center text-white/60">
                    <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a module to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Architecture Benefits */}
          <div className="mt-8">
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center space-x-2">
                  <Puzzle className="w-6 h-6 text-blue-400" />
                  <span>Modular Architecture Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔧</div>
                    <div className="text-white font-semibold">Maintainable</div>
                    <div className="text-white/60 text-sm">Easy to update and modify</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🧩</div>
                    <div className="text-white font-semibold">Composable</div>
                    <div className="text-white/60 text-sm">Mix and match modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-white font-semibold">Efficient</div>
                    <div className="text-white/60 text-sm">Optimized gas usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-white font-semibold">Secure</div>
                    <div className="text-white/60 text-sm">Isolated functionality</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModularContractSystem;
