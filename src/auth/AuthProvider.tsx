import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface User {
  address?: string;
  guestId?: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  loginWithWallet: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  isConnecting: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const loginWithWallet = async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) throw new Error('No Ethereum wallet found.');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUser({ address, isGuest: false });
      localStorage.setItem('userAuth', JSON.stringify({ address, isGuest: false }));
    } catch (error) {
      setUser(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const continueAsGuest = () => {
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setUser({ guestId, isGuest: true });
    localStorage.setItem('userAuth', JSON.stringify({ guestId, isGuest: true }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userAuth');
  };

  useEffect(() => {
    const saved = localStorage.getItem('userAuth');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginWithWallet, continueAsGuest, logout, isConnecting }}>
      {children}
    </AuthContext.Provider>
  );
};
