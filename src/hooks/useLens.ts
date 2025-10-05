import { useState, useEffect, useCallback } from 'react';
import { useAdvancedWeb3 } from './useAdvancedWeb3';

interface LensProfile {
  id: string;
  handle: string;
  ownedBy: string;
  stats: {
    totalFollowers: number;
    totalFollowing: number;
    totalPosts: number;
    totalComments: number;
    totalMirrors: number;
    totalPublications: number;
  };
  picture?: {
    original: {
      url: string;
    };
  };
  coverPicture?: {
    original: {
      url: string;
    };
  };
  bio?: string;
}

interface LensPublication {
  id: string;
  profile: {
    id: string;
    handle: string;
    ownedBy: string;
  };
  stats: {
    totalAmountOfMirrors: number;
    totalAmountOfCollects: number;
    totalAmountOfComments: number;
  };
  metadata: {
    name?: string;
    description?: string;
    content?: string;
    image?: string;
    attributes?: Array<{
      traitType: string;
      value: string;
    }>;
  };
  createdAt: string;
}

interface LensEngagement {
  likes: number;
  mirrors: number;
  collects: number;
  comments: number;
  tips: number;
}

export const useLens = () => {
  const [profile, setProfile] = useState<LensProfile | null>(null);
  const [publications, setPublications] = useState<LensPublication[]>([]);
  const [engagement, setEngagement] = useState<LensEngagement>({
    likes: 0,
    mirrors: 0,
    collects: 0,
    comments: 0,
    tips: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { account, isConnected } = useAdvancedWeb3();

  // Lens API endpoints
  const LENS_API_URL = 'https://api.lens.dev';
  
  // Load Lens profile for connected wallet
  const loadProfile = useCallback(async () => {
    if (!account || !isConnected) return;

    try {
      setIsLoading(true);
      setError(null);

      // Query Lens profile by wallet address
      const query = `
        query GetProfile($ownedBy: [EthereumAddress!]) {
          profiles(request: { ownedBy: $ownedBy, limit: 1 }) {
            items {
              id
              handle
              ownedBy
              stats {
                totalFollowers
                totalFollowing
                totalPosts
                totalComments
                totalMirrors
                totalPublications
              }
              picture {
                ... on MediaSet {
                  original {
                    url
                  }
                }
              }
              coverPicture {
                ... on MediaSet {
                  original {
                    url
                  }
                }
              }
              bio
            }
          }
        }
      `;

      const response = await fetch(LENS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            ownedBy: [account]
          }
        })
      });

      const data = await response.json();
      
      if (data.data?.profiles?.items?.length > 0) {
        setProfile(data.data.profiles.items[0]);
        await loadEngagement(data.data.profiles.items[0].id);
      } else {
        setProfile(null);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Lens profile';
      setError(errorMessage);
      console.error('Lens profile loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected]);

  // Load user's publications
  const loadPublications = useCallback(async () => {
    if (!profile) return;

    try {
      setIsLoading(true);

      const query = `
        query GetPublications($profileId: ProfileId!) {
          publications(request: {
            profileId: $profileId,
            publicationTypes: [POST, MIRROR, COMMENT],
            limit: 20
          }) {
            items {
              ... on Post {
                id
                profile {
                  id
                  handle
                  ownedBy
                }
                stats {
                  totalAmountOfMirrors
                  totalAmountOfCollects
                  totalAmountOfComments
                }
                metadata {
                  name
                  description
                  content
                  image
                  attributes {
                    traitType
                    value
                  }
                }
                createdAt
              }
            }
          }
        }
      `;

      const response = await fetch(LENS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            profileId: profile.id
          }
        })
      });

      const data = await response.json();
      setPublications(data.data?.publications?.items || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load publications';
      setError(errorMessage);
      console.error('Lens publications loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  // Load engagement metrics
  const loadEngagement = useCallback(async (profileId: string) => {
    try {
      // This would typically come from your backend or a separate service
      // For now, we'll simulate engagement data
      const mockEngagement: LensEngagement = {
        likes: Math.floor(Math.random() * 1000),
        mirrors: Math.floor(Math.random() * 100),
        collects: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 200),
        tips: Math.floor(Math.random() * 25)
      };

      setEngagement(mockEngagement);
    } catch (err) {
      console.error('Engagement loading error:', err);
    }
  }, []);

  // Create a new publication (post)
  const createPublication = useCallback(async (
    content: string,
    metadata: {
      name?: string;
      description?: string;
      image?: string;
      attributes?: Array<{ traitType: string; value: string }>;
    }
  ) => {
    if (!profile) {
      throw new Error('No Lens profile found');
    }

    try {
      setIsLoading(true);
      setError(null);

      // This would typically involve signing a transaction
      // For now, we'll simulate the publication creation
      console.log('Creating Lens publication:', { content, metadata });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refresh publications after creating
      await loadPublications();

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create publication';
      setError(errorMessage);
      console.error('Publication creation error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile, loadPublications]);

  // Share game achievement as Lens publication
  const shareAchievement = useCallback(async (
    achievement: {
      type: string;
      score: number;
      level: number;
      character?: string;
      tournamentId?: string;
    }
  ) => {
    const content = `🏔️ Just achieved ${achievement.type} in Avalanche Rush!
    
🎮 Score: ${achievement.score.toLocaleString()}
📈 Level: ${achievement.level}
${achievement.character ? `👤 Character: ${achievement.character}` : ''}
${achievement.tournamentId ? `🏆 Tournament: #${achievement.tournamentId}` : ''}

#AvalancheRush #Web3Gaming #LearnToEarn`;

    const metadata = {
      name: `Avalanche Rush Achievement - ${achievement.type}`,
      description: content,
      attributes: [
        { traitType: 'Game', value: 'Avalanche Rush' },
        { traitType: 'Achievement Type', value: achievement.type },
        { traitType: 'Score', value: achievement.score.toString() },
        { traitType: 'Level', value: achievement.level.toString() },
        ...(achievement.character ? [{ traitType: 'Character', value: achievement.character }] : []),
        ...(achievement.tournamentId ? [{ traitType: 'Tournament', value: achievement.tournamentId }] : [])
      ]
    };

    return await createPublication(content, metadata);
  }, [createPublication]);

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
    const content = `🏆 ${tournament.position ? `Finished #${tournament.position} in` : 'Joined'} ${tournament.name}!
    
💰 Prize Pool: ${tournament.prizePool} AVAX
👥 Participants: ${tournament.participants}
${tournament.position ? `🎯 Final Position: #${tournament.position}` : '🎮 Currently competing!'}

#AvalancheRush #Tournament #Web3Gaming`;

    const metadata = {
      name: `Avalanche Rush Tournament - ${tournament.name}`,
      description: content,
      attributes: [
        { traitType: 'Game', value: 'Avalanche Rush' },
        { traitType: 'Tournament', value: tournament.name },
        { traitType: 'Prize Pool', value: tournament.prizePool },
        { traitType: 'Participants', value: tournament.participants.toString() },
        ...(tournament.position ? [{ traitType: 'Final Position', value: tournament.position.toString() }] : [])
      ]
    };

    return await createPublication(content, metadata);
  }, [createPublication]);

  // Calculate social score for tournament multiplier
  const calculateSocialScore = useCallback(() => {
    if (!profile) return 0;

    const baseScore = profile.stats.totalFollowers + profile.stats.totalFollowing;
    const engagementScore = engagement.likes + (engagement.mirrors * 2) + (engagement.collects * 3) + (engagement.comments * 1.5) + (engagement.tips * 5);
    
    return Math.floor((baseScore * 0.1) + (engagementScore * 0.01));
  }, [profile, engagement]);

  // Load profile on wallet connection
  useEffect(() => {
    if (isConnected && account) {
      loadProfile();
    } else {
      setProfile(null);
      setPublications([]);
      setEngagement({ likes: 0, mirrors: 0, collects: 0, comments: 0, tips: 0 });
    }
  }, [isConnected, account, loadProfile]);

  return {
    // State
    profile,
    publications,
    engagement,
    isLoading,
    error,
    
    // Actions
    loadProfile,
    loadPublications,
    createPublication,
    shareAchievement,
    shareTournament,
    calculateSocialScore,
    
    // Utils
    hasProfile: !!profile,
    socialScore: calculateSocialScore()
  };
};
