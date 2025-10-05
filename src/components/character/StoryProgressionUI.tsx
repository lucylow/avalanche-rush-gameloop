import { useState, useEffect } from 'react';
// import { useProvider } from 'wagmi'; // TODO: Update to wagmi v2
import { ethers } from 'ethers';
import { Card } from '@/components/ui/card';
import { Book, Lock, Sparkles, ChevronRight } from 'lucide-react';

const CHARACTER_CONTRACT_ADDRESS = process.env.VITE_CHARACTER_NFT_CONTRACT || '';

const CHARACTER_ABI = [
  'function getCharacterStats(uint256 tokenId) external view returns (tuple(uint8 class, uint256 level, uint256 experience, uint256 gamesPlayed, uint256 totalScore, uint256 currentArc, uint256 currentChapter, uint256 loreFragments))',
  'function getStoryContent(uint256 arc, uint256 chapter) external pure returns (string, string)',
];

interface StoryChapter {
  arc: number;
  chapter: number;
  title: string;
  content: string;
  unlocked: boolean;
}

// Story data for each character class
const STORY_ARCS = [
  {
    arc: 1,
    title: "The Awakening",
    chapters: [
      { chapter: 1, title: "First Steps", minLevel: 1 },
      { chapter: 2, title: "Discovery", minLevel: 3 },
      { chapter: 3, title: "The Challenge", minLevel: 5 }
    ]
  },
  {
    arc: 2,
    title: "Rising Power",
    chapters: [
      { chapter: 1, title: "New Abilities", minLevel: 8 },
      { chapter: 2, title: "The Mentor", minLevel: 10 },
      { chapter: 3, title: "Trial by Fire", minLevel: 12 }
    ]
  },
  {
    arc: 3,
    title: "The Dark Truth",
    chapters: [
      { chapter: 1, title: "Revelations", minLevel: 15 },
      { chapter: 2, title: "Betrayal", minLevel: 18 },
      { chapter: 3, title: "Descent", minLevel: 20 }
    ]
  },
  {
    arc: 4,
    title: "Redemption",
    chapters: [
      { chapter: 1, title: "Gathering Allies", minLevel: 23 },
      { chapter: 2, title: "Preparation", minLevel: 25 },
      { chapter: 3, title: "The Final Stand", minLevel: 28 }
    ]
  },
  {
    arc: 5,
    title: "Legacy",
    chapters: [
      { chapter: 1, title: "Victory", minLevel: 30 },
      { chapter: 2, title: "New Beginnings", minLevel: 32 },
      { chapter: 3, title: "Eternal Champion", minLevel: 35 }
    ]
  }
];

// Sample story content (would be fetched from contract in production)
const STORY_CONTENT: Record<string, { title: string; content: string }> = {
  "1-1": {
    title: "First Steps",
    content: "You awaken in a world where the blockchain's pulse echoes through reality itself. The Avalanche Rush calls to you, a test that will determine your destiny. Your journey begins now, warrior of the digital frontier."
  },
  "1-2": {
    title: "Discovery",
    content: "As you master the basics, you discover that this world is more than it seems. The RUSH tokens you collect hold real power, and the leaderboards tell stories of legendary champions who came before you."
  },
  "1-3": {
    title: "The Challenge",
    content: "Your skills are put to the test as increasingly difficult obstacles appear. You realize that to truly excel, you must not only be fast, but strategic. Every combo, every perfect dodge, builds your legend."
  },
  "2-1": {
    title: "New Abilities",
    content: "Your character evolves, unlocking new abilities that transform how you play. The blockchain itself seems to respond to your growth, opening new pathways and possibilities."
  },
  "2-2": {
    title: "The Mentor",
    content: "You encounter other players who have walked this path. They share wisdom about NFT strategies, tournament tactics, and the deeper mysteries of Avalanche Rush. You are no longer alone."
  },
  "3-1": {
    title: "Revelations",
    content: "You discover the truth about the Avalanche network - it's not just a game, but a gateway to something greater. The skills you've honed here have real-world applications in the web3 ecosystem."
  },
  "4-1": {
    title: "Gathering Allies",
    content: "You join forces with other champions, forming guilds and alliances. Together, you prepare for the ultimate tournaments where legends are made and massive rewards await."
  },
  "5-1": {
    title: "Victory",
    content: "You stand at the pinnacle of Avalanche Rush, a true champion of the blockchain. But you know this is not the end - it's the beginning of your journey as a web3 pioneer."
  }
};

export default function StoryProgressionUI({ characterId }: { characterId: number }) {
  // const provider = useProvider(); // TODO: Update to wagmi v2
  const provider = null;
  const [currentArc, setCurrentArc] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [characterLevel, setCharacterLevel] = useState(1);
  const [loreFragments, setLoreFragments] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCharacterProgress();
  }, [characterId, provider]);

  const loadCharacterProgress = async () => {
    if (!provider || !CHARACTER_CONTRACT_ADDRESS) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        CHARACTER_CONTRACT_ADDRESS,
        CHARACTER_ABI,
        provider
      );

      const stats = await contract.getCharacterStats(characterId);

      setCurrentArc(stats.currentArc.toNumber());
      setCurrentChapter(stats.currentChapter.toNumber());
      setCharacterLevel(stats.level.toNumber());
      setLoreFragments(stats.loreFragments.toNumber());
    } catch (error) {
      console.error('Error loading character progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isChapterUnlocked = (arc: number, chapter: number, minLevel: number) => {
    if (characterLevel >= minLevel) return true;
    if (arc < currentArc) return true;
    if (arc === currentArc && chapter <= currentChapter) return true;
    return false;
  };

  const getStoryContent = (arc: number, chapter: number) => {
    const key = `${arc}-${chapter}`;
    return STORY_CONTENT[key] || {
      title: `Arc ${arc} - Chapter ${chapter}`,
      content: "This chapter's story is yet to be written..."
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Your Story
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Unlock chapters by leveling up your character
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{characterLevel}</div>
              <div className="text-sm text-gray-400">Character Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{loreFragments}</div>
              <div className="text-sm text-gray-400">Lore Fragments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {currentArc}-{currentChapter}
              </div>
              <div className="text-sm text-gray-400">Current Chapter</div>
            </div>
          </div>
        </div>

        {/* Story Arcs */}
        <div className="space-y-8">
          {STORY_ARCS.map((arc) => (
            <Card key={arc.arc} className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentArc >= arc.arc
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                    : 'bg-slate-700'
                }`}>
                  <span className="text-xl font-bold text-white">{arc.arc}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{arc.title}</h2>
                  <p className="text-sm text-gray-400">Arc {arc.arc}</p>
                </div>
              </div>

              {/* Chapters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {arc.chapters.map((chap) => {
                  const unlocked = isChapterUnlocked(arc.arc, chap.chapter, chap.minLevel);
                  const content = getStoryContent(arc.arc, chap.chapter);

                  return (
                    <button
                      key={chap.chapter}
                      onClick={() => unlocked && setSelectedChapter({
                        arc: arc.arc,
                        chapter: chap.chapter,
                        title: content.title,
                        content: content.content,
                        unlocked
                      })}
                      disabled={!unlocked}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        unlocked
                          ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-purple-500 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer'
                          : 'bg-slate-900/50 border-slate-800 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {unlocked ? (
                            <Sparkles className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-600" />
                          )}
                          <span className="text-sm font-medium text-gray-400">
                            Chapter {chap.chapter}
                          </span>
                        </div>
                        {unlocked && <ChevronRight className="w-5 h-5 text-purple-400" />}
                      </div>
                      <h3 className={`text-lg font-bold mb-2 ${
                        unlocked ? 'text-white' : 'text-gray-600'
                      }`}>
                        {unlocked ? content.title : '???'}
                      </h3>
                      <div className="text-xs text-gray-500">
                        Requires Level {chap.minLevel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        {/* Chapter Modal */}
        {selectedChapter && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-purple-400 mb-1">
                    Arc {selectedChapter.arc} • Chapter {selectedChapter.chapter}
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {selectedChapter.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {selectedChapter.content}
                </p>
              </div>

              <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-700">
                <div className="text-sm text-gray-400">
                  Continue playing to unlock more chapters
                </div>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-bold"
                >
                  Continue Journey
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Lore Fragments Section */}
        {loreFragments > 0 && (
          <Card className="mt-8 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h3 className="text-2xl font-bold text-amber-300">Lore Fragments Discovered</h3>
            </div>
            <p className="text-gray-300 mb-4">
              You've discovered {loreFragments} lore fragment{loreFragments !== 1 ? 's' : ''}!
              These rare discoveries reveal hidden secrets about the Avalanche Rush universe.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: loreFragments }).map((_, i) => (
                <div
                  key={i}
                  className="p-3 bg-amber-900/30 rounded-lg border border-amber-600/30 text-center"
                >
                  <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <div className="text-xs text-amber-300">Fragment {i + 1}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
