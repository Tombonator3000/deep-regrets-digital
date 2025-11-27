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
      <div className="space-y-4">
        {/* Phase Guidance Banner */}
        <Card className="card-game border-primary/40 bg-primary/5 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                {guidance.icon}
              </div>
              <div>
                <h3 className="font-semibold text-primary-glow">{guidance.title}</h3>
                <Badge variant="outline" className="text-xs">
                  Dag: {gameState.day}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-foreground/90">{guidance.description}</p>
            {guidance.tips.length > 0 && (
              <div className="rounded-md bg-black/20 p-2">
                <div className="flex items-center gap-1 text-xs font-medium text-primary mb-1">
                  <Lightbulb className="h-3 w-3" />
                  Tips
                </div>
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {guidance.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Player Status */}
        <Card className="card-game p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-primary-glow">
                {currentPlayer.name}
              </div>
              <Badge className={currentPlayer.location === 'sea' ? 'bg-blue-600' : 'bg-amber-600'}>
                {currentPlayer.location === 'sea' ? (
                  <><Waves className="h-3 w-3 mr-1" /> Hav (Dybde {currentPlayer.currentDepth})</>
                ) : (
                  <><Anchor className="h-3 w-3 mr-1" /> Havn</>
                )}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded bg-black/20 p-2">
                <span className="text-muted-foreground">Fishbucks:</span>
                <span className="ml-1 font-semibold text-fishbuck">{currentPlayer.fishbucks}</span>
              </div>
              <div className="rounded bg-black/20 p-2">
                <span className="text-muted-foreground">Terninger:</span>
                <span className="ml-1 font-semibold text-primary">{currentPlayer.freshDice.length}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="card-game p-4">
          <div className="space-y-3">
            {gameState.phase === 'declaration' && (
              <>
                <p className="text-sm font-medium text-foreground">Velg din destinasjon for dagen:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleDeclareLocation('sea')}
                        variant={currentPlayer.location === 'sea' ? "default" : "outline"}
                        className={`flex flex-col h-auto py-3 ${currentPlayer.location === 'sea' ? "btn-ocean" : "border-primary/30"}`}
                      >
                        <Waves className="h-5 w-5 mb-1" />
                        <span className="font-semibold">Gå til Havet</span>
                        <span className="text-xs opacity-80">Fisk og ta risiko</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-semibold">Havet</p>
                      <p className="text-xs">Fang fisk ved å bruke terninger. Dypere fisk gir mer poeng men er vanskeligere. Pass på Regrets!</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleDeclareLocation('port')}
                        variant={currentPlayer.location === 'port' ? "default" : "outline"}
                        className={`flex flex-col h-auto py-3 ${currentPlayer.location === 'port' ? "btn-ocean" : "border-primary/30"}`}
                      >
                        <Anchor className="h-5 w-5 mb-1" />
                        <span className="font-semibold">Gå til Havnen</span>
                        <span className="text-xs opacity-80">Handle trygt</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-semibold">Havnen</p>
                      <p className="text-xs">Selg fisk, monter trofeer, kjøp oppgraderinger. Ingen risiko for Regrets her!</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}

            {gameState.phase === 'action' && isPlayerTurn && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handlePass} variant="outline" className="w-full border-primary/30">
                    Pass (Avslutt Dagen)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Avslutt din tur for dagen. Første som passer får Fish Coin!</p>
                </TooltipContent>
              </Tooltip>
            )}

            {(gameState.phase === 'start' || gameState.phase === 'refresh') && (
              <Button onClick={handleNextPhase} className="w-full btn-ocean">
                Neste Fase →
              </Button>
            )}
          </div>
        </Card>

        {/* Location-specific actions */}
        {gameState.phase === 'action' && isPlayerTurn && (
          <>
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
          </>
        )}

        {selectedShoal && (
          <Card className="card-game p-3">
            <p className="text-sm">
              <strong>Valgt:</strong> Dybde {selectedShoal.depth}, Shoal {selectedShoal.shoal + 1}
            </p>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};