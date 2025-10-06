// @ts-nocheck - Wagmi v2 migration
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

/**
 * Gamified NFT System Hook
 * Integrates with GameNFTSystem, LootBoxNFT, and NFTMarketplace contracts
 */

export enum NFTType {
  ACHIEVEMENT = 0,
  POWERUP = 1,
  EVOLUTION = 2,
  LOOTBOX = 3,
  SPECIAL = 4,
  CHARACTER = 5 // Add character NFT type
}

export enum Rarity {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
  MYTHIC = 4
}

export interface NFTMetadata {
  nftType: NFTType;
  rarity: Rarity;
  level: number;
  experiencePoints: number;
  powerBonus: number;
  durationSeconds: number;
  createdAt: number;
  lastEvolved: number;
  isActive: boolean;
  category: string;
}

export interface NFTCharacterMetadata extends NFTMetadata {
  characterClass: 'Rush Runner' | 'Guardian of the Towers' | 'Pixel Sharpshooter' | 'Tinker Tech';
  evolutionStage: number;
  skills: string[];
  ultimateAbility: string;
  storyArc: string;
}

export interface NFTDetails {
  tokenId: number;
  metadata: NFTMetadata;
  tokenURI: string;
}

export interface NFTCharacterDetails extends NFTDetails {
  characterMetadata: NFTCharacterMetadata;
}

export interface PlayerStats {
  totalNFTs: number;
  achievementCount: number;
  powerUpCount: number;
  totalExperience: number;
  highestLevel: number;
}

export interface LootBoxInfo {
  name: string;
  tier: number;
  cooldownSeconds: number;
  isActive: boolean;
}

export interface MarketListing {
  listingId: number;
  seller: string;
  tokenId: number;
  price: string;
  listedAt: number;
  isActive: boolean;
}

const NFT_SYSTEM_ABI = [
  'function mintAchievementNFT(address player, string memory category, string memory tokenURI, uint8 rarity) external returns (uint256)',
  'function mintPowerUpNFT(address player, string memory tokenURI, uint256 powerBonus, uint256 durationSeconds, uint8 rarity) external returns (uint256)',
  'function evolveNFT(uint256 tokenId) external',
  'function activatePowerUp(uint256 tokenId) external',
  'function addExperience(uint256 tokenId, uint256 amount) external',
  'function getPlayerNFTs(address player) external view returns (uint256[])',
  'function getNFTDetails(uint256 tokenId) external view returns (tuple(uint8 nftType, uint8 rarity, uint256 level, uint256 experiencePoints, uint256 powerBonus, uint256 durationSeconds, uint256 createdAt, uint256 lastEvolved, bool isActive, string category), string)',
  'function playerStats(address) external view returns (uint256 totalNFTs, uint256 achievementCount, uint256 powerUpCount, uint256 totalExperience, uint256 highestLevel)',
  'function getPlayerPowerBonus(address player) external view returns (uint256)',
  'event NFTMinted(address indexed player, uint256 indexed tokenId, uint8 nftType, uint8 rarity, string category)',
  'event NFTEvolved(uint256 indexed tokenId, uint256 newLevel, string newURI)',
  'event PowerUpActivated(address indexed player, uint256 indexed tokenId, uint256 expiresAt)'
];

const LOOTBOX_ABI = [
  'function openLootBox(uint256 lootBoxId) external returns (uint256)',
  'function canOpenLootBox(address player, uint256 lootBoxId) external view returns (bool eligible, bool cooledDown)',
  'function getPlayerStats(address player) external view returns (uint256 totalOpened, uint256 totalRewards, uint256 lastOpened)',
  'function lootBoxes(uint256) external view returns (string name, uint8 tier, uint256 cooldownSeconds, bool isActive)',
  'event LootBoxOpened(address indexed player, uint256 indexed lootBoxId, uint256 indexed tokenId, uint8 rarity)'
];

const MARKETPLACE_ABI = [
  'function listNFT(uint256 tokenId, uint256 price) external returns (uint256)',
  'function buyNFT(uint256 listingId) external',
  'function cancelListing(uint256 listingId) external',
  'function makeOffer(uint256 listingId, uint256 amount, uint256 duration) external',
  'function getActiveListings() external view returns (tuple(address seller, uint256 tokenId, uint256 price, uint256 listedAt, bool isActive)[])',
  'function marketStats() external view returns (uint256 totalListings, uint256 totalSales, uint256 totalVolume, uint256 averagePrice)',
  'event NFTListed(uint256 indexed listingId, address indexed seller, uint256 indexed tokenId, uint256 price)',
  'event NFTSold(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 tokenId, uint256 price)'
];

const NFT_SYSTEM_ADDRESS = process.env.VITE_NFT_SYSTEM || '';
const LOOTBOX_ADDRESS = process.env.VITE_LOOTBOX || '';
const MARKETPLACE_ADDRESS = process.env.VITE_MARKETPLACE || '';

export function useNFTSystem() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [playerNFTs, setPlayerNFTs] = useState<NFTDetails[]>([]);
  const [playerCharacters, setPlayerCharacters] = useState<NFTCharacterDetails[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [powerBonus, setPowerBonus] = useState<number>(0);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load player's NFT collection
   */
  const loadPlayerNFTs = useCallback(async () => {
    if (!provider || !address || !NFT_SYSTEM_ADDRESS) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(NFT_SYSTEM_ADDRESS, NFT_SYSTEM_ABI, provider);

      // Get token IDs
      const tokenIds: ethers.BigNumber[] = await contract.getPlayerNFTs(address);

      // Get details for each NFT
      const nftDetails: NFTDetails[] = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const [metadata, uri] = await contract.getNFTDetails(tokenId);
          return {
            tokenId: tokenId.toNumber(),
            metadata: {
              nftType: metadata.nftType,
              rarity: metadata.rarity,
              level: metadata.level.toNumber(),
              experiencePoints: metadata.experiencePoints.toNumber(),
              powerBonus: metadata.powerBonus.toNumber(),
              durationSeconds: metadata.durationSeconds.toNumber(),
              createdAt: metadata.createdAt.toNumber(),
              lastEvolved: metadata.lastEvolved.toNumber(),
              isActive: metadata.isActive,
              category: metadata.category
            },
            tokenURI: uri
          };
        })
      );

      setPlayerNFTs(nftDetails);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address]);

  /**
   * Load player statistics
   */
  const loadPlayerStats = useCallback(async () => {
    if (!provider || !address || !NFT_SYSTEM_ADDRESS) return;

    try {
      const contract = new ethers.Contract(NFT_SYSTEM_ADDRESS, NFT_SYSTEM_ABI, provider);
      const stats = await contract.playerStats(address);

      setPlayerStats({
        totalNFTs: stats.totalNFTs.toNumber(),
        achievementCount: stats.achievementCount.toNumber(),
        powerUpCount: stats.powerUpCount.toNumber(),
        totalExperience: stats.totalExperience.toNumber(),
        highestLevel: stats.highestLevel.toNumber()
      });

      // Get power bonus
      const bonus = await contract.getPlayerPowerBonus(address);
      setPowerBonus(bonus.toNumber());
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [provider, address]);

  /**
   * Evolve NFT to next level
   */
  const evolveNFT = useCallback(async (tokenId: number) => {
    if (!signer || !NFT_SYSTEM_ADDRESS) throw new Error('Wallet not connected');

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(NFT_SYSTEM_ADDRESS, NFT_SYSTEM_ABI, signer);
      const tx = await contract.evolveNFT(tokenId);
      await tx.wait();

      await loadPlayerNFTs();
      return tx;
    } catch (error) {
      console.error('Error evolving NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, loadPlayerNFTs]);

  /**
   * Activate power-up NFT
   */
  const activatePowerUp = useCallback(async (tokenId: number) => {
    if (!signer || !NFT_SYSTEM_ADDRESS) throw new Error('Wallet not connected');

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(NFT_SYSTEM_ADDRESS, NFT_SYSTEM_ABI, signer);
      const tx = await contract.activatePowerUp(tokenId);
      await tx.wait();

      await loadPlayerNFTs();
      await loadPlayerStats();
      return tx;
    } catch (error) {
      console.error('Error activating power-up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, loadPlayerNFTs, loadPlayerStats]);

  /**
   * Open loot box
   */
  const openLootBox = useCallback(async (lootBoxId: number) => {
    if (!signer || !LOOTBOX_ADDRESS) throw new Error('Wallet not connected');

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(LOOTBOX_ADDRESS, LOOTBOX_ABI, signer);
      const tx = await contract.openLootBox(lootBoxId);
      const receipt = await tx.wait();

      // Get minted NFT ID from event
      const event = receipt.events?.find((e: any) => e.event === 'LootBoxOpened');
      const tokenId = event?.args?.tokenId;

      await loadPlayerNFTs();
      return { tx, tokenId };
    } catch (error) {
      console.error('Error opening loot box:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, loadPlayerNFTs]);

  /**
   * Check loot box eligibility
   */
  const checkLootBoxEligibility = useCallback(async (lootBoxId: number) => {
    if (!provider || !address || !LOOTBOX_ADDRESS) return { eligible: false, cooledDown: false };

    try {
      const contract = new ethers.Contract(LOOTBOX_ADDRESS, LOOTBOX_ABI, provider);
      const [eligible, cooledDown] = await contract.canOpenLootBox(address, lootBoxId);
      return { eligible, cooledDown };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return { eligible: false, cooledDown: false };
    }
  }, [provider, address]);

  /**
   * List NFT on marketplace
   */
  const listNFTForSale = useCallback(async (tokenId: number, priceInTokens: string) => {
    if (!signer || !MARKETPLACE_ADDRESS) throw new Error('Wallet not connected');

    setIsLoading(true);
    try {
      const price = ethers.parseEther(priceInTokens);
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      // First approve marketplace
      const nftContract = new ethers.Contract(
        NFT_SYSTEM_ADDRESS,
        ['function approve(address to, uint256 tokenId) external'],
        signer
      );
      const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await approveTx.wait();

      // Then list
      const tx = await contract.listNFT(tokenId, price);
      await tx.wait();

      await loadPlayerNFTs();
      return tx;
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, loadPlayerNFTs]);

  /**
   * Buy NFT from marketplace
   */
  const buyNFT = useCallback(async (listingId: number, price: string) => {
    if (!signer || !MARKETPLACE_ADDRESS) throw new Error('Wallet not connected');

    setIsLoading(true);
    try {
      // Approve payment token
      const paymentToken = new ethers.Contract(
        process.env.VITE_RUSH_TOKEN || '',
        ['function approve(address spender, uint256 amount) external'],
        signer
      );
      const approveTx = await paymentToken.approve(
        MARKETPLACE_ADDRESS,
        ethers.parseEther(price)
      );
      await approveTx.wait();

      // Buy NFT
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      const tx = await contract.buyNFT(listingId);
      await tx.wait();

      await loadPlayerNFTs();
      return tx;
    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, loadPlayerNFTs]);

  /**
   * Load marketplace listings
   */
  const loadMarketListings = useCallback(async () => {
    if (!provider || !MARKETPLACE_ADDRESS) return;

    try {
      const contract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      const listings = await contract.getActiveListings();

      const formatted: MarketListing[] = listings.map((listing: any, index: number) => ({
        listingId: index + 1,
        seller: listing.seller,
        tokenId: listing.tokenId.toNumber(),
        price: ethers.formatEther(listing.price),
        listedAt: listing.listedAt.toNumber(),
        isActive: listing.isActive
      }));

      setMarketListings(formatted);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  }, [provider]);

  // Initial load
  useEffect(() => {
    if (address) {
      loadPlayerNFTs();
      loadPlayerStats();
    }
  }, [address, loadPlayerNFTs, loadPlayerStats]);

  // Load marketplace
  useEffect(() => {
    loadMarketListings();
  }, [loadMarketListings]);

  useEffect(() => {
    // Load character NFTs
    async function loadCharacters() {
      if (!provider || !address || !NFT_SYSTEM_ADDRESS) return;

      try {
        const contract = new ethers.Contract(NFT_SYSTEM_ADDRESS, NFT_SYSTEM_ABI, provider);

        // Get token IDs
        const tokenIds: ethers.BigNumber[] = await contract.getPlayerNFTs(address);

        // Get details for each character NFT
        const characterNFTs: NFTCharacterDetails[] = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const [metadata, uri] = await contract.getNFTDetails(tokenId);
            if (metadata.nftType === NFTType.CHARACTER) {
              return {
                tokenId: tokenId.toNumber(),
                metadata: {
                  nftType: metadata.nftType,
                  rarity: metadata.rarity,
                  level: metadata.level.toNumber(),
                  experiencePoints: metadata.experiencePoints.toNumber(),
                  powerBonus: metadata.powerBonus.toNumber(),
                  durationSeconds: metadata.durationSeconds.toNumber(),
                  createdAt: metadata.createdAt.toNumber(),
                  lastEvolved: metadata.lastEvolved.toNumber(),
                  isActive: metadata.isActive,
                  category: metadata.category,
                  characterClass: metadata.category,
                  evolutionStage: metadata.level.toNumber(),
                  skills: metadata.skills || [],
                  ultimateAbility: metadata.ultimateAbility || '',
                  storyArc: metadata.storyArc || ''
                },
                tokenURI: uri,
                characterMetadata: {
                  ...metadata,
                  characterClass: metadata.category,
                  evolutionStage: metadata.level,
                  skills: metadata.skills || [],
                  ultimateAbility: metadata.ultimateAbility || '',
                  storyArc: metadata.storyArc || ''
                }
              };
            }
          })
        );

        setPlayerCharacters(characterNFTs.filter(Boolean));
      } catch (error) {
        console.error('Error loading character NFTs:', error);
      }
    }

    loadCharacters();
  }, [provider, address]);

  // Evolution function for character NFTs
  const evolveCharacter = useCallback(
    async (tokenId: number) => {
      if (!signer || !NFT_SYSTEM_ADDRESS) throw new Error('Wallet not connected');

      setIsLoading(true);
      try {
        const contract = new ethers.Contract(NFT_SYSTEM_ADDRESS, NFT_SYSTEM_ABI, signer);
        const tx = await contract.evolveNFT(tokenId);
        await tx.wait();

        // Reload character data
        const updatedCharacter = await contract.getNFTDetails(tokenId);
        setPlayerCharacters((prev) =>
          prev.map((char) => (char.tokenId === tokenId ? { ...char, metadata: updatedCharacter } : char))
        );
        return tx;
      } catch (error) {
        console.error('Error evolving character:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer]
  );

  // Award XP to character NFT
  const awardCharacterXP = useCallback(
    async (tokenId: number, xp: number) => {
      if (!signer || !NFT_SYSTEM_ADDRESS) throw new Error('Wallet not connected');

      setIsLoading(true);
      try {
        const contract = new ethers.Contract(NFT_SYSTEM_ADDRESS, NFT_SYSTEM_ABI, signer);
        const tx = await contract.addExperience(tokenId, xp);
        await tx.wait();

        // Reload character data
        const updatedCharacter = await contract.getNFTDetails(tokenId);
        setPlayerCharacters((prev) =>
          prev.map((char) => (char.tokenId === tokenId ? { ...char, metadata: updatedCharacter } : char))
        );
        return tx;
      } catch (error) {
        console.error('Error awarding XP to character:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer]
  );

  return {
    // State
    playerNFTs,
    playerCharacters,
    playerStats,
    powerBonus,
    marketListings,
    isLoading,

    // Actions
    loadPlayerNFTs,
    loadPlayerStats,
    evolveNFT,
    activatePowerUp,
    openLootBox,
    checkLootBoxEligibility,
    listNFTForSale,
    buyNFT,
    loadMarketListings,
    evolveCharacter,
    awardCharacterXP
  };
}

export default useNFTSystem;
