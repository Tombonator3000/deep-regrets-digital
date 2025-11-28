import { RegretCard as RegretCardType } from '@/types/game';
import { Anchor } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RegretCardProps {
  regret?: RegretCardType;
  faceUp?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-10 h-14',
  md: 'w-16 h-22',
  lg: 'w-24 h-32',
};

// CSS-based card back design inspired by the nautical anchor/tentacle design
const CardBackDesign = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const iconSize = size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12';

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Swirling tentacle/wave pattern background */}
      <div className="absolute inset-0 opacity-30">
        <svg viewBox="0 0 100 140" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="regret-waves" patternUnits="userSpaceOnUse" width="20" height="20">
              <path d="M0 10 Q5 5, 10 10 T20 10" stroke="currentColor" strokeWidth="1" fill="none" className="text-slate-500" />
            </pattern>
          </defs>
          <rect width="100" height="140" fill="url(#regret-waves)" />
          {/* Curved tentacle shapes */}
          <path d="M10 130 Q30 100, 20 70 Q10 40, 30 20" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-600" />
          <path d="M90 130 Q70 100, 80 70 Q90 40, 70 20" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-600" />
          <path d="M30 140 Q50 110, 40 80" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-slate-600" />
          <path d="M70 140 Q50 110, 60 80" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-slate-600" />
        </svg>
      </div>
      {/* Central anchor with heart design */}
      <div className="relative z-10 flex flex-col items-center">
        <Anchor className={`${iconSize} text-slate-400`} />
      </div>
      {/* Border effect */}
      <div className="absolute inset-1 border-2 border-slate-500/30 rounded" />
    </div>
  );
};

// Hook to load the card back image
const useCardBackImage = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Try to dynamically import the image
    import('@/assets/regret-card-back.png')
      .then((module) => {
        setImageSrc(module.default);
      })
      .catch(() => {
        // Image doesn't exist, use CSS fallback
        setImageSrc(null);
      });
  }, []);

  return imageSrc;
};

export const RegretCard = ({
  regret,
  faceUp = false,
  size = 'md',
  className = '',
  onClick
}: RegretCardProps) => {
  const sizeClass = sizeClasses[size];
  const [imageError, setImageError] = useState(false);
  const cardBackImage = useCardBackImage();

  // Show card back (the anchor/heart design)
  if (!faceUp || !regret) {
    return (
      <div
        className={`${sizeClass} rounded-lg overflow-hidden shadow-lg border-2 border-slate-600/50 cursor-pointer hover:scale-105 transition-transform ${className}`}
        onClick={onClick}
      >
        {cardBackImage && !imageError ? (
          <img
            src={cardBackImage}
            alt="Regret card back"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <CardBackDesign size={size} />
        )}
      </div>
    );
  }

  // Show card front (revealed regret)
  return (
    <div
      className={`${sizeClass} rounded-lg overflow-hidden shadow-lg border-2 border-destructive/50 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center p-1 cursor-pointer hover:scale-105 transition-transform ${className}`}
      onClick={onClick}
    >
      <div className="text-destructive text-[8px] font-bold mb-0.5">REGRET</div>
      <div className="text-center text-[6px] text-white/80 leading-tight line-clamp-2 px-0.5">
        {regret.frontText}
      </div>
      <div className="mt-auto text-sm font-bold text-destructive">
        -{regret.value}
      </div>
    </div>
  );
};

interface RegretDeckProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const RegretDeck = ({ count, size = 'md', onClick }: RegretDeckProps) => {
  const sizeClass = sizeClasses[size];
  const [imageError, setImageError] = useState(false);
  const cardBackImage = useCardBackImage();

  const renderCardBack = (opacity: string = '') => {
    if (cardBackImage && !imageError) {
      return (
        <img
          src={cardBackImage}
          alt=""
          className={`w-full h-full object-cover ${opacity}`}
          onError={() => setImageError(true)}
        />
      );
    }
    return (
      <div className={`w-full h-full ${opacity}`}>
        <CardBackDesign size={size} />
      </div>
    );
  };

  if (count === 0) {
    return (
      <div className={`${sizeClass} rounded-lg border-2 border-dashed border-slate-600/30 flex items-center justify-center`}>
        <span className="text-xs text-muted-foreground">Empty</span>
      </div>
    );
  }

  return (
    <div className="relative" onClick={onClick}>
      {/* Stacked cards effect */}
      {count > 2 && (
        <div
          className={`${sizeClass} absolute top-1 left-1 rounded-lg overflow-hidden shadow border-2 border-slate-600/30`}
        >
          {renderCardBack('opacity-60')}
        </div>
      )}
      {count > 1 && (
        <div
          className={`${sizeClass} absolute top-0.5 left-0.5 rounded-lg overflow-hidden shadow border-2 border-slate-600/40`}
        >
          {renderCardBack('opacity-80')}
        </div>
      )}
      {/* Top card */}
      <div
        className={`${sizeClass} relative rounded-lg overflow-hidden shadow-lg border-2 border-slate-600/50 cursor-pointer hover:scale-105 transition-transform`}
      >
        {renderCardBack()}
        {/* Count badge */}
        <div className="absolute bottom-1 right-1 bg-destructive text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
          {count}
        </div>
      </div>
    </div>
  );
};

interface RegretHandProps {
  regrets: RegretCardType[];
  isOwner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onCardClick?: (regret: RegretCardType, index: number) => void;
}

export const RegretHand = ({
  regrets,
  isOwner = false,
  size = 'sm',
  onCardClick
}: RegretHandProps) => {
  if (regrets.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No regrets yet...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {regrets.map((regret, index) => (
        <RegretCard
          key={`${regret.id}-${index}`}
          regret={regret}
          faceUp={isOwner}
          size={size}
          onClick={() => onCardClick?.(regret, index)}
        />
      ))}
    </div>
  );
};
