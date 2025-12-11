import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Gift } from '$types';
import { GiftAnimationQueue, QueuedGiftAnimation } from './GiftAnimationQueue';

interface GiftAnimationContextValue {
  triggerGiftAnimation: (
    gift: Gift,
    sender: { username: string; avatar: string },
    receiver: { username: string; avatar: string },
    quantity?: number
  ) => void;
  clearQueue: () => void;
  queueLength: number;
}

const GiftAnimationContext = createContext<GiftAnimationContextValue | undefined>(undefined);

interface GiftAnimationProviderProps {
  children: React.ReactNode;
  maxQueueSize?: number;
}

export const GiftAnimationProvider: React.FC<GiftAnimationProviderProps> = ({
  children,
  maxQueueSize = 5,
}) => {
  const [queue, setQueue] = useState<QueuedGiftAnimation[]>([]);
  const idCounter = useRef(0);

  const triggerGiftAnimation = useCallback((
    gift: Gift,
    sender: { username: string; avatar: string },
    receiver: { username: string; avatar: string },
    quantity: number = 1
  ) => {
    const newAnimation: QueuedGiftAnimation = {
      id: `gift_anim_${Date.now()}_${idCounter.current++}`,
      gift,
      sender,
      receiver,
      quantity,
      timestamp: Date.now(),
    };

    setQueue(prev => {
      // Limit queue size
      const updated = [...prev, newAnimation];
      return updated.slice(-maxQueueSize);
    });
  }, [maxQueueSize]);

  const handleAnimationComplete = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const value: GiftAnimationContextValue = {
    triggerGiftAnimation,
    clearQueue,
    queueLength: queue.length,
  };

  return (
    <GiftAnimationContext.Provider value={value}>
      {children}
      <GiftAnimationQueue
        queue={queue}
        onAnimationComplete={handleAnimationComplete}
        maxQueueSize={maxQueueSize}
      />
    </GiftAnimationContext.Provider>
  );
};

export const useGiftAnimation = (): GiftAnimationContextValue => {
  const context = useContext(GiftAnimationContext);
  if (!context) {
    throw new Error('useGiftAnimation must be used within GiftAnimationProvider');
  }
  return context;
};

