-- Avalanche Rush Supabase Database Schema
-- This schema supports the hackathon-winning features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    games_played INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    achievements TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{
        "theme": "dark",
        "notifications": true,
        "sound_enabled": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    level_reached INTEGER NOT NULL,
    power_ups_used INTEGER DEFAULT 0,
    chain_id INTEGER NOT NULL,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard entries table
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    chain_id INTEGER NOT NULL,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    xp_reward INTEGER NOT NULL,
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    requirements JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

-- Quests table
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('daily', 'weekly', 'special')),
    xp_reward INTEGER NOT NULL,
    token_reward INTEGER NOT NULL,
    requirements JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quests table
CREATE TABLE user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quest_id)
);

-- Cross-chain transactions table
CREATE TABLE cross_chain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    from_chain_id INTEGER NOT NULL,
    to_chain_id INTEGER NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    asset_id VARCHAR(100) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Reactive smart contract events table
CREATE TABLE reactive_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    block_number BIGINT NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL NOT NULL,
    chain_id INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at);
CREATE INDEX idx_leaderboard_entries_game_type ON leaderboard_entries(game_type);
CREATE INDEX idx_leaderboard_entries_chain_id ON leaderboard_entries(chain_id);
CREATE INDEX idx_leaderboard_entries_score ON leaderboard_entries(score DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_cross_chain_transactions_user_id ON cross_chain_transactions(user_id);
CREATE INDEX idx_reactive_events_chain_id ON reactive_events(chain_id);
CREATE INDEX idx_reactive_events_created_at ON reactive_events(created_at);
CREATE INDEX idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_entries_updated_at BEFORE UPDATE ON leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update leaderboard ranks
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS TRIGGER AS $$
BEGIN
    -- Update ranks for the specific game type and chain
    UPDATE leaderboard_entries 
    SET rank = subquery.rank
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) as rank
        FROM leaderboard_entries
        WHERE game_type = NEW.game_type AND chain_id = NEW.chain_id
    ) subquery
    WHERE leaderboard_entries.id = subquery.id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update ranks when leaderboard changes
CREATE TRIGGER update_leaderboard_ranks_trigger
    AFTER INSERT OR UPDATE ON leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION update_leaderboard_ranks();

-- Create function to calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE
        WHEN total_xp < 1000 THEN 1
        WHEN total_xp < 5000 THEN 2
        WHEN total_xp < 15000 THEN 3
        WHEN total_xp < 30000 THEN 4
        WHEN total_xp < 50000 THEN 5
        ELSE 6
    END;
END;
$$ language 'plpgsql';

-- Create function to update user level when XP changes
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level = calculate_user_level(NEW.total_xp);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update level when XP changes
CREATE TRIGGER update_user_level_trigger
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, xp_reward, rarity, requirements) VALUES
('First Steps', 'Complete your first game session', '🎮', 100, 'common', '{"type": "games_played", "value": 1}'),
('Score Hunter', 'Achieve a score of 10,000 or higher', '🏆', 500, 'rare', '{"type": "high_score", "value": 10000}'),
('Chain Explorer', 'Play games on 3 different chains', '🌐', 1000, 'epic', '{"type": "chains_played", "value": 3}'),
('Quest Master', 'Complete 10 quests', '📋', 750, 'rare', '{"type": "quests_completed", "value": 10}'),
('Power Player', 'Use 50 power-ups', '⚡', 300, 'common', '{"type": "power_ups_used", "value": 50}'),
('Legendary Gamer', 'Reach level 5', '👑', 2000, 'legendary', '{"type": "level", "value": 5}'),
('Cross-Chain Champion', 'Complete a cross-chain quest', '🔗', 1500, 'epic', '{"type": "cross_chain_quest", "value": 1}'),
('Speed Demon', 'Complete a game in under 60 seconds', '⚡', 400, 'rare', '{"type": "fast_completion", "value": 60}'),
('Achievement Collector', 'Unlock 20 achievements', '🏅', 1000, 'epic', '{"type": "achievements_unlocked", "value": 20}'),
('Daily Grinder', 'Play for 7 consecutive days', '📅', 800, 'rare', '{"type": "consecutive_days", "value": 7}');

-- Insert sample quests
INSERT INTO quests (title, description, type, xp_reward, token_reward, requirements) VALUES
('Daily Challenge', 'Play 3 games today', 'daily', 200, 50, '{"type": "games_played", "value": 3}'),
('Weekly Warrior', 'Achieve a total score of 50,000 this week', 'weekly', 1000, 250, '{"type": "weekly_score", "value": 50000}'),
('Chain Hopper', 'Play on 2 different chains', 'daily', 300, 75, '{"type": "chains_played", "value": 2}'),
('Power Up Master', 'Use 10 power-ups in a single game', 'daily', 150, 25, '{"type": "power_ups_single_game", "value": 10}'),
('Score Surge', 'Improve your best score by 5,000 points', 'weekly', 800, 200, '{"type": "score_improvement", "value": 5000}'),
('Achievement Hunter', 'Unlock 3 new achievements', 'weekly', 600, 150, '{"type": "achievements_unlocked", "value": 3}'),
('Cross-Chain Explorer', 'Complete a quest on Avalanche and Ethereum', 'special', 1500, 500, '{"type": "cross_chain_quest", "value": 1}'),
('Speed Runner', 'Complete 5 games in under 2 minutes each', 'daily', 400, 100, '{"type": "fast_games", "value": 5}'),
('Level Up', 'Gain 2 levels', 'weekly', 1000, 300, '{"type": "level_gain", "value": 2}'),
('Social Player', 'Share your score on social media', 'special', 200, 50, '{"type": "social_share", "value": 1}');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_chain_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game sessions policies
CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard entries policies (public read, authenticated write)
CREATE POLICY "Anyone can view leaderboard" ON leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own leaderboard entries" ON leaderboard_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entries" ON leaderboard_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User quests policies
CREATE POLICY "Users can view own quests" ON user_quests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests" ON user_quests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON user_quests
    FOR UPDATE USING (auth.uid() = user_id);

-- Cross-chain transactions policies
CREATE POLICY "Users can view own transactions" ON cross_chain_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON cross_chain_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for achievements and quests
CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view quests" ON quests
    FOR SELECT USING (true);

-- Public read access for reactive events and performance metrics
CREATE POLICY "Anyone can view reactive events" ON reactive_events
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view performance metrics" ON performance_metrics
    FOR SELECT USING (true);

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.wallet_address,
    up.username,
    up.total_xp,
    up.level,
    up.games_played,
    up.best_score,
    up.achievements,
    COUNT(gs.id) as total_sessions,
    AVG(gs.score) as average_score,
    MAX(gs.score) as highest_score,
    COUNT(ua.id) as achievements_unlocked,
    COUNT(uq.id) as quests_completed
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN game_sessions gs ON u.id = gs.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN user_quests uq ON u.id = uq.user_id AND uq.completed = true
GROUP BY u.id, u.email, u.wallet_address, up.username, up.total_xp, up.level, up.games_played, up.best_score, up.achievements;

-- Create view for leaderboard with user info
CREATE VIEW leaderboard_with_users AS
SELECT 
    le.id,
    le.user_id,
    le.username,
    le.score,
    le.game_type,
    le.chain_id,
    le.rank,
    le.created_at,
    le.updated_at,
    up.avatar_url,
    up.level
FROM leaderboard_entries le
LEFT JOIN user_profiles up ON le.user_id = up.user_id
ORDER BY le.score DESC;

-- Create function to get user's rank
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID, p_game_type VARCHAR, p_chain_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank INTO user_rank
    FROM leaderboard_entries
    WHERE user_id = p_user_id 
    AND game_type = p_game_type 
    AND chain_id = p_chain_id;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ language 'plpgsql';

-- Create function to get top players
CREATE OR REPLACE FUNCTION get_top_players(p_game_type VARCHAR, p_chain_id INTEGER, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    rank INTEGER,
    user_id UUID,
    username VARCHAR,
    score INTEGER,
    avatar_url TEXT,
    level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        le.rank,
        le.user_id,
        le.username,
        le.score,
        up.avatar_url,
        up.level
    FROM leaderboard_entries le
    LEFT JOIN user_profiles up ON le.user_id = up.user_id
    WHERE le.game_type = p_game_type 
    AND le.chain_id = p_chain_id
    ORDER BY le.rank
    LIMIT p_limit;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a function to initialize a new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, username, total_xp, level, games_played, best_score, achievements, preferences)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || substr(NEW.id::text, 1, 8)),
        0,
        1,
        0,
        0,
        '{}',
        '{"theme": "dark", "notifications": true, "sound_enabled": true}'::jsonb
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to log performance metrics
CREATE OR REPLACE FUNCTION log_performance_metric(
    p_metric_type VARCHAR,
    p_metric_value DECIMAL,
    p_chain_id INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO performance_metrics (metric_type, metric_value, chain_id)
    VALUES (p_metric_type, p_metric_value, p_chain_id);
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to get performance metrics
CREATE OR REPLACE FUNCTION get_performance_metrics(
    p_metric_type VARCHAR,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    timestamp TIMESTAMP WITH TIME ZONE,
    metric_value DECIMAL,
    chain_id INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.timestamp,
        pm.metric_value,
        pm.chain_id
    FROM performance_metrics pm
    WHERE pm.metric_type = p_metric_type
    AND pm.timestamp >= NOW() - INTERVAL '1 hour' * p_hours
    ORDER BY pm.timestamp DESC;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Insert initial performance metrics
INSERT INTO performance_metrics (metric_type, metric_value, chain_id) VALUES
('transaction_throughput', 5000, 43113),
('gas_efficiency', 95.5, 43113),
('cross_chain_operations', 150, NULL),
('user_retention', 92.3, NULL),
('average_latency', 45.2, 43113),
('uptime', 99.9, NULL);

-- Create a function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete performance metrics older than 30 days
    DELETE FROM performance_metrics 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete reactive events older than 7 days
    DELETE FROM reactive_events 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Delete completed cross-chain transactions older than 30 days
    DELETE FROM cross_chain_transactions 
    WHERE status = 'completed' 
    AND completed_at < NOW() - INTERVAL '30 days';
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create a scheduled job to clean up old data (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');

COMMENT ON DATABASE postgres IS 'Avalanche Rush - Hackathon-winning Web3 gaming platform database';
COMMENT ON TABLE users IS 'User accounts and authentication data';
COMMENT ON TABLE user_profiles IS 'Extended user profile information and gaming stats';
COMMENT ON TABLE game_sessions IS 'Individual game session records';
COMMENT ON TABLE leaderboard_entries IS 'Leaderboard rankings for different game types and chains';
COMMENT ON TABLE achievements IS 'Available achievements that users can unlock';
COMMENT ON TABLE user_achievements IS 'User progress and unlocked achievements';
COMMENT ON TABLE quests IS 'Available quests for users to complete';
COMMENT ON TABLE user_quests IS 'User progress on quests';
COMMENT ON TABLE cross_chain_transactions IS 'Cross-chain asset migration records';
COMMENT ON TABLE reactive_events IS 'Reactive Smart Contract event logs';
COMMENT ON TABLE performance_metrics IS 'System performance and analytics data';





