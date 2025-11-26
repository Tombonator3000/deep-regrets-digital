import { Player, FishCard, DinkCard, UpgradeCard } from '@/types/game';
import { Fish, Sparkles, Package, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer: boolean;
  onCardClick?: (card: FishCard | DinkCard | UpgradeCard, type: 'fish' | 'dink' | 'supply') => void;
}

interface MiniCardProps {
  children: React.ReactNode;
  className?: string;
  tooltip?: React.ReactNode;
  onClick?: () => void;
}

const MiniCard = ({ children, className = '', tooltip, onClick }: MiniCardProps) => {
  const card = (
    <div
      className={`relative flex h-16 w-12 flex-col items-center justify-center rounded-lg border-2 p-1 text-center transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer shadow-lg ${className}`}
      onClick={onClick}
    >
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

const FishMiniCard = ({ fish, onClick }: { fish: FishCard; onClick?: () => void }) => {
  const qualityClass = fish.quality === 'foul'
    ? 'border-purple-500/60 bg-gradient-to-b from-purple-900/80 to-purple-950/90'
    : 'border-cyan-500/60 bg-gradient-to-b from-cyan-900/80 to-cyan-950/90';

  return (
    <MiniCard
      className={qualityClass}
      onClick={onClick}
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
        </div>
      }
    >
      <Fish className="h-4 w-4 text-cyan-300 mb-0.5" />
      <span className="text-[8px] font-medium text-white leading-tight line-clamp-2">
        {fish.name}
      </span>
      <span className="text-[10px] font-bold text-fishbuck mt-0.5">
        ${fish.value}
      </span>
    </MiniCard>
  );
};

const DinkMiniCard = ({ dink, onClick }: { dink: DinkCard; onClick?: () => void }) => {
  return (
    <MiniCard
      className="border-amber-500/60 bg-gradient-to-b from-amber-900/80 to-amber-950/90"
      onClick={onClick}
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

const SupplyMiniCard = ({ supply, onClick }: { supply: UpgradeCard; onClick?: () => void }) => {
  return (
    <MiniCard
      className="border-emerald-500/60 bg-gradient-to-b from-emerald-900/80 to-emerald-950/90"
      onClick={onClick}
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

export const PlayerHand = ({ player, isCurrentPlayer, onCardClick }: PlayerHandProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalCards = player.handFish.length + player.dinks.length + player.supplies.length;

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
                      onClick={() => onCardClick?.(fish, 'fish')}
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
                      onClick={() => onCardClick?.(dink, 'dink')}
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
                      onClick={() => onCardClick?.(supply, 'supply')}
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
