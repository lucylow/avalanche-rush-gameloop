# 🏔️ Avalanche Rush - Blockchain Gaming Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?logo=avalanche&logoColor=white)](https://www.avax.network/)

Educational gaming platform that rewards players for learning and interacting with DeFi protocols on Avalanche.

## 🎯 Overview

Avalanche Rush is a learn-to-earn gaming platform featuring:
- 🎮 **Educational Gaming** - Learn DeFi while playing engaging games
- 🏆 **NFT System** - Achievement, power-up, and character NFTs
- 🎁 **Loot Box System** - 5 tiers of rewards (Bronze to Mythic)
- 📊 **Analytics Dashboard** - Track your progress and stats
- 🌐 **Multi-Chain Support** - Built for Avalanche C-Chain

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Avalanche Fuji testnet AVAX

### Installation

```bash
# Clone and install
git clone https://github.com/your-username/avalanche-rush.git
cd avalanche-rush
npm install

# Setup environment
cp env.example .env
# Edit .env with your contract addresses

# Start development server
npm run dev
```

Visit `http://localhost:8082` and start playing!

## 🎮 Features

### Game Modes
- **🏃 Rush Runner** - Fast-paced obstacle course
- **🏰 Tower Defense** - Strategic defense gameplay
- **🎯 Pixel Shooter** - Classic arcade action
- **🔧 Puzzle Mode** - Brain-teasing challenges

### NFT Ecosystem
- **Achievement NFTs** - Unlock by completing challenges
- **Power-Up NFTs** - Boost your gameplay stats
- **Character NFTs** - Unique playable characters with abilities
- **Evolution System** - Level up your NFTs
- **Marketplace** - Trade NFTs with other players

### Loot Box System
Five tiers of loot boxes with increasing rarity drops:
- 🥉 Bronze (70% Common, 25% Rare, 5% Epic)
- 🥈 Silver (50% Common, 35% Rare, 15% Epic)
- 🥇 Gold (30% Rare, 50% Epic, 20% Legendary)
- 💎 Diamond (20% Epic, 60% Legendary, 20% Mythic)
- ✨ Mythic (100% Mythic with bonus rewards)

## 📚 Documentation

Detailed documentation is available in the [`docs/`](./docs) folder:

### Getting Started
- [Game Features Guide](./docs/GAME_FEATURES.md) - Overview of all game features
- [New Features Summary](./docs/NEW_FEATURES_SUMMARY.md) - Latest additions and updates

### NFT System
- [NFT Implementation Guide](./docs/GAMIFIED_NFT_GUIDE.md) - Complete NFT system guide
- [NFT Quick Reference](./docs/NFT_QUICK_REFERENCE.md) - Quick reference for developers
- [NFT Implementation Summary](./docs/NFT_IMPLEMENTATION_SUMMARY.md) - Technical details

### Character System
- [Character System Guide](./docs/CHARACTER_SYSTEM_GUIDE.md) - Character abilities and progression
- [Character Implementation](./docs/CHARACTER_SYSTEM_IMPLEMENTATION.md) - Technical implementation

### Integration & Development
- [Integration Examples](./docs/INTEGRATION_EXAMPLE.md) - Code examples for integration
- [Landing Page Guide](./docs/LANDING_PAGE_GUIDE.md) - Landing page customization
- [Enhanced Rewards System](./docs/ENHANCED_REWARDS_SYSTEM_COMPLETE.md) - Reward mechanics

### Troubleshooting
- [Error Fixes Summary](./docs/ERROR_FIXES_SUMMARY.md) - Common issues and solutions
- [Fixes Applied](./docs/FIXES_APPLIED.md) - Recent bug fixes

## 💻 Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite for fast builds
- Tailwind CSS + shadcn/ui components
- Framer Motion for animations

**Blockchain**
- Solidity 0.8.x
- Ethers.js v6
- Wagmi v2 for Web3 integration
- Avalanche C-Chain

**Development**
- Hardhat for smart contract development
- ESLint + TypeScript for code quality
- Git for version control

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Smart Contract Development

```bash
# Deploy contracts to Avalanche Fuji
npx hardhat run scripts/deploy.js --network avalancheFuji

# Verify contracts
npx hardhat verify --network avalancheFuji <CONTRACT_ADDRESS>
```

## 📁 Project Structure

```
avalanche-rush/
├── src/
│   ├── components/     # React components
│   │   ├── game/       # Game-related components
│   │   ├── nft/        # NFT system components
│   │   ├── character/  # Character selection
│   │   └── ui/         # UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   └── lib/            # Utilities and config
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment scripts
├── docs/               # Documentation
└── public/             # Static assets
```

## 🎯 Roadmap

- [x] Core gameplay mechanics
- [x] NFT system implementation
- [x] Character selection system
- [x] Loot box mechanics
- [x] Marketplace integration
- [ ] Tournament system
- [ ] Guild features
- [ ] Cross-chain bridge
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Avalanche](https://www.avax.network/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Built with ❤️ for the Avalanche ecosystem**

For questions or support, please open an issue or visit our [documentation](./docs/).
