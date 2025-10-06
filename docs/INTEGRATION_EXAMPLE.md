# 🎮 NFT System Integration Example

## Adding NFT Dashboard to Your Game

Here's how to integrate the gamified NFT system into your Avalanche Rush game:

### Option 1: Add as Standalone Page

```typescript
// src/App.tsx or your router file

import { NFTDashboard } from '@/components/nft/NFTDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<AvalancheRushGame />} />
        <Route path="/nfts" element={<NFTDashboard />} />  {/* Add this */}
        <Route path="/tournaments" element={<TournamentSystem />} />
      </Routes>
    </Router>
  );
}
```

### Option 2: Integrate into Existing Game Component

```typescript
// src/components/game/AvalancheRushGame.tsx

import { useState } from 'react';
import { useNFTSystem } from '@/hooks/useNFTSystem';
import { NFTDashboard } from '@/components/nft/NFTDashboard';
import { Button } from '@/components/ui/button';

export function AvalancheRushGame() {
  const [showNFTs, setShowNFTs] = useState(false);
  const { powerBonus } = useNFTSystem();

  // Apply power bonus to game score
  const calculateFinalScore = (baseScore: number) => {
    return Math.floor(baseScore * (1 + powerBonus / 100));
  };

  return (
    <div>
      {/* Game Header with NFT Stats */}
      <div className="flex justify-between items-center p-4">
        <div className="flex gap-4">
          <span>Score: {score}</span>
          {powerBonus > 0 && (
            <span className="text-green-500">
              🔥 +{powerBonus}% Bonus Active!
            </span>
          )}
        </div>
        <Button onClick={() => setShowNFTs(!showNFTs)}>
          {showNFTs ? 'Play Game' : 'View NFTs'}
        </Button>
      </div>

      {/* Toggle between game and NFT dashboard */}
      {showNFTs ? (
        <NFTDashboard />
      ) : (
        <GameCanvas />
      )}
    </div>
  );
}
```

### Option 3: Add NFT Sidebar to Game

```typescript
// src/components/game/AvalancheRushGame.tsx

import { useNFTSystem } from '@/hooks/useNFTSystem';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AvalancheRushGame() {
  const { playerNFTs, powerBonus, activatePowerUp } = useNFTSystem();

  // Get active power-ups
  const activePowerUps = playerNFTs.filter(
    nft => nft.metadata.nftType === 1 && !nft.metadata.isActive
  );

  return (
    <div className="flex gap-4">
      {/* Main Game Area */}
      <div className="flex-1">
        <GameCanvas />
      </div>

      {/* NFT Sidebar */}
      <Card className="w-80 p-4 space-y-4">
        <h3 className="font-bold">Active Bonuses</h3>
        <div className="text-2xl text-green-500">+{powerBonus}%</div>

        <h3 className="font-bold mt-4">Available Power-ups</h3>
        {activePowerUps.map(nft => (
          <Card key={nft.tokenId} className="p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">NFT #{nft.tokenId}</p>
                <p className="text-sm text-green-500">
                  +{nft.metadata.powerBonus}%
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => activatePowerUp(nft.tokenId)}
              >
                Activate
              </Button>
            </div>
          </Card>
        ))}
      </Card>
    </div>
  );
}
```

---

## Tournament Integration Example

Show NFT rewards when tournament ends:

```typescript
// src/components/TournamentSystem.tsx

import { useGameLoop } from '@/hooks/useGameLoop';
import { useNFTSystem } from '@/hooks/useNFTSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TournamentSystem() {
  const { currentTournament, leaderboard, claimReward } = useGameLoop();
  const { checkLootBoxEligibility, openLootBox } = useNFTSystem();

  const handleClaimRewards = async () => {
    // Claim tournament tokens
    await claimReward(currentTournament.id);

    // Check if eligible for loot box
    const { eligible } = await checkLootBoxEligibility(0); // Check bronze box

    if (eligible) {
      const confirmation = confirm('You earned a loot box! Open now?');
      if (confirmation) {
        await openLootBox(0);
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tournament Results</h2>

      {/* Leaderboard */}
      <div className="space-y-2 mb-6">
        {leaderboard.map((entry, index) => (
          <div key={entry.player} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div className="flex gap-3">
              <span className="font-bold">#{index + 1}</span>
              <span>{entry.player.slice(0, 6)}...{entry.player.slice(-4)}</span>
            </div>
            <div className="flex gap-4 items-center">
              <span>{entry.score} pts</span>
              {entry.reward > 0 && (
                <span className="text-green-500">{entry.reward} RUSH</span>
              )}
              {/* Show NFT reward indicator */}
              {index === 0 && <Badge className="bg-pink-500">Mythic Box 🎁</Badge>}
              {index === 1 && <Badge className="bg-purple-500">Diamond Box 🎁</Badge>}
              {index === 2 && <Badge className="bg-orange-500">Gold Box 🎁</Badge>}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleClaimRewards} className="w-full">
        Claim Rewards & NFTs
      </Button>
    </Card>
  );
}
```

---

## Post-Game NFT Reward Flow

Show NFT rewards after each game:

```typescript
// src/components/game/GameOverScreen.tsx

import { useEffect, useState } from 'react';
import { useNFTSystem } from '@/hooks/useNFTSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Gift, TrendingUp } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  tournamentId: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, tournamentId, onRestart }: GameOverScreenProps) {
  const { checkLootBoxEligibility, openLootBox } = useNFTSystem();
  const [hasLootBox, setHasLootBox] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardTokenId, setRewardTokenId] = useState<number | null>(null);

  useEffect(() => {
    // Check for loot box eligibility
    const checkRewards = async () => {
      const boxes = [0, 1, 2, 3, 4]; // Check all tiers
      for (const boxId of boxes) {
        const { eligible } = await checkLootBoxEligibility(boxId);
        if (eligible) {
          setHasLootBox(true);
          break;
        }
      }
    };
    checkRewards();
  }, []);

  const handleOpenLootBox = async () => {
    try {
      // Try to open any eligible box
      const boxes = [4, 3, 2, 1, 0]; // Try highest tier first
      for (const boxId of boxes) {
        const { eligible, cooledDown } = await checkLootBoxEligibility(boxId);
        if (eligible && cooledDown) {
          const { tokenId } = await openLootBox(boxId);
          setRewardTokenId(tokenId);
          setShowReward(true);
          break;
        }
      }
    } catch (error) {
      console.error('Failed to open loot box:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="max-w-md w-full p-8 space-y-6">
        {/* Game Over Stats */}
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
          <h2 className="text-3xl font-bold">Game Over!</h2>
          <div className="text-6xl font-bold text-purple-600">{score}</div>
          <p className="text-muted-foreground">Final Score</p>
        </div>

        {/* Loot Box Available */}
        {hasLootBox && !showReward && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-purple-600" />
              <div className="flex-1">
                <p className="font-bold">Loot Box Available!</p>
                <p className="text-sm text-muted-foreground">
                  You earned a reward box
                </p>
              </div>
              <Button onClick={handleOpenLootBox} size="sm">
                Open Now
              </Button>
            </div>
          </Card>
        )}

        {/* Reward Received */}
        {showReward && rewardTokenId && (
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
            <p>You received NFT #{rewardTokenId}</p>
            <Button
              variant="outline"
              className="mt-4 bg-white text-purple-600"
              onClick={() => window.location.href = '/nfts'}
            >
              View in Collection
            </Button>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={onRestart} className="flex-1">
            Play Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/nfts'}>
            View NFTs
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

---

## Navigation Menu Integration

Add NFT link to your main navigation:

```typescript
// src/components/Navigation.tsx

import { Link } from 'react-router-dom';
import { useNFTSystem } from '@/hooks/useNFTSystem';
import { Badge } from '@/components/ui/badge';

export function Navigation() {
  const { playerStats, powerBonus } = useNFTSystem();

  return (
    <nav className="flex gap-6 items-center">
      <Link to="/">Home</Link>
      <Link to="/game">Play Game</Link>
      <Link to="/tournaments">Tournaments</Link>

      {/* NFT Link with Stats Badge */}
      <Link to="/nfts" className="flex items-center gap-2">
        NFTs
        {playerStats && playerStats.totalNFTs > 0 && (
          <Badge variant="secondary">{playerStats.totalNFTs}</Badge>
        )}
        {powerBonus > 0 && (
          <Badge className="bg-green-500">+{powerBonus}%</Badge>
        )}
      </Link>

      <Link to="/marketplace">Marketplace</Link>
    </nav>
  );
}
```

---

## Real-time Power Bonus Display

Show active bonuses during gameplay:

```typescript
// src/components/game/GameHUD.tsx

import { useNFTSystem } from '@/hooks/useNFTSystem';
import { Zap, Clock } from 'lucide-react';

export function GameHUD({ score }: { score: number }) {
  const { powerBonus, playerNFTs } = useNFTSystem();

  // Get active power-ups with expiration
  const activePowerUps = playerNFTs.filter(
    nft => nft.metadata.nftType === 1 && nft.metadata.isActive
  );

  return (
    <div className="fixed top-4 left-4 right-4 flex justify-between items-start">
      {/* Score Display */}
      <div className="bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-lg">
        <div className="text-sm opacity-75">Score</div>
        <div className="text-3xl font-bold">{score}</div>
        {powerBonus > 0 && (
          <div className="text-green-400 text-sm flex items-center gap-1">
            <Zap className="w-4 h-4" />
            +{powerBonus}% Bonus
          </div>
        )}
      </div>

      {/* Active Power-ups */}
      {activePowerUps.length > 0 && (
        <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Active Power-ups
          </div>
          {activePowerUps.map(nft => (
            <div key={nft.tokenId} className="text-xs flex items-center gap-2">
              <span>+{nft.metadata.powerBonus}%</span>
              <Clock className="w-3 h-3" />
              <span>{Math.floor(nft.metadata.durationSeconds / 60)}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Complete Integration Checklist

- [ ] Deploy NFT contracts (use `scripts/deploy-gamified-nfts.js`)
- [ ] Update `.env` with contract addresses
- [ ] Import NFT components in your app
- [ ] Add NFT route to router
- [ ] Integrate power bonus in game logic
- [ ] Show NFT rewards after tournaments
- [ ] Add loot box opening to post-game screen
- [ ] Display NFT stats in navigation
- [ ] Test complete flow on testnet
- [ ] Deploy to production

---

## Environment Variables Needed

Make sure your `.env` has all these:

```env
# Existing
VITE_GAMELOOP_CONTRACT=0x...
VITE_RUSH_TOKEN=0x...

# New NFT Contracts
VITE_NFT_SYSTEM=0x...
VITE_LOOTBOX=0x...
VITE_MARKETPLACE=0x...
VITE_TOURNAMENT_REWARDS=0x...

# Avalanche Network
VITE_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
```

---

## Testing the Integration

```bash
# 1. Start your dev server
npm run dev

# 2. Navigate to NFT dashboard
# Visit: http://localhost:3000/nfts

# 3. Test tournament flow
# - Create tournament
# - Play game
# - End tournament
# - Claim rewards
# - Open loot box

# 4. Test marketplace
# - List NFT for sale
# - Buy NFT from another player
# - Check collection value
```

---

## Pro Tips

1. **Cache NFT data** to reduce RPC calls
2. **Use React Query** for automatic refetching
3. **Show loading states** during transactions
4. **Add toast notifications** for user feedback
5. **Implement error boundaries** for better UX
6. **Optimize images** for NFT metadata
7. **Use IPFS** for decentralized storage
8. **Track analytics** with events

---

**Your game now has a complete gamified NFT system!** 🎉

Players can:
- ✅ Earn NFTs from tournaments
- ✅ Open loot boxes for random rewards
- ✅ Level up evolution NFTs with XP
- ✅ Activate power-ups for bonuses
- ✅ Trade NFTs on marketplace
- ✅ Build valuable collections
