# 🎭 Story-Driven Character NFT System - Complete Guide

## Overview

Enhanced character NFT system with **narrative progression**, **dynamic storytelling**, and **class-based gameplay** optimized for Avalanche Rush.

---

## 🎮 Character Classes

### 1. Rush Runner 🏃‍♂️
**Archetype:** Cyberpunk Speedster

**Lore:**
> "Born in the neon-lit streets of Neo-Avalanche, Rush Runners are cybernetic speedsters who merge with the digital flow of the blockchain itself."

**Stats:**
- **Speed Bonus:** 20 (highest)
- **Shield:** 5
- **Accuracy:** 10
- **Tech:** 8

**Scoring:**
- Base Multiplier: **+10%**
- Combo Bonus: **+15%**
- Special: Speed Surge

**Best For:** Players who love fast-paced action and combo building

---

### 2. Guardian Towers 🛡️
**Archetype:** Ancient Protector

**Lore:**
> "Ancient protectors awakened to defend the sacred protocols. Their shields are forged from crystallized consensus algorithms."

**Stats:**
- **Speed Bonus:** 5
- **Shield:** 25 (highest)
- **Accuracy:** 8
- **Tech:** 5

**Scoring:**
- Base Multiplier: **-10%** (balanced by survivability)
- Combo Bonus: **+0%**
- Special: Shield Wall (combo protection)

**Best For:** Players who prefer endurance and mistake forgiveness

---

### 3. Pixel Sharpshooter 🎯
**Archetype:** Precision Marksman

**Lore:**
> "Elite marksmen from the Precision Collective, trained to exploit vulnerabilities in the enemy's code with pixel-perfect accuracy."

**Stats:**
- **Speed Bonus:** 12
- **Shield:** 8
- **Accuracy:** 25 (highest)
- **Tech:** 10

**Scoring:**
- Base Multiplier: **+20%** (highest)
- Combo Bonus: **+25%**
- Special: Precision Strike (+50% on perfect hits)

**Best For:** Skilled players who can hit consistently

---

### 4. Tinker Tech 🔧
**Archetype:** Tech Specialist

**Lore:**
> "Brilliant engineers who bend reality itself through technological innovation. Their inventions blur the line between hardware and smart contracts."

**Stats:**
- **Speed Bonus:** 15
- **Shield:** 12
- **Accuracy:** 15
- **Tech:** 20 (highest)

**Scoring:**
- Base Multiplier: **+0%** (balanced)
- Combo Bonus: **+10%**
- Special: Tech Mastery (random utility bonuses)

**Best For:** Strategic players who like balanced gameplay

---

## 📖 Story Arc System

### Arc 1: The Awakening (Levels 1-5)
**Theme:** Tutorial and Origin Story

**Chapters:**
1. "First Steps in the Digital Void" (Score: 0, Level: 1)
2. "The Neon Calling" (Score: 5,000, Level: 2)
3. "Baptism by Fire" (Score: 10,000, Level: 3) ⭐ **Epic**

**Rewards:** 100-500 XP per chapter

---

### Arc 2: Neon Genesis (Levels 6-10)
**Theme:** Discovering Your Power

**Unlocked:** Complete Arc 1

**Progression:** Class-specific storylines diverge

---

### Arc 3: Digital Frontier (Levels 11-20)
**Theme:** Exploring the Blockchain Realms

**Unlocked:** Complete Arc 2

---

### Arc 4: Quantum Realm (Levels 21-40)
**Theme:** Master Your Abilities

**Unlocked:** Complete Arc 3

---

### Arc 5: Ascended Legend (Levels 41+)
**Theme:** Endgame Content

**Unlocked:** Complete Arc 4

---

## 💎 Lore Fragment System

### How It Works
- **Discovery Chance:** 5% per game (if score > 10,000)
- **Fragments:** 10 unique titles per character
- **Collection:** Stored on-chain, viewable in character profile

### Fragment Titles
1. "The Origin Protocol"
2. "Whispers of the Blockchain"
3. "Legends of Old Validators"
4. "The Great Consensus War"
5. "Encrypted Memories"
6. "Digital Prophecies"
7. "The First Smart Contract"
8. "Chronicles of the C-Chain"
9. "Avalanche Mythology"
10. "The Quantum Shift"

---

## 📊 Progression System

### Experience & Leveling

**XP Formula:**
```javascript
baseXP = scoreData.currentScore / 100

// Bonuses:
if (score >= 50000) xp += 500
else if (score >= 25000) xp += 250
else if (score >= 10000) xp += 100

if (isNewHighScore) xp += baseXP / 2
```

**Level Requirements:**
```
Level 1:  0 XP
Level 2:  1,000 XP
Level 3:  3,000 XP
Level 4:  6,000 XP
Level 5:  10,000 XP
Level 6:  15,000 XP
Level 7:  22,000 XP
Level 8:  30,000 XP
Level 9:  40,000 XP
Level 10: 52,000 XP
Level 11: 66,000 XP
Level 12+: 66,000 + (level-10) * 8,000
```

### Stat Scaling

**Per Level:**
- Rush Runner: +2 Speed
- Guardian Towers: +3 Shield
- Pixel Sharpshooter: +2 Accuracy
- Tinker Tech: +2 Tech

**Diminishing Returns:** After level 10, bonuses reduced

---

## 🎯 Scoring System

### Base Formula
```typescript
points = basePoints * comboMultiplier

// Class modifier
points *= characterClass.scoreMultiplier

// Combo bonus
points *= characterClass.comboBonus

// Perfect hit bonus (Sharpshooter only)
if (isPerfectHit) points *= 1.5

// Add streak bonus
points += calculateStreakBonus(streakCount)
```

### Combo Multipliers
```
0-9 hits:    1x
10-19 hits:  2x
20-29 hits:  3x
30-49 hits:  4x
50-99 hits:  6x
100+ hits:   8x (MAX)
```

### Streak Bonuses
```
0-14 streak:   0 bonus
15-29 streak:  +50 points
30-49 streak:  +100 points
50-99 streak:  +200 points
100+ streak:   +500 points
```

---

## 🔧 Integration Guide

### 1. Deploy Contract

```bash
npx hardhat run scripts/deploy-story-characters.js --network avalanche
```

### 2. Mint Character

```typescript
import { ethers } from 'ethers';

const contract = new ethers.Contract(address, abi, signer);

const tx = await contract.mintCharacter(
  playerAddress,
  CharacterClass.RushRunner, // 0-3
  "Nova Speedster",
  "ipfs://QmInitialURI"
);

await tx.wait();
```

### 3. Use Enhanced Scoring Hook

```typescript
import { useEnhancedScoring, CharacterClass } from '@/hooks/useEnhancedScoring';

function GameComponent() {
  const {
    scoreData,
    characterClass,
    characterLevel,
    addPoints,
    resetCombo,
    submitScore,
    getClassBonuses
  } = useEnhancedScoring(
    characterTokenId, // Your NFT token ID
    contractAddress   // Deployed contract
  );

  // In game loop
  const handleHit = (isPerfect: boolean) => {
    addPoints(100, isPerfect);
  };

  const handleMiss = () => {
    resetCombo();
  };

  // After game ends
  const handleGameEnd = async () => {
    const result = await submitScore();

    if (result.newChapterUnlocked) {
      showNotification(`New Chapter: ${result.chapterTitle}`);
    }

    if (result.loreDiscovered) {
      showNotification(`Lore Found: ${result.loreTitle}`);
    }
  };
}
```

---

## 🎨 Dynamic Metadata

### URL Structure
```
ipfs://QmCharacters/{classId}/{level}/{arcId}.json
```

**Example:**
```
ipfs://QmCharacters/0/5/1.json
```
- Class 0 (Rush Runner)
- Level 5
- Arc 1 (Neon Genesis)

### Metadata Format
```json
{
  "name": "Rush Runner #123",
  "description": "Level 5 Cyberpunk Speedster in the Neon Genesis arc",
  "image": "ipfs://QmImages/rush_runner_lvl5_arc1.png",
  "attributes": [
    {
      "trait_type": "Class",
      "value": "Rush Runner"
    },
    {
      "trait_type": "Level",
      "value": 5
    },
    {
      "trait_type": "Story Arc",
      "value": "Neon Genesis"
    },
    {
      "trait_type": "Speed Bonus",
      "value": 30
    },
    {
      "trait_type": "Total Games",
      "value": 47
    },
    {
      "trait_type": "High Score",
      "value": 52340
    }
  ]
}
```

---

## 🎭 Story Chapters

### Adding New Chapters

```solidity
// Story Writer role required
contract.addStoryChapter(
  CharacterClass.RushRunner,
  StoryArc.NeonGenesis,
  StoryChapter({
    scoreRequirement: 15000,
    levelRequirement: 6,
    chapterTitle: "The Speed Awakens",
    chapterDescription: "Unlock your true potential...",
    chapterURI: "ipfs://QmStory/chapter4",
    xpReward: 750,
    isEpic: false
  })
);
```

---

## 📈 Comparison Table

| Feature | Rush Runner | Guardian | Sharpshooter | Tinker |
|---------|-------------|----------|--------------|--------|
| **Score Modifier** | +10% | -10% | +20% | 0% |
| **Combo Bonus** | +15% | 0% | +25% | +10% |
| **Special** | Speed Surge | Shield Wall | Precision Strike | Tech Mastery |
| **Difficulty** | Medium | Easy | Hard | Medium |
| **Play Style** | Fast combos | Forgiving | Precision | Balanced |

---

## 🎯 Achievement Integration

### Automatic Triggers
- **First Win:** Complete first game
- **High Score:** Beat previous record
- **Story Progress:** Unlock new chapter
- **Lore Hunter:** Collect 5 fragments
- **Master:** Reach level 20
- **Legend:** Reach level 50

---

## 🔐 Security Features

✅ **AccessControl** - Role-based permissions (GAME_SERVER, STORY_WRITER)
✅ **ReentrancyGuard** - Prevents reentrancy attacks
✅ **Input Validation** - All parameters validated
✅ **Event Logging** - Complete audit trail
✅ **Ownership Checks** - Token ownership verified

---

## 🚀 Gas Optimization

- Efficient storage patterns
- Batch operations supported
- Minimal external calls
- Optimized for Avalanche C-Chain
- Average gas per game submission: ~150,000

---

## 📊 Analytics Tracking

### On-Chain Metrics
- Total games played
- Highest score achieved
- Current level
- Story chapters unlocked
- Lore fragments collected

### Off-Chain Metrics (Events)
- Game completion events
- Level up events
- Story progression events
- Lore discovery events

---

## 🎉 What This System Provides

✅ **4 Unique Character Classes** with distinct playstyles
✅ **5 Story Arcs** with multiple chapters each
✅ **Dynamic Progression** - Characters evolve with player skill
✅ **Lore Collection** - Discoverable narrative fragments
✅ **Class-Based Scoring** - Each class scores differently
✅ **Story-Driven Gameplay** - Narrative unlocks tied to performance
✅ **NFT Evolution** - Metadata updates with character progress
✅ **Combo & Streak Systems** - Rewarding skilled play
✅ **Achievement Integration** - Built-in milestone tracking
✅ **Full Documentation** - Complete implementation guide

---

**Total Code:** ~800 lines of Solidity + 350 lines of TypeScript

**Built for Avalanche Rush** 🏔️⚡🎮
