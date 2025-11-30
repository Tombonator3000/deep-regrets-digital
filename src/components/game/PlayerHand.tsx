import { Player, FishCard, DinkCard, UpgradeCard } from '@/types/game';
import { Fish, Sparkles, Package, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useState, useEffect, DragEvent, useCallback } from 'react';
import { getFishImage, getDefaultFishImage } from '@/data/fishImages';

// Hook to load dink card back image
const useDinkCardBack = () => {
  const [cardBackUrl, setCardBackUrl] = useState<string | null>(null);

  useEffect(() => {
    import('@/assets/dink-card-back.png')
      .then((module) => {
        setCardBackUrl(module.default);
      })
      .catch(() => {
        setCardBackUrl(null);
      });
  }, []);

  return cardBackUrl;
};
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useCardModal } from './CardModal';

// Drag data types for different card interactions
export type CardDragType = 'fish' | 'dink' | 'supply';
export interface CardDragData {
  type: CardDragType;
  card: FishCard | DinkCard | UpgradeCard;
  cardIndex: number;
}

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer: boolean;
}

interface MiniCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tooltip?: React.ReactNode;
  onClick?: () => void;
  onEnlarge?: () => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  rotation?: number;
}

const MiniCard = ({
  children,
  className = '',
  style,
  tooltip,
  onClick,
  onEnlarge,
  draggable = false,
  onDragStart,
  onDragEnd,
  rotation = 0,
}: MiniCardProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd?.(e);
  };

  const rotationStyle: React.CSSProperties = rotation !== 0 ? {
    transform: `rotate(${rotation}deg)`,
    ...style,
  } : style || {};

  const card = (
    <div
      className={`group relative flex h-16 w-12 flex-col items-center justify-center rounded-lg border-2 p-1 text-center transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer shadow-lg select-none ${className} ${isDragging ? 'opacity-50 scale-95 rotate-2' : ''}`}
      style={rotationStyle}
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Drag handle indicator */}
      {draggable && (
        <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
          <GripVertical className="h-3 w-3 text-white/60" />
        </div>
      )}
      {/* Enlarge button */}
      {onEnlarge && (
        <button
          className="absolute -top-1 -right-1 z-10 h-4 w-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
          onClick={(e) => {
            e.stopPropagation();
            onEnlarge();
          }}
          title="Vis stort kort"
        >
          <Eye className="h-2.5 w-2.5 text-white" />
        </button>
      )}
      {children}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {card}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return card;
};

interface FishMiniCardProps {
  fish: FishCard;
  index: number;
  onClick?: () => void;
  onEnlarge?: () => void;
  draggable?: boolean;
  rotation?: number;
}

const FishMiniCard = ({ fish, index, onClick, onEnlarge, draggable = false, rotation = 0 }: FishMiniCardProps) => {
  const qualityClass = fish.quality === 'foul'
    ? 'border-purple-500/60 bg-gradient-to-b from-purple-900/80 to-purple-950/90'
    : 'border-cyan-500/60 bg-gradient-to-b from-cyan-900/80 to-cyan-950/90';
  
  const fishImage = getFishImage(fish.id) || getDefaultFishImage(fish.depth);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    const dragData: CardDragData = {
      type: 'fish',
      card: fish,
      cardIndex: index,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', `fish:${fish.id}`);
  };

  return (
    <MiniCard
      className={`${qualityClass} overflow-hidden`}
      onClick={onClick}
      onEnlarge={onEnlarge}
      draggable={draggable}
      onDragStart={handleDragStart}
      rotation={rotation}
      tooltip={
        <div className="space-y-1">
          <div className="font-semibold text-primary">{fish.name}</div>
          <div className="text-xs text-muted-foreground">{fish.description}</div>
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary" className="text-fishbuck">Value: {fish.value}</Badge>
            <Badge variant="outline">Diff: {fish.difficulty}</Badge>
          </div>
          {fish.abilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {fish.abilities.map((ability) => (
                <Badge key={ability} variant="secondary" className="text-xs">
                  {ability}
                </Badge>
              ))}
            </div>
          )}
          <div className="text-xs text-muted-foreground italic mt-1">
            Trykk for å forstørre, dra for å plassere
          </div>
        </div>
      }
    >
      {fishImage ? (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <img src={fishImage} alt={fish.name} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      ) : (
        <Fish className="h-4 w-4 text-cyan-300 mb-0.5" />
      )}
      <span className="text-[8px] font-medium text-white leading-tight line-clamp-2 relative z-10 drop-shadow-md">
        {fish.name}
      </span>
      <span className="text-[10px] font-bold text-fishbuck mt-0.5 relative z-10 drop-shadow-md">
        ${fish.value}
      </span>
    </MiniCard>
  );
};

interface DinkMiniCardProps {
  dink: DinkCard;
  index: number;
  onClick?: () => void;
  onEnlarge?: () => void;
  draggable?: boolean;
  cardBackUrl?: string | null;
  rotation?: number;
}

const DinkMiniCard = ({ dink, index, onClick, onEnlarge, draggable = false, cardBackUrl, rotation = 0 }: DinkMiniCardProps) => {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    const dragData: CardDragData = {
      type: 'dink',
      card: dink,
      cardIndex: index,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', `dink:${dink.id}`);
  };

  const backgroundStyle = cardBackUrl
    ? { backgroundImage: `url(${cardBackUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <MiniCard
      className={`border-amber-500/60 ${!cardBackUrl ? 'bg-gradient-to-b from-amber-900/80 to-amber-950/90' : ''}`}
      style={backgroundStyle}
      onClick={onClick}
      onEnlarge={onEnlarge}
      draggable={draggable}
      onDragStart={handleDragStart}
      rotation={rotation}
      tooltip={
        <div className="space-y-1">
          <div className="font-semibold text-amber-400">{dink.name}</div>
          <div className="text-xs text-muted-foreground">{dink.description}</div>
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary">{dink.oneShot ? 'One-Shot' : 'Reusable'}</Badge>
            {dink.timing.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground italic mt-1">
            Trykk for å forstørre, dra for å plassere
          </div>
        </div>
      }
    >
      <Sparkles className="h-4 w-4 text-amber-300 mb-0.5" />
      <span className="text-[8px] font-medium text-white leading-tight line-clamp-2">
        {dink.name}
      </span>
      {dink.oneShot && (
        <span className="text-[8px] text-amber-400 mt-0.5">1x</span>
      )}
    </MiniCard>
  );
};

interface SupplyMiniCardProps {
  supply: UpgradeCard;
  index: number;
  onClick?: () => void;
  onEnlarge?: () => void;
  draggable?: boolean;
  rotation?: number;
}

const SupplyMiniCard = ({ supply, index, onClick, onEnlarge, draggable = false, rotation = 0 }: SupplyMiniCardProps) => {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    const dragData: CardDragData = {
      type: 'supply',
      card: supply,
      cardIndex: index,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', `supply:${supply.id}`);
  };

  return (
    <MiniCard
      className="border-emerald-500/60 bg-gradient-to-b from-emerald-900/80 to-emerald-950/90"
      onClick={onClick}
      onEnlarge={onEnlarge}
      draggable={draggable}
      onDragStart={handleDragStart}
      rotation={rotation}
      tooltip={
        <div className="space-y-1">
          <div className="font-semibold text-emerald-400">{supply.name}</div>
          <div className="text-xs text-muted-foreground">{supply.description}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {supply.effects.map((effect) => (
              <Badge key={effect} variant="secondary" className="text-xs">
                {effect}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground italic mt-1">
            Trykk for å forstørre, dra for å plassere
          </div>
        </div>
      }
    >
      <Package className="h-4 w-4 text-emerald-300 mb-0.5" />
      <span className="text-[8px] font-medium text-white leading-tight line-clamp-2">
        {supply.name}
      </span>
    </MiniCard>
  );
};

export const PlayerHand = ({ player, isCurrentPlayer }: PlayerHandProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalCards = player.handFish.length + player.dinks.length + player.supplies.length;
  const { openCard } = useCardModal();
  const dinkCardBackUrl = useDinkCardBack();

  const handleEnlargeFish = useCallback((fish: FishCard) => {
    openCard(fish, 'fish');
  }, [openCard]);

  const handleEnlargeDink = useCallback((dink: DinkCard) => {
    openCard(dink, 'dink');
  }, [openCard]);

  const handleEnlargeSupply = useCallback((supply: UpgradeCard) => {
    openCard(supply, 'supply');
  }, [openCard]);

  if (totalCards === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Fish className="h-3 w-3" />
          <span>No cards in hand</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Fish className="h-3 w-3" />
            <span>Hand ({totalCards})</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {/* Fish Cards */}
            {player.handFish.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-cyan-400">
                  <Fish className="h-2.5 w-2.5" />
                  <span>Fish ({player.handFish.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {player.handFish.map((fish, index) => (
                    <FishMiniCard
                      key={`${fish.id}-${index}`}
                      fish={fish}
                      index={index}
                      draggable={isCurrentPlayer}
                      onClick={() => handleEnlargeFish(fish)}
                      onEnlarge={() => handleEnlargeFish(fish)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dink Cards */}
            {player.dinks.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Trinkets ({player.dinks.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {player.dinks.map((dink, index) => (
                    <DinkMiniCard
                      key={`${dink.id}-${index}`}
                      dink={dink}
                      index={index}
                      draggable={isCurrentPlayer}
                      onClick={() => handleEnlargeDink(dink)}
                      onEnlarge={() => handleEnlargeDink(dink)}
                      cardBackUrl={dinkCardBackUrl}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Supply Cards */}
            {player.supplies.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-emerald-400">
                  <Package className="h-2.5 w-2.5" />
                  <span>Supplies ({player.supplies.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {player.supplies.map((supply, index) => (
                    <SupplyMiniCard
                      key={`${supply.id}-${index}`}
                      supply={supply}
                      index={index}
                      draggable={isCurrentPlayer}
                      onClick={() => handleEnlargeSupply(supply)}
                      onEnlarge={() => handleEnlargeSupply(supply)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
