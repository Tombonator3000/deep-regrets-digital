import { useEffect, useState, useCallback } from 'react';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Anchor,
  ArrowRight,
  Fish,
  HelpCircle,
  Maximize2,
  Minimize2,
  Moon,
  RefreshCw,
  Settings2,
  Sunrise,
  Waves
} from 'lucide-react';
import { LastToPassWarning } from './LastToPassWarning';
import { DeclarationChoice } from './DeclarationChoice';
import { LifePreserverGift } from './LifePreserverGift';
import { LifePreserverUse } from './LifePreserverUse';
import { PassingReward } from './PassingReward';

interface ActionPanelProps {
  gameState: GameState;
  onAction: (action: any) => void;
  onOpenOptions?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

// Phase guidance information
const phaseGuidance: Record<string, { title: string; description: string; icon: React.ReactNode; tips: string[] }> = {
  start: {
    title: 'Startfase',
    description: 'Nye daglige effekter aktiveres. Klikk "Neste Fase" for å fortsette.',
    icon: <Sunrise className="h-4 w-4" />,
    tips: [
      'The Plug eroderer hvis aktiv',
      'Onsdag/Fredag: Can of Worms snur',
      'Torsdag/Lørdag: Gratis Tackle-terning',
    ],
  },
  refresh: {
    title: 'Oppdateringsfase',
    description: 'Alle brukte terninger blir friske igjen. Klikk "Neste Fase" for å fortsette.',
    icon: <RefreshCw className="h-4 w-4" />,
    tips: [
      'Antall friske terninger avhenger av Madness-nivå',
      '0-3 Regrets = 4 terninger maks',
      '13+ Regrets = 8 terninger maks',
    ],
  },
  declaration: {
    title: 'Erklæringsfase',
    description: 'Velg hvor du vil tilbringe dagen: på havet for å fiske, eller i havnen for å handle.',
    icon: <Waves className="h-4 w-4" />,
    tips: [
      '🎣 Havet: Fang fisk, ta risiko, få Regrets',
      '⚓ Havnen: Selg/monter fisk, kjøp oppgraderinger, trygt',
      'Du kan ikke endre valg etter at du har bestemt deg',
    ],
  },
  action: {
    title: 'Handlingsfase',
    description: 'Utfør handlinger på din valgte lokasjon til du er ferdig.',
    icon: <Fish className="h-4 w-4" />,
    tips: [
      'Bruk terninger for å fange fisk',
      'Pass når du er ferdig for dagen',
      'Første som passer får Fish Coin',
    ],
  },
  endgame: {
    title: 'Spillslutt',
    description: 'Spillet er over! Se endelig poengsum.',
    icon: <HelpCircle className="h-4 w-4" />,
    tips: [],
  },
};

// Auto-advance timer duration in milliseconds
const AUTO_ADVANCE_DELAY = 2000;

export const ActionPanel = ({ gameState, onAction, onOpenOptions, onToggleFullscreen, isFullscreen }: ActionPanelProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = !currentPlayer.hasPassed;

  // State for confirmation dialog
  const [pendingLocation, setPendingLocation] = useState<'sea' | 'port' | null>(null);

  // State for auto-advance timer
  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState(0);

  // Calculate if this player is the last active (all others have passed)
  const activePlayers = gameState.players.filter(p => !p.hasPassed);
  const isLastActive = activePlayers.length === 1 && activePlayers[0].id === currentPlayer.id;
  const turnsRemaining = currentPlayer.location === 'sea' ? 2 : 4; // Sea=2, Port=4 turns

  // Find player with pending passing reward (may not be current player)
  const playerWithPendingReward = gameState.pendingPassingReward
    ? gameState.players.find(p => p.id === gameState.pendingPassingReward?.playerId)
    : null;

  const handleNextPhase = useCallback(() => {
    onAction({
      type: 'NEXT_PHASE',
      playerId: 'system',
      payload: {}
    });
  }, [onAction]);

  const handlePass = () => {
    onAction({
      type: 'PASS',
      playerId: currentPlayer.id,
      payload: {}
    });
  };

  const handleDeclareLocation = (location: 'sea' | 'port') => {
    // Show confirmation dialog instead of immediately declaring
    setPendingLocation(location);
  };

  const confirmLocation = () => {
    if (pendingLocation) {
      onAction({
        type: 'DECLARE_LOCATION',
        playerId: currentPlayer.id,
        payload: { location: pendingLocation }
      });
      setPendingLocation(null);
    }
  };

  const cancelLocationChoice = () => {
    setPendingLocation(null);
  };

  // Auto-advance timer for START and REFRESH phases
  useEffect(() => {
    if (gameState.phase !== 'start' && gameState.phase !== 'refresh') {
      setAutoAdvanceProgress(0);
      return;
    }

    // Don't auto-advance if there's a pending reward or other blocking state
    if (gameState.pendingPassingReward || gameState.pendingLifePreserverGift || gameState.pendingDiceRemoval) {
      setAutoAdvanceProgress(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / AUTO_ADVANCE_DELAY) * 100, 100);
      setAutoAdvanceProgress(progress);

      if (elapsed >= AUTO_ADVANCE_DELAY) {
        clearInterval(interval);
        handleNextPhase();
      }
    }, 50);

    return () => {
      clearInterval(interval);
      setAutoAdvanceProgress(0);
    };
  }, [gameState.phase, gameState.pendingPassingReward, gameState.pendingLifePreserverGift, gameState.pendingDiceRemoval, handleNextPhase]);

  const guidance = phaseGuidance[gameState.phase] || phaseGuidance.action;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1 sm:gap-2 min-h-0 overflow-hidden">
        {/* Options and Fullscreen buttons */}
        {(onOpenOptions || onToggleFullscreen) && (
          <div className="flex gap-1 shrink-0">
            {onOpenOptions && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onOpenOptions}
                    className="flex-1 min-h-[32px] sm:min-h-[36px] text-[10px] sm:text-xs border-primary/30 hover:bg-primary/20 touch-manipulation active:scale-95"
                  >
                    <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span>Options</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Åpne innstillinger</p>
                </TooltipContent>
              </Tooltip>
            )}
            {onToggleFullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onToggleFullscreen}
                    className="flex-1 min-h-[32px] sm:min-h-[36px] text-[10px] sm:text-xs border-primary/30 hover:bg-primary/20 touch-manipulation active:scale-95"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Avslutt Fullskjerm</span>
                        <span className="sm:hidden">Avslutt</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Fullskjerm</span>
                        <span className="sm:hidden">Full</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? 'Avslutt fullskjermmodus' : 'Gå til fullskjermmodus'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Compact Phase Banner */}
        <Card className="card-game border-primary/40 bg-primary/5 p-1.5 sm:p-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded bg-primary/20 text-primary">
              {guidance.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold text-primary-glow">{guidance.title}</span>
                <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 py-0">{gameState.day}</Badge>
              </div>
              <p className="text-[10px] sm:text-xs text-foreground/70 truncate">{guidance.description}</p>
            </div>
          </div>
        </Card>

        {/* Life Preserver Gift - Must give away if you have highest dice total */}
        {gameState.pendingLifePreserverGift?.fromPlayerId === currentPlayer.id && (
          <LifePreserverGift
            gameState={gameState}
            currentPlayer={currentPlayer}
            onAction={onAction}
          />
        )}

        {/* Passing Reward - Choose reward when first to pass */}
        {/* Show for any player with pending reward to ensure modal always displays */}
        {playerWithPendingReward && (
          <PassingReward
            gameState={gameState}
            currentPlayer={playerWithPendingReward}
            onAction={onAction}
          />
        )}

        {/* Life Preserver Use - Show options when player owns it */}
        {gameState.lifePreserverOwner === currentPlayer.id && gameState.phase === 'action' && !currentPlayer.hasPassed && (
          <LifePreserverUse
            gameState={gameState}
            currentPlayer={currentPlayer}
            onAction={onAction}
          />
        )}

        {/* Last to Pass Warning */}
        {isLastActive && gameState.phase === 'action' && (
          <LastToPassWarning
            isLastPlayer={true}
            location={currentPlayer.location}
            turnsRemaining={turnsRemaining}
            maxTurns={currentPlayer.location === 'sea' ? 2 : 4}
          />
        )}

        {/* Action Buttons */}
        <Card className="card-game p-1.5 sm:p-2 shrink-0">
          {gameState.phase === 'declaration' && (
            currentPlayer.hasPassed ? (
              // Player has already declared, waiting for others
              <div className="text-center p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-xs sm:text-sm text-primary-glow font-medium">
                  Du har valgt {currentPlayer.location === 'sea' ? '🎣 Havet' : '⚓ Havnen'}
                </p>
                <p className="text-[10px] sm:text-xs text-foreground/70 mt-1">
                  Venter på at andre spillere skal velge...
                </p>
              </div>
            ) : (
              // Player needs to declare
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDeclareLocation('sea')}
                  variant="outline"
                  className="min-h-[40px] sm:min-h-[44px] text-[10px] sm:text-xs touch-manipulation active:scale-95 border-primary/30 hover:bg-blue-600/20 hover:border-blue-500/50"
                >
                  <Waves className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                  Sea
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDeclareLocation('port')}
                  variant="outline"
                  className="min-h-[40px] sm:min-h-[44px] text-[10px] sm:text-xs touch-manipulation active:scale-95 border-primary/30 hover:bg-amber-600/20 hover:border-amber-500/50"
                >
                  <Anchor className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                  Port
                </Button>
              </div>
            )
          )}

          {gameState.phase === 'action' && isPlayerTurn && (
            <Button
              size="sm"
              onClick={handlePass}
              variant="outline"
              className="w-full min-h-[40px] sm:min-h-[44px] btn-phase btn-phase-end border-purple-500/30 text-[10px] sm:text-xs touch-manipulation active:scale-95"
            >
              <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              <span>Avslutt Dagen</span>
            </Button>
          )}

          {(gameState.phase === 'start' || gameState.phase === 'refresh') && (
            <div className="relative">
              <Button
                size="sm"
                onClick={handleNextPhase}
                className={`w-full min-h-[40px] sm:min-h-[44px] btn-phase text-[10px] sm:text-xs touch-manipulation active:scale-95 overflow-hidden ${
                  gameState.phase === 'start' ? 'btn-phase-fishing' : 'btn-ocean'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {gameState.phase === 'start' ? (
                    <>
                      <Sunrise className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Start Dagen</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Forfrisk Terninger</span>
                    </>
                  )}
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
                {/* Auto-advance progress bar */}
                {autoAdvanceProgress > 0 && (
                  <div
                    className="absolute inset-0 bg-white/20 transition-all duration-50"
                    style={{ width: `${autoAdvanceProgress}%` }}
                  />
                )}
              </Button>
              {autoAdvanceProgress > 0 && (
                <p className="text-[9px] text-center text-foreground/60 mt-0.5">
                  Auto-advancing in {Math.ceil((100 - autoAdvanceProgress) / 100 * 2)}s...
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Location-specific actions - scrollable if needed */}
        {gameState.phase === 'action' && isPlayerTurn && (
          <div className="flex-1 min-h-0 overflow-auto space-y-2">
            {/* Port guidance - explain that actions are in the Havnhandlinger modal */}
            {currentPlayer.location === 'port' && (
              <Card className="card-game border-amber-500/40 bg-amber-500/10 p-2 sm:p-3">
                <div className="flex items-start gap-2">
                  <Anchor className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm text-foreground/90">
                    <p className="font-medium text-amber-300">Du er i havnen</p>
                    <p className="text-foreground/70 mt-1">
                      Klikk på <span className="text-primary font-medium">Havnhandlinger</span>-knappen øverst for å selge fisk, kjøpe oppgraderinger og bruke havnetjenester.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Location Confirmation Dialog */}
      <AlertDialog open={pendingLocation !== null} onOpenChange={(open) => !open && cancelLocationChoice()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pendingLocation === 'sea' ? (
                <>
                  <Waves className="h-5 w-5 text-blue-400" />
                  Bekreft Havet
                </>
              ) : (
                <>
                  <Anchor className="h-5 w-5 text-amber-400" />
                  Bekreft Havnen
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Er du sikker på at du vil tilbringe dagen {pendingLocation === 'sea' ? 'på havet' : 'i havnen'}?
              </p>
              <p className="text-xs text-destructive/80">
                Du kan ikke endre valg etter at du har bekreftet!
              </p>
              {pendingLocation === 'sea' && (
                <ul className="text-xs text-foreground/70 list-disc list-inside mt-2">
                  <li>Fang fisk og få belønninger</li>
                  <li>Risiko for Regrets ved overfiske</li>
                  <li>Siste spiller får kun 2 turer</li>
                </ul>
              )}
              {pendingLocation === 'port' && (
                <ul className="text-xs text-foreground/70 list-disc list-inside mt-2">
                  <li>Selg eller monter fisk</li>
                  <li>Kjøp oppgraderinger og terninger</li>
                  <li>Siste spiller får 4 turer</li>
                </ul>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLocationChoice}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLocation}
              className={pendingLocation === 'sea' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}
            >
              Bekreft {pendingLocation === 'sea' ? 'Havet' : 'Havnen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};