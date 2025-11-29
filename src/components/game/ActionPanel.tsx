import { useMemo } from 'react';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { FishingActions } from './FishingActions';
import { PortActions } from './PortActions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Anchor,
  Fish,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Sunrise,
  Waves
} from 'lucide-react';
import { FishingWizard, getFishingStep } from './FishingWizard';
import { LastToPassWarning } from './LastToPassWarning';
import { DeclarationChoice } from './DeclarationChoice';
import { CanOfWormsStatus } from './CanOfWormsPeek';

interface ActionPanelProps {
  gameState: GameState;
  selectedShoal: {depth: number, shoal: number} | null;
  onAction: (action: any) => void;
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

export const ActionPanel = ({ gameState, selectedShoal, onAction }: ActionPanelProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = !currentPlayer.hasPassed;

  // Calculate if this player is the last active (all others have passed)
  const activePlayers = gameState.players.filter(p => !p.hasPassed);
  const isLastActive = activePlayers.length === 1 && activePlayers[0].id === currentPlayer.id;
  const turnsRemaining = currentPlayer.location === 'sea' ? 2 : 4; // Sea=2, Port=4 turns

  // Calculate fishing step for the wizard
  const selectedShoalKey = selectedShoal ? `${selectedShoal.depth}-${selectedShoal.shoal}` : null;
  const isShoalRevealed = selectedShoalKey ? (gameState.sea.revealedShoals?.[selectedShoalKey] ?? false) : false;
  const revealedFish = useMemo(() => {
    if (!selectedShoal || !isShoalRevealed) return null;
    const shoalFish = gameState.sea.shoals[selectedShoal.depth]?.[selectedShoal.shoal];
    return shoalFish?.[0] || null;
  }, [selectedShoal, isShoalRevealed, gameState.sea.shoals]);

  const fishingStep = getFishingStep(
    selectedShoal,
    isShoalRevealed,
    revealedFish,
    currentPlayer.currentDepth,
    revealedFish?.depth
  );

  // Check Can of Worms status
  const hasCanOfWorms = currentPlayer.canOfWorms?.isActive ?? false;
  const canOfWormsUsed = currentPlayer.canOfWorms?.isUsed ?? false;

  const handleNextPhase = () => {
    onAction({
      type: 'NEXT_PHASE',
      playerId: 'system',
      payload: {}
    });
  };

  const handlePass = () => {
    onAction({
      type: 'PASS',
      playerId: currentPlayer.id,
      payload: {}
    });
  };

  const handleDeclareLocation = (location: 'sea' | 'port') => {
    onAction({
      type: 'DECLARE_LOCATION',
      playerId: currentPlayer.id,
      payload: { location }
    });
  };

  const guidance = phaseGuidance[gameState.phase] || phaseGuidance.action;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1 sm:gap-2 min-h-0 overflow-hidden">
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

        {/* Compact Player Status - Hidden on mobile as it's in AnglerBoard compact */}
        <Card className="card-game p-1.5 sm:p-2 shrink-0 hidden sm:block">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-glow">{currentPlayer.name}</span>
            <div className="flex items-center gap-2">
              <CanOfWormsStatus isAvailable={hasCanOfWorms} isUsed={canOfWormsUsed} />
              <Badge className={`text-[10px] ${currentPlayer.location === 'sea' ? 'bg-blue-600' : 'bg-amber-600'}`}>
                {currentPlayer.location === 'sea' ? `Sea D${currentPlayer.currentDepth}` : 'Port'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Last to Pass Warning */}
        {isLastActive && gameState.phase === 'action' && (
          <LastToPassWarning
            location={currentPlayer.location}
            turnsRemaining={turnsRemaining}
            isUrgent={turnsRemaining <= 1}
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
            <Button size="sm" onClick={handlePass} variant="outline" className="w-full min-h-[40px] sm:min-h-[44px] border-primary/30 text-[10px] sm:text-xs touch-manipulation active:scale-95">
              Pass (End Day)
            </Button>
          )}

          {(gameState.phase === 'start' || gameState.phase === 'refresh') && (
            <Button size="sm" onClick={handleNextPhase} className="w-full min-h-[40px] sm:min-h-[44px] btn-ocean text-[10px] sm:text-xs touch-manipulation active:scale-95">
              Next Phase →
            </Button>
          )}
        </Card>

        {/* Location-specific actions - scrollable if needed */}
        {gameState.phase === 'action' && isPlayerTurn && (
          <div className="flex-1 min-h-0 overflow-auto space-y-2">
            {/* Fishing Wizard - shows step progress when at sea */}
            {currentPlayer.location === 'sea' && selectedShoal && (
              <FishingWizard
                currentStep={fishingStep}
                canDescend={revealedFish ? revealedFish.depth > currentPlayer.currentDepth : false}
                hasTriggerAbility={revealedFish?.abilities?.some(a => a.includes('reveal')) || false}
              />
            )}
            <FishingActions
              gameState={gameState}
              currentPlayer={currentPlayer}
              selectedShoal={selectedShoal}
              onAction={onAction}
            />
            <PortActions
              gameState={gameState}
              currentPlayer={currentPlayer}
              onAction={onAction}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};