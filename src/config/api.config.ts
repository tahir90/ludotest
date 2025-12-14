import { ENV } from './env';

/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': ENV.CLIENT_VERSION,
    'X-Platform': ENV.PLATFORM,
  },
  retry: {
    maxRetries: ENV.MAX_RETRIES,
    retryDelay: ENV.RETRY_DELAY,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    GUEST_LOGIN: '/auth/guest',
    GOOGLE_LOGIN: '/auth/social/google',
    APPLE_LOGIN: '/auth/social/apple',
    FACEBOOK_LOGIN: '/auth/social/facebook',
    REFRESH_TOKEN: '/auth/refresh',
    CONVERT_GUEST: '/auth/guest/convert',
    LOGOUT: '/auth/logout',
  },

  // User Management
  USER: {
    GET_CURRENT: '/users/me',
    GET_BY_ID: (userId: string) => `/users/${userId}`,
    UPDATE_PROFILE: '/users/me',
    UPDATE_SETTINGS: '/users/me/settings',
    UPLOAD_AVATAR: '/users/me/avatar',
    GET_LEVEL: '/users/me/level',
    ADD_EXPERIENCE: '/users/me/experience',
    SEARCH: '/users/search',
  },

  // Game Management
  GAME: {
    CREATE: '/games',
    JOIN: (gameId: string) => `/games/${gameId}/join`,
    SET_READY: (gameId: string) => `/games/${gameId}/ready`,
    START: (gameId: string) => `/games/${gameId}/start`,
    ROLL_DICE: (gameId: string) => `/games/${gameId}/roll`,
    MOVE_PIECE: (gameId: string) => `/games/${gameId}/move`,
    GET_STATE: (gameId: string) => `/games/${gameId}`,
    LEAVE: (gameId: string) => `/games/${gameId}/leave`,
    HISTORY: '/games/history',
  },

  // Social Features
  SOCIAL: {
    GET_FRIENDS: '/friends',
    SEND_FRIEND_REQUEST: '/friends/request',
    GET_FRIEND_REQUESTS: '/friends/requests',
    ACCEPT_REQUEST: (requestId: string | number) => `/friends/requests/${requestId}/accept`,
    REJECT_REQUEST: (requestId: string | number) => `/friends/requests/${requestId}/reject`,
    REMOVE_FRIEND: (userId: string) => `/friends/${userId}`,
    BLOCK_USER: (userId: string) => `/users/${userId}/block`,
    UNBLOCK_USER: (userId: string) => `/users/${userId}/unblock`,
    GET_BLOCKED: '/users/blocked',
  },

  // Leaderboards
  LEADERBOARD: {
    GLOBAL: '/leaderboards/global',
    CROWN_KING: '/leaderboards/crown-king',
    RANK_PRICING: '/ranks/pricing',
    RENEW_RANK: '/users/me/rank/renew',
  },

  // Shop
  SHOP: {
    GET_ITEMS: '/shop/items',
    INITIATE_PURCHASE: '/shop/purchase/initiate',
    VERIFY_IOS: '/shop/purchase/verify/ios',
    VERIFY_ANDROID: '/shop/purchase/verify/android',
    PURCHASE_HISTORY: '/shop/purchases',
  },

  // Clubs
  CLUB: {
    GET_ALL: '/clubs',
    CREATE: '/clubs',
    GET_DETAILS: (clubId: string) => `/clubs/${clubId}`,
    JOIN: (clubId: string) => `/clubs/${clubId}/join`,
    LEAVE: (clubId: string) => `/clubs/${clubId}/leave`,
    GET_MEMBERS: (clubId: string) => `/clubs/${clubId}/members`,
    KICK_MEMBER: (clubId: string, userId: string) => `/clubs/${clubId}/members/${userId}/kick`,
    CHANGE_ROLE: (clubId: string, userId: string) => `/clubs/${clubId}/members/${userId}/role`,
    GET_MESSAGES: (clubId: string) => `/clubs/${clubId}/messages`,
    SEND_MESSAGE: (clubId: string) => `/clubs/${clubId}/messages`,
    GET_EVENTS: (clubId: string) => `/clubs/${clubId}/events`,
    GET_LEVEL: (clubId: string) => `/clubs/${clubId}/level`,
  },

  // Gifting
  GIFTING: {
    GET_CATALOG: '/gifts/catalog',
    SEND_GIFT: '/gifts/send',
    SEND_TO_CLUB: (clubId: string) => `/clubs/${clubId}/gifts/send`,
    SEND_IN_GAME: (gameId: string) => `/games/${gameId}/gifts/send`,
    GET_HISTORY: '/gifts/history',
  },

  // Notifications
  NOTIFICATION: {
    GET_ALL: '/notifications',
    GET_COUNTS: '/notifications/counts', // TODO: Implement in backend - see API_GAPS.md
    MARK_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (notificationId: string) => `/notifications/${notificationId}`,
  },

  // Analytics
  ANALYTICS: {
    TRACK_EVENT: '/analytics/events',
    GET_USER_ANALYTICS: '/analytics/users/me',
  },
};

/**
 * WebSocket Namespaces
 */
export const WS_NAMESPACES = {
  GAMING: '/gaming',
  CLUBS: '/clubs',
  GIFTING: '/gifting',
};

export default API_CONFIG;


