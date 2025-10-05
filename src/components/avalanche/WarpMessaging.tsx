// src/components/avalanche/WarpMessaging.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Globe, 
  Zap, 
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Network,
  Link,
  Target,
  Award,
  BarChart3
} from 'lucide-react';

interface WarpMessage {
  id: string;
  sender: string;
  sourceSubnet: string;
  destinationSubnet: string;
  payload: string;
  timestamp: number;
  status: 'pending' | 'relayed' | 'delivered' | 'failed';
  messageHash: string;
  gasUsed?: number;
}

interface Subnet {
  id: string;
  name: string;
  isActive: boolean;
  messageFee: string;
  maxMessageSize: number;
  connectedSubnets: string[];
}

interface Relay {
  address: string;
  isActive: boolean;
  stakeAmount: string;
  reputation: number;
  messagesRelayed: number;
  lastActivity: number;
}

const WarpMessaging: React.FC = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<WarpMessage[]>([]);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalRelays, setTotalRelays] = useState(0);

  // Form states
  const [messageForm, setMessageForm] = useState({
    destinationSubnet: '',
    payload: '',
    gasLimit: '100000',
    gasPrice: '25'
  });

  const [callForm, setCallForm] = useState({
    destinationSubnet: '',
    targetContract: '',
    callData: '',
    gasLimit: '200000'
  });

  const [transferForm, setTransferForm] = useState({
    destinationSubnet: '',
    token: 'AVAX',
    amount: '',
    recipient: ''
  });

  const [relayForm, setRelayForm] = useState({
    stakeAmount: '1000'
  });

  useEffect(() => {
    loadWarpData();
  }, []);

  const loadWarpData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual contract calls
      setMessages([
        {
          id: '1',
          sender: '0x1234...5678',
          sourceSubnet: 'Avalanche C-Chain',
          destinationSubnet: 'Avalanche X-Chain',
          payload: 'Cross-subnet data transfer',
          timestamp: Date.now() - 300000,
          status: 'delivered',
          messageHash: '0xabcd...efgh'
        },
        {
          id: '2',
          sender: '0x8765...4321',
          sourceSubnet: 'Avalanche C-Chain',
          destinationSubnet: 'Custom Subnet',
          payload: 'Function call to contract',
          timestamp: Date.now() - 600000,
          status: 'relayed',
          messageHash: '0x1234...5678'
        },
        {
          id: '3',
          sender: '0x1111...2222',
          sourceSubnet: 'Avalanche P-Chain',
          destinationSubnet: 'Avalanche C-Chain',
          payload: 'Validator update',
          timestamp: Date.now() - 900000,
          status: 'pending',
          messageHash: '0x9999...8888'
        }
      ]);

      setSubnets([
        {
          id: '1',
          name: 'Avalanche C-Chain',
          isActive: true,
          messageFee: '0.001',
          maxMessageSize: 1024,
          connectedSubnets: ['2', '3', '4']
        },
        {
          id: '2',
          name: 'Avalanche X-Chain',
          isActive: true,
          messageFee: '0.0005',
          maxMessageSize: 512,
          connectedSubnets: ['1', '3']
        },
        {
          id: '3',
          name: 'Avalanche P-Chain',
          isActive: true,
          messageFee: '0.0005',
          maxMessageSize: 512,
          connectedSubnets: ['1', '2']
        },
        {
          id: '4',
          name: 'Custom Subnet',
          isActive: true,
          messageFee: '0.002',
          maxMessageSize: 2048,
          connectedSubnets: ['1']
        }
      ]);

      setRelays([
        {
          address: '0xrelay1...address',
          isActive: true,
          stakeAmount: '5000',
          reputation: 950,
          messagesRelayed: 1250,
          lastActivity: Date.now() - 300000
        },
        {
          address: '0xrelay2...address',
          isActive: true,
          stakeAmount: '3000',
          reputation: 875,
          messagesRelayed: 890,
          lastActivity: Date.now() - 600000
        },
        {
          address: '0xrelay3...address',
          isActive: false,
          stakeAmount: '1000',
          reputation: 650,
          messagesRelayed: 450,
          lastActivity: Date.now() - 86400000
        }
      ]);

      setTotalMessages(3);
      setTotalRelays(2);
    } catch (error) {
      console.error('Error loading warp data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      // Send warp message through contract
      console.log('Sending warp message:', messageForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Message send failed:', error);
    }
  };

  const handleExecuteCall = async () => {
    try {
      // Execute cross-subnet call through contract
      console.log('Executing cross-subnet call:', callForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Cross-subnet call failed:', error);
    }
  };

  const handleTransfer = async () => {
    try {
      // Execute cross-subnet transfer through contract
      console.log('Executing cross-subnet transfer:', transferForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Cross-subnet transfer failed:', error);
    }
  };

  const handleRegisterRelay = async () => {
    try {
      // Register as relay through contract
      console.log('Registering relay:', relayForm);
      // Add actual contract interaction here
    } catch (error) {
      console.error('Relay registration failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'relayed':
        return <Activity className="h-4 w-4 text-blue-500" />;
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
      case 'delivered':
        return 'bg-green-500';
      case 'relayed':
        return 'bg-blue-500';
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
          <MessageSquare className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-xl">Loading Warp Messaging...</p>
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
              <MessageSquare className="inline-block mr-3 h-10 w-10" />
              Avalanche Warp Messaging
            </h1>
            <p className="text-xl text-gray-300">
              Instant cross-subnet communication with reward mechanisms
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{totalMessages}</div>
            <div className="text-blue-400">Total Messages</div>
            <div className="text-sm text-gray-400 mt-2">
              Active Relays: {totalRelays} | Network Status: Online
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Messages Sent</p>
                  <p className="text-2xl font-bold text-white">{totalMessages}</p>
                </div>
                <Send className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-teal-600 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Relays</p>
                  <p className="text-2xl font-bold text-white">{totalRelays}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Connected Subnets</p>
                  <p className="text-2xl font-bold text-white">{subnets.length}</p>
                </div>
                <Network className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Network Health</p>
                  <p className="text-2xl font-bold text-white">98%</p>
                </div>
                <Shield className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Transfers
            </TabsTrigger>
            <TabsTrigger value="relays" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Relays
            </TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Messages */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Recent Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <span className="text-white font-semibold">#{message.id}</span>
                        </div>
                        <Badge className={`${getStatusColor(message.status)} text-white`}>
                          {message.status}
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-sm mb-2">
                        From: {message.sourceSubnet} → To: {message.destinationSubnet}
                      </div>
                      <div className="text-gray-300 text-sm mb-2">
                        {message.payload}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(message.timestamp).toLocaleString()} • Hash: {message.messageHash}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Subnet Status */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Subnet Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subnets.map((subnet) => (
                    <div key={subnet.id} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{subnet.name}</h3>
                        <Badge className={subnet.isActive ? 'bg-green-500' : 'bg-red-500'}>
                          {subnet.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-sm mb-2">
                        Fee: {subnet.messageFee} AVAX • Max Size: {subnet.maxMessageSize} bytes
                      </div>
                      <div className="text-gray-400 text-sm">
                        Connected to {subnet.connectedSubnets.length} subnets
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Send Warp Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Destination Subnet</Label>
                  <select
                    value={messageForm.destinationSubnet}
                    onChange={(e) => setMessageForm({ ...messageForm, destinationSubnet: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="">Select subnet...</option>
                    {subnets.map((subnet) => (
                      <option key={subnet.id} value={subnet.id}>{subnet.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Message Payload</Label>
                  <Textarea
                    value={messageForm.payload}
                    onChange={(e) => setMessageForm({ ...messageForm, payload: e.target.value })}
                    placeholder="Enter your message payload..."
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Gas Limit</Label>
                    <Input
                      value={messageForm.gasLimit}
                      onChange={(e) => setMessageForm({ ...messageForm, gasLimit: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Gas Price (gwei)</Label>
                    <Input
                      value={messageForm.gasPrice}
                      onChange={(e) => setMessageForm({ ...messageForm, gasPrice: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Button onClick={handleSendMessage} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calls Tab */}
          <TabsContent value="calls" className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Cross-Subnet Function Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Destination Subnet</Label>
                  <select
                    value={callForm.destinationSubnet}
                    onChange={(e) => setCallForm({ ...callForm, destinationSubnet: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="">Select subnet...</option>
                    {subnets.map((subnet) => (
                      <option key={subnet.id} value={subnet.id}>{subnet.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Target Contract Address</Label>
                  <Input
                    value={callForm.targetContract}
                    onChange={(e) => setCallForm({ ...callForm, targetContract: e.target.value })}
                    placeholder="0x..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Call Data</Label>
                  <Textarea
                    value={callForm.callData}
                    onChange={(e) => setCallForm({ ...callForm, callData: e.target.value })}
                    placeholder="Function selector + encoded parameters..."
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Gas Limit</Label>
                  <Input
                    value={callForm.gasLimit}
                    onChange={(e) => setCallForm({ ...callForm, gasLimit: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleExecuteCall} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Execute Call
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Cross-Subnet Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Destination Subnet</Label>
                  <select
                    value={transferForm.destinationSubnet}
                    onChange={(e) => setTransferForm({ ...transferForm, destinationSubnet: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="">Select subnet...</option>
                    {subnets.map((subnet) => (
                      <option key={subnet.id} value={subnet.id}>{subnet.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Token</Label>
                  <select
                    value={transferForm.token}
                    onChange={(e) => setTransferForm({ ...transferForm, token: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="AVAX">AVAX</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="WAVAX">WAVAX</option>
                  </select>
                </div>
                <div>
                  <Label className="text-gray-300">Amount</Label>
                  <Input
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    placeholder="0.0"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Recipient Address</Label>
                  <Input
                    value={transferForm.recipient}
                    onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
                    placeholder="0x..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleTransfer} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Execute Transfer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relays Tab */}
          <TabsContent value="relays" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Relays */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Active Relays</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relays.filter(relay => relay.isActive).map((relay) => (
                    <div key={relay.address} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{relay.address}</h3>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>
                      <div className="text-gray-400 text-sm mb-2">
                        Stake: {relay.stakeAmount} RUSH • Reputation: {relay.reputation}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Messages Relayed: {relay.messagesRelayed} • Last Activity: {new Date(relay.lastActivity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Register as Relay */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Register as Relay</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Stake Amount (RUSH)</Label>
                    <Input
                      value={relayForm.stakeAmount}
                      onChange={(e) => setRelayForm({ ...relayForm, stakeAmount: e.target.value })}
                      placeholder="1000"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Minimum stake: 1000 RUSH tokens
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Relay Benefits</h4>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• Earn 5 RUSH per message relayed</li>
                      <li>• Build reputation for better rewards</li>
                      <li>• Participate in network security</li>
                      <li>• Access to premium features</li>
                    </ul>
                  </div>
                  <Button onClick={handleRegisterRelay} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Register as Relay
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

export default WarpMessaging;
