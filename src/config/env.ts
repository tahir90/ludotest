import { Platform } from 'react-native';

// Lazy import DeviceInfo to avoid issues if native module isn't linked
let DeviceInfo: any = null;
try {
  const DeviceInfoModule = require('react-native-device-info');
  // Check if native module is actually available
  if (DeviceInfoModule && DeviceInfoModule.default) {
    DeviceInfo = DeviceInfoModule.default;
  } else if (DeviceInfoModule) {
    DeviceInfo = DeviceInfoModule;
  }
  // Verify native module is linked by checking if methods exist
  if (DeviceInfo && typeof DeviceInfo.getUniqueId === 'function') {
    // Native module is properly linked
  } else {
    DeviceInfo = null; // Native module not linked, use fallback
  }
} catch (error) {
  // Silently handle - we'll use fallback values
  DeviceInfo = null;
}

/**
 * Environment configuration
 * Handles development/production environment settings
 */

export const ENV = {
  // API Configuration
  API_BASE_URL: __DEV__ 
    ? 'http://192.168.1.75:3000/v1'
    : 'https://api.ludogame.com/v1',
  
  WEBSOCKET_URL: __DEV__
    ? 'ws://192.168.1.75:3000'
    : 'wss://api.ludogame.com',

  // Client Configuration
  CLIENT_VERSION: '1.0.0',
  PLATFORM: Platform.OS as 'ios' | 'android',

  // Feature Flags
  USE_MOCK_DATA: false, // Set to true to use mock data instead of API
  ENABLE_ANALYTICS: true,
  ENABLE_LOGGING: __DEV__,

  // API Keys (should be loaded from secure storage or env variables)
  GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID || '',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',

  // API Settings
  API_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second base delay

  // Cache Settings
  CACHE_TTL: {
    USER_PROFILE: 5 * 60 * 1000, // 5 minutes
    LEADERBOARD: 2 * 60 * 1000, // 2 minutes
    SHOP_ITEMS: 60 * 60 * 1000, // 1 hour
    GIFT_CATALOG: 60 * 60 * 1000, // 1 hour
    CLUB_DETAILS: 5 * 60 * 1000, // 5 minutes
  },

  // WebSocket Settings
  WS_RECONNECT_ATTEMPTS: 5,
  WS_RECONNECT_DELAY: 1000,
  WS_HEARTBEAT_INTERVAL: 30000, // 30 seconds
};

/**
 * Get device information for API requests
 * Safe wrapper that handles errors gracefully
 */
export const getDeviceInfo = async () => {
  // If DeviceInfo isn't available, return fallback immediately
  if (!DeviceInfo) {
    return {
      deviceId: 'unknown',
      deviceModel: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
      osVersion: Platform.Version?.toString() || 'unknown',
      platform: Platform.OS,
      appVersion: '1.0.0',
      buildNumber: '1',
    };
  }

  try {
    return {
      deviceId: await DeviceInfo.getUniqueId(),
      deviceModel: DeviceInfo.getModel(),
      osVersion: DeviceInfo.getSystemVersion(),
      platform: Platform.OS,
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
    };
  } catch (error) {
    // Fallback if DeviceInfo fails
    console.warn('Failed to get device info, using fallback:', error);
    return {
      deviceId: 'unknown',
      deviceModel: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
      osVersion: Platform.Version?.toString() || 'unknown',
      platform: Platform.OS,
      appVersion: '1.0.0',
      buildNumber: '1',
    };
  }
};

export default ENV;


