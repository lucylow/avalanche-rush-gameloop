// src/components/avalanche/DeFiDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Coins, 
  Zap, 
  Shield,
  Activity,
  BarChart3,
  Wallet,
  Globe,
  Link,
  Target,
  Award,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface DeFiPosition {
  id: string;
  type: 'swap' | 'lending' | 'yield' | 'bridge';
  asset: string;
  amount: string;
  value: string;
  apy?: number;
  status: 'active' | 'pending' | 'completed' | 'failed';
  timestamp: number;
  profit?: string;
}

interface YieldStrategy {
  id: string;
  name: string;
  protocol: string;
  asset: string;
  apy: number;
  tvl: string;
  minDeposit: string;
  isActive: boolean;
  type: 'lending' | 'liquidity' | 'staking' | 'yield_farming';
}

interface BridgeTransaction {
  id: string;
  token: string;
  amount: string;
  sourceChain: string;
  destinationChain: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  txHash?: string;
}

const DeFiDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [positions, setPositions] = useState<DeFiPosition[]>([]);
  const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
  const [bridgeTransactions, setBridgeTransactions] = useState<BridgeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState('0');
  const [totalProfit, setTotalProfit] = useState('0');
  const [defiScore, setDefiScore] = useState(0);

  // Form states
  const [swapForm, setSwapForm] = useState({
    tokenIn: 'AVAX',
    tokenOut: 'USDC',
    amountIn: '',
    minAmountOut: '',
    dexType: '0' // 0 = Trader Joe, 1 = Pangolin
  });

  const [lendingForm, setLendingForm] = useState({
    asset: 'AVAX',
    amount: '',
    borrow: false
  });

  const [bridgeForm, setBridgeForm] = useState({
    token: 'AVAX',
    amount: '',
    destinationChain: '1', // Ethereum
    bridgeType: '0' // 0 = Avalanche Bridge, 1 = Wormhole
  });

  const [yieldForm, setYieldForm] = useState({
    strategyId: '',
    amount: ''
  });

  useEffect(() => {
    loadDeFiData();
  }, []);

  const loadDeFiData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual contract calls
      setPositions([
        {
          id: '1',
          type: 'swap',
          asset: 'AVAX/USDC',
          amount: '10.5',
          value: '$105.00',
          status: 'completed',
          timestamp: Date.now() - 3600000,
          profit: '$2.50'
        },
        {
          id: '2',
          type: 'lending',
          asset: 'AVAX',
          amount: '25.0',
          value: '$250.00',
          apy: 7.2,
          status: 'active',
          timestamp: Date.now() - 86400000
        },
        {
          id: '3',
          type: 'yield',
          asset: 'WAVAX',
          amount: '50.0',
          value: '$500.00',
          apy: 12.5,
          status: 'active',
          timestamp: Date.now() - 172800000
        }
      ]);

      setStrategies([
        {
          id: '1',
          name: 'Benqi AVAX Lending',
          protocol: 'Benqi',
          asset: 'WAVAX',
          apy: 7.2,
          tvl: '$2.5M',
          minDeposit: '1',
          isActive: true,
          type: 'lending'
        },
        {
          id: '2',
          name: 'Trader Joe Liquidity',
          protocol: 'Trader Joe',
          asset: 'WAVAX',
          apy: 12.5,
          tvl: '$5.2M',
          minDeposit: '5',
          isActive: true,
          type: 'liquidity'
        },
        {
          id: '3',
          name: 'Pangolin Farming',
          protocol: 'Pangolin',
          asset: 'PNG',
          apy: 15.8,
          tvl: '$1.8M',
          minDeposit: '10',
          isActive: true,
          type: 'yield_farming'
        }
      ]);

      setBridgeTransactions([
        {
          id: '1',
          token: 'AVAX',
          amount: '5.0',
          sourceChain: 'Avalanche',
          destinationChain: 'Ethereum',
          status: 'confirmed',
          timestamp: Date.now() - 1800000,
          txHash: '0x1234...5678'
        },
        {
          id: '2',
          token: 'USDC',
          amount: '100.0',
          sourceChain: 'Avalanche',
          destinationChain: 'Polygon',
          status: 'pending',
          timestamp: Date.now() - 300000
        }
      ]);

      setTotalValue('$855.00');
      setTotalProfit('$12.50');
      setDefiScore(1250);
    } catch (error) {
      console.error('Error loading DeFi data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    try {
      // Execute swap through contract
      console.log('Executing swap:', swapForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  const handleLending = async () => {
    try {
      // Execute lending through contract
      console.log('Executing lending:', lendingForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Lending failed:', error);
    }
  };

  const handleBridge = async () => {
    try {
      // Execute bridge through contract
      console.log('Executing bridge:', bridgeForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Bridge failed:', error);
    }
  };

  const handleYieldDeposit = async () => {
    try {
      // Execute yield deposit through contract
      console.log('Executing yield deposit:', yieldForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Yield deposit failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-xl">Loading DeFi Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <TrendingUp className="inline-block mr-3 h-10 w-10" />
              Avalanche DeFi Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Advanced DeFi operations on Avalanche with cross-chain capabilities
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{totalValue}</div>
            <div className="text-green-400">Total Value Locked</div>
            <div className="text-sm text-gray-400 mt-2">
              DeFi Score: {defiScore} | Profit: {totalProfit}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Volume</p>
                  <p className="text-2xl font-bold text-white">$12.5K</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-teal-600 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Positions</p>
                  <p className="text-2xl font-bold text-white">{positions.filter(p => p.status === 'active').length}</p>
                </div>
                <Target className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Bridge Volume</p>
                  <p className="text-2xl font-bold text-white">$2.1K</p>
                </div>
                <Globe className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">DeFi Score</p>
                  <p className="text-2xl font-bold text-white">{defiScore}</p>
                </div>
                <Award className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="lending" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Lending
            </TabsTrigger>
            <TabsTrigger value="bridge" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Bridge
            </TabsTrigger>
            <TabsTrigger value="yield" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Yield
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Positions */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Active Positions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {positions.filter(p => p.status === 'active').map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(position.status)}
                        <div>
                          <div className="text-white font-semibold">{position.asset}</div>
                          <div className="text-gray-400 text-sm">{position.amount} tokens</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{position.value}</div>
                        {position.apy && (
                          <div className="text-green-400 text-sm">{position.apy}% APY</div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {positions.slice(0, 3).map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(position.status)}
                        <div>
                          <div className="text-white font-semibold">{position.type.toUpperCase()}</div>
                          <div className="text-gray-400 text-sm">{position.asset}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{position.value}</div>
                        {position.profit && (
                          <div className="text-green-400 text-sm">+{position.profit}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Bridge Transactions */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Bridge Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bridgeTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="text-white font-semibold">
                            {tx.amount} {tx.token} → {tx.destinationChain}
                          </div>
                          <div className="text-gray-400 text-sm">
                            From {tx.sourceChain} • {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(tx.status)} text-white`}>
                          {tx.status}
                        </Badge>
                        {tx.txHash && (
                          <div className="text-gray-400 text-xs mt-1">{tx.txHash}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swap Tab */}
          <TabsContent value="swap" className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">DEX Swap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Token In</Label>
                    <Input
                      value={swapForm.tokenIn}
                      onChange={(e) => setSwapForm({ ...swapForm, tokenIn: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Token Out</Label>
                    <Input
                      value={swapForm.tokenOut}
                      onChange={(e) => setSwapForm({ ...swapForm, tokenOut: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Amount In</Label>
                  <Input
                    value={swapForm.amountIn}
                    onChange={(e) => setSwapForm({ ...swapForm, amountIn: e.target.value })}
                    placeholder="0.0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Minimum Amount Out</Label>
                  <Input
                    value={swapForm.minAmountOut}
                    onChange={(e) => setSwapForm({ ...swapForm, minAmountOut: e.target.value })}
                    placeholder="0.0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">DEX</Label>
                  <select
                    value={swapForm.dexType}
                    onChange={(e) => setSwapForm({ ...swapForm, dexType: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="0">Trader Joe</option>
                    <option value="1">Pangolin</option>
                  </select>
                </div>
                <Button onClick={handleSwap} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Execute Swap
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lending Tab */}
          <TabsContent value="lending" className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Lending Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Asset</Label>
                  <select
                    value={lendingForm.asset}
                    onChange={(e) => setLendingForm({ ...lendingForm, asset: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="AVAX">AVAX</option>
                    <option value="WAVAX">WAVAX</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Amount</Label>
                  <Input
                    value={lendingForm.amount}
                    onChange={(e) => setLendingForm({ ...lendingForm, amount: e.target.value })}
                    placeholder="0.0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="borrow"
                    checked={lendingForm.borrow}
                    onChange={(e) => setLendingForm({ ...lendingForm, borrow: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="borrow" className="text-gray-300">Enable borrowing</Label>
                </div>
                <Button onClick={handleLending} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Open Position
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bridge Tab */}
          <TabsContent value="bridge" className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Cross-Chain Bridge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Token</Label>
                  <select
                    value={bridgeForm.token}
                    onChange={(e) => setBridgeForm({ ...bridgeForm, token: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="AVAX">AVAX</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Amount</Label>
                  <Input
                    value={bridgeForm.amount}
                    onChange={(e) => setBridgeForm({ ...bridgeForm, amount: e.target.value })}
                    placeholder="0.0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Destination Chain</Label>
                  <select
                    value={bridgeForm.destinationChain}
                    onChange={(e) => setBridgeForm({ ...bridgeForm, destinationChain: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="1">Ethereum</option>
                    <option value="137">Polygon</option>
                    <option value="56">BSC</option>
                    <option value="250">Fantom</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Bridge Protocol</Label>
                  <select
                    value={bridgeForm.bridgeType}
                    onChange={(e) => setBridgeForm({ ...bridgeForm, bridgeType: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="0">Avalanche Bridge</option>
                    <option value="1">Wormhole</option>
                  </select>
                </div>
                <Button onClick={handleBridge} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Initiate Bridge
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yield Tab */}
          <TabsContent value="yield" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Yield Strategies */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Available Strategies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{strategy.name}</h3>
                        <Badge className="bg-green-500 text-white">{strategy.apy}% APY</Badge>
                      </div>
                      <div className="text-gray-400 text-sm mb-2">
                        Protocol: {strategy.protocol} | TVL: {strategy.tvl}
                      </div>
                      <div className="text-gray-400 text-sm mb-3">
                        Min Deposit: {strategy.minDeposit} {strategy.asset}
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setYieldForm({ ...yieldForm, strategyId: strategy.id })}
                      >
                        Select Strategy
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Deposit Form */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Deposit to Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Selected Strategy</Label>
                    <Input
                      value={strategies.find(s => s.id === yieldForm.strategyId)?.name || ''}
                      disabled
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Amount</Label>
                    <Input
                      value={yieldForm.amount}
                      onChange={(e) => setYieldForm({ ...yieldForm, amount: e.target.value })}
                      placeholder="0.0"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button 
                    onClick={handleYieldDeposit} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={!yieldForm.strategyId}
                  >
                    Deposit to Strategy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeFiDashboard;
