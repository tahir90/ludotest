import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gift } from '$types';
import { GiftAnimationOverlay } from './GiftAnimationOverlay';
import { GiftNotificationBar } from './GiftNotificationBar';
import { getGiftAnimationConfig } from '$constants/giftAnimations';

export interface QueuedGiftAnimation {
  id: string;
  gift: Gift;
  sender: { username: string; avatar: string };
  receiver: { username: string; avatar: string };
  quantity: number;
  timestamp: number;
}

interface GiftAnimationQueueProps {
  queue: QueuedGiftAnimation[];
  onAnimationComplete: (id: string) => void;
  maxQueueSize?: number;
}

export const GiftAnimationQueue: React.FC<GiftAnimationQueueProps> = ({
  queue,
  onAnimationComplete,
  maxQueueSize = 5,
}) => {
  const [currentOverlay, setCurrentOverlay] = useState<QueuedGiftAnimation | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<QueuedGiftAnimation[]>([]);
  const [currentNotification, setCurrentNotification] = useState<QueuedGiftAnimation | null>(null);

  // Process overlay queue (one at a time)
  useEffect(() => {
    if (!currentOverlay && queue.length > 0) {
      const next = queue[0];
      setCurrentOverlay(next);
    }
  }, [currentOverlay, queue]);

  // Process notification queue
  useEffect(() => {
    // Add all items from main queue to notification queue
    const newNotifications = queue.filter(
      item => !notificationQueue.find(n => n.id === item.id)
    );
    
    if (newNotifications.length > 0) {
      setNotificationQueue(prev => [...prev, ...newNotifications].slice(0, maxQueueSize));
    }
  }, [queue, maxQueueSize]);

  // Process next notification
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const next = notificationQueue[0];
      setCurrentNotification(next);
    }
  }, [currentNotification, notificationQueue]);

  const handleOverlayComplete = useCallback((id: string) => {
    setCurrentOverlay(null);
    onAnimationComplete(id);
  }, [onAnimationComplete]);

  const handleNotificationComplete = useCallback((id: string) => {
    setCurrentNotification(null);
    setNotificationQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Full-screen gift animation overlay */}
      {currentOverlay && (
        <GiftAnimationOverlay
          key={currentOverlay.id} // Key ensures component remounts for each new gift
          gift={currentOverlay.gift}
          sender={currentOverlay.sender}
          receiver={currentOverlay.receiver}
          quantity={currentOverlay.quantity}
          onComplete={() => handleOverlayComplete(currentOverlay.id)}
        />
      )}

      {/* Notification bar */}
      {currentNotification && (
        <GiftNotificationBar
          gift={currentNotification.gift}
          sender={currentNotification.sender}
          quantity={currentNotification.quantity}
          onComplete={() => handleNotificationComplete(currentNotification.id)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9997,
    pointerEvents: 'none',
  },
});

