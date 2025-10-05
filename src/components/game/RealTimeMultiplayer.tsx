import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { X, Users, Trophy, MessageCircle, Share2, Heart, Star, Zap, Crown } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  level: number;
  isOnline: boolean;
  isPlaying: boolean;
  currentGame?: string;
  achievements: string[];
  socialScore: number;
}

interface GameRoom {
  id: string;
  name: string;
  type: 'battle_royale' | 'team_vs_team' | 'coop' | 'tournament';
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  prize: number;
  entryFee: number;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

interface SocialPost {
  id: string;
  playerId: string;
  username: string;
  avatar: string;
  content: string;
  type: 'achievement' | 'score' | 'quest' | 'general';
  likes: number;
  comments: number;
  shares: number;
  createdAt: number;
  gameData?: {
    score?: number;
    achievement?: string;
    quest?: string;
  };
}

interface RealTimeMultiplayerProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string) => void;
  onShareAchievement: (achievement: string) => void;
}

const RealTimeMultiplayer: React.FC<RealTimeMultiplayerProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  onShareAchievement
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'social' | 'leaderboard'>('rooms');
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<GameRoom['type']>('battle_royale');

  // Mock data
  useEffect(() => {
    if (isOpen) {
      const mockPlayers: Player[] = [
        {
          id: 'player-1',
          username: 'AvalancheMaster',
          avatar: '🏔️',
          score: 15420,
          level: 25,
          isOnline: true,
          isPlaying: true,
          currentGame: 'Battle Royale',
          achievements: ['First Win', 'Score Master', 'Quest Hunter'],
          socialScore: 1250
        },
        {
          id: 'player-2',
          username: 'RushChampion',
          avatar: '⚡',
          score: 12890,
          level: 22,
          isOnline: true,
          isPlaying: false,
          achievements: ['Speed Demon', 'Combo King'],
          socialScore: 980
        },
        {
          id: 'player-3',
          username: 'NFTCollector',
          avatar: '🎨',
          score: 11200,
          level: 20,
          isOnline: true,
          isPlaying: true,
          currentGame: 'Team vs Team',
          achievements: ['NFT Master', 'Collector'],
          socialScore: 750
        }
      ];

      const mockRooms: GameRoom[] = [
        {
          id: 'room-1',
          name: 'Epic Battle Royale',
          type: 'battle_royale',
          players: mockPlayers.slice(0, 2),
          maxPlayers: 10,
          status: 'waiting',
          prize: 1000,
          entryFee: 50,
          createdAt: Date.now() - 1800000
        },
        {
          id: 'room-2',
          name: 'Team Championship',
          type: 'team_vs_team',
          players: mockPlayers.slice(1, 3),
          maxPlayers: 8,
          status: 'playing',
          prize: 2000,
          entryFee: 100,
          createdAt: Date.now() - 3600000,
          startedAt: Date.now() - 1800000
        },
        {
          id: 'room-3',
          name: 'Coop Quest',
          type: 'coop',
          players: mockPlayers.slice(0, 1),
          maxPlayers: 4,
          status: 'waiting',
          prize: 500,
          entryFee: 25,
          createdAt: Date.now() - 900000
        }
      ];

      const mockSocialPosts: SocialPost[] = [
        {
          id: 'post-1',
          playerId: 'player-1',
          username: 'AvalancheMaster',
          avatar: '🏔️',
          content: 'Just achieved a new high score of 15,420! 🎉',
          type: 'score',
          likes: 24,
          comments: 8,
          shares: 3,
          createdAt: Date.now() - 1800000,
          gameData: { score: 15420 }
        },
        {
          id: 'post-2',
          playerId: 'player-2',
          username: 'RushChampion',
          avatar: '⚡',
          content: 'Completed the Cross-Chain Explorer quest! Earned a rare NFT 🎨',
          type: 'achievement',
          likes: 18,
          comments: 5,
          shares: 2,
          createdAt: Date.now() - 3600000,
          gameData: { achievement: 'Cross-Chain Explorer' }
        },
        {
          id: 'post-3',
          playerId: 'player-3',
          username: 'NFTCollector',
          avatar: '🎨',
          content: 'Trading my legendary NFT for 500 RUSH tokens. DM me! 💰',
          type: 'general',
          likes: 12,
          comments: 15,
          shares: 1,
          createdAt: Date.now() - 5400000
        }
      ];

      setPlayers(mockPlayers);
      setRooms(mockRooms);
      setSocialPosts(mockSocialPosts);
    }
  }, [isOpen]);

  const createRoom = useCallback(() => {
    if (!newRoomName.trim()) return;

    const newRoom: GameRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName,
      type: newRoomType,
      players: [],
      maxPlayers: newRoomType === 'battle_royale' ? 10 : newRoomType === 'team_vs_team' ? 8 : 4,
      status: 'waiting',
      prize: newRoomType === 'tournament' ? 5000 : newRoomType === 'battle_royale' ? 1000 : 500,
      entryFee: newRoomType === 'tournament' ? 250 : newRoomType === 'battle_royale' ? 50 : 25,
      createdAt: Date.now()
    };

    setRooms(prev => [newRoom, ...prev]);
    setNewRoomName('');
    setIsCreatingRoom(false);
  }, [newRoomName, newRoomType]);

  const joinRoom = useCallback((roomId: string) => {
    onJoinRoom(roomId);
    // Simulate joining room
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, players: [...room.players, players[0]] }
        : room
    ));
  }, [onJoinRoom, players]);

  const likePost = useCallback((postId: string) => {
    setSocialPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  }, []);

  const sharePost = useCallback((postId: string) => {
    const post = socialPosts.find(p => p.id === postId);
    if (post) {
      onShareAchievement(post.content);
      setSocialPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, shares: p.shares + 1 }
          : p
      ));
    }
  }, [socialPosts, onShareAchievement]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'battle_royale': return '⚔️';
      case 'team_vs_team': return '👥';
      case 'coop': return '🤝';
      case 'tournament': return '🏆';
      default: return '🎮';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'battle_royale': return 'from-red-500 to-red-600';
      case 'team_vs_team': return 'from-blue-500 to-blue-600';
      case 'coop': return 'from-green-500 to-green-600';
      case 'tournament': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'playing': return 'bg-green-100 text-green-800';
      case 'finished': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <h2 className="text-4xl font-black text-white mb-2">Real-Time Multiplayer</h2>
              <p className="text-white/70 text-lg">Battle, cooperate, and socialize with players worldwide</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-4 mb-8">
            {[
              { id: 'rooms', label: 'Game Rooms', icon: '🎮' },
              { id: 'social', label: 'Social Feed', icon: '💬' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'rooms' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Game Rooms List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Available Rooms</h3>
                    <Button
                      onClick={() => setIsCreatingRoom(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      Create Room
                    </Button>
                  </div>

                  {isCreatingRoom && (
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Create New Room</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-white text-sm mb-2 block">Room Name</label>
                          <Input
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder-white/50"
                            placeholder="Enter room name"
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm mb-2 block">Game Type</label>
                          <select
                            value={newRoomType}
                            onChange={(e) => setNewRoomType(e.target.value as GameRoom['type'])}
                            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
                          >
                            <option value="battle_royale">Battle Royale</option>
                            <option value="team_vs_team">Team vs Team</option>
                            <option value="coop">Cooperative</option>
                            <option value="tournament">Tournament</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={createRoom}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            Create
                          </Button>
                          <Button
                            onClick={() => setIsCreatingRoom(false)}
                            variant="outline"
                            className="text-white border-white/20 hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-3">
                    {rooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setSelectedRoom(room)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getTypeIcon(room.type)}</span>
                            <div>
                              <div className="text-white font-medium">{room.name}</div>
                              <div className="text-white/60 text-sm">{room.type}</div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(room.status)}>
                            {room.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-white/60 text-sm mb-2">
                          <span>{room.players.length}/{room.maxPlayers} players</span>
                          <span>Prize: {room.prize} RUSH</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-white/60 text-xs">
                          <span>Entry: {room.entryFee} RUSH</span>
                          <span>Created: {new Date(room.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Room Details */}
                <div>
                  {selectedRoom ? (
                    <Card className="bg-white/5 border-white/10 h-full">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">{selectedRoom.name}</CardTitle>
                        <CardDescription className="text-white/70">
                          {selectedRoom.type} • {selectedRoom.players.length}/{selectedRoom.maxPlayers} players
                        </CardDescription>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(selectedRoom.status)}>
                            {selectedRoom.status}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">
                            {selectedRoom.prize} RUSH prize
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Room Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-white/70 text-sm">Entry Fee</div>
                            <div className="text-white font-bold text-lg">{selectedRoom.entryFee} RUSH</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-white/70 text-sm">Prize Pool</div>
                            <div className="text-white font-bold text-lg">{selectedRoom.prize} RUSH</div>
                          </div>
                        </div>

                        {/* Players */}
                        <div>
                          <h4 className="text-white font-semibold mb-3">Players ({selectedRoom.players.length})</h4>
                          <div className="space-y-2">
                            {selectedRoom.players.map((player) => (
                              <div key={player.id} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                                <span className="text-2xl">{player.avatar}</span>
                                <div className="flex-1">
                                  <div className="text-white font-medium text-sm">{player.username}</div>
                                  <div className="text-white/60 text-xs">Level {player.level} • {player.score.toLocaleString()} pts</div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {player.isOnline && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                                  {player.isPlaying && <span className="text-xs text-blue-400">Playing</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Join Button */}
                        {selectedRoom.status === 'waiting' && selectedRoom.players.length < selectedRoom.maxPlayers && (
                          <Button
                            onClick={() => joinRoom(selectedRoom.id)}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            Join Room
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white/5 border-white/10 h-full flex items-center justify-center">
                      <div className="text-center text-white/60">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Select a room to view details</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Social Feed</h3>
                  <Button
                    onClick={() => onShareAchievement('New achievement unlocked!')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    Share Achievement
                  </Button>
                </div>

                <div className="space-y-4">
                  {socialPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-lg p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{post.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-white font-semibold">{post.username}</span>
                            <Badge className="bg-blue-100 text-blue-800">
                              {post.type}
                            </Badge>
                          </div>
                          <p className="text-white/80 mb-4">{post.content}</p>
                          
                          <div className="flex items-center space-x-6">
                            <button
                              onClick={() => likePost(post.id)}
                              className="flex items-center space-x-1 text-white/60 hover:text-red-400 transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-white/60 hover:text-blue-400 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments}</span>
                            </button>
                            <button
                              onClick={() => sharePost(post.id)}
                              className="flex items-center space-x-1 text-white/60 hover:text-green-400 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              <span>{post.shares}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Global Leaderboard</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Top Players */}
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Top Players</h4>
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-2xl">{player.avatar}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{player.username}</div>
                          <div className="text-white/60 text-xs">{player.score.toLocaleString()} pts</div>
                        </div>
                        <div className="text-white/60 text-xs">Lv.{player.level}</div>
                      </div>
                    ))}
                  </div>

                  {/* Social Leaders */}
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Social Leaders</h4>
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-2xl">{player.avatar}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{player.username}</div>
                          <div className="text-white/60 text-xs">{player.socialScore} social pts</div>
                        </div>
                        <div className="text-white/60 text-xs">{player.achievements.length} achievements</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Achievements */}
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Recent Achievements</h4>
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <span className="text-2xl">{player.avatar}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{player.username}</div>
                          <div className="text-white/60 text-xs">{player.achievements[0] || 'No achievements'}</div>
                        </div>
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RealTimeMultiplayer;
