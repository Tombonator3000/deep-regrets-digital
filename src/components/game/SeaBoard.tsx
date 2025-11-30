import { GameState, DinkCard } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Fish, Skull, Eye, Waves, Sparkles, Ship } from 'lucide-react';
import brinyDeepHeader from '@/assets/briny-deep-header.png';
import { PlugMarker, DepthMarker, LighthouseToken, BoatToken, BoatColor } from './GameTokens';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { getFishImage, getDefaultFishImage } from '@/data/fishImages';

// Hook to load briny deep background image
const useBrinyDeepBackground = () => {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    import('@/assets/briny-deep-background.png')
      .then((module) => {
        setBackgroundUrl(module.default);
      })
      .catch(() => {
        // Image doesn't exist, that's okay - fallback will be used
        setBackgroundUrl(null);
      });
  }, []);

  return backgroundUrl;
};
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

// Hook to load depth-specific card back images
const useDepthCardBacks = () => {
  const [cardBacks, setCardBacks] = useState<Record<number, string | null>>({});

  useEffect(() => {
    // Try to load depth 1 card back
    import('@/assets/depth-1-card-back.png')
      .then((module) => {
        setCardBacks(prev => ({ ...prev, 1: module.default }));
      })
      .catch(() => {
        // Image doesn't exist, use CSS fallback
        setCardBacks(prev => ({ ...prev, 1: null }));
      });

    // Try to load depth 2 card back
    import('@/assets/depth-2-card-back.png')
      .then((module) => {
        setCardBacks(prev => ({ ...prev, 2: module.default }));
      })
      .catch(() => {
        // Image doesn't exist, use CSS fallback
        setCardBacks(prev => ({ ...prev, 2: null }));
      });

    // Try to load depth 3 card back
    import('@/assets/depth-3-card-back.png')
      .then((module) => {
        setCardBacks(prev => ({ ...prev, 3: module.default }));
      })
      .catch(() => {
        // Image doesn't exist, use CSS fallback
        setCardBacks(prev => ({ ...prev, 3: null }));
      });
  }, []);

  return cardBacks;
};

interface SeaBoardProps {
  gameState: GameState;
  selectedShoal: {depth: number, shoal: number} | null;
  playerColors: Record<string, BoatColor>;
  onShoalSelect: (shoal: {depth: number, shoal: number}) => void;
  onInspectShoal?: (shoal: {depth: number, shoal: number}) => void;
  onAction: (action: any) => void;
}

const DEPTH_INFO = {
  1: { label: 'Shallow Waters', color: 'from-cyan-600/30 to-cyan-800/40', border: 'border-cyan-500/40', icon: '🌊' },
  2: { label: 'The Murky Deep', color: 'from-blue-700/40 to-blue-900/50', border: 'border-blue-500/40', icon: '🌀' },
  3: { label: 'The Abyss', color: 'from-purple-800/50 to-slate-950/60', border: 'border-purple-500/40', icon: '👁️' }
};

export const SeaBoard = ({ gameState, selectedShoal, playerColors, onShoalSelect, onInspectShoal, onAction }: SeaBoardProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const { toast } = useToast();
  const depthCardBacks = useDepthCardBacks();
  const dinkCardBackUrl = useDinkCardBack();
  const brinyDeepBackground = useBrinyDeepBackground();

  // Get the dinks deck for display
  const dinksDeck = gameState.port.dinksDeck;

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
    <div className="briny-deep-board flex h-full min-h-0 flex-col gap-0.5 sm:gap-1 overflow-hidden">
      {/* Briny Deep Header Image - Smaller on mobile */}
      <TooltipProvider delayDuration={200}>
        <div className="shrink-0 relative">
          <img
            src={brinyDeepHeader}
            alt="The Briny Deep"
            className="w-full h-auto max-h-[80px] sm:max-h-none object-cover object-top rounded-lg border border-border/40"
          />
          {/* Dink Cards overlay - positioned over DINKS label in header */}
          <div className="absolute top-[15%] right-[8%] sm:right-[10%] flex items-start gap-1">
            {dinksDeck.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-0.5 cursor-pointer">
                    {/* Show up to 3 stacked dink card backs - rotated to lie flat */}
                    <div className="relative" style={{ transform: 'rotate(-5deg)' }}>
                      {dinksDeck.slice(0, Math.min(3, dinksDeck.length)).map((_, index) => (
                        <div
                          key={index}
                          className={`${index === 0 ? 'relative' : 'absolute top-0 left-0'} h-10 w-7 sm:h-12 sm:w-9 rounded border border-amber-500/60 shadow-md overflow-hidden`}
                          style={{
                            transform: `translateX(${index * 4}px) translateY(${index * 2}px)`,
                            zIndex: 3 - index,
                          }}
                        >
                          {dinkCardBackUrl ? (
                            <img
                              src={dinkCardBackUrl}
                              alt="Dink card"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-b from-amber-900/80 to-amber-950/90 flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-amber-300" />
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Deck count badge overlaid on the stack */}
                      <Badge className="absolute -bottom-1 -right-1 bg-amber-500/90 text-slate-900 text-[10px] px-1.5 py-0 shadow-md z-10">
                        {dinksDeck.length}
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <div className="font-semibold text-amber-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Dink Deck
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dinksDeck.length} trinkets remaining in deck
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {/* Overlay with depth info and plug status */}
          <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between">
            <span className="text-xs text-slate-200/90 bg-slate-950/70 px-2 py-0.5 rounded">
              Depth: <span className="font-semibold text-primary">{currentPlayer.currentDepth}</span>
              {currentPlayer.location === 'port' && ' (In Port)'}
            </span>
            {gameState.sea.plugActive && (
              <Badge className="bg-destructive/20 text-destructive animate-pulse text-xs px-1.5 py-0">
                <Skull className="mr-1 h-3 w-3" />
                Plug Active!
              </Badge>
            )}
          </div>
        </div>
      </TooltipProvider>

      {/* Compact Depth Navigation - Hidden on mobile, using depth rows directly */}
      {currentPlayer.location === 'sea' && (
        <div className="shrink-0 hidden sm:flex items-center justify-center gap-1">
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

      {/* The Deep Sea Board with Background Image */}
      <div
        className="flex-1 min-h-0 overflow-hidden touch-pan-y"
        {...touchHandlers}
      >
        <div
          className={`relative h-full mx-auto w-full max-w-4xl rounded-lg border border-primary/20 shadow-xl transition-opacity ${isSwiping ? 'opacity-80' : ''}`}
          style={{
            backgroundImage: brinyDeepBackground ? `url(${brinyDeepBackground})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: brinyDeepBackground ? undefined : 'rgb(15, 23, 42)',
          }}
        >
          {/* Fallback gradient overlay when no background image */}
          {!brinyDeepBackground && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/80 rounded-lg" />
          )}

          {/* 3x3 Grid of Cards positioned over background */}
          <div className="absolute inset-0 grid grid-rows-3 gap-0 p-[3%]" style={{ paddingTop: '2%', paddingBottom: '2%' }}>
            {[1, 2, 3].map((depth) => {
              const depthInfo = DEPTH_INFO[depth as 1 | 2 | 3];
              const shoals = gameState.sea.shoals[depth] ?? [];
              const isAccessible = currentPlayer.currentDepth >= depth && currentPlayer.location === 'sea';
              const isCurrentDepth = currentPlayer.currentDepth === depth;
              const canDescend = depth > currentPlayer.currentDepth && !currentPlayer.hasPassed && currentPlayer.location === 'sea';
              const canAscend = depth < currentPlayer.currentDepth && !currentPlayer.hasPassed && currentPlayer.location === 'sea';
              const playersAtDepth = gameState.players.filter((player) =>
                player.location === 'sea' && player.currentDepth === depth
              );

              return (
                <div
                  key={depth}
                  className="relative flex flex-col"
                >
                  {/* Depth indicator overlay */}
                  <div className="absolute top-0 left-0 z-20 flex items-center gap-1 bg-black/40 rounded px-1 py-0.5">
                    {isCurrentDepth && currentPlayer.location === 'sea' && (
                      <BoatToken
                        size="sm"
                        animated
                        highlight
                        color={playerColors[currentPlayer.id] ?? 'primary'}
                      />
                    )}
                    <span className="text-[10px] sm:text-xs font-bold text-white/90">D{depth}</span>
                    {canDescend && <ArrowDown className="h-3 w-3 text-primary" />}
                    {canAscend && <ArrowUp className="h-3 w-3 text-primary" />}
                  </div>

                  {playersAtDepth.length > 0 && (
                    <div className="pointer-events-none absolute top-0 left-16 right-1 z-20 flex flex-wrap items-center gap-1 px-1 pt-1">
                      {playersAtDepth.map((player) => {
                        const playerIndex = gameState.players.findIndex((p) => p.id === player.id);
                        const isCurrentTurn = playerIndex === gameState.currentPlayerIndex;
                        const color = playerColors[player.id] ?? 'primary';

                        return (
                          <div
                            key={player.id}
                            className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/80 px-1.5 py-0.5 shadow-sm"
                          >
                            <BoatToken
                              size="sm"
                              color={color}
                              animated
                              highlight={isCurrentTurn}
                              className={isCurrentTurn ? 'animate-[boat-bob_1.6s_ease-in-out_infinite]' : ''}
                            />
                            <span className="text-[9px] sm:text-[10px] font-semibold text-white/90 leading-none">
                              {player.name}
                            </span>
                            {player.isAI && (
                              <Badge className="bg-purple-700/70 text-[9px] text-purple-100">AI</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fish count indicator */}
                  <div className="absolute top-0 right-0 z-20 bg-black/40 rounded px-1 py-0.5">
                    <span className="text-[9px] sm:text-xs text-white/70">
                      {shoals.reduce((acc, s) => acc + s.length, 0)} fish
                    </span>
                  </div>

                  {/* Cards Row - 3 cards per depth */}
                  <div
                    className="flex-1 grid grid-cols-3 gap-[2%] px-[1%] py-[2%]"
                    role={canDescend || canAscend ? 'button' : undefined}
                    onClick={(e) => {
                      // Only handle clicks on the row itself, not on cards
                      if (e.target === e.currentTarget) {
                        if (canDescend) handleDescend(depth);
                        else if (canAscend) handleAscend(depth);
                      }
                    }}
                  >
                    {shoals.map((shoal, shoalIndex) => {
                      const isSelected = selectedShoal?.depth === depth && selectedShoal?.shoal === shoalIndex;
                      const topFish = shoal[0];
                      const shoalEmpty = shoal.length === 0;
                      const canInteract = isAccessible && !currentPlayer.hasPassed;
                      const hasPlug = gameState.sea.plugActive &&
                        gameState.sea.plugCursor.depth === depth &&
                        gameState.sea.plugCursor.shoal === shoalIndex;
                      const shoalKey = `${depth}-${shoalIndex}`;
                      const isRevealed = gameState.sea.revealedShoals?.[shoalKey] ?? false;
                      const fishCount = shoal.length;

                      return (
                        <div
                          key={`${depth}-${shoalIndex}`}
                          className="relative h-full"
                        >
                          {/* Stacked cards effect */}
                          {!shoalEmpty && fishCount > 1 && (
                            <>
                              {fishCount > 2 && (
                                <div
                                  className="absolute inset-0 rounded border border-white/10 bg-slate-900/40"
                                  style={{ transform: 'translate(3px, 3px)', zIndex: 0 }}
                                />
                              )}
                              <div
                                className="absolute inset-0 rounded border border-white/15 bg-slate-900/50"
                                style={{ transform: 'translate(1.5px, 1.5px)', zIndex: 1 }}
                              />
                            </>
                          )}
                          <Card
                            role={canInteract && !shoalEmpty ? 'button' : undefined}
                            tabIndex={canInteract && !shoalEmpty ? 0 : -1}
                            aria-label={
                              shoalEmpty
                                ? `Shoal ${shoalIndex + 1} at depth ${depth} is empty`
                                : isRevealed
                                  ? `${topFish?.name ?? 'Unknown fish'} in shoal ${shoalIndex + 1} at depth ${depth}`
                                  : `Hidden fish in shoal ${shoalIndex + 1} at depth ${depth}. Click to reveal.`
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canInteract && !shoalEmpty) {
                                onShoalSelect({ depth, shoal: shoalIndex });
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' && canInteract && !shoalEmpty) {
                                onShoalSelect({ depth, shoal: shoalIndex });
                              }
                            }}
                            className={`shoal-card relative overflow-hidden rounded-lg border-2 bg-slate-950/60 backdrop-blur-sm p-1 sm:p-1.5 text-white shadow-lg transition-all h-full flex flex-col ${
                              isSelected ? 'border-primary ring-2 ring-primary/70' : 'border-white/20'
                            } ${
                              hasPlug ? 'border-destructive/70 ring-2 ring-destructive/50' : ''
                            } ${
                              shoalEmpty ? 'opacity-30 bg-transparent border-dashed' : ''
                            } ${
                              canInteract && !shoalEmpty ? 'cursor-pointer hover:border-primary/70 hover:bg-slate-900/70 active:scale-[0.97]' : ''
                            } ${
                              !isAccessible ? 'opacity-40' : ''
                            }`}
                            style={{ position: 'relative', zIndex: 2 }}
                          >
                            {hasPlug && (
                              <div className="absolute -top-1 -right-1 z-10">
                                <PlugMarker size="sm" animated />
                              </div>
                            )}

                            {/* Fish count badge */}
                            {!shoalEmpty && fishCount > 1 && (
                              <div className="absolute top-0.5 right-0.5 z-10">
                                <Badge className="bg-slate-700/90 text-white/90 text-[9px] px-1 py-0 min-w-[1rem] text-center font-bold">
                                  {fishCount}
                                </Badge>
                              </div>
                            )}

                            {shoalEmpty ? (
                              <div className="flex flex-1 items-center justify-center text-center">
                                <Waves className="h-4 w-4 sm:h-5 sm:w-5 text-white/20" />
                              </div>
                            ) : isRevealed ? (
                              <div className="flex flex-col flex-1 justify-between relative overflow-hidden">
                                {/* Fish illustration background */}
                                {topFish && (
                                  <div className="absolute inset-0">
                                    <img 
                                      src={getFishImage(topFish.id) || getDefaultFishImage(topFish.depth)} 
                                      alt={topFish.name}
                                      className="w-full h-full object-cover opacity-70"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                  </div>
                                )}
                                <div className="text-[10px] sm:text-xs font-semibold text-white leading-tight line-clamp-2 drop-shadow relative z-10">
                                  {topFish?.name ?? '?'}
                                </div>
                                <div className="flex gap-0.5 sm:gap-1 mt-auto flex-wrap relative z-10">
                                  <Badge className="bg-fishbuck/90 text-slate-900 text-[9px] sm:text-[10px] px-1 py-0 font-bold">
                                    ${topFish?.value ?? '?'}
                                  </Badge>
                                  <Badge className="bg-destructive/90 text-white text-[9px] sm:text-[10px] px-1 py-0 font-bold">
                                    {topFish?.difficulty ?? '?'}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              /* Hidden fish - face-down card */
                              <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <div className="relative w-full h-full flex items-center justify-center">
                                  {depthCardBacks[depth] ? (
                                    <img
                                      src={depthCardBacks[depth]!}
                                      alt={`Depth ${depth} card back`}
                                      className="absolute inset-0 w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <>
                                      <div className="absolute inset-0.5 rounded bg-gradient-to-br from-cyan-900/50 via-blue-900/60 to-purple-900/50 border border-white/20">
                                        <div className="absolute inset-0 opacity-40" style={{
                                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.08) 3px, rgba(255,255,255,0.08) 6px)'
                                        }} />
                                      </div>
                                      <Fish className="h-4 w-4 sm:h-5 sm:w-5 text-white/50 z-10" />
                                    </>
                                  )}
                                </div>
                                <span className="text-[8px] sm:text-[9px] text-white/60 mt-auto font-medium">Tap</span>
                              </div>
                            )}
                          </Card>
                        </div>
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
      <div className="shrink-0 flex items-center justify-center gap-1 sm:gap-2 rounded-lg border border-destructive/20 bg-slate-950/60 px-1.5 sm:px-2 py-0.5 sm:py-1">
        <Skull className="h-3 w-3 text-destructive/60" />
        <span className="text-[10px] sm:text-xs text-destructive/60">Graveyard:</span>
        {[1, 2, 3].map((depth) => (
          <span key={depth} className="text-[10px] sm:text-xs text-white/60">
            D{depth}: {gameState.sea.graveyards[depth]?.length || 0}
          </span>
        ))}
      </div>
    </div>
  );
};
