import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Shield, Target, Wrench, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCharacterStats } from '@/hooks/useCharacterStats';

export enum CharacterClass {
  RushRunner = 0,
  GuardianTowers = 1,
  PixelSharpshooter = 2,
  TinkerTech = 3
}

interface CharacterData {
  class: CharacterClass;
  name: string;
  description: string;
  icon: typeof Zap;
  color: string;
  gradient: string;
  stats: {
    scoreMultiplier: string;
    comboBonus: string;
    specialAbility: string;
  };
  lore: string;
}

const CHARACTER_CLASSES: CharacterData[] = [
  {
    class: CharacterClass.RushRunner,
    name: 'Rush Runner',
    description: 'Master of speed and momentum',
    icon: Zap,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-500',
    stats: {
      scoreMultiplier: '+10% Base Score',
      comboBonus: '+15% Combo Damage',
      specialAbility: 'Speed Rush: Double points for 5 seconds'
    },
    lore: 'Born in the racing circuits of Neo-Tokyo, Rush Runners live for the thrill of velocity.'
  },
  {
    class: CharacterClass.GuardianTowers,
    name: 'Guardian Towers',
    description: 'Defensive specialist with tower bonuses',
    icon: Shield,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    stats: {
      scoreMultiplier: '+5% Base Score',
      comboBonus: '+20% Tower Defense',
      specialAbility: 'Fortress Mode: Invulnerable for 3 seconds'
    },
    lore: 'Ancient protectors who channel the power of the Avalanche blockchain itself.'
  },
  {
    class: CharacterClass.PixelSharpshooter,
    name: 'Pixel Sharpshooter',
    description: 'Precision shooting with critical hits',
    icon: Target,
    color: 'text-red-400',
    gradient: 'from-red-500 to-pink-500',
    stats: {
      scoreMultiplier: '+20% Base Score',
      comboBonus: '+25% Critical Hit',
      specialAbility: 'Dead Eye: Next 3 hits are critical'
    },
    lore: 'Elite marksmen from the Digital Frontier, known for pixel-perfect accuracy.'
  },
  {
    class: CharacterClass.TinkerTech,
    name: 'Tinker Tech',
    description: 'Engineer with gadget mastery',
    icon: Wrench,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-indigo-500',
    stats: {
      scoreMultiplier: '+15% Base Score',
      comboBonus: '+10% Tech Bonus',
      specialAbility: 'Overclock: All gadgets recharge instantly'
    },
    lore: 'Brilliant inventors who merge blockchain tech with quantum mechanics.'
  }
];

export default function CharacterSelection({ onCharacterSelected }: { onCharacterSelected?: (tokenId: number) => void }) {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const {
    playerCharacters,
    selectedCharacter,
    isLoading,
    mintCharacter,
    selectCharacter,
    loadPlayerCharacters
  } = useCharacterStats();

  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadPlayerCharacters();
    }
  }, [isConnected, address, loadPlayerCharacters]);

  const handleMintCharacter = async (characterClass: CharacterClass) => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to mint a character",
        variant: "destructive"
      });
      return;
    }

    setIsMinting(true);
    try {
      const tokenId = await mintCharacter(characterClass);
      toast({
        title: "Character Minted!",
        description: `Your ${CHARACTER_CLASSES[characterClass].name} has been created`,
      });

      // Auto-select the newly minted character
      await selectCharacter(tokenId);
      if (onCharacterSelected) {
        onCharacterSelected(tokenId);
      }
    } catch (error: any) {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint character",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handleSelectExisting = async (tokenId: number) => {
    try {
      await selectCharacter(tokenId);
      if (onCharacterSelected) {
        onCharacterSelected(tokenId);
      }
      toast({
        title: "Character Selected",
        description: "Your character is ready for battle!",
      });
    } catch (error: any) {
      toast({
        title: "Selection Failed",
        description: error.message || "Failed to select character",
        variant: "destructive"
      });
    }
  };

  const hasCharacterOfClass = (characterClass: CharacterClass) => {
    return playerCharacters.some(char => char.characterClass === characterClass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Champion
          </h1>
          <p className="text-xl text-gray-300">
            Select a character class to begin your Avalanche Rush journey
          </p>
          {isConnected && playerCharacters.length > 0 && (
            <p className="text-sm text-blue-300 mt-2">
              You own {playerCharacters.length} character{playerCharacters.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {CHARACTER_CLASSES.map((char) => {
            const Icon = char.icon;
            const owned = hasCharacterOfClass(char.class);
            const ownedChar = playerCharacters.find(c => c.characterClass === char.class);
            const isSelected = selectedCharacter?.characterClass === char.class;

            return (
              <Card
                key={char.class}
                className={`relative overflow-hidden bg-slate-800/50 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isSelected
                    ? 'border-green-500 shadow-lg shadow-green-500/50'
                    : owned
                    ? 'border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'border-slate-700 hover:border-purple-500'
                }`}
                onClick={() => setSelectedClass(char.class)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${char.gradient} opacity-10`} />

                {/* Owned/Selected Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </div>
                )}
                {owned && !isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Owned
                  </div>
                )}

                <div className="relative p-6">
                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${char.gradient} flex items-center justify-center`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Name */}
                  <h3 className={`text-2xl font-bold text-center mb-2 ${char.color}`}>
                    {char.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 text-center mb-4">
                    {char.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-gray-300">
                      <span className="text-green-400">⚡</span> {char.stats.scoreMultiplier}
                    </div>
                    <div className="text-xs text-gray-300">
                      <span className="text-blue-400">💥</span> {char.stats.comboBonus}
                    </div>
                    <div className="text-xs text-gray-300">
                      <span className="text-purple-400">🎯</span> {char.stats.specialAbility}
                    </div>
                  </div>

                  {/* Lore */}
                  <p className="text-xs text-gray-500 italic mb-4 border-t border-slate-700 pt-3">
                    {char.lore}
                  </p>

                  {/* Level display for owned characters */}
                  {ownedChar && (
                    <div className="mb-3 p-2 bg-slate-900/50 rounded">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Level {ownedChar.level}</span>
                        <span>{ownedChar.experience} XP</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${char.gradient}`}
                          style={{ width: `${(ownedChar.experience % 1000) / 10}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {owned ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (ownedChar) handleSelectExisting(ownedChar.tokenId);
                      }}
                      disabled={isSelected || isLoading}
                      className={`w-full bg-gradient-to-r ${char.gradient} hover:opacity-90`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Active
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMintCharacter(char.class);
                      }}
                      disabled={isMinting || !isConnected}
                      className={`w-full bg-gradient-to-r ${char.gradient} hover:opacity-90`}
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Minting...
                        </>
                      ) : !isConnected ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Connect Wallet
                        </>
                      ) : (
                        'Mint Character'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Character Info */}
        {selectedCharacter && (
          <Card className="bg-slate-800/50 border-green-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">
                  Active Character: {CHARACTER_CLASSES[selectedCharacter.characterClass].name}
                </h3>
                <p className="text-gray-300">
                  Level {selectedCharacter.level} • {selectedCharacter.experience} XP
                </p>
                {selectedCharacter.currentArc > 0 && (
                  <p className="text-sm text-purple-300 mt-1">
                    Story Arc {selectedCharacter.currentArc} • Chapter {selectedCharacter.currentChapter}
                  </p>
                )}
              </div>
              <Button
                onClick={() => {
                  if (onCharacterSelected) {
                    onCharacterSelected(selectedCharacter.tokenId);
                  }
                }}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500"
              >
                Start Game
              </Button>
            </div>
          </Card>
        )}

        {/* No Wallet Connected */}
        {!isConnected && (
          <Card className="bg-yellow-900/20 border-yellow-500 p-6 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-300 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-gray-300">
              Please connect your wallet to mint and select characters
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
