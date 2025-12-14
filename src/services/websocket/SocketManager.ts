import { io, Socket } from 'socket.io-client';
import { ENV } from '$config/env';
import { WS_NAMESPACES } from '$config/api.config';
import { TokenManager } from '../auth/TokenManager';

/**
 * Socket Manager
 * Singleton manager for WebSocket connections
 */

type SocketNamespace = 'gaming' | 'clubs' | 'gifting';

interface SocketConnection {
  socket: Socket;
  connected: boolean;
  reconnectAttempts: number;
}

class SocketManager {
  private static instance: SocketManager | null = null;
  private connections: Map<SocketNamespace, SocketConnection> = new Map();
  private tokenManager: TokenManager;

  private constructor() {
    this.tokenManager = TokenManager.getInstance();
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  /**
   * Get or create socket connection for namespace
   */
  async getSocket(namespace: SocketNamespace): Promise<Socket> {
    const existing = this.connections.get(namespace);
    if (existing && existing.connected) {
      return existing.socket;
    }

    // Create new connection
    const namespacePath = this.getNamespacePath(namespace);
    const token = await this.tokenManager.getAccessToken();

    const socket = io(`${ENV.WEBSOCKET_URL}${namespacePath}`, {
      auth: {
        token: token || '',
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: ENV.WS_RECONNECT_ATTEMPTS,
      reconnectionDelay: ENV.WS_RECONNECT_DELAY,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    const connection: SocketConnection = {
      socket,
      connected: false,
      reconnectAttempts: 0,
    };

    // Setup event handlers
    socket.on('connect', () => {
      connection.connected = true;
      connection.reconnectAttempts = 0;
      console.log(`[WebSocket] Connected to ${namespace}`);
    });

    socket.on('disconnect', (reason) => {
      connection.connected = false;
      console.log(`[WebSocket] Disconnected from ${namespace}:`, reason);
    });

    socket.on('connect_error', async (error) => {
      console.error(`[WebSocket] Connection error for ${namespace}:`, error);
      
      // If auth error, try to refresh token and reconnect
      if (error.message.includes('auth') || error.message.includes('401')) {
        const newToken = await this.tokenManager.refreshToken();
        if (newToken) {
          socket.auth = { token: newToken };
          socket.connect();
        }
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      connection.reconnectAttempts = attemptNumber;
      console.log(`[WebSocket] Reconnect attempt ${attemptNumber} for ${namespace}`);
    });

    this.connections.set(namespace, connection);
    return socket;
  }

  /**
   * Disconnect socket for namespace
   */
  disconnect(namespace: SocketNamespace): void {
    const connection = this.connections.get(namespace);
    if (connection) {
      connection.socket.disconnect();
      connection.connected = false;
      this.connections.delete(namespace);
      console.log(`[WebSocket] Disconnected from ${namespace}`);
    }
  }

  /**
   * Disconnect all sockets
   */
  disconnectAll(): void {
    this.connections.forEach((connection, namespace) => {
      connection.socket.disconnect();
      console.log(`[WebSocket] Disconnected from ${namespace}`);
    });
    this.connections.clear();
  }

  /**
   * Check if socket is connected
   */
  isConnected(namespace: SocketNamespace): boolean {
    const connection = this.connections.get(namespace);
    return connection?.connected || false;
  }

  /**
   * Get namespace path
   */
  private getNamespacePath(namespace: SocketNamespace): string {
    switch (namespace) {
      case 'gaming':
        return WS_NAMESPACES.GAMING;
      case 'clubs':
        return WS_NAMESPACES.CLUBS;
      case 'gifting':
        return WS_NAMESPACES.GIFTING;
      default:
        return '';
    }
  }
}

export const socketManager = SocketManager.getInstance();
export default socketManager;


