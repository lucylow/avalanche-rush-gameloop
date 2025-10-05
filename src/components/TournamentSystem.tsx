import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, Clock, Coins, Star, Target, Award } from 'lucide-react';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';

interface Tournament {
  id: number;
  name: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
  entryFee: number;
  prizePool: number;
  startTime: number;
  endTime: number;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  isCompleted: boolean;
  participants: string[];
  winners: string[];
  winnerPrizes: number[];
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

interface PlayerScore {
  player: string;
  score: number;
  timestamp: number;
  rank: number;
}

const TournamentSystem: React.FC = () => {
  const { isConnected, account } = useAdvancedWeb3();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'JOINED' | 'COMPLETED'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const tournamentTypes = {
    DAILY: { color: 'from-green-500 to-green-600', icon: '🌅', duration: '24h' },
    WEEKLY: { color: 'from-blue-500 to-blue-600', icon: '📅', duration: '7d' },
    MONTHLY: { color: 'from-purple-500 to-purple-600', icon: '🗓️', duration: '30d' },
    SPECIAL: { color: 'from-yellow-500 to-orange-500', icon: '⭐', duration: 'Limited' }
  };

  useEffect(() => {
    fetchTournaments();
    if (isConnected && account) {
      fetchUserTournaments();
    }
  }, [isConnected, account]);

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      // Mock tournament data - replace with actual contract calls
      const mockTournaments: Tournament[] = [
        {
          id: 1,
          name: 'Daily Speed Challenge',
          description: 'Fast-paced daily tournament for quick rewards',
          type: 'DAILY',
          entryFee: 10,
          prizePool: 500,
          startTime: Date.now(),
          endTime: Date.now() + (24 * 60 * 60 * 1000),
          maxParticipants: 100,
          currentParticipants: 47,
          isActive: true,
          isCompleted: false,
          participants: [],
          winners: [],
          winnerPrizes: [],
          status: 'ACTIVE'
        },
        {
          id: 2,
          name: 'Weekly Championship',
          description: 'Compete with the best players for major prizes',
          type: 'WEEKLY',
          entryFee: 100,
          prizePool: 5000,
          startTime: Date.now() - (2 * 24 * 60 * 60 * 1000),
          endTime: Date.now() + (5 * 24 * 60 * 60 * 1000),
          maxParticipants: 500,
          currentParticipants: 234,
          isActive: true,
          isCompleted: false,
          participants: [],
          winners: [],
          winnerPrizes: [],
          status: 'ACTIVE'
        },
        {
          id: 3,
          name: 'Monthly Grand Prix',
          description: 'The ultimate tournament with massive rewards',
          type: 'MONTHLY',
          entryFee: 1000,
          prizePool: 50000,
          startTime: Date.now() + (7 * 24 * 60 * 60 * 1000),
          endTime: Date.now() + (37 * 24 * 60 * 60 * 1000),
          maxParticipants: 1000,
          currentParticipants: 0,
          isActive: false,
          isCompleted: false,
          participants: [],
          winners: [],
          winnerPrizes: [],
          status: 'UPCOMING'
        },
        {
          id: 4,
          name: 'Halloween Special',
          description: 'Spooky themed tournament with exclusive NFT rewards',
          type: 'SPECIAL',
          entryFee: 500,
          prizePool: 25000,
          startTime: Date.now() - (10 * 24 * 60 * 60 * 1000),
          endTime: Date.now() - (3 * 24 * 60 * 60 * 1000),
          maxParticipants: 200,
          currentParticipants: 156,
          isActive: false,
          isCompleted: true,
          participants: [],
          winners: ['0x123...abc', '0x456...def', '0x789...ghi'],
          winnerPrizes: [12500, 7500, 5000],
          status: 'COMPLETED'
        }
      ];

      setTournaments(mockTournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTournaments = async () => {
    try {
      // Mock user tournament data
      const userTournaments = tournaments.filter(t => 
        Math.random() > 0.7 // Simulate user participation in some tournaments
      );
      setUserTournaments(userTournaments);
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
    }
  };

  const fetchLeaderboard = async (tournamentId: number) => {
    try {
      // Mock leaderboard data
      const mockLeaderboard: PlayerScore[] = [
        { player: '0x123...abc', score: 25000, timestamp: Date.now() - 3600000, rank: 1 },
        { player: '0x456...def', score: 22500, timestamp: Date.now() - 7200000, rank: 2 },
        { player: '0x789...ghi', score: 20000, timestamp: Date.now() - 1800000, rank: 3 },
        { player: '0xabc...123', score: 18500, timestamp: Date.now() - 5400000, rank: 4 },
        { player: '0xdef...456', score: 17200, timestamp: Date.now() - 9000000, rank: 5 }
      ];

      if (account) {
        mockLeaderboard.push({
          player: account,
          score: 15000,
          timestamp: Date.now() - 2700000,
          rank: 8
        });
      }

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleJoinTournament = async (tournament: Tournament) => {
    if (!isConnected) {
      alert('Please connect your wallet to join tournaments');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Joining tournament ${tournament.id} with entry fee ${tournament.entryFee} RUSH`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update tournament data
      const updatedTournaments = tournaments.map(t => 
        t.id === tournament.id 
          ? { ...t, currentParticipants: t.currentParticipants + 1, participants: [...t.participants, account] }
          : t
      );
      setTournaments(updatedTournaments);
      
      alert(`Successfully joined ${tournament.name}!`);
    } catch (error) {
      console.error('Join tournament error:', error);
      alert('Failed to join tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getFilteredTournaments = () => {
    switch (activeTab) {
      case 'JOINED':
        return tournaments.filter(t => t.participants.includes(account || ''));
      case 'COMPLETED':
        return tournaments.filter(t => t.status === 'COMPLETED');
      default:
        return tournaments.filter(t => t.status !== 'COMPLETED');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tournament List */}
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Tournaments</h2>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['ALL', 'JOINED', 'COMPLETED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'ALL' | 'JOINED' | 'COMPLETED')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'ALL' ? 'Active' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {getFilteredTournaments().map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 ${
                  tournament.status === 'ACTIVE' ? 'border-green-500' : 
                  tournament.status === 'UPCOMING' ? 'border-blue-500' : 'border-gray-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-10 h-10 bg-gradient-to-r ${tournamentTypes[tournament.type].color} rounded-lg flex items-center justify-center text-white text-lg`}>
                          {tournamentTypes[tournament.type].icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {tournament.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeRemaining(tournament.endTime)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Coins className="w-4 h-4" />
                              <span>{tournament.entryFee} RUSH</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{tournament.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {tournament.prizePool.toLocaleString()} RUSH
                            </div>
                            <div className="text-sm text-gray-600">Prize Pool</div>
                          </div>
                          
                          {tournament.status === 'COMPLETED' && tournament.winners.length > 0 && (
                            <div>
                              <div className="text-lg font-semibold text-yellow-600">
                                🏆 {formatAddress(tournament.winners[0])}
                              </div>
                              <div className="text-sm text-gray-600">Champion</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          {tournament.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTournament(tournament);
                                  fetchLeaderboard(tournament.id);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                View Leaderboard
                              </button>
                              
                              {!tournament.participants.includes(account || '') && (
                                <button
                                  onClick={() => handleJoinTournament(tournament)}
                                  disabled={isLoading || !isConnected}
                                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isLoading ? 'Joining...' : 'Join Tournament'}
                                </button>
                              )}
                              
                              {tournament.participants.includes(account || '') && (
                                <div className="px-6 py-2 bg-green-100 text-green-800 rounded-lg flex items-center space-x-2">
                                  <Award className="w-4 h-4" />
                                  <span>Joined</span>
                                </div>
                              )}
                            </>
                          )}
                          
                          {tournament.status === 'UPCOMING' && (
                            <div className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg">
                              Starts in {formatTimeRemaining(tournament.startTime)}
                            </div>
                          )}
                          
                          {tournament.status === 'COMPLETED' && (
                            <button
                              onClick={() => {
                                setSelectedTournament(tournament);
                                fetchLeaderboard(tournament.id);
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              View Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tournament Details / Leaderboard */}
        <div className="lg:w-1/3">
          {selectedTournament ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTournament.name}
                </h3>
                <button
                  onClick={() => setSelectedTournament(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Entry Fee</div>
                    <div className="font-semibold">{selectedTournament.entryFee} RUSH</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Prize Pool</div>
                    <div className="font-semibold text-green-600">
                      {selectedTournament.prizePool.toLocaleString()} RUSH
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Participants</div>
                    <div className="font-semibold">
                      {selectedTournament.currentParticipants}/{selectedTournament.maxParticipants}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Time Left</div>
                    <div className="font-semibold">
                      {formatTimeRemaining(selectedTournament.endTime)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span>Leaderboard</span>
                </h4>

                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.player}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.player === account 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          entry.rank === 1 ? 'bg-yellow-400 text-white' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-medium">
                            {formatAddress(entry.player)}
                            {entry.player === account && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {leaderboard.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No scores yet. Be the first to compete!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a Tournament
              </h3>
              <p className="text-gray-600">
                Choose a tournament to view details and leaderboard
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentSystem;
