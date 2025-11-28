import { GameState } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Fish, Skull, Eye, Waves } from 'lucide-react';
import brinyDeepHeader from '@/assets/briny-deep-header.png';
import { PlugMarker, DepthMarker, LighthouseToken } from './GameTokens';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleDescend = (targetDepth: number) => {
    if (targetDepth > currentPlayer.currentDepth && targetDepth <= 3 && !currentPlayer.hasPassed) {
      onAction({
        type: 'DESCEND',
        playerId: currentPlayer.id,
        payload: { targetDepth }
      });
      toast({
        title: "Descending",
        description: `Swipe down to depth ${targetDepth}`,
      });
    }
  };

  const handleAscend = (targetDepth: number) => {
    if (targetDepth < currentPlayer.currentDepth && targetDepth >= 1 && !currentPlayer.hasPassed) {
      onAction({
        type: 'DESCEND',
        playerId: currentPlayer.id,
        payload: { targetDepth }
      });
      toast({
        title: "Ascending",
        description: `Swipe up to depth ${targetDepth}`,
      });
    }
  };

  // Touch gestures for depth navigation
  const { touchHandlers, isSwiping } = useTouchGestures({
    onSwipeUp: () => {
      if (currentPlayer.location === 'sea' && currentPlayer.currentDepth > 1) {
        handleAscend(currentPlayer.currentDepth - 1);
      }
    },
    onSwipeDown: () => {
      if (currentPlayer.location === 'sea' && currentPlayer.currentDepth < 3) {
        handleDescend(currentPlayer.currentDepth + 1);
      }
    },
    config: { threshold: 60 },
  });

  return (
    <div className="briny-deep-board flex h-full min-h-0 flex-col gap-1 overflow-hidden">
      {/* Compact Header */}
      <div className="flex shrink-0 items-center justify-between rounded-lg border border-border/40 bg-slate-950/60 px-2 py-1">
        <div className="flex items-center gap-2 text-xs">
          <Waves className="h-4 w-4 text-primary" />
          <span className="font-bold text-primary-glow">THE BRINY DEEP</span>
          <span className="text-slate-200/80">
            Depth: <span className="font-semibold text-primary">{currentPlayer.currentDepth}</span>
            {currentPlayer.location === 'port' && ' (In Port)'}
          </span>
        </div>
        {gameState.sea.plugActive && (
          <Badge className="bg-destructive/20 text-destructive animate-pulse text-xs px-1.5 py-0">
            <Skull className="mr-1 h-3 w-3" />
            Plug Active!
          </Badge>
        )}
      </div>

      {/* Compact Depth Navigation */}
      {currentPlayer.location === 'sea' && (
        <div className="shrink-0 flex items-center justify-center gap-1">
          {[1, 2, 3].map((depth) => {
            const isCurrentDepth = currentPlayer.currentDepth === depth;
            const canDescend = depth > currentPlayer.currentDepth && !currentPlayer.hasPassed;
            const canAscend = depth < currentPlayer.currentDepth && !currentPlayer.hasPassed;

            return (
              <Button
                key={depth}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (canDescend) handleDescend(depth);
                  else if (canAscend) handleAscend(depth);
                }}
                disabled={currentPlayer.hasPassed || isCurrentDepth}
                className={`h-8 px-3 touch-manipulation ${
                  isCurrentDepth
                    ? 'btn-ocean ring-1 ring-primary/50'
                    : canDescend || canAscend
                      ? 'border-primary/50 hover:border-primary hover:bg-primary/10 active:scale-95'
                      : 'opacity-40'
                }`}
              >
                <span className="text-xs font-bold">D{depth}</span>
                {canDescend && <ArrowDown className="ml-1 h-3 w-3" />}
                {canAscend && <ArrowUp className="ml-1 h-3 w-3" />}
              </Button>
            );
          })}
        </div>
      )}

      {/* The Deep Sea Board - NO SCROLLING */}
      <div 
        className="flex-1 min-h-0 overflow-hidden touch-pan-y"
        {...touchHandlers}
      >
        <div className={`relative h-full mx-auto w-full max-w-4xl rounded-lg border border-primary/20 bg-gradient-to-b from-slate-900/50 to-slate-950/80 p-1 shadow-xl transition-opacity flex flex-col ${isSwiping ? 'opacity-80' : ''}`}>
          {/* Depth Rows - Compact */}
          <div className="flex-1 flex flex-col gap-1 min-h-0">
            {[1, 2, 3].map((depth) => {
              const depthInfo = DEPTH_INFO[depth as 1 | 2 | 3];
              const shoals = gameState.sea.shoals[depth] ?? [];
              const isAccessible = currentPlayer.currentDepth >= depth && currentPlayer.location === 'sea';
              const isCurrentDepth = currentPlayer.currentDepth === depth;

              return (
                <div
                  key={depth}
                  className={`depth-row flex-1 min-h-0 rounded-lg border ${depthInfo.border} bg-gradient-to-r ${depthInfo.color} p-1 transition-all ${
                    isCurrentDepth ? 'ring-1 ring-primary/50' : ''
                  } ${!isAccessible ? 'opacity-50' : ''}`}
                >
                  {/* Compact Depth Header */}
                  <div className="mb-1 flex items-center justify-between px-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{depthInfo.icon}</span>
                      <span className="text-xs font-medium text-white/80">D{depth}</span>
                    </div>
                    <span className="text-xs text-white/50">
                      {shoals.reduce((acc, s) => acc + s.length, 0)} fish
                    </span>
                  </div>

                  {/* Shoals Row - Compact */}
                  <div className="grid grid-cols-3 gap-1 h-[calc(100%-1.25rem)]">
                    {shoals.map((shoal, shoalIndex) => {
                      const isSelected = selectedShoal?.depth === depth && selectedShoal?.shoal === shoalIndex;
                      const topFish = shoal[0];
                      const shoalEmpty = shoal.length === 0;
                      const canInteract = isAccessible && !currentPlayer.hasPassed;
                      const hasPlug = gameState.sea.plugActive &&
                        gameState.sea.plugCursor.depth === depth &&
                        gameState.sea.plugCursor.shoal === shoalIndex;

                      return (
                        <Card
                          key={`${depth}-${shoalIndex}`}
                          role={canInteract && !shoalEmpty ? 'button' : undefined}
                          tabIndex={canInteract && !shoalEmpty ? 0 : -1}
                          aria-label={
                            shoalEmpty
                              ? `Shoal ${shoalIndex + 1} at depth ${depth} is empty`
                              : `${topFish?.name ?? 'Unknown fish'} in shoal ${shoalIndex + 1} at depth ${depth}`
                          }
                          onClick={() => canInteract && !shoalEmpty && onShoalSelect({ depth, shoal: shoalIndex })}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && canInteract && !shoalEmpty) {
                              onShoalSelect({ depth, shoal: shoalIndex });
                            }
                          }}
                          className={`shoal-card relative overflow-hidden rounded border bg-slate-950/70 p-1 text-white shadow backdrop-blur transition-all h-full flex flex-col ${
                            isSelected ? 'border-primary ring-1 ring-primary/70' : 'border-transparent'
                          } ${
                            hasPlug ? 'border-destructive/70 ring-1 ring-destructive/50' : ''
                          } ${
                            shoalEmpty ? 'opacity-40' : ''
                          } ${
                            canInteract && !shoalEmpty ? 'cursor-pointer hover:border-primary/70 active:scale-[0.98]' : 'cursor-not-allowed'
                          }`}
                        >
                          {hasPlug && (
                            <div className="absolute -top-1 -right-1 z-10">
                              <PlugMarker size="sm" animated />
                            </div>
                          )}

                          {shoalEmpty ? (
                            <div className="flex flex-1 items-center justify-center text-center">
                              <Waves className="h-4 w-4 text-white/30" />
                            </div>
                          ) : (
                            <div className="flex flex-col flex-1 justify-between">
                              <div className="text-xs font-medium text-white leading-tight line-clamp-2">
                                {topFish?.name ?? '?'}
                              </div>
                              <div className="flex gap-1 mt-auto">
                                <Badge className="bg-fishbuck/90 text-slate-900 text-[10px] px-1 py-0">
                                  ${topFish?.value ?? '?'}
                                </Badge>
                                <Badge className="bg-destructive/90 text-white text-[10px] px-1 py-0">
                                  {topFish?.difficulty ?? '?'}
                                </Badge>
                              </div>
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

      {/* Compact Graveyards */}
      <div className="shrink-0 flex items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-slate-950/60 px-2 py-1">
        <Skull className="h-3 w-3 text-destructive/60" />
        <span className="text-xs text-destructive/60">Graveyard:</span>
        {[1, 2, 3].map((depth) => (
          <span key={depth} className="text-xs text-white/60">
            D{depth}: {gameState.sea.graveyards[depth]?.length || 0}
          </span>
        ))}
      </div>
    </div>
  );
};
