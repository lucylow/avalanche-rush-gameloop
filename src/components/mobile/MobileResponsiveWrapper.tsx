import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AvalancheRushGame from '../game/AvalancheRushGame';
import MobileAvalancheRushGame from './MobileAvalancheRushGame';

interface MobileResponsiveWrapperProps {
  children?: React.ReactNode;
}

const MobileResponsiveWrapper: React.FC<MobileResponsiveWrapperProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Detect screen size and device type
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // Initial check
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Show loading while detecting screen size
  if (screenSize.width === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop/Tablet Version */}
      <AnimatePresence mode="wait">
        {!isMobile && (
          <motion.div
            key="desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children || <AvalancheRushGame />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Version */}
      <AnimatePresence mode="wait">
        {isMobile && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MobileAvalancheRushGame />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Type Indicator (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono">
          {isMobile ? '📱 Mobile' : isTablet ? '📱 Tablet' : '💻 Desktop'} 
          ({screenSize.width}x{screenSize.height})
        </div>
      )}
    </div>
  );
};

export default MobileResponsiveWrapper;





