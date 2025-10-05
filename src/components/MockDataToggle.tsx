import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  Database, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Eye,
  EyeOff,
  X,
  Info
} from 'lucide-react';
import { useMockData } from '../hooks/useMockData';

interface MockDataToggleProps {
  isOpen: boolean;
  onClose: () => void;
}

const MockDataToggle: React.FC<MockDataToggleProps> = ({ isOpen, onClose }) => {
  const mockData = useMockData();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggleMockData = () => {
    mockData.toggleMockData();
  };

  const handleRealTimeUpdates = (enabled: boolean) => {
    mockData.updateConfig({ useRealTimeUpdates: enabled });
  };

  const handleAutoGenerateEvents = (enabled: boolean) => {
    mockData.updateConfig({ autoGenerateEvents: enabled });
  };

  const handleRefreshData = () => {
    mockData.refreshData();
  };

  const simulateEvent = (eventType: 'player_update' | 'quest_completed' | 'nft_minted' | 'tournament_update' | 'chat_message') => {
    const randomPlayer = mockData.players[Math.floor(Math.random() * mockData.players.length)];
    mockData.addEvent({
      type: eventType,
      timestamp: Date.now(),
      data: { player: randomPlayer.username, ...randomPlayer }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 bg-transparent">
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Mock Data Control Panel</CardTitle>
                      <CardDescription className="text-purple-200">
                        Configure demo data and simulation settings
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Main Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {mockData.isMockDataEnabled ? (
                      <Eye className="h-5 w-5 text-green-400" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-red-400" />
                    )}
                    <div>
                      <h3 className="text-white font-semibold">Mock Data</h3>
                      <p className="text-purple-200 text-sm">
                        {mockData.isMockDataEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={mockData.isMockDataEnabled}
                    onCheckedChange={handleToggleMockData}
                  />
                </div>

                {/* Quick Stats */}
                {mockData.isMockDataEnabled && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockData.players.length}</div>
                      <div className="text-purple-200 text-sm">Players</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockData.quests.length}</div>
                      <div className="text-purple-200 text-sm">Quests</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockData.nfts.length}</div>
                      <div className="text-purple-200 text-sm">NFTs</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-white">{mockData.events.length}</div>
                      <div className="text-purple-200 text-sm">Events</div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full border-purple-400 text-purple-200 hover:bg-purple-400/10"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                  </Button>

                  <AnimatePresence>
                    {showAdvanced && mockData.isMockDataEnabled && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4"
                      >
                        {/* Real-time Updates */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <div>
                              <h4 className="text-white font-medium">Real-time Updates</h4>
                              <p className="text-purple-200 text-sm">Auto-refresh data every 5 seconds</p>
                            </div>
                          </div>
                          <Switch
                            checked={mockData.config.useRealTimeUpdates}
                            onCheckedChange={handleRealTimeUpdates}
                          />
                        </div>

                        {/* Auto-generate Events */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Play className="h-4 w-4 text-green-400" />
                            <div>
                              <h4 className="text-white font-medium">Auto-generate Events</h4>
                              <p className="text-purple-200 text-sm">Simulate live events every 10 seconds</p>
                            </div>
                          </div>
                          <Switch
                            checked={mockData.config.autoGenerateEvents}
                            onCheckedChange={handleAutoGenerateEvents}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                {mockData.isMockDataEnabled && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRefreshData}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Data
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Simulate Events</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulateEvent('player_update')}
                          className="border-purple-400 text-purple-200 hover:bg-purple-400/10"
                        >
                          Player Update
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulateEvent('quest_completed')}
                          className="border-purple-400 text-purple-200 hover:bg-purple-400/10"
                        >
                          Quest Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulateEvent('nft_minted')}
                          className="border-purple-400 text-purple-200 hover:bg-purple-400/10"
                        >
                          NFT Minted
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulateEvent('chat_message')}
                          className="border-purple-400 text-purple-200 hover:bg-purple-400/10"
                        >
                          Chat Message
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Events */}
                {mockData.isMockDataEnabled && mockData.events.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Recent Events</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {mockData.events.slice(-5).map((event, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-white/5 rounded text-sm"
                        >
                          <Badge variant="outline" className="text-xs">
                            {event.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-purple-200">
                            {event.data.player || 'System'}
                          </span>
                          <span className="text-purple-300 text-xs ml-auto">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium">Demo Mode Active</p>
                    <p>Mock data is perfect for demonstrations and testing. All data is simulated and safe to use.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MockDataToggle;
