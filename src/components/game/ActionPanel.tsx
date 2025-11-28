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
      <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
        {/* Compact Phase Banner */}
        <Card className="card-game border-primary/40 bg-primary/5 p-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
              {guidance.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary-glow">{guidance.title}</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0">{gameState.day}</Badge>
              </div>
              <p className="text-xs text-foreground/70 truncate">{guidance.description}</p>
            </div>
          </div>
        </Card>

        {/* Compact Player Status */}
        <Card className="card-game p-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-glow">{currentPlayer.name}</span>
            <Badge className={`text-[10px] ${currentPlayer.location === 'sea' ? 'bg-blue-600' : 'bg-amber-600'}`}>
              {currentPlayer.location === 'sea' ? `Sea D${currentPlayer.currentDepth}` : 'Port'}
            </Badge>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="card-game p-2 shrink-0">
          {gameState.phase === 'declaration' && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => handleDeclareLocation('sea')}
                variant={currentPlayer.location === 'sea' ? "default" : "outline"}
                className={`min-h-[44px] text-xs touch-manipulation active:scale-95 ${currentPlayer.location === 'sea' ? "btn-ocean" : "border-primary/30"}`}
              >
                <Waves className="h-4 w-4 mr-1" />
                Sea
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeclareLocation('port')}
                variant={currentPlayer.location === 'port' ? "default" : "outline"}
                className={`min-h-[44px] text-xs touch-manipulation active:scale-95 ${currentPlayer.location === 'port' ? "btn-ocean" : "border-primary/30"}`}
              >
                <Anchor className="h-4 w-4 mr-1" />
                Port
              </Button>
            </div>
          )}

          {gameState.phase === 'action' && isPlayerTurn && (
            <Button size="sm" onClick={handlePass} variant="outline" className="w-full min-h-[44px] border-primary/30 text-xs touch-manipulation active:scale-95">
              Pass (End Day)
            </Button>
          )}

          {(gameState.phase === 'start' || gameState.phase === 'refresh') && (
            <Button size="sm" onClick={handleNextPhase} className="w-full min-h-[44px] btn-ocean text-xs touch-manipulation active:scale-95">
              Next Phase →
            </Button>
          )}
        </Card>

        {/* Location-specific actions - scrollable if needed */}
        {gameState.phase === 'action' && isPlayerTurn && (
          <div className="flex-1 min-h-0 overflow-auto">
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