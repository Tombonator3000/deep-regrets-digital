import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameState, FishCard } from '@/types/game';
import { SeaBoard } from './game/SeaBoard';
import { PortBoard } from './game/PortBoard';
import { PlayerPanel } from './game/PlayerPanel';
import { ActionPanel } from './game/ActionPanel';
import { AnglerBoard } from './game/AnglerBoard';
import { DayTracker } from './game/DayTracker';
import { MadnessTracker } from './game/MadnessTracker';
import { CardModalProvider, useCardModal } from './game/CardModal';
import { DiceRemovalModal } from './game/DiceRemovalModal';
import { NauticalFrame, WoodCornerAccent } from './game/NauticalFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FullscreenContext } from '@/context/FullscreenContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Anchor,
  Fish,
  HelpCircle,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Settings2,
  Skull,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import brinyDeepHeader from '@/assets/briny-deep-header.png';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BubbleField } from '@/components/effects/BubbleField';
import { useDiceSelection } from '@/hooks/useDiceSelection';
import { getFishImage, getDefaultFishImage } from '@/data/fishImages';
import { OptionsMenu, useDisplaySettings } from '@/components/OptionsMenu';
import { HelpSystem } from '@/components/HelpSystem';
import { getSlotMultiplier } from '@/utils/mounting';
import { EndGameScreen } from './game/EndGameScreen';

import { GameAction } from '@/types/game';
import { BoatColor } from './game/GameTokens';

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
        setCardBacks(prev => ({ ...prev, 1: null }));
      });

    // Try to load depth 2 card back
    import('@/assets/depth-2-card-back.png')
      .then((module) => {
        setCardBacks(prev => ({ ...prev, 2: module.default }));
      })
      .catch(() => {
        setCardBacks(prev => ({ ...prev, 2: null }));
      });

    // Try to load depth 3 card back
    import('@/assets/depth-3-card-back.png')
      .then((module) => {
        setCardBacks(prev => ({ ...prev, 3: module.default }));
      })
      .catch(() => {
        setCardBacks(prev => ({ ...prev, 3: null }));
      });
  }, []);

  return cardBacks;
};

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

interface GameBoardProps {
  gameState: GameState;
  onAction: (action: GameAction) => void;
  onRestartGame: () => void;
  onBackToStart: () => void;
}

// Inner component that sets up the DINK card play callback
const GameBoardInner = ({ gameState, onAction, onRestartGame, onBackToStart }: GameBoardProps) => {
  const [selectedShoal, setSelectedShoal] = useState<{depth: number, shoal: number} | null>(null);
  const [shoalDialogOpen, setShoalDialogOpen] = useState(false);
  const [isPortOpen, setIsPortOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const displaySettings = useDisplaySettings();
  const { setOnPlayDink } = useCardModal();
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const depthCardBacks = useDepthCardBacks();
  const dinkCardBackUrl = useDinkCardBack();
  const dinksDeck = gameState.port.dinksDeck;

  // Set up the DINK card play callback
  useEffect(() => {
    const handlePlayDink = (dinkId: string, effect: string) => {
      onAction({
        type: 'PLAY_DINK',
        playerId: currentPlayer.id,
        payload: { dinkId, effect },
      });
    };
    setOnPlayDink(handlePlayDink);
    return () => setOnPlayDink(null);
  }, [setOnPlayDink, onAction, currentPlayer.id]);

  const isPlayerTurn = !currentPlayer.hasPassed;
  const {
    availableDiceTotal,
    resetDiceSelection,
    selectedDiceIndices,
    selectedDiceTotal,
    toggleDiceSelection,
  } = useDiceSelection(currentPlayer.freshDice);
  const selectedShoalFish = useMemo(
    () => {
      if (!selectedShoal) return [] as FishCard[];
      const depthShoals = gameState.sea.shoals[selectedShoal.depth] ?? [];
      return depthShoals[selectedShoal.shoal] ?? [];
    },
    [gameState.sea.shoals, selectedShoal]
  );
  const topFish = selectedShoalFish[0];
  const shoalIsEmpty = selectedShoal ? selectedShoalFish.length === 0 : true;
  const selectedShoalKey = selectedShoal ? `${selectedShoal.depth}-${selectedShoal.shoal}` : null;
  const isShoalRevealed = selectedShoalKey ? (gameState.sea.revealedShoals?.[selectedShoalKey] ?? false) : false;
  const playerBoatColors = useMemo(() => {
    const palette: BoatColor[] = ['primary', 'blue', 'orange', 'green', 'red'];

    return gameState.players.reduce<Record<string, BoatColor>>((acc, player, index) => {
      acc[player.id] = palette[index % palette.length];
      return acc;
    }, {});
  }, [gameState.players]);
  const phaseDisplay: Record<GameState['phase'], string> = {
    start: 'Start',
    refresh: 'Refresh',
    declaration: 'Declaration',
    action: 'Action',
    endgame: 'Game Over'
  };
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayIndex = dayOrder.indexOf(gameState.day);
  const dayLabel = currentDayIndex >= 0
    ? `Day ${currentDayIndex + 1}: ${gameState.day}`
    : gameState.day;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await boardRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen mode', error);
    }
  };

  // Handle mounting fish via drag and drop
  const handleMountFish = useCallback((fish: FishCard, slotIndex: number) => {
    onAction({
      type: 'MOUNT_FISH',
      playerId: currentPlayer.id,
      payload: {
        fishId: fish.id,
        slot: slotIndex,
      },
    });
  }, [currentPlayer.id, onAction]);

  return (
    <FullscreenContext.Provider value={{ containerRef: boardRef, isFullscreen }}>
    <div ref={boardRef} className="relative h-dvh min-h-0 overflow-hidden bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {displaySettings.particlesEnabled && (
          <div className="ocean-particles">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="particle animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${6 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        )}
        {displaySettings.bubblesEnabled && (
          <BubbleField bubbleCount={72} className="opacity-70" />
        )}
        <div className="tentacle-shadow" />
      </div>
      
      {/* Game Over Overlay - uses absolute positioning to work in fullscreen */}
      {gameState.isGameOver && (
        <EndGameScreen
          gameState={gameState}
          onRestartGame={onRestartGame}
          onBackToStart={onBackToStart}
        />
      )}
      
      {/* Main Game Layout - Board Game Style - NO SCROLLING */}
      <NauticalFrame showNet className="relative z-10 mx-auto h-full w-full max-w-[1600px]" variant="corners-only">
        <div className="grid h-full w-full grid-rows-[1fr] gap-0.5 px-0.5 py-0.5 min-h-0 overflow-hidden sm:gap-1 sm:px-2 sm:py-1 pt-0.5 sm:pt-1 lg:pt-1">
        {/* Responsive Board Game Layout - NO SCROLLING */}
        <div className="grid h-full min-h-0 gap-0.5 sm:gap-1 grid-cols-1 grid-rows-[1fr,auto] md:grid-cols-[minmax(200px,240px),1fr] md:grid-rows-1 lg:grid-cols-[minmax(220px,260px),1fr,minmax(220px,280px)] xl:grid-cols-[minmax(240px,280px),1fr,minmax(240px,300px)] overflow-hidden">
          {/* Left Column - Angler Board (Player Board) - Hidden on mobile, shows in Actions panel */}
          <div className="relative hidden min-h-0 flex-col gap-1 overflow-hidden sm:gap-1 md:flex">
            <WoodCornerAccent position="top-left" size="sm" />
            <WoodCornerAccent position="bottom-left" size="sm" />
            <AnglerBoard
              player={currentPlayer}
              isCurrentPlayer={isPlayerTurn}
              gameState={gameState}
              onMountFish={handleMountFish}
              onViewCaptainSheet={() => setIsPlayerOpen(true)}
            />
            <MadnessTracker player={currentPlayer} />
            <DayTracker
              day={gameState.day}
              phase={gameState.phase}
            />
          </div>

          {/* Center Column - The Briny Deep (Sea Board) */}
          <div className="relative min-h-0 flex flex-col overflow-hidden rounded-lg border border-white/10 bg-background/60 backdrop-blur sm:rounded-xl">
            <WoodCornerAccent position="top-left" size="md" />
            <WoodCornerAccent position="top-right" size="md" />
            <WoodCornerAccent position="bottom-left" size="md" />
            <WoodCornerAccent position="bottom-right" size="md" />

            {/* Briny Deep Header Banner - Above the sea board */}
            <TooltipProvider delayDuration={200}>
              <div className="shrink-0 relative briny-deep-header mx-0.5 mt-0.5 sm:mx-1 sm:mt-0.5" style={{ maxHeight: '65px' }}>
                <img
                  src={brinyDeepHeader}
                  alt="The Briny Deep"
                  className="w-full h-full object-cover object-center rounded-lg"
                />
                {/* Control buttons overlay - positioned on the left */}
                <div className="absolute top-1/2 -translate-y-1/2 left-[2%] flex items-center gap-0.5 sm:gap-1">
                  <Button
                    size="sm"
                    className="btn-ocean flex items-center gap-0.5 px-1 min-h-[28px] text-[9px] touch-manipulation active:scale-95 sm:gap-1.5 sm:px-2 sm:min-h-[32px] sm:text-xs"
                    onClick={() => setIsPortOpen(true)}
                  >
                    <Anchor className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Havnhandlinger</span>
                    <span className="sm:hidden">Havn</span>
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    className="min-h-[28px] min-w-[28px] p-1 text-white/80 hover:text-white hover:bg-white/20 touch-manipulation active:scale-95 sm:min-h-[32px] sm:min-w-[32px] sm:p-1.5"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        className="min-h-[28px] min-w-[28px] border-white/30 bg-white/10 p-1 text-white hover:bg-white/20 touch-manipulation active:scale-95 sm:min-h-[32px] sm:min-w-[32px] sm:p-1.5"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onSelect={() => setIsHelpOpen(true)}
                      >
                        <HelpCircle className="h-4 w-4" />
                        Hjelp & Regler
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onSelect={() => setIsPlayerOpen(true)}
                      >
                        <UserRound className="h-4 w-4" />
                        View Captain Sheet
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onSelect={() => setIsOptionsOpen(true)}
                      >
                        <Settings2 className="h-4 w-4" />
                        Options
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Dink Cards overlay - positioned among the flags on the right */}
                <div className="absolute top-1/2 -translate-y-1/2 right-[2%] flex items-center gap-1">
                  {dinksDeck.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-0.5 cursor-pointer">
                          {/* Show stacked dink card backs */}
                          <div className="relative" style={{ transform: 'rotate(-3deg)' }}>
                            {dinksDeck.slice(0, Math.min(3, dinksDeck.length)).map((_, index) => (
                              <div
                                key={index}
                                className={`${index === 0 ? 'relative' : 'absolute top-0 left-0'} h-10 w-7 sm:h-12 sm:w-8 rounded border-2 border-amber-600/80 shadow-lg overflow-hidden`}
                                style={{
                                  transform: `translateX(${index * 2}px) translateY(${index * 1.5}px)`,
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
                            {/* Deck count badge */}
                            <Badge className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-900 text-[10px] px-1.5 py-0 shadow-md z-10 font-bold">
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
                {/* Depth and status overlay at bottom */}
                <div className="absolute bottom-0.5 left-1 right-1 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-white/95 bg-slate-900/80 px-1.5 py-0.5 rounded font-medium">
                    Depth: <span className="font-bold text-cyan-300">{currentPlayer.currentDepth}</span>
                    {currentPlayer.location === 'port' && ' (In Port)'}
                  </span>
                  {gameState.sea.plugActive && (
                    <Badge className="bg-red-900/80 text-red-200 animate-pulse text-[10px] sm:text-xs px-1.5 py-0">
                      <Skull className="mr-1 h-3 w-3" />
                      Plug Active!
                    </Badge>
                  )}
                </div>
              </div>
            </TooltipProvider>

            <div className="flex-1 min-h-0 overflow-hidden p-0.5 sm:p-1">
              <SeaBoard
                gameState={gameState}
                selectedShoal={selectedShoal}
                playerColors={playerBoatColors}
                onShoalSelect={(selection) => {
                  setSelectedShoal(selection);
                  setShoalDialogOpen(true);
                }}
                onInspectShoal={(selection) => {
                  setSelectedShoal(selection);
                  setShoalDialogOpen(true);
                }}
                onAction={onAction}
              />
            </div>
          </div>

          {/* Right Column - Actions Panel */}
          <div className="relative flex min-h-0 flex-col gap-0.5 overflow-hidden rounded-lg border border-white/10 bg-background/50 p-0.5 backdrop-blur sm:gap-2 sm:rounded-xl sm:p-2 lg:flex">
            <WoodCornerAccent position="top-left" size="sm" />
            <WoodCornerAccent position="top-right" size="sm" />
            {/* Show compact player info on mobile/tablet */}
            <div className="md:hidden">
              <AnglerBoard
                player={currentPlayer}
                isCurrentPlayer={isPlayerTurn}
                gameState={gameState}
                onMountFish={handleMountFish}
                onViewCaptainSheet={() => setIsPlayerOpen(true)}
                compact
              />
            </div>
            <ActionPanel
              gameState={gameState}
              onAction={onAction}
            />
            {/* Show madness tracker and day tracker on mobile */}
            <div className="md:hidden space-y-1">
              <MadnessTracker player={currentPlayer} compact />
              <DayTracker
                day={gameState.day}
                phase={gameState.phase}
              />
            </div>
          </div>
        </div>
        </div>
      </NauticalFrame>

      <Dialog
        open={shoalDialogOpen && Boolean(selectedShoal)}
        onOpenChange={(open) => {
          setShoalDialogOpen(open);
          if (!open) {
            resetDiceSelection();
          }
        }}
      >
        <DialogContent
          aria-describedby={selectedShoal ? 'shoal-detail-description' : undefined}
          className="max-w-lg bg-slate-950/80 backdrop-blur-xl border border-white/15 p-6 space-y-4"
        >
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-primary-glow">
              {shoalIsEmpty ? 'Empty Shoal' : isShoalRevealed ? topFish?.name : 'Hidden Fish'}
            </DialogTitle>
            {selectedShoal && (
              <DialogDescription className="text-xs uppercase tracking-wide text-slate-200/80">
                Depth {selectedShoal.depth} • Shoal {selectedShoal.shoal + 1}
              </DialogDescription>
            )}
          </DialogHeader>

          <p id="shoal-detail-description" className="sr-only" aria-live="polite">
            {shoalIsEmpty
              ? 'This shoal is empty.'
              : isShoalRevealed && topFish
                ? `Difficulty ${topFish.difficulty}. Value ${topFish.value}. Requires dice totalling at least ${topFish.difficulty}.`
                : 'Fish is hidden. Use Reveal Top Fish to see it.'}
          </p>

          {shoalIsEmpty ? (
            <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-center text-sm text-slate-200">
              The waters are calm. There are no fish remaining in this shoal.
            </div>
          ) : !isShoalRevealed ? (
            /* Hidden fish state - show mystery card */
            <div className="space-y-4">
              <div className="flex items-center justify-center py-6 rounded-lg bg-black/30">
                <div className="relative w-32 h-44 rounded-lg overflow-hidden border-2 border-white/20 flex items-center justify-center shadow-xl">
                  {/* Depth-specific card back */}
                  {selectedShoal && depthCardBacks[selectedShoal.depth] ? (
                    <img
                      src={depthCardBacks[selectedShoal.depth]!}
                      alt={`Depth ${selectedShoal.depth} card back`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 via-blue-900/60 to-purple-900/50" />
                      <div className="absolute inset-2 rounded opacity-30" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px)'
                      }} />
                    </>
                  )}
                  <div className="text-center z-10">
                    <Fish className="h-10 w-10 text-white/50 mx-auto mb-2 drop-shadow-lg" />
                    <span className="text-sm text-white/60 drop-shadow">???</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-center text-sm text-slate-200">
                This fish is hidden. Spend a die to reveal it before catching.
              </div>
              {currentPlayer.freshDice.length === 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
                  No dice available to reveal fish!
                </div>
              )}
            </div>
          ) : topFish ? (
            <div className="space-y-4">
              {/* Fish image */}
              <div className="relative h-40 rounded-lg overflow-hidden bg-black/30">
                {(() => {
                  const fishImage = getFishImage(topFish.id) || getDefaultFishImage(topFish.depth);
                  return fishImage ? (
                    <img
                      src={fishImage}
                      alt={topFish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Fish className="h-16 w-16 text-cyan-300/50" />
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-fishbuck/20 text-fishbuck">Value {topFish.value}</Badge>
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  Difficulty {topFish.difficulty}
                </Badge>
                <Badge variant="secondary" className="bg-slate-800/80 text-slate-200">
                  Dice Needed ≥ {topFish.difficulty}
                </Badge>
              </div>

              {topFish.description && (
                <p className="text-sm text-slate-200/90">{topFish.description}</p>
              )}

              {topFish.abilities.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Abilities</p>
                  <div className="flex flex-wrap gap-2">
                    {topFish.abilities.map((ability) => (
                      <Badge key={ability} variant="secondary" className="bg-slate-900/60 text-xs text-slate-100">
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentPlayer.freshDice.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-slate-200/90">
                    Select dice (total {availableDiceTotal}) to meet the difficulty.
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {currentPlayer.freshDice.map((dieValue, index) => (
                      <Button
                        key={`${dieValue}-${index}`}
                        variant={selectedDiceIndices.includes(index) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDiceSelection(index)}
                        className={selectedDiceIndices.includes(index) ? 'btn-ocean' : 'border-primary/30'}
                      >
                        {dieValue}
                      </Button>
                    ))}
                  </div>
                  <div className="text-sm text-slate-100">
                    Total Selected: <span className="font-semibold text-primary-glow">{selectedDiceTotal}</span>
                    <span className="text-slate-300"> / {topFish.difficulty} required</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            {!isShoalRevealed && !shoalIsEmpty ? (
              /* Only show Reveal button when fish is hidden */
              <Button
                className="btn-ocean w-full"
                disabled={!selectedShoal || shoalIsEmpty || currentPlayer.freshDice.length === 0}
                onClick={() => {
                  if (!selectedShoal || shoalIsEmpty) return;
                  onAction({
                    type: 'REVEAL_FISH',
                    playerId: currentPlayer.id,
                    payload: { depth: selectedShoal.depth, shoal: selectedShoal.shoal },
                  });
                }}
              >
                Reveal Top Fish
              </Button>
            ) : (
              /* Show full actions when fish is revealed */
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="btn-ocean"
                    disabled={!topFish || selectedDiceIndices.length === 0}
                    onClick={() => {
                      if (!selectedShoal || !topFish || selectedDiceIndices.length === 0) return;
                      onAction({
                        type: 'CATCH_FISH',
                        playerId: currentPlayer.id,
                        payload: {
                          fish: topFish,
                          depth: selectedShoal.depth,
                          shoal: selectedShoal.shoal,
                          diceIndices: selectedDiceIndices,
                        },
                      });
                      setShoalDialogOpen(false);
                      resetDiceSelection();
                    }}
                  >
                    Catch with Selected Dice
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  className="bg-slate-800/70 text-slate-200 hover:bg-slate-700"
                  disabled={!topFish}
                  onClick={() => {
                    if (!selectedShoal || !topFish) return;
                    onAction({
                      type: 'CATCH_FISH',
                      playerId: currentPlayer.id,
                      payload: {
                        fish: topFish,
                        depth: selectedShoal.depth,
                        shoal: selectedShoal.shoal,
                        diceIndices: [],
                      },
                    });
                    setShoalDialogOpen(false);
                    resetDiceSelection();
                  }}
                >
                  Pass on Catch
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-4xl bg-background/80 backdrop-blur-xl border border-white/20">
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <PlayerPanel
              player={currentPlayer}
              isCurrentPlayer={isPlayerTurn}
              onAction={onAction}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary-glow">Options</DialogTitle>
            <DialogDescription>
              Adjust your audio and display preferences mid-voyage.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <OptionsMenu />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary-glow">Hjelp & Regler</DialogTitle>
            <DialogDescription>
              Lær å spille eller slå opp regler underveis.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 min-h-0 flex-1 overflow-hidden">
            <HelpSystem defaultTab="rulebook" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Port Operations Modal */}
      <Dialog open={isPortOpen} onOpenChange={setIsPortOpen}>
        <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col overflow-hidden border border-white/20 bg-slate-950 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Havnhandlinger</DialogTitle>
            <DialogDescription>Port operations modal for trading and services</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <PortBoard
              className="h-full"
              gameState={gameState}
              playerColors={playerBoatColors}
              onAction={onAction}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dice Removal Modal - shown when player needs to choose dice to remove */}
      <DiceRemovalModal
        gameState={gameState}
        onAction={onAction}
      />
    </div>
    </FullscreenContext.Provider>
  );
};

// Main GameBoard component that provides the CardModalProvider
export const GameBoard = ({ gameState, onAction, onRestartGame, onBackToStart }: GameBoardProps) => {
  return (
    <CardModalProvider>
      <GameBoardInner
        gameState={gameState}
        onAction={onAction}
        onRestartGame={onRestartGame}
        onBackToStart={onBackToStart}
      />
    </CardModalProvider>
  );
};
