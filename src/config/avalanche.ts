export const AVALANCHE_CONFIG = {
  networks: {
    mainnet: {
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      explorer: 'https://snowtrace.io'
    },
    testnet: {
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      explorer: 'https://testnet.snowtrace.io'
    }
  },
  contracts: {
    gameLeaderboard: import.meta.env.VITE_LEADERBOARD_ADDRESS,
    rushToken: import.meta.env.VITE_RUSH_TOKEN_ADDRESS,
    educationalNFT: import.meta.env.VITE_EDUCATIONAL_NFT_ADDRESS,
    mockDEX: import.meta.env.VITE_MOCK_DEX_ADDRESS,
    reactiveQuestEngine: import.meta.env.VITE_REACTIVE_QUEST_ENGINE_ADDRESS
  }
} as const;

export const getCurrentNetwork = () => {
  return import.meta.env.MODE === 'production'
    ? AVALANCHE_CONFIG.networks.mainnet
    : AVALANCHE_CONFIG.networks.testnet;
};
