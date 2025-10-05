import { useState, useEffect, useCallback } from 'react';
import { useAdvancedWeb3 } from './useAdvancedWeb3';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: {
    url: string;
    verified: boolean;
  };
  followerCount: number;
  followingCount: number;
  bio: {
    text: string;
    mentions: string[];
  };
  custodyAddress: string;
  verifiedAddresses: {
    ethereum_addresses: string[];
    solana_addresses: string[];
  };
}

interface FarcasterCast {
  hash: string;
  threadHash: string;
  parentHash?: string;
  parentAuthor?: {
    fid: number;
    username: string;
  };
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfp: {
      url: string;
    };
    followerCount: number;
    followingCount: number;
  };
  text: string;
  timestamp: string;
  replies: {
    count: number;
  };
  reactions: {
    count: number;
    type: string;
  };
  recasts: {
    count: number;
  };
  watchers: {
    count: number;
  };
  embeds?: Array<{
    url?: string;
    castId?: {
      fid: number;
      hash: string;
    };
  }>;
}

interface FarcasterEngagement {
  likes: number;
  recasts: number;
  replies: number;
  mentions: number;
  channelPosts: number;
}

interface FarcasterChannel {
  id: string;
  name: string;
  description: string;
  followerCount: number;
  parentUrl: string;
  imageUrl: string;
}

export const useFarcaster = () => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [casts, setCasts] = useState<FarcasterCast[]>([]);
  const [channels, setChannels] = useState<FarcasterChannel[]>([]);
  const [engagement, setEngagement] = useState<FarcasterEngagement>({
    likes: 0,
    recasts: 0,
    replies: 0,
    mentions: 0,
    channelPosts: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { account, isConnected } = useAdvancedWeb3();

  // Farcaster API endpoints
  const FARCASTER_API_URL = 'https://api.warpcast.com/v2';
  
  // Load Farcaster user by wallet address
  const loadUser = useCallback(async () => {
    if (!account || !isConnected) return;

    try {
      setIsLoading(true);
      setError(null);

      // Query Farcaster user by verified address
      const response = await fetch(`${FARCASTER_API_URL}/user-by-verification`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      // For demo purposes, we'll simulate the API response
      // In a real implementation, you would use the actual Farcaster API
      const mockUser: FarcasterUser = {
        fid: Math.floor(Math.random() * 100000) + 1,
        username: `avalanche_rush_${account.slice(2, 8)}`,
        displayName: `Avalanche Rush Player`,
        pfp: {
          url: '/avatars/default-avatar.png',
          verified: true
        },
        followerCount: Math.floor(Math.random() * 500) + 10,
        followingCount: Math.floor(Math.random() * 200) + 5,
        bio: {
          text: `🏔️ Avalanche Rush player | Web3 gaming enthusiast | Learn-to-earn advocate`,
          mentions: ['avalanche', 'web3', 'gaming']
        },
        custodyAddress: account,
        verifiedAddresses: {
          ethereum_addresses: [account],
          solana_addresses: []
        }
      };

      setUser(mockUser);
      await loadEngagement(mockUser.fid);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Farcaster user';
      setError(errorMessage);
      console.error('Farcaster user loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected]);

  // Load user's casts
  const loadCasts = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Mock API response for user casts
      const mockCasts: FarcasterCast[] = [
        {
          hash: '0x1234567890abcdef',
          threadHash: '0x1234567890abcdef',
          author: {
            fid: user.fid,
            username: user.username,
            displayName: user.displayName,
            pfp: user.pfp,
            followerCount: user.followerCount,
            followingCount: user.followingCount
          },
          text: `🏔️ Just scored ${Math.floor(Math.random() * 10000) + 1000} points in Avalanche Rush! The learn-to-earn mechanics are incredible. #AvalancheRush #Web3Gaming`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          replies: { count: Math.floor(Math.random() * 10) },
          reactions: { count: Math.floor(Math.random() * 50), type: 'like' },
          recasts: { count: Math.floor(Math.random() * 20) },
          watchers: { count: Math.floor(Math.random() * 100) }
        },
        {
          hash: '0xabcdef1234567890',
          threadHash: '0xabcdef1234567890',
          author: {
            fid: user.fid,
            username: user.username,
            displayName: user.displayName,
            pfp: user.pfp,
            followerCount: user.followerCount,
            followingCount: user.followingCount
          },
          text: `🎮 Completed the DeFi quest in Avalanche Rush! Learned about liquidity provision while earning rewards. This is the future of education! #LearnToEarn #DeFi`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          replies: { count: Math.floor(Math.random() * 15) },
          reactions: { count: Math.floor(Math.random() * 75), type: 'like' },
          recasts: { count: Math.floor(Math.random() * 30) },
          watchers: { count: Math.floor(Math.random() * 150) }
        }
      ];

      setCasts(mockCasts);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load casts';
      setError(errorMessage);
      console.error('Farcaster casts loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load available channels
  const loadChannels = useCallback(async () => {
    try {
      setIsLoading(true);

      // Mock channels related to Avalanche Rush
      const mockChannels: FarcasterChannel[] = [
        {
          id: 'avalanche-rush',
          name: 'avalanche-rush',
          description: 'Official Avalanche Rush gaming channel. Share achievements, strategies, and connect with fellow players!',
          followerCount: 1250,
          parentUrl: 'https://avalanche-rush.lovable.app',
          imageUrl: '/channels/avalanche-rush.png'
        },
        {
          id: 'web3-gaming',
          name: 'web3-gaming',
          description: 'All things Web3 gaming - from play-to-earn to learn-to-earn experiences',
          followerCount: 5400,
          parentUrl: 'https://warpcast.com/~/channel/web3-gaming',
          imageUrl: '/channels/web3-gaming.png'
        },
        {
          id: 'avalanche-ecosystem',
          name: 'avalanche-ecosystem',
          description: 'Discussing the latest developments in the Avalanche ecosystem',
          followerCount: 8900,
          parentUrl: 'https://warpcast.com/~/channel/avalanche-ecosystem',
          imageUrl: '/channels/avalanche-ecosystem.png'
        }
      ];

      setChannels(mockChannels);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load channels';
      setError(errorMessage);
      console.error('Farcaster channels loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load engagement metrics
  const loadEngagement = useCallback(async (fid: number) => {
    try {
      // Mock engagement data
      const mockEngagement: FarcasterEngagement = {
        likes: Math.floor(Math.random() * 500) + 50,
        recasts: Math.floor(Math.random() * 100) + 10,
        replies: Math.floor(Math.random() * 200) + 20,
        mentions: Math.floor(Math.random() * 50) + 5,
        channelPosts: Math.floor(Math.random() * 30) + 3
      };

      setEngagement(mockEngagement);
    } catch (err) {
      console.error('Engagement loading error:', err);
    }
  }, []);

  // Create a new cast
  const createCast = useCallback(async (text: string, parentHash?: string) => {
    if (!user) {
      throw new Error('No Farcaster user found');
    }

    try {
      setIsLoading(true);
      setError(null);

      // This would typically involve signing a message with Farcaster
      // For now, we'll simulate the cast creation
      console.log('Creating Farcaster cast:', { text, parentHash });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock cast
      const newCast: FarcasterCast = {
        hash: `0x${Math.random().toString(16).substr(2, 16)}`,
        threadHash: parentHash || `0x${Math.random().toString(16).substr(2, 16)}`,
        parentHash,
        author: {
          fid: user.fid,
          username: user.username,
          displayName: user.displayName,
          pfp: user.pfp,
          followerCount: user.followerCount,
          followingCount: user.followingCount
        },
        text,
        timestamp: new Date().toISOString(),
        replies: { count: 0 },
        reactions: { count: 0, type: 'like' },
        recasts: { count: 0 },
        watchers: { count: 1 }
      };

      setCasts(prev => [newCast, ...prev]);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create cast';
      setError(errorMessage);
      console.error('Cast creation error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Share game achievement as cast
  const shareAchievement = useCallback(async (
    achievement: {
      type: string;
      score: number;
      level: number;
      character?: string;
      tournamentId?: string;
    }
  ) => {
    const text = `🏔️ Just achieved ${achievement.type} in Avalanche Rush!
    
🎮 Score: ${achievement.score.toLocaleString()}
📈 Level: ${achievement.level}
${achievement.character ? `👤 Character: ${achievement.character}` : ''}
${achievement.tournamentId ? `🏆 Tournament: #${achievement.tournamentId}` : ''}

#AvalancheRush #Web3Gaming #LearnToEarn`;

    return await createCast(text);
  }, [createCast]);

  // Share tournament participation
  const shareTournament = useCallback(async (
    tournament: {
      id: string;
      name: string;
      prizePool: string;
      participants: number;
      position?: number;
    }
  ) => {
    const text = `🏆 ${tournament.position ? `Finished #${tournament.position} in` : 'Joined'} ${tournament.name}!
    
💰 Prize Pool: ${tournament.prizePool} AVAX
👥 Participants: ${tournament.participants}
${tournament.position ? `🎯 Final Position: #${tournament.position}` : '🎮 Currently competing!'}

#AvalancheRush #Tournament #Web3Gaming`;

    return await createCast(text);
  }, [createCast]);

  // Post to a specific channel
  const postToChannel = useCallback(async (
    channelId: string,
    text: string
  ) => {
    if (!user) {
      throw new Error('No Farcaster user found');
    }

    try {
      setIsLoading(true);
      setError(null);

      // This would typically post to the specific Farcaster channel
      console.log('Posting to channel:', { channelId, text });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update engagement
      setEngagement(prev => ({
        ...prev,
        channelPosts: prev.channelPosts + 1
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post to channel';
      setError(errorMessage);
      console.error('Channel posting error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create interactive frame for mini-game
  const createGameFrame = useCallback(async (
    frameData: {
      title: string;
      description: string;
      gameType: 'daily-challenge' | 'leaderboard' | 'quiz' | 'minigame';
      gameData?: any;
    }
  ) => {
    if (!user) {
      throw new Error('No Farcaster user found');
    }

    try {
      setIsLoading(true);
      setError(null);

      // This would create a Farcaster frame (interactive post)
      const frameUrl = `${window.location.origin}/frames/${frameData.gameType}`;
      
      console.log('Creating game frame:', { frameData, frameUrl });

      // Simulate frame creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      return frameUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game frame';
      setError(errorMessage);
      console.error('Frame creation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Calculate social score for tournament multiplier
  const calculateSocialScore = useCallback(() => {
    if (!user) return 0;

    const baseScore = user.followerCount + user.followingCount;
    const engagementScore = engagement.likes + (engagement.recasts * 3) + (engagement.replies * 2) + (engagement.mentions * 1.5) + (engagement.channelPosts * 5);
    
    return Math.floor((baseScore * 0.1) + (engagementScore * 0.01));
  }, [user, engagement]);

  // Load user on wallet connection
  useEffect(() => {
    if (isConnected && account) {
      loadUser();
      loadChannels();
    } else {
      setUser(null);
      setCasts([]);
      setChannels([]);
      setEngagement({ likes: 0, recasts: 0, replies: 0, mentions: 0, channelPosts: 0 });
    }
  }, [isConnected, account, loadUser, loadChannels]);

  // Load casts when user is loaded
  useEffect(() => {
    if (user) {
      loadCasts();
    }
  }, [user, loadCasts]);

  return {
    // State
    user,
    casts,
    channels,
    engagement,
    isLoading,
    error,
    
    // Actions
    loadUser,
    loadCasts,
    loadChannels,
    createCast,
    shareAchievement,
    shareTournament,
    postToChannel,
    createGameFrame,
    calculateSocialScore,
    
    // Utils
    hasUser: !!user,
    socialScore: calculateSocialScore()
  };
};
