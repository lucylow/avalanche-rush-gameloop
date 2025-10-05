// src/components/ui/navigation.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './button';
import { Badge } from './badge';
import { 
  Home,
  Gamepad2,
  Trophy,
  Medal,
  BookOpen,
  Mountain,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      icon: <Home className="h-4 w-4" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      path: '/play',
      label: 'Play Game',
      icon: <Gamepad2 className="h-4 w-4" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      path: '/leaderboard',
      label: 'Leaderboard',
      icon: <Trophy className="h-4 w-4" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      path: '/achievements',
      label: 'Achievements',
      icon: <Medal className="h-4 w-4" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      path: '/learn-web3',
      label: 'Learn Web3',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'from-blue-500 to-purple-500'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl px-6 py-3 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Mountain className="h-6 w-6 text-blue-500" />
              <span className="text-white font-bold text-lg">Avalanche Rush</span>
            </div>
            <div className="w-px h-6 bg-gray-600" />
            <div className="flex space-x-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  } transition-all duration-200`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
              <Mountain className="h-6 w-6 text-blue-500" />
              <span className="text-white font-bold text-lg">Avalanche Rush</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`${
                      isActive(item.path)
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    } w-full justify-start transition-all duration-200`}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                    {isActive(item.path) && (
                      <Badge className="ml-auto bg-white/20 text-white">
                        Active
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navigation;

