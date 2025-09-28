import { CSSProperties, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface BubbleFieldProps {
  /** Total number of bubbles to render. */
  bubbleCount?: number;
  /** Additional classes for the container wrapper. */
  className?: string;
}

interface BubbleDefinition {
  id: string;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

export const BubbleField = ({ bubbleCount = 48, className }: BubbleFieldProps) => {
  const bubbles = useMemo<BubbleDefinition[]>(
    () =>
      Array.from({ length: bubbleCount }).map((_, index) => {
        const size = 12 + Math.random() * 28;
        return {
          id: `bubble-${index}`,
          left: Math.random() * 100,
          size,
          delay: Math.random() * 6,
          duration: 6 + Math.random() * 8,
          drift: (Math.random() - 0.5) * 120,
        };
      }),
    [bubbleCount],
  );

  return (
    <div className={cn('bubble-field', className)} aria-hidden>
      {bubbles.map((bubble) => {
        const style: CSSProperties & { ['--bubble-drift']?: string } = {
          left: `${bubble.left}%`,
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          animationDelay: `${bubble.delay}s`,
          animationDuration: `${bubble.duration}s`,
          ['--bubble-drift']: `${bubble.drift}px`,
        };

        return <span key={bubble.id} className="bubble" style={style} />;
      })}
    </div>
  );
};
