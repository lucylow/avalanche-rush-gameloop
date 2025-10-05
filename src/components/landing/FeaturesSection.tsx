import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy, Wallet, Shield, Gamepad2, TrendingUp, Users, Sparkles } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Sub-second finality on Avalanche C-Chain ensures instant gameplay with zero lag',
      gradient: 'from-yellow-400 to-orange-500',
      stat: '<2s finality'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Competitive Tournaments',
      description: 'Join daily tournaments with real AVAX prizes and exclusive NFT rewards',
      gradient: 'from-purple-400 to-pink-500',
      stat: '24/7 tournaments'
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: 'Earn While Playing',
      description: 'Convert your skills into crypto rewards with our play-to-earn model',
      gradient: 'from-green-400 to-emerald-500',
      stat: '124K AVAX distributed'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'NFT Achievements',
      description: 'Unlock unique achievement NFTs, evolve them, and trade on the marketplace',
      gradient: 'from-blue-400 to-cyan-500',
      stat: '50+ NFTs available'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Fair',
      description: 'Blockchain-verified scores and transparent reward distribution',
      gradient: 'from-red-400 to-pink-500',
      stat: '100% on-chain'
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Power-Up System',
      description: 'Activate NFT power-ups for gameplay bonuses and score multipliers',
      gradient: 'from-indigo-400 to-purple-500',
      stat: '+50% max bonus'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Level Progression',
      description: 'Evolve your character NFTs with XP earned from gameplay',
      gradient: 'from-orange-400 to-red-500',
      stat: '100 levels'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Global Community',
      description: 'Compete with players worldwide on our live leaderboard',
      gradient: 'from-pink-400 to-rose-500',
      stat: '12K+ players'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/grid.svg')]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-2 bg-purple-500/20 border-purple-500/50 text-purple-300">
            <Sparkles className="w-4 h-4 mr-2" />
            Why Choose Avalanche Rush
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Next-Gen Gaming
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the perfect blend of high-speed blockchain technology and addictive gameplay
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden bg-slate-900/60 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 hover:scale-105"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <CardContent className="pt-6 relative z-10">
                {/* Icon */}
                <div className={`
                  inline-flex p-4 rounded-2xl mb-4
                  bg-gradient-to-br ${feature.gradient}
                  shadow-lg group-hover:shadow-2xl transition-shadow duration-300
                `}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-600 transition-all duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Stat Badge */}
                <Badge className="bg-purple-500/20 border-purple-500/50 text-purple-300">
                  {feature.stat}
                </Badge>
              </CardContent>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              99.9%
            </div>
            <div className="text-gray-400 font-medium">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600 mb-2">
              4,500
            </div>
            <div className="text-gray-400 font-medium">TPS</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
              $0.01
            </div>
            <div className="text-gray-400 font-medium">Avg. Fee</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2">
              1M+
            </div>
            <div className="text-gray-400 font-medium">Games Played</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
