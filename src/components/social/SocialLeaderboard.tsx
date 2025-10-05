import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ShareButtons from './ShareButtons';
import { useSocial } from '@/hooks/useSocial';

interface SocialPlayer {
  address: string;
  username: string;
  score: number;
  achievements: number;
}

const mockPlayers: SocialPlayer[] = Array.from({ length: 10 }).map((_, i) => ({
  address: `0x${(Math.random().toString(16).slice(2).padEnd(40, '0')).slice(0,40)}`,
  username: ['CryptoKing','DeFiGuru','AvalancheHero','ChainChad','QuestQueen','RushRunner','GasSaver','BridgeBoss','YieldYak','SubZero'][i],
  score: 100000 - i * 4200,
  achievements: 20 - i
}));

const SocialLeaderboard: React.FC = () => {
  const { follow, unfollow, isFollowing } = useSocial();

  const top = useMemo(() => mockPlayers.slice(0, 5), []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Social Leaderboard</h1>
        <ShareButtons payload={{ title: 'Check my Avalanche Rush rank!', url: window.location.href, hashtags: ['Avalanche', 'Web3Gaming', 'AvalancheRush'] }} />
      </div>

      <Card className="bg-slate-800 border-slate-600 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Top Friends</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-700">
          {top.map((p, idx) => (
            <div key={p.address} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-slate-700 text-white w-10 justify-center">#{idx + 1}</Badge>
                <div>
                  <div className="text-white font-semibold">{p.username}</div>
                  <div className="text-slate-400 text-sm">{p.address.slice(0,6)}...{p.address.slice(-4)}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-white font-bold">{p.score.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">{p.achievements} achievements</div>
                </div>
                {isFollowing(p.address) ? (
                  <Button variant="outline" className="text-white border-slate-600" onClick={() => unfollow(p.address)}>Following</Button>
                ) : (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => follow(p.address)}>Follow</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Global Standings</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {mockPlayers.map((p, idx) => (
            <div key={p.address} className="flex items-center justify-between bg-slate-900 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-slate-300 border-slate-600">#{idx + 1}</Badge>
                <div>
                  <div className="text-white">{p.username}</div>
                  <div className="text-slate-500 text-xs">{p.address.slice(0,8)}...{p.address.slice(-6)}</div>
                </div>
              </div>
              <div className="text-white font-semibold">{p.score.toLocaleString()}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialLeaderboard;
