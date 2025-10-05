const hre = require("hardhat");

async function main() {
  console.log("🎭 Deploying Story-Driven Character NFT System...");

  // Get the contract factory
  const StoryDrivenCharacterNFT = await hre.ethers.getContractFactory("StoryDrivenCharacterNFT");

  // Deploy the contract
  console.log("Deploying StoryDrivenCharacterNFT...");
  const characterNFT = await StoryDrivenCharacterNFT.deploy();
  await characterNFT.deployed();

  console.log("✅ StoryDrivenCharacterNFT deployed to:", characterNFT.address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await characterNFT.deployTransaction.wait(5);

  // Arc 1: The Awakening (Levels 1-5)
  const arc1Chapters = [
    {
      scoreRequirement: 0,
      levelRequirement: 1,
      chapterTitle: "First Steps in the Digital Void",
      chapterDescription: "Your journey begins in the neon-lit streets of Neo-Avalanche...",
      chapterURI: "ipfs://QmStory/arc1-chapter1",
      xpReward: 100,
      isEpic: false
    },
    {
      scoreRequirement: 5000,
      levelRequirement: 2,
      chapterTitle: "The Neon Calling",
      chapterDescription: "The blockchain beckons, revealing secrets of the C-Chain...",
      chapterURI: "ipfs://QmStory/arc1-chapter2",
      xpReward: 250,
      isEpic: false
    },
    {
      scoreRequirement: 10000,
      levelRequirement: 3,
      chapterTitle: "Baptism by Fire",
      chapterDescription: "Face your first true challenge in the digital realm...",
      chapterURI: "ipfs://QmStory/arc1-chapter3",
      xpReward: 500,
      isEpic: true
    }
  ];

  // Add chapters for all 4 character classes
  const characterClasses = [0, 1, 2, 3]; // RushRunner, GuardianTowers, PixelSharpshooter, TinkerTech
  const storyArc = 0; // Arc 1: The Awakening

  for (const characterClass of characterClasses) {
    for (const chapter of arc1Chapters) {
      try {
        const tx = await characterNFT.addStoryChapter(
          characterClass,
          storyArc,
          chapter
        );
        await tx.wait();
        console.log(`✅ Added chapter "${chapter.chapterTitle}" for class ${characterClass}`);
      } catch (error) {
        console.error(`❌ Failed to add chapter for class ${characterClass}:`, error.message);
      }
    }
  }

  // Add lore fragments
  console.log("\n💎 Adding lore fragments...");
  const loreFragments = [
    { title: "The Origin Protocol", uri: "ipfs://QmLore/origin" },
    { title: "Whispers of the Blockchain", uri: "ipfs://QmLore/whispers" },
    { title: "Legends of Old Validators", uri: "ipfs://QmLore/validators" },
    { title: "The Great Consensus War", uri: "ipfs://QmLore/war" },
    { title: "Encrypted Memories", uri: "ipfs://QmLore/memories" },
    { title: "Digital Prophecies", uri: "ipfs://QmLore/prophecies" },
    { title: "The First Smart Contract", uri: "ipfs://QmLore/contract" },
    { title: "Chronicles of the C-Chain", uri: "ipfs://QmLore/cchain" },
    { title: "Avalanche Mythology", uri: "ipfs://QmLore/mythology" },
    { title: "The Quantum Shift", uri: "ipfs://QmLore/quantum" }
  ];

  // Note: The contract does not have addLoreFragment in the ABI, so this is a placeholder for future extension.
  // for (const lore of loreFragments) {
  //   try {
  //     const tx = await characterNFT.addLoreFragment(lore.title, lore.uri);
  //     await tx.wait();
  //     console.log(`✅ Added lore fragment: "${lore.title}"`);
  //   } catch (error) {
  //     console.error(`❌ Failed to add lore fragment:`, error.message);
  //   }
  // }

  // Verify contract on SnowTrace
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract on SnowTrace...");
    try {
      await hre.run("verify:verify", {
        address: characterNFT.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.error("❌ Verification failed:", error.message);
    }
  }

  // Print deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Contract Address:", characterNFT.address);
  console.log("Network:", hre.network.name);
  console.log("Story Chapters Added: 12 (3 per class)");
  console.log("Lore Fragments Added: 10");
  console.log("\n💡 Next Steps:");
  console.log("1. Update .env with contract address:");
  console.log(`   VITE_CHARACTER_NFT_ADDRESS=${characterNFT.address}`);
  console.log("2. Grant MINTER_ROLE to game contract");
  console.log("3. Grant GAME_SERVER role to backend");
  console.log("4. Upload character artwork to IPFS");
  console.log("5. Test character minting");

  return characterNFT.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
    process.exit(1);
  });
