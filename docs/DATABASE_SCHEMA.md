# Ludo Game Database Schema

**Version:** 1.0.0  
**Last Updated:** 2024  
**Database:** PostgreSQL 15+ (Recommended)

---

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Users & Authentication](#users--authentication)
3. [Player Leveling & Ranking](#player-leveling--ranking)
4. [Game Management](#game-management)
5. [Leaderboards](#leaderboards)
6. [Shop & Purchases](#shop--purchases)
7. [Gifting System](#gifting-system)
8. [Club Management](#club-management)
9. [Club Events & Leveling](#club-events--leveling)
10. [Social Features](#social-features)
11. [Notifications](#notifications)
12. [Analytics](#analytics)
13. [System Tables](#system-tables)
14. [Indexes & Performance](#indexes--performance)
15. [Partitioning Strategy](#partitioning-strategy)
16. [Caching Strategy](#caching-strategy)
17. [Backup & Recovery](#backup--recovery)

---

## Database Architecture

### Design Principles

1. **Normalization:** 3NF (Third Normal Form) for transactional data
2. **Denormalization:** Strategic denormalization for read-heavy operations (leaderboards, stats)
3. **Partitioning:** Time-based partitioning for large tables (game_history, analytics_events)
4. **Indexing:** Comprehensive indexing strategy for query optimization
5. **Caching:** Redis for hot data (active games, online users, leaderboards)
6. **Sharding:** User-based sharding for horizontal scaling (future)
7. **Replication:** Master-slave replication for read scalability

### Technology Stack

- **Primary Database:** PostgreSQL 15+
- **Cache Layer:** Redis 7+
- **Search Engine:** Elasticsearch (for user/club search)
- **Message Queue:** RabbitMQ / AWS SQS
- **Object Storage:** AWS S3 / CloudFront (for avatars, assets)

### Connection Pooling

- **Max Connections:** 100 per application instance
- **Min Connections:** 10 per application instance
- **Connection Timeout:** 30 seconds
- **Idle Timeout:** 600 seconds

---

## Users & Authentication

### Table: `users`

**Description:** Core user account information.

```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_user_id(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Authentication
    auth_provider VARCHAR(20) NOT NULL, -- 'guest', 'google', 'apple', 'facebook', 'email'
    provider_user_id VARCHAR(255),
    password_hash VARCHAR(255), -- only for email auth
    
    -- Profile
    avatar_url TEXT,
    country VARCHAR(3),
    country_code VARCHAR(2),
    signature TEXT,
    bio TEXT,
    
    -- Game Stats (denormalized for quick access)
    crowns BIGINT DEFAULT 1000,
    gems INTEGER DEFAULT 0,
    tier VARCHAR(5) DEFAULT 'D',
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    
    -- Status
    is_guest BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP,
    last_active_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT crowns_positive CHECK (crowns >= 0),
    CONSTRAINT gems_positive CHECK (gems >= 0),
    CONSTRAINT level_positive CHECK (level >= 1)
);

CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, provider_user_id);
CREATE INDEX idx_users_tier_level ON users(tier, level DESC);
CREATE INDEX idx_users_is_online ON users(is_online) WHERE is_online = TRUE;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_crowns ON users(crowns DESC);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Table: `user_stats`

**Description:** Detailed user game statistics.

```sql
CREATE TABLE user_stats (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Game Statistics
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    games_abandoned INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Streak
    current_win_streak INTEGER DEFAULT 0,
    max_win_streak INTEGER DEFAULT 0,
    current_loss_streak INTEGER DEFAULT 0,
    
    -- Team Stats
    team_games_played INTEGER DEFAULT 0,
    team_wins INTEGER DEFAULT 0,
    
    -- Crown Stats
    total_crowns_earned BIGINT DEFAULT 0,
    total_crowns_spent BIGINT DEFAULT 0,
    
    -- Timing
    total_playtime_seconds BIGINT DEFAULT 0,
    average_game_duration_seconds INTEGER DEFAULT 0,
    
    -- Rankings
    highest_rank INTEGER,
    highest_tier VARCHAR(5),
    
    -- Updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT win_rate_valid CHECK (win_rate >= 0 AND win_rate <= 100)
);

CREATE INDEX idx_user_stats_games_won ON user_stats(games_won DESC);
CREATE INDEX idx_user_stats_win_rate ON user_stats(win_rate DESC);
```

### Table: `user_settings`

**Description:** User preferences and settings.

```sql
CREATE TABLE user_settings (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Audio
    sound_enabled BOOLEAN DEFAULT TRUE,
    sound_volume INTEGER DEFAULT 100,
    music_enabled BOOLEAN DEFAULT TRUE,
    music_volume INTEGER DEFAULT 80,
    
    -- Notifications
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    friend_request_notifications BOOLEAN DEFAULT TRUE,
    gift_notifications BOOLEAN DEFAULT TRUE,
    game_invite_notifications BOOLEAN DEFAULT TRUE,
    club_notifications BOOLEAN DEFAULT TRUE,
    
    -- Privacy
    profile_visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'friends', 'private'
    show_online_status BOOLEAN DEFAULT TRUE,
    allow_friend_requests BOOLEAN DEFAULT TRUE,
    allow_game_invites BOOLEAN DEFAULT TRUE,
    
    -- Preferences
    language VARCHAR(5) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'dark',
    
    -- Updated
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `auth_sessions`

**Description:** User authentication sessions.

```sql
CREATE TABLE auth_sessions (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_session_id(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP NOT NULL,
    
    -- Device Info
    device_id VARCHAR(100) NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    
    -- Network
    ip_address INET,
    user_agent TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_access_token ON auth_sessions(access_token);
CREATE INDEX idx_auth_sessions_refresh_token ON auth_sessions(refresh_token);
CREATE INDEX idx_auth_sessions_device_id ON auth_sessions(device_id);
CREATE INDEX idx_auth_sessions_expires ON auth_sessions(token_expires_at) WHERE is_active = TRUE;
```

### Table: `push_tokens`

**Description:** Push notification device tokens.

```sql
CREATE TABLE push_tokens (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios', 'android'
    device_id VARCHAR(100) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, device_id)
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON push_tokens(token) WHERE is_active = TRUE;
```

---

## Player Leveling & Ranking

### Table: `player_levels`

**Description:** Player level progression configuration.

```sql
CREATE TABLE player_levels (
    level INTEGER PRIMARY KEY,
    
    -- Experience
    experience_required BIGINT NOT NULL,
    experience_total BIGINT NOT NULL, -- cumulative
    
    -- Rewards
    crowns_reward INTEGER DEFAULT 0,
    gems_reward INTEGER DEFAULT 0,
    
    -- Unlocks
    unlocks JSONB, -- {features: [], items: []}
    
    CONSTRAINT level_positive CHECK (level >= 1),
    CONSTRAINT experience_positive CHECK (experience_required >= 0)
);

-- Populate levels 1-100
INSERT INTO player_levels (level, experience_required, experience_total, crowns_reward, gems_reward)
SELECT 
    level,
    level * 1000, -- experience needed for this level
    (level * (level + 1) / 2) * 1000, -- cumulative experience
    level * 100, -- crown reward
    CASE WHEN level % 5 = 0 THEN level * 2 ELSE 0 END -- gem reward every 5 levels
FROM generate_series(1, 100) AS level;
```

### Table: `player_ranks`

**Description:** Rank system configuration (separate from tiers).

```sql
CREATE TABLE player_ranks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    
    -- Requirements
    required_level INTEGER NOT NULL,
    required_tier VARCHAR(5),
    required_wins INTEGER,
    required_crowns BIGINT,
    
    -- Display
    icon_url TEXT,
    color VARCHAR(7), -- hex color
    display_order INTEGER NOT NULL,
    
    -- Rewards
    crown_bonus_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(display_order)
);

-- Example ranks
INSERT INTO player_ranks (id, name, required_level, display_order) VALUES
('rank_bronze', 'Bronze Warrior', 5, 1),
('rank_silver', 'Silver Champion', 15, 2),
('rank_gold', 'Gold Master', 30, 3),
('rank_platinum', 'Platinum Elite', 50, 4),
('rank_diamond', 'Diamond Legend', 75, 5),
('rank_mythic', 'Mythic God', 100, 6);
```

### Table: `user_ranks`

**Description:** User rank achievements and visibility.

```sql
CREATE TABLE user_ranks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank_id VARCHAR(50) NOT NULL REFERENCES player_ranks(id),
    
    -- Achievement
    achieved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Visibility (premium feature)
    is_visible BOOLEAN DEFAULT TRUE,
    visibility_expires_at TIMESTAMP, -- NULL = permanent, or expiry date
    last_renewed_at TIMESTAMP,
    renewal_cost INTEGER, -- crowns spent on renewal
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE, -- current displayed rank
    
    UNIQUE(user_id, rank_id)
);

CREATE INDEX idx_user_ranks_user_id ON user_ranks(user_id);
CREATE INDEX idx_user_ranks_active ON user_ranks(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_ranks_expires ON user_ranks(visibility_expires_at) WHERE is_visible = TRUE;
```

### Table: `rank_renewals`

**Description:** Rank visibility renewal transactions.

```sql
CREATE TABLE rank_renewals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank_id VARCHAR(50) NOT NULL REFERENCES player_ranks(id),
    
    -- Transaction
    crowns_spent INTEGER NOT NULL,
    duration_days INTEGER NOT NULL, -- 7, 30, 90
    
    -- Period
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rank_renewals_user_id ON rank_renewals(user_id);
CREATE INDEX idx_rank_renewals_created ON rank_renewals(created_at DESC);
```

---

## Game Management

### Table: `games`

**Description:** Game sessions.

```sql
CREATE TABLE games (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_game_id(),
    
    -- Configuration
    mode VARCHAR(20) NOT NULL, -- '2_player', '4_player', 'private', 'vip'
    entry_fee INTEGER DEFAULT 0,
    total_pot INTEGER DEFAULT 0,
    
    -- Access
    is_private BOOLEAN DEFAULT FALSE,
    join_code VARCHAR(10),
    password_hash VARCHAR(255),
    
    -- Players
    max_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 0,
    
    -- Game State
    status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting', 'ready', 'in_progress', 'completed', 'abandoned'
    game_state JSONB, -- complete game state including board, pieces, turn info
    
    -- Timing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Creator
    creator_user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Winner
    winner_user_id VARCHAR(50) REFERENCES users(id),
    
    -- Metadata
    server_id VARCHAR(50), -- which game server is handling this
    version VARCHAR(10), -- game version
    
    CONSTRAINT entry_fee_positive CHECK (entry_fee >= 0),
    CONSTRAINT max_players_valid CHECK (max_players IN (2, 3, 4))
);

CREATE INDEX idx_games_status ON games(status) WHERE status IN ('waiting', 'in_progress');
CREATE INDEX idx_games_creator ON games(creator_user_id);
CREATE INDEX idx_games_join_code ON games(join_code) WHERE join_code IS NOT NULL;
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_mode ON games(mode, status);
```

### Table: `game_players`

**Description:** Players participating in a game.

```sql
CREATE TABLE game_players (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Player Config
    player_color VARCHAR(10) NOT NULL, -- 'red', 'blue', 'green', 'yellow'
    player_position INTEGER NOT NULL, -- 1, 2, 3, 4
    
    -- Status
    is_host BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT TRUE,
    
    -- Results
    rank INTEGER, -- final rank (1st, 2nd, 3rd, 4th)
    pieces_home INTEGER DEFAULT 0, -- pieces that reached home
    crowns_change INTEGER DEFAULT 0, -- crowns won/lost
    experience_earned INTEGER DEFAULT 0,
    
    -- Timing
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    
    UNIQUE(game_id, user_id),
    UNIQUE(game_id, player_color),
    UNIQUE(game_id, player_position)
);

CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_game_players_user_id ON game_players(user_id);
CREATE INDEX idx_game_players_rank ON game_players(game_id, rank);
```

### Table: `game_moves`

**Description:** Move history for each game (for replay, analysis, anti-cheat).

```sql
CREATE TABLE game_moves (
    id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Move Details
    move_number INTEGER NOT NULL,
    dice_roll INTEGER NOT NULL,
    piece_id INTEGER NOT NULL,
    from_position INTEGER NOT NULL,
    to_position INTEGER NOT NULL,
    
    -- Captures
    captured_piece_ids INTEGER[],
    captured_user_ids VARCHAR(50)[],
    
    -- Timing
    move_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    move_duration_ms INTEGER, -- time taken to make move
    
    -- Validation
    is_valid BOOLEAN DEFAULT TRUE,
    validation_flags JSONB -- anti-cheat flags
);

CREATE INDEX idx_game_moves_game_id ON game_moves(game_id, move_number);
CREATE INDEX idx_game_moves_user_id ON game_moves(user_id);
CREATE INDEX idx_game_moves_timestamp ON game_moves(move_timestamp DESC);

-- Partition by month for performance
CREATE TABLE game_moves_y2024m01 PARTITION OF game_moves
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Table: `game_history`

**Description:** Completed game records (partitioned by date).

```sql
CREATE TABLE game_history (
    id BIGSERIAL,
    game_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    
    -- Game Info
    mode VARCHAR(20) NOT NULL,
    entry_fee INTEGER,
    
    -- Results
    rank INTEGER NOT NULL,
    pieces_home INTEGER,
    crowns_change INTEGER,
    experience_earned INTEGER,
    
    -- Stats
    total_moves INTEGER,
    captures_made INTEGER,
    times_captured INTEGER,
    
    -- Timing
    game_date DATE NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    duration_seconds INTEGER,
    
    PRIMARY KEY (id, game_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
) PARTITION BY RANGE (game_date);

CREATE INDEX idx_game_history_user_date ON game_history(user_id, game_date DESC);
CREATE INDEX idx_game_history_game_id ON game_history(game_id);

-- Create partitions for each month
CREATE TABLE game_history_y2024m01 PARTITION OF game_history
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE game_history_y2024m02 PARTITION OF game_history
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

---

## Leaderboards

### Table: `leaderboard_snapshots`

**Description:** Periodic leaderboard snapshots for historical data.

```sql
CREATE TABLE leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    
    -- Snapshot Info
    snapshot_type VARCHAR(20) NOT NULL, -- 'crown', 'win', 'weekly', 'monthly'
    snapshot_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- User Data
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    rank INTEGER NOT NULL,
    
    -- Metrics
    crowns BIGINT,
    wins INTEGER,
    games_played INTEGER,
    win_rate DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(snapshot_type, snapshot_date, user_id)
);

CREATE INDEX idx_leaderboard_snapshots_type_date ON leaderboard_snapshots(snapshot_type, snapshot_date);
CREATE INDEX idx_leaderboard_snapshots_rank ON leaderboard_snapshots(snapshot_type, snapshot_date, rank);
CREATE INDEX idx_leaderboard_snapshots_user ON leaderboard_snapshots(user_id, snapshot_date DESC);
```

### Materialized View: `leaderboard_crown_king`

**Description:** Current crown king/queen (refreshed every 5 minutes).

```sql
CREATE MATERIALIZED VIEW leaderboard_crown_king AS
SELECT 
    u.id as user_id,
    u.username,
    u.avatar_url,
    u.crowns,
    u.tier,
    u.level,
    u.country,
    u.country_code,
    s.games_played,
    s.games_won,
    s.win_rate,
    s.current_win_streak,
    1 as rank,
    NOW() as crowned_at
FROM users u
JOIN user_stats s ON u.id = s.user_id
WHERE u.is_banned = FALSE AND u.deleted_at IS NULL
ORDER BY u.crowns DESC
LIMIT 1;

CREATE UNIQUE INDEX idx_leaderboard_crown_king ON leaderboard_crown_king(user_id);

-- Refresh strategy: Refresh every 5 minutes via cron job
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_crown_king;
```

### Materialized View: `leaderboard_global_top_100`

**Description:** Top 100 players by crowns (refreshed every hour).

```sql
CREATE MATERIALIZED VIEW leaderboard_global_top_100 AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY u.crowns DESC, u.created_at ASC) as rank,
    u.id as user_id,
    u.username,
    u.avatar_url,
    u.crowns,
    u.tier,
    u.level,
    u.country,
    u.country_code,
    u.is_online,
    s.games_played,
    s.games_won,
    s.win_rate,
    s.current_win_streak
FROM users u
JOIN user_stats s ON u.id = s.user_id
WHERE u.is_banned = FALSE AND u.deleted_at IS NULL
ORDER BY u.crowns DESC, u.created_at ASC
LIMIT 100;

CREATE UNIQUE INDEX idx_leaderboard_global_top_100 ON leaderboard_global_top_100(rank);
CREATE INDEX idx_leaderboard_global_user ON leaderboard_global_top_100(user_id);
```

---

## Shop & Purchases

### Table: `shop_items`

**Description:** Available shop items (crown bundles, avatars, etc.).

```sql
CREATE TABLE shop_items (
    id VARCHAR(50) PRIMARY KEY,
    
    -- Item Info
    type VARCHAR(20) NOT NULL, -- 'crown_bundle', 'gem_bundle', 'avatar', 'theme'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- For Bundles
    crowns INTEGER,
    gems INTEGER,
    bonus_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Platform Product IDs
    ios_product_id VARCHAR(100),
    android_product_id VARCHAR(100),
    
    -- Display
    icon_url TEXT,
    display_order INTEGER,
    is_popular BOOLEAN DEFAULT FALSE,
    is_best_value BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shop_items_type ON shop_items(type, is_active);
CREATE INDEX idx_shop_items_display ON shop_items(display_order) WHERE is_active = TRUE;
```

### Table: `transactions`

**Description:** All purchase transactions.

```sql
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_transaction_id(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Transaction Type
    transaction_type VARCHAR(30) NOT NULL, -- 'shop_purchase', 'crown_reward', 'crown_spend', 'gift_send', 'gift_receive'
    
    -- Shop Purchase Details
    shop_item_id VARCHAR(50) REFERENCES shop_items(id),
    
    -- Platform Receipt
    platform VARCHAR(20), -- 'ios', 'android', 'web'
    platform_transaction_id VARCHAR(255),
    receipt_data TEXT,
    
    -- Amounts
    price DECIMAL(10,2),
    currency VARCHAR(3),
    crowns_change INTEGER, -- positive for purchase/reward, negative for spend
    gems_change INTEGER,
    
    -- Balance After Transaction
    crowns_balance_after BIGINT,
    gems_balance_after INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    verification_status VARCHAR(20), -- 'verified', 'fraud', 'pending'
    
    -- Metadata
    device_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    
    CONSTRAINT price_positive CHECK (price >= 0)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_platform_txn ON transactions(platform, platform_transaction_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
```

### Table: `special_offers`

**Description:** Limited-time shop offers and promotions.

```sql
CREATE TABLE special_offers (
    id VARCHAR(50) PRIMARY KEY,
    
    -- Offer Info
    title VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Effect
    offer_type VARCHAR(20) NOT NULL, -- 'multiplier', 'discount', 'bonus'
    multiplier DECIMAL(5,2), -- e.g., 2.0 for double crowns
    discount_percentage DECIMAL(5,2), -- e.g., 50.00 for 50% off
    
    -- Applicability
    applies_to_item_ids VARCHAR(50)[], -- specific items, NULL = all
    applies_to_types VARCHAR(20)[], -- specific types, NULL = all
    
    -- Timing
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    
    -- Display
    banner_url TEXT,
    display_order INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_special_offers_active ON special_offers(is_active, expires_at);
```

---

## Gifting System

### Table: `gifts`

**Description:** Available gift catalog.

```sql
CREATE TABLE gifts (
    id VARCHAR(50) PRIMARY KEY,
    
    -- Gift Info
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL, -- 'basic', 'premium', 'ultra'
    rarity VARCHAR(20) NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
    
    -- Pricing
    price INTEGER NOT NULL, -- in crowns
    
    -- Display
    icon VARCHAR(10), -- emoji
    animation_url TEXT,
    audio_url TEXT,
    
    -- Effects
    has_global_announcement BOOLEAN DEFAULT FALSE,
    special_effects JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT price_positive CHECK (price > 0)
);

CREATE INDEX idx_gifts_category ON gifts(category, display_order) WHERE is_active = TRUE;
```

### Table: `gift_transactions`

**Description:** Gift sending history.

```sql
CREATE TABLE gift_transactions (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_gift_transaction_id(),
    
    -- Gift
    gift_id VARCHAR(50) NOT NULL REFERENCES gifts(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_value INTEGER NOT NULL,
    
    -- Parties
    sender_user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    recipient_user_id VARCHAR(50) REFERENCES users(id), -- NULL if sent to club
    recipient_club_id VARCHAR(50) REFERENCES clubs(id), -- NULL if sent to user
    
    -- Message
    message TEXT,
    
    -- Context
    context_type VARCHAR(20), -- 'user_to_user', 'user_to_club', 'game', 'club_event'
    context_id VARCHAR(50), -- game_id, event_id, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'received', 'viewed'
    
    -- Timestamps
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP,
    viewed_at TIMESTAMP,
    
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT recipient_check CHECK (
        (recipient_user_id IS NOT NULL AND recipient_club_id IS NULL) OR
        (recipient_user_id IS NULL AND recipient_club_id IS NOT NULL)
    )
);

CREATE INDEX idx_gift_transactions_sender ON gift_transactions(sender_user_id, sent_at DESC);
CREATE INDEX idx_gift_transactions_recipient_user ON gift_transactions(recipient_user_id, sent_at DESC);
CREATE INDEX idx_gift_transactions_recipient_club ON gift_transactions(recipient_club_id, sent_at DESC);
CREATE INDEX idx_gift_transactions_sent ON gift_transactions(sent_at DESC);
```

---

## Club Management

### Table: `clubs`

**Description:** Club/Guild information.

```sql
CREATE TABLE clubs (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_club_id(),
    
    -- Basic Info
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rules TEXT,
    
    -- Owner
    owner_user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Members
    member_count INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 50,
    
    -- Stats
    total_crowns BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    
    -- Rank
    rank_id VARCHAR(50) REFERENCES club_ranks(id),
    
    -- Settings
    privacy VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'invite-only'
    language VARCHAR(5) DEFAULT 'en',
    password_hash VARCHAR(255),
    
    -- Display
    avatar_url TEXT,
    banner_url TEXT,
    
    -- Mic Slots
    total_mic_slots INTEGER DEFAULT 10,
    unlocked_mic_slots INTEGER DEFAULT 5,
    
    -- Thresholds
    gifting_threshold_target INTEGER DEFAULT 15000,
    gifting_threshold_current INTEGER DEFAULT 0,
    threshold_level VARCHAR(20) DEFAULT 'Bronze',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT member_count_valid CHECK (member_count >= 0 AND member_count <= max_members),
    CONSTRAINT level_positive CHECK (level >= 1),
    CONSTRAINT mic_slots_valid CHECK (unlocked_mic_slots <= total_mic_slots)
);

CREATE INDEX idx_clubs_name ON clubs(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_clubs_owner ON clubs(owner_user_id);
CREATE INDEX idx_clubs_privacy ON clubs(privacy) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_clubs_level ON clubs(level DESC) WHERE is_active = TRUE;
CREATE INDEX idx_clubs_crowns ON clubs(total_crowns DESC) WHERE is_active = TRUE;
CREATE INDEX idx_clubs_created ON clubs(created_at DESC);

-- Full-text search
CREATE INDEX idx_clubs_search ON clubs USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

### Table: `club_ranks`

**Description:** Club rank configuration.

```sql
CREATE TABLE club_ranks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    
    -- Requirements
    required_level INTEGER NOT NULL,
    required_crowns BIGINT,
    required_members INTEGER,
    
    -- Display
    icon_url TEXT,
    color VARCHAR(7),
    tier INTEGER NOT NULL,
    display_order INTEGER NOT NULL,
    
    -- Benefits
    max_members INTEGER,
    max_mic_slots INTEGER,
    benefits JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(tier),
    UNIQUE(display_order)
);

-- Example club ranks
INSERT INTO club_ranks (id, name, required_level, tier, display_order, max_members, max_mic_slots) VALUES
('club_rank_bronze', 'Bronze Club', 1, 1, 1, 50, 5),
('club_rank_silver', 'Silver Club', 5, 2, 2, 100, 6),
('club_rank_gold', 'Gold Club', 10, 3, 3, 150, 8),
('club_rank_platinum', 'Platinum Club', 15, 4, 4, 200, 10),
('club_rank_diamond', 'Diamond Club', 25, 5, 5, 300, 12);
```

### Table: `club_members`

**Description:** Club membership information.

```sql
CREATE TABLE club_members (
    id BIGSERIAL PRIMARY KEY,
    club_id VARCHAR(50) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Role
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'moderator', 'member'
    
    -- Contributions
    crowns_contributed BIGINT DEFAULT 0,
    experience_contributed BIGINT DEFAULT 0,
    
    -- Activity
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    messages_sent INTEGER DEFAULT 0,
    
    -- Timestamps
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    
    UNIQUE(club_id, user_id),
    CONSTRAINT role_valid CHECK (role IN ('owner', 'admin', 'moderator', 'member'))
);

CREATE INDEX idx_club_members_club ON club_members(club_id, joined_at DESC) WHERE left_at IS NULL;
CREATE INDEX idx_club_members_user ON club_members(user_id) WHERE left_at IS NULL;
CREATE INDEX idx_club_members_role ON club_members(club_id, role) WHERE left_at IS NULL;
CREATE INDEX idx_club_members_contribution ON club_members(club_id, crowns_contributed DESC);
```

### Table: `club_mic_slots`

**Description:** Voice chat mic slot assignments.

```sql
CREATE TABLE club_mic_slots (
    id SERIAL PRIMARY KEY,
    club_id VARCHAR(50) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL,
    
    -- User
    user_id VARCHAR(50) REFERENCES users(id),
    
    -- Status
    is_locked BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    occupied_at TIMESTAMP,
    freed_at TIMESTAMP,
    
    UNIQUE(club_id, slot_number),
    CONSTRAINT slot_number_valid CHECK (slot_number >= 1 AND slot_number <= 20)
);

CREATE INDEX idx_club_mic_slots_club ON club_mic_slots(club_id, slot_number);
CREATE INDEX idx_club_mic_slots_user ON club_mic_slots(user_id) WHERE user_id IS NOT NULL;
```

### Table: `club_messages`

**Description:** Club chat messages.

```sql
CREATE TABLE club_messages (
    id BIGSERIAL PRIMARY KEY,
    club_id VARCHAR(50) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Message
    message_type VARCHAR(20) NOT NULL DEFAULT 'text', -- 'text', 'gift', 'system', 'announcement'
    message TEXT,
    
    -- Gift (if type = 'gift')
    gift_transaction_id VARCHAR(50) REFERENCES gift_transactions(id),
    
    -- Reactions
    reactions JSONB, -- {"❤️": 5, "👍": 3}
    
    -- Status
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT message_content CHECK (
        (message_type = 'text' AND message IS NOT NULL) OR
        (message_type = 'gift' AND gift_transaction_id IS NOT NULL) OR
        (message_type IN ('system', 'announcement'))
    )
);

CREATE INDEX idx_club_messages_club ON club_messages(club_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_club_messages_user ON club_messages(user_id, created_at DESC);
CREATE INDEX idx_club_messages_created ON club_messages(created_at DESC);

-- Partition by month
CREATE TABLE club_messages_y2024m01 PARTITION OF club_messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## Club Events & Leveling

### Table: `club_levels`

**Description:** Club level progression configuration.

```sql
CREATE TABLE club_levels (
    level INTEGER PRIMARY KEY,
    
    -- Experience
    experience_required BIGINT NOT NULL,
    experience_total BIGINT NOT NULL, -- cumulative
    
    -- Unlocks
    mic_slots_unlocked INTEGER DEFAULT 0,
    max_members_bonus INTEGER DEFAULT 0,
    
    -- Rewards
    member_crown_bonus INTEGER DEFAULT 0,
    
    CONSTRAINT level_positive CHECK (level >= 1)
);

-- Populate club levels 1-50
INSERT INTO club_levels (level, experience_required, experience_total, mic_slots_unlocked, max_members_bonus)
SELECT 
    level,
    level * 10000,
    (level * (level + 1) / 2) * 10000,
    CASE WHEN level = 11 THEN 5 WHEN level = 21 THEN 5 ELSE 0 END, -- unlock 5 slots at level 11 and 21
    CASE WHEN level % 5 = 0 THEN 10 ELSE 0 END -- +10 max members every 5 levels
FROM generate_series(1, 50) AS level;
```

### Table: `club_events`

**Description:** Time-bound club events.

```sql
CREATE TABLE club_events (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_event_id(),
    club_id VARCHAR(50) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    
    -- Event Info
    event_type VARCHAR(30) NOT NULL, -- 'gifting_threshold', 'crown_rush', 'member_challenge'
    title VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Goals
    goal_type VARCHAR(20) NOT NULL, -- 'gifting', 'crowns', 'games_won'
    goal_target BIGINT NOT NULL,
    current_progress BIGINT DEFAULT 0,
    
    -- Timing
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    
    -- Multipliers
    reward_multiplier DECIMAL(5,2) DEFAULT 1.0,
    
    -- Rewards
    club_experience_reward BIGINT,
    member_crowns_bonus INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed', 'failed'
    completed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT dates_valid CHECK (ends_at > starts_at),
    CONSTRAINT goal_positive CHECK (goal_target > 0)
);

CREATE INDEX idx_club_events_club ON club_events(club_id, starts_at DESC);
CREATE INDEX idx_club_events_status ON club_events(status, ends_at);
CREATE INDEX idx_club_events_active ON club_events(club_id, status) WHERE status = 'active';
```

### Table: `club_event_participants`

**Description:** User contributions to club events.

```sql
CREATE TABLE club_event_participants (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL REFERENCES club_events(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Contribution
    contribution BIGINT DEFAULT 0,
    rank INTEGER,
    
    -- Rewards
    crowns_earned INTEGER DEFAULT 0,
    
    -- Timestamp
    first_contribution_at TIMESTAMP,
    last_contribution_at TIMESTAMP,
    
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_club_event_participants_event ON club_event_participants(event_id, contribution DESC);
CREATE INDEX idx_club_event_participants_user ON club_event_participants(user_id);
```

### Table: `club_experience_history`

**Description:** Club experience gain history.

```sql
CREATE TABLE club_experience_history (
    id BIGSERIAL PRIMARY KEY,
    club_id VARCHAR(50) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    
    -- Experience
    experience_gained BIGINT NOT NULL,
    source VARCHAR(30) NOT NULL, -- 'gift', 'event', 'threshold', 'member_activity'
    source_id VARCHAR(50), -- transaction_id, event_id, etc.
    
    -- Level Change
    previous_level INTEGER,
    new_level INTEGER,
    level_up BOOLEAN DEFAULT FALSE,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_club_experience_club ON club_experience_history(club_id, created_at DESC);
```

---

## Social Features

### Table: `friendships`

**Description:** Friend relationships between users.

```sql
CREATE TABLE friendships (
    id BIGSERIAL PRIMARY KEY,
    
    -- Users
    user_id_1 VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'blocked'
    
    -- Request Info
    requested_by VARCHAR(50) NOT NULL, -- user_id who sent the request
    
    -- Timestamps
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    
    CONSTRAINT different_users CHECK (user_id_1 != user_id_2),
    CONSTRAINT ordered_users CHECK (user_id_1 < user_id_2), -- ensure consistent ordering
    UNIQUE(user_id_1, user_id_2)
);

CREATE INDEX idx_friendships_user1 ON friendships(user_id_1, status);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2, status);
CREATE INDEX idx_friendships_pending ON friendships(user_id_2, status) WHERE status = 'pending';
CREATE INDEX idx_friendships_accepted ON friendships(user_id_1, user_id_2) WHERE status = 'accepted';
```

### Table: `blocked_users`

**Description:** User block list.

```sql
CREATE TABLE blocked_users (
    id BIGSERIAL PRIMARY KEY,
    blocker_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Reason
    reason TEXT,
    
    -- Timestamp
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(blocker_user_id, blocked_user_id),
    CONSTRAINT different_users CHECK (blocker_user_id != blocked_user_id)
);

CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_user_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_user_id);
```

---

## Notifications

### Table: `notifications`

**Description:** User notifications.

```sql
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_notification_id(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    notification_type VARCHAR(30) NOT NULL, -- 'friend_request', 'gift', 'game_invite', 'club', 'system'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Data
    data JSONB, -- additional context (user_ids, game_id, etc.)
    
    -- Action
    action_url TEXT,
    action_label VARCHAR(50),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Push Notification
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- auto-delete after expiry
    
    -- Deleted
    deleted_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE AND deleted_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(user_id, notification_type, created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;
```

---

## Analytics

### Table: `analytics_events`

**Description:** User behavior tracking (partitioned by date).

```sql
CREATE TABLE analytics_events (
    id BIGSERIAL,
    user_id VARCHAR(50) REFERENCES users(id),
    
    -- Event
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    
    -- Properties
    properties JSONB,
    
    -- Context
    session_id VARCHAR(50),
    device_id VARCHAR(100),
    platform VARCHAR(20),
    app_version VARCHAR(20),
    
    -- Network
    ip_address INET,
    country VARCHAR(3),
    
    -- Timestamp
    event_date DATE NOT NULL,
    event_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, event_date)
) PARTITION BY RANGE (event_date);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, event_date DESC);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name, event_date DESC);

-- Create monthly partitions
CREATE TABLE analytics_events_y2024m01 PARTITION OF analytics_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Table: `user_sessions`

**Description:** User session tracking.

```sql
CREATE TABLE user_sessions (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_session_id(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Session Info
    device_id VARCHAR(100) NOT NULL,
    platform VARCHAR(20),
    app_version VARCHAR(20),
    
    -- Timing
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Activity
    events_count INTEGER DEFAULT 0,
    screens_viewed INTEGER DEFAULT 0,
    
    -- Network
    ip_address INET,
    country VARCHAR(3)
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id, session_start DESC);
CREATE INDEX idx_user_sessions_platform ON user_sessions(platform, session_start DESC);
```

---

## System Tables

### Table: `app_config`

**Description:** Application configuration.

```sql
CREATE TABLE app_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    value_type VARCHAR(20) NOT NULL, -- 'string', 'integer', 'boolean', 'json'
    description TEXT,
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50)
);

-- Example configs
INSERT INTO app_config (key, value, value_type, description) VALUES
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('min_app_version_ios', '1.0.0', 'string', 'Minimum required iOS app version'),
('min_app_version_android', '1.0.0', 'string', 'Minimum required Android app version'),
('max_friends_limit', '500', 'integer', 'Maximum friends per user'),
('daily_login_bonus', '100', 'integer', 'Daily login crown bonus');
```

### Table: `feature_flags`

**Description:** Feature toggles for gradual rollout.

```sql
CREATE TABLE feature_flags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Status
    is_enabled BOOLEAN DEFAULT FALSE,
    
    -- Rollout
    rollout_percentage INTEGER DEFAULT 0, -- 0-100
    rollout_user_ids VARCHAR(50)[], -- specific users
    
    -- Conditions
    conditions JSONB, -- platform, country, tier, etc.
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rollout_valid CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);
```

### Table: `admin_users`

**Description:** Admin/staff accounts.

```sql
CREATE TABLE admin_users (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE REFERENCES users(id),
    
    -- Credentials
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Role
    role VARCHAR(20) NOT NULL, -- 'super_admin', 'admin', 'moderator', 'support'
    
    -- Permissions
    permissions JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);
```

### Table: `audit_logs`

**Description:** Audit trail for important actions.

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Actor
    user_id VARCHAR(50) REFERENCES users(id),
    admin_user_id VARCHAR(50) REFERENCES admin_users(id),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

---

## Indexes & Performance

### Composite Indexes

```sql
-- High-traffic queries
CREATE INDEX idx_users_online_tier ON users(tier, crowns DESC) WHERE is_online = TRUE AND is_banned = FALSE;
CREATE INDEX idx_games_active ON games(mode, status, created_at DESC) WHERE status IN ('waiting', 'in_progress');
CREATE INDEX idx_club_members_active ON club_members(club_id, role, crowns_contributed DESC) WHERE left_at IS NULL;

-- Friend queries
CREATE INDEX idx_friendships_lookup ON friendships(user_id_1, user_id_2, status);

-- Leaderboard queries
CREATE INDEX idx_users_leaderboard_crown ON users(crowns DESC, created_at ASC) WHERE is_banned = FALSE AND deleted_at IS NULL;
CREATE INDEX idx_user_stats_leaderboard_wins ON user_stats(games_won DESC);

-- Gift history
CREATE INDEX idx_gift_transactions_recent ON gift_transactions(sent_at DESC) WHERE status = 'sent';

-- Club search
CREATE INDEX idx_clubs_active_search ON clubs(privacy, is_active, level DESC, member_count DESC) WHERE deleted_at IS NULL;
```

### Partial Indexes

```sql
-- Only index active/relevant records
CREATE INDEX idx_active_games ON games(id) WHERE status IN ('waiting', 'in_progress');
CREATE INDEX idx_pending_friend_requests ON friendships(user_id_2) WHERE status = 'pending';
CREATE INDEX idx_unread_notifications ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_active_clubs ON clubs(id) WHERE is_active = TRUE AND deleted_at IS NULL;
```

---

## Partitioning Strategy

### Time-Based Partitioning

Large, append-only tables partitioned by month:

1. **game_history** - Partitioned by `game_date`
2. **club_messages** - Partitioned by `created_at`
3. **analytics_events** - Partitioned by `event_date`
4. **game_moves** - Partitioned by `move_timestamp`

### Partition Management

```sql
-- Automated partition creation (run monthly)
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    next_date DATE;
    table_name TEXT;
BEGIN
    partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    next_date := partition_date + INTERVAL '1 month';
    
    -- Game history
    table_name := 'game_history_y' || TO_CHAR(partition_date, 'YYYY') || 'm' || TO_CHAR(partition_date, 'MM');
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF game_history FOR VALUES FROM (%L) TO (%L)',
                   table_name, partition_date, next_date);
    
    -- Similar for other partitioned tables...
END;
$$ LANGUAGE plpgsql;
```

---

## Caching Strategy

### Redis Cache Keys

```
-- User data
user:{user_id}:profile              TTL: 5 minutes
user:{user_id}:stats                TTL: 1 minute
user:{user_id}:settings             TTL: 10 minutes

-- Leaderboards
leaderboard:global:crown            TTL: 5 minutes
leaderboard:global:win              TTL: 5 minutes
leaderboard:friends:{user_id}       TTL: 2 minutes

-- Game state
game:{game_id}:state                TTL: Game duration
game:{game_id}:players              TTL: Game duration

-- Club data
club:{club_id}:info                 TTL: 5 minutes
club:{club_id}:members              TTL: 2 minutes
club:{club_id}:messages:latest      TTL: 30 seconds

-- Online users (Set)
online:users                        TTL: No expiry (managed by app)

-- Rate limiting
ratelimit:{user_id}:{endpoint}      TTL: 1 minute

-- Session data
session:{session_id}                TTL: 1 hour
```

### Cache Invalidation Strategy

1. **Write-through:** Update both DB and cache
2. **TTL-based:** Let cache expire naturally
3. **Event-based:** Invalidate on specific events (profile update, etc.)

---

## Backup & Recovery

### Backup Strategy

1. **Full Backup:** Daily at 2 AM UTC
2. **Incremental Backup:** Every 4 hours
3. **WAL Archiving:** Continuous
4. **Retention:** 30 days

### Point-in-Time Recovery

WAL archiving enabled for PITR up to 30 days.

```sql
-- Enable WAL archiving
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/%f'
```

### Backup Verification

- Weekly restore test to staging
- Monthly disaster recovery drill

---

## Database Functions

### Utility Functions

```sql
-- Generate user ID
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'usr_' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Generate game ID
CREATE OR REPLACE FUNCTION generate_game_id()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'game_' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate win rate
CREATE OR REPLACE FUNCTION calculate_win_rate(games_won INTEGER, games_played INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
    IF games_played = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND((games_won::DECIMAL / games_played::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;
```

### Triggers

```sql
-- Update user stats when game completes
CREATE TRIGGER update_user_stats_after_game
    AFTER INSERT ON game_history
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Update club member count
CREATE TRIGGER update_club_member_count
    AFTER INSERT OR UPDATE OR DELETE ON club_members
    FOR EACH ROW
    EXECUTE FUNCTION update_club_member_count();

-- Update club experience on gift
CREATE TRIGGER update_club_experience_on_gift
    AFTER INSERT ON gift_transactions
    FOR EACH ROW
    WHEN (NEW.recipient_club_id IS NOT NULL)
    EXECUTE FUNCTION add_club_experience_from_gift();
```

---

## Database Security

### Role-Based Access

```sql
-- Application role (read/write)
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ludo_game TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Read-only role (for analytics)
CREATE ROLE analytics_user WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ludo_game TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Admin role
CREATE ROLE admin_user WITH LOGIN PASSWORD 'secure_password' SUPERUSER;
```

### Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_self_policy ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::VARCHAR);

-- Admins can see all
CREATE POLICY admin_all_policy ON users
    FOR ALL
    TO admin_user
    USING (true);
```

### Encryption

1. **At Rest:** Database-level encryption (AWS RDS encryption)
2. **In Transit:** SSL/TLS for all connections
3. **Sensitive Fields:** Application-level encryption for passwords, tokens

---

## Migration Strategy

### Version Control

Use migration tools like:
- **Flyway**
- **Liquibase**
- **Alembic** (Python)

### Migration Naming

```
V001__initial_schema.sql
V002__add_user_rankings.sql
V003__add_club_events.sql
V004__partition_game_history.sql
```

### Zero-Downtime Migrations

1. **Additive Changes:** Add columns with defaults, add indexes concurrently
2. **Deprecation Period:** Mark old columns as deprecated, migrate data
3. **Remove Old:** Drop old columns after migration complete

```sql
-- Add new column without locking
ALTER TABLE users ADD COLUMN new_field VARCHAR(50) DEFAULT '';

-- Create index concurrently
CREATE INDEX CONCURRENTLY idx_users_new_field ON users(new_field);

-- Drop old column (after deprecation period)
ALTER TABLE users DROP COLUMN old_field;
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Performance:**
   - Query execution time
   - Index hit ratio
   - Cache hit ratio
   - Connection pool usage

2. **Storage:**
   - Database size
   - Table sizes
   - Index sizes
   - Partition sizes

3. **Activity:**
   - Active connections
   - Transactions per second
   - Lock waits
   - Deadlocks

4. **Replication:**
   - Replication lag
   - WAL generation rate

### Alert Thresholds

- Connection pool > 80% = Warning
- Replication lag > 60s = Critical
- Disk usage > 85% = Warning
- Query time > 5s = Warning

---

## Scaling Strategy

### Vertical Scaling

Start with: 16 vCPU, 64GB RAM
Scale to: 64 vCPU, 256GB RAM

### Horizontal Scaling

1. **Read Replicas:** 2-5 replicas for read traffic
2. **Connection Pooling:** PgBouncer for connection management
3. **Caching:** Redis for hot data
4. **Sharding (Future):** User-based sharding when > 50M users

### Sharding Strategy (Future)

```
Shard Key: user_id % num_shards
Shard 1: users.id % 8 = 0
Shard 2: users.id % 8 = 1
...
Shard 8: users.id % 8 = 7
```

---

**End of Database Schema Documentation**


