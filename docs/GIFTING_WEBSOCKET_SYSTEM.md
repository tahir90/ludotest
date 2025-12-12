# Gifting System with WebSocket Integration

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Architecture & Implementation Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Why WebSocket is Required](#why-websocket-is-required)
3. [Feature Requirements](#feature-requirements)
4. [System Architecture](#system-architecture)
5. [WebSocket Implementation](#websocket-implementation)
6. [REST API Integration](#rest-api-integration)
7. [Database Schema Updates](#database-schema-updates)
8. [Client Implementation](#client-implementation)
9. [Backend Implementation](#backend-implementation)
10. [Real-time Events Flow](#real-time-events-flow)
11. [Performance & Scaling](#performance--scaling)
12. [Security Considerations](#security-considerations)
13. [Error Handling](#error-handling)
14. [Testing Strategy](#testing-strategy)

---

## Overview

The gifting system is a core social feature that allows users to send virtual gifts (coffee, roses, dragons, etc.) to other users or clubs. These gifts come with **animated Lottie animations and synchronized audio** that need to play simultaneously for all users in the same context (club room, game room, etc.).

### Key Statistics:
- **Gift Types:** 15+ different gifts (basic, premium, ultra)
- **Price Range:** 10 crowns (coffee) to 10,000+ crowns (legendary gifts)
- **Animation Duration:** 2-5 seconds per gift
- **Expected Volume:** 1000+ gifts/minute during peak hours
- **Real-time Requirement:** <100ms delivery latency

---

## Why WebSocket is Required

### Current Implementation Issue

The current implementation in `GiftAnimationOverlay.tsx` and `ClubRoomScreen/index.tsx` is **purely local**:

```typescript
// Current: Only sender sees the animation
const handleGiftSend = (gift: Gift, quantity: number) => {
  if (currentUser) {
    triggerGiftAnimation(gift, sender, receiver, quantity);
  }
  // Gift not visible to other users!
};
```

### Problems Without WebSocket:

#### ❌ **Problem 1: No Synchronization**
- Sender sees animation immediately
- Other club members see nothing
- No shared experience
- Defeats the purpose of social gifting

#### ❌ **Problem 2: Chat Messages Delayed**
- Gift messages in club chat require manual refresh
- Users don't know a gift was sent until they scroll/refresh
- Poor user experience

#### ❌ **Problem 3: Threshold Updates Not Real-time**
- Club gifting threshold progress bars don't update live
- Members can't see progress toward event goals
- Reduces engagement

#### ❌ **Problem 4: No Global Announcements**
- Legendary gifts (10,000+ crowns) should announce server-wide
- Currently no mechanism to broadcast to all users
- Misses opportunity for viral engagement

#### ❌ **Problem 5: Polling Alternative is Inefficient**

**If using HTTP polling instead:**
```typescript
// Bad approach: Polling every 2 seconds
setInterval(() => {
  fetch('/clubs/{clubId}/recent-gifts').then(...)
}, 2000);
```

**Costs:**
- 30 requests/minute per user
- 1800 requests/hour per user
- 43,200 requests/day per user
- With 10,000 concurrent users = **432 million requests/day**
- 90% of responses: "no new data"
- Massive server load, battery drain, bandwidth waste

### ✅ Benefits of WebSocket:

#### **1. True Real-time Delivery (<100ms)**
- Bi-directional communication
- Push notifications from server
- No polling overhead
- Battery efficient

#### **2. Synchronized Experience**
All users see:
- Same animation at same time (±50ms network latency)
- Same audio playback
- Real-time chat updates
- Live threshold progress

#### **3. Reduced Server Load**
- 1 WebSocket connection per user vs. 30 HTTP requests/minute
- Persistent connection reused for all events
- 99% reduction in request volume

#### **4. Lower Latency**
- HTTP Polling: 1-5 seconds delay
- HTTP Long Polling: 1-3 seconds delay
- **WebSocket: 50-100ms delay**

#### **5. Better Mobile Performance**
- Single persistent connection
- No repeated SSL handshakes
- Reduced battery consumption
- Lower data usage

---

## Feature Requirements

### Functional Requirements

#### FR-1: User-to-User Gifting
- User A can send gift to User B
- Both see animation simultaneously
- Gift appears in chat history
- Crowns deducted from sender
- Notification sent to recipient

#### FR-2: Club Gifting
- User can send gift in club room
- **All club members** see animation simultaneously
- Gift contributes to club threshold
- Gift appears in club chat
- Displays sender's name

#### FR-3: Game Room Gifting
- User can send gift during/after game
- All players in game room see animation
- Gift appears in game chat
- Optional: Crown bonus for winner

#### FR-4: Global Announcements
- Ultra-rare gifts (10,000+ crowns) trigger server-wide announcement
- Scrolling banner visible to all online users
- Shows: sender, gift, recipient/club
- Encourages others to gift

#### FR-5: Time-bound Events
- Club events with gifting goals
- Real-time progress updates for all members
- Countdown timer visible to all
- Celebration animation when goal reached

#### FR-6: Animation Queue
- Multiple gifts sent in quick succession
- Queue system prevents overlap
- Sequential playback with 300ms gap
- Maximum 5 gifts in queue
- Oldest gifts dropped if queue full

### Non-Functional Requirements

#### NFR-1: Performance
- Message delivery: <100ms (p95)
- Animation sync: ±50ms across clients
- Support 10,000+ concurrent users per server
- Handle 1000 gifts/minute peak load

#### NFR-2: Reliability
- Automatic reconnection on disconnect
- Message ordering guaranteed per room
- Idempotent message handling
- No duplicate animations

#### NFR-3: Scalability
- Horizontal scaling of WebSocket servers
- Redis pub/sub for cross-server communication
- Load balancing with sticky sessions
- Room-based message routing

#### NFR-4: Security
- JWT authentication for WebSocket connections
- Room membership validation
- Rate limiting: 10 gifts/minute per user
- Anti-spam protection

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Native   │
│     Client      │
│   (Socket.io)   │
└────────┬────────┘
         │ WSS
         ▼
┌─────────────────┐      ┌─────────────────┐
│   Load Balancer │─────▶│  WebSocket      │
│  (Sticky Session)│      │   Server 1      │
└─────────────────┘      └────────┬────────┘
         │                        │
         │                        │ Redis Pub/Sub
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│  WebSocket      │◀─────│     Redis       │
│   Server 2      │      │  (Message Bus)  │
└────────┬────────┘      └─────────────────┘
         │
         │ DB writes
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Primary +    │
│  Read Replicas) │
└─────────────────┘
```

### Component Interaction Flow

```
User A (Sender)                WebSocket Server              User B (Recipient)
     │                                │                            │
     │ 1. Click "Send Gift"           │                            │
     ├──────────────────────────────▶ │                            │
     │                                │                            │
     │ 2. POST /gifts/send (REST)     │                            │
     ├──────────────────────────────▶ │                            │
     │                                │                            │
     │                         3. Validate & Save to DB            │
     │                                │                            │
     │                         4. Deduct crowns                    │
     │                                │                            │
     │                         5. Create gift record               │
     │                                │                            │
     │ 6. Success response            │                            │
     │ ◀──────────────────────────────┤                            │
     │                                │                            │
     │                         7. Broadcast via WebSocket          │
     │                                ├───────────────────────────▶│
     │ ◀──────────────────────────────┤                            │
     │                                │                            │
     │ 8. Trigger animation           │      8. Trigger animation  │
     │    (both see same animation)   │                            │
     │                                │                            │
```

---

## WebSocket Implementation

### Connection Establishment

#### Client Connection (React Native)

```typescript
import io from 'socket.io-client';

// WebSocket service
class GiftingWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(accessToken: string) {
    this.socket = io('wss://ws.ludogame.com', {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.socket?.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket?.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket?.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    this.socket?.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
      this.reconnectAttempts = attempt;
    });
  }

  // Room management
  joinClubRoom(clubId: string) {
    this.socket?.emit('club:join', { clubId });
  }

  leaveClubRoom(clubId: string) {
    this.socket?.emit('club:leave', { clubId });
  }

  joinGameRoom(gameId: string) {
    this.socket?.emit('game:join', { gameId });
  }

  leaveGameRoom(gameId: string) {
    this.socket?.emit('game:leave', { gameId });
  }

  // Gift event listeners
  onGiftReceived(callback: (data: GiftEventData) => void) {
    this.socket?.on('gift:received', callback);
  }

  onGlobalGiftAnnouncement(callback: (data: GlobalGiftData) => void) {
    this.socket?.on('gift:global:announcement', callback);
  }

  onThresholdUpdated(callback: (data: ThresholdData) => void) {
    this.socket?.on('club:threshold:updated', callback);
  }

  onEventGoalReached(callback: (data: EventData) => void) {
    this.socket?.on('club:event:goal:reached', callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const giftingWS = new GiftingWebSocketService();
```

### Event Data Structures

```typescript
// Gift received event
interface GiftEventData {
  giftTransactionId: string;
  gift: {
    id: string;
    name: string;
    icon: string;
    animationUrl: string;
    audioUrl: string;
    category: 'basic' | 'premium' | 'ultra';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  sender: {
    userId: string;
    username: string;
    avatar: string;
    tier: string;
    level: number;
  };
  recipient?: {
    userId: string;
    username: string;
    avatar: string;
  };
  context: {
    type: 'user' | 'club' | 'game';
    id: string; // clubId or gameId
    name?: string; // club/game name
  };
  quantity: number;
  totalValue: number;
  message?: string;
  timestamp: string;
  animation: {
    duration: number; // milliseconds
    url: string;
    audioUrl: string;
  };
}

// Global announcement for legendary gifts
interface GlobalGiftData {
  giftTransactionId: string;
  gift: {
    id: string;
    name: string;
    icon: string;
  };
  sender: {
    userId: string;
    username: string;
    tier: string;
  };
  context: {
    type: 'club' | 'game';
    id: string;
    name: string;
  };
  totalValue: number;
  timestamp: string;
}

// Club threshold update
interface ThresholdData {
  clubId: string;
  previousValue: number;
  currentValue: number;
  targetValue: number;
  progress: number; // percentage
  levelName: string; // 'Bronze', 'Silver', 'Gold', etc.
  completed: boolean;
}

// Event goal reached
interface EventData {
  eventId: string;
  clubId: string;
  eventName: string;
  goalReached: boolean;
  totalContributed: number;
  goalTarget: number;
  rewards: {
    clubExperience: number;
    memberCrownsBonus: number;
  };
  topContributors: Array<{
    userId: string;
    username: string;
    contribution: number;
    rank: number;
  }>;
  timestamp: string;
}
```

---

## REST API Integration

### Gift Sending API

**Endpoint:** `POST /gifts/send`

**Request:**
```json
{
  "giftId": "gift_dragon",
  "recipientType": "club",
  "recipientId": "club_123",
  "quantity": 1,
  "message": "For the club!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "giftTransactionId": "gtx_abc123",
    "giftId": "gift_dragon",
    "totalCost": 10000,
    "remainingCrowns": 40000,
    "sentAt": "2024-01-15T12:00:00Z",
    "websocketBroadcast": true
  }
}
```

**Flow:**
1. Client sends REST API request
2. Backend validates:
   - User has enough crowns
   - Gift exists
   - Recipient exists (club/user)
   - User is member of club (if club gift)
   - Rate limit not exceeded
3. Backend saves to database:
   - Deduct crowns from sender
   - Create gift_transaction record
   - Update club threshold (if applicable)
   - Create notification record
4. Backend broadcasts WebSocket event to room
5. All clients receive event and trigger animation

### Endpoint Details

**POST /gifts/send** - Send gift to user or club

**POST /clubs/{clubId}/gifts/send** - Send gift in club (alternative)

**POST /games/{gameId}/gifts/send** - Send gift in game

**GET /gifts/history** - Get sent/received gift history

**GET /clubs/{clubId}/gifts/recent** - Get recent gifts in club (fallback if WS disconnected)

---

## Database Schema Updates

### New Tables

#### Table: `gift_transactions` (Updated)

```sql
CREATE TABLE gift_transactions (
    id VARCHAR(50) PRIMARY KEY DEFAULT generate_gift_transaction_id(),
    
    -- Gift
    gift_id VARCHAR(50) NOT NULL REFERENCES gifts(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_value INTEGER NOT NULL,
    
    -- Parties
    sender_user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    recipient_user_id VARCHAR(50) REFERENCES users(id),
    recipient_club_id VARCHAR(50) REFERENCES clubs(id),
    
    -- Message
    message TEXT,
    
    -- Context
    context_type VARCHAR(20), -- 'user_to_user', 'club', 'game'
    context_id VARCHAR(50), -- club_id, game_id
    
    -- WebSocket Broadcasting
    websocket_broadcast_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    websocket_broadcast_at TIMESTAMP,
    websocket_room_id VARCHAR(100), -- 'club:{clubId}' or 'game:{gameId}'
    websocket_recipient_count INTEGER DEFAULT 0, -- number of users who received
    
    -- Global Announcement (for legendary gifts)
    is_global_announcement BOOLEAN DEFAULT FALSE,
    global_announcement_sent BOOLEAN DEFAULT FALSE,
    global_announcement_at TIMESTAMP,
    
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

-- Indexes
CREATE INDEX idx_gift_transactions_sender ON gift_transactions(sender_user_id, sent_at DESC);
CREATE INDEX idx_gift_transactions_recipient_user ON gift_transactions(recipient_user_id, sent_at DESC);
CREATE INDEX idx_gift_transactions_recipient_club ON gift_transactions(recipient_club_id, sent_at DESC);
CREATE INDEX idx_gift_transactions_context ON gift_transactions(context_type, context_id, sent_at DESC);
CREATE INDEX idx_gift_transactions_broadcast ON gift_transactions(websocket_broadcast_status) 
    WHERE websocket_broadcast_status = 'pending';
CREATE INDEX idx_gift_transactions_global ON gift_transactions(is_global_announcement, sent_at DESC) 
    WHERE is_global_announcement = TRUE;
```

#### Table: `websocket_events` (New)

**Purpose:** Track WebSocket event delivery for debugging and analytics

```sql
CREATE TABLE websocket_events (
    id BIGSERIAL PRIMARY KEY,
    
    -- Event Info
    event_type VARCHAR(50) NOT NULL, -- 'gift:received', 'club:threshold:updated', etc.
    event_data JSONB NOT NULL,
    
    -- Source
    source_type VARCHAR(20) NOT NULL, -- 'gift', 'club', 'game', 'system'
    source_id VARCHAR(50),
    
    -- Target
    room_id VARCHAR(100) NOT NULL, -- 'club:123', 'game:456', 'global'
    target_user_ids VARCHAR(50)[], -- specific users (optional)
    
    -- Broadcast Info
    broadcast_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_count INTEGER DEFAULT 0,
    server_id VARCHAR(50), -- which WS server handled this
    
    -- Status
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'retry'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Performance
    processing_time_ms INTEGER, -- time to process and broadcast
    
    CONSTRAINT event_type_valid CHECK (event_type IN (
        'gift:received', 
        'gift:global:announcement',
        'club:threshold:updated',
        'club:event:goal:reached',
        'club:message',
        'game:move',
        'game:state:update'
    ))
);

-- Indexes
CREATE INDEX idx_websocket_events_room ON websocket_events(room_id, broadcast_at DESC);
CREATE INDEX idx_websocket_events_type ON websocket_events(event_type, broadcast_at DESC);
CREATE INDEX idx_websocket_events_source ON websocket_events(source_type, source_id);
CREATE INDEX idx_websocket_events_status ON websocket_events(status) WHERE status = 'failed';

-- Partition by month for performance
CREATE TABLE websocket_events_y2024m01 PARTITION OF websocket_events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### Table: `gift_animation_plays` (New)

**Purpose:** Track animation playback for analytics

```sql
CREATE TABLE gift_animation_plays (
    id BIGSERIAL PRIMARY KEY,
    
    -- Gift Transaction
    gift_transaction_id VARCHAR(50) NOT NULL REFERENCES gift_transactions(id),
    
    -- Viewer
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    
    -- Playback Info
    animation_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    animation_completed_at TIMESTAMP,
    animation_duration_ms INTEGER,
    
    -- Client Info
    platform VARCHAR(20), -- 'ios', 'android'
    app_version VARCHAR(20),
    
    -- Status
    completed BOOLEAN DEFAULT FALSE,
    error_message TEXT
);

CREATE INDEX idx_gift_animation_plays_transaction ON gift_animation_plays(gift_transaction_id);
CREATE INDEX idx_gift_animation_plays_user ON gift_animation_plays(user_id, animation_started_at DESC);
```

### Updated Tables

#### Table: `clubs` (Add WebSocket tracking)

```sql
ALTER TABLE clubs ADD COLUMN websocket_room_id VARCHAR(100);
ALTER TABLE clubs ADD COLUMN active_websocket_connections INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN last_gift_at TIMESTAMP;

CREATE INDEX idx_clubs_websocket_room ON clubs(websocket_room_id) WHERE websocket_room_id IS NOT NULL;
```

#### Table: `users` (Add WebSocket status)

```sql
ALTER TABLE users ADD COLUMN websocket_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN websocket_connected_at TIMESTAMP;
ALTER TABLE users ADD COLUMN websocket_last_seen_at TIMESTAMP;
ALTER TABLE users ADD COLUMN websocket_server_id VARCHAR(50);

CREATE INDEX idx_users_websocket_connected ON users(websocket_connected) WHERE websocket_connected = TRUE;
```

---

## Client Implementation

### React Native Integration

#### 1. WebSocket Hook

```typescript
// hooks/useGiftingWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { giftingWS } from '../services/GiftingWebSocketService';
import { useGiftAnimation } from '../components/features/gifting';

export const useGiftingWebSocket = (roomType: 'club' | 'game', roomId: string) => {
  const { accessToken } = useSelector(state => state.auth);
  const { triggerGiftAnimation } = useGiftAnimation();
  const connectedRef = useRef(false);

  // Connect on mount
  useEffect(() => {
    if (!accessToken || !roomId) return;

    // Connect WebSocket
    if (!connectedRef.current) {
      giftingWS.connect(accessToken);
      connectedRef.current = true;
    }

    // Join room
    if (roomType === 'club') {
      giftingWS.joinClubRoom(roomId);
    } else if (roomType === 'game') {
      giftingWS.joinGameRoom(roomId);
    }

    // Listen for gift events
    giftingWS.onGiftReceived((data) => {
      console.log('🎁 Gift received via WebSocket:', data);
      
      // Trigger animation for this user
      triggerGiftAnimation(
        {
          id: data.gift.id,
          name: data.gift.name,
          icon: data.gift.icon,
          price: data.totalValue / data.quantity,
          category: data.gift.category,
          animationUrl: data.animation.url,
          audioUrl: data.animation.audioUrl,
        },
        {
          username: data.sender.username,
          avatar: data.sender.avatar,
        },
        {
          username: data.recipient?.username || data.context.name || 'Club',
          avatar: data.recipient?.avatar || '',
        },
        data.quantity
      );

      // Show toast notification
      showToast(`${data.sender.username} sent ${data.gift.name}!`);
    });

    // Listen for global announcements
    giftingWS.onGlobalGiftAnnouncement((data) => {
      console.log('🌟 Global gift announcement:', data);
      showGlobalBanner(
        `${data.sender.username} sent ${data.gift.name} in ${data.context.name}!`
      );
    });

    // Listen for threshold updates (club only)
    if (roomType === 'club') {
      giftingWS.onThresholdUpdated((data) => {
        console.log('📊 Threshold updated:', data);
        updateThresholdProgress(data.currentValue, data.targetValue);
      });

      giftingWS.onEventGoalReached((data) => {
        console.log('🎉 Event goal reached!', data);
        showEventCelebration(data);
      });
    }

    // Cleanup
    return () => {
      if (roomType === 'club') {
        giftingWS.leaveClubRoom(roomId);
      } else if (roomType === 'game') {
        giftingWS.leaveGameRoom(roomId);
      }
    };
  }, [roomType, roomId, accessToken]);

  return {
    connected: connectedRef.current,
  };
};
```

#### 2. Updated ClubRoomScreen

```typescript
// screens/ClubRoomScreen/index.tsx
const ClubRoomScreenContent: React.FC = () => {
  const route = useRoute();
  const clubId = (route.params as any)?.clubId;
  const { user: currentUser } = useUser();
  const [showGiftSheet, setShowGiftSheet] = useState(false);

  // Connect to WebSocket
  const { connected } = useGiftingWebSocket('club', clubId);

  const handleGiftSend = async (gift: Gift, quantity: number) => {
    try {
      // Close bottom sheet first
      setShowGiftSheet(false);

      // Send via REST API
      const response = await fetch(`/clubs/${clubId}/gifts/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          giftId: gift.id,
          quantity: quantity,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success feedback
        showToast('Gift sent successfully!');
        
        // WebSocket will handle animation broadcast
        // No need to trigger local animation
      } else {
        showToast('Failed to send gift: ' + result.error.message);
      }
    } catch (error) {
      console.error('Error sending gift:', error);
      showToast('Failed to send gift. Please try again.');
    }
  };

  return (
    <Wrapper>
      {/* Show connection status */}
      {!connected && (
        <View style={styles.offlineBanner}>
          <Text>Reconnecting...</Text>
        </View>
      )}

      {/* Rest of UI */}
      <GiftCatalogBottomSheet
        visible={showGiftSheet}
        onClose={() => setShowGiftSheet(false)}
        onGiftSend={handleGiftSend}
        recipient={{
          username: club.ownerUsername || 'Club',
          avatar: club.avatar,
        }}
      />
    </Wrapper>
  );
};
```

---

## Backend Implementation

### NestJS WebSocket Gateway

```typescript
// src/gateways/gifting.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

@WebSocketGateway({
  namespace: '/gifting',
  cors: {
    origin: '*', // Configure properly in production
    credentials: true,
  },
  transports: ['websocket'],
})
@Injectable()
export class GiftingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GiftingGateway.name);
  private redis: Redis;
  private redisSub: Redis;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private clubsService: ClubsService,
  ) {
    // Redis for pub/sub (multi-server support)
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
    });

    this.redisSub = new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
    });

    this.setupRedisPubSub();
  }

  // Handle new connections
  async handleConnection(client: Socket) {
    try {
      // Authenticate
      const token = client.handshake.auth.token;
      const payload = await this.jwtService.verifyAsync(token);
      
      const userId = payload.sub;
      client.data.userId = userId;
      client.data.username = payload.username;

      this.logger.log(`✅ Client connected: ${userId} (${client.id})`);

      // Update user status
      await this.usersService.updateWebSocketStatus(userId, true, client.id);

      // Join user's personal room
      client.join(`user:${userId}`);

      // Send connection acknowledgment
      client.emit('connected', {
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`❌ Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  // Handle disconnections
  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    this.logger.log(`❌ Client disconnected: ${userId} (${client.id})`);

    if (userId) {
      await this.usersService.updateWebSocketStatus(userId, false, null);
    }
  }

  // Join club room
  @SubscribeMessage('club:join')
  async handleJoinClub(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clubId: string },
  ) {
    const userId = client.data.userId;
    const { clubId } = data;

    try {
      // Verify user is member of club
      const isMember = await this.clubsService.isUserMember(clubId, userId);
      if (!isMember) {
        throw new Error('Not a member of this club');
      }

      // Join room
      client.join(`club:${clubId}`);
      
      // Increment connection count
      await this.clubsService.incrementWebSocketConnections(clubId);

      this.logger.log(`✅ User ${userId} joined club room: ${clubId}`);

      // Notify user
      client.emit('club:joined', {
        clubId,
        timestamp: new Date().toISOString(),
      });

      // Notify other members (optional)
      client.to(`club:${clubId}`).emit('club:member:connected', {
        userId,
        username: client.data.username,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`❌ Error joining club: ${error.message}`);
      client.emit('error', {
        message: error.message,
      });
    }
  }

  // Leave club room
  @SubscribeMessage('club:leave')
  async handleLeaveClub(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { clubId: string },
  ) {
    const userId = client.data.userId;
    const { clubId } = data;

    client.leave(`club:${clubId}`);
    await this.clubsService.decrementWebSocketConnections(clubId);

    this.logger.log(`✅ User ${userId} left club room: ${clubId}`);

    // Notify other members
    client.to(`club:${clubId}`).emit('club:member:disconnected', {
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  // Join game room
  @SubscribeMessage('game:join')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const userId = client.data.userId;
    const { gameId } = data;

    // Verify user is player in game
    // Similar to club join...

    client.join(`game:${gameId}`);
    this.logger.log(`✅ User ${userId} joined game room: ${gameId}`);
  }

  // Broadcast gift to room
  async broadcastGift(giftData: GiftEventData) {
    const roomId = giftData.context.type === 'club' 
      ? `club:${giftData.context.id}`
      : `game:${giftData.context.id}`;

    this.logger.log(`🎁 Broadcasting gift to room: ${roomId}`);

    // Get room size
    const room = this.server.sockets.adapter.rooms.get(roomId);
    const recipientCount = room?.size || 0;

    // Broadcast to room
    this.server.to(roomId).emit('gift:received', giftData);

    // Also publish to Redis for other servers
    await this.redis.publish('gift:broadcast', JSON.stringify({
      roomId,
      data: giftData,
    }));

    // Log event
    await this.logWebSocketEvent({
      eventType: 'gift:received',
      eventData: giftData,
      roomId,
      recipientCount,
    });

    return recipientCount;
  }

  // Broadcast global announcement
  async broadcastGlobalAnnouncement(giftData: GlobalGiftData) {
    this.logger.log('🌟 Broadcasting global gift announcement');

    // Broadcast to all connected clients
    this.server.emit('gift:global:announcement', giftData);

    // Also publish to Redis
    await this.redis.publish('gift:global', JSON.stringify(giftData));
  }

  // Update club threshold
  async broadcastThresholdUpdate(thresholdData: ThresholdData) {
    const roomId = `club:${thresholdData.clubId}`;
    
    this.server.to(roomId).emit('club:threshold:updated', thresholdData);
    
    await this.redis.publish('threshold:update', JSON.stringify({
      roomId,
      data: thresholdData,
    }));
  }

  // Setup Redis pub/sub for multi-server
  private setupRedisPubSub() {
    // Subscribe to gift broadcasts from other servers
    this.redisSub.subscribe('gift:broadcast', 'gift:global', 'threshold:update');

    this.redisSub.on('message', (channel, message) => {
      const data = JSON.parse(message);

      if (channel === 'gift:broadcast') {
        this.server.to(data.roomId).emit('gift:received', data.data);
      } else if (channel === 'gift:global') {
        this.server.emit('gift:global:announcement', data);
      } else if (channel === 'threshold:update') {
        this.server.to(data.roomId).emit('club:threshold:updated', data.data);
      }
    });
  }

  // Log WebSocket event to database
  private async logWebSocketEvent(data: any) {
    // Save to websocket_events table for analytics
    // Implementation depends on your database service
  }
}
```

### Gift Service Integration

```typescript
// src/modules/gifts/gifts.service.ts
@Injectable()
export class GiftsService {
  constructor(
    private giftsRepository: Repository<GiftTransaction>,
    private usersService: UsersService,
    private clubsService: ClubsService,
    private giftingGateway: GiftingGateway,
  ) {}

  async sendGift(
    senderId: string,
    giftId: string,
    recipientType: 'user' | 'club',
    recipientId: string,
    quantity: number = 1,
    message?: string,
  ): Promise<GiftTransaction> {
    // 1. Validate gift exists
    const gift = await this.giftsRepository.findOne({ where: { id: giftId } });
    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    // 2. Calculate cost
    const totalCost = gift.price * quantity;

    // 3. Check sender has enough crowns
    const sender = await this.usersService.findOne(senderId);
    if (sender.crowns < totalCost) {
      throw new BadRequestException('Insufficient crowns');
    }

    // 4. Validate recipient
    let recipient: User | Club;
    let contextType: string;
    let contextId: string;

    if (recipientType === 'user') {
      recipient = await this.usersService.findOne(recipientId);
      contextType = 'user_to_user';
      contextId = recipientId;
    } else {
      recipient = await this.clubsService.findOne(recipientId);
      // Verify sender is club member
      const isMember = await this.clubsService.isUserMember(recipientId, senderId);
      if (!isMember) {
        throw new ForbiddenException('Not a member of this club');
      }
      contextType = 'club';
      contextId = recipientId;
    }

    // 5. Deduct crowns from sender
    await this.usersService.updateCrowns(senderId, -totalCost);

    // 6. Create gift transaction
    const transaction = await this.giftsRepository.save({
      giftId: gift.id,
      quantity,
      totalValue: totalCost,
      senderUserId: senderId,
      recipientUserId: recipientType === 'user' ? recipientId : null,
      recipientClubId: recipientType === 'club' ? recipientId : null,
      message,
      contextType,
      contextId,
      websocketRoomId: recipientType === 'club' ? `club:${recipientId}` : null,
      isGlobalAnnouncement: totalCost >= 10000, // Legendary threshold
      status: 'sent',
    });

    // 7. Update club threshold if applicable
    if (recipientType === 'club') {
      await this.clubsService.addToGiftingThreshold(recipientId, totalCost);
    }

    // 8. Broadcast via WebSocket
    await this.broadcastGiftEvent(transaction, gift, sender, recipient, recipientType);

    // 9. Create notification for recipient (if user)
    if (recipientType === 'user') {
      await this.notificationsService.create({
        userId: recipientId,
        type: 'gift',
        title: 'Gift Received!',
        message: `${sender.username} sent you ${gift.name}`,
        data: { giftTransactionId: transaction.id },
      });
    }

    return transaction;
  }

  private async broadcastGiftEvent(
    transaction: GiftTransaction,
    gift: Gift,
    sender: User,
    recipient: User | Club,
    recipientType: 'user' | 'club',
  ) {
    // Prepare event data
    const eventData: GiftEventData = {
      giftTransactionId: transaction.id,
      gift: {
        id: gift.id,
        name: gift.name,
        icon: gift.icon,
        animationUrl: gift.animationUrl,
        audioUrl: gift.audioUrl,
        category: gift.category,
        rarity: gift.rarity,
      },
      sender: {
        userId: sender.id,
        username: sender.username,
        avatar: sender.avatarUrl,
        tier: sender.tier,
        level: sender.level,
      },
      recipient: recipientType === 'user' ? {
        userId: recipient.id,
        username: (recipient as User).username,
        avatar: (recipient as User).avatarUrl,
      } : undefined,
      context: {
        type: recipientType,
        id: recipient.id,
        name: recipientType === 'club' ? (recipient as Club).name : undefined,
      },
      quantity: transaction.quantity,
      totalValue: transaction.totalValue,
      message: transaction.message,
      timestamp: transaction.sentAt.toISOString(),
      animation: {
        duration: this.getAnimationDuration(gift.id),
        url: gift.animationUrl,
        audioUrl: gift.audioUrl,
      },
    };

    // Broadcast to room
    const recipientCount = await this.giftingGateway.broadcastGift(eventData);

    // Update transaction
    await this.giftsRepository.update(transaction.id, {
      websocketBroadcastStatus: 'sent',
      websocketBroadcastAt: new Date(),
      websocketRecipientCount: recipientCount,
    });

    // Global announcement for legendary gifts
    if (transaction.isGlobalAnnouncement) {
      await this.giftingGateway.broadcastGlobalAnnouncement({
        giftTransactionId: transaction.id,
        gift: {
          id: gift.id,
          name: gift.name,
          icon: gift.icon,
        },
        sender: {
          userId: sender.id,
          username: sender.username,
          tier: sender.tier,
        },
        context: {
          type: recipientType,
          id: recipient.id,
          name: recipientType === 'club' ? (recipient as Club).name : '',
        },
        totalValue: transaction.totalValue,
        timestamp: transaction.sentAt.toISOString(),
      });

      await this.giftsRepository.update(transaction.id, {
        globalAnnouncementSent: true,
        globalAnnouncementAt: new Date(),
      });
    }
  }

  private getAnimationDuration(giftId: string): number {
    // Map gift IDs to durations (in milliseconds)
    const durations = {
      'gift_coffee': 2500,
      'gift_rose': 3000,
      'gift_dragon': 5000,
      // ... etc
    };
    return durations[giftId] || 2500;
  }
}
```

---

## Real-time Events Flow

### Flow Diagram: User Sends Gift in Club

```
┌──────────┐                ┌──────────┐              ┌──────────┐
│  User A  │                │  Server  │              │  User B  │
│ (Sender) │                │          │              │(Receiver)│
└────┬─────┘                └────┬─────┘              └────┬─────┘
     │                           │                         │
     │ 1. Click "Send Gift"      │                         │
     │                           │                         │
     │ 2. POST /gifts/send       │                         │
     ├──────────────────────────>│                         │
     │                           │                         │
     │                    3. Validate Request              │
     │                    - Check crowns                   │
     │                    - Check club membership          │
     │                    - Rate limit check               │
     │                           │                         │
     │                    4. Database Transaction          │
     │                    - Deduct crowns                  │
     │                    - Create gift record             │
     │                    - Update threshold               │
     │                           │                         │
     │ 5. 200 OK Response        │                         │
     │<──────────────────────────┤                         │
     │  { success: true,         │                         │
     │    giftTransactionId }    │                         │
     │                           │                         │
     │                    6. Broadcast WebSocket Event     │
     │                           │                         │
     │  7. WS: gift:received     │  7. WS: gift:received   │
     │<──────────────────────────┼────────────────────────>│
     │                           │                         │
     │ 8. Trigger Animation      │    8. Trigger Animation │
     │    - Play Lottie          │       - Play Lottie     │
     │    - Play Audio           │       - Play Audio      │
     │    - Show sender name     │       - Show sender name│
     │                           │                         │
     │ 9. Animation Complete     │    9. Animation Complete│
     │    (after 3-5 seconds)    │       (after 3-5 seconds)│
     │                           │                         │
     │ 10. WS: threshold:updated │ 10. WS: threshold:updated│
     │<──────────────────────────┼────────────────────────>│
     │                           │                         │
     │ 11. Update Progress Bar   │   11. Update Progress Bar│
     │                           │                         │
```

### Sequence for Legendary Gift (Global Announcement)

```
User A          Server          All Users (Global)
  │               │                    │
  │ Send $100     │                    │
  │ Dragon Gift   │                    │
  ├──────────────>│                    │
  │               │                    │
  │               │ 1. Save to DB      │
  │               │                    │
  │               │ 2. Broadcast to    │
  │               │    Club Room       │
  │<──────────────┤                    │
  │ Animation     │                    │
  │ Plays         │                    │
  │               │                    │
  │               │ 3. Global Broadcast│
  │               ├───────────────────>│
  │               │                    │
  │               │              Show Banner:
  │               │              "UserA sent Golden
  │               │               Dragon in Club XYZ!"
  │               │                    │
  │               │              (5 sec display)
  │               │                    │
```

---

## Performance & Scaling

### Capacity Planning

**Target:**
- 10,000 concurrent WebSocket connections per server
- 1,000 gifts/minute peak throughput
- <100ms p95 event delivery latency

### Scaling Strategy

#### Horizontal Scaling
```
                        ┌─────────────┐
                        │   Nginx     │
                        │Load Balancer│
                        │(Sticky IP)  │
                        └──────┬──────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
    │  WS     │          │  WS     │          │  WS     │
    │Server 1 │◀────────▶│Server 2 │◀────────▶│Server 3 │
    │10K conn │  Redis   │10K conn │  Redis   │10K conn │
    └─────────┘  Pub/Sub └─────────┘  Pub/Sub └─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                        ┌──────▼──────┐
                        │  PostgreSQL │
                        │   Primary   │
                        └─────────────┘
```

#### Load Balancing
- **Sticky Sessions**: Required (user must connect to same server)
- **Health Checks**: Ping/pong every 30 seconds
- **Auto-scaling**: Add server when CPU > 70%

#### Redis Pub/Sub
- Cross-server message broadcasting
- Room membership synchronization
- Connection count tracking

### Performance Optimizations

#### 1. Room-based Broadcasting
Only send events to users in the room:
```typescript
// Efficient: Only to club members
this.server.to(`club:${clubId}`).emit('gift:received', data);

// Inefficient: To all connections
this.server.emit('gift:received', data);
```

#### 2. Message Batching
Batch multiple gifts sent within 100ms:
```typescript
// Instead of sending 10 individual events in 1 second
// Batch into 1 event with array of gifts
this.server.to(roomId).emit('gifts:batch', [gift1, gift2, ...]);
```

#### 3. Binary Protocol
Use binary format for large data:
```typescript
// Instead of JSON (150 bytes)
// Use MessagePack (80 bytes) - 47% smaller
```

#### 4. Connection Pooling
```typescript
// Database connection pool
{
  max: 100,
  min: 10,
  idleTimeoutMillis: 30000,
}

// Redis connection pool
{
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
}
```

### Monitoring Metrics

```typescript
// Key metrics to track
metrics = {
  websocket: {
    activeConnections: 8500,
    connectionsPerSecond: 50,
    disconnectionsPerSecond: 45,
    messagesPerSecond: 1200,
    averageLatency: 78, // ms
    p95Latency: 120, // ms
    p99Latency: 250, // ms
  },
  gifts: {
    giftsPerMinute: 850,
    averageValue: 250, // crowns
    totalValuePerHour: 12750000, // crowns
    failureRate: 0.002, // 0.2%
  },
  rooms: {
    activeClubRooms: 450,
    averageMembersPerRoom: 18,
    largestRoom: 200,
  },
  performance: {
    cpuUsage: 65, // %
    memoryUsage: 4200, // MB
    eventLoopDelay: 2, // ms
  },
};
```

---

## Security Considerations

### Authentication
```typescript
// JWT verification on connection
async handleConnection(client: Socket) {
  const token = client.handshake.auth.token;
  
  try {
    const payload = await this.jwtService.verifyAsync(token);
    client.data.userId = payload.sub;
  } catch (error) {
    client.disconnect();
  }
}
```

### Authorization
```typescript
// Verify room access before joining
@SubscribeMessage('club:join')
async handleJoinClub(client: Socket, data: { clubId: string }) {
  const userId = client.data.userId;
  
  // Check membership
  const isMember = await this.clubsService.isUserMember(data.clubId, userId);
  if (!isMember) {
    throw new WsException('Access denied');
  }
  
  client.join(`club:${data.clubId}`);
}
```

### Rate Limiting
```typescript
// Per-user rate limiting
@UseGuards(WsThrottlerGuard)
@Throttle(10, 60) // 10 gifts per 60 seconds
@SubscribeMessage('gift:send')
async handleSendGift(client: Socket, data: any) {
  // ... gift sending logic
}
```

### Input Validation
```typescript
// Validate all incoming data
@SubscribeMessage('club:join')
async handleJoinClub(
  client: Socket,
  @MessageBody(new ValidationPipe()) data: JoinClubDto,
) {
  // data is validated
}

class JoinClubDto {
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  clubId: string;
}
```

### Anti-Spam Protection
```typescript
// Detect spam patterns
private detectSpam(userId: string, giftId: string): boolean {
  // Check if user sent same gift 10+ times in 1 minute
  const recentGifts = this.recentGiftsCache.get(userId) || [];
  const sameGiftCount = recentGifts.filter(g => 
    g.giftId === giftId && 
    Date.now() - g.timestamp < 60000
  ).length;
  
  return sameGiftCount >= 10;
}
```

---

## Error Handling

### Connection Errors

```typescript
// Client-side reconnection logic
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server forced disconnect - don't reconnect
    showError('Connection closed by server');
  } else {
    // Network issue - auto reconnect
    console.log('Reconnecting...');
  }
});

socket.on('connect_error', (error) => {
  if (error.message === 'Authentication failed') {
    // Refresh token and retry
    refreshAuthToken().then(newToken => {
      socket.auth.token = newToken;
      socket.connect();
    });
  }
});
```

### Message Delivery Failures

```typescript
// Server-side retry logic
async broadcastGift(giftData: GiftEventData) {
  try {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    
    if (!room || room.size === 0) {
      // No users in room - save for later delivery
      await this.queueOfflineGift(giftData);
      return;
    }
    
    this.server.to(roomId).emit('gift:received', giftData);
    
  } catch (error) {
    // Log failure and retry
    await this.logWebSocketEvent({
      eventType: 'gift:received',
      status: 'failed',
      errorMessage: error.message,
    });
    
    // Retry after 5 seconds
    setTimeout(() => this.broadcastGift(giftData), 5000);
  }
}
```

### Offline User Handling

```typescript
// Send missed gifts when user reconnects
@SubscribeMessage('club:join')
async handleJoinClub(client: Socket, data: { clubId: string }) {
  const userId = client.data.userId;
  
  // Check for missed gifts while offline
  const missedGifts = await this.giftsService.getMissedGifts(
    userId,
    data.clubId,
    client.data.lastSeenAt,
  );
  
  if (missedGifts.length > 0) {
    // Send missed gifts (up to 10 most recent)
    client.emit('gifts:missed', missedGifts.slice(0, 10));
  }
  
  // Join room
  client.join(`club:${data.clubId}`);
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test WebSocket event broadcasting
describe('GiftingGateway', () => {
  let gateway: GiftingGateway;
  let server: Server;

  beforeEach(() => {
    server = new Server();
    gateway = new GiftingGateway(jwtService, usersService, clubsService);
    gateway.server = server;
  });

  it('should broadcast gift to club room', async () => {
    const giftData = createMockGiftData();
    const spy = jest.spyOn(server.to, 'emit');
    
    await gateway.broadcastGift(giftData);
    
    expect(spy).toHaveBeenCalledWith('gift:received', giftData);
  });
});
```

### Integration Tests

```typescript
// Test full gift sending flow
describe('Gift Sending (E2E)', () => {
  it('should send gift and broadcast to all club members', async () => {
    // 1. Connect WebSocket clients
    const client1 = io('ws://localhost:3000');
    const client2 = io('ws://localhost:3000');
    
    // 2. Join club room
    await client1.emit('club:join', { clubId: 'club_123' });
    await client2.emit('club:join', { clubId: 'club_123' });
    
    // 3. Setup listener
    const promise = new Promise(resolve => {
      client2.on('gift:received', resolve);
    });
    
    // 4. Send gift via REST API
    await request(app)
      .post('/gifts/send')
      .send({ giftId: 'gift_rose', recipientId: 'club_123' });
    
    // 5. Verify client2 received event
    const event = await promise;
    expect(event.gift.id).toBe('gift_rose');
  });
});
```

### Load Tests

```typescript
// k6 load testing script
import ws from 'k6/ws';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 1000 }, // Ramp up
    { duration: '5m', target: 1000 }, // Stay at 1000
    { duration: '1m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const url = 'ws://localhost:3000/gifting';
  const params = { tags: { name: 'GiftingWS' } };

  ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({
        event: 'club:join',
        data: { clubId: 'club_123' },
      }));
    });

    socket.on('message', (data) => {
      const message = JSON.parse(data);
      check(message, {
        'received gift event': (msg) => msg.event === 'gift:received',
      });
    });
  });
}
```

---

## Implementation Checklist

### Phase 1: Backend Setup (Week 1-2)
- [ ] Install Socket.io and dependencies
- [ ] Create WebSocket gateway
- [ ] Implement authentication
- [ ] Setup Redis pub/sub
- [ ] Create database tables
- [ ] Add WebSocket event logging

### Phase 2: API Integration (Week 2-3)
- [ ] Update gift sending endpoint
- [ ] Add broadcasting logic
- [ ] Implement threshold updates
- [ ] Add global announcements
- [ ] Create offline gift queue

### Phase 3: Client Integration (Week 3-4)
- [ ] Install socket.io-client
- [ ] Create WebSocket service
- [ ] Add custom hook
- [ ] Update ClubRoomScreen
- [ ] Update GiftAnimationOverlay
- [ ] Add reconnection logic

### Phase 4: Testing (Week 4-5)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Conduct load testing
- [ ] Test reconnection scenarios
- [ ] Test offline message delivery

### Phase 5: Deployment (Week 5-6)
- [ ] Configure load balancer
- [ ] Setup monitoring
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor metrics

---

## Conclusion

WebSocket integration is **essential** for the gifting system to provide:
- ✅ Real-time synchronized animations
- ✅ Instant threshold updates
- ✅ Global announcements
- ✅ Better user experience
- ✅ Lower server costs
- ✅ Reduced battery consumption

The architecture described here supports **10,000+ concurrent connections**, **1,000+ gifts/minute**, and **<100ms latency**, providing users with an **immersive, social gifting experience** that encourages engagement and monetization.

---

**Next Steps:**
1. Review and approve this architecture
2. Setup development environment
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews

---

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Author:** Technical Architecture Team
