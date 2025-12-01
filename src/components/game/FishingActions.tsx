import { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { GameState, Player, FishCard } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { useDiceSelection } from '@/hooks/useDiceSelection';
import { getAbilityDescription } from '@/utils/abilityDescriptions';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { AlertTriangle, Eye, Fish, HelpCircle, Lightbulb, Dices, Bug, ArrowDown, ArrowUp } from 'lucide-react';
import { OverfishingWarning } from './OverfishingWarning';

interface FishingActionsProps {
  gameState: GameState;
  currentPlayer: Player;
  selectedShoal: {depth: number, shoal: number} | null;
  onAction: (action: any) => void;
}

// Calculate effective difficulty with Life Preserver reduction
const getEffectiveDifficulty = (baseDifficulty: number, lifePreserverReduction: number | undefined): number => {
  return Math.max(0, baseDifficulty - (lifePreserverReduction ?? 0));
};

// Get color class for tackle die display
const getTackleDieColorClass = (dieId: string): string => {
  if (dieId.includes('GREEN')) return 'bg-green-600 hover:bg-green-700 border-green-400';
  if (dieId.includes('BLUE')) return 'bg-blue-600 hover:bg-blue-700 border-blue-400';
  return 'bg-orange-600 hover:bg-orange-700 border-orange-400';
};

const getTackleDieSelectedClass = (dieId: string): string => {
  if (dieId.includes('GREEN')) return 'ring-green-400 bg-green-500';
  if (dieId.includes('BLUE')) return 'ring-blue-400 bg-blue-500';
  return 'ring-orange-400 bg-orange-500';
};

export const FishingActions = ({ gameState, currentPlayer, selectedShoal, onAction }: FishingActionsProps) => {
  const {
    availableDiceTotal,
    resetDiceSelection,
    selectedDiceIndices,
    selectedDiceTotal,
    toggleDiceSelection,
  } = useDiceSelection(currentPlayer.freshDice);
  const { toast } = useToast();

  // Tackle dice selection state
  const [selectedTackleDiceIndices, setSelectedTackleDiceIndices] = useState<number[]>([]);

  // Can of Worms state
  const [canOfWormsDialogOpen, setCanOfWormsDialogOpen] = useState(false);
  const [canOfWormsPeekedFish, setCanOfWormsPeekedFish] = useState<{ fish: FishCard; depth: number; shoal: number } | null>(null);

  const toggleTackleDiceSelection = (index: number) => {
    setSelectedTackleDiceIndices((prev) =>
      prev.includes(index)
        ? prev.filter((idx) => idx !== index)
        : [...prev, index]
    );
  };

  const resetAllDiceSelection = () => {
    resetDiceSelection();
    setSelectedTackleDiceIndices([]);
  };

  // Get all unrevealed shoals with fish for Can of Worms
  const getUnrevealedShoalsWithFish = () => {
    const shoals: Array<{ depth: number; shoal: number; fishCount: number }> = [];
    for (let depth = 1; depth <= 3; depth++) {
      const depthShoals = gameState.sea.shoals[depth];
      if (depthShoals) {
        depthShoals.forEach((shoalArray, shoalIndex) => {
          const shoalKey = `${depth}-${shoalIndex}`;
          const isRevealed = gameState.sea.revealedShoals?.[shoalKey] ?? false;
          if (!isRevealed && shoalArray.length > 0) {
            shoals.push({ depth, shoal: shoalIndex, fishCount: shoalArray.length });
          }
        });
      }
    }
    return shoals;
  };

  // Handle Can of Worms peek
  const handleCanOfWormsPeek = (depth: number, shoal: number) => {
    const fish = gameState.sea.shoals[depth]?.[shoal]?.[0];
    if (fish) {
      setCanOfWormsPeekedFish({ fish, depth, shoal });
    }
  };

  // Handle Can of Worms decision
  const handleCanOfWormsDecision = (moveToBottom: boolean) => {
    if (canOfWormsPeekedFish) {
      onAction({
        type: 'USE_CAN_OF_WORMS',
        playerId: currentPlayer.id,
        payload: {
          depth: canOfWormsPeekedFish.depth,
          shoal: canOfWormsPeekedFish.shoal,
          moveToBottom
        }
      });

      toast({
        title: moveToBottom ? "Fisken ble flyttet til bunnen" : "Fisken forblir på toppen",
        description: `Du brukte Can of Worms på ${canOfWormsPeekedFish.fish.name}.`
      });

      setCanOfWormsPeekedFish(null);
      setCanOfWormsDialogOpen(false);
    }
  };

  const closeCanOfWormsDialog = () => {
    setCanOfWormsPeekedFish(null);
    setCanOfWormsDialogOpen(false);
  };

  // Calculate expected tackle dice contribution (average value)
  const selectedTackleDiceExpected = selectedTackleDiceIndices.reduce((sum, index) => {
    const tackleDieId = currentPlayer.tackleDice[index];
    const tackleDie = TACKLE_DICE_LOOKUP[tackleDieId];
    if (tackleDie) {
      const avgValue = tackleDie.faces.reduce((a, b) => a + b, 0) / tackleDie.faces.length;
      return sum + avgValue;
    }
    return sum;
  }, 0);

  // Get tackle dice range (min-max) for selected dice
  const getTackleDiceRange = () => {
    let min = 0;
    let max = 0;
    selectedTackleDiceIndices.forEach((index) => {
      const tackleDieId = currentPlayer.tackleDice[index];
      const tackleDie = TACKLE_DICE_LOOKUP[tackleDieId];
      if (tackleDie) {
        min += Math.min(...tackleDie.faces);
        max += Math.max(...tackleDie.faces);
      }
    });
    return { min, max };
  };

  if (currentPlayer.location !== 'sea') {
    return null;
  }

  // Check if selected shoal has fish and if it's revealed
  const selectedShoalKey = selectedShoal ? `${selectedShoal.depth}-${selectedShoal.shoal}` : null;
  const isShoalRevealed = selectedShoalKey ? (gameState.sea.revealedShoals?.[selectedShoalKey] ?? false) : false;
  const shoalFishCount = selectedShoal ? gameState.sea.shoals[selectedShoal.depth][selectedShoal.shoal].length : 0;
  const shoalHasFish = shoalFishCount > 0;
  const canRevealFish = shoalHasFish && !isShoalRevealed && currentPlayer.freshDice.length > 0;

  // Check for overfishing (last fish in shoal)
  const isLastFishInShoal = shoalFishCount === 1;
  const isAlmostEmpty = shoalFishCount === 2;

  // Only show fish info if the shoal has been revealed (player paid the reveal cost)
  const revealedFish = (selectedShoal && isShoalRevealed)
    ? gameState.sea.shoals[selectedShoal.depth][selectedShoal.shoal][0]
    : null;

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
    if (!revealedFish || !selectedShoal) return;
    // Allow catch attempt with no dice if tackle dice are selected
    if (selectedDiceIndices.length === 0 && selectedTackleDiceIndices.length === 0) return;

    const effectiveDiff = getEffectiveDifficulty(revealedFish.difficulty, gameState.lifePreserverDifficultyReduction);
    const tackleRange = getTackleDiceRange();

    onAction({
      type: 'CATCH_FISH',
      playerId: currentPlayer.id,
      payload: {
        fish: revealedFish,
        depth: selectedShoal.depth,
        shoal: selectedShoal.shoal,
        diceIndices: selectedDiceIndices,
        tackleDiceIndices: selectedTackleDiceIndices.length > 0 ? selectedTackleDiceIndices : undefined
      }
    });

    const totalDiceUsed = selectedDiceIndices.length + selectedTackleDiceIndices.length;
    const minPossible = selectedDiceTotal + tackleRange.min;
    const maxPossible = selectedDiceTotal + tackleRange.max;

    if (minPossible >= effectiveDiff) {
      toast({
        title: "Fish Caught!",
        description: `${currentPlayer.name} spent ${totalDiceUsed} die${totalDiceUsed === 1 ? '' : 's'}${selectedTackleDiceIndices.length > 0 ? ` (inkl. ${selectedTackleDiceIndices.length} tackle)` : ''} to land ${revealedFish.name}.`
      });
    } else if (maxPossible >= effectiveDiff) {
      toast({
        title: "Rolling tackle dice...",
        description: `${currentPlayer.name} needs ${effectiveDiff - selectedDiceTotal} from tackle dice (range: ${tackleRange.min}-${tackleRange.max}).`
      });
    } else {
      toast({
        title: "Catch Failed",
        description: `${currentPlayer.name} fell short (max ${maxPossible}/${effectiveDiff}). A die is spent and a Dink joins the crew.`,
        variant: "destructive"
      });
    }

    resetAllDiceSelection();
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

    resetAllDiceSelection();
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

        {/* Can of Worms - Free peek action */}
        {currentPlayer.canOfWormsFaceUp && (
          <Card className="card-game p-3 border-green-500/40 bg-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-green-400 animate-pulse" />
                <div>
                  <span className="text-sm font-medium text-green-400">Can of Worms klar!</span>
                  <p className="text-xs text-muted-foreground">Gratis kikk på skjult fisk</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setCanOfWormsDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Bruk
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Se på en skjult fisk uten å betale. Du kan velge å flytte den til bunnen av shoalen.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>
        )}

        {/* Can of Worms Dialog */}
        <Dialog open={canOfWormsDialogOpen} onOpenChange={(open) => {
          if (!open) closeCanOfWormsDialog();
          else setCanOfWormsDialogOpen(true);
        }}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-green-500/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Bug className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-green-400">Can of Worms</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    {canOfWormsPeekedFish ? 'Bestem hva du vil gjøre med fisken' : 'Velg en shoal å kikke på'}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {!canOfWormsPeekedFish ? (
              <div className="space-y-4 my-4">
                <p className="text-sm text-foreground/80">
                  Velg en shoal for å se den øverste skjulte fisken. Du kan så velge å flytte den til bunnen av shoalen.
                </p>

                {getUnrevealedShoalsWithFish().length === 0 ? (
                  <Card className="p-4 bg-yellow-900/30 border-yellow-500/40">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Ingen shoals har skjulte fisk akkurat nå.</span>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {getUnrevealedShoalsWithFish().map((shoal) => (
                      <Card
                        key={`${shoal.depth}-${shoal.shoal}`}
                        onClick={() => handleCanOfWormsPeek(shoal.depth, shoal.shoal)}
                        className="p-3 cursor-pointer transition-all hover:scale-[1.02] bg-slate-800/50 hover:bg-slate-700/50 hover:ring-2 hover:ring-green-500/50"
                      >
                        <div className="flex items-center gap-2">
                          <Fish className="h-4 w-4 text-blue-400" />
                          <div>
                            <div className="text-sm font-medium">
                              Dybde {shoal.depth}, Shoal {shoal.shoal + 1}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {shoal.fishCount} fisk{shoal.fishCount > 1 ? 'er' : ''} igjen
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 my-4">
                <p className="text-sm text-foreground/80">
                  Du kikket på shoalen og fant:
                </p>

                <Card className={`p-4 ${
                  canOfWormsPeekedFish.fish.quality === 'fair'
                    ? 'bg-green-900/30 border-green-500/40'
                    : 'bg-red-900/30 border-red-500/40'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fish className={`h-5 w-5 ${
                          canOfWormsPeekedFish.fish.quality === 'fair' ? 'text-green-400' : 'text-red-400'
                        }`} />
                        <span className="font-bold text-lg">{canOfWormsPeekedFish.fish.name}</span>
                      </div>
                      <Badge className={canOfWormsPeekedFish.fish.quality === 'fair' ? 'bg-green-600' : 'bg-red-600'}>
                        {canOfWormsPeekedFish.fish.quality === 'fair' ? 'Fair' : 'Foul'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Verdi:</span>
                        <span className="font-bold text-green-400">${canOfWormsPeekedFish.fish.value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <span className="font-bold text-red-400">{canOfWormsPeekedFish.fish.difficulty}</span>
                      </div>
                    </div>

                    {canOfWormsPeekedFish.fish.abilities.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-xs text-muted-foreground mb-1">Evner:</div>
                        <div className="flex flex-wrap gap-1">
                          {canOfWormsPeekedFish.fish.abilities.map((ability, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {getAbilityDescription(ability)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <p className="text-sm text-foreground/80">
                  Hva vil du gjøre med denne fisken?
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2">
              {!canOfWormsPeekedFish ? (
                <Button variant="ghost" onClick={closeCanOfWormsDialog}>
                  Avbryt
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleCanOfWormsDecision(false)}
                    className="flex-1 border-green-500/50 hover:bg-green-900/30"
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Behold på toppen
                  </Button>
                  <Button
                    onClick={() => handleCanOfWormsDecision(true)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Flytt til bunnen
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reveal Fish */}
        {selectedShoal && shoalHasFish && !isShoalRevealed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRevealFish}
                disabled={!canRevealFish}
                className="w-full min-h-[44px] btn-ocean flex items-center gap-2 touch-manipulation active:scale-95"
              >
                <Eye className="h-4 w-4" />
                Avslør Fisk i Shoal {selectedShoal.shoal + 1}
                {currentPlayer.freshDice.length === 0 && ' (Ingen terninger)'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {currentPlayer.freshDice.length > 0
                ? <p>Koster 1 frisk terning. Se hva som gjemmer seg i denne shoalen.</p>
                : <p>Du trenger minst 1 frisk terning for å avsløre fisken.</p>
              }
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
                    <div className={`rounded p-2 cursor-help ${
                      gameState.lifePreserverDifficultyReduction
                        ? 'bg-yellow-900/30 border border-yellow-500/30'
                        : 'bg-red-900/30'
                    }`}>
                      <span className="text-muted-foreground">Vanskelighetsgrad:</span>
                      {gameState.lifePreserverDifficultyReduction ? (
                        <span className="ml-1">
                          <span className="font-bold text-yellow-400">
                            {getEffectiveDifficulty(revealedFish.difficulty, gameState.lifePreserverDifficultyReduction)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1 line-through">
                            {revealedFish.difficulty}
                          </span>
                        </span>
                      ) : (
                        <span className="ml-1 font-bold text-destructive">{revealedFish.difficulty}</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {gameState.lifePreserverDifficultyReduction ? (
                      <p>Life Preserver aktiv! Vanskelighetsgrad redusert med {gameState.lifePreserverDifficultyReduction}.</p>
                    ) : (
                      <p>Summen av terningene du velger må være ≥ {revealedFish.difficulty} for å fange fisken.</p>
                    )}
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

              {/* Tackle Dice Selection */}
              {currentPlayer.tackleDice.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-primary/20">
                  <div className="flex items-center gap-2">
                    <Dices className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Tackle Dice</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Tackle dice er engangsterninger som rulles når du fanger. De returneres til posen etter bruk.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {currentPlayer.tackleDice.map((tackleDieId, index) => {
                      const tackleDie = TACKLE_DICE_LOOKUP[tackleDieId];
                      const isSelected = selectedTackleDiceIndices.includes(index);
                      const minVal = tackleDie ? Math.min(...tackleDie.faces) : 0;
                      const maxVal = tackleDie ? Math.max(...tackleDie.faces) : 0;
                      return (
                        <Tooltip key={`tackle-${tackleDieId}-${index}`}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => toggleTackleDiceSelection(index)}
                              className={`
                                relative flex flex-col items-center justify-center
                                min-h-[50px] p-2
                                rounded-lg text-sm font-bold
                                touch-manipulation select-none
                                transition-all duration-150
                                active:scale-90 border-2
                                ${isSelected
                                  ? `ring-2 ring-offset-2 ring-offset-background shadow-lg scale-105 ${getTackleDieSelectedClass(tackleDieId)}`
                                  : `${getTackleDieColorClass(tackleDieId)} hover:opacity-80`
                                }
                              `}
                              aria-pressed={isSelected}
                              aria-label={`${tackleDie?.name || 'Tackle Die'}, range ${minVal}-${maxVal}, ${isSelected ? 'selected' : 'not selected'}`}
                            >
                              <span className="text-white text-xs">{minVal}-{maxVal}</span>
                              {isSelected && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-black">
                                  ✓
                                </span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{tackleDie?.name}</p>
                            <p className="text-xs">Verdier: [{tackleDie?.faces.join(', ')}]</p>
                            <p className="text-xs text-muted-foreground">Returneres til posen etter bruk</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                  {selectedTackleDiceIndices.length > 0 && (
                    <p className="text-xs text-amber-400/80">
                      {selectedTackleDiceIndices.length} tackle die{selectedTackleDiceIndices.length > 1 ? 's' : ''} valgt (range: +{getTackleDiceRange().min}-{getTackleDiceRange().max})
                    </p>
                  )}
                </div>
              )}

              {/* Progress indicator */}
              {(() => {
                const effectiveDifficulty = getEffectiveDifficulty(revealedFish.difficulty, gameState.lifePreserverDifficultyReduction);
                const tackleRange = getTackleDiceRange();
                const minTotal = selectedDiceTotal + tackleRange.min;
                const maxTotal = selectedDiceTotal + tackleRange.max;
                const guaranteedSuccess = minTotal >= effectiveDifficulty;
                const possibleSuccess = maxTotal >= effectiveDifficulty;
                const hasTackleDice = selectedTackleDiceIndices.length > 0;

                return (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Valgt sum:</span>
                      <span className={`font-bold ${guaranteedSuccess ? 'text-green-400' : possibleSuccess ? 'text-amber-400' : 'text-primary-glow'}`}>
                        {hasTackleDice ? (
                          <>
                            {minTotal === maxTotal ? minTotal : `${minTotal}-${maxTotal}`} / {effectiveDifficulty}
                          </>
                        ) : (
                          <>{selectedDiceTotal} / {effectiveDifficulty}</>
                        )}
                        {gameState.lifePreserverDifficultyReduction && (
                          <span className="text-xs text-yellow-400 ml-1">(LP -2)</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden relative">
                      {/* Show range for tackle dice */}
                      {hasTackleDice && minTotal !== maxTotal && (
                        <div
                          className="absolute h-full bg-amber-500/30 transition-all"
                          style={{
                            left: `${Math.min(100, (minTotal / Math.max(1, effectiveDifficulty)) * 100)}%`,
                            width: `${Math.min(100 - (minTotal / Math.max(1, effectiveDifficulty)) * 100, ((maxTotal - minTotal) / Math.max(1, effectiveDifficulty)) * 100)}%`
                          }}
                        />
                      )}
                      <div
                        className={`h-full transition-all ${guaranteedSuccess ? 'bg-green-500' : possibleSuccess ? 'bg-amber-500' : gameState.lifePreserverDifficultyReduction ? 'bg-yellow-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min(100, (minTotal / Math.max(1, effectiveDifficulty)) * 100)}%` }}
                      />
                    </div>
                    {guaranteedSuccess && (
                      <p className="text-xs text-green-400">✓ Nok til å fange!</p>
                    )}
                    {!guaranteedSuccess && possibleSuccess && (
                      <p className="text-xs text-amber-400">
                        Mulig fangst! Tackle dice må rulle {effectiveDifficulty - selectedDiceTotal}+ (range: {tackleRange.min}-{tackleRange.max})
                      </p>
                    )}
                    {!possibleSuccess && (selectedDiceTotal > 0 || hasTackleDice) && (
                      <p className="text-xs text-muted-foreground">
                        Trenger {effectiveDifficulty - maxTotal} mer
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Overfishing Warning */}
              {(isLastFishInShoal || isAlmostEmpty) && (
                <OverfishingWarning
                  shoalFishCount={shoalFishCount}
                  isLastFish={isLastFishInShoal}
                />
              )}

              {(() => {
                const effectiveDiff = getEffectiveDifficulty(revealedFish.difficulty, gameState.lifePreserverDifficultyReduction);
                const tackleRange = getTackleDiceRange();
                const minTotal = selectedDiceTotal + tackleRange.min;
                const maxTotal = selectedDiceTotal + tackleRange.max;
                const guaranteedSuccess = minTotal >= effectiveDiff;
                const possibleSuccess = maxTotal >= effectiveDiff;
                const hasAnyDiceSelected = selectedDiceIndices.length > 0 || selectedTackleDiceIndices.length > 0;

                return (
                  <div className="grid gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleCatchFish}
                          disabled={!hasAnyDiceSelected}
                          className={`w-full min-h-[44px] touch-manipulation active:scale-95 ${
                            guaranteedSuccess
                              ? 'bg-green-600 hover:bg-green-700'
                              : possibleSuccess
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'btn-ocean'
                          }`}
                        >
                          <Fish className="h-4 w-4 mr-2" />
                          {selectedTackleDiceIndices.length > 0 ? (
                            possibleSuccess && !guaranteedSuccess
                              ? 'Prøv å Fange (Gamble!)'
                              : 'Fang Fisken'
                          ) : (
                            'Fang Fisken'
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {guaranteedSuccess
                          ? 'Du har nok - klikk for å fange!'
                          : possibleSuccess
                            ? `Sjanse for fangst! Trenger ${effectiveDiff - selectedDiceTotal} fra tackle dice (range: ${tackleRange.min}-${tackleRange.max})`
                            : !hasAnyDiceSelected
                              ? 'Velg terninger først'
                              : `Du trenger ${effectiveDiff - maxTotal} mer for å lykkes`}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handlePassOnFish}
                          variant="outline"
                          className="w-full min-h-[44px] border-dashed border-destructive/40 text-destructive text-xs touch-manipulation active:scale-95"
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
                );
              })()}
            </div>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};