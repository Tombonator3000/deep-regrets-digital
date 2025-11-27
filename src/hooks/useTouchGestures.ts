import { useCallback, useRef, useState } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

interface SwipeConfig {
  threshold?: number;
  timeout?: number;
}

interface UseTouchGesturesOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  config?: SwipeConfig;
}

export const useTouchGestures = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  config = {},
}: UseTouchGesturesOptions) => {
  const { threshold = 50, timeout = 300 } = config;
  const touchState = useRef<TouchState | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setIsSwiping(true);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check for tap (small movement, quick touch)
    if (absDeltaX < 10 && absDeltaY < 10 && deltaTime < 200) {
      onTap?.();
      touchState.current = null;
      setIsSwiping(false);
      return;
    }

    // Check for swipe (within timeout)
    if (deltaTime <= timeout) {
      // Vertical swipes take priority for depth navigation
      if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        if (deltaY < 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
      // Horizontal swipes
      else if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        if (deltaX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    }

    touchState.current = null;
    setIsSwiping(false);
  }, [threshold, timeout, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onTap]);

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return { touchHandlers, isSwiping };
};
