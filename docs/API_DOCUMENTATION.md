# Ludo Game API Documentation

**Version:** 1.0.0  
**Last Updated:** 2024  
**Base URL:** `https://api.ludogame.com/v1`

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [User Management](#2-user-management)
3. [Player Leveling & Ranking](#3-player-leveling--ranking)
4. [Game Management](#4-game-management)
5. [Leaderboards & Rankings](#5-leaderboards--rankings)
6. [Shop & Purchases](#6-shop--purchases)
7. [Gifting System](#7-gifting-system)
8. [Club Management](#8-club-management)
9. [Club Events & Leveling](#9-club-events--leveling)
10. [Social Features](#10-social-features)
11. [Notifications](#11-notifications)
12. [Analytics & Telemetry](#12-analytics--telemetry)

---

## API Architecture & Best Practices

### Design Principles
- **RESTful Architecture** with resource-based endpoints
- **Stateless** authentication using JWT tokens
- **Pagination** for all list endpoints (cursor-based for performance)
- **Rate Limiting** per user and per endpoint
- **Versioning** in URL path for backward compatibility
- **Caching** strategy with ETags and Cache-Control headers
- **WebSocket** for real-time features (game updates, chat, notifications)

### Common Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.0.0
X-Platform: ios | android
X-Device-ID: <unique_device_id>
```

### Standard Response Format

#### Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

### Pagination Format

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "cursor": "base64_encoded_cursor",
    "hasMore": true,
    "limit": 20,
    "total": 1500
  }
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid auth but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate entry)
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## 1. Authentication & Authorization

### 1.1 Guest Login

**Endpoint:** `POST /auth/guest`

**Description:** Create a guest account for anonymous play.

**Request:**
```json
{
  "deviceId": "unique_device_identifier",
  "platform": "ios",
  "deviceModel": "iPhone 14 Pro",
  "osVersion": "17.0"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_guest_123abc",
    "username": "Guest_1234",
    "isGuest": true,
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "profile": {
      "id": "usr_guest_123abc",
      "username": "Guest_1234",
      "avatar": "default_avatar_url",
      "crowns": 1000,
      "tier": "D",
      "level": 1,
      "country": "US",
      "isGuest": true
    }
  }
}
```

---

### 1.2 Social Login (Google)

**Endpoint:** `POST /auth/social/google`

**Description:** Authenticate using Google Play Services.

**Request:**
```json
{
  "idToken": "google_id_token",
  "deviceId": "unique_device_identifier",
  "platform": "android"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_123abc",
    "username": "john_doe",
    "email": "john@example.com",
    "isNewUser": false,
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "profile": {
      "id": "usr_123abc",
      "username": "john_doe",
      "email": "john@example.com",
      "avatar": "https://cdn.ludogame.com/avatars/usr_123abc.jpg",
      "crowns": 5000,
      "tier": "B",
      "level": 15,
      "country": "US",
      "countryCode": "US",
      "isGuest": false,
      "emailVerified": true
    }
  }
}
```

---

### 1.3 Social Login (Apple)

**Endpoint:** `POST /auth/social/apple`

**Description:** Authenticate using Apple Sign In.

**Request:**
```json
{
  "identityToken": "apple_identity_token",
  "authorizationCode": "apple_authorization_code",
  "deviceId": "unique_device_identifier",
  "platform": "ios",
  "user": {
    "email": "john@privaterelay.appleid.com",
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_456def",
    "username": "john_doe",
    "email": "john@privaterelay.appleid.com",
    "isNewUser": true,
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "profile": {
      "id": "usr_456def",
      "username": "john_doe",
      "email": "john@privaterelay.appleid.com",
      "avatar": "https://cdn.ludogame.com/avatars/default.jpg",
      "crowns": 1000,
      "tier": "D",
      "level": 1,
      "country": "US",
      "isGuest": false,
      "emailVerified": true
    }
  }
}
```

---

### 1.4 Social Login (Facebook)

**Endpoint:** `POST /auth/social/facebook`

**Request:**
```json
{
  "accessToken": "facebook_access_token",
  "deviceId": "unique_device_identifier",
  "platform": "ios"
}
```

**Response:** `200 OK` (Same structure as Google login)

---

### 1.5 Convert Guest to Permanent Account

**Endpoint:** `POST /auth/guest/convert`

**Description:** Link guest account to social login or email.

**Request:**
```json
{
  "guestUserId": "usr_guest_123abc",
  "authMethod": "google",
  "idToken": "google_id_token",
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_123abc",
    "converted": true,
    "previousGuestId": "usr_guest_123abc",
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "profile": {
      "id": "usr_123abc",
      "username": "john_doe",
      "email": "john@example.com",
      "isGuest": false,
      "crowns": 1000,
      "tier": "D",
      "level": 1
    }
  }
}
```

---

### 1.6 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

---

### 1.7 Logout

**Endpoint:** `POST /auth/logout`

**Request:**
```json
{
  "refreshToken": "refresh_token_here",
  "deviceId": "unique_device_identifier"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

## 2. User Management

### 2.1 Get Current User Profile

**Endpoint:** `GET /users/me`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_123abc",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://cdn.ludogame.com/avatars/usr_123abc.jpg",
    "crowns": 5000,
    "gems": 150,
    "tier": "B",
    "level": 15,
    "experience": 4500,
    "experienceToNextLevel": 5000,
    "country": "US",
    "countryCode": "US",
    "signature": "Let's play!",
    "league": "gold",
    "isOnline": true,
    "lastActive": "2024-01-01T12:00:00Z",
    "createdAt": "2023-06-01T00:00:00Z",
    "stats": {
      "gamesPlayed": 150,
      "gamesWon": 90,
      "winRate": 60.0,
      "winStreak": 5,
      "maxWinStreak": 12,
      "totalCrownsEarned": 50000,
      "teamWins": 25
    },
    "settings": {
      "soundEnabled": true,
      "musicEnabled": true,
      "notificationsEnabled": true,
      "language": "en",
      "theme": "dark"
    },
    "achievements": {
      "total": 25,
      "unlocked": 15,
      "latestAchievement": {
        "id": "ach_100_wins",
        "name": "Century Maker",
        "unlockedAt": "2024-01-01T10:00:00Z"
      }
    }
  }
}
```

---

### 2.2 Update User Profile

**Endpoint:** `PATCH /users/me`

**Request:**
```json
{
  "username": "new_username",
  "avatar": "avatar_url_or_id",
  "signature": "New signature text",
  "country": "US",
  "countryCode": "US"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_123abc",
    "username": "new_username",
    "avatar": "https://cdn.ludogame.com/avatars/usr_123abc.jpg",
    "signature": "New signature text",
    "country": "US",
    "countryCode": "US",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 2.3 Get User by ID

**Endpoint:** `GET /users/{userId}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_456def",
    "username": "another_user",
    "avatar": "https://cdn.ludogame.com/avatars/usr_456def.jpg",
    "crowns": 8000,
    "tier": "A",
    "level": 25,
    "country": "UK",
    "countryCode": "GB",
    "signature": "Play to win!",
    "isOnline": false,
    "lastActive": "2024-01-01T10:00:00Z",
    "stats": {
      "gamesPlayed": 300,
      "gamesWon": 180,
      "winRate": 60.0,
      "winStreak": 3,
      "totalCrownsEarned": 100000
    },
    "isFriend": false,
    "friendRequestSent": false,
    "friendRequestReceived": false
  }
}
```

---

### 2.4 Update User Settings

**Endpoint:** `PATCH /users/me/settings`

**Request:**
```json
{
  "soundEnabled": true,
  "musicEnabled": false,
  "notificationsEnabled": true,
  "language": "en",
  "theme": "dark"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "settings": {
      "soundEnabled": true,
      "musicEnabled": false,
      "notificationsEnabled": true,
      "language": "en",
      "theme": "dark"
    }
  }
}
```

---

### 2.5 Upload Avatar

**Endpoint:** `POST /users/me/avatar`

**Content-Type:** `multipart/form-data`

**Request:**
```
FormData:
- avatar: <image_file> (max 5MB, jpg/png)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.ludogame.com/avatars/usr_123abc.jpg",
    "thumbnailUrl": "https://cdn.ludogame.com/avatars/usr_123abc_thumb.jpg",
    "uploadedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

## 3. Player Leveling & Ranking

### 3.1 Get Player Level Info

**Endpoint:** `GET /users/me/level`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_123abc",
    "level": 15,
    "experience": 4500,
    "experienceToNextLevel": 5000,
    "experienceRequired": 5000,
    "tier": "B",
    "rank": {
      "name": "Silver Champion",
      "icon": "https://cdn.ludogame.com/ranks/silver_champion.png",
      "achievedAt": "2023-12-01T00:00:00Z",
      "expiresAt": "2023-12-08T00:00:00Z",
      "isVisible": true,
      "isExpired": false,
      "daysRemaining": 3
    },
    "rankHistory": [
      {
        "rank": "Bronze Master",
        "achievedAt": "2023-11-01T00:00:00Z",
        "expiresAt": "2023-11-08T00:00:00Z"
      }
    ],
    "nextRank": {
      "name": "Gold Champion",
      "requiredLevel": 20,
      "levelsRemaining": 5
    }
  }
}
```

---

### 3.2 Add Experience

**Endpoint:** `POST /users/me/experience`

**Description:** Add experience points after game completion (called by backend after game ends).

**Request:**
```json
{
  "gameId": "game_123",
  "experienceEarned": 150,
  "reason": "game_win",
  "multiplier": 1.5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "experienceAdded": 150,
    "totalExperience": 4650,
    "leveledUp": false,
    "currentLevel": 15,
    "experienceToNextLevel": 4850,
    "rankUnlocked": null
  }
}
```

**Response (with level up):** `200 OK`
```json
{
  "success": true,
  "data": {
    "experienceAdded": 500,
    "totalExperience": 5100,
    "leveledUp": true,
    "previousLevel": 15,
    "currentLevel": 16,
    "experienceToNextLevel": 5500,
    "rewards": {
      "crowns": 1000,
      "gems": 10
    },
    "rankUnlocked": {
      "name": "Silver Elite",
      "icon": "https://cdn.ludogame.com/ranks/silver_elite.png",
      "expiresAt": "2024-01-08T12:00:00Z"
    }
  }
}
```

---

### 3.3 Renew Rank Visibility (Premium)

**Endpoint:** `POST /users/me/rank/renew`

**Description:** Pay crowns to display expired rank for another month.

**Request:**
```json
{
  "rankId": "rank_silver_champion",
  "duration": "monthly"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rankId": "rank_silver_champion",
    "rankName": "Silver Champion",
    "crownsCost": 5000,
    "newExpiresAt": "2024-02-01T00:00:00Z",
    "remainingCrowns": 45000,
    "subscriptionActive": true
  }
}
```

---

### 3.4 Get Rank Pricing

**Endpoint:** `GET /ranks/pricing`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "renewalOptions": [
      {
        "duration": "weekly",
        "days": 7,
        "crownsCost": 1500,
        "discount": 0
      },
      {
        "duration": "monthly",
        "days": 30,
        "crownsCost": 5000,
        "discount": 17
      },
      {
        "duration": "seasonal",
        "days": 90,
        "crownsCost": 12000,
        "discount": 33
      }
    ]
  }
}
```

---

## 4. Game Management

### 4.1 Create Game Session

**Endpoint:** `POST /games`

**Request:**
```json
{
  "mode": "2_player | 4_player | private | vip",
  "entryFee": 50,
  "isPrivate": false,
  "invitedPlayers": []
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "mode": "4_player",
    "entryFee": 50,
    "status": "waiting",
    "createdAt": "2024-01-01T12:00:00Z",
    "creator": {
      "userId": "usr_123abc",
      "username": "john_doe",
      "avatar": "https://cdn.ludogame.com/avatars/usr_123abc.jpg",
      "tier": "B",
      "level": 15
    },
    "players": [
      {
        "userId": "usr_123abc",
        "color": "red",
        "ready": false,
        "isHost": true
      }
    ],
    "maxPlayers": 4,
    "joinCode": "ABC123",
    "wsUrl": "wss://ws.ludogame.com/games/game_123abc"
  }
}
```

---

### 4.2 Join Game

**Endpoint:** `POST /games/{gameId}/join`

**Request:**
```json
{
  "joinCode": "ABC123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "joined": true,
    "playerColor": "blue",
    "playerPosition": 2,
    "players": [
      {
        "userId": "usr_123abc",
        "username": "john_doe",
        "avatar": "url",
        "color": "red",
        "ready": true,
        "isHost": true
      },
      {
        "userId": "usr_456def",
        "username": "player_two",
        "avatar": "url",
        "color": "blue",
        "ready": false,
        "isHost": false
      }
    ],
    "wsUrl": "wss://ws.ludogame.com/games/game_123abc"
  }
}
```

---

### 4.3 Ready Status

**Endpoint:** `POST /games/{gameId}/ready`

**Request:**
```json
{
  "ready": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_123abc",
    "ready": true,
    "allPlayersReady": false
  }
}
```

---

### 4.4 Start Game

**Endpoint:** `POST /games/{gameId}/start`

**Description:** Only host can start when all players are ready.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "status": "in_progress",
    "startedAt": "2024-01-01T12:00:00Z",
    "gameState": {
      "currentTurn": "usr_123abc",
      "turnStartedAt": "2024-01-01T12:00:00Z",
      "turnTimeLimit": 30,
      "players": [
        {
          "userId": "usr_123abc",
          "color": "red",
          "pieces": [
            {"id": 1, "position": 0, "isHome": true, "isSafe": true},
            {"id": 2, "position": 0, "isHome": true, "isSafe": true},
            {"id": 3, "position": 0, "isHome": true, "isSafe": true},
            {"id": 4, "position": 0, "isHome": true, "isSafe": true}
          ]
        }
      ]
    }
  }
}
```

---

### 4.5 Roll Dice

**Endpoint:** `POST /games/{gameId}/roll`

**Description:** Player rolls dice on their turn.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "roll": 6,
    "timestamp": "2024-01-01T12:00:00Z",
    "validMoves": [
      {
        "pieceId": 1,
        "fromPosition": 0,
        "toPosition": 6,
        "canMove": true
      }
    ],
    "extraRoll": true
  }
}
```

---

### 4.6 Move Piece

**Endpoint:** `POST /games/{gameId}/move`

**Request:**
```json
{
  "pieceId": 1,
  "toPosition": 6
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "moved": true,
    "pieceId": 1,
    "fromPosition": 0,
    "toPosition": 6,
    "capturedPieces": [],
    "isWinning": false,
    "nextTurn": "usr_456def",
    "gameState": {
      "currentTurn": "usr_456def",
      "turnStartedAt": "2024-01-01T12:00:10Z"
    }
  }
}
```

---

### 4.7 Leave Game

**Endpoint:** `POST /games/{gameId}/leave`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "left": true,
    "penaltyApplied": true,
    "penaltyAmount": 25,
    "remainingPlayers": 3
  }
}
```

---

### 4.8 Get Game State

**Endpoint:** `GET /games/{gameId}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "mode": "4_player",
    "status": "in_progress",
    "entryFee": 50,
    "totalPot": 200,
    "createdAt": "2024-01-01T12:00:00Z",
    "startedAt": "2024-01-01T12:05:00Z",
    "players": [...],
    "currentTurn": "usr_123abc",
    "gameState": {...}
  }
}
```

---

### 4.9 Get Game History

**Endpoint:** `GET /games/history`

**Query Parameters:**
- `cursor` (optional): Pagination cursor
- `limit` (optional): Results per page (default: 20, max: 100)
- `status` (optional): Filter by status (completed, abandoned)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "gameId": "game_123abc",
      "mode": "4_player",
      "status": "completed",
      "entryFee": 50,
      "result": "win",
      "rank": 1,
      "crownsWon": 150,
      "experienceGained": 200,
      "duration": 1200,
      "completedAt": "2024-01-01T12:20:00Z",
      "players": [
        {
          "userId": "usr_123abc",
          "username": "john_doe",
          "rank": 1,
          "crownsChange": 150
        }
      ]
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 20,
    "total": 150
  }
}
```

---

### 4.10 Report Game Result

**Endpoint:** `POST /games/{gameId}/complete`

**Description:** Backend endpoint called when game finishes.

**Request:**
```json
{
  "gameId": "game_123abc",
  "results": [
    {
      "userId": "usr_123abc",
      "rank": 1,
      "piecesHome": 4,
      "crownsEarned": 150,
      "experienceEarned": 200
    },
    {
      "userId": "usr_456def",
      "rank": 2,
      "piecesHome": 3,
      "crownsEarned": 50,
      "experienceEarned": 100
    }
  ],
  "duration": 1200,
  "completedAt": "2024-01-01T12:20:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "gameId": "game_123abc",
    "completed": true,
    "results": [...]
  }
}
```

---

## 5. Leaderboards & Rankings

### 5.1 Get Global Leaderboard

**Endpoint:** `GET /leaderboards/global`

**Query Parameters:**
- `type`: crown | win (default: crown)
- `timeframe`: all_time | weekly | monthly (default: all_time)
- `cursor` (optional): Pagination cursor
- `limit` (optional): Results per page (default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_789ghi",
        "username": "ProPlayer",
        "avatar": "https://cdn.ludogame.com/avatars/usr_789ghi.jpg",
        "crowns": 2500000,
        "tier": "SSS",
        "level": 99,
        "country": "US",
        "countryCode": "US",
        "stats": {
          "gamesPlayed": 5000,
          "gamesWon": 3500,
          "winRate": 70.0,
          "winStreak": 15
        },
        "isOnline": true
      }
    ],
    "currentUser": {
      "rank": 125,
      "userId": "usr_123abc",
      "username": "john_doe",
      "crowns": 5000,
      "tier": "B"
    }
  },
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 50
  }
}
```

---

### 5.2 Get Friends Leaderboard

**Endpoint:** `GET /leaderboards/friends`

**Query Parameters:**
- `type`: crown | win
- `timeframe`: all_time | weekly | monthly

**Response:** `200 OK` (Same structure as global leaderboard)

---

### 5.3 Get Crown King/Queen

**Endpoint:** `GET /leaderboards/crown-king`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "currentKing": {
      "userId": "usr_789ghi",
      "username": "CrownKing",
      "avatar": "https://cdn.ludogame.com/avatars/usr_789ghi.jpg",
      "crowns": 2500000,
      "tier": "SSS",
      "level": 99,
      "country": "US",
      "stats": {
        "gamesPlayed": 5000,
        "gamesWon": 3500,
        "winRate": 70.0
      },
      "crownedAt": "2024-01-01T00:00:00Z",
      "daysAsKing": 15
    },
    "runnerUps": [
      {
        "rank": 2,
        "userId": "usr_123abc",
        "username": "runner_up",
        "crowns": 1800000,
        "tier": "SS"
      }
    ]
  }
}
```

---

### 5.4 Get Win King/Queen

**Endpoint:** `GET /leaderboards/win-king`

**Response:** `200 OK` (Similar structure, based on total wins)

---

## 6. Shop & Purchases

### 6.1 Get Shop Items

**Endpoint:** `GET /shop/items`

**Query Parameters:**
- `category`: crowns | gems | bundles | avatars | themes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "bundle_starter",
        "type": "crown_bundle",
        "name": "Starter Pack",
        "description": "Get started with 1,200 crowns",
        "crowns": 1200,
        "bonus": 0,
        "price": 4.99,
        "currency": "USD",
        "productId": "com.ludogame.crowns.starter",
        "icon": "https://cdn.ludogame.com/shop/starter.png",
        "popular": false,
        "bestValue": false
      },
      {
        "id": "bundle_mega",
        "type": "crown_bundle",
        "name": "Mega Pack",
        "description": "Best value! 12,000 crowns + 50% bonus",
        "crowns": 12000,
        "bonus": 6000,
        "totalCrowns": 18000,
        "price": 99.99,
        "currency": "USD",
        "productId": "com.ludogame.crowns.mega",
        "icon": "https://cdn.ludogame.com/shop/mega.png",
        "popular": true,
        "bestValue": true,
        "discount": 50
      }
    ],
    "specialOffers": [
      {
        "id": "offer_weekend",
        "title": "Weekend Special",
        "description": "Double crowns on all purchases!",
        "multiplier": 2.0,
        "expiresAt": "2024-01-07T23:59:59Z"
      }
    ]
  }
}
```

---

### 6.2 Initiate Purchase

**Endpoint:** `POST /shop/purchase/initiate`

**Request:**
```json
{
  "itemId": "bundle_mega",
  "platform": "ios",
  "deviceId": "unique_device_id"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_123abc",
    "itemId": "bundle_mega",
    "productId": "com.ludogame.crowns.mega",
    "price": 99.99,
    "currency": "USD",
    "nonce": "verification_nonce_for_client"
  }
}
```

---

### 6.3 Verify Purchase (iOS)

**Endpoint:** `POST /shop/purchase/verify/ios`

**Request:**
```json
{
  "transactionId": "txn_123abc",
  "receiptData": "base64_encoded_receipt",
  "productId": "com.ludogame.crowns.mega"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "verified": true,
    "transactionId": "txn_123abc",
    "itemId": "bundle_mega",
    "crownsAdded": 18000,
    "newBalance": 23000,
    "purchasedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 6.4 Verify Purchase (Android)

**Endpoint:** `POST /shop/purchase/verify/android`

**Request:**
```json
{
  "transactionId": "txn_123abc",
  "purchaseToken": "google_purchase_token",
  "productId": "com.ludogame.crowns.mega",
  "packageName": "com.ludogame.app"
}
```

**Response:** `200 OK` (Same structure as iOS)

---

### 6.5 Get Purchase History

**Endpoint:** `GET /shop/purchases`

**Query Parameters:**
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "txn_123abc",
      "itemId": "bundle_mega",
      "itemName": "Mega Pack",
      "crownsReceived": 18000,
      "price": 99.99,
      "currency": "USD",
      "platform": "ios",
      "status": "completed",
      "purchasedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 20
  }
}
```

---

## 7. Gifting System

### 7.1 Get Gift Catalog

**Endpoint:** `GET /gifts/catalog`

**Query Parameters:**
- `category`: basic | premium | ultra

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "categories": {
      "basic": [
        {
          "id": "gift_coffee",
          "name": "Coffee",
          "icon": "☕",
          "animationUrl": "https://cdn.ludogame.com/animations/coffee.json",
          "audioUrl": "https://cdn.ludogame.com/audio/coffee.mp3",
          "price": 10,
          "category": "basic",
          "rarity": "common"
        }
      ],
      "premium": [
        {
          "id": "gift_rose",
          "name": "Rose",
          "icon": "🌹",
          "animationUrl": "https://cdn.ludogame.com/animations/rose.json",
          "audioUrl": "https://cdn.ludogame.com/audio/rose.mp3",
          "price": 100,
          "category": "premium",
          "rarity": "rare"
        }
      ],
      "ultra": [
        {
          "id": "gift_dragon",
          "name": "Golden Dragon",
          "icon": "🐉",
          "animationUrl": "https://cdn.ludogame.com/animations/dragon_golden.json",
          "audioUrl": "https://cdn.ludogame.com/audio/dragon.mp3",
          "price": 10000,
          "category": "ultra",
          "rarity": "legendary",
          "effects": {
            "globalAnnouncement": true,
            "specialAnimation": true
          }
        }
      ]
    }
  }
}
```

---

### 7.2 Send Gift to User

**Endpoint:** `POST /gifts/send`

**Request:**
```json
{
  "giftId": "gift_rose",
  "recipientId": "usr_456def",
  "quantity": 7,
  "message": "Great game!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "giftTransactionId": "gtx_123abc",
    "giftId": "gift_rose",
    "giftName": "Rose",
    "sender": {
      "userId": "usr_123abc",
      "username": "john_doe",
      "avatar": "url"
    },
    "recipient": {
      "userId": "usr_456def",
      "username": "recipient_user",
      "avatar": "url"
    },
    "quantity": 7,
    "totalCost": 700,
    "remainingCrowns": 4300,
    "message": "Great game!",
    "sentAt": "2024-01-01T12:00:00Z",
    "animation": {
      "url": "https://cdn.ludogame.com/animations/rose.json",
      "audioUrl": "https://cdn.ludogame.com/audio/rose.mp3"
    }
  }
}
```

---

### 7.3 Send Gift in Club

**Endpoint:** `POST /clubs/{clubId}/gifts/send`

**Request:**
```json
{
  "giftId": "gift_dragon",
  "quantity": 1,
  "message": "For the club!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "giftTransactionId": "gtx_456def",
    "giftId": "gift_dragon",
    "giftName": "Golden Dragon",
    "sender": {
      "userId": "usr_123abc",
      "username": "john_doe",
      "avatar": "url"
    },
    "clubId": "club_123",
    "clubName": "AAO NAAA",
    "quantity": 1,
    "totalValue": 10000,
    "remainingCrowns": 40000,
    "sentAt": "2024-01-01T12:00:00Z",
    "clubThresholdContribution": 10000,
    "newThresholdProgress": 18500,
    "thresholdCompleted": false,
    "globalAnnouncement": true
  }
}
```

---

### 7.4 Get Gift History

**Endpoint:** `GET /gifts/history`

**Query Parameters:**
- `type`: sent | received
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "giftTransactionId": "gtx_123abc",
      "giftId": "gift_rose",
      "giftName": "Rose",
      "sender": {
        "userId": "usr_123abc",
        "username": "john_doe"
      },
      "recipient": {
        "userId": "usr_456def",
        "username": "recipient_user"
      },
      "quantity": 7,
      "totalValue": 700,
      "message": "Great game!",
      "sentAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 20
  }
}
```

---

## 8. Club Management

### 8.1 Get All Clubs

**Endpoint:** `GET /clubs`

**Query Parameters:**
- `search` (optional): Search by name
- `language` (optional): Filter by language
- `privacy`: public | private | all (default: public)
- `minLevel` (optional): Minimum club level
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "club_123",
      "name": "AAO NAAA",
      "avatar": "https://cdn.ludogame.com/clubs/club_123.jpg",
      "description": "Hey buddy, welcome aboard!",
      "owner": {
        "userId": "usr_owner_1",
        "username": "KING"
      },
      "memberCount": 45,
      "maxMembers": 50,
      "totalCrowns": 500000,
      "level": 5,
      "rank": {
        "name": "Silver Club",
        "icon": "https://cdn.ludogame.com/ranks/club_silver.png"
      },
      "privacy": "public",
      "language": "English",
      "createdAt": "2023-06-01T00:00:00Z",
      "isJoined": false,
      "isFull": false,
      "activeMembers": 30
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 20
  }
}
```

---

### 8.2 Get Club Details

**Endpoint:** `GET /clubs/{clubId}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "club_123",
    "name": "AAO NAAA",
    "avatar": "https://cdn.ludogame.com/clubs/club_123.jpg",
    "description": "Hey buddy, welcome aboard!",
    "rules": "Respect each other & make new friends",
    "owner": {
      "userId": "usr_owner_1",
      "username": "KING",
      "avatar": "url",
      "tier": "SSS",
      "level": 99
    },
    "memberCount": 45,
    "maxMembers": 50,
    "totalCrowns": 500000,
    "level": 5,
    "experience": 45000,
    "experienceToNextLevel": 50000,
    "rank": {
      "name": "Silver Club",
      "icon": "https://cdn.ludogame.com/ranks/club_silver.png",
      "tier": 2
    },
    "privacy": "public",
    "language": "English",
    "createdAt": "2023-06-01T00:00:00Z",
    "giftingThreshold": {
      "current": 8500,
      "target": 15000,
      "level": "Gold",
      "progress": 56.67
    },
    "micSlots": {
      "total": 10,
      "unlocked": 5,
      "active": 3
    },
    "stats": {
      "totalGiftsReceived": 150000,
      "activeEvents": 1,
      "weeklyActivity": 450
    },
    "isJoined": true,
    "isMember": true,
    "myRole": "member"
  }
}
```

---

### 8.3 Create Club

**Endpoint:** `POST /clubs`

**Request:**
```json
{
  "name": "My Awesome Club",
  "description": "Join us for fun!",
  "rules": "Be respectful",
  "privacy": "public",
  "language": "English",
  "avatar": "avatar_url"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "club_456",
    "name": "My Awesome Club",
    "description": "Join us for fun!",
    "rules": "Be respectful",
    "owner": {
      "userId": "usr_123abc",
      "username": "john_doe"
    },
    "memberCount": 1,
    "maxMembers": 50,
    "totalCrowns": 0,
    "level": 1,
    "privacy": "public",
    "language": "English",
    "createdAt": "2024-01-01T12:00:00Z",
    "micSlots": {
      "total": 10,
      "unlocked": 5
    }
  }
}
```

---

### 8.4 Join Club

**Endpoint:** `POST /clubs/{clubId}/join`

**Request:**
```json
{
  "password": "optional_club_password"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clubId": "club_123",
    "joined": true,
    "role": "member",
    "joinedAt": "2024-01-01T12:00:00Z",
    "memberNumber": 46
  }
}
```

---

### 8.5 Leave Club

**Endpoint:** `POST /clubs/{clubId}/leave`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clubId": "club_123",
    "left": true,
    "leftAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 8.6 Get Club Members

**Endpoint:** `GET /clubs/{clubId}/members`

**Query Parameters:**
- `role` (optional): owner | admin | moderator | member
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "userId": "usr_owner_1",
      "username": "KING",
      "avatar": "url",
      "role": "owner",
      "tier": "SSS",
      "level": 99,
      "crownsContributed": 50000,
      "joinedAt": "2023-06-01T00:00:00Z",
      "isOnline": true,
      "lastActive": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 50
  }
}
```

---

### 8.7 Update Club

**Endpoint:** `PATCH /clubs/{clubId}`

**Description:** Owner/admin only.

**Request:**
```json
{
  "name": "Updated Club Name",
  "description": "New description",
  "rules": "Updated rules",
  "privacy": "private",
  "avatar": "new_avatar_url"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "club_123",
    "name": "Updated Club Name",
    "description": "New description",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 8.8 Kick Member

**Endpoint:** `POST /clubs/{clubId}/members/{userId}/kick`

**Description:** Owner/admin only.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clubId": "club_123",
    "userId": "usr_456def",
    "kicked": true,
    "kickedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 8.9 Promote/Demote Member

**Endpoint:** `PATCH /clubs/{clubId}/members/{userId}/role`

**Request:**
```json
{
  "role": "admin"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_456def",
    "previousRole": "member",
    "newRole": "admin",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

## 9. Club Events & Leveling

### 9.1 Get Active Club Events

**Endpoint:** `GET /clubs/{clubId}/events`

**Query Parameters:**
- `status`: active | upcoming | completed

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "eventId": "event_123",
      "type": "gifting_threshold",
      "title": "Weekend Gift Rush",
      "description": "Reach 50,000 crowns in gifts by Sunday!",
      "status": "active",
      "startTime": "2024-01-05T00:00:00Z",
      "endTime": "2024-01-07T23:59:59Z",
      "timeRemaining": 172800,
      "goals": [
        {
          "type": "gifting",
          "target": 50000,
          "current": 32000,
          "progress": 64.0,
          "rewards": {
            "clubExperience": 5000,
            "memberBonusCrowns": 500
          }
        }
      ],
      "multiplier": 2.0,
      "participantsCount": 38,
      "topContributors": [
        {
          "userId": "usr_123abc",
          "username": "john_doe",
          "contribution": 8000,
          "rank": 1
        }
      ]
    }
  ]
}
```

---

### 9.2 Get Club Level Info

**Endpoint:** `GET /clubs/{clubId}/level`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clubId": "club_123",
    "level": 5,
    "experience": 45000,
    "experienceToNextLevel": 50000,
    "experienceRequired": 50000,
    "rank": {
      "name": "Silver Club",
      "icon": "https://cdn.ludogame.com/ranks/club_silver.png",
      "tier": 2,
      "benefits": [
        "5 unlocked mic slots",
        "Custom club avatar",
        "Priority matchmaking"
      ]
    },
    "nextLevel": {
      "level": 6,
      "experienceRequired": 60000,
      "newUnlocks": [
        "6th mic slot"
      ]
    },
    "micSlots": {
      "total": 10,
      "unlocked": 5,
      "nextUnlock": {
        "level": 11,
        "slotsToUnlock": 5
      }
    }
  }
}
```

---

### 9.3 Contribute to Club (Gifting)

**Endpoint:** `POST /clubs/{clubId}/contribute`

**Description:** This is called automatically when gifts are sent in club.

**Request:**
```json
{
  "giftTransactionId": "gtx_123abc",
  "value": 10000
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clubId": "club_123",
    "contribution": 10000,
    "totalContributed": 60000,
    "experienceGained": 1000,
    "newExperience": 46000,
    "leveledUp": false,
    "thresholdProgress": {
      "previous": 8500,
      "current": 18500,
      "target": 15000,
      "completed": true
    },
    "rewards": {
      "clubExperience": 2000,
      "memberBonusCrowns": 100
    }
  }
}
```

**Response (with level up):** `200 OK`
```json
{
  "success": true,
  "data": {
    "clubId": "club_123",
    "contribution": 10000,
    "experienceGained": 5000,
    "leveledUp": true,
    "previousLevel": 5,
    "newLevel": 6,
    "newExperience": 0,
    "nextLevelExperience": 60000,
    "rewards": {
      "clubExperience": 5000,
      "memberBonusCrowns": 500,
      "newMicSlotUnlocked": false
    },
    "rankUpdated": false
  }
}
```

---

### 9.4 Get Club Leaderboard

**Endpoint:** `GET /leaderboards/clubs`

**Query Parameters:**
- `type`: level | crowns | activity
- `timeframe`: all_time | weekly | monthly
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "clubId": "club_456",
      "clubName": "Elite Club",
      "clubAvatar": "url",
      "level": 25,
      "totalCrowns": 5000000,
      "memberCount": 200,
      "rank": {
        "name": "Diamond Club",
        "tier": 5
      },
      "weeklyActivity": 15000
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 50
  }
}
```

---

### 9.5 Manage Mic Slots

**Endpoint:** `POST /clubs/{clubId}/mic-slots/{slotId}/occupy`

**Request:**
```json
{
  "action": "join"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "slotId": 1,
    "userId": "usr_123abc",
    "username": "john_doe",
    "active": true,
    "joinedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 9.6 Leave Mic Slot

**Endpoint:** `POST /clubs/{clubId}/mic-slots/{slotId}/leave`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "slotId": 1,
    "freed": true,
    "leftAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 9.7 Get Club Chat Messages

**Endpoint:** `GET /clubs/{clubId}/messages`

**Query Parameters:**
- `before` (optional): Timestamp for pagination
- `limit` (optional): Default 50, max 100

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_123",
      "userId": "usr_123abc",
      "username": "john_doe",
      "avatar": "url",
      "message": "Hello everyone!",
      "type": "text",
      "timestamp": "2024-01-01T12:00:00Z",
      "reactions": {
        "❤️": 5,
        "👍": 3
      }
    },
    {
      "id": "msg_124",
      "userId": "usr_123abc",
      "username": "john_doe",
      "type": "gift",
      "giftId": "gift_dragon",
      "giftName": "Golden Dragon",
      "quantity": 1,
      "message": "For the club!",
      "timestamp": "2024-01-01T12:05:00Z"
    },
    {
      "id": "msg_125",
      "userId": "system",
      "username": "System",
      "type": "announcement",
      "message": "Club leveled up to Level 6!",
      "timestamp": "2024-01-01T12:10:00Z"
    }
  ],
  "hasMore": true,
  "oldestTimestamp": "2024-01-01T11:00:00Z"
}
```

---

### 9.8 Send Club Chat Message

**Endpoint:** `POST /clubs/{clubId}/messages`

**Request:**
```json
{
  "message": "Hello everyone!",
  "type": "text"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "msg_123",
    "userId": "usr_123abc",
    "username": "john_doe",
    "avatar": "url",
    "message": "Hello everyone!",
    "type": "text",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

---

## 10. Social Features

### 10.1 Get Friends List

**Endpoint:** `GET /friends`

**Query Parameters:**
- `status`: accepted | pending | blocked
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "userId": "usr_456def",
      "username": "friend_user",
      "avatar": "url",
      "crowns": 8000,
      "tier": "A",
      "level": 25,
      "country": "UK",
      "isOnline": true,
      "lastActive": "2024-01-01T12:00:00Z",
      "friendSince": "2023-06-01T00:00:00Z",
      "stats": {
        "gamesPlayed": 300,
        "gamesWon": 180,
        "winRate": 60.0
      }
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 50
  }
}
```

---

### 10.2 Send Friend Request

**Endpoint:** `POST /friends/request`

**Request:**
```json
{
  "userId": "usr_456def"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "requestId": "freq_123abc",
    "fromUserId": "usr_123abc",
    "toUserId": "usr_456def",
    "status": "pending",
    "sentAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 10.3 Get Friend Requests

**Endpoint:** `GET /friends/requests`

**Query Parameters:**
- `type`: received | sent

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "requestId": "freq_123abc",
      "from": {
        "userId": "usr_789ghi",
        "username": "new_friend",
        "avatar": "url",
        "tier": "S",
        "level": 30
      },
      "status": "pending",
      "sentAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 10.4 Accept Friend Request

**Endpoint:** `POST /friends/requests/{requestId}/accept`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "requestId": "freq_123abc",
    "status": "accepted",
    "acceptedAt": "2024-01-01T12:00:00Z",
    "friend": {
      "userId": "usr_789ghi",
      "username": "new_friend",
      "avatar": "url"
    }
  }
}
```

---

### 10.5 Reject Friend Request

**Endpoint:** `POST /friends/requests/{requestId}/reject`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "requestId": "freq_123abc",
    "status": "rejected",
    "rejectedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 10.6 Remove Friend

**Endpoint:** `DELETE /friends/{userId}`

**Response:** `204 No Content`

---

### 10.7 Search Users

**Endpoint:** `GET /users/search`

**Query Parameters:**
- `q`: Search query (username, user ID)
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "userId": "usr_789ghi",
      "username": "searchable_user",
      "avatar": "url",
      "tier": "S",
      "level": 30,
      "country": "US",
      "isOnline": false,
      "isFriend": false,
      "friendRequestSent": false,
      "friendRequestReceived": false
    }
  ],
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 20
  }
}
```

---

### 10.8 Block User

**Endpoint:** `POST /users/{userId}/block`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_789ghi",
    "blocked": true,
    "blockedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 10.9 Unblock User

**Endpoint:** `POST /users/{userId}/unblock`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_789ghi",
    "unblocked": true,
    "unblockedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 10.10 Get Blocked Users

**Endpoint:** `GET /users/blocked`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "userId": "usr_789ghi",
      "username": "blocked_user",
      "avatar": "url",
      "blockedAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

---

## 11. Notifications

### 11.1 Get Notifications

**Endpoint:** `GET /notifications`

**Query Parameters:**
- `type` (optional): friend_request | gift | game | club | system
- `unreadOnly` (optional): true | false
- `cursor` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_123",
      "type": "friend_request",
      "title": "New Friend Request",
      "message": "new_friend wants to be your friend",
      "data": {
        "requestId": "freq_123abc",
        "fromUserId": "usr_789ghi",
        "fromUsername": "new_friend"
      },
      "isRead": false,
      "createdAt": "2024-01-01T12:00:00Z",
      "actionUrl": "/friends/requests"
    },
    {
      "id": "notif_124",
      "type": "gift",
      "title": "Gift Received",
      "message": "john_doe sent you a Rose",
      "data": {
        "giftId": "gift_rose",
        "giftName": "Rose",
        "quantity": 1,
        "fromUserId": "usr_123abc"
      },
      "isRead": true,
      "createdAt": "2024-01-01T11:30:00Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "cursor": "base64_cursor",
    "hasMore": true,
    "limit": 20
  }
}
```

---

### 11.2 Mark Notification as Read

**Endpoint:** `POST /notifications/{notificationId}/read`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "notificationId": "notif_123",
    "read": true,
    "readAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 11.3 Mark All as Read

**Endpoint:** `POST /notifications/read-all`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "markedAsRead": 15,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

---

### 11.4 Delete Notification

**Endpoint:** `DELETE /notifications/{notificationId}`

**Response:** `204 No Content`

---

### 11.5 Register Push Token

**Endpoint:** `POST /notifications/push/register`

**Request:**
```json
{
  "token": "fcm_or_apns_token",
  "platform": "ios",
  "deviceId": "unique_device_id"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "registered": true,
    "token": "fcm_or_apns_token",
    "platform": "ios",
    "registeredAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 11.6 Unregister Push Token

**Endpoint:** `POST /notifications/push/unregister`

**Request:**
```json
{
  "token": "fcm_or_apns_token",
  "deviceId": "unique_device_id"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "unregistered": true,
    "unregisteredAt": "2024-01-01T12:00:00Z"
  }
}
```

---

## 12. Analytics & Telemetry

### 12.1 Track Event

**Endpoint:** `POST /analytics/events`

**Request:**
```json
{
  "eventName": "game_completed",
  "properties": {
    "gameId": "game_123abc",
    "mode": "4_player",
    "result": "win",
    "duration": 1200
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tracked": true,
    "eventId": "evt_123abc"
  }
}
```

---

### 12.2 Get User Analytics

**Endpoint:** `GET /analytics/users/me`

**Query Parameters:**
- `timeframe`: daily | weekly | monthly | all_time

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "timeframe": "weekly",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-07T23:59:59Z",
    "stats": {
      "gamesPlayed": 45,
      "gamesWon": 28,
      "winRate": 62.2,
      "averageGameDuration": 900,
      "crownsEarned": 5000,
      "crownsSpent": 2000,
      "giftsReceived": 15,
      "giftsSent": 10,
      "clubActivity": 120,
      "playtime": 40500
    },
    "trends": {
      "winRate": {
        "current": 62.2,
        "previous": 58.5,
        "change": 3.7,
        "trend": "up"
      },
      "gamesPlayed": {
        "current": 45,
        "previous": 40,
        "change": 5,
        "trend": "up"
      }
    }
  }
}
```

---

## WebSocket API

### Connection

**URL:** `wss://ws.ludogame.com`

**Connection Parameters:**
```
?token=<jwt_token>
&clientVersion=1.0.0
&platform=ios
```

### Events

#### Client → Server

**Join Game Room:**
```json
{
  "event": "game:join",
  "data": {
    "gameId": "game_123abc"
  }
}
```

**Leave Game Room:**
```json
{
  "event": "game:leave",
  "data": {
    "gameId": "game_123abc"
  }
}
```

**Join Club Room:**
```json
{
  "event": "club:join",
  "data": {
    "clubId": "club_123"
  }
}
```

**Send Club Message:**
```json
{
  "event": "club:message",
  "data": {
    "clubId": "club_123",
    "message": "Hello!"
  }
}
```

#### Server → Client

**Game State Update:**
```json
{
  "event": "game:update",
  "data": {
    "gameId": "game_123abc",
    "currentTurn": "usr_456def",
    "lastMove": {
      "userId": "usr_123abc",
      "pieceId": 1,
      "fromPosition": 0,
      "toPosition": 6
    }
  }
}
```

**Player Joined:**
```json
{
  "event": "game:player_joined",
  "data": {
    "gameId": "game_123abc",
    "player": {
      "userId": "usr_789ghi",
      "username": "player_three",
      "color": "green"
    }
  }
}
```

**Gift Notification:**
```json
{
  "event": "gift:received",
  "data": {
    "giftTransactionId": "gtx_123abc",
    "giftId": "gift_rose",
    "giftName": "Rose",
    "quantity": 1,
    "sender": {
      "userId": "usr_123abc",
      "username": "john_doe"
    },
    "animation": {
      "url": "https://cdn.ludogame.com/animations/rose.json",
      "audioUrl": "https://cdn.ludogame.com/audio/rose.mp3"
    }
  }
}
```

**Club Message:**
```json
{
  "event": "club:message",
  "data": {
    "clubId": "club_123",
    "message": {
      "id": "msg_123",
      "userId": "usr_123abc",
      "username": "john_doe",
      "message": "Hello everyone!",
      "type": "text",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  }
}
```

**Notification:**
```json
{
  "event": "notification:new",
  "data": {
    "id": "notif_123",
    "type": "friend_request",
    "title": "New Friend Request",
    "message": "new_friend wants to be your friend"
  }
}
```

---

## Rate Limiting

### Limits by Endpoint Type

| Endpoint Category | Requests per Minute | Requests per Hour |
|-------------------|---------------------|-------------------|
| Authentication    | 10                  | 50                |
| Game Actions      | 120                 | 1000              |
| Social Actions    | 60                  | 500               |
| Shop & Purchase   | 30                  | 200               |
| Chat Messages     | 60                  | 1000              |
| Read Operations   | 300                 | 5000              |
| WebSocket         | N/A                 | N/A               |

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704110400
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (duplicate entry) |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INSUFFICIENT_CROWNS` | Not enough crowns for operation |
| `INSUFFICIENT_GEMS` | Not enough gems for operation |
| `GAME_FULL` | Game lobby is full |
| `GAME_IN_PROGRESS` | Cannot join game in progress |
| `NOT_YOUR_TURN` | Action attempted on opponent's turn |
| `INVALID_MOVE` | Move is not allowed |
| `CLUB_FULL` | Club has reached max members |
| `ALREADY_IN_CLUB` | User already in a club |
| `NOT_CLUB_MEMBER` | User is not a member of the club |
| `PERMISSION_DENIED` | Insufficient club permissions |
| `PURCHASE_FAILED` | Purchase verification failed |
| `SERVER_ERROR` | Internal server error |

---

## Caching Strategy

### ETags
All GET endpoints support ETags for efficient caching.

**Request:**
```
GET /users/me
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

**Response (Not Modified):**
```
304 Not Modified
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

### Cache-Control Headers

```
Cache-Control: public, max-age=60
Cache-Control: private, max-age=3600
Cache-Control: no-cache
Cache-Control: no-store
```

---

## Pagination Best Practices

### Cursor-Based Pagination

All list endpoints use cursor-based pagination for better performance with large datasets.

**Initial Request:**
```
GET /games/history?limit=20
```

**Subsequent Request:**
```
GET /games/history?cursor=base64_encoded_cursor&limit=20
```

### Pagination Response

```json
{
  "pagination": {
    "cursor": "eyJpZCI6MTIzLCJ0aW1lc3RhbXAiOjE3MDQwOTg0MDB9",
    "hasMore": true,
    "limit": 20,
    "total": 1500
  }
}
```

---

## Versioning

API versioning is handled through URL path:

- **v1:** `https://api.ludogame.com/v1/`
- **v2:** `https://api.ludogame.com/v2/` (future)

Deprecated endpoints will be supported for at least 6 months after new version release.

---

## Security

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "usr_123abc",
    "iat": 1704110400,
    "exp": 1704114000,
    "type": "access",
    "platform": "ios",
    "deviceId": "unique_device_id"
  }
}
```

### Token Expiration

- **Access Token:** 1 hour
- **Refresh Token:** 30 days

### Password Requirements (if email auth added)

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

## Performance Optimization

### Batch Requests

**Endpoint:** `POST /batch`

**Request:**
```json
{
  "requests": [
    {
      "id": "req1",
      "method": "GET",
      "url": "/users/me"
    },
    {
      "id": "req2",
      "method": "GET",
      "url": "/friends"
    },
    {
      "id": "req3",
      "method": "GET",
      "url": "/clubs/club_123"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "responses": [
    {
      "id": "req1",
      "status": 200,
      "data": {...}
    },
    {
      "id": "req2",
      "status": 200,
      "data": {...}
    },
    {
      "id": "req3",
      "status": 200,
      "data": {...}
    }
  ]
}
```

### GraphQL Alternative

For clients preferring GraphQL, an alternative endpoint is available:

**Endpoint:** `POST /graphql`

---

## Support & Resources

- **API Status:** https://status.ludogame.com
- **Developer Portal:** https://developers.ludogame.com
- **Support:** api-support@ludogame.com
- **Change Log:** https://developers.ludogame.com/changelog

---

**End of API Documentation**
