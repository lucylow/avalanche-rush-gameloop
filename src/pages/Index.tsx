import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Trophy, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Award, 
  Target,
  ArrowRight,
  Sparkles,
  Gamepad2,
  Coins,
  Crown,
  Rocket,
  ChevronDown,
  CheckCircle,
  Globe,
  Lock,
  Gift
} from "lucide-react";
import EnhancedWalletConnector from "../components/ui/enhanced-wallet-connector";
import WalletTest from "../components/WalletTest";
import TutorialModal from "../components/TutorialModal";
import QuickStartGuide from "../components/QuickStartGuide";
import GameChatbot from "../components/GameChatbot";

const Index = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      const element = el as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="navbar fixed top-0 w-full px-8 py-6 flex justify-between items-center bg-black/20 backdrop-blur-xl z-50 transition-all duration-300 border-b border-white/10"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 text-2xl font-black"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-black">
            Avalanche Rush
          </span>
        </motion.div>
        <div className="hidden lg:flex gap-8">
          <a href="#features" className="text-white/80 hover:text-white transition-all duration-300 font-medium relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="#modes" className="text-white/80 hover:text-white transition-all duration-300 font-medium relative group">
            Game Modes
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="/play" className="text-white/80 hover:text-white transition-all duration-300 font-medium relative group">
            Play Now
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a href="/demo" className="text-white/80 hover:text-white transition-all duration-300 font-medium relative group">
            Demo
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>
        <motion.a 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          href="/play" 
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Play Free
        </motion.a>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-8 pt-20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30">
                <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  🚀 The Future of Gaming is Here
                </span>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-6xl lg:text-7xl font-black leading-tight"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Learn Web3
              </span>
              <br />
              <span className="text-white">
                While Chasing
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                High Scores
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-white/80 leading-relaxed max-w-2xl"
            >
              The first learn-to-earn arcade game that bridges Web2 fun with Web3 ownership. 
              Play, learn, and earn real rewards seamlessly on Avalanche.
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTutorial(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-3 justify-center group"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Learn How to Play
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="/play" 
                className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center gap-3 justify-center backdrop-blur-sm"
              >
                <Gamepad2 className="w-5 h-5" />
                Start Gaming
              </motion.a>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex gap-8 pt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">15,000+</div>
                <div className="text-sm text-white/60">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">$250K+</div>
                <div className="text-sm text-white/60">Rewards Distributed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">4.8★</div>
                <div className="text-sm text-white/60">Player Rating</div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center relative"
          >
            <div className="relative">
              {/* Main Game Preview */}
              <div className="w-full max-w-lg h-96 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl overflow-hidden shadow-2xl relative border border-white/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-8 left-8 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute top-16 right-12 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-24 left-16 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                
                {/* Game Character */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-20 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl relative shadow-lg"
                  >
                    <div className="absolute top-4 left-2 right-2 h-6 bg-white/20 rounded-lg"></div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-white/10 rounded-full"></div>
                  </motion.div>
                </div>
                
                {/* Coins */}
                <div className="absolute bottom-8 left-8 flex gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                  >
                    <Coins className="w-4 h-4 text-white" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
                    className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
                  >
                    <Coins className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
                
                {/* Score Display */}
                <div className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-white font-bold text-lg">12,450</div>
                  <div className="text-white/60 text-xs">HIGH SCORE</div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 shadow-lg"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl p-4 shadow-lg"
              >
                <Star className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-white/60"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Why Players Love
              </span>
              <br />
              <span className="text-white">Avalanche Rush</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Experience the future of gaming where your skills translate into real value and ownership
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">True Ownership</h3>
                <p className="text-white/70 leading-relaxed">
                  Earn NFTs and tokens that you truly own. Trade, sell, or use them across the Avalanche ecosystem.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Zero Friction</h3>
                <p className="text-white/70 leading-relaxed">
                  Web2 players enjoy seamless gameplay with email signup, while Web3 enthusiasts get full control.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Tournament Ready</h3>
                <p className="text-white/70 leading-relaxed">
                  Compete in global tournaments on Funtico with real prize pools and live leaderboards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section id="modes" className="py-24 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl lg:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Multiple Ways
              </span>
              <br />
              <span className="text-white">to Play & Earn</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Choose your adventure and start earning today with our diverse game modes
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 relative"
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
                <div className="relative z-10">
                  <Target className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Adventure Mode</h3>
                  <p className="text-white/80">Learn Web3 Fundamentals</p>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Progressive quest system
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Educational content
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    NFT rewards for completion
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Perfect for beginners
                  </li>
                </ul>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/learn-web3" 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 block text-center group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Learning
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.a>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 relative"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-orange-600/20"></div>
                <div className="relative z-10">
                  <Trophy className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Tournament Mode</h3>
                  <p className="text-white/80">Compete for Real Prizes</p>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Global leaderboards
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Cash and crypto prizes
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Live events
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Skill-based matchmaking
                  </li>
                </ul>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/play" 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 block text-center group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Join Tournament
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.a>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 relative"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
                <div className="relative z-10">
                  <Crown className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Collection Mode</h3>
                  <p className="text-white/80">Build Your Digital Empire</p>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Rare NFT collectibles
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Trading marketplace
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Collection bonuses
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Social features
                  </li>
                </ul>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/play" 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 block text-center group"
                >
                  <span className="flex items-center justify-center gap-2">
                    View Collection
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="play" className="py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Ready to Start
              </span>
              <br />
              <span className="text-white">Your Adventure?</span>
            </h2>
            <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of players already earning while playing. No experience required.
            </p>
            <motion.a 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              href="/play" 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 inline-flex items-center gap-4 group"
            >
              <Rocket className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Launch Game Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <p className="mt-6 text-white/60 flex items-center justify-center gap-2">
              <Globe className="w-4 h-4" />
              No download required • Play instantly in your browser
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-xl py-16 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-3 text-2xl font-black mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-black">
                Avalanche Rush
              </span>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              The premier learn-to-earn arcade game on Avalanche. Bridging Web2 fun with Web3 ownership.
            </p>
            <div className="flex gap-4">
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-all duration-300 border border-white/20"
              >
                🐦
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-500/20 transition-all duration-300 border border-white/20"
              >
                💬
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-500/20 transition-all duration-300 border border-white/20"
              >
                📺
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }}
                href="#" 
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-green-500/20 transition-all duration-300 border border-white/20"
              >
                📱
              </motion.a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Game Links</h4>
            <ul className="space-y-3">
              <li><a href="/play" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Play Now</a></li>
              <li><a href="/tournaments" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Tournaments</a></li>
              <li><a href="/leaderboard" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Leaderboard</a></li>
              <li><a href="/marketplace" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Marketplace</a></li>
              <li><a href="/demo" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Demo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Resources</h4>
            <ul className="space-y-3">
              <li><a href="/docs" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Documentation</a></li>
              <li><a href="/blog" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Blog</a></li>
              <li><a href="/faq" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">FAQ</a></li>
              <li><a href="/support" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Support</a></li>
              <li><a href="/partners" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Partners</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Legal</h4>
            <ul className="space-y-3">
              <li><a href="/terms" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Terms of Service</a></li>
              <li><a href="/privacy" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Privacy Policy</a></li>
              <li><a href="/cookies" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Cookie Policy</a></li>
              <li><a href="/disclaimer" className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-white/10 text-white/60 text-sm">
          <p>&copy; 2024 Avalanche Rush. All rights reserved. | Built on Avalanche • Powered by Funtico</p>
        </div>
      </footer>

      {/* Tutorial Modal */}
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
      {/* Chatbot */}
      <GameChatbot />
    </div>
  );
};

export default Index;