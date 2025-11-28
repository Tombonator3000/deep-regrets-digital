import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameState, FishCard } from '@/types/game';
import { SeaBoard } from './game/SeaBoard';
import { PortBoard } from './game/PortBoard';
import { PlayerPanel } from './game/PlayerPanel';
import { ActionPanel } from './game/ActionPanel';
import { AnglerBoard } from './game/AnglerBoard';
import { DayTracker } from './game/DayTracker';
import { CardModalProvider } from './game/CardModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  UserRound,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { calculatePlayerScoreBreakdown } from '@/utils/gameEngine';
import { BubbleField } from '@/components/effects/BubbleField';
import { useDiceSelection } from '@/hooks/useDiceSelection';
import { OptionsMenu, useDisplaySettings } from '@/components/OptionsMenu';
import { HelpSystem } from '@/components/HelpSystem';
import { getSlotMultiplier } from '@/utils/mounting';

import { GameAction } from '@/types/game';

interface GameBoardProps {
  gameState: GameState;
  onAction: (action: GameAction) => void;
  onNewGame: () => void;
}

export const GameBoard = ({ gameState, onAction, onNewGame }: GameBoardProps) => {
  const [selectedShoal, setSelectedShoal] = useState<{depth: number, shoal: number} | null>(null);
  const [shoalDialogOpen, setShoalDialogOpen] = useState(false);
  const [isPortOpen, setIsPortOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const portButtonRef = useRef<HTMLButtonElement>(null);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);
  const wasPortOpenRef = useRef(false);
  const displaySettings = useDisplaySettings();

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
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
  const finalScores = gameState.players.map(player => ({
    player,
    breakdown: calculatePlayerScoreBreakdown(player)
  }));
  const sortedFinalScores = [...finalScores].sort((a, b) =>
    b.breakdown.totalScore - a.breakdown.totalScore
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (isPortOpen) {
      sheetCloseRef.current?.focus();
    } else if (wasPortOpenRef.current) {
      portButtonRef.current?.focus();
    }
    wasPortOpenRef.current = isPortOpen;
  }, [isPortOpen]);

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
    <CardModalProvider>
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
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100]">
          <div className="card-game p-6 sm:p-8 text-center space-y-4 sm:space-y-6 max-w-md mx-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-glow">Game Over</h2>
            {gameState.winner && (
              <p className="text-lg sm:text-xl">
                🏆 <span className="text-primary-glow font-bold">{gameState.winner}</span> wins!
              </p>
            )}
            <div className="space-y-3 text-left">
              <h3 className="font-semibold text-center">Final Scores:</h3>
              {sortedFinalScores.map(({ player, breakdown }) => {
                const isWinner = gameState.winner === player.name;
                return (
                  <div
                    key={player.id}
                    className={`rounded-md border border-border/40 p-3 transition ${
                      isWinner ? 'border-primary text-primary-glow' : ''
                    } ${player.isAI ? 'bg-purple-900/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isWinner ? 'text-primary-glow' : ''}`}>
                        {player.name}
                        {player.isAI && (
                          <span className="ml-2 text-xs text-purple-400">(AI)</span>
                        )}
                      </span>
                      <span className={`font-semibold ${isWinner ? 'text-primary-glow' : ''}`}>
                        {breakdown.totalScore} pts
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block font-semibold text-foreground/80">Hand (Madness)</span>
                        <span>{breakdown.handScore}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-foreground/80">Mounted</span>
                        <span>{breakdown.mountedScore}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-foreground/80">Fishbucks</span>
                        <span>{breakdown.fishbuckScore}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={onNewGame} className="btn-ocean min-h-[44px] touch-manipulation active:scale-95">
                New Game
              </Button>
              <Button onClick={onNewGame} variant="outline" className="border-primary/30 hover:border-primary min-h-[44px] touch-manipulation active:scale-95">
                Back to Start
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Game Layout - Board Game Style - NO SCROLLING */}
      <div className="relative z-10 mx-auto grid h-full w-full max-w-[1600px] grid-rows-[auto,1fr] gap-0.5 px-0.5 py-0.5 min-h-0 overflow-hidden sm:gap-2 sm:px-2 sm:py-2">
        {/* Compact Header */}
        <div className="flex flex-wrap items-center justify-between gap-0.5 rounded-lg border border-white/10 bg-background/70 px-1.5 py-0.5 backdrop-blur sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2">
          <div className="flex items-center gap-1 sm:gap-4">
            <h1 className="text-sm font-bold text-primary-glow sm:text-xl">DEEP REGRETS</h1>
            <Badge
              className={`rounded-full px-1.5 py-0 text-[10px] sm:px-3 sm:py-0.5 sm:text-xs ${
                currentPlayer.isAI
                  ? 'border-purple-400/40 bg-purple-600/20 text-purple-300'
                  : 'border-primary/40 bg-primary/10 text-primary'
              }`}
            >
              {currentPlayer.isAI && (
                <span className="mr-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400 sm:mr-1.5 sm:h-2 sm:w-2" />
              )}
              <span className="hidden xs:inline">{currentPlayer.name}'s Turn</span>
              <span className="xs:hidden">{currentPlayer.name}</span>
              {currentPlayer.isAI && ' (AI)'}
            </Badge>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-2">
            <Sheet open={isPortOpen} onOpenChange={setIsPortOpen}>
              <SheetTrigger asChild>
                <Button
                  ref={portButtonRef}
                  size="sm"
                  className="btn-ocean flex items-center gap-0.5 px-1.5 min-h-[36px] text-[10px] touch-manipulation active:scale-95 sm:gap-2 sm:px-3 sm:min-h-[44px] sm:text-sm"
                >
                  <Anchor className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Harbor Port</span>
                  <span className="sm:hidden">Port</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex h-full w-full max-w-full flex-col overflow-hidden border border-white/20 bg-background/80 p-0 backdrop-blur-xl sm:max-w-5xl [&>button[data-radix-dialog-close]]:hidden"
              >
                <SheetHeader className="flex flex-row items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-left sm:px-6 sm:py-4">
                  <div className="space-y-1 text-left">
                    <SheetTitle className="text-xl font-bold text-primary-glow sm:text-2xl">Harbor Port</SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground sm:text-sm">
                      Safe waters for commerce and rest.
                    </SheetDescription>
                  </div>
                  <SheetClose asChild>
                    <Button
                      ref={sheetCloseRef}
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close Harbor Port</span>
                    </Button>
                  </SheetClose>
                </SheetHeader>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                    <PortBoard
                      className="h-full"
                      gameState={gameState}
                      onAction={onAction}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              size="sm"
              type="button"
              variant="ghost"
              className="min-h-[36px] min-w-[36px] p-1.5 text-white/80 hover:text-white touch-manipulation active:scale-95 sm:min-h-[44px] sm:min-w-[44px] sm:p-2 sm:h-auto sm:w-auto sm:px-3"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  className="min-h-[36px] min-w-[36px] border-white/30 bg-white/5 p-1.5 text-white hover:bg-white/10 touch-manipulation active:scale-95 sm:min-h-[44px] sm:min-w-[44px] sm:p-2 sm:h-auto sm:w-auto sm:px-3"
                >
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
        </div>

        {/* Responsive Board Game Layout - NO SCROLLING */}
        <div className="grid h-full min-h-0 gap-0.5 sm:gap-2 grid-cols-1 md:grid-cols-[minmax(200px,240px),1fr] lg:grid-cols-[minmax(220px,260px),1fr,minmax(220px,280px)] xl:grid-cols-[minmax(240px,280px),1fr,minmax(240px,300px)] overflow-hidden">
          {/* Left Column - Angler Board (Player Board) - Hidden on mobile, shows in Actions panel */}
          <div className="hidden min-h-0 flex-col gap-1 overflow-hidden sm:gap-2 md:flex">
            <AnglerBoard
              player={currentPlayer}
              isCurrentPlayer={isPlayerTurn}
              gameState={gameState}
              onMountFish={handleMountFish}
            />
            <DayTracker
              day={gameState.day}
              phase={gameState.phase}
            />
          </div>

          {/* Center Column - The Briny Deep (Sea Board) */}
          <div className="min-h-0 overflow-hidden rounded-lg border border-white/10 bg-background/60 backdrop-blur sm:rounded-xl">
            <div className="h-full min-h-0 overflow-hidden p-0.5 sm:p-2">
              <SeaBoard
                gameState={gameState}
                selectedShoal={selectedShoal}
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
          <div className="flex min-h-0 flex-col gap-0.5 overflow-hidden rounded-lg border border-white/10 bg-background/50 p-0.5 backdrop-blur sm:gap-2 sm:rounded-xl sm:p-2 lg:flex">
            {/* Show compact player info on mobile/tablet */}
            <div className="md:hidden">
              <AnglerBoard
                player={currentPlayer}
                isCurrentPlayer={isPlayerTurn}
                gameState={gameState}
                onMountFish={handleMountFish}
                compact
              />
            </div>
            <ActionPanel
              gameState={gameState}
              selectedShoal={selectedShoal}
              onAction={onAction}
            />
            {/* Show day tracker on mobile */}
            <div className="md:hidden">
              <DayTracker
                day={gameState.day}
                phase={gameState.phase}
              />
            </div>
          </div>
        </div>
      </div>

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
              <div className="flex items-center justify-center py-6">
                <div className="relative w-32 h-44 rounded-lg bg-gradient-to-br from-cyan-900/50 via-blue-900/60 to-purple-900/50 border-2 border-white/20 flex items-center justify-center shadow-xl">
                  {/* Card back pattern */}
                  <div className="absolute inset-2 rounded opacity-30" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px)'
                  }} />
                  <div className="text-center z-10">
                    <Fish className="h-10 w-10 text-white/50 mx-auto mb-2" />
                    <span className="text-sm text-white/60">???</span>
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
    </div>
    </CardModalProvider>
    </FullscreenContext.Provider>
  );
};
