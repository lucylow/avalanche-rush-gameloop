// Re-export the configured Supabase client
export { supabase } from "@/integrations/supabase/client";

// Re-export types for convenience
export type { Database, Tables } from "@/integrations/supabase/types";

// Basic types for the gaming app
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  level?: number;
  experience?: number;
  rush_tokens?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_mode: string;
  final_score: number;
  level_reached: number;
  duration_seconds: number;
  blockchain_tx_hash?: string;
  chain_id?: number;
  created_at?: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  level: number;
  chain_id: number;
  display_name?: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirements: Record<string, unknown>;
  created_at?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  objectives: Record<string, any>[];
  rewards: Record<string, any>;
  is_active: boolean;
  created_at?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}