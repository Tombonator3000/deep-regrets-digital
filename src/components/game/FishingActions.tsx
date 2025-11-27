import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GameState, Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { useDiceSelection } from '@/hooks/useDiceSelection';
import { getAbilityDescription } from '@/utils/abilityDescriptions';
import { AlertTriangle, ArrowDown, Eye, Fish, HelpCircle, Lightbulb } from 'lucide-react';

interface FishingActionsProps {
  gameState: GameState;
  currentPlayer: Player;
  selectedShoal: {depth: number, shoal: number} | null;
  onAction: (action: any) => void;
}

export const FishingActions = ({ gameState, currentPlayer, selectedShoal, onAction }: FishingActionsProps) => {
  const {
    availableDiceTotal,
    resetDiceSelection,
    selectedDiceIndices,
    selectedDiceTotal,
    toggleDiceSelection,
  } = useDiceSelection(currentPlayer.freshDice);
  const { toast } = useToast();

  if (currentPlayer.location !== 'sea') {
    return null;
  }

  const canMoveDeeper = currentPlayer.currentDepth < 3;
  const canRevealFish = selectedShoal && gameState.sea.shoals[selectedShoal.depth][selectedShoal.shoal].length > 0;
  const revealedFish = selectedShoal ? gameState.sea.shoals[selectedShoal.depth][selectedShoal.shoal][0] : null;
  const handleMoveDeeper = () => {
    if (canMoveDeeper) {
      onAction({
        type: 'MOVE_DEEPER',
        playerId: currentPlayer.id,
        payload: { newDepth: currentPlayer.currentDepth + 1 }
      });
      toast({
        title: "Descending",
        description: `${currentPlayer.name} descends to depth ${currentPlayer.currentDepth + 1}`,
      });
    }
  };

  const handleRevealFish = () => {
    if (selectedShoal && canRevealFish) {
      onAction({
        type: 'REVEAL_FISH',
        playerId: currentPlayer.id,
        payload: { depth: selectedShoal.depth, shoal: selectedShoal.shoal }
      });
      toast({
        title: "Fish Revealed",
        description: "A mysterious creature emerges from the depths...",
      });
    }
  };

  const handleCatchFish = () => {
    if (!revealedFish || !selectedShoal || selectedDiceIndices.length === 0) return;

    onAction({
      type: 'CATCH_FISH',
      playerId: currentPlayer.id,
      payload: {
        fish: revealedFish,
        depth: selectedShoal.depth,
        shoal: selectedShoal.shoal,
        diceIndices: selectedDiceIndices
      }
    });

    if (selectedDiceTotal >= revealedFish.difficulty) {
      toast({
        title: "Fish Caught!",
        description: `${currentPlayer.name} spent ${selectedDiceIndices.length} die${selectedDiceIndices.length === 1 ? '' : 's'} (total ${selectedDiceTotal}) to land ${revealedFish.name}.`
      });
    } else {
      toast({
        title: "Catch Failed",
        description: `${currentPlayer.name} fell short (${selectedDiceTotal}/${revealedFish.difficulty}). A die is spent and a Dink joins the crew.`,
        variant: "destructive"
      });
    }

    resetDiceSelection();
  };

  const handlePassOnFish = () => {
    if (!revealedFish || !selectedShoal) return;

    onAction({
      type: 'CATCH_FISH',
      playerId: currentPlayer.id,
      payload: {
        fish: revealedFish,
        depth: selectedShoal.depth,
        shoal: selectedShoal.shoal,
        diceIndices: []
      }
    });

    toast({
      title: "Passed on the Catch",
      description: `${currentPlayer.name} takes the mandatory Dink penalty for skipping ${revealedFish.name}.`
    });

    resetDiceSelection();
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Sea Actions Header with Tips */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary-glow flex items-center gap-2">
            <Fish className="h-5 w-5" />
            Havhandlinger
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-semibold mb-1">Hvordan fiske:</p>
              <ol className="text-xs space-y-1 list-decimal list-inside">
                <li>Klikk på en shoal for å velge den</li>
                <li>Avslør fisken (koster 1 terning)</li>
                <li>Velg terninger for å fange (sum ≥ vanskelighetsgrad)</li>
              </ol>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Current Depth Info */}
        <Card className="card-game p-3 bg-blue-900/20 border-blue-500/30">
          <div className="flex items-center justify-between text-sm">
            <span>Nåværende dybde:</span>
            <Badge className="bg-blue-600">
              Dybde {currentPlayer.currentDepth}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentPlayer.currentDepth === 1 && "Grunt vann - enkel fisk, lav risiko"}
            {currentPlayer.currentDepth === 2 && "Middels dyp - mer verdifull fisk, moderat risiko"}
            {currentPlayer.currentDepth === 3 && "Dypet - sjelden fisk, høy risiko og belønning"}
          </p>
        </Card>

        {/* Move Deeper */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleMoveDeeper}
              disabled={!canMoveDeeper}
              className="w-full btn-ocean flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              {canMoveDeeper
                ? `Dykk til Dybde ${currentPlayer.currentDepth + 1}`
                : "Maks Dybde Nådd"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canMoveDeeper ? (
              <p>Gå dypere for å finne mer verdifull fisk. Krever en terning med verdi ≥3.</p>
            ) : (
              <p>Du er allerede på dypeste nivå (Dybde 3).</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Reveal Fish */}
        {selectedShoal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRevealFish}
                disabled={!canRevealFish}
                className="w-full btn-ocean flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Avslør Fisk i Shoal {selectedShoal.shoal + 1}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Koster 1 frisk terning. Se hva som gjemmer seg i denne shoalen.</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* No shoal selected hint */}
        {!selectedShoal && (
          <Card className="card-game p-3 border-dashed border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span>Klikk på en shoal i havet for å velge den</span>
            </div>
          </Card>
        )}

        {/* Revealed Fish */}
        {revealedFish && (
          <Card className="card-game p-4 border-primary/50">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-primary-glow">{revealedFish.name}</h4>
                <Badge variant="outline" className="border-primary/30">
                  Dybde {revealedFish.depth}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded bg-green-900/30 p-2 cursor-help">
                      <span className="text-muted-foreground">Verdi:</span>
                      <span className="ml-1 font-bold text-green-400">{revealedFish.value}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Poeng du får hvis du fanger denne fisken. Justeres av Madness-modifier.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded bg-red-900/30 p-2 cursor-help">
                      <span className="text-muted-foreground">Vanskelighetsgrad:</span>
                      <span className="ml-1 font-bold text-destructive">{revealedFish.difficulty}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Summen av terningene du velger må være ≥ {revealedFish.difficulty} for å fange fisken.</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-xs text-muted-foreground">{revealedFish.description}</p>

              {revealedFish.quality === 'foul' && (
                <div className="flex items-center gap-2 rounded bg-destructive/20 p-2 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Foul fisk - kan gi Regrets!</span>
                </div>
              )}

              {revealedFish.abilities.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">Evner:</p>
                  <div className="flex flex-wrap gap-1">
                    {revealedFish.abilities.map((ability, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={`text-xs ${
                          ability.includes('regret') || ability.includes('madness')
                            ? 'bg-destructive/20 text-destructive'
                            : ''
                        }`}
                      >
                        {getAbilityDescription(ability)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Dice Selection for Fishing */}
        {revealedFish && currentPlayer.freshDice.length > 0 && (
          <Card className="card-game p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Velg Terninger for å Fange</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Klikk på terninger for å velge dem. Summen må være ≥ vanskelighetsgraden.</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-xs text-muted-foreground">
                Du har {currentPlayer.freshDice.length} frisk{currentPlayer.freshDice.length === 1 ? '' : 'e'} terning{currentPlayer.freshDice.length === 1 ? '' : 'er'} (sum {availableDiceTotal}).
                Bruk bare det du trenger—ubrukte terninger forblir friske.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {currentPlayer.freshDice.map((dieValue, index) => {
                  const isSelected = selectedDiceIndices.includes(index);
                  return (
                    <Tooltip key={`${dieValue}-${index}`}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => toggleDiceSelection(index)}
                          className={`
                            relative flex items-center justify-center
                            min-h-[56px] min-w-[56px] p-3
                            rounded-xl text-xl font-bold
                            touch-manipulation select-none
                            transition-all duration-150
                            active:scale-90
                            ${isSelected 
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-105' 
                              : 'bg-card border-2 border-primary/30 hover:border-primary hover:bg-primary/10'
                            }
                          `}
                          aria-pressed={isSelected}
                          aria-label={`Die value ${dieValue}, ${isSelected ? 'selected' : 'not selected'}`}
                        >
                          <span className="text-2xl">🎲</span>
                          <span className="ml-1">{dieValue}</span>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                              ✓
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isSelected ? 'Tap to deselect' : 'Tap to select'}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Progress indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Valgt sum:</span>
                  <span className={`font-bold ${selectedDiceTotal >= revealedFish.difficulty ? 'text-green-400' : 'text-primary-glow'}`}>
                    {selectedDiceTotal} / {revealedFish.difficulty}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden">
                  <div
                    className={`h-full transition-all ${selectedDiceTotal >= revealedFish.difficulty ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, (selectedDiceTotal / revealedFish.difficulty) * 100)}%` }}
                  />
                </div>
                {selectedDiceTotal >= revealedFish.difficulty && (
                  <p className="text-xs text-green-400">✓ Nok til å fange!</p>
                )}
                {selectedDiceTotal > 0 && selectedDiceTotal < revealedFish.difficulty && (
                  <p className="text-xs text-muted-foreground">
                    Trenger {revealedFish.difficulty - selectedDiceTotal} mer
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCatchFish}
                      disabled={selectedDiceIndices.length === 0}
                      className={`w-full ${selectedDiceTotal >= revealedFish.difficulty ? 'bg-green-600 hover:bg-green-700' : 'btn-ocean'}`}
                    >
                      <Fish className="h-4 w-4 mr-2" />
                      Fang Fisken
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedDiceTotal >= revealedFish.difficulty
                      ? 'Du har nok - klikk for å fange!'
                      : selectedDiceIndices.length === 0
                        ? 'Velg terninger først'
                        : `Du trenger ${revealedFish.difficulty - selectedDiceTotal} mer for å lykkes`}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handlePassOnFish}
                      variant="outline"
                      className="w-full border-dashed border-destructive/40 text-destructive text-xs"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Pass på Fisken (Mist 1 terning + trekk Dink)
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hopp over denne fisken. Du mister 1 terning og trekker et Dink-kort som straff.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};