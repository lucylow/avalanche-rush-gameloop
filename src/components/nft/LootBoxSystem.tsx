import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNFTSystem, Rarity } from '@/hooks/useNFTSystem';
import { Gift, Sparkles, Clock, CheckCircle2, Lock } from 'lucide-react';

export enum LootBoxTier {
  BRONZE = 0,
  SILVER = 1,
  GOLD = 2,
  DIAMOND = 3,
  MYTHIC = 4
}

interface LootBoxCardProps {
  lootBoxId: number;
  name: string;
  tier: LootBoxTier;
  cooldownSeconds: number;
  description: string;
  rewardTypes: string[];
}

const tierColors = {
  [LootBoxTier.BRONZE]: 'from-orange-600 to-orange-800',
  [LootBoxTier.SILVER]: 'from-gray-300 to-gray-500',
  [LootBoxTier.GOLD]: 'from-yellow-400 to-yellow-600',
  [LootBoxTier.DIAMOND]: 'from-cyan-400 to-blue-600',
  [LootBoxTier.MYTHIC]: 'from-purple-500 to-pink-600'
};

const tierNames = {
  [LootBoxTier.BRONZE]: 'Bronze',
  [LootBoxTier.SILVER]: 'Silver',
  [LootBoxTier.GOLD]: 'Gold',
  [LootBoxTier.DIAMOND]: 'Diamond',
  [LootBoxTier.MYTHIC]: 'Mythic'
};

const rarityDropRates = {
  [LootBoxTier.BRONZE]: {
    [Rarity.COMMON]: 70,
    [Rarity.RARE]: 25,
    [Rarity.EPIC]: 5,
    [Rarity.LEGENDARY]: 0,
    [Rarity.MYTHIC]: 0
  },
  [LootBoxTier.SILVER]: {
    [Rarity.COMMON]: 50,
    [Rarity.RARE]: 35,
    [Rarity.EPIC]: 13,
    [Rarity.LEGENDARY]: 2,
    [Rarity.MYTHIC]: 0
  },
  [LootBoxTier.GOLD]: {
    [Rarity.COMMON]: 30,
    [Rarity.RARE]: 40,
    [Rarity.EPIC]: 20,
    [Rarity.LEGENDARY]: 9,
    [Rarity.MYTHIC]: 1
  },
  [LootBoxTier.DIAMOND]: {
    [Rarity.COMMON]: 10,
    [Rarity.RARE]: 30,
    [Rarity.EPIC]: 35,
    [Rarity.LEGENDARY]: 20,
    [Rarity.MYTHIC]: 5
  },
  [LootBoxTier.MYTHIC]: {
    [Rarity.COMMON]: 0,
    [Rarity.RARE]: 10,
    [Rarity.EPIC]: 30,
    [Rarity.LEGENDARY]: 40,
    [Rarity.MYTHIC]: 20
  }
};

const LootBoxCard: React.FC<LootBoxCardProps> = ({
  lootBoxId,
  name,
  tier,
  cooldownSeconds,
  description,
  rewardTypes
}) => {
  const { openLootBox, checkLootBoxEligibility, isLoading } = useNFTSystem();
  const [eligible, setEligible] = useState(false);
  const [cooledDown, setCooledDown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [openedReward, setOpenedReward] = useState<number | null>(null);

  useEffect(() => {
    const checkEligibility = async () => {
      const { eligible, cooledDown } = await checkLootBoxEligibility(lootBoxId);
      setEligible(eligible);
      setCooledDown(cooledDown);
    };

    checkEligibility();
    const interval = setInterval(checkEligibility, 5000);
    return () => clearInterval(interval);
  }, [lootBoxId, checkLootBoxEligibility]);

  const handleOpen = async () => {
    setIsOpening(true);
    try {
      const { tokenId } = await openLootBox(lootBoxId);
      setOpenedReward(tokenId);

      // Show animation
      setTimeout(() => {
        setIsOpening(false);
        setOpenedReward(null);
      }, 3000);
    } catch (error) {
      console.error('Error opening loot box:', error);
      setIsOpening(false);
      alert('Failed to open loot box: ' + error);
    }
  };

  const canOpen = eligible && cooledDown && !isLoading;

  return (
    <Card className={`relative overflow-hidden ${isOpening ? 'animate-pulse' : ''}`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tierColors[tier]} opacity-10`} />

      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6" />
            <CardTitle>{name}</CardTitle>
          </div>
          <Badge className={`bg-gradient-to-r ${tierColors[tier]}`}>
            {tierNames[tier]}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Drop Rates */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Drop Rates</h4>
          {Object.entries(rarityDropRates[tier]).map(([rarity, rate]) => {
            if (rate === 0) return null;
            return (
              <div key={rarity} className="flex justify-between items-center text-sm">
                <span className="capitalize">{Rarity[parseInt(rarity)]}</span>
                <div className="flex items-center gap-2">
                  <Progress value={rate} className="w-20 h-2" />
                  <span className="text-muted-foreground w-10 text-right">{rate}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reward Types */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Possible Rewards</h4>
          <div className="flex flex-wrap gap-2">
            {rewardTypes.map(type => (
              <Badge key={type} variant="outline">{type}</Badge>
            ))}
          </div>
        </div>

        {/* Cooldown Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Cooldown: {Math.floor(cooldownSeconds / 60)} minutes</span>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm ${eligible ? 'text-green-500' : 'text-red-500'}`}>
            {eligible ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{eligible ? 'Eligible' : 'Not Eligible'}</span>
          </div>
          {!cooledDown && (
            <div className="flex items-center gap-2 text-sm text-orange-500">
              <Clock className="w-4 h-4" />
              <span>Cooldown Active</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button
          className="w-full"
          disabled={!canOpen || isOpening}
          onClick={handleOpen}
        >
          {isOpening ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Opening...
            </>
          ) : !eligible ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Not Eligible
            </>
          ) : !cooledDown ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Cooling Down
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Open Box
            </>
          )}
        </Button>
      </CardFooter>

      {/* Opening Animation */}
      {isOpening && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <div className="relative">
              <Gift className="w-24 h-24 text-white animate-bounce" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute top-0 right-0 animate-ping" />
            </div>
            <p className="text-white font-bold text-xl">Opening Loot Box...</p>
          </div>
        </div>
      )}

      {/* Reward Reveal */}
      {openedReward && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center z-10 animate-in fade-in">
          <div className="text-center space-y-4">
            <Sparkles className="w-24 h-24 text-yellow-400 mx-auto animate-pulse" />
            <p className="text-white font-bold text-2xl">Congratulations!</p>
            <p className="text-white">You received NFT #{openedReward}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export function LootBoxSystem() {
  // Define available loot boxes
  const lootBoxes: LootBoxCardProps[] = [
    {
      lootBoxId: 0,
      name: 'Bronze Chest',
      tier: LootBoxTier.BRONZE,
      cooldownSeconds: 300, // 5 minutes
      description: 'Basic rewards for participants',
      rewardTypes: ['Common Power-ups', 'Basic Achievements']
    },
    {
      lootBoxId: 1,
      name: 'Silver Chest',
      tier: LootBoxTier.SILVER,
      cooldownSeconds: 900, // 15 minutes
      description: 'Better rewards for active players',
      rewardTypes: ['Rare Power-ups', 'Achievement Badges', 'Evolution NFTs']
    },
    {
      lootBoxId: 2,
      name: 'Gold Chest',
      tier: LootBoxTier.GOLD,
      cooldownSeconds: 1800, // 30 minutes
      description: 'Premium rewards for top performers',
      rewardTypes: ['Epic Power-ups', 'Rare Achievements', 'Advanced Evolution']
    },
    {
      lootBoxId: 3,
      name: 'Diamond Chest',
      tier: LootBoxTier.DIAMOND,
      cooldownSeconds: 3600, // 1 hour
      description: 'Elite rewards for tournament winners',
      rewardTypes: ['Legendary Items', 'Exclusive Achievements', 'Rare Characters']
    },
    {
      lootBoxId: 4,
      name: 'Mythic Vault',
      tier: LootBoxTier.MYTHIC,
      cooldownSeconds: 7200, // 2 hours
      description: 'Ultimate rewards for champions',
      rewardTypes: ['Mythic Power-ups', 'Champion Badges', 'Ultimate Evolution']
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Loot Box System</h2>
        <p className="text-muted-foreground">
          Open loot boxes earned from tournaments and achievements to receive powerful NFT rewards!
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How to Earn Loot Boxes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Win tournaments to receive Diamond and Mythic chests</li>
            <li>Rank in top 10 to earn Gold chests</li>
            <li>Complete achievements to unlock Silver chests</li>
            <li>Participate in events for Bronze chests</li>
            <li>Higher tier boxes have better drop rates for rare NFTs</li>
          </ul>
        </CardContent>
      </Card>

      {/* Loot Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lootBoxes.map(box => (
          <LootBoxCard key={box.lootBoxId} {...box} />
        ))}
      </div>
    </div>
  );
}

export default LootBoxSystem;
