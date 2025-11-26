import { GameState } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, Fish, Skull, Eye, Waves } from 'lucide-react';
import brinyDeepHeader from '@/assets/briny-deep-header.png';

interface SeaBoardProps {
  gameState: GameState;
  selectedShoal: {depth: number, shoal: number} | null;
  onShoalSelect: (shoal: {depth: number, shoal: number}) => void;
  onInspectShoal?: (shoal: {depth: number, shoal: number}) => void;
  onAction: (action: any) => void;
}

const DEPTH_INFO = {
  1: { label: 'Shallow Waters', color: 'from-cyan-600/30 to-cyan-800/40', border: 'border-cyan-500/40', icon: '🌊' },
  2: { label: 'The Murky Deep', color: 'from-blue-700/40 to-blue-900/50', border: 'border-blue-500/40', icon: '🌀' },
  3: { label: 'The Abyss', color: 'from-purple-800/50 to-slate-950/60', border: 'border-purple-500/40', icon: '👁️' }
};

export const SeaBoard = ({ gameState, selectedShoal, onShoalSelect, onInspectShoal, onAction }: SeaBoardProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleDescend = (targetDepth: number) => {
    onAction({
      type: 'DESCEND',
      playerId: currentPlayer.id,
      payload: { targetDepth }
    });
  };

  return (
    <div className="briny-deep-board flex h-full min-h-0 flex-col gap-4">
      {/* Board Header - The Briny Deep with artwork and gradient */}
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-slate-950/60">
        <img
          src={brinyDeepHeader}
          alt="The Briny Deep"
          className="h-48 w-full object-cover object-top sm:h-56"
        />
        {/* Dark gradient overlay fading downward for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/90" />
        {/* Status info overlaid on gradient */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-4">
          <div className="text-sm text-slate-200/90">
            Current Depth: <span className="font-semibold text-primary">{currentPlayer.currentDepth}</span>
            {currentPlayer.location === 'port' && ' (In Port)'}
          </div>
          {gameState.sea.plugActive && (
            <Badge className="bg-destructive/20 text-destructive animate-pulse">
              <Skull className="mr-1 h-3 w-3" />
              The Plug is Active!
            </Badge>
          )}
        </div>
      </div>

      {/* Depth Navigation - Like descending into the sea */}
      {currentPlayer.location === 'sea' && (
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((depth) => {
            const isCurrentDepth = currentPlayer.currentDepth === depth;
            const canDescend = depth > currentPlayer.currentDepth && !currentPlayer.hasPassed;
            const isPastDepth = depth < currentPlayer.currentDepth;
            const stepsNeeded = depth - currentPlayer.currentDepth;

            return (
              <Button
                key={depth}
                variant="outline"
                onClick={() => canDescend && handleDescend(depth)}
                disabled={isPastDepth || currentPlayer.hasPassed || isCurrentDepth}
                className={`relative flex-1 max-w-[140px] h-12 ${
                  isCurrentDepth
                    ? 'btn-ocean ring-2 ring-primary/50'
                    : canDescend
                      ? 'border-primary/50 hover:border-primary hover:bg-primary/10'
                      : 'opacity-40'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold">Depth {depth}</span>
                  {canDescend && (
                    <span className="flex items-center gap-1 text-xs opacity-80">
                      <ArrowDown className="h-3 w-3" />
                      {stepsNeeded} die{stepsNeeded > 1 ? 's' : ''} (val ≥3)
                    </span>
                  )}
                </div>
                {isCurrentDepth && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Button>
            );
          })}
        </div>
      )}

      {/* The Deep Sea Board - Organized by Depth Rows like physical board */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="relative mx-auto w-full max-w-4xl rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-slate-900/50 to-slate-950/80 p-4 shadow-2xl">
          {/* Depth Rows - Like the physical board's 3 depth sections */}
          <div className="space-y-4">
            {[1, 2, 3].map((depth) => {
              const depthInfo = DEPTH_INFO[depth as 1 | 2 | 3];
              const shoals = gameState.sea.shoals[depth] ?? [];
              const isAccessible = currentPlayer.currentDepth >= depth && currentPlayer.location === 'sea';
              const isCurrentDepth = currentPlayer.currentDepth === depth;

              return (
                <div
                  key={depth}
                  className={`depth-row rounded-xl border-2 ${depthInfo.border} bg-gradient-to-r ${depthInfo.color} p-4 transition-all ${
                    isCurrentDepth ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-slate-950' : ''
                  } ${!isAccessible ? 'opacity-50' : ''}`}
                >
                  {/* Depth Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{depthInfo.icon}</span>
                      <Badge className="bg-black/40 text-white">
                        Depth {depth}
                      </Badge>
                      <span className="text-sm font-medium text-white/80">{depthInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Fish className="h-3 w-3" />
                      {shoals.reduce((acc, s) => acc + s.length, 0)} fish remaining
                    </div>
                  </div>

                  {/* Shoals Row - 3 shoals per depth */}
                  <div className="grid grid-cols-3 gap-3">
                    {shoals.map((shoal, shoalIndex) => {
                      const isSelected = selectedShoal?.depth === depth && selectedShoal?.shoal === shoalIndex;
                      const topFish = shoal[0];
                      const shoalEmpty = shoal.length === 0;
                      const canInteract = isAccessible && !currentPlayer.hasPassed;

                      return (
                        <Card
                          key={`${depth}-${shoalIndex}`}
                          role={canInteract && !shoalEmpty ? 'button' : undefined}
                          tabIndex={canInteract && !shoalEmpty ? 0 : -1}
                          aria-label={
                            shoalEmpty
                              ? `Shoal ${shoalIndex + 1} at depth ${depth} is empty`
                              : `${topFish?.name ?? 'Unknown fish'} in shoal ${shoalIndex + 1} at depth ${depth}. Difficulty ${topFish?.difficulty ?? 'unknown'}, value ${topFish?.value ?? 'unknown'}`
                          }
                          onClick={() => canInteract && !shoalEmpty && onShoalSelect({ depth, shoal: shoalIndex })}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && canInteract && !shoalEmpty) {
                              onShoalSelect({ depth, shoal: shoalIndex });
                            }
                          }}
                          className={`shoal-card relative overflow-hidden rounded-lg border-2 bg-slate-950/70 p-3 text-white shadow-lg backdrop-blur transition-all ${
                            isSelected ? 'border-primary ring-2 ring-primary/70' : 'border-transparent'
                          } ${
                            shoalEmpty ? 'opacity-40' : ''
                          } ${
                            canInteract && !shoalEmpty ? 'cursor-pointer hover:border-primary/70 hover:bg-slate-950/90 hover:scale-[1.02]' : 'cursor-not-allowed'
                          }`}
                        >
                          {/* Shoal Header */}
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="rounded bg-black/30 px-2 py-0.5 font-medium text-white/70">
                              Shoal {shoalIndex + 1}
                            </span>
                            <span className="text-white/50">{shoal.length} fish</span>
                          </div>

                          {shoalEmpty ? (
                            <div className="flex h-20 items-center justify-center text-center">
                              <div className="text-white/40">
                                <Waves className="mx-auto mb-1 h-6 w-6 opacity-50" />
                                <span className="text-xs">Empty Waters</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Fish Name */}
                              <div className="font-semibold text-white leading-tight">
                                {topFish?.name ?? 'Unknown Catch'}
                              </div>

                              {/* Stats Badges */}
                              <div className="flex flex-wrap gap-1">
                                <Badge className="bg-fishbuck/90 text-slate-900 text-xs px-2 py-0">
                                  ${topFish?.value ?? '?'}
                                </Badge>
                                <Badge className="bg-destructive/90 text-white text-xs px-2 py-0">
                                  {topFish?.difficulty ?? '?'}
                                </Badge>
                                {topFish?.quality === 'foul' && (
                                  <Badge className="bg-purple-600/90 text-white text-xs px-2 py-0">
                                    Foul
                                  </Badge>
                                )}
                              </div>

                              {/* Inspect Button */}
                              <Button
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onShoalSelect({ depth, shoal: shoalIndex });
                                  onInspectShoal?.({ depth, shoal: shoalIndex });
                                }}
                                disabled={!canInteract || shoalEmpty}
                                className={`w-full text-xs h-7 ${
                                  canInteract && !shoalEmpty ? 'btn-ocean' : 'bg-white/10 text-white/50'
                                }`}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Inspect
                              </Button>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Graveyards - Bottom section like physical board */}
      <div className="shrink-0 rounded-xl border-2 border-destructive/20 bg-gradient-to-r from-slate-950/80 to-destructive/10 p-3 shadow-lg">
        <div className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-wide text-destructive/80">
          <Skull className="h-3 w-3" />
          <span>The Graveyards</span>
          <Skull className="h-3 w-3" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((depth) => {
            const depthInfo = DEPTH_INFO[depth as 1 | 2 | 3];
            const graveyardCount = gameState.sea.graveyards[depth]?.length || 0;

            return (
              <div
                key={`graveyard-${depth}`}
                className={`rounded-lg border ${depthInfo.border} bg-black/40 p-3 text-center`}
              >
                <div className="text-xs text-white/60">Depth {depth}</div>
                <div className="text-xl font-bold text-destructive/80">{graveyardCount}</div>
                <div className="text-xs text-white/40">lost to the deep</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
