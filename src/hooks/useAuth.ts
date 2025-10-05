import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  wallet_address?: string;
  subscription_tier: 'free' | 'premium' | 'pro';
  created_at: string;
  updated_at: string;
  web3_connected: boolean;
  total_rewards: number;
  nft_count: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          setAuthState({
            user: userData,
            isLoading: false,
            error: null,
            isAuthenticated: true
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
          isAuthenticated: false
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await fetchUserData(session.user.id);
          setAuthState({
            user: userData,
            isLoading: false,
            error: null,
            isAuthenticated: true
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const signUp = useCallback(async (email: string, password: string, username?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            username: username || email.split('@')[0],
            subscription_tier: 'free',
            web3_connected: false,
            total_rewards: 0,
            nft_count: 0
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        const userData = await fetchUserData(data.user.id);
        setAuthState({
          user: userData,
          isLoading: false,
          error: null,
          isAuthenticated: true
        });
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        setAuthState({
          user: userData,
          isLoading: false,
          error: null,
          isAuthenticated: true
        });
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const linkWallet = useCallback(async (walletAddress: string) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('users')
        .update({
          wallet_address: walletAddress,
          web3_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh user data
      const userData = await fetchUserData(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        user: userData,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to link wallet';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [authState.user]);

  const updateSubscription = useCallback(async (tier: 'free' | 'premium' | 'pro') => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh user data
      const userData = await fetchUserData(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        user: userData,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [authState.user]);

  const updateRewards = useCallback(async (amount: number) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          total_rewards: authState.user.total_rewards + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh user data
      const userData = await fetchUserData(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        user: userData
      }));
    } catch (error) {
      console.error('Failed to update rewards:', error);
      throw error;
    }
  }, [authState.user]);

  const updateNFTCount = useCallback(async (count: number) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          nft_count: authState.user.nft_count + count,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh user data
      const userData = await fetchUserData(authState.user.id);
      setAuthState(prev => ({
        ...prev,
        user: userData
      }));
    } catch (error) {
      console.error('Failed to update NFT count:', error);
      throw error;
    }
  }, [authState.user]);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    linkWallet,
    updateSubscription,
    updateRewards,
    updateNFTCount
  };
};
