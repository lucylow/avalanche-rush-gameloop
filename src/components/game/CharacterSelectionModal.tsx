import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Star, 
  Zap, 
  Shield, 
  Sword, 
  Crown, 
  Flame,
  Sparkles,
  Check
} from 'lucide-react';
import { useCrossmint } from '../../hooks/useCrossmint';
import ErrorBoundary from '../common/ErrorBoundary';

interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: 'Warrior' | 'Mage' | 'Ranger' | 'Tank' | 'Support' | 'Assassin';
  unlockRequirements: Array<{ type: string; value: string | number }>;
  specialAbilities: string[];
  skills?: string[];
  attributes?: Record<string, number>;
  questBonus: number;
  tournamentBonus: number;
}

interface CharacterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterSelect: (character: Character) => void;
  selectedCharacter?: Character;
  playerLevel: number;
}

const CharacterSelectionModal: React.FC<CharacterSelectionModalProps> = React.memo(({
  isOpen,
  onClose,
  onCharacterSelect,
  selectedCharacter,
  playerLevel
}) => {
  const [activeTab, setActiveTab] = useState('available');
  const { 
    characters, 
    isLoading, 
    error, 
    mintCharacter, 
    isCharacterMinted 
  } = useCrossmint();

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

  const handleCharacterSelect = (character: Character) => {
    onCharacterSelect(character);
    onClose();
  };

  const handleMintCharacter = async (character: Character) => {
    try {
      // Convert Character to CrossmintCharacter format with proper type safety
      const crossmintChar = {
        id: character.id,
        name: character.name,
        rarity: character.rarity,
        type: character.type || 'Warrior',
        imageUrl: character.imageUrl || '',
        description: character.description || 'No description',
        attributes: character.attributes || {},
        skills: character.skills || [],
        specialAbilities: character.specialAbilities || [],
        questBonus: character.questBonus || 0,
        tournamentBonus: character.tournamentBonus || 0,
        unlockRequirements: character.unlockRequirements || []
      };
      
      const result = await mintCharacter(crossmintChar);
      if (result.success) {
        console.log('Character minted:', result.tokenId);
      } else {
        console.error('Failed to mint character:', result.error);
      }
    } catch (error) {
      console.error('Minting error:', error);
    }
  };

  const availableCharacters = useMemo(() => 
    characters.filter(char => 
      isCharacterMinted(char.id) || char.rarity === 'Common'
    ), [characters, isCharacterMinted]
  );

  const lockedCharacters = useMemo(() => 
    characters.filter(char => 
      !isCharacterMinted(char.id) && char.rarity !== 'Common'
    ), [characters, isCharacterMinted]
  );

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('CharacterSelectionModal Error:', error, errorInfo);
      }}
      showDetails={process.env.NODE_ENV === 'development'}
      resetOnPropsChange={true}
      resetKeys={[playerLevel, selectedCharacter?.id]}
    >
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            Select Your Game Character
          </DialogTitle>
          <DialogDescription>
            Choose your Crossmint character to enhance your Avalanche Rush experience. Each character has unique abilities and bonuses.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">
              Available Characters ({availableCharacters.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked Characters ({lockedCharacters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCharacters.map((character) => (
            <div
              key={character.id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedCharacter?.id === character.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => handleCharacterSelect(character)}
            >
                  {selectedCharacter?.id === character.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={character.imageUrl} alt={character.name} />
                      <AvatarFallback>{character.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{character.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getRarityColor(character.rarity)} text-white text-xs`}>
                          {character.rarity}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getTypeIcon(character.type)}
                          {character.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{character.description}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span>Quest Bonus</span>
                      <span className="font-medium">+{character.questBonus}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Tournament Bonus</span>
                      <span className="font-medium">+{character.tournamentBonus}%</span>
                    </div>
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
                      Select
                    </Button>
                    {!isCharacterMinted(character.id) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMintCharacter(character);
                        }}
                      >
                        <Crown className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="locked" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedCharacters.map((character) => (
                <div
                  key={character.id}
                  className="relative border rounded-lg p-4 opacity-60"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={character.imageUrl} alt={character.name} />
                      <AvatarFallback>{character.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{character.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getRarityColor(character.rarity)} text-white text-xs`}>
                          {character.rarity}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getTypeIcon(character.type)}
                          {character.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{character.description}</p>

                  <div className="text-center py-4">
                    <Crown className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Unlock by minting this character
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedCharacter && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Selected: {selectedCharacter.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-sm mb-1">Special Abilities</h5>
                <ul className="space-y-1">
                  {selectedCharacter.specialAbilities?.map((ability: string, index: number) => (
                    <li key={index} className="text-xs flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      {ability}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm mb-1">Skills</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedCharacter.skills?.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Continue with Selected Character
          </Button>
        </div>
      </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
});

CharacterSelectionModal.displayName = 'CharacterSelectionModal';

export default CharacterSelectionModal;
