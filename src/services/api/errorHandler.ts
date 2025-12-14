import { ApiError, ApiErrorCode } from '$types/api.types';
import { ENV } from '$config/env';

/**
 * Centralized Error Handler
 * Transforms API errors into user-friendly messages
 */

export interface TransformedError {
  code: string;
  message: string;
  userMessage: string;
  details?: Record<string, any>;
  retryable: boolean;
}

/**
 * Error code to user-friendly message mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  [ApiErrorCode.INVALID_REQUEST]: 'Invalid request. Please check your input and try again.',
  [ApiErrorCode.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
  [ApiErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ApiErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ApiErrorCode.CONFLICT]: 'This action conflicts with the current state.',
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ApiErrorCode.INSUFFICIENT_CROWNS]: 'You do not have enough crowns for this action.',
  [ApiErrorCode.INSUFFICIENT_GEMS]: 'You do not have enough gems for this action.',
  [ApiErrorCode.GAME_FULL]: 'This game is full. Please join another game.',
  [ApiErrorCode.GAME_IN_PROGRESS]: 'This game has already started.',
  [ApiErrorCode.NOT_YOUR_TURN]: "It's not your turn yet.",
  [ApiErrorCode.INVALID_MOVE]: 'This move is not valid.',
  [ApiErrorCode.CLUB_FULL]: 'This club is full.',
  [ApiErrorCode.ALREADY_IN_CLUB]: 'You are already a member of this club.',
  [ApiErrorCode.NOT_CLUB_MEMBER]: 'You are not a member of this club.',
  [ApiErrorCode.PERMISSION_DENIED]: 'You do not have permission to perform this action.',
  [ApiErrorCode.PURCHASE_FAILED]: 'Purchase verification failed. Please try again.',
  [ApiErrorCode.SERVER_ERROR]: 'A server error occurred. Please try again later.',
};

/**
 * Retryable error codes
 */
const RETRYABLE_ERRORS = [
  ApiErrorCode.RATE_LIMIT_EXCEEDED,
  ApiErrorCode.SERVER_ERROR,
];

/**
 * HTTP status codes that are retryable
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Transform API error to user-friendly format
 */
export const transformError = (error: any): TransformedError => {
  // Network error (no response)
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      retryable: true,
    };
  }

  const { status, data } = error.response;

  // API error response
  if (data && typeof data === 'object' && 'error' in data) {
    const apiError = data as ApiError;
    const errorCode = apiError.error.code;
    const userMessage = ERROR_MESSAGES[errorCode] || apiError.error.message || 'An error occurred';

    return {
      code: errorCode,
      message: apiError.error.message,
      userMessage,
      details: apiError.error.details,
      retryable: RETRYABLE_ERRORS.includes(errorCode as ApiErrorCode) || RETRYABLE_STATUS_CODES.includes(status),
    };
  }

  // HTTP status code errors
  let userMessage = 'An error occurred';
  let code = `HTTP_${status}`;

  switch (status) {
    case 400:
      userMessage = 'Invalid request. Please check your input.';
      break;
    case 401:
      userMessage = 'Your session has expired. Please log in again.';
      code = ApiErrorCode.UNAUTHORIZED;
      break;
    case 403:
      userMessage = 'You do not have permission to perform this action.';
      code = ApiErrorCode.FORBIDDEN;
      break;
    case 404:
      userMessage = 'The requested resource was not found.';
      code = ApiErrorCode.NOT_FOUND;
      break;
    case 408:
      userMessage = 'Request timeout. Please try again.';
      break;
    case 429:
      userMessage = 'Too many requests. Please wait a moment.';
      code = ApiErrorCode.RATE_LIMIT_EXCEEDED;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      userMessage = 'Server error. Please try again later.';
      code = ApiErrorCode.SERVER_ERROR;
      break;
    default:
      userMessage = `An error occurred (${status})`;
  }

  return {
    code,
    message: data?.message || error.message || `HTTP ${status}`,
    userMessage,
    retryable: RETRYABLE_STATUS_CODES.includes(status),
  };
};

/**
 * Check if error should be retried
 */
export const shouldRetry = (error: any, attempt: number, maxRetries: number): boolean => {
  if (attempt >= maxRetries) {
    return false;
  }

  const transformed = transformError(error);
  return transformed.retryable;
};

/**
 * Get retry delay with exponential backoff
 */
export const getRetryDelay = (attempt: number, baseDelay: number = ENV.RETRY_DELAY): number => {
  return baseDelay * Math.pow(2, attempt);
};

/**
 * Log error (only in development)
 */
export const logError = (error: any, context?: string): void => {
  if (!ENV.ENABLE_LOGGING) {
    return;
  }

  const transformed = transformError(error);
  console.error(`[API Error]${context ? ` [${context}]` : ''}:`, {
    code: transformed.code,
    message: transformed.message,
    userMessage: transformed.userMessage,
    originalError: error,
  });
};


