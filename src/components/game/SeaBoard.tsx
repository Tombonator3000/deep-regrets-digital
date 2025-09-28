import { GameState, FishCard } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SeaBoardProps {
  gameState: GameState;
  selectedShoal: {depth: number, shoal: number} | null;
  onShoalSelect: (shoal: {depth: number, shoal: number}) => void;
  onAction: (action: any) => void;
}

export const SeaBoard = ({ gameState, selectedShoal, onShoalSelect, onAction }: SeaBoardProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  const handleRevealFish = (depth: number, shoal: number) => {
    onAction({
      type: 'REVEAL_FISH',
      playerId: currentPlayer.id,
      payload: { depth, shoal }
    });
  };

  const handleCatchFish = (fish: FishCard, depth: number, shoal: number) => {
    onAction({
      type: 'CATCH_FISH',
      playerId: currentPlayer.id,
      payload: { fish, depth, shoal }
    });
  };

  const handleDescend = (targetDepth: number) => {
    onAction({
      type: 'DESCEND',
      playerId: currentPlayer.id,
      payload: { targetDepth }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-glow mb-2">The Deep Sea</h2>
        <p className="text-muted-foreground">Current Depth: <span className="text-primary font-bold">{currentPlayer.currentDepth}</span></p>
        {gameState.sea.plugActive && (
          <p className="text-destructive font-bold animate-regret-pulse">⚠️ The Plug is active - Erosion in progress!</p>
        )}
      </div>

      {/* Depth Controls */}
      {currentPlayer.location === 'sea' && (
        <div className="flex justify-center space-x-4 mb-6">
          {[1, 2, 3].map((depth) => (
            <Button
              key={depth}
              variant={currentPlayer.currentDepth === depth ? "default" : "outline"}
              onClick={() => depth > currentPlayer.currentDepth && handleDescend(depth)}
              disabled={depth < currentPlayer.currentDepth || currentPlayer.hasPassed}
              className={`${
                currentPlayer.currentDepth === depth 
                  ? 'btn-ocean' 
                  : depth > currentPlayer.currentDepth
                    ? 'border-primary/50 hover:border-primary'
                    : 'opacity-50'
              }`}
            >
              Depth {depth}
              {depth > currentPlayer.currentDepth && (
                <span className="ml-2 text-xs">({(depth - currentPlayer.currentDepth) * 3} dice)</span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Shoals Grid for each depth */}
      {[1, 2, 3].map((depth) => (
        <div key={depth} className="space-y-4">
          <h3 className={`text-lg font-bold ${
            depth === 1 ? 'text-sea-shallow' :
            depth === 2 ? 'text-sea-medium' : 'text-sea-deep'
          }`}>
            Depth {depth} {depth === currentPlayer.currentDepth && currentPlayer.location === 'sea' ? '(Current)' : ''}
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            {gameState.sea.shoals[depth]?.map((shoal, shoalIndex) => {
              const isSelected = selectedShoal?.depth === depth && selectedShoal?.shoal === shoalIndex;
              const topFish = shoal[0];
              const shoalEmpty = shoal.length === 0;
              const canInteract = currentPlayer.currentDepth >= depth && currentPlayer.location === 'sea' && !currentPlayer.hasPassed;
              
              return (
                <Card 
                  key={`${depth}-${shoalIndex}`}
                  className={`fish-card p-4 cursor-pointer min-h-32 ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  } ${
                    shoalEmpty ? 'opacity-50' : ''
                  } ${
                    canInteract ? 'hover:scale-105' : 'cursor-not-allowed'
                  }`}
                  onClick={() => canInteract && !shoalEmpty && onShoalSelect({depth, shoal: shoalIndex})}
                >
                  <div className="text-center space-y-2">
                    <div className="text-sm font-bold text-muted-foreground">
                      Shoal {shoalIndex + 1}
                    </div>
                    
                    {shoalEmpty ? (
                      <div className="text-destructive text-sm">
                        🌊 Empty Waters
                      </div>
                    ) : topFish ? (
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-card-foreground">
                          {topFish.name}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Value:</span>
                            <span className="text-fishbuck font-bold">{topFish.value}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Difficulty:</span>
                            <span className="text-destructive font-bold">{topFish.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevealFish(depth, shoalIndex);
                            }}
                            disabled={!canInteract}
                            className="flex-1 text-xs"
                          >
                            Reveal
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCatchFish(topFish, depth, shoalIndex);
                            }}
                            disabled={!canInteract}
                            className="flex-1 text-xs btn-ocean"
                          >
                            Catch
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        🐟 {shoal.length} fish remaining
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Graveyard */}
          <div className="text-center">
            <div className="card-game p-2 inline-block">
              <div className="text-xs text-muted-foreground">
                Graveyard: {gameState.sea.graveyards[depth]?.length || 0} fish
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};