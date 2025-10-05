// src/data/characterQuests.ts - Character-specific quests and storylines

import { Character } from './characters';

export interface CharacterQuest {
  id: string;
  characterId: string;
  title: string;
  description: string;
  longDescription: string;
  chapter: number;
  questType: 'main' | 'side' | 'personal' | 'relationship' | 'evolution';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  
  // Requirements
  prerequisites: QuestPrerequisite[];
  levelRequirement: number;
  relationshipRequirement?: number; // Minimum relationship level needed
  
  // Objectives
  objectives: QuestObjective[];
  
  // Story elements
  startDialogue: string[];
  progressDialogue: Record<string, string[]>; // objectiveId -> dialogue lines
  completionDialogue: string[];
  
  // Rewards
  rewards: QuestReward[];
  
  // Story impact
  relationshipChanges: Record<string, number>; // characterId -> relationship change
  unlocksCharacters?: string[];
  unlocksStories?: string[];
  unlocksFeatures?: string[];
  
  // Timing and availability
  isRepeatable: boolean;
  cooldownDays?: number;
  seasonalAvailability?: string[]; // Available during specific seasons/events
}

export interface QuestPrerequisite {
  type: 'quest' | 'achievement' | 'level' | 'character' | 'story' | 'relationship';
  value: string | number;
  description: string;
}

export interface QuestObjective {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'complete' | 'achieve' | 'interact' | 'explore' | 'survive' | 'score';
  target: string | number;
  current: number;
  isCompleted: boolean;
  isOptional: boolean;
  
  // Tracking
  trackingData?: {
    itemType?: string;
    gameMode?: string;
    minimumScore?: number;
    timeLimit?: number;
    specificActions?: string[];
  };
}

export interface QuestReward {
  type: 'experience' | 'rush_tokens' | 'nft' | 'character_unlock' | 'story_unlock' | 'feature_unlock' | 'cosmetic';
  amount?: number;
  item?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

// Character-specific quest database
export const CHARACTER_QUESTS: CharacterQuest[] = [
  // Avalon's Questline
  {
    id: 'avalon-mountain-guardian-trials',
    characterId: 'avalon-the-mountain-guardian',
    title: 'Trials of the Mountain Guardian',
    description: 'Prove your worth to the ancient guardian of the Avalanche peaks',
    longDescription: `Avalon has watched over the Avalanche network for millennia, but he senses a great challenge approaching. To prepare you for what's to come, he offers to share the ancient trials that all true guardians must face. These trials will test not just your skills, but your dedication to protecting the network and its users.

Each trial represents a fundamental aspect of being a network guardian: Resilience in the face of adversity, wisdom in decision-making, and the strength to protect others even at personal cost.`,
    chapter: 1,
    questType: 'main',
    difficulty: 'hard',
    
    prerequisites: [
      {
        type: 'character',
        value: 'avalon-the-mountain-guardian',
        description: 'Must have unlocked Avalon as a character'
      },
      {
        type: 'relationship',
        value: 30,
        description: 'Must have a relationship score of at least 30 with Avalon'
      }
    ],
    levelRequirement: 15,
    relationshipRequirement: 30,
    
    objectives: [
      {
        id: 'trial-resilience',
        title: 'Trial of Resilience',
        description: 'Complete 3 games without losing all your lives',
        type: 'survive',
        target: 3,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['complete_game_with_lives_remaining']
        }
      },
      {
        id: 'trial-wisdom',
        title: 'Trial of Wisdom',
        description: 'Make 5 perfect timing decisions in avalanche scenarios',
        type: 'achieve',
        target: 5,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['perfect_avalanche_dodge']
        }
      },
      {
        id: 'trial-protection',
        title: 'Trial of Protection',
        description: 'Help 3 other players by sharing guardian wisdom',
        type: 'interact',
        target: 3,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['share_wisdom_with_player']
        }
      },
      {
        id: 'network-meditation',
        title: 'Network Meditation',
        description: 'Spend 10 minutes in the Mountain Sanctuary (optional)',
        type: 'explore',
        target: 600, // 10 minutes in seconds
        current: 0,
        isCompleted: false,
        isOptional: true,
        trackingData: {
          specificActions: ['stay_in_sanctuary']
        }
      }
    ],
    
    startDialogue: [
      "Young seeker, you have shown promise, but greater challenges await.",
      "The mountain spirits have told me of a darkness gathering beyond the peaks.",
      "To face what's coming, you must undergo the trials that forged me into a guardian.",
      "These trials are not mere tests of skill—they will reveal the guardian within you.",
      "Are you ready to begin the path of the Mountain Guardian?"
    ],
    
    progressDialogue: {
      'trial-resilience': [
        "Good. Your resilience grows stronger with each challenge faced.",
        "A true guardian never gives up, even when the path seems impossible."
      ],
      'trial-wisdom': [
        "Excellent timing. Wisdom comes not from age, but from learning to listen.",
        "The mountain teaches us that perfect timing can turn disaster into triumph."
      ],
      'trial-protection': [
        "By helping others, you embody the guardian's true purpose.",
        "A guardian's strength is multiplied when shared with those who need it."
      ],
      'network-meditation': [
        "The sanctuary's ancient energy flows through you. Feel the network's heartbeat.",
        "In stillness, we understand the weight of our responsibilities."
      ]
    },
    
    completionDialogue: [
      "Remarkable. You have completed the trials with honor.",
      "I see in you the same spark that drove me to become the Mountain Guardian.",
      "The network has chosen you as one of its protectors.",
      "Take this ancient blessing—it will serve you in the battles to come.",
      "Remember, young guardian: Our strength comes not from the mountain, but from those we protect."
    ],
    
    rewards: [
      {
        type: 'character_unlock',
        item: 'avalon_guardian_form',
        description: 'Unlocks Avalon\'s Guardian Form evolution'
      },
      {
        type: 'rush_tokens',
        amount: 1000,
        description: 'Guardian\'s Reward'
      },
      {
        type: 'nft',
        item: 'mountain_guardian_blessing',
        rarity: 'epic',
        description: 'Mountain Guardian\'s Blessing NFT'
      },
      {
        type: 'feature_unlock',
        item: 'sanctuary_access',
        description: 'Permanent access to the Mountain Sanctuary'
      }
    ],
    
    relationshipChanges: {
      'avalon-the-mountain-guardian': 50
    },
    
    unlocksStories: ['avalon-ancient-prophecy'],
    unlocksFeatures: ['mountain_sanctuary', 'guardian_meditation'],
    
    isRepeatable: false
  },

  // Lyra's Innovation Questline
  {
    id: 'lyra-rush-innovation-lab',
    characterId: 'lyra-rush-weaver',
    title: 'The Rush Innovation Lab',
    description: 'Help Lyra create revolutionary token-weaving techniques',
    longDescription: `Lyra has discovered patterns in the Rush token flow that could revolutionize how rewards are earned and distributed. She needs a testing partner to help her experiment with these new techniques safely.

Working with Lyra means diving into the cutting edge of token mechanics, where small innovations can lead to massive improvements in efficiency and rewards. But innovation comes with risks—some experiments might not go as planned.`,
    chapter: 1,
    questType: 'main',
    difficulty: 'medium',
    
    prerequisites: [
      {
        type: 'character',
        value: 'lyra-rush-weaver',
        description: 'Must have unlocked Lyra as a character'
      },
      {
        type: 'achievement',
        value: 'first_rush_earned',
        description: 'Must have earned your first RUSH tokens'
      }
    ],
    levelRequirement: 8,
    relationshipRequirement: 15,
    
    objectives: [
      {
        id: 'token-pattern-analysis',
        title: 'Token Pattern Analysis',
        description: 'Collect 100 RUSH tokens while monitoring flow patterns',
        type: 'collect',
        target: 100,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          itemType: 'rush_tokens'
        }
      },
      {
        id: 'combo-experiments',
        title: 'Combo Chain Experiments',
        description: 'Achieve 5 combo chains of 10+ in a single game',
        type: 'achieve',
        target: 5,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['combo_chain_10plus']
        }
      },
      {
        id: 'efficiency-testing',
        title: 'Efficiency Testing',
        description: 'Complete 3 games with 90%+ token collection rate',
        type: 'complete',
        target: 3,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['high_collection_efficiency']
        }
      },
      {
        id: 'innovation-breakthrough',
        title: 'Innovation Breakthrough',
        description: 'Discover a new token weaving pattern (chance-based)',
        type: 'achieve',
        target: 1,
        current: 0,
        isCompleted: false,
        isOptional: true,
        trackingData: {
          specificActions: ['rare_pattern_discovery']
        }
      }
    ],
    
    startDialogue: [
      "Hey! Perfect timing! I've been analyzing the token flow patterns and I think I found something amazing!",
      "The Rush tokens aren't just random rewards—they follow specific energy patterns that we can learn to predict!",
      "I need someone with good instincts to help me test these new techniques safely.",
      "Think of it as collaborative research—we'll both benefit from what we discover!",
      "Ready to revolutionize the way Rush tokens work?"
    ],
    
    progressDialogue: {
      'token-pattern-analysis': [
        "Yes! I can see the patterns forming as you collect tokens!",
        "The energy signatures are exactly what I predicted—this is breakthrough material!"
      ],
      'combo-experiments': [
        "Incredible combo work! The chain reactions are generating new pattern types!",
        "I'm recording everything—this data will help optimize the entire system!"
      ],
      'efficiency-testing': [
        "Your efficiency is off the charts! The token flow is responding perfectly!",
        "This confirms my theory about resonance patterns—we're onto something huge!"
      ],
      'innovation-breakthrough': [
        "WHOA! Did you see that?! That was a completely new pattern formation!",
        "I've never seen token energy behave like that before—this could change everything!"
      ]
    },
    
    completionDialogue: [
      "This is AMAZING! The data we collected is revolutionary!",
      "With these new patterns, we can increase token efficiency by at least 30%!",
      "I'm naming this technique after our collaboration—the 'Seeker's Resonance Method'!",
      "Here's your share of the research rewards—you've earned every token!",
      "Want to be my permanent research partner? I have so many more ideas to explore!"
    ],
    
    rewards: [
      {
        type: 'rush_tokens',
        amount: 750,
        description: 'Research Partnership Bonus'
      },
      {
        type: 'feature_unlock',
        item: 'token_efficiency_boost',
        description: 'Unlocks +15% token collection efficiency'
      },
      {
        type: 'cosmetic',
        item: 'innovation_badge',
        rarity: 'rare',
        description: 'Innovation Lab Partner Badge'
      },
      {
        type: 'story_unlock',
        item: 'lyra_advanced_techniques',
        description: 'Unlocks advanced token weaving storyline'
      }
    ],
    
    relationshipChanges: {
      'lyra-rush-weaver': 25
    },
    
    unlocksStories: ['lyra-token-mastery'],
    unlocksFeatures: ['efficiency_tracker', 'pattern_analyzer'],
    
    isRepeatable: false
  },

  // Cipher's Network Architecture Quest
  {
    id: 'cipher-subnet-mastery',
    characterId: 'cipher-the-subnet-architect',
    title: 'Subnet Architecture Mastery',
    description: 'Learn the advanced principles of subnet design with the master architect',
    longDescription: `Cipher has decided to share the deepest secrets of subnet architecture with worthy students. This intensive program will teach you not just how to create subnets, but how to optimize them for maximum efficiency, security, and scalability.

The knowledge Cipher offers is hard-won through years of designing and maintaining critical network infrastructure. Each lesson builds upon the last, creating a comprehensive understanding of blockchain architecture that few possess.`,
    chapter: 2,
    questType: 'main',
    difficulty: 'hard',
    
    prerequisites: [
      {
        type: 'character',
        value: 'cipher-the-subnet-architect',
        description: 'Must have unlocked Cipher as a character'
      },
      {
        type: 'achievement',
        value: 'avalanche_basics',
        description: 'Must have completed Avalanche Basics'
      },
      {
        type: 'level',
        value: 20,
        description: 'Must be at least level 20'
      }
    ],
    levelRequirement: 20,
    relationshipRequirement: 40,
    
    objectives: [
      {
        id: 'network-analysis',
        title: 'Network Topology Analysis',
        description: 'Study 5 different subnet configurations',
        type: 'explore',
        target: 5,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['analyze_subnet_config']
        }
      },
      {
        id: 'efficiency-optimization',
        title: 'Efficiency Optimization',
        description: 'Achieve 98%+ network efficiency in subnet simulation',
        type: 'achieve',
        target: 1,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          minimumScore: 98,
          specificActions: ['subnet_efficiency_test']
        }
      },
      {
        id: 'security-protocol',
        title: 'Security Protocol Implementation',
        description: 'Successfully implement 3 different security measures',
        type: 'complete',
        target: 3,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['implement_security_measure']
        }
      },
      {
        id: 'mentor-certification',
        title: 'Mentor Certification',
        description: 'Teach subnet basics to another player',
        type: 'interact',
        target: 1,
        current: 0,
        isCompleted: false,
        isOptional: true,
        trackingData: {
          specificActions: ['teach_player']
        }
      }
    ],
    
    startDialogue: [
      "Your progress has been... adequate. I believe you're ready for advanced instruction.",
      "Subnet architecture is not merely about connecting nodes—it's about creating digital ecosystems.",
      "Each decision in subnet design ripples through the entire network, affecting thousands of users.",
      "I will share with you the principles that took me decades to master.",
      "Prepare yourself. This knowledge comes with great responsibility."
    ],
    
    progressDialogue: {
      'network-analysis': [
        "Good. You're beginning to see the patterns that govern efficient network topology.",
        "Each configuration teaches us about the trade-offs between speed, security, and decentralization."
      ],
      'efficiency-optimization': [
        "Excellent optimization. You understand that efficiency is not just about speed.",
        "True efficiency balances throughput, latency, and resource utilization perfectly."
      ],
      'security-protocol': [
        "Your security implementations are sound. Defense in depth is crucial.",
        "Remember: the strongest subnet is only as secure as its weakest validation node."
      ],
      'mentor-certification': [
        "Teaching others forces you to truly understand the subject matter.",
        "A master architect must be able to pass on knowledge to the next generation."
      ]
    },
    
    completionDialogue: [
      "Remarkable progress. You have mastered the fundamental principles.",
      "Your understanding of subnet architecture rivals that of veteran network engineers.",
      "I am prepared to grant you the title of 'Subnet Architect' in training.",
      "Use this knowledge wisely. The networks you design will serve countless users.",
      "The advanced protocols are now available to you. Design responsibly."
    ],
    
    rewards: [
      {
        type: 'character_unlock',
        item: 'cipher_mentor_mode',
        description: 'Unlocks Cipher\'s Mentor Mode abilities'
      },
      {
        type: 'rush_tokens',
        amount: 1500,
        description: 'Architect Mastery Reward'
      },
      {
        type: 'nft',
        item: 'subnet_architect_certificate',
        rarity: 'legendary',
        description: 'Certified Subnet Architect NFT'
      },
      {
        type: 'feature_unlock',
        item: 'advanced_subnet_tools',
        description: 'Unlocks advanced subnet creation and management tools'
      }
    ],
    
    relationshipChanges: {
      'cipher-the-subnet-architect': 40,
      'avalon-the-mountain-guardian': 10 // Avalon respects the achievement
    },
    
    unlocksCharacters: ['advanced_validators'],
    unlocksStories: ['cipher-network-legacy'],
    unlocksFeatures: ['subnet_designer', 'network_analyzer', 'security_auditor'],
    
    isRepeatable: false
  },

  // Nova's DeFi Mastery Quest
  {
    id: 'nova-defi-alchemist-mastery',
    characterId: 'nova-defi-alchemist',
    title: 'The Alchemist\'s Grand Experiment',
    description: 'Master the art of DeFi alchemy with Nova\'s most advanced strategies',
    longDescription: `Nova has been working on her masterpiece—a revolutionary DeFi strategy that could maximize yields while minimizing risks. She needs a trusted partner to help execute this complex multi-protocol approach.

This isn't just about following instructions—you'll be co-creating a new DeFi paradigm that could set the standard for the entire ecosystem. The experiment involves coordinating across multiple protocols, timing the markets perfectly, and managing risks that could affect significant value.`,
    chapter: 2,
    questType: 'main',
    difficulty: 'legendary',
    
    prerequisites: [
      {
        type: 'character',
        value: 'nova-defi-alchemist',
        description: 'Must have unlocked Nova as a character'
      },
      {
        type: 'achievement',
        value: 'first_defi_interaction',
        description: 'Must have completed your first DeFi transaction'
      },
      {
        type: 'quest',
        value: 'lyra-rush-innovation-lab',
        description: 'Must have completed Lyra\'s Innovation Lab questline'
      }
    ],
    levelRequirement: 25,
    relationshipRequirement: 35,
    
    objectives: [
      {
        id: 'yield-optimization',
        title: 'Multi-Protocol Yield Optimization',
        description: 'Achieve 50%+ APY across 3 different protocols simultaneously',
        type: 'achieve',
        target: 3,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          minimumScore: 50,
          specificActions: ['multi_protocol_yield']
        }
      },
      {
        id: 'risk-mitigation',
        title: 'Advanced Risk Mitigation',
        description: 'Execute 5 successful hedge positions',
        type: 'complete',
        target: 5,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['successful_hedge']
        }
      },
      {
        id: 'liquidity-mastery',
        title: 'Liquidity Pool Mastery',
        description: 'Provide liquidity to pools worth 10,000+ RUSH equivalent',
        type: 'achieve',
        target: 10000,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          itemType: 'liquidity_value',
          minimumScore: 10000
        }
      },
      {
        id: 'flash-loan-artistry',
        title: 'Flash Loan Artistry',
        description: 'Execute 3 profitable flash loan arbitrage sequences',
        type: 'complete',
        target: 3,
        current: 0,
        isCompleted: false,
        isOptional: true,
        trackingData: {
          specificActions: ['profitable_flash_loan']
        }
      }
    ],
    
    startDialogue: [
      "I've been working on something incredible—a DeFi strategy that could change everything!",
      "It involves coordinating yield farming, liquidity provision, and arbitrage into one seamless system.",
      "I need someone I trust completely to help me test this at scale.",
      "If this works, we could be looking at sustainable 50%+ yields with minimal risk!",
      "Are you ready to make DeFi history with me?"
    ],
    
    progressDialogue: {
      'yield-optimization': [
        "Yes! The yields are even better than my models predicted!",
        "Look at those numbers—we're creating value across multiple protocols simultaneously!"
      ],
      'risk-mitigation': [
        "Perfect hedge execution! You're really getting the hang of risk management!",
        "This is exactly how we protect gains while maximizing opportunities!"
      ],
      'liquidity-mastery': [
        "Incredible liquidity provision! You're helping stabilize the entire ecosystem!",
        "With this much liquidity, we can really start to move markets in positive ways!"
      ],
      'flash-loan-artistry': [
        "THAT was flash loan artistry! Pure profit with zero capital risk!",
        "You're not just following my strategies—you're creating new ones!"
      ]
    },
    
    completionDialogue: [
      "WE DID IT! The grand experiment was a complete success!",
      "The data we've collected will revolutionize how people think about DeFi!",
      "I'm submitting our strategy to the Avalanche DeFi Academy as required reading!",
      "You're not just my partner anymore—you're a co-creator of this breakthrough!",
      "Let's celebrate and then start planning our next impossible project!"
    ],
    
    rewards: [
      {
        type: 'rush_tokens',
        amount: 2500,
        description: 'DeFi Mastery Grand Prize'
      },
      {
        type: 'nft',
        item: 'defi_alchemist_masterpiece',
        rarity: 'legendary',
        description: 'DeFi Alchemist\'s Masterpiece - Co-Creator Edition'
      },
      {
        type: 'feature_unlock',
        item: 'advanced_defi_strategies',
        description: 'Unlocks Nova\'s advanced DeFi strategy toolkit'
      },
      {
        type: 'character_unlock',
        item: 'nova_grandmaster_form',
        description: 'Unlocks Nova\'s Grand Alchemist evolution'
      }
    ],
    
    relationshipChanges: {
      'nova-defi-alchemist': 50,
      'lyra-rush-weaver': 15, // Impressed by the collaboration
      'cipher-the-subnet-architect': 10 // Respects the systematic approach
    },
    
    unlocksStories: ['nova-defi-academy'],
    unlocksFeatures: ['defi_analytics', 'risk_calculator', 'yield_optimizer'],
    
    isRepeatable: false
  },

  // Echo's Temporal Wisdom Quest
  {
    id: 'echo-temporal-guidance',
    characterId: 'echo-reactive-oracle',
    title: 'Echoes Across Time',
    description: 'Help Echo prevent a catastrophic timeline convergence',
    longDescription: `Echo has foreseen a convergence of timelines that could destabilize the entire Avalanche network. The probability streams are chaotic, and multiple potential futures are colliding. She needs someone she trusts to help navigate these temporal complexities and guide the network toward its best possible future.

This quest transcends normal gameplay—you'll be making choices that affect not just your character's story, but the fundamental direction of the entire Avalanche Rush universe. The decisions you make here will influence future content, character relationships, and even the ending of the overall narrative.`,
    chapter: 3,
    questType: 'main',
    difficulty: 'legendary',
    
    prerequisites: [
      {
        type: 'character',
        value: 'echo-reactive-oracle',
        description: 'Must have unlocked Echo as a character'
      },
      {
        type: 'quest',
        value: 'avalon-mountain-guardian-trials',
        description: 'Must have completed Avalon\'s Guardian Trials'
      },
      {
        type: 'quest',
        value: 'cipher-subnet-mastery',
        description: 'Must have completed Cipher\'s Architecture Mastery'
      },
      {
        type: 'relationship',
        value: 60,
        description: 'Must have a deep bond with Echo (relationship 60+)'
      }
    ],
    levelRequirement: 35,
    relationshipRequirement: 60,
    
    objectives: [
      {
        id: 'timeline-stabilization',
        title: 'Timeline Stabilization',
        description: 'Make 7 critical decisions that preserve timeline integrity',
        type: 'achieve',
        target: 7,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['critical_timeline_decision']
        }
      },
      {
        id: 'probability-navigation',
        title: 'Probability Stream Navigation',
        description: 'Successfully navigate 5 probability mazes',
        type: 'complete',
        target: 5,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          specificActions: ['navigate_probability_maze']
        }
      },
      {
        id: 'temporal-harmony',
        title: 'Temporal Harmony Achievement',
        description: 'Achieve perfect synchronization with the Reactive network',
        type: 'achieve',
        target: 1,
        current: 0,
        isCompleted: false,
        isOptional: false,
        trackingData: {
          minimumScore: 100,
          specificActions: ['perfect_sync']
        }
      },
      {
        id: 'paradox-resolution',
        title: 'Paradox Resolution',
        description: 'Resolve a temporal paradox threatening the network',
        type: 'achieve',
        target: 1,
        current: 0,
        isCompleted: false,
        isOptional: true,
        trackingData: {
          specificActions: ['resolve_paradox']
        }
      }
    ],
    
    startDialogue: [
      "The convergence approaches faster than even I anticipated...",
      "Multiple timeline threads are tangling, creating knots that could unravel everything.",
      "I have seen three possible futures: transcendence, stagnation, or collapse.",
      "Your choices will determine which future becomes reality.",
      "Are you prepared to bear the weight of destiny itself?"
    ],
    
    progressDialogue: {
      'timeline-stabilization': [
        "Excellent choice. That decision strengthens the optimal timeline significantly.",
        "I can see the probability streams aligning more favorably with each decision you make."
      ],
      'probability-navigation': [
        "Your intuition guides you well through the maze of possibilities.",
        "Few can navigate probability streams without becoming lost in alternate realities."
      ],
      'temporal-harmony': [
        "Perfect synchronization achieved! You are now truly connected to the network's heartbeat.",
        "This level of harmony is unprecedented—you exceed even my predictions."
      ],
      'paradox-resolution': [
        "Remarkable! The paradox dissolves before your decisive action!",
        "You have proven yourself capable of choices that transcend normal causality."
      ]
    },
    
    completionDialogue: [
      "The convergence is complete, and the optimal timeline is secured.",
      "Your choices have ensured a future of growth, prosperity, and infinite possibility.",
      "The network itself has recognized your contribution to its wellbeing.",
      "You have transcended from seeker to guardian of reality itself.",
      "The echo of your choices will resonate across all possible futures."
    ],
    
    rewards: [
      {
        type: 'nft',
        item: 'temporal_guardian_sigil',
        rarity: 'legendary',
        description: 'Temporal Guardian\'s Sigil - Timeline Stabilizer'
      },
      {
        type: 'rush_tokens',
        amount: 5000,
        description: 'Temporal Mastery Ultimate Reward'
      },
      {
        type: 'character_unlock',
        item: 'echo_prophet_form',
        description: 'Unlocks Echo\'s True Prophet evolution'
      },
      {
        type: 'story_unlock',
        item: 'avalanche_rush_finale',
        description: 'Unlocks the final chapter of Avalanche Rush'
      },
      {
        type: 'feature_unlock',
        item: 'temporal_abilities',
        description: 'Unlocks temporal manipulation abilities'
      }
    ],
    
    relationshipChanges: {
      'echo-reactive-oracle': 100, // Maximum possible relationship
      'avalon-the-mountain-guardian': 30,
      'cipher-the-subnet-architect': 25,
      'nova-defi-alchemist': 20,
      'lyra-rush-weaver': 15
    },
    
    unlocksStories: ['avalanche-rush-grand-finale'],
    unlocksFeatures: ['temporal_vision', 'reality_anchor', 'timeline_editor'],
    
    isRepeatable: false
  }
];

// Quest utility functions
export const getQuestsByCharacter = (characterId: string): CharacterQuest[] => {
  return CHARACTER_QUESTS.filter(quest => quest.characterId === characterId);
};

export const getAvailableQuests = (
  playerLevel: number,
  achievements: string[],
  completedQuests: string[],
  relationships: Record<string, number>
): CharacterQuest[] => {
  return CHARACTER_QUESTS.filter(quest => {
    // Check level requirement
    if (playerLevel < quest.levelRequirement) return false;
    
    // Check if already completed and not repeatable
    if (!quest.isRepeatable && completedQuests.includes(quest.id)) return false;
    
    // Check relationship requirement
    if (quest.relationshipRequirement && 
        (relationships[quest.characterId] || 0) < quest.relationshipRequirement) {
      return false;
    }
    
    // Check all prerequisites
    return quest.prerequisites.every(prereq => {
      switch (prereq.type) {
        case 'level':
          return playerLevel >= (prereq.value as number);
        case 'achievement':
          return achievements.includes(prereq.value as string);
        case 'quest':
          return completedQuests.includes(prereq.value as string);
        case 'relationship':
          return (relationships[quest.characterId] || 0) >= (prereq.value as number);
        case 'character':
          // This would need to be implemented based on character unlock system
          return true;
        default:
          return true;
      }
    });
  });
};

export const getQuestById = (questId: string): CharacterQuest | undefined => {
  return CHARACTER_QUESTS.find(quest => quest.id === questId);
};

export const getQuestProgress = (quest: CharacterQuest): { 
  completed: number; 
  total: number; 
  percentage: number;
  isComplete: boolean;
} => {
  const completed = quest.objectives.filter(obj => obj.isCompleted).length;
  const total = quest.objectives.filter(obj => !obj.isOptional).length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed >= total;
  
  return { completed, total, percentage, isComplete };
};

// Enhanced Reactive Smart Contract Quests
export const REACTIVE_QUESTS: ReactiveQuest[] = [
  {
    id: 'avalanche-first-transfer',
    title: 'First AVAX Transfer - Reactive Adventure',
    characterId: 'avalon-the-mountain-guardian',
    eventTrigger: 'transfer',
    verificationContract: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    minimumAmount: 1000000000000000, // 0.001 AVAX in wei
    completionCriteria: {
      eventSignature: 'Transfer(address,address,uint256)',
      parameterChecks: [
        {
          paramName: 'value',
          operator: '>=',
          value: 1000000000000000
        },
        {
          paramName: 'to',
          operator: '!=',
          value: '0x0000000000000000000000000000000000000000'
        }
      ],
      timeWindow: 0, // No time limit
      repeatability: 'once'
    },
    automaticRewards: [
      {
        type: 'nft',
        nftMetadata: {
          name: 'First Steps on Avalanche',
          description: 'Commemorates your first AVAX transfer, marking the beginning of your Web3 journey.',
          image: 'ipfs://QmFirstStepsNFT/avalanche-guardian.json',
          rarity: 'common',
          attributes: [
            {
              trait_type: 'Quest Type',
              value: 'First Transfer'
            },
            {
              trait_type: 'Blockchain',
              value: 'Avalanche'
            },
            {
              trait_type: 'Character Guide',
              value: 'Avalon'
            },
            {
              trait_type: 'Achievement Date',
              value: Date.now(),
              display_type: 'date'
            }
          ]
        },
        triggersChainlinkVRF: true,
        vrfConfig: {
          subscriptionId: 1234,
          keyHash: '0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d',
          callbackGasLimit: 100000,
          numWords: 1,
          rareDropChance: 5 // 5% chance for rare variant
        }
      },
      {
        type: 'token',
        amount: 100 // 100 RUSH tokens
      },
      {
        type: 'experience',
        amount: 250
      }
    ],
    vfxConfig: {
      particleEffect: 'ice_crystal_burst',
      screenShake: true,
      colorTheme: 'blue_white_gradient',
      duration: 3000,
      soundEffect: 'avalanche_rumble'
    }
  },
  
  {
    id: 'trader-joe-swap-master',
    title: 'DeFi Swap Mastery with Lyra',
    characterId: 'lyra-rush-weaver',
    eventTrigger: 'swap',
    verificationContract: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', // Trader Joe Router
    minimumAmount: 1000000, // 1 USDC
    completionCriteria: {
      eventSignature: 'Swap(address,uint256,uint256,uint256,uint256,address)',
      parameterChecks: [
        {
          paramName: 'amount0Out',
          operator: '>',
          value: 0
        },
        {
          paramName: 'amount1Out', 
          operator: '>',
          value: 0
        }
      ],
      timeWindow: 3600, // 1 hour to complete after starting
      repeatability: 'daily'
    },
    automaticRewards: [
      {
        type: 'nft',
        nftMetadata: {
          name: 'DeFi Alchemist Apprentice',
          description: 'Awarded for mastering your first DEX swap on Avalanche. Lyra is proud of your progress!',
          image: 'ipfs://QmDeFiAlchemist/lyra-swap-master.json',
          rarity: 'rare',
          attributes: [
            {
              trait_type: 'DeFi Skill',
              value: 'Token Swapping'
            },
            {
              trait_type: 'Platform',
              value: 'Trader Joe'
            },
            {
              trait_type: 'Mentor',
              value: 'Lyra the Rush Weaver'
            },
            {
              trait_type: 'Efficiency Boost',
              value: 15,
              display_type: 'boost_percentage'
            }
          ],
          animationUrl: 'ipfs://QmAnimations/token-weaving-effect.mp4'
        },
        triggersChainlinkVRF: true,
        vrfConfig: {
          subscriptionId: 1234,
          keyHash: '0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d',
          callbackGasLimit: 150000,
          numWords: 2,
          rareDropChance: 15 // 15% chance for epic variant
        }
      },
      {
        type: 'token',
        amount: 300
      },
      {
        type: 'experience',
        amount: 500
      }
    ],
    vfxConfig: {
      particleEffect: 'energy_swirl_multi',
      screenShake: false,
      colorTheme: 'purple_gold_gradient',
      duration: 4000,
      soundEffect: 'token_fusion'
    }
  },

  {
    id: 'subnet-deployment-cipher',
    title: 'Subnet Deployment Mastery with Cipher',
    characterId: 'cipher-the-subnet-architect',
    eventTrigger: 'contract_interaction',
    verificationContract: '0xSubnetFactoryContract', // Placeholder for subnet factory
    completionCriteria: {
      eventSignature: 'SubnetCreated(address,uint256,string)',
      parameterChecks: [
        {
          paramName: 'creator',
          operator: '==',
          value: 'USER_ADDRESS' // Will be replaced with actual user address
        }
      ],
      timeWindow: 0,
      repeatability: 'unlimited'
    },
    automaticRewards: [
      {
        type: 'nft',
        nftMetadata: {
          name: 'Subnet Architect Certification',
          description: 'Official certification for deploying your first Avalanche subnet. Cipher recognizes your technical prowess.',
          image: 'ipfs://QmSubnetArchitect/cipher-certification.json',
          rarity: 'legendary',
          attributes: [
            {
              trait_type: 'Technical Achievement',
              value: 'Subnet Deployment'
            },
            {
              trait_type: 'Certification Level',
              value: 'Professional'
            },
            {
              trait_type: 'Validator Boost',
              value: 25,
              display_type: 'boost_percentage'
            },
            {
              trait_type: 'Network Contribution',
              value: 'Subnet Creator'
            }
          ]
        },
        triggersChainlinkVRF: true,
        vrfConfig: {
          subscriptionId: 1234,
          keyHash: '0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d',
          callbackGasLimit: 200000,
          numWords: 1,
          rareDropChance: 25 // 25% chance for mythic variant
        }
      },
      {
        type: 'token',
        amount: 1000
      },
      {
        type: 'character_unlock',
        // Unlocks advanced validator character
      }
    ],
    vfxConfig: {
      particleEffect: 'network_node_expansion',
      screenShake: true,
      colorTheme: 'cyan_electric_blue',
      duration: 5000,
      soundEffect: 'network_initialization'
    }
  },

  {
    id: 'defi-yield-farming-nova',
    title: 'Advanced Yield Farming with Nova',
    characterId: 'nova-defi-alchemist',
    eventTrigger: 'contract_interaction',
    verificationContract: '0xYieldFarmContract', // Placeholder for yield farming contract
    minimumAmount: 100000000, // 100 USDC
    completionCriteria: {
      eventSignature: 'Deposit(address,uint256,uint256)',
      parameterChecks: [
        {
          paramName: 'amount',
          operator: '>=',
          value: 100000000
        }
      ],
      timeWindow: 0,
      repeatability: 'weekly'
    },
    automaticRewards: [
      {
        type: 'nft',
        nftMetadata: {
          name: 'Master Yield Farmer',
          description: 'Recognized by Nova for achieving advanced yield farming strategies with significant capital deployment.',
          image: 'ipfs://QmYieldFarming/nova-master-farmer.json',
          rarity: 'epic',
          attributes: [
            {
              trait_type: 'DeFi Strategy',
              value: 'Yield Farming'
            },
            {
              trait_type: 'Capital Efficiency',
              value: 'High'
            },
            {
              trait_type: 'APY Boost',
              value: 20,
              display_type: 'boost_percentage'
            },
            {
              trait_type: 'Risk Management',
              value: 'Advanced'
            }
          ],
          animationUrl: 'ipfs://QmAnimations/yield-compounding.mp4'
        }
      },
      {
        type: 'token',
        amount: 750
      },
      {
        type: 'evolution', // Triggers character evolution
      }
    ],
    vfxConfig: {
      particleEffect: 'compound_interest_spiral',
      screenShake: false,
      colorTheme: 'green_gold_prosperity',
      duration: 4500,
      soundEffect: 'alchemy_transformation'
    }
  },

  {
    id: 'temporal-mastery-echo',
    title: 'Temporal Network Mastery with Echo',
    characterId: 'echo-reactive-oracle',
    eventTrigger: 'quest_completion',
    verificationContract: '0xReactiveQuestEngine',
    completionCriteria: {
      eventSignature: 'MultiQuestMastery(address,uint256[])',
      parameterChecks: [
        {
          paramName: 'questCount',
          operator: '>=',
          value: 10 // Must complete 10 different quests
        }
      ],
      timeWindow: 604800, // 1 week
      repeatability: 'once'
    },
    automaticRewards: [
      {
        type: 'nft',
        nftMetadata: {
          name: 'Temporal Network Oracle',
          description: 'Ultimate recognition from Echo for mastering the interconnected nature of the Reactive Network. You have transcended normal limitations.',
          image: 'ipfs://QmTemporalOracle/echo-ultimate.json',
          rarity: 'mythic',
          attributes: [
            {
              trait_type: 'Mastery Level',
              value: 'Transcendent'
            },
            {
              trait_type: 'Network Harmony',
              value: 100,
              display_type: 'number'
            },
            {
              trait_type: 'Temporal Sight',
              value: 'Unlocked'
            },
            {
              trait_type: 'Oracle Blessing',
              value: 'Active'
            },
            {
              trait_type: 'All Rewards Multiplier',
              value: 50,
              display_type: 'boost_percentage'
            }
          ],
          animationUrl: 'ipfs://QmAnimations/temporal-mastery.mp4'
        },
        triggersChainlinkVRF: true,
        vrfConfig: {
          subscriptionId: 1234,
          keyHash: '0x83250c5584ffa93feb6ee082981c5ebe484c865196750b39835ad4f13780435d',
          callbackGasLimit: 300000,
          numWords: 3,
          rareDropChance: 100 // Always triggers special VRF for ultimate rewards
        }
      },
      {
        type: 'token',
        amount: 5000
      },
      {
        type: 'character_unlock',
        // Unlocks ultimate Echo form
      }
    ],
    vfxConfig: {
      particleEffect: 'reality_distortion_field',
      screenShake: true,
      colorTheme: 'prismatic_rainbow_cascade',
      duration: 10000,
      soundEffect: 'cosmic_convergence'
    }
  }
];

// Import ReactiveQuest interface at top of file
import { ReactiveQuest } from './characters';
