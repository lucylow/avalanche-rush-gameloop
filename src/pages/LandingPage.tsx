import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { LiveLeaderboard } from '@/components/landing/LiveLeaderboard';
import { AchievementsShowcase } from '@/components/landing/AchievementsShowcase';
import { FeaturesSection } from '@/components/landing/FeaturesSection';

/**
 * Main Landing Page
 *
 * Beautiful, modern landing page with:
 * - Animated hero section
 * - Live leaderboard with real-time stats
 * - Gamified achievements showcase
 * - Feature highlights
 * - Call-to-action sections
 */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Live Leaderboard */}
      <LiveLeaderboard />

      {/* Achievements Showcase */}
      <AchievementsShowcase />

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Ready to Dominate?
          </h2>
          <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
            Join thousands of players earning AVAX rewards on the fastest blockchain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-5 bg-white text-purple-900 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl">
              Start Playing Now →
            </button>
            <button className="px-10 py-5 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-purple-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                Avalanche Rush
              </h3>
              <p className="text-gray-400 text-sm">
                The fastest blockchain gaming experience on Avalanche Network
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Game</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Play Now</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Leaderboard</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Tournaments</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Achievements</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">NFTs</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">My Collection</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Loot Boxes</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Evolution Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/20 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2025 Avalanche Rush. Built on Avalanche ⛰️</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
