import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useWriteContract, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther, formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, Trophy, Zap, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Contract addresses (these would be deployed addresses)
const QUEST_ENGINE_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with deployed address
const ACHIEVEMENT_NFT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with deployed address
const BOUNTY_SYSTEM_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with deployed address

// Contract ABIs (simplified for demo)
const QUEST_ENGINE_ABI = [
  {
    "inputs": [{"name": "player", "type": "address"}, {"name": "questId", "type": "uint256"}],
    "name": "hasCompletedQuest",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalQuests",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const ACHIEVEMENT_NFT_ABI = [
  {
    "inputs": [{"name": "player", "type": "address"}],
    "name": "getPlayerAchievements",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "player", "type": "address"}],
    "name": "getPlayerAchievementCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const BOUNTY_SYSTEM_ABI = [
  {
    "inputs": [{"name": "player", "type": "address"}],
    "name": "getPlayerReward",
    "outputs": [
      {"name": "totalEarned", "type": "uint256"},
      {"name": "lastClaimed", "type": "uint256"},
      {"name": "completedQuests", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSystemStats",
    "outputs": [
      {"name": "totalBounties", "type": "uint256"},
      {"name": "totalPlayers", "type": "uint256"},
      {"name": "totalDistributed", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const ReactiveQuestPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract, isPending: isTransactionPending } = useWriteContract();
  
  const [questCompleted, setQuestCompleted] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Read quest completion status
  const { data: hasCompletedQuest } = useReadContract({
    address: QUEST_ENGINE_ADDRESS as `0x${string}`,
    abi: QUEST_ENGINE_ABI,
    functionName: 'hasCompletedQuest',
    args: address ? [address, 1n] : undefined,
    query: {
      enabled: !!address && QUEST_ENGINE_ADDRESS !== "0x0000000000000000000000000000000000000000",
    }
  });

  // Read player achievements
  const { data: playerAchievements } = useReadContract({
    address: ACHIEVEMENT_NFT_ADDRESS as `0x${string}`,
    abi: ACHIEVEMENT_NFT_ABI,
    functionName: 'getPlayerAchievements',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && ACHIEVEMENT_NFT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    }
  });

  // Get AVAX balance
  const { data: balance } = useBalance({
    address: address,
  });

  // Update quest completion status
  useEffect(() => {
    if (hasCompletedQuest !== undefined) {
      setQuestCompleted(hasCompletedQuest);
    }
  }, [hasCompletedQuest]);

  // Update achievements
  useEffect(() => {
    if (playerAchievements) {
      const achievementsArray = Array.from(playerAchievements as readonly bigint[]).map(n => Number(n));
      setAchievements(achievementsArray);
    }
  }, [playerAchievements]);

  const connectWallet = async () => {
    try {
      await connect({ connector: injected() });
      toast.success("Wallet connected successfully!");
    } catch (error) {
      toast.error("Failed to connect wallet");
      console.error("Wallet connection error:", error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast.info("Wallet disconnected");
  };

  const performAvalancheTransfer = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      
      // Blockchain integration disabled - using mock completion
      console.log('Quest trigger called (disabled blockchain mode)');
      
      toast.success("Quest completed! (Blockchain integration disabled - using mock data)");
      
    } catch (error) {
      toast.error("Transfer failed. Please try again.");
      console.error("Transfer error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = () => {
    setIsLoading(true);
    // Force refresh of contract data
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏔️ Avalanche Rush: Reactive Quest
          </h1>
          <p className="text-xl text-gray-300">
            Experience the power of Reactive Network automation on Avalanche
          </p>
        </div>

        {/* Wallet Connection */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <Button onClick={connectWallet} className="w-full">
                Connect Wallet
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Connected:</p>
                    <p className="text-gray-300 text-sm font-mono">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <Button variant="outline" onClick={disconnectWallet}>
                    Disconnect
                  </Button>
                </div>
                {balance && (
                  <div className="text-white">
                    <p className="text-sm text-gray-300">Balance:</p>
                    <p className="font-mono">{formatEther(balance.value)} {balance.symbol}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quest Status */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Quest Status
            </CardTitle>
            <CardDescription className="text-gray-300">
              Complete your first Reactive Network quest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-medium">Quest #1: AVAX Transfer</h3>
                {questCompleted ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Completed
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshStatus}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>
            
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Make a small AVAX transfer to complete this quest. The Reactive Network will automatically detect the transaction and mint you an achievement NFT!
              </AlertDescription>
            </Alert>

            {isConnected && !questCompleted && (
              <Button 
                onClick={performAvalancheTransfer}
                disabled={isLoading || isTransactionPending}
                className="w-full"
              >
                {isLoading || isTransactionPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Send 0.001 AVAX (Trigger Quest)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Achievements
            </CardTitle>
            <CardDescription className="text-gray-300">
              NFTs minted automatically by the Reactive Network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No achievements yet. Complete a quest to earn your first NFT!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((tokenId, index) => (
                  <Card key={index} className="bg-white/5 border-white/10">
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-white font-medium">Achievement #{tokenId.toString()}</p>
                      <p className="text-gray-300 text-sm">Reactive Quest Reward</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">How Reactive Network Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-400 font-bold">1</span>
                </div>
                <h3 className="text-white font-medium mb-2">You Make a Transaction</h3>
                <p className="text-gray-300 text-sm">Send AVAX on the Avalanche C-Chain</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 font-bold">2</span>
                </div>
                <h3 className="text-white font-medium mb-2">Reactive Network Detects</h3>
                <p className="text-gray-300 text-sm">Automatically monitors on-chain events</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <h3 className="text-white font-medium mb-2">NFT Gets Minted</h3>
                <p className="text-gray-300 text-sm">Achievement NFT appears in your wallet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReactiveQuestPage;
