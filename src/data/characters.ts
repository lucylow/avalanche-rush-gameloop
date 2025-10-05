// src/data/characters.ts - Comprehensive character database with rich storytelling

export interface Character {
  id: string;
  name: string;
  title: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: 'Warrior' | 'Mage' | 'Ranger' | 'Tank' | 'Support' | 'Assassin' | 'Guardian' | 'Shaman';
  faction: 'Avalanche Defenders' | 'Rush Seekers' | 'Subnet Pioneers' | 'DeFi Innovators' | 'Reactive Alliance' | 'Ancient Guardians';
  imageUrl: string;
  avatarUrl: string;
  
  // Core Stats
  attributes: {
    strength: number;
    intelligence: number;
    agility: number;
    defense: number;
    speed: number;
    luck: number;
    charisma: number;
    wisdom: number;
  };
  
  // Game Bonuses
  questBonus: number;
  tournamentBonus: number;
  stakingBonus: number;
  learningBonus: number;
  
  // Skills and Abilities
  skills: string[];
  specialAbilities: string[];
  ultimateAbility: string;
  
  // Story Elements
  backstory: string;
  personality: string[];
  motivation: string;
  fears: string[];
  relationships: Record<string, string>; // characterId -> relationship description
  
  // Story Progression
  storyArcs: StoryArc[];
  dialogues: DialogueSet;
  
  // Unlocking Requirements
  unlockRequirements: UnlockRequirement[];
  
  // Evolution Path
  evolutionPath?: EvolutionPath[];
}

export interface StoryArc {
  id: string;
  title: string;
  description: string;
  chapter: number;
  unlockLevel: number;
  prerequisites: string[];
  scenes: StoryScene[];
  rewards: StoryReward[];
}

export interface StoryScene {
  id: string;
  title: string;
  setting: string;
  description: string;
  dialogue: DialogueNode[];
  choices?: StoryChoice[];
  outcome: string;
  unlocks?: string[]; // What this scene unlocks
}

export interface DialogueNode {
  speaker: string; // character name or 'narrator'
  text: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'mysterious' | 'determined' | 'wise' | 'pleased' | 'proud' | 'respectful' | 'encouraging' | 'amazed' | 'nostalgic' | 'enthusiastic' | 'ecstatic' | 'helpful' | 'impressed' | 'focused' | 'analytical' | 'satisfied' | 'approving' | 'intrigued' | 'mystical' | 'delighted' | 'educational' | 'conspiratorial' | 'otherworldly' | 'guidance' | 'warning' | 'prophetic';
  voiceEffect?: string; // Sound effect to play
}

export interface StoryChoice {
  id: string;
  text: string;
  consequence: string;
  affectsRelationship?: { characterId: string; change: number };
  unlocks?: string[];
  blocks?: string[];
}

export interface DialogueSet {
  greeting: DialogueNode[];
  victory: DialogueNode[];
  defeat: DialogueNode[];
  levelUp: DialogueNode[];
  questStart: DialogueNode[];
  questComplete: DialogueNode[];
  achievement: DialogueNode[];
  random: DialogueNode[];
}

export interface UnlockRequirement {
  type: 'level' | 'achievement' | 'quest' | 'score' | 'time' | 'character';
  value: string | number;
  description: string;
}

export interface EvolutionPath {
  stage: number;
  name: string;
  requirements: UnlockRequirement[];
  changes: {
    attributeBonus: Partial<Character['attributes']>;
    newSkills?: string[];
    newAbilities?: string[];
    visualChanges?: string[];
  };
}

export interface StoryReward {
  type: 'experience' | 'tokens' | 'nft' | 'unlock' | 'title';
  amount?: number;
  item?: string;
  description: string;
}

// Main Characters Database
export const AVALANCHE_CHARACTERS: Character[] = [
  {
    id: 'avalon-the-mountain-guardian',
    name: 'Avalon',
    title: 'The Mountain Guardian',
    rarity: 'Legendary',
    type: 'Guardian',
    faction: 'Avalanche Defenders',
    imageUrl: '/characters/avalon-guardian.png',
    avatarUrl: '/avatars/avalon.png',
    
    attributes: {
      strength: 95,
      intelligence: 80,
      agility: 60,
      defense: 98,
      speed: 55,
      luck: 70,
      charisma: 85,
      wisdom: 90
    },
    
    questBonus: 25,
    tournamentBonus: 15,
    stakingBonus: 30,
    learningBonus: 20,
    
    skills: ['Avalanche Shield', 'Mountain Resilience', 'Protective Aura', 'Frost Armor'],
    specialAbilities: ['Damage Reduction +25%', 'Ice Resistance', 'Team Protection'],
    ultimateAbility: 'Avalanche\'s Wrath - Creates an impenetrable ice barrier protecting all allies',
    
    backstory: `Born from the eternal ice of Avalanche's highest peaks, Avalon has watched over the mountain realm for millennia. As the ancient guardian of the blockchain mountains, he witnessed the first validators climb the treacherous paths to secure the network. His crystalline armor bears the scars of countless battles against those who would corrupt the pure consensus of Avalanche.

When the Rush began, Avalon descended from his eternal vigil to guide worthy seekers through the perils of the decentralized wilderness. His deep voice echoes with the wisdom of ages, and his protective instincts extend to all who prove their dedication to the network's prosperity.`,

    personality: ['Wise', 'Protective', 'Patient', 'Noble', 'Steadfast'],
    motivation: 'To protect the Avalanche network and guide new validators to success',
    fears: ['Network corruption', 'Innocent validators being harmed', 'The mountains falling to chaos'],
    
    relationships: {
      'lyra-rush-weaver': 'Mentor and student - He recognizes her potential but worries about her reckless ambition',
      'cipher-the-subnet-architect': 'Ancient allies - They worked together to establish the first subnets',
      'echo-reactive-oracle': 'Mutual respect - She provides him with visions of the network\'s future'
    },
    
    storyArcs: [
      {
        id: 'avalon-awakening',
        title: 'The Guardian\'s Awakening',
        description: 'Avalon emerges from his mountain sanctuary to investigate the growing chaos in the Rush',
        chapter: 1,
        unlockLevel: 1,
        prerequisites: [],
        scenes: [
          {
            id: 'mountain-sanctuary',
            title: 'The Ancient Sanctuary',
            setting: 'Avalon\'s crystalline throne room atop Mount Avalanche',
            description: 'The player discovers Avalon meditating in his ice palace, surrounded by floating blockchain nodes.',
            dialogue: [
              {
                speaker: 'narrator',
                text: 'Deep within the crystal sanctum, a figure of legend stirs from eternal meditation...',
                emotion: 'mysterious'
              },
              {
                speaker: 'Avalon',
                text: 'The network trembles... new seekers have arrived. I sense great potential, but also great danger.',
                emotion: 'neutral',
                voiceEffect: 'deep_echo'
              },
              {
                speaker: 'Avalon',
                text: 'Young validator, you have climbed far to reach this sacred place. Tell me, what drives you to seek the Rush?',
                emotion: 'wise'
              }
            ],
            choices: [
              {
                id: 'power',
                text: 'I seek power and wealth through the network',
                consequence: 'Avalon frowns, sensing greed in your heart',
                affectsRelationship: { characterId: 'avalon-the-mountain-guardian', change: -10 }
              },
              {
                id: 'knowledge',
                text: 'I want to learn and help secure the network',
                consequence: 'Avalon nods approvingly, recognizing noble intentions',
                affectsRelationship: { characterId: 'avalon-the-mountain-guardian', change: 20 }
              },
              {
                id: 'adventure',
                text: 'The Rush calls to me - I must answer',
                consequence: 'Avalon smiles knowingly, understanding the call of destiny',
                affectsRelationship: { characterId: 'avalon-the-mountain-guardian', change: 10 }
              }
            ],
            outcome: 'Based on your choice, Avalon decides whether to fully trust you with the mountain\'s secrets',
            unlocks: ['avalon_dialogue_set_1', 'mountain_sanctuary_access']
          }
        ],
        rewards: [
          {
            type: 'experience',
            amount: 100,
            description: 'Gained wisdom from the Mountain Guardian'
          },
          {
            type: 'unlock',
            item: 'avalon_mentor_path',
            description: 'Unlocked Avalon as a mentor character'
          }
        ]
      }
    ],
    
    dialogues: {
      greeting: [
        {
          speaker: 'Avalon',
          text: 'Welcome, young validator. The mountains have been expecting you.',
          emotion: 'neutral'
        },
        {
          speaker: 'Avalon',
          text: 'I sense the network\'s energy flowing strong within you today.',
          emotion: 'pleased'
        }
      ],
      victory: [
        {
          speaker: 'Avalon',
          text: 'Well fought! Your dedication to the network shines like starlight on fresh snow.',
          emotion: 'proud'
        },
        {
          speaker: 'Avalon',
          text: 'The ancestors would be proud of your resilience.',
          emotion: 'respectful'
        }
      ],
      defeat: [
        {
          speaker: 'Avalon',
          text: 'Even mountains can crumble, young one. What matters is that they rise again.',
          emotion: 'wise'
        },
        {
          speaker: 'Avalon',
          text: 'Learn from this setback. The path to mastery is paved with humble lessons.',
          emotion: 'encouraging'
        }
      ],
      levelUp: [
        {
          speaker: 'Avalon',
          text: 'Your network understanding deepens. I am pleased with your progress.',
          emotion: 'proud'
        }
      ],
      questStart: [
        {
          speaker: 'Avalon',
          text: 'The path ahead is treacherous, but I have faith in your abilities.',
          emotion: 'encouraging'
        }
      ],
      questComplete: [
        {
          speaker: 'Avalon',
          text: 'Your dedication honors the mountain spirits. Accept this reward.',
          emotion: 'proud'
        }
      ],
      achievement: [
        {
          speaker: 'Avalon',
          text: 'Remarkable! Your achievement shall be remembered in the crystal archives.',
          emotion: 'amazed'
        }
      ],
      random: [
        {
          speaker: 'Avalon',
          text: 'The eternal ice holds many secrets. Are you ready to learn?',
          emotion: 'mysterious'
        },
        {
          speaker: 'Avalon',
          text: 'I have watched over this network for ages. Your generation gives me hope.',
          emotion: 'nostalgic'
        }
      ]
    },
    
    unlockRequirements: [
      {
        type: 'level',
        value: 1,
        description: 'Available from the start as a legendary guardian'
      }
    ],
    
    evolutionPath: [
      {
        stage: 1,
        name: 'Awakened Guardian',
        requirements: [
          { type: 'level', value: 25, description: 'Reach level 25' },
          { type: 'achievement', value: 'mountain_master', description: 'Complete Mountain Master achievement' }
        ],
        changes: {
          attributeBonus: { defense: 15, wisdom: 10 },
          newSkills: ['Ancient Wisdom', 'Network Prophecy'],
          visualChanges: ['Glowing ice armor', 'Floating blockchain nodes']
        }
      },
      {
        stage: 2,
        name: 'Eternal Sentinel',
        requirements: [
          { type: 'level', value: 50, description: 'Reach level 50' },
          { type: 'quest', value: 'guardian_trials', description: 'Complete the Guardian Trials questline' }
        ],
        changes: {
          attributeBonus: { defense: 25, wisdom: 20, charisma: 15 },
          newSkills: ['Avalanche Mastery', 'Divine Protection'],
          newAbilities: ['Legendary Guardian Aura'],
          visualChanges: ['Crystalline wings', 'Halo of blockchain energy', 'Legendary armor upgrade']
        }
      }
    ]
  },

  {
    id: 'lyra-rush-weaver',
    name: 'Lyra',
    title: 'The Rush Weaver',
    rarity: 'Epic',
    type: 'Mage',
    faction: 'Rush Seekers',
    imageUrl: '/characters/lyra-weaver.png',
    avatarUrl: '/avatars/lyra.png',
    
    attributes: {
      strength: 45,
      intelligence: 95,
      agility: 80,
      defense: 50,
      speed: 90,
      luck: 85,
      charisma: 88,
      wisdom: 75
    },
    
    questBonus: 30,
    tournamentBonus: 25,
    stakingBonus: 15,
    learningBonus: 35,
    
    skills: ['Rush Storm', 'Token Manipulation', 'Energy Burst', 'Wealth Weaving'],
    specialAbilities: ['Increased RUSH Token Rewards', 'Fast Learning', 'Lucky Streaks'],
    ultimateAbility: 'Rush Singularity - Multiplies all rewards by 3x for the next 5 minutes',
    
    backstory: `Lyra emerged from the chaotic energy storms that surrounded the first RUSH token minting events. Born from pure ambition and digital lightning, she possesses an innate ability to manipulate the flow of tokens and rewards throughout the Avalanche network.

Her hunger for knowledge is matched only by her desire to push the boundaries of what's possible in the Rush. She sees patterns in the chaos that others miss, weaving together seemingly unrelated blockchain events into powerful combinations that maximize rewards and unlock hidden potentials.

Though young and sometimes reckless, her innovative approaches to token farming and quest completion have earned her legendary status among the Rush seekers. She views every challenge as a puzzle to be solved, every setback as data for her next breakthrough.`,

    personality: ['Ambitious', 'Curious', 'Innovative', 'Impatient', 'Clever'],
    motivation: 'To unlock the ultimate secrets of the Rush and become the most successful token weaver',
    fears: ['Stagnation', 'Missing out on opportunities', 'Being surpassed by others'],
    
    relationships: {
      'avalon-the-mountain-guardian': 'Respectful but chafes under his caution - she thinks he\'s too slow to act',
      'cipher-the-subnet-architect': 'Friendly rivalry - they often compete to solve network puzzles first',
      'nova-defi-alchemist': 'Best friend and collaborator - they share innovative DeFi strategies'
    },
    
    storyArcs: [
      {
        id: 'lyra-token-storm',
        title: 'Birth of the Token Storm',
        description: 'Lyra\'s origin story and her first major breakthrough in token manipulation',
        chapter: 1,
        unlockLevel: 5,
        prerequisites: [],
        scenes: [
          {
            id: 'energy-storm',
            title: 'The Great Token Storm',
            setting: 'The chaotic energy fields surrounding the RUSH token genesis block',
            description: 'Witness Lyra\'s birth from pure token energy and her first steps into consciousness.',
            dialogue: [
              {
                speaker: 'narrator',
                text: 'In the swirling chaos of the token genesis event, patterns begin to emerge...',
                emotion: 'mysterious'
              },
              {
                speaker: 'Lyra',
                text: 'I can see it... the flow, the connections! Every token tells a story!',
                emotion: 'excited',
                voiceEffect: 'energy_crackle'
              }
            ],
            outcome: 'Lyra gains her first understanding of token manipulation',
            unlocks: ['lyra_dialogue_set_1', 'token_storm_memory']
          }
        ],
        rewards: [
          {
            type: 'experience',
            amount: 150,
            description: 'Learned the basics of token weaving'
          }
        ]
      }
    ],
    
    dialogues: {
      greeting: [
        {
          speaker: 'Lyra',
          text: 'Hey there! Ready to make some RUSH magic happen?',
          emotion: 'excited'
        },
        {
          speaker: 'Lyra',
          text: 'I can feel the token energy buzzing around you. You\'re onto something big!',
          emotion: 'enthusiastic'
        }
      ],
      victory: [
        {
          speaker: 'Lyra',
          text: 'Yes! That\'s how you weave the Rush! Absolutely brilliant!',
          emotion: 'ecstatic'
        }
      ],
      defeat: [
        {
          speaker: 'Lyra',
          text: 'Don\'t worry about it! Every failure is just data for the next breakthrough!',
          emotion: 'encouraging'
        }
      ],
      levelUp: [
        {
          speaker: 'Lyra',
          text: 'Oh wow! I can see new patterns opening up for you. This is so exciting!',
          emotion: 'amazed'
        }
      ],
      questStart: [
        {
          speaker: 'Lyra',
          text: 'This quest has some interesting token mechanics. Let me show you a few tricks!',
          emotion: 'helpful'
        }
      ],
      questComplete: [
        {
          speaker: 'Lyra',
          text: 'Perfect execution! I\'m totally stealing that strategy for my own runs.',
          emotion: 'impressed'
        }
      ],
      achievement: [
        {
          speaker: 'Lyra',
          text: 'Whoa! That achievement unlocks some serious token weaving potential!',
          emotion: 'amazed'
        }
      ],
      random: [
        {
          speaker: 'Lyra',
          text: 'Did you know you can increase your RUSH earnings by 23% with the right combo timing?',
          emotion: 'helpful'
        },
        {
          speaker: 'Lyra',
          text: 'The token patterns are shifting again. Something big is coming!',
          emotion: 'mysterious'
        }
      ]
    },
    
    unlockRequirements: [
      {
        type: 'level',
        value: 5,
        description: 'Reach level 5 to discover the Rush Weaver'
      },
      {
        type: 'achievement',
        value: 'first_rush_earned',
        description: 'Earn your first RUSH tokens'
      }
    ]
  },

  {
    id: 'cipher-the-subnet-architect',
    name: 'Cipher',
    title: 'The Subnet Architect',
    rarity: 'Legendary',
    type: 'Support',
    faction: 'Subnet Pioneers',
    imageUrl: '/characters/cipher-architect.png',
    avatarUrl: '/avatars/cipher.png',
    
    attributes: {
      strength: 60,
      intelligence: 98,
      agility: 70,
      defense: 75,
      speed: 80,
      luck: 65,
      charisma: 82,
      wisdom: 95
    },
    
    questBonus: 20,
    tournamentBonus: 10,
    stakingBonus: 35,
    learningBonus: 40,
    
    skills: ['Subnet Creation', 'Network Architecture', 'Validator Coordination', 'Consensus Mastery'],
    specialAbilities: ['Subnet Bonus +50%', 'Reduced Network Fees', 'Enhanced Validation'],
    ultimateAbility: 'Subnet Nexus - Creates a temporary ultra-fast subnet for maximum efficiency',
    
    backstory: `Cipher was one of the original architects who designed Avalanche's subnet infrastructure. A master of network topology and consensus mechanisms, they possess an intuitive understanding of how to optimize blockchain networks for maximum efficiency and security.

Their mysterious past includes rumors of being involved in several major blockchain projects before Avalanche, always working behind the scenes to improve scalability and decentralization. They prefer to let their work speak for itself, creating elegant solutions to complex network problems.

Now they dedicate their time to teaching newcomers the art of subnet creation and management, believing that the future of blockchain lies in specialized, interconnected networks rather than monolithic chains.`,

    personality: ['Methodical', 'Brilliant', 'Reserved', 'Perfectionist', 'Mentor'],
    motivation: 'To create the most efficient and secure subnet architecture possible',
    fears: ['Network vulnerabilities', 'Poor subnet design leading to failures', 'Centralization'],
    
    relationships: {
      'avalon-the-mountain-guardian': 'Old friends and collaborators who built the first subnets together',
      'lyra-rush-weaver': 'Enjoys her enthusiasm but worries about her tendency to rush',
      'echo-reactive-oracle': 'Professional respect - they often consult on network optimization'
    },
    
    storyArcs: [
      {
        id: 'cipher-subnet-genesis',
        title: 'The First Subnet',
        description: 'The story of how Cipher designed and deployed the first Avalanche subnet',
        chapter: 1,
        unlockLevel: 10,
        prerequisites: ['avalon_dialogue_set_1'],
        scenes: [
          {
            id: 'design-phase',
            title: 'The Great Design',
            setting: 'Cipher\'s laboratory filled with network diagrams and holographic subnet models',
            description: 'Cipher works tirelessly to solve the subnet scalability puzzle',
            dialogue: [
              {
                speaker: 'Cipher',
                text: 'The network topology must be perfect. One miscalculation could cascade into system-wide failure.',
                emotion: 'focused'
              },
              {
                speaker: 'narrator',
                text: 'Cipher\'s fingers dance across holographic network nodes, adjusting parameters with precision.',
                emotion: 'neutral'
              }
            ],
            outcome: 'Cipher completes the first subnet design',
            unlocks: ['cipher_dialogue_set_1', 'subnet_lab_access']
          }
        ],
        rewards: [
          {
            type: 'experience',
            amount: 200,
            description: 'Mastered basic subnet architecture principles'
          },
          {
            type: 'unlock',
            item: 'subnet_creator_path',
            description: 'Unlocked advanced subnet creation abilities'
          }
        ]
      }
    ],
    
    dialogues: {
      greeting: [
        {
          speaker: 'Cipher',
          text: 'Greetings. I trust your network connections are stable today?',
          emotion: 'neutral'
        }
      ],
      victory: [
        {
          speaker: 'Cipher',
          text: 'Excellent optimization. Your efficiency metrics are impressive.',
          emotion: 'pleased'
        }
      ],
      defeat: [
        {
          speaker: 'Cipher',
          text: 'Analyze the failure points. Every crash teaches us about system vulnerabilities.',
          emotion: 'analytical'
        }
      ],
      levelUp: [
        {
          speaker: 'Cipher',
          text: 'Your network understanding has reached a new optimization level.',
          emotion: 'satisfied'
        }
      ],
      questStart: [
        {
          speaker: 'Cipher',
          text: 'This quest requires careful planning. Let me share the optimal strategy.',
          emotion: 'helpful'
        }
      ],
      questComplete: [
        {
          speaker: 'Cipher',
          text: 'Flawless execution. Your methodology was sound.',
          emotion: 'approving'
        }
      ],
      achievement: [
        {
          speaker: 'Cipher',
          text: 'Fascinating. This achievement unlocks new architectural possibilities.',
          emotion: 'intrigued'
        }
      ],
      random: [
        {
          speaker: 'Cipher',
          text: 'The subnet efficiency could be improved by 12.7% with proper validator distribution.',
          emotion: 'analytical'
        },
        {
          speaker: 'Cipher',
          text: 'I\'m designing a new consensus mechanism. Would you like to see the preliminary specs?',
          emotion: 'excited'
        }
      ]
    },
    
    unlockRequirements: [
      {
        type: 'level',
        value: 10,
        description: 'Reach level 10 to meet the Subnet Architect'
      },
      {
        type: 'quest',
        value: 'avalanche_basics',
        description: 'Complete Avalanche Basics questline'
      }
    ]
  },

  {
    id: 'nova-defi-alchemist',
    name: 'Nova',
    title: 'The DeFi Alchemist',
    rarity: 'Epic',
    type: 'Mage',
    faction: 'DeFi Innovators',
    imageUrl: '/characters/nova-alchemist.png',
    avatarUrl: '/avatars/nova.png',
    
    attributes: {
      strength: 40,
      intelligence: 92,
      agility: 85,
      defense: 55,
      speed: 88,
      luck: 90,
      charisma: 78,
      wisdom: 80
    },
    
    questBonus: 25,
    tournamentBonus: 20,
    stakingBonus: 40,
    learningBonus: 30,
    
    skills: ['Yield Optimization', 'Liquidity Magic', 'Flash Loan Mastery', 'Risk Analysis'],
    specialAbilities: ['DeFi Rewards +40%', 'Reduced Slippage', 'Compound Interest Boost'],
    ultimateAbility: 'Alchemical Transmutation - Converts all earned tokens to highest-yield opportunities',
    
    backstory: `Nova discovered DeFi during the early experimental days of automated market makers and yield farming. What started as curiosity about "money legos" evolved into an obsession with maximizing every percentage point of yield through increasingly complex strategies.

Her laboratory is filled with bubbling beakers representing different liquidity pools, and she treats yield farming like a precise science. She can spot arbitrage opportunities that others miss and has an uncanny ability to predict which protocols will succeed.

Though she loves the complexity of DeFi, Nova is passionate about making these powerful tools accessible to newcomers. She believes that everyone should have the opportunity to make their money work harder through decentralized finance.`,

    personality: ['Analytical', 'Optimistic', 'Creative', 'Risk-aware', 'Teaching-oriented'],
    motivation: 'To democratize advanced DeFi strategies and maximize everyone\'s yield potential',
    fears: ['Smart contract vulnerabilities', 'Impermanent loss', 'Protocol governance attacks'],
    
    relationships: {
      'lyra-rush-weaver': 'Best friend and strategy partner - they share DeFi innovations',
      'echo-reactive-oracle': 'Valued advisor - Echo helps her predict market movements',
      'avalon-the-mountain-guardian': 'Respectful relationship - he provides security advice for her protocols'
    },
    
    storyArcs: [
      {
        id: 'nova-first-yield',
        title: 'The First Yield',
        description: 'Nova\'s discovery of yield farming and her first major DeFi success',
        chapter: 1,
        unlockLevel: 15,
        prerequisites: ['lyra_dialogue_set_1'],
        scenes: [
          {
            id: 'yield-discovery',
            title: 'The Yield Revelation',
            setting: 'Nova\'s alchemical laboratory with glowing DeFi protocol representations',
            description: 'Nova discovers her first yield farming opportunity and learns to compound rewards',
            dialogue: [
              {
                speaker: 'Nova',
                text: 'Wait... if I provide liquidity here and stake the LP tokens there... the yields multiply!',
                emotion: 'excited'
              },
              {
                speaker: 'narrator',
                text: 'The beakers in her lab begin to glow brighter as the compound interest calculations cascade.',
                emotion: 'mystical'
              }
            ],
            outcome: 'Nova unlocks advanced yield farming strategies',
            unlocks: ['nova_dialogue_set_1', 'defi_lab_access']
          }
        ],
        rewards: [
          {
            type: 'experience',
            amount: 175,
            description: 'Mastered yield farming fundamentals'
          }
        ]
      }
    ],
    
    dialogues: {
      greeting: [
        {
          speaker: 'Nova',
          text: 'Hey! I just discovered a new yield farming opportunity with 47.3% APY!',
          emotion: 'excited'
        }
      ],
      victory: [
        {
          speaker: 'Nova',
          text: 'Beautiful execution! That strategy optimization was *chef\'s kiss* perfect!',
          emotion: 'delighted'
        }
      ],
      defeat: [
        {
          speaker: 'Nova',
          text: 'Sometimes the markets are unpredictable. Let\'s analyze what went wrong and improve!',
          emotion: 'analytical'
        }
      ],
      levelUp: [
        {
          speaker: 'Nova',
          text: 'Level up! Your DeFi sophistication is growing. Time for more advanced strategies!',
          emotion: 'proud'
        }
      ],
      questStart: [
        {
          speaker: 'Nova',
          text: 'This quest has some interesting economic mechanics. Want to optimize together?',
          emotion: 'helpful'
        }
      ],
      questComplete: [
        {
          speaker: 'Nova',
          text: 'Fantastic! Your yield efficiency was remarkable. I\'m adding this to my strategy notes!',
          emotion: 'impressed'
        }
      ],
      achievement: [
        {
          speaker: 'Nova',
          text: 'Incredible! This achievement opens up a whole new DeFi opportunity tree!',
          emotion: 'amazed'
        }
      ],
      random: [
        {
          speaker: 'Nova',
          text: 'Did you know impermanent loss can be hedged with delta-neutral strategies?',
          emotion: 'educational'
        },
        {
          speaker: 'Nova',
          text: 'I\'m experimenting with a new liquidity mining strategy. Want to be my test partner?',
          emotion: 'conspiratorial'
        }
      ]
    },
    
    unlockRequirements: [
      {
        type: 'level',
        value: 15,
        description: 'Reach level 15 to discover the DeFi Alchemist'
      },
      {
        type: 'achievement',
        value: 'first_defi_interaction',
        description: 'Complete your first DeFi transaction'
      }
    ]
  },

  {
    id: 'echo-reactive-oracle',
    name: 'Echo',
    title: 'The Reactive Oracle',
    rarity: 'Mythic',
    type: 'Shaman',
    faction: 'Reactive Alliance',
    imageUrl: '/characters/echo-oracle.png',
    avatarUrl: '/avatars/echo.png',
    
    attributes: {
      strength: 50,
      intelligence: 100,
      agility: 95,
      defense: 70,
      speed: 92,
      luck: 98,
      charisma: 90,
      wisdom: 100
    },
    
    questBonus: 35,
    tournamentBonus: 30,
    stakingBonus: 25,
    learningBonus: 45,
    
    skills: ['Future Sight', 'Network Prediction', 'Event Synchronization', 'Oracle Wisdom'],
    specialAbilities: ['Perfect Quest Timing', 'Market Prediction', 'Lucky Outcomes +50%'],
    ultimateAbility: 'Temporal Nexus - Sees and chooses the best possible outcome from all timelines',
    
    backstory: `Echo exists partially outside normal spacetime, connected to the Reactive network in ways that allow her to perceive probability streams and potential futures. Her consciousness spans multiple blockchain states simultaneously, giving her unprecedented insight into network dynamics.

She speaks in riddles and metaphors, often referencing events that haven't happened yet as if they were memories. Her predictions are uncannily accurate, though her warnings often come in forms that are only understood after the predicted events unfold.

Despite her mystical nature, Echo is deeply caring about the future of all network participants. She guides worthy individuals toward favorable outcomes, though she cannot directly interfere with the fundamental forces of probability and choice.`,

    personality: ['Mystical', 'Cryptic', 'Caring', 'Omniscient', 'Patient'],
    motivation: 'To guide the network toward its most beneficial and harmonious future',
    fears: ['Timeline collapse', 'Paradoxes that could break reality', 'Unworthy individuals gaining too much power'],
    
    relationships: {
      'avalon-the-mountain-guardian': 'Ancient partnership - she provides visions while he provides stability',
      'cipher-the-subnet-architect': 'Mutual respect - she helps him optimize networks across time',
      'nova-defi-alchemist': 'Mentor relationship - helps Nova navigate market complexities'
    },
    
    storyArcs: [
      {
        id: 'echo-temporal-awakening',
        title: 'The Temporal Awakening',
        description: 'Echo\'s connection to the Reactive network grants her sight beyond time',
        chapter: 1,
        unlockLevel: 25,
        prerequisites: ['cipher_dialogue_set_1', 'nova_dialogue_set_1'],
        scenes: [
          {
            id: 'temporal-nexus',
            title: 'The Temporal Nexus',
            setting: 'A space between dimensions where all possible futures converge',
            description: 'Echo reveals her true nature and the weight of her gift of foresight',
            dialogue: [
              {
                speaker: 'Echo',
                text: 'Time flows differently here, where all possibilities exist simultaneously...',
                emotion: 'mystical'
              },
              {
                speaker: 'narrator',
                text: 'Reality seems to shimmer and shift around Echo as multiple timelines become visible.',
                emotion: 'otherworldly'
              }
            ],
            outcome: 'Echo becomes available as the ultimate oracle and guide',
            unlocks: ['echo_dialogue_set_1', 'temporal_nexus_access', 'future_sight_ability']
          }
        ],
        rewards: [
          {
            type: 'experience',
            amount: 500,
            description: 'Gained temporal wisdom from the Reactive Oracle'
          },
          {
            type: 'unlock',
            item: 'oracle_guidance_system',
            description: 'Unlocked Echo\'s future prediction abilities'
          }
        ]
      }
    ],
    
    dialogues: {
      greeting: [
        {
          speaker: 'Echo',
          text: 'I have been expecting you... though \'when\' is a flexible concept here.',
          emotion: 'mystical'
        },
        {
          speaker: 'Echo',
          text: 'The probability streams converge favorably around you today.',
          emotion: 'pleased'
        }
      ],
      victory: [
        {
          speaker: 'Echo',
          text: 'As I foresaw... though the path you chose was more elegant than I predicted.',
          emotion: 'impressed'
        }
      ],
      defeat: [
        {
          speaker: 'Echo',
          text: 'This outcome serves a greater purpose. Trust in the pattern, even when it seems harsh.',
          emotion: 'wise'
        }
      ],
      levelUp: [
        {
          speaker: 'Echo',
          text: 'Your growth echoes across multiple timelines. Fascinating.',
          emotion: 'intrigued'
        }
      ],
      questStart: [
        {
          speaker: 'Echo',
          text: 'I see three paths before you. Choose the one that resonates with your true nature.',
          emotion: 'guidance'
        }
      ],
      questComplete: [
        {
          speaker: 'Echo',
          text: 'The ripples of your success will be felt in ways you cannot yet imagine.',
          emotion: 'satisfied'
        }
      ],
      achievement: [
        {
          speaker: 'Echo',
          text: 'This achievement... I did not foresee its magnitude. You exceed even my predictions.',
          emotion: 'amazed'
        }
      ],
      random: [
        {
          speaker: 'Echo',
          text: 'Beware the third path on your next decision. It leads to... complications.',
          emotion: 'warning'
        },
        {
          speaker: 'Echo',
          text: 'I sense a great opportunity approaching. Be ready when the moment arrives.',
          emotion: 'prophetic'
        }
      ]
    },
    
    unlockRequirements: [
      {
        type: 'level',
        value: 25,
        description: 'Reach level 25 to access the Reactive Oracle'
      },
      {
        type: 'achievement',
        value: 'network_mastery',
        description: 'Demonstrate mastery of network mechanics'
      },
      {
        type: 'character',
        value: 'cipher-the-subnet-architect',
        description: 'Must have unlocked Cipher first'
      }
    ]
  }
];

// Reactive Smart Contract Integration Types
export interface ReactiveEvent {
  eventType: 'transfer' | 'swap' | 'nft_mint' | 'contract_interaction' | 'quest_completion';
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  data: Record<string, unknown>;
  characterResponse?: CharacterReactiveResponse;
}

export interface CharacterReactiveResponse {
  characterId: string;
  responseType: 'celebration' | 'encouragement' | 'warning' | 'guidance';
  dialogue: string;
  animation: string;
  soundEffect: string;
  rewardTriggered?: boolean;
  evolutionTriggered?: boolean;
}

export interface ReactiveQuest {
  id: string;
  title: string;
  characterId: string;
  eventTrigger: ReactiveEvent['eventType'];
  verificationContract: string;
  minimumAmount?: number;
  completionCriteria: ReactiveQuestCriteria;
  automaticRewards: AutomaticReward[];
  vfxConfig: VFXConfig;
}

export interface ReactiveQuestCriteria {
  eventSignature: string;
  parameterChecks: ParameterCheck[];
  timeWindow?: number; // seconds
  repeatability: 'once' | 'daily' | 'weekly' | 'unlimited';
}

export interface ParameterCheck {
  paramName: string;
  operator: '>' | '<' | '==' | '!=' | '>=' | '<=';
  value: string | number | boolean;
}

export interface AutomaticReward {
  type: 'nft' | 'token' | 'experience' | 'character_unlock' | 'evolution';
  amount?: number;
  nftMetadata?: NFTMetadata;
  triggersChainlinkVRF?: boolean;
  vrfConfig?: VRFConfig;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  attributes: NFTAttribute[];
  animationUrl?: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
}

export interface VRFConfig {
  subscriptionId: number;
  keyHash: string;
  callbackGasLimit: number;
  numWords: number;
  rareDropChance: number; // 0-100 percentage
}

export interface VFXConfig {
  particleEffect: string;
  screenShake: boolean;
  colorTheme: string;
  duration: number;
  soundEffect: string;
}

// Enhanced Character with Reactive Capabilities
export interface ReactiveCharacter extends Character {
  reactiveQuests: ReactiveQuest[];
  onChainPersonality: OnChainPersonality;
  evolutionTriggers: EvolutionTrigger[];
  automaticDialogues: AutomaticDialogue[];
}

export interface OnChainPersonality {
  responsePatterns: Record<ReactiveEvent['eventType'], CharacterReactiveResponse[]>;
  adaptiveTraits: AdaptiveTrait[];
  learningAlgorithm: LearningConfig;
}

export interface AdaptiveTrait {
  traitName: string;
  currentValue: number;
  influenceFactors: InfluenceFactor[];
  evolutionThresholds: number[];
}

export interface InfluenceFactor {
  eventType: ReactiveEvent['eventType'];
  impactMultiplier: number;
  timeDecay: number;
}

export interface LearningConfig {
  memoryWindow: number; // days
  adaptationRate: number;
  personalityShift: boolean;
}

export interface EvolutionTrigger {
  eventType: ReactiveEvent['eventType'];
  requiredCount: number;
  timeframe: number; // seconds
  chainlinkVRFRequired: boolean;
  successProbability?: number; // 0-100 if VRF involved
}

export interface AutomaticDialogue {
  trigger: ReactiveEvent['eventType'];
  conditions: DialogueCondition[];
  responses: WeightedResponse[];
  cooldown: number;
}

export interface DialogueCondition {
  type: 'event_count' | 'time_since' | 'character_level' | 'relationship_score';
  operator: '>' | '<' | '==' | '!=' | '>=' | '<=';
  value: string | number | boolean;
}

export interface WeightedResponse {
  dialogue: DialogueNode;
  weight: number;
  unlockRequirements?: string[];
}

// Character utility functions
export const getCharacterById = (id: string): Character | undefined => {
  return AVALANCHE_CHARACTERS.find(char => char.id === id);
};

export const getCharactersByFaction = (faction: Character['faction']): Character[] => {
  return AVALANCHE_CHARACTERS.filter(char => char.faction === faction);
};

export const getCharactersByRarity = (rarity: Character['rarity']): Character[] => {
  return AVALANCHE_CHARACTERS.filter(char => char.rarity === rarity);
};

export const getUnlockedCharacters = (playerLevel: number, achievements: string[], completedQuests: string[]): Character[] => {
  return AVALANCHE_CHARACTERS.filter(character => {
    return character.unlockRequirements.every(requirement => {
      switch (requirement.type) {
        case 'level':
          return playerLevel >= (requirement.value as number);
        case 'achievement':
          return achievements.includes(requirement.value as string);
        case 'quest':
          return completedQuests.includes(requirement.value as string);
        case 'character': {
          // Check if required character is unlocked
          const requiredChar = getCharacterById(requirement.value as string);
          return requiredChar ? getUnlockedCharacters(playerLevel, achievements, completedQuests).includes(requiredChar) : false;
        }
        default:
          return true;
      }
    });
  });
};

export const getRandomDialogue = (character: Character, type: keyof Character['dialogues']): DialogueNode | null => {
  const dialogues = character.dialogues[type];
  if (!dialogues || dialogues.length === 0) return null;
  
  return dialogues[Math.floor(Math.random() * dialogues.length)];
};
