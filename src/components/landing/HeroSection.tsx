import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Trophy, Zap, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    players: 12483,
    games: 342,
    rewards: 124560
  });

  useEffect(() => {
    // Animate numbers on load
    const interval = setInterval(() => {
      setStats(prev => ({
        players: prev.players + Math.floor(Math.random() * 5),
        games: prev.games + Math.floor(Math.random() * 3),
        rewards: prev.rewards + Math.floor(Math.random() * 100)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full mix-blend-multiply filter blur-xl animate-float"
              style={{
                background: `radial-gradient(circle, ${
                  ['rgba(147, 51, 234, 0.3)', 'rgba(59, 130, 246, 0.3)', 'rgba(236, 72, 153, 0.3)'][i % 3]
                }, transparent)`,
                width: `${Math.random() * 400 + 100}px`,
                height: `${Math.random() * 400 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Live Status Badge */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top duration-700">
            <Badge className="px-6 py-2 bg-green-500/20 border-green-500/50 text-green-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold">Live on Avalanche Network</span>
              </div>
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              Avalanche Rush
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              Experience the fastest blockchain gaming on Avalanche. Compete, earn NFTs, and dominate the leaderboard with lightning-fast gameplay.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/game')}
            >
              <Play className="w-6 h-6 mr-2" />
              Start Playing
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 px-8 py-6 text-lg font-bold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/nfts')}
            >
              <Trophy className="w-6 h-6 mr-2" />
              View NFTs
            </Button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            <StatCard
              icon={<Users className="w-8 h-8" />}
              value={stats.players.toLocaleString()}
              label="Active Players"
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Zap className="w-8 h-8" />}
              value={stats.games.toLocaleString()}
              label="Games Playing Now"
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              value={`${(stats.rewards / 1000).toFixed(1)}K`}
              label="AVAX Distributed"
              gradient="from-orange-500 to-red-500"
            />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            <FeatureCard
              icon="⚡"
              title="Instant Finality"
              description="Sub-second transactions on Avalanche's lightning-fast C-Chain"
            />
            <FeatureCard
              icon="🏆"
              title="Earn NFTs"
              description="Win unique achievement NFTs and trade them on the marketplace"
            />
            <FeatureCard
              icon="💰"
              title="Real Rewards"
              description="Compete in tournaments for AVAX prizes and exclusive power-ups"
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-purple-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradient: string;
}

function StatCard({ icon, value, label, gradient }: StatCardProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r opacity-75 blur group-hover:opacity-100 transition duration-300 rounded-2xl"
           style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
      <div className="relative bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20 mb-3`}>
          {icon}
        </div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400 font-medium">{label}</div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300" />
      <div className="relative bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 h-full">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default HeroSection;
