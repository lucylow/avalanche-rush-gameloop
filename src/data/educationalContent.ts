// Educational content library for Avalanche Rush
export interface EducationalContent {
  id: string;
  title: string;
  type: 'tutorial' | 'quiz' | 'article' | 'video' | 'interactive';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  description: string;
  content: Record<string, unknown>;
  prerequisites: string[];
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  rating: number;
  completions: number;
}

export const educationalContent: EducationalContent[] = [
  {
    id: 'blockchain-101',
    title: 'Blockchain Technology Fundamentals',
    type: 'tutorial',
    category: 'Blockchain',
    difficulty: 'beginner',
    duration: 45,
    description: 'Learn the core concepts of blockchain technology from the ground up',
    content: {
      steps: [
        {
          id: 'what-is-blockchain',
          title: 'What is Blockchain?',
          type: 'concept',
          content: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography.',
          codeExample: `// Simple blockchain structure
class Block {
  constructor(data, previousHash) {
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }
  
  calculateHash() {
    return SHA256(
      this.previousHash + 
      this.timestamp + 
      JSON.stringify(this.data)
    ).toString();
  }
}`,
          isCompleted: false
        },
        {
          id: 'consensus-mechanisms',
          title: 'Consensus Mechanisms',
          type: 'interactive',
          content: 'Consensus mechanisms ensure all participants agree on the state of the blockchain. Common types include Proof of Work, Proof of Stake, and Avalanche Consensus.',
          expectedAction: 'Drag the consensus mechanisms to match their descriptions',
          isCompleted: false
        },
        {
          id: 'blockchain-quiz',
          title: 'Blockchain Knowledge Check',
          type: 'quiz',
          content: 'Test your understanding of blockchain fundamentals',
          quizQuestion: {
            question: 'What makes blockchain immutable?',
            options: [
              'Centralized authority',
              'Cryptographic hashing and linking',
              'High transaction fees',
              'Complex algorithms'
            ],
            correctAnswer: 1,
            explanation: 'Blockchain immutability comes from cryptographic hashing and the linking of blocks. Once a block is added, changing it would require recalculating all subsequent blocks.'
          },
          isCompleted: false
        }
      ]
    },
    prerequisites: [],
    tags: ['blockchain', 'cryptography', 'distributed-ledger'],
    author: 'Avalanche Team',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    rating: 4.8,
    completions: 1247
  },
  {
    id: 'avalanche-consensus',
    title: 'Avalanche Consensus Mechanism',
    type: 'tutorial',
    category: 'Avalanche',
    difficulty: 'intermediate',
    duration: 60,
    description: 'Deep dive into Avalanche\'s unique consensus protocol',
    content: {
      steps: [
        {
          id: 'avalanche-overview',
          title: 'Avalanche Consensus Overview',
          type: 'concept',
          content: 'Avalanche consensus is a novel consensus protocol that provides fast finality, high throughput, and energy efficiency. It uses a metastable mechanism to achieve consensus.',
          codeExample: `// Avalanche consensus pseudocode
function avalancheConsensus(proposal) {
  let votes = new Map();
  let confidence = 0;
  
  while (confidence < threshold) {
    let sample = randomSample(validators);
    let responses = queryValidators(sample, proposal);
    
    for (let response of responses) {
      votes.set(response.validator, response.vote);
    }
    
    confidence = calculateConfidence(votes);
  }
  
  return finalizeDecision(votes);
}`,
          isCompleted: false
        },
        {
          id: 'metastability',
          title: 'Understanding Metastability',
          type: 'interactive',
          content: 'Metastability is a key concept in Avalanche consensus. It allows the network to quickly converge on decisions through repeated sampling.',
          expectedAction: 'Adjust the parameters to see how metastability affects consensus speed',
          isCompleted: false
        },
        {
          id: 'avalanche-vs-others',
          title: 'Avalanche vs Other Consensus',
          type: 'demo',
          content: 'Compare Avalanche consensus with other popular consensus mechanisms',
          isCompleted: false
        }
      ]
    },
    prerequisites: ['blockchain-101'],
    tags: ['avalanche', 'consensus', 'metastability', 'protocol'],
    author: 'Avalanche Team',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    rating: 4.9,
    completions: 892
  },
  {
    id: 'defi-fundamentals',
    title: 'Decentralized Finance (DeFi) Basics',
    type: 'tutorial',
    category: 'DeFi',
    difficulty: 'intermediate',
    duration: 75,
    description: 'Learn about DeFi protocols, yield farming, and liquidity provision',
    content: {
      steps: [
        {
          id: 'what-is-defi',
          title: 'What is DeFi?',
          type: 'concept',
          content: 'DeFi (Decentralized Finance) refers to financial applications built on blockchain networks that operate without traditional intermediaries.',
          isCompleted: false
        },
        {
          id: 'defi-protocols',
          title: 'Major DeFi Protocols',
          type: 'interactive',
          content: 'Explore the different types of DeFi protocols: DEXs, lending platforms, yield farming, and more.',
          expectedAction: 'Match each DeFi protocol with its primary function',
          isCompleted: false
        },
        {
          id: 'yield-farming',
          title: 'Yield Farming Explained',
          type: 'demo',
          content: 'Learn how yield farming works and how to calculate potential returns',
          isCompleted: false
        }
      ]
    },
    prerequisites: ['blockchain-101', 'avalanche-consensus'],
    tags: ['defi', 'yield-farming', 'liquidity', 'protocols'],
    author: 'DeFi Educator',
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
    rating: 4.7,
    completions: 1156
  },
  {
    id: 'smart-contracts-intro',
    title: 'Introduction to Smart Contracts',
    type: 'tutorial',
    category: 'Smart Contracts',
    difficulty: 'intermediate',
    duration: 90,
    description: 'Learn how to write and deploy smart contracts',
    content: {
      steps: [
        {
          id: 'smart-contract-basics',
          title: 'Smart Contract Fundamentals',
          type: 'concept',
          content: 'Smart contracts are self-executing contracts with the terms of the agreement directly written into code.',
          codeExample: `// Simple smart contract example
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`,
          isCompleted: false
        },
        {
          id: 'solidity-basics',
          title: 'Solidity Programming',
          type: 'interactive',
          content: 'Learn the basics of Solidity, the programming language for Ethereum smart contracts',
          expectedAction: 'Write your first Solidity function',
          isCompleted: false
        },
        {
          id: 'contract-deployment',
          title: 'Deploying Contracts',
          type: 'demo',
          content: 'Learn how to deploy smart contracts to the blockchain',
          isCompleted: false
        }
      ]
    },
    prerequisites: ['blockchain-101'],
    tags: ['smart-contracts', 'solidity', 'programming', 'deployment'],
    author: 'Smart Contract Developer',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    rating: 4.6,
    completions: 743
  },
  {
    id: 'avalanche-defi-quiz',
    title: 'Avalanche DeFi Quiz',
    type: 'quiz',
    category: 'DeFi',
    difficulty: 'intermediate',
    duration: 20,
    description: 'Test your knowledge of DeFi protocols on Avalanche',
    content: {
      questions: [
        {
          id: 'trader-joe',
          question: 'What is Trader Joe?',
          type: 'multiple-choice',
          options: [
            'A lending protocol',
            'A decentralized exchange',
            'A yield farming platform',
            'A stablecoin protocol'
          ],
          correctAnswer: 1,
          explanation: 'Trader Joe is a decentralized exchange (DEX) on Avalanche that provides trading, liquidity provision, and yield farming services.',
          difficulty: 'medium',
          category: 'DeFi',
          points: 10
        },
        {
          id: 'pangolin',
          question: 'Which protocol is known as the "Uniswap of Avalanche"?',
          type: 'multiple-choice',
          options: [
            'Trader Joe',
            'Pangolin',
            'Benqi',
            'Aave'
          ],
          correctAnswer: 1,
          explanation: 'Pangolin is often referred to as the "Uniswap of Avalanche" due to its automated market maker (AMM) functionality.',
          difficulty: 'easy',
          category: 'DeFi',
          points: 5
        },
        {
          id: 'yield-farming',
          question: 'What is the primary purpose of yield farming?',
          type: 'multiple-choice',
          options: [
            'To mine cryptocurrency',
            'To earn rewards by providing liquidity',
            'To trade tokens',
            'To stake validators'
          ],
          correctAnswer: 1,
          explanation: 'Yield farming involves providing liquidity to DeFi protocols in exchange for rewards, typically in the form of additional tokens.',
          difficulty: 'medium',
          category: 'DeFi',
          points: 10
        }
      ]
    },
    prerequisites: ['defi-fundamentals'],
    tags: ['quiz', 'defi', 'avalanche', 'protocols'],
    author: 'Quiz Master',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05',
    rating: 4.5,
    completions: 567
  }
];

export const learningPaths = [
  {
    id: 'blockchain-beginner',
    title: 'Blockchain Beginner Path',
    description: 'Start your blockchain journey with fundamental concepts',
    category: 'Blockchain',
    difficulty: 'beginner',
    estimatedTime: 8,
    modules: [
      'blockchain-101',
      'cryptocurrency-basics',
      'wallet-security',
      'blockchain-basics-quiz'
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 'avalanche-expert',
    title: 'Avalanche Expert Path',
    description: 'Become an expert in the Avalanche ecosystem',
    category: 'Avalanche',
    difficulty: 'advanced',
    estimatedTime: 20,
    modules: [
      'avalanche-consensus',
      'avalanche-subnets',
      'avalanche-defi',
      'avalanche-development'
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 'defi-trader',
    title: 'DeFi Trader Path',
    description: 'Master DeFi trading and yield farming strategies',
    category: 'DeFi',
    difficulty: 'intermediate',
    estimatedTime: 15,
    modules: [
      'defi-fundamentals',
      'yield-farming-strategies',
      'liquidity-provision',
      'defi-risk-management'
    ],
    isCompleted: false,
    progress: 0
  }
];

export const categories = [
  { id: 'blockchain', name: 'Blockchain', icon: '🔗', color: 'bg-blue-500' },
  { id: 'avalanche', name: 'Avalanche', icon: '🏔️', color: 'bg-red-500' },
  { id: 'defi', name: 'DeFi', icon: '📈', color: 'bg-green-500' },
  { id: 'smart-contracts', name: 'Smart Contracts', icon: '📝', color: 'bg-purple-500' },
  { id: 'trading', name: 'Trading', icon: '💹', color: 'bg-yellow-500' },
  { id: 'security', name: 'Security', icon: '🔒', color: 'bg-gray-500' }
];

export const difficultyLevels = [
  { id: 'beginner', name: 'Beginner', color: 'bg-green-500', description: 'No prior knowledge required' },
  { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-500', description: 'Some blockchain knowledge helpful' },
  { id: 'advanced', name: 'Advanced', color: 'bg-red-500', description: 'Requires solid blockchain foundation' }
];
