import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Star, 
  Zap, 
  Shield, 
  Sword, 
  Crown, 
  Flame,
  Sparkles,
  Trophy,
  Coins,
  Lock
} from 'lucide-react';

// Crossmint Game Character Types
interface CrossmintCharacter {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: 'Warrior' | 'Mage' | 'Ranger' | 'Tank' | 'Support' | 'Assassin';
  level: number;
  experience: number;
  maxExperience: number;
  attributes: {
    strength: number;
    intelligence: number;
    agility: number;
    defense: number;
    speed: number;
    luck: number;
  };
  skills: string[];
  imageUrl: string;
  description: string;
  minted: boolean;
  tokenId?: string;
  contractAddress?: string;
  evolutionStage: number;
  maxEvolutionStage: number;
  specialAbilities: string[];
  questBonus: number;
  tournamentBonus: number;
}

interface CharacterSelectionProps {
  onCharacterSelect: (character: CrossmintCharacter) => void;
  selectedCharacter?: CrossmintCharacter;
  playerLevel: number;
  unlockedCharacters: string[];
}

// Sample Crossmint Characters Data
const CROSSMINT_CHARACTERS: CrossmintCharacter[] = [
  {
    id: 'avalanche-warrior',
    name: 'Avalanche Warrior',
    rarity: 'Epic',
    type: 'Warrior',
    level: 1,
    experience: 0,
    maxExperience: 100,
    attributes: {
      strength: 85,
      intelligence: 60,
      agility: 70,
      defense: 90,
      speed: 65,
      luck: 50
    },
    skills: ['Ice Slash', 'Avalanche Strike', 'Frost Shield'],
    imageUrl: '/characters/avalanche-warrior.png',
    description: 'A mighty warrior forged in the icy peaks of Avalanche. Masters the art of ice-based combat.',
    minted: false,
    evolutionStage: 1,
    maxEvolutionStage: 3,
    specialAbilities: ['Ice Resistance', 'Cold Weather Mastery'],
    questBonus: 15,
    tournamentBonus: 10
  },
  {
    id: 'rush-mage',
    name: 'Rush Mage',
    rarity: 'Legendary',
    type: 'Mage',
    level: 1,
    experience: 0,
    maxExperience: 100,
    attributes: {
      strength: 40,
      intelligence: 95,
      agility: 80,
      defense: 60,
      speed: 85,
      luck: 70
    },
    skills: ['Lightning Bolt', 'Rush Storm', 'Energy Shield'],
    imageUrl: '/characters/rush-mage.png',
    description: 'A powerful mage who harnesses the raw energy of the Rush token. Lightning-fast spellcasting.',
    minted: false,
    evolutionStage: 1,
    maxEvolutionStage: 4,
    specialAbilities: ['Energy Manipulation', 'Fast Casting'],
    questBonus: 25,
    tournamentBonus: 20
  },
  {
    id: 'reactive-ranger',
    name: 'Reactive Ranger',
    rarity: 'Rare',
    type: 'Ranger',
    level: 1,
    experience: 0,
    maxExperience: 100,
    attributes: {
      strength: 70,
      intelligence: 75,
      agility: 95,
      defense: 65,
      speed: 90,
      luck: 80
    },
    skills: ['Precision Shot', 'Reactive Arrow', 'Nature\'s Blessing'],
    imageUrl: '/characters/reactive-ranger.png',
    description: 'An agile ranger connected to the Reactive network. Quick reflexes and nature magic.',
    minted: false,
    evolutionStage: 1,
    maxEvolutionStage: 3,
    specialAbilities: ['Network Synergy', 'Environmental Awareness'],
    questBonus: 20,
    tournamentBonus: 15
  },
  {
    id: 'defi-tank',
    name: 'DeFi Tank',
    rarity: 'Epic',
    type: 'Tank',
    level: 1,
    experience: 0,
    maxExperience: 100,
    attributes: {
      strength: 90,
      intelligence: 70,
      agility: 50,
      defense: 95,
      speed: 45,
      luck: 60
    },
    skills: ['Liquidity Shield', 'Yield Strike', 'Protocol Defense'],
    imageUrl: '/characters/defi-tank.png',
    description: 'A heavily armored guardian of DeFi protocols. Unbreakable defense and protocol knowledge.',
    minted: false,
    evolutionStage: 1,
    maxEvolutionStage: 3,
    specialAbilities: ['Protocol Immunity', 'Yield Generation'],
    questBonus: 18,
    tournamentBonus: 12
  },
  {
    id: 'nft-assassin',
    name: 'NFT Assassin',
    rarity: 'Legendary',
    type: 'Assassin',
    level: 1,
    experience: 0,
    maxExperience: 100,
    attributes: {
      strength: 80,
      intelligence: 85,
      agility: 100,
      defense: 55,
      speed: 95,
      luck: 90
    },
    skills: ['Shadow Strike', 'NFT Mimicry', 'Stealth Mode'],
    imageUrl: '/characters/nft-assassin.png',
    description: 'A stealthy assassin who can transform into any NFT. Master of deception and precision.',
    minted: false,
    evolutionStage: 1,
    maxEvolutionStage: 4,
    specialAbilities: ['NFT Transformation', 'Critical Hit Mastery'],
    questBonus: 30,
    tournamentBonus: 25
  },
  {
    id: 'quest-support',
    name: 'Quest Support',
    rarity: 'Common',
    type: 'Support',
    level: 1,
    experience: 0,
    maxExperience: 100,
    attributes: {
      strength: 50,
      intelligence: 90,
      agility: 70,
      defense: 75,
      speed: 80,
      luck: 85
    },
    skills: ['Quest Boost', 'Team Heal', 'Experience Share'],
    imageUrl: '/characters/quest-support.png',
    description: 'A supportive companion who enhances quest completion and team performance.',
    minted: false,
    evolutionStage: 1,
    maxEvolutionStage: 2,
    specialAbilities: ['Quest Optimization', 'Team Synergy'],
    questBonus: 35,
    tournamentBonus: 5
  }
];

const CrossmintGameCharacters: React.FC<CharacterSelectionProps> = ({
  onCharacterSelect,
  selectedCharacter,
  playerLevel,
  unlockedCharacters
}) => {
  const [characters, setCharacters] = useState<CrossmintCharacter[]>(CROSSMINT_CHARACTERS);
  const [selectedTab, setSelectedTab] = useState('available');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // Filter characters based on player level and unlock status
  const filteredCharacters = characters.filter(character => {
    const isUnlocked = unlockedCharacters.includes(character.id);
    const rarityMatch = filterRarity === 'all' || character.rarity === filterRarity;
    
    if (selectedTab === 'available') {
      return isUnlocked && rarityMatch;
    } else if (selectedTab === 'locked') {
      return !isUnlocked && rarityMatch;
    }
    return rarityMatch;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500';
      case 'Rare': return 'bg-blue-500';
      case 'Epic': return 'bg-purple-500';
      case 'Legendary': return 'bg-yellow-500';
      case 'Mythic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Warrior': return <Sword className="h-4 w-4" />;
      case 'Mage': return <Zap className="h-4 w-4" />;
      case 'Ranger': return <User className="h-4 w-4" />;
      case 'Tank': return <Shield className="h-4 w-4" />;
      case 'Support': return <Sparkles className="h-4 w-4" />;
      case 'Assassin': return <Flame className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const handleCharacterSelect = (character: CrossmintCharacter) => {
    if (unlockedCharacters.includes(character.id)) {
      onCharacterSelect(character);
    }
  };

  const handleMintCharacter = async (character: CrossmintCharacter) => {
    try {
      // Crossmint integration for character minting
      // This would integrate with Crossmint SDK
      console.log('Minting character:', character.name);
      
      // Update character as minted
      setCharacters(prev => prev.map(c => 
        c.id === character.id 
          ? { ...c, minted: true, tokenId: `token_${Date.now()}` }
          : c
      ));
    } catch (error) {
      console.error('Failed to mint character:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Crossmint Game Characters</h2>
        <p className="text-muted-foreground">
          Select and customize your Avalanche Rush character. Each character has unique abilities and bonuses.
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Characters</TabsTrigger>
          <TabsTrigger value="locked">Locked Characters</TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mb-6">
          <select 
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
            <option value="Mythic">Mythic</option>
          </select>
        </div>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <Card 
                key={character.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedCharacter?.id === character.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCharacterSelect(character)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={character.imageUrl} alt={character.name} />
                        <AvatarFallback>{character.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(character.rarity)}>
                            {character.rarity}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {getTypeIcon(character.type)}
                            {character.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{character.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level {character.level}</span>
                      <span>{character.experience}/{character.maxExperience} XP</span>
                    </div>
                    <Progress 
                      value={(character.experience / character.maxExperience) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>STR:</span>
                      <span>{character.attributes.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INT:</span>
                      <span>{character.attributes.intelligence}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AGI:</span>
                      <span>{character.attributes.agility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DEF:</span>
                      <span>{character.attributes.defense}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Trophy className="h-3 w-3 mr-1" />
                      Quest +{character.questBonus}%
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Coins className="h-3 w-3 mr-1" />
                      Tourney +{character.tournamentBonus}%
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCharacterSelect(character);
                      }}
                    >
                      Select Character
                    </Button>
                    {!character.minted && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMintCharacter(character);
                        }}
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <Card key={character.id} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={character.imageUrl} alt={character.name} />
                        <AvatarFallback>{character.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(character.rarity)}>
                            {character.rarity}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {getTypeIcon(character.type)}
                            {character.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{character.description}</p>
                  
                  <div className="text-center py-4">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Unlock at Level {character.level + 5}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCharacter && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Selected Character: {selectedCharacter.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Special Abilities</h4>
                <ul className="space-y-1">
                  {selectedCharacter.specialAbilities.map((ability, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      {ability}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacter.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrossmintGameCharacters;
