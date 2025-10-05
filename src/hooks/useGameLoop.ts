import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

/**
 * GameLoop Hook - Replaces Reactive Network with standard Avalanche C-Chain events
 *
 * Key changes from Reactive:
 * 1. Uses ethers.js provider instead of ReactiveClient
 * 2. Standard event listeners instead of reactive modifiers
 * 3. Off-chain score submission instead of automatic triggers
 * 4. WebSocket/polling for live leaderboard updates
 */

interface Tournament {
  id: number;
  name: string;
  startTime: number;
  endTime: number;
  prizePool: string;
  entryFee: string;
  active: boolean;
  maxPlayers: number;
  playerCount: number;
}

interface LeaderboardEntry {
  player: string;
  score: number;
  rank: number;
  reward: string;
}

interface PlayerScore {
  score: number;
  timestamp: number;
  verified: boolean;
}

const GAMELOOP_CONTRACT_ADDRESS = process.env.VITE_GAMELOOP_CONTRACT || '';
const RUSH_TOKEN_ADDRESS = process.env.VITE_RUSH_TOKEN || '';

// GameLoop Score Manager ABI
const GAMELOOP_ABI = [
  'function createTournament(string memory _name, uint256 _startTime, uint256 _endTime, uint256 _prizePool, uint256 _entryFee, uint256 _maxPlayers) external returns (uint256)',
  'function registerForTournament(uint256 _tournamentId) external',
  'function submitScore(uint256 _tournamentId, uint256 _score) external',
  'function claimReward(uint256 _tournamentId) external',
  'function getLeaderboard(uint256 _tournamentId) external view returns (tuple(address player, uint256 score, uint256 rank, uint256 reward)[])',
  'function getPlayerScore(uint256 _tournamentId, address _player) external view returns (uint256)',
  'function getActiveTournaments() external view returns (tuple(uint256 id, string name, uint256 startTime, uint256 endTime, uint256 prizePool, uint256 entryFee, bool active, uint256 maxPlayers, uint256 playerCount)[])',
  'function tournaments(uint256) external view returns (uint256 id, string name, uint256 startTime, uint256 endTime, uint256 prizePool, uint256 entryFee, bool active, uint256 maxPlayers, uint256 playerCount)',
  'function hasRegistered(uint256, address) external view returns (bool)',
  'function playerRewards(uint256, address) external view returns (uint256)',
  'event ScoreSubmitted(address indexed player, uint256 indexed tournamentId, uint256 score, uint256 timestamp)',
  'event TournamentCreated(uint256 indexed tournamentId, string name, uint256 startTime, uint256 endTime, uint256 prizePool)',
  'event TournamentEnded(uint256 indexed tournamentId, address[] winners, uint256[] rewards)',
  'event RewardClaimed(address indexed player, uint256 indexed tournamentId, uint256 amount)',
  'event PlayerRegistered(address indexed player, uint256 indexed tournamentId)'
];

export function useGameLoop() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [pendingReward, setPendingReward] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  // Contract instance
  const contract = useRef<ethers.Contract | null>(null);

  /**
   * Initialize contract with standard Avalanche provider
   * REPLACES: ReactiveClient initialization
   */
  useEffect(() => {
    if (publicClient && GAMELOOP_CONTRACT_ADDRESS) {
      // Note: wagmi v2 uses viem, so we need to adapt for ethers
      // For now, this will be a placeholder until contract is deployed
      // In production, use viem contracts or create ethers provider from publicClient
    }
  }, [publicClient]);

  /**
   * Load active tournaments
   * REPLACES: Reactive automatic tournament detection
   */
  const loadActiveTournaments = useCallback(async () => {
    if (!contract.current) return;

    try {
      const tournaments = await contract.current.getActiveTournaments();
      const formatted = tournaments.map((t: any) => ({
        id: t.id.toNumber(),
        name: t.name,
        startTime: t.startTime.toNumber(),
        endTime: t.endTime.toNumber(),
        prizePool: ethers.utils.formatEther(t.prizePool),
        entryFee: ethers.utils.formatEther(t.entryFee),
        active: t.active,
        maxPlayers: t.maxPlayers.toNumber(),
        playerCount: t.playerCount.toNumber()
      }));
      setActiveTournaments(formatted);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  }, []);

  /**
   * Load tournament leaderboard
   * REPLACES: Reactive leaderboard auto-update
   */
  const loadLeaderboard = useCallback(async (tournamentId: number) => {
    if (!contract.current) return;

    try {
      const entries = await contract.current.getLeaderboard(tournamentId);
      const formatted = entries.map((e: any, index: number) => ({
        player: e.player,
        score: e.score.toNumber(),
        rank: index + 1,
        reward: ethers.utils.formatEther(e.reward)
      }));
      setLeaderboard(formatted);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }, []);

  /**
   * Register for tournament
   * REPLACES: Reactive registration
   */
  const registerForTournament = useCallback(async (tournamentId: number) => {
    if (!signer || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const writeContract = new ethers.Contract(
        GAMELOOP_CONTRACT_ADDRESS,
        GAMELOOP_ABI,
        signer
      );

      const tx = await writeContract.registerForTournament(tournamentId);
      await tx.wait();

      setIsRegistered(true);
      await loadActiveTournaments();
      return tx;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, loadActiveTournaments]);

  /**
   * Submit score
   * REPLACES: Reactive automatic score tracking
   */
  const submitScore = useCallback(async (tournamentId: number, score: number) => {
    if (!signer || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const writeContract = new ethers.Contract(
        GAMELOOP_CONTRACT_ADDRESS,
        GAMELOOP_ABI,
        signer
      );

      const tx = await writeContract.submitScore(tournamentId, score);
      await tx.wait();

      setPlayerScore(score);
      await loadLeaderboard(tournamentId);
      return tx;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address, loadLeaderboard]);

  /**
   * Claim rewards
   * REPLACES: Reactive reward distribution
   */
  const claimReward = useCallback(async (tournamentId: number) => {
    if (!signer || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const writeContract = new ethers.Contract(
        GAMELOOP_CONTRACT_ADDRESS,
        GAMELOOP_ABI,
        signer
      );

      const tx = await writeContract.claimReward(tournamentId);
      await tx.wait();

      setPendingReward('0');
      return tx;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, address]);

  /**
   * Check registration status
   */
  const checkRegistration = useCallback(async (tournamentId: number) => {
    if (!contract.current || !address) return;

    try {
      const registered = await contract.current.hasRegistered(tournamentId, address);
      setIsRegistered(registered);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  }, [address]);

  /**
   * Check pending rewards
   */
  const checkPendingReward = useCallback(async (tournamentId: number) => {
    if (!contract.current || !address) return;

    try {
      const reward = await contract.current.playerRewards(tournamentId, address);
      setPendingReward(ethers.utils.formatEther(reward));
    } catch (error) {
      console.error('Error checking reward:', error);
    }
  }, [address]);

  /**
   * Setup event listeners for live updates
   * REPLACES: Reactive event subscriptions
   */
  useEffect(() => {
    if (!contract.current) return;

    const scoreFilter = contract.current.filters.ScoreSubmitted(null, currentTournament?.id);
    const tournamentFilter = contract.current.filters.TournamentCreated();

    const handleScoreSubmitted = (player: string, tournamentId: ethers.BigNumber, score: ethers.BigNumber) => {
      if (tournamentId.toNumber() === currentTournament?.id) {
        loadLeaderboard(currentTournament.id);
      }
    };

    const handleTournamentCreated = () => {
      loadActiveTournaments();
    };

    // Subscribe to events
    contract.current.on(scoreFilter, handleScoreSubmitted);
    contract.current.on(tournamentFilter, handleTournamentCreated);

    // Cleanup
    return () => {
      contract.current?.off(scoreFilter, handleScoreSubmitted);
      contract.current?.off(tournamentFilter, handleTournamentCreated);
    };
  }, [contract, currentTournament, loadLeaderboard, loadActiveTournaments]);

  /**
   * Auto-refresh leaderboard every 5 seconds
   * REPLACES: Reactive real-time updates
   */
  useEffect(() => {
    if (!currentTournament) return;

    const interval = setInterval(() => {
      loadLeaderboard(currentTournament.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentTournament, loadLeaderboard]);

  // Initial load
  useEffect(() => {
    loadActiveTournaments();
  }, [loadActiveTournaments]);

  return {
    // State
    activeTournaments,
    currentTournament,
    leaderboard,
    playerScore,
    isRegistered,
    pendingReward,
    isLoading,

    // Actions
    setCurrentTournament,
    registerForTournament,
    submitScore,
    claimReward,
    loadLeaderboard,
    loadActiveTournaments,
    checkRegistration,
    checkPendingReward
  };
}

/**
 * Shared game loop using requestAnimationFrame
 * REPLACES: Reactive event-driven updates
 */
export function useSharedGameLoop(updateFunctions: (() => void)[]) {
  const animationFrameId = useRef<number>();
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      const deltaTime = now - lastTime.current;
      lastTime.current = now;

      // Call all update functions
      updateFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Game loop update error:', error);
        }
      });

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateFunctions]);
}

export default useGameLoop;
