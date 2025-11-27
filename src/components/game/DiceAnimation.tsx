import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useGameSfx } from '@/hooks/useGameSfx';

interface DiceAnimationProps {
  rolling: boolean;
  finalValue?: number;
  onRollComplete?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'fishbuck' | 'danger' | 'madness';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-xl',
  lg: 'w-20 h-20 text-3xl',
};

const colorClasses = {
  primary: 'from-primary/80 to-primary border-primary/50',
  fishbuck: 'from-fishbuck/80 to-fishbuck border-fishbuck/50',
  danger: 'from-destructive/80 to-destructive border-destructive/50',
  madness: 'from-purple-600/80 to-purple-800 border-purple-500/50',
};

export const DiceAnimation = ({
  rolling,
  finalValue,
  onRollComplete,
  size = 'md',
  color = 'primary',
  className,
}: DiceAnimationProps) => {
  const [displayValue, setDisplayValue] = useState(finalValue || 1);
  const [isAnimating, setIsAnimating] = useState(false);
  const { playDiceRoll } = useGameSfx();

  const animateRoll = useCallback(() => {
    if (!rolling) return;

    setIsAnimating(true);
    playDiceRoll();

    // Animate through random values
    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      frame++;
      setDisplayValue(Math.floor(Math.random() * 6) + 1);

      if (frame >= totalFrames) {
        clearInterval(interval);
        const result = finalValue || Math.floor(Math.random() * 6) + 1;
        setDisplayValue(result);
        setIsAnimating(false);
        onRollComplete?.(result);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [rolling, finalValue, onRollComplete, playDiceRoll]);

  useEffect(() => {
    if (rolling) {
      animateRoll();
    }
  }, [rolling, animateRoll]);

  useEffect(() => {
    if (!rolling && finalValue !== undefined) {
      setDisplayValue(finalValue);
    }
  }, [rolling, finalValue]);

  // Render dice pips
  const renderPips = (value: number) => {
    const pipClass = 'absolute w-[18%] h-[18%] rounded-full bg-slate-900';
    const positions: Record<number, string[]> = {
      1: ['left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'],
      2: ['left-[25%] top-[25%]', 'right-[25%] bottom-[25%]'],
      3: ['left-[25%] top-[25%]', 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', 'right-[25%] bottom-[25%]'],
      4: ['left-[25%] top-[25%]', 'right-[25%] top-[25%]', 'left-[25%] bottom-[25%]', 'right-[25%] bottom-[25%]'],
      5: ['left-[25%] top-[25%]', 'right-[25%] top-[25%]', 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', 'left-[25%] bottom-[25%]', 'right-[25%] bottom-[25%]'],
      6: ['left-[25%] top-[25%]', 'right-[25%] top-[25%]', 'left-[25%] top-1/2 -translate-y-1/2', 'right-[25%] top-1/2 -translate-y-1/2', 'left-[25%] bottom-[25%]', 'right-[25%] bottom-[25%]'],
    };

    return positions[value]?.map((pos, i) => (
      <span key={i} className={cn(pipClass, pos)} />
    ));
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 shadow-lg font-bold flex items-center justify-center',
        'bg-gradient-to-br',
        sizeClasses[size],
        colorClasses[color],
        isAnimating && 'animate-[dice-roll_0.1s_ease-in-out_infinite]',
        className
      )}
    >
      {/* Dice face with pips */}
      <div className="relative w-full h-full">
        {renderPips(displayValue)}
      </div>

      {/* Glow effect when rolling */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-lg bg-white/20 animate-pulse" />
      )}
    </div>
  );
};

// Multiple dice roll animation
interface MultiDiceRollProps {
  diceCount: number;
  rolling: boolean;
  finalValues?: number[];
  onRollComplete?: (values: number[]) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MultiDiceRoll = ({
  diceCount,
  rolling,
  finalValues = [],
  onRollComplete,
  size = 'md',
  className,
}: MultiDiceRollProps) => {
  const [results, setResults] = useState<number[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (rolling) {
      setResults([]);
      setCompletedCount(0);
    }
  }, [rolling]);

  const handleSingleComplete = (value: number, index: number) => {
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = value;
      return newResults;
    });
    setCompletedCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (completedCount === diceCount && completedCount > 0) {
      onRollComplete?.(results);
    }
  }, [completedCount, diceCount, results, onRollComplete]);

  return (
    <div className={cn('flex gap-2 flex-wrap justify-center', className)}>
      {Array.from({ length: diceCount }).map((_, i) => (
        <DiceAnimation
          key={i}
          rolling={rolling}
          finalValue={finalValues[i]}
          onRollComplete={(value) => handleSingleComplete(value, i)}
          size={size}
          // Stagger the animations slightly
          className={rolling ? `animation-delay-${i * 50}` : ''}
        />
      ))}
    </div>
  );
};

// Animated dice tray - shows fresh and spent dice
interface DiceTrayProps {
  freshDice: number[];
  spentDice: number[];
  onSelectDie?: (index: number, value: number) => void;
  selectedIndices?: number[];
  className?: string;
}

export const DiceTray = ({
  freshDice,
  spentDice,
  onSelectDie,
  selectedIndices = [],
  className,
}: DiceTrayProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Fresh dice */}
      <div>
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
          Fresh Dice
        </div>
        <div className="flex gap-2 flex-wrap">
          {freshDice.length > 0 ? (
            freshDice.map((value, index) => (
              <button
                key={`fresh-${index}`}
                onClick={() => onSelectDie?.(index, value)}
                className={cn(
                  'relative w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all',
                  'bg-gradient-to-br from-primary/20 to-primary/40',
                  'hover:scale-110 hover:shadow-lg',
                  selectedIndices.includes(index)
                    ? 'border-primary ring-2 ring-primary/50 scale-105'
                    : 'border-primary/30'
                )}
              >
                {value}
                {selectedIndices.includes(index) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    ✓
                  </span>
                )}
              </button>
            ))
          ) : (
            <span className="text-muted-foreground text-sm italic">No fresh dice</span>
          )}
        </div>
      </div>

      {/* Spent dice */}
      <div>
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
          Spent Dice
        </div>
        <div className="flex gap-2 flex-wrap">
          {spentDice.length > 0 ? (
            spentDice.map((value, index) => (
              <div
                key={`spent-${index}`}
                className="w-10 h-10 rounded-lg border-2 border-white/10 bg-white/5 font-bold text-sm flex items-center justify-center opacity-50"
              >
                {value}
              </div>
            ))
          ) : (
            <span className="text-muted-foreground text-sm italic">No spent dice</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Rolling dice button with animation
interface RollDiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
  diceCount?: number;
  label?: string;
  className?: string;
}

export const RollDiceButton = ({
  onClick,
  disabled = false,
  diceCount = 1,
  label = 'Roll',
  className,
}: RollDiceButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all',
        'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
        'hover:shadow-lg hover:scale-105',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
    >
      {/* Dice icons */}
      <div className="flex gap-1">
        {Array.from({ length: Math.min(diceCount, 3) }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-5 h-5 rounded border border-white/50 flex items-center justify-center text-[10px]',
              isHovered && !disabled && 'animate-[dice-roll_0.2s_ease-in-out_infinite]'
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {Math.floor(Math.random() * 6) + 1}
          </div>
        ))}
      </div>
      <span>{label}</span>
      {diceCount > 3 && <span className="text-xs opacity-70">+{diceCount - 3}</span>}
    </button>
  );
};
