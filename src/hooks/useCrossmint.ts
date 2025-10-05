import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdvancedWeb3 } from './useAdvancedWeb3';

interface CrossmintConfig {
  clientId: string;
  environment: 'staging' | 'production';
  recipient: {
    email?: string;
    wallet?: string;
  };
}

interface CrossmintCharacter {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: 'Warrior' | 'Mage' | 'Ranger' | 'Tank' | 'Support' | 'Assassin';
  imageUrl: string;
  description: string;
  attributes: Record<string, number>;
  skills: string[];
  specialAbilities: string[];
  questBonus: number;
  tournamentBonus: number;
  unlockRequirements: Array<{ type: string; value: string | number }>;
}

interface CrossmintMintResult {
  success: boolean;
  tokenId?: string;
  error?: string;
}

export const useCrossmint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<CrossmintCharacter[]>([]);
  const [mintedCharacters, setMintedCharacters] = useState<Map<string, string>>(new Map());
  const { account, isConnected } = useAdvancedWeb3();

  // Crossmint configuration for Avalanche Rush
  const crossmintConfig: CrossmintConfig = useMemo(() => ({
    clientId: process.env.REACT_APP_CROSSMINT_CLIENT_ID || 'avalanche-rush-client',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
    recipient: {
      wallet: account || undefined,
    }
  }), [account]);

  // Initialize Crossmint SDK
  const initializeCrossmint = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, you would initialize the Crossmint SDK here
      // For now, we'll simulate the initialization
      console.log('Initializing Crossmint SDK with config:', crossmintConfig);
      
      // Simulate loading available characters
      const availableCharacters = await loadAvailableCharacters();
      setCharacters(availableCharacters);
      
      console.log('Crossmint SDK initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Crossmint SDK';
      setError(errorMessage);
      console.error('Crossmint initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [crossmintConfig]);

  // Load available characters from Crossmint
  const loadAvailableCharacters = async (): Promise<CrossmintCharacter[]> => {
    // In a real implementation, this would fetch from Crossmint API
    // For now, return sample characters
    return [
      {
        id: 'avalanche-warrior',
        name: 'Avalanche Warrior',
        rarity: 'Epic',
        type: 'Warrior',
        imageUrl: '/characters/avalanche-warrior.png',
        description: 'A mighty warrior forged in the icy peaks of Avalanche.',
        attributes: {
          strength: 85,
          intelligence: 60,
          agility: 70,
          defense: 90,
          speed: 65,
          luck: 50
        },
        skills: ['Ice Slash', 'Avalanche Strike', 'Frost Shield'],
        specialAbilities: ['Ice Resistance', 'Cold Weather Mastery'],
        questBonus: 15,
        tournamentBonus: 10,
        unlockRequirements: [{ type: 'level', value: 1 }]
      },
      {
        id: 'rush-mage',
        name: 'Rush Mage',
        rarity: 'Legendary',
        type: 'Mage',
        imageUrl: '/characters/rush-mage.png',
        description: 'A powerful mage who harnesses the raw energy of the Rush token.',
        attributes: {
          strength: 40,
          intelligence: 95,
          agility: 80,
          defense: 60,
          speed: 85,
          luck: 70
        },
        skills: ['Lightning Bolt', 'Rush Storm', 'Energy Shield'],
        specialAbilities: ['Energy Manipulation', 'Fast Casting'],
        questBonus: 25,
        tournamentBonus: 20,
        unlockRequirements: [{ type: 'level', value: 5 }]
      },
      {
        id: 'reactive-ranger',
        name: 'Reactive Ranger',
        rarity: 'Rare',
        type: 'Ranger',
        imageUrl: '/characters/reactive-ranger.png',
        description: 'An agile ranger connected to the Reactive network.',
        attributes: {
          strength: 70,
          intelligence: 75,
          agility: 95,
          defense: 65,
          speed: 90,
          luck: 80
        },
        skills: ['Precision Shot', 'Reactive Arrow', 'Nature\'s Blessing'],
        specialAbilities: ['Network Synergy', 'Environmental Awareness'],
        questBonus: 20,
        tournamentBonus: 15,
        unlockRequirements: [{ type: 'level', value: 3 }]
      }
    ];
  };

  // Mint a character NFT using Crossmint
  const mintCharacter = useCallback(async (
    character: CrossmintCharacter,
    recipientEmail?: string
  ): Promise<CrossmintMintResult> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isConnected && !recipientEmail) {
        return {
          success: false,
          error: 'Wallet not connected and no email provided'
        };
      }

      // Prepare minting configuration
      const mintConfig = {
        characterId: character.id,
        recipient: recipientEmail ? { email: recipientEmail } : { wallet: account },
        metadata: {
          name: character.name,
          description: character.description,
          image: character.imageUrl,
          attributes: [
            { trait_type: 'Rarity', value: character.rarity },
            { trait_type: 'Type', value: character.type },
            { trait_type: 'Quest Bonus', value: character.questBonus },
            { trait_type: 'Tournament Bonus', value: character.tournamentBonus },
            ...Object.entries(character.attributes).map(([key, value]) => ({
              trait_type: key.charAt(0).toUpperCase() + key.slice(1),
              value: value
            }))
          ],
          properties: {
            skills: character.skills,
            specialAbilities: character.specialAbilities,
            gameId: 'avalanche-rush',
            version: '1.0.0'
          }
        }
      };

      console.log('Minting character with config:', mintConfig);

      // In a real implementation, this would call the Crossmint SDK
      // For now, simulate the minting process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTokenId = `token_${Date.now()}_${character.id}`;

      // Update minted characters
      setMintedCharacters(prev => new Map(prev).set(character.id, mockTokenId));

      return {
        success: true,
        tokenId: mockTokenId
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mint character';
      setError(errorMessage);
      console.error('Character minting error:', err);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account]);

  // Check if a character is already minted
  const isCharacterMinted = useCallback((characterId: string): boolean => {
    return mintedCharacters.has(characterId);
  }, [mintedCharacters]);

  // Get minted character token ID
  const getMintedTokenId = useCallback((characterId: string): string | undefined => {
    return mintedCharacters.get(characterId);
  }, [mintedCharacters]);

  // Load user's minted characters
  const loadUserCharacters = useCallback(async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      
      // In a real implementation, this would query Crossmint for user's NFTs
      // For now, simulate loading user characters
      console.log('Loading characters for user:', account);
      
      // Mock user characters data
      const userCharacters = new Map();
      // You could populate this with actual user data from Crossmint API
      
      setMintedCharacters(userCharacters);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user characters';
      setError(errorMessage);
      console.error('Load user characters error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Initialize on mount and when account changes
  useEffect(() => {
    initializeCrossmint();
  }, [initializeCrossmint]);

  useEffect(() => {
    if (isConnected && account) {
      loadUserCharacters();
    }
  }, [isConnected, account, loadUserCharacters]);

  return {
    // State
    isLoading,
    error,
    characters,
    mintedCharacters,
    
    // Actions
    mintCharacter,
    isCharacterMinted,
    getMintedTokenId,
    loadUserCharacters,
    initializeCrossmint,
    
    // Configuration
    config: crossmintConfig
  };
};
