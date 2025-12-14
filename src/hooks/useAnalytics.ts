import { useCallback } from 'react';
import { analyticsManager } from '$services/analytics/AnalyticsManager';

/**
 * useAnalytics Hook
 * Provides analytics tracking methods
 */
export const useAnalytics = () => {
  const trackEvent = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    await analyticsManager.trackEvent(eventName, properties);
  }, []);

  const trackScreenView = useCallback(async (screenName: string, properties?: Record<string, any>) => {
    await analyticsManager.trackScreenView(screenName, properties);
  }, []);

  return {
    trackEvent,
    trackScreenView,
  };
};


