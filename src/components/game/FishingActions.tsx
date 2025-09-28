import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState, Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface FishingActionsProps {
  gameState: GameState;
  currentPlayer: Player;
  selectedShoal: {depth: number, shoal: number} | null;
  onAction: (action: any) => void;
}

export const FishingActions = ({ gameState, currentPlayer, selectedShoal, onAction }: FishingActionsProps) => {
  const [selectedDice, setSelectedDice] = useState<number[]>([]);
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
    if (!revealedFish || !selectedShoal || selectedDice.length === 0) return;

    const totalDiceValue = selectedDice.reduce((sum, val) => sum + val, 0);
    
    if (totalDiceValue >= revealedFish.difficulty) {
      onAction({
        type: 'CATCH_FISH',
        playerId: currentPlayer.id,
        payload: {
          fish: revealedFish,
          diceUsed: selectedDice,
          depth: selectedShoal.depth,
          shoal: selectedShoal.shoal
        }
      });
      toast({
        title: "Fish Caught!",
        description: `${currentPlayer.name} caught ${revealedFish.name}!`,
      });
      setSelectedDice([]);
    } else {
      toast({
        title: "Failed to Catch",
        description: `Need ${revealedFish.difficulty} but only have ${totalDiceValue}`,
        variant: "destructive"
      });
    }
  };

  const toggleDiceSelection = (dieValue: number, index: number) => {
    const dieId = `${dieValue}-${index}`;
    if (selectedDice.includes(dieValue)) {
      setSelectedDice(selectedDice.filter(val => val !== dieValue));
    } else {
      setSelectedDice([...selectedDice, dieValue]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-glow">Sea Actions</h3>
      
      {/* Move Deeper */}
      <Button 
        onClick={handleMoveDeeper}
        disabled={!canMoveDeeper}
        className="w-full btn-ocean"
      >
        Descend to Depth {currentPlayer.currentDepth + 1}
        {!canMoveDeeper && " (Max Depth)"}
      </Button>

      {/* Reveal Fish */}
      {selectedShoal && (
        <Button 
          onClick={handleRevealFish}
          disabled={!canRevealFish}
          className="w-full btn-ocean"
        >
          Reveal Fish in Shoal {selectedShoal.shoal + 1}
        </Button>
      )}

      {/* Revealed Fish */}
      {revealedFish && (
        <Card className="card-game p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-primary-glow">{revealedFish.name}</h4>
              <Badge variant="outline" className="border-primary/30">
                Depth {revealedFish.depth}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Value: <span className="text-primary-glow">{revealedFish.value}</span></div>
              <div>Difficulty: <span className="text-destructive">{revealedFish.difficulty}</span></div>
            </div>
            
            <p className="text-xs text-muted-foreground">{revealedFish.description}</p>
            
            {revealedFish.abilities.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Abilities:</p>
                {revealedFish.abilities.map((ability, index) => (
                  <Badge key={index} variant="secondary" className="text-xs mr-1">
                    {ability}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Dice Selection for Fishing */}
      {revealedFish && currentPlayer.freshDice.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Select Dice to Catch Fish</h4>
          <div className="grid grid-cols-3 gap-2">
            {currentPlayer.freshDice.map((dieValue, index) => (
              <Button
                key={`${dieValue}-${index}`}
                variant={selectedDice.includes(dieValue) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDiceSelection(dieValue, index)}
                className={selectedDice.includes(dieValue) ? "btn-ocean" : "border-primary/30"}
              >
                {dieValue}
              </Button>
            ))}
          </div>
          
          <div className="text-sm">
            Total: <span className="text-primary-glow font-bold">
              {selectedDice.reduce((sum, val) => sum + val, 0)}
            </span>
            {revealedFish && (
              <span className="text-muted-foreground">
                / {revealedFish.difficulty} needed
              </span>
            )}
          </div>
          
          <Button
            onClick={handleCatchFish}
            disabled={selectedDice.length === 0 || selectedDice.reduce((sum, val) => sum + val, 0) < revealedFish.difficulty}
            className="w-full btn-ocean"
          >
            Catch Fish
          </Button>
        </div>
      )}
    </div>
  );
};