import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fish, Eye, EyeOff, AlertTriangle, Skull, Waves } from 'lucide-react';

interface ShoalIndicatorProps {
  depth: number;
  shoalIndex: number;
  totalFish: number;
  revealedFish: number;
  hiddenFish: number;
  isSelected?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  topFishRevealed?: boolean;
  topFishInfo?: {
    name: string;
    type: 'fair' | 'foul';
    value: number;
    difficulty: number;
  } | null;
}

export const ShoalIndicator = ({
  depth,
  shoalIndex,
  totalFish,
  revealedFish,
  hiddenFish,
  isSelected = false,
  isClickable = true,
  onClick,
  topFishRevealed = false,
  topFishInfo,
}: ShoalIndicatorProps) => {
  const isEmpty = totalFish === 0;
  const isLastFish = totalFish === 1;
  const isAlmostEmpty = totalFish === 2;

  // Determine depth color
  const getDepthColor = (d: number) => {
    switch (d) {
      case 1: return 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/40';
      case 2: return 'from-blue-500/20 to-blue-600/10 border-blue-500/40';
      case 3: return 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/40';
      case 4: return 'from-purple-500/20 to-purple-600/10 border-purple-500/40';
      case 5: return 'from-violet-500/20 to-violet-600/10 border-violet-500/40';
      default: return 'from-slate-500/20 to-slate-600/10 border-slate-500/40';
    }
  };

  const getDepthTextColor = (d: number) => {
    switch (d) {
      case 1: return 'text-cyan-400';
      case 2: return 'text-blue-400';
      case 3: return 'text-indigo-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-violet-400';
      default: return 'text-slate-400';
    }
  };

  if (isEmpty) {
    return (
      <Card
        className={`
          p-3 transition-all opacity-50
          bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30
          ${isClickable ? 'cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Waves className="h-5 w-5" />
          <span className="text-sm">Tom shoal</span>
        </div>
        <div className="text-center mt-1">
          <span className="text-xs text-slate-600">Alle fisk er fanget</span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={isClickable && !isEmpty ? onClick : undefined}
      className={`
        p-3 transition-all
        bg-gradient-to-br ${getDepthColor(depth)}
        ${isSelected ? 'ring-2 ring-primary scale-[1.02]' : ''}
        ${isClickable && !isEmpty ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${isLastFish ? 'border-red-500/50' : ''}
      `}
    >
      {/* Header with depth and shoal info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${getDepthTextColor(depth)} border-current`}>
            Dybde {depth}
          </Badge>
          <span className="text-xs text-muted-foreground">Shoal {shoalIndex + 1}</span>
        </div>
        {isSelected && (
          <Badge className="bg-primary text-xs">Valgt</Badge>
        )}
      </div>

      {/* Fish count visualization */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <Fish className={`h-4 w-4 ${getDepthTextColor(depth)}`} />
            <span className="text-sm font-medium">{totalFish} fisk</span>
          </div>

          {/* Fish indicator dots */}
          <div className="flex gap-0.5 flex-wrap">
            {Array.from({ length: revealedFish }).map((_, i) => (
              <div
                key={`revealed-${i}`}
                className="w-2 h-2 rounded-full bg-primary"
                title="Avslørt fisk"
              />
            ))}
            {Array.from({ length: hiddenFish }).map((_, i) => (
              <div
                key={`hidden-${i}`}
                className="w-2 h-2 rounded-full bg-slate-600"
                title="Skjult fisk"
              />
            ))}
          </div>
        </div>

        {/* Visibility indicator */}
        <div className="flex flex-col items-center gap-1">
          {topFishRevealed ? (
            <Eye className="h-4 w-4 text-primary" />
          ) : (
            <EyeOff className="h-4 w-4 text-slate-500" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {topFishRevealed ? 'Avslørt' : 'Skjult'}
          </span>
        </div>
      </div>

      {/* Top fish preview if revealed */}
      {topFishRevealed && topFishInfo && (
        <div className={`
          p-2 rounded text-xs
          ${topFishInfo.type === 'fair'
            ? 'bg-green-900/30 border border-green-500/30'
            : 'bg-red-900/30 border border-red-500/30'
          }
        `}>
          <div className="flex items-center justify-between">
            <span className={topFishInfo.type === 'fair' ? 'text-green-400' : 'text-red-400'}>
              {topFishInfo.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-fishbuck">${topFishInfo.value}</span>
              <Badge variant="outline" className="text-[10px]">
                Diff {topFishInfo.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {isLastFish && (
        <div className="mt-2 flex items-center gap-1 p-1.5 rounded bg-red-900/30 border border-red-500/40">
          <Skull className="h-3 w-3 text-red-400" />
          <span className="text-[10px] text-red-400">
            Siste fisk! +1 Regret ved fangst
          </span>
        </div>
      )}

      {isAlmostEmpty && !isLastFish && (
        <div className="mt-2 flex items-center gap-1 p-1.5 rounded bg-yellow-900/30 border border-yellow-500/40">
          <AlertTriangle className="h-3 w-3 text-yellow-400" />
          <span className="text-[10px] text-yellow-400">
            Kun 2 fisk igjen
          </span>
        </div>
      )}
    </Card>
  );
};

// Summary component for showing all shoals at a glance
interface ShoalSummaryProps {
  shoals: Array<{
    depth: number;
    shoalIndex: number;
    totalFish: number;
    revealedFish: number;
    hiddenFish: number;
  }>;
}

export const ShoalSummary = ({ shoals }: ShoalSummaryProps) => {
  const totalFish = shoals.reduce((sum, s) => sum + s.totalFish, 0);
  const emptyShoals = shoals.filter(s => s.totalFish === 0).length;
  const dangerousShoals = shoals.filter(s => s.totalFish === 1).length;

  return (
    <Card className="p-2 bg-slate-800/50 border-slate-600/40">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Fish className="h-3 w-3 text-primary" />
            <span>{totalFish} fisk totalt</span>
          </div>
          {emptyShoals > 0 && (
            <div className="flex items-center gap-1 text-slate-400">
              <Waves className="h-3 w-3" />
              <span>{emptyShoals} tomme</span>
            </div>
          )}
          {dangerousShoals > 0 && (
            <div className="flex items-center gap-1 text-red-400">
              <Skull className="h-3 w-3" />
              <span>{dangerousShoals} med siste fisk</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
