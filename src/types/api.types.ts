/**
 * API Types
 * Type definitions for API requests and responses
 */

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = any> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

/**
 * Standard API Error Response
 */
export interface ApiError {
  success: false;
  error: ErrorDetails;
  meta: ResponseMeta;
}

/**
 * Response Metadata
 */
export interface ResponseMeta {
  timestamp: string;
  requestId: string;
}

/**
 * Error Details
 */
export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  cursor?: string;
  hasMore: boolean;
  limit: number;
  total?: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Request Options
 */
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  skipCache?: boolean;
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API Error Codes
 */
export enum ApiErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_CROWNS = 'INSUFFICIENT_CROWNS',
  INSUFFICIENT_GEMS = 'INSUFFICIENT_GEMS',
  GAME_FULL = 'GAME_FULL',
  GAME_IN_PROGRESS = 'GAME_IN_PROGRESS',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  INVALID_MOVE = 'INVALID_MOVE',
  CLUB_FULL = 'CLUB_FULL',
  ALREADY_IN_CLUB = 'ALREADY_IN_CLUB',
  NOT_CLUB_MEMBER = 'NOT_CLUB_MEMBER',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PURCHASE_FAILED = 'PURCHASE_FAILED',
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * Network Status
 */
export type NetworkStatus = 'online' | 'offline' | 'unknown';

/**
 * Retry Strategy
 */
export interface RetryStrategy {
  maxRetries: number;
  retryDelay: number;
  retryableStatusCodes: number[];
  shouldRetry?: (error: any) => boolean;
}


