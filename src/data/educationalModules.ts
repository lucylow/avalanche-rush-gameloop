// Enhanced Educational Modules for Avalanche Rush
export const EDUCATIONAL_MODULES = {
  // DeFi Integration
  defi: {
    title: "DeFi Mastery",
    description: "Master decentralized finance concepts through interactive gameplay",
    modules: [
      {
        id: "liquidity-pools",
        title: "Liquidity Pools",
        description: "Learn how to provide liquidity and earn rewards",
        gameMechanic: "Players earn tokens by maintaining 'liquidity' in game",
        realWorldConnection: "Direct integration with Avalanche DEXs",
        difficulty: "beginner",
        estimatedTime: "15 minutes",
        rewards: {
          tokens: 100,
          experience: 50,
          badge: "liquidity-provider"
        },
        prerequisites: [],
        learningObjectives: [
          "Understand liquidity provision concepts",
          "Learn about impermanent loss",
          "Master yield farming strategies"
        ]
      },
      {
        id: "yield-farming",
        title: "Yield Farming",
        description: "Master yield farming strategies and risk management",
        gameMechanic: "Stake game tokens to earn additional rewards",
        realWorldConnection: "Connect to real yield farming protocols",
        difficulty: "intermediate",
        estimatedTime: "25 minutes",
        rewards: {
          tokens: 200,
          experience: 100,
          badge: "yield-farmer"
        },
        prerequisites: ["liquidity-pools"],
        learningObjectives: [
          "Understand yield farming mechanics",
          "Learn risk assessment strategies",
          "Master portfolio optimization"
        ]
      },
      {
        id: "impermanent-loss",
        title: "Impermanent Loss Protection",
        description: "Understand and mitigate impermanent loss",
        gameMechanic: "Shield power-up protects against 'loss' events",
        realWorldConnection: "Educational content on IL protection",
        difficulty: "advanced",
        estimatedTime: "30 minutes",
        rewards: {
          tokens: 300,
          experience: 150,
          badge: "risk-manager"
        },
        prerequisites: ["liquidity-pools", "yield-farming"],
        learningObjectives: [
          "Calculate impermanent loss scenarios",
          "Implement protection strategies",
          "Optimize liquidity positions"
        ]
      },
      {
        id: "flash-loans",
        title: "Flash Loans & Arbitrage",
        description: "Master advanced DeFi strategies",
        gameMechanic: "Special power-up allows instant token swaps",
        realWorldConnection: "Real arbitrage opportunities",
        difficulty: "expert",
        estimatedTime: "45 minutes",
        rewards: {
          tokens: 500,
          experience: 250,
          badge: "arbitrage-master"
        },
        prerequisites: ["yield-farming", "impermanent-loss"],
        learningObjectives: [
          "Understand flash loan mechanics",
          "Identify arbitrage opportunities",
          "Execute complex DeFi strategies"
        ]
      }
    ]
  },
  
  // Subnet Technology
  subnets: {
    title: "Avalanche Subnets",
    description: "Build and manage custom blockchain networks",
    modules: [
      {
        id: "subnet-creation",
        title: "Create Your Subnet",
        description: "Build custom blockchain networks with specific rules",
        gameMechanic: "Players create 'mini-networks' with custom rules",
        realWorldConnection: "Tutorial for actual subnet deployment",
        difficulty: "intermediate",
        estimatedTime: "40 minutes",
        rewards: {
          tokens: 400,
          experience: 200,
          badge: "subnet-builder"
        },
        prerequisites: [],
        learningObjectives: [
          "Understand subnet architecture",
          "Configure custom VM parameters",
          "Deploy and manage subnets"
        ]
      },
      {
        id: "cross-subnet",
        title: "Cross-Subnet Communication",
        description: "Enable communication between different subnets",
        gameMechanic: "Multi-level gameplay across different 'subnets'",
        realWorldConnection: "Real cross-subnet transaction examples",
        difficulty: "advanced",
        estimatedTime: "35 minutes",
        rewards: {
          tokens: 350,
          experience: 175,
          badge: "cross-chain-expert"
        },
        prerequisites: ["subnet-creation"],
        learningObjectives: [
          "Master cross-subnet messaging",
          "Implement Warp messaging",
          "Build interoperable applications"
        ]
      },
      {
        id: "subnet-security",
        title: "Subnet Security & Validation",
        description: "Secure your subnet with proper validation",
        gameMechanic: "Players defend against 'attacks' on their subnet",
        realWorldConnection: "Real security best practices",
        difficulty: "expert",
        estimatedTime: "50 minutes",
        rewards: {
          tokens: 600,
          experience: 300,
          badge: "security-expert"
        },
        prerequisites: ["subnet-creation", "cross-subnet"],
        learningObjectives: [
          "Implement security measures",
          "Configure validator sets",
          "Monitor subnet health"
        ]
      }
    ]
  },
  
  // Governance
  governance: {
    title: "Decentralized Governance",
    description: "Participate in protocol governance and decision-making",
    modules: [
      {
        id: "voting-mechanics",
        title: "Voting & Proposals",
        description: "Participate in protocol governance decisions",
        gameMechanic: "Players vote on game rule changes",
        realWorldConnection: "Integration with Avalanche governance",
        difficulty: "beginner",
        estimatedTime: "20 minutes",
        rewards: {
          tokens: 150,
          experience: 75,
          badge: "governance-participant"
        },
        prerequisites: [],
        learningObjectives: [
          "Understand governance mechanisms",
          "Learn proposal creation",
          "Master voting strategies"
        ]
      },
      {
        id: "treasury-management",
        title: "Treasury Management",
        description: "Manage community funds and budgets",
        gameMechanic: "Players manage in-game treasury",
        realWorldConnection: "Real treasury management tools",
        difficulty: "intermediate",
        estimatedTime: "30 minutes",
        rewards: {
          tokens: 250,
          experience: 125,
          badge: "treasury-manager"
        },
        prerequisites: ["voting-mechanics"],
        learningObjectives: [
          "Master treasury allocation",
          "Understand budget planning",
          "Implement financial controls"
        ]
      },
      {
        id: "dao-creation",
        title: "DAO Creation & Management",
        description: "Build and manage decentralized organizations",
        gameMechanic: "Players create and manage virtual DAOs",
        realWorldConnection: "Real DAO creation tools",
        difficulty: "advanced",
        estimatedTime: "60 minutes",
        rewards: {
          tokens: 500,
          experience: 250,
          badge: "dao-founder"
        },
        prerequisites: ["voting-mechanics", "treasury-management"],
        learningObjectives: [
          "Design DAO structures",
          "Implement governance mechanisms",
          "Manage community dynamics"
        ]
      }
    ]
  },

  // Smart Contract Development
  smartContracts: {
    title: "Smart Contract Development",
    description: "Learn to build and deploy smart contracts",
    modules: [
      {
        id: "solidity-basics",
        title: "Solidity Fundamentals",
        description: "Master the basics of smart contract programming",
        gameMechanic: "Players write 'code' to solve puzzles",
        realWorldConnection: "Real Solidity development environment",
        difficulty: "beginner",
        estimatedTime: "45 minutes",
        rewards: {
          tokens: 300,
          experience: 150,
          badge: "solidity-developer"
        },
        prerequisites: [],
        learningObjectives: [
          "Understand Solidity syntax",
          "Learn contract structure",
          "Master basic programming concepts"
        ]
      },
      {
        id: "contract-deployment",
        title: "Contract Deployment & Testing",
        description: "Deploy and test smart contracts on Avalanche",
        gameMechanic: "Players deploy 'contracts' in-game",
        realWorldConnection: "Real contract deployment on testnet",
        difficulty: "intermediate",
        estimatedTime: "35 minutes",
        rewards: {
          tokens: 400,
          experience: 200,
          badge: "contract-deployer"
        },
        prerequisites: ["solidity-basics"],
        learningObjectives: [
          "Master deployment processes",
          "Learn testing strategies",
          "Understand gas optimization"
        ]
      },
      {
        id: "advanced-patterns",
        title: "Advanced Contract Patterns",
        description: "Implement complex smart contract patterns",
        gameMechanic: "Players build complex 'systems'",
        realWorldConnection: "Real advanced contract patterns",
        difficulty: "expert",
        estimatedTime: "90 minutes",
        rewards: {
          tokens: 800,
          experience: 400,
          badge: "contract-architect"
        },
        prerequisites: ["solidity-basics", "contract-deployment"],
        learningObjectives: [
          "Master design patterns",
          "Implement upgradeable contracts",
          "Build complex systems"
        ]
      }
    ]
  }
};

// Career Path Integration
export const CAREER_PATHS = {
  developer: {
    title: "Blockchain Developer",
    description: "Build the future of decentralized applications",
    skills: ["Solidity", "Smart Contracts", "DeFi Protocols", "Subnet Development"],
    gameProgression: "Build increasingly complex smart contracts",
    realWorldValue: "Portfolio of deployed contracts",
    modules: ["solidity-basics", "contract-deployment", "advanced-patterns", "subnet-creation"],
    certifications: [
      {
        name: "Avalanche Developer Certification",
        requirements: ["solidity-basics", "contract-deployment", "subnet-creation"],
        value: "Industry-recognized certification"
      }
    ],
    jobOpportunities: [
      "Smart Contract Developer",
      "DeFi Protocol Engineer",
      "Subnet Developer",
      "Blockchain Architect"
    ]
  },
  trader: {
    title: "DeFi Trader",
    description: "Master decentralized finance trading strategies",
    skills: ["Market Analysis", "Risk Management", "Portfolio Optimization", "Arbitrage"],
    gameProgression: "Manage virtual portfolios with real market data",
    realWorldValue: "Trading strategies and performance metrics",
    modules: ["liquidity-pools", "yield-farming", "impermanent-loss", "flash-loans"],
    certifications: [
      {
        name: "DeFi Specialist Badge",
        requirements: ["yield-farming", "impermanent-loss", "flash-loans"],
        value: "Advanced DeFi expertise recognition"
      }
    ],
    jobOpportunities: [
      "DeFi Trader",
      "Portfolio Manager",
      "Risk Analyst",
      "Arbitrage Specialist"
    ]
  },
  entrepreneur: {
    title: "Web3 Entrepreneur",
    description: "Launch and scale Web3 businesses",
    skills: ["Tokenomics", "Community Building", "Product Development", "DAO Management"],
    gameProgression: "Launch and manage virtual projects",
    realWorldValue: "Business plan templates and market research",
    modules: ["voting-mechanics", "treasury-management", "dao-creation", "subnet-creation"],
    certifications: [
      {
        name: "Web3 Entrepreneur Certification",
        requirements: ["dao-creation", "treasury-management", "subnet-creation"],
        value: "Entrepreneurial expertise in Web3"
      }
    ],
    jobOpportunities: [
      "Web3 Startup Founder",
      "DAO Manager",
      "Community Manager",
      "Product Manager"
    ]
  },
  validator: {
    title: "Avalanche Validator",
    description: "Secure the Avalanche network",
    skills: ["Network Security", "Staking", "Validation", "Infrastructure"],
    gameProgression: "Run and maintain virtual validators",
    realWorldValue: "Validator operation experience",
    modules: ["subnet-security", "treasury-management", "governance"],
    certifications: [
      {
        name: "Avalanche Validator Certification",
        requirements: ["subnet-security", "treasury-management"],
        value: "Validator operation expertise"
      }
    ],
    jobOpportunities: [
      "Network Validator",
      "Infrastructure Engineer",
      "Security Specialist",
      "Network Operations"
    ]
  }
};

// Certification System
export const CERTIFICATION_SYSTEM = {
  levels: {
    bronze: {
      name: "Bronze",
      color: "#CD7F32",
      requirements: "Complete 3 modules",
      benefits: ["Basic badge", "Community access"]
    },
    silver: {
      name: "Silver", 
      color: "#C0C0C0",
      requirements: "Complete 6 modules + 1 career path",
      benefits: ["Advanced badge", "Mentorship access", "Job board access"]
    },
    gold: {
      name: "Gold",
      color: "#FFD700", 
      requirements: "Complete 10 modules + 2 career paths",
      benefits: ["Premium badge", "Direct hiring pipeline", "Exclusive events"]
    },
    platinum: {
      name: "Platinum",
      color: "#E5E4E2",
      requirements: "Complete all modules + 3 career paths",
      benefits: ["Elite badge", "Industry recognition", "Speaking opportunities"]
    }
  },
  badges: {
    "liquidity-provider": {
      name: "Liquidity Provider",
      description: "Mastered liquidity provision concepts",
      icon: "💧",
      rarity: "common"
    },
    "yield-farmer": {
      name: "Yield Farmer", 
      description: "Expert in yield farming strategies",
      icon: "🌾",
      rarity: "uncommon"
    },
    "risk-manager": {
      name: "Risk Manager",
      description: "Advanced risk management skills",
      icon: "🛡️",
      rarity: "rare"
    },
    "arbitrage-master": {
      name: "Arbitrage Master",
      description: "Master of arbitrage strategies",
      icon: "⚡",
      rarity: "epic"
    },
    "subnet-builder": {
      name: "Subnet Builder",
      description: "Expert in subnet creation",
      icon: "🏗️",
      rarity: "rare"
    },
    "cross-chain-expert": {
      name: "Cross-Chain Expert",
      description: "Master of cross-subnet communication",
      icon: "🌉",
      rarity: "epic"
    },
    "security-expert": {
      name: "Security Expert",
      description: "Advanced security implementation",
      icon: "🔒",
      rarity: "legendary"
    },
    "governance-participant": {
      name: "Governance Participant",
      description: "Active in decentralized governance",
      icon: "🗳️",
      rarity: "common"
    },
    "treasury-manager": {
      name: "Treasury Manager",
      description: "Expert in treasury management",
      icon: "💰",
      rarity: "uncommon"
    },
    "dao-founder": {
      name: "DAO Founder",
      description: "Creator of decentralized organizations",
      icon: "🏛️",
      rarity: "legendary"
    },
    "solidity-developer": {
      name: "Solidity Developer",
      description: "Proficient in smart contract development",
      icon: "💻",
      rarity: "uncommon"
    },
    "contract-deployer": {
      name: "Contract Deployer",
      description: "Expert in contract deployment",
      icon: "🚀",
      rarity: "rare"
    },
    "contract-architect": {
      name: "Contract Architect",
      description: "Master of advanced contract patterns",
      icon: "🏗️",
      rarity: "legendary"
    }
  }
};

// Learning Analytics
export const LEARNING_ANALYTICS = {
  metrics: {
    completionRate: "Percentage of modules completed",
    timeToComplete: "Average time to complete modules",
    retentionRate: "User retention after completing modules",
    skillProgression: "Skill level improvement over time",
    realWorldApplication: "Users who apply skills in real projects"
  },
  tracking: {
    userProgress: "Track individual learning progress",
    moduleEffectiveness: "Measure module learning outcomes",
    careerPathSuccess: "Track career path completion rates",
    certificationEarning: "Monitor certification achievement rates"
  }
};
