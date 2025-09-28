import { GameState, FishCard } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import boardImage from '@/assets/briny-deep-board.svg';

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
    const diceIndices = currentPlayer.freshDice.map((_, index) => index);
    onAction({
      type: 'CATCH_FISH',
      playerId: currentPlayer.id,
      payload: { fish, depth, shoal, diceIndices }
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
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary-glow">The Deep Sea</h2>
        <p className="text-muted-foreground">
          Current Depth: <span className="text-primary font-bold">{currentPlayer.currentDepth}</span>
        </p>
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          Choose dice for catches in the Sea Actions panel. Failing or passing a catch will burn one die and add a Dink card.
        </p>
        {gameState.sea.plugActive && (
          <p className="text-destructive font-bold animate-regret-pulse">⚠️ The Plug is active - Erosion in progress!</p>
        )}
      </div>

      {currentPlayer.location === 'sea' && (
        <div className="flex justify-center flex-wrap gap-3">
          {[1, 2, 3].map((depth) => (
            <Button
              key={depth}
              variant={currentPlayer.currentDepth === depth ? 'default' : 'outline'}
              onClick={() => depth > currentPlayer.currentDepth && handleDescend(depth)}
              disabled={depth < currentPlayer.currentDepth || currentPlayer.hasPassed}
              className={`${
                currentPlayer.currentDepth === depth
                  ? 'btn-ocean'
                  : depth > currentPlayer.currentDepth
                    ? 'border-primary/50 hover:border-primary'
                    : 'opacity-60'
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

      <div className="relative mx-auto max-w-4xl">
        <img
          src={boardImage}
          alt="The Briny Deep board"
          className="w-full select-none pointer-events-none drop-shadow-2xl"
        />
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-4 md:p-8">
          {[1, 2, 3].flatMap((depth) =>
            gameState.sea.shoals[depth]?.map((shoal, shoalIndex) => {
              const isSelected = selectedShoal?.depth === depth && selectedShoal?.shoal === shoalIndex;
              const topFish = shoal[0];
              const shoalEmpty = shoal.length === 0;
              const canInteract =
                currentPlayer.currentDepth >= depth &&
                currentPlayer.location === 'sea' &&
                !currentPlayer.hasPassed;

              return (
                <Card
                  key={`${depth}-${shoalIndex}`}
                  role={canInteract && !shoalEmpty ? 'button' : undefined}
                  tabIndex={canInteract && !shoalEmpty ? 0 : -1}
                  onClick={() => canInteract && !shoalEmpty && onShoalSelect({ depth, shoal: shoalIndex })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && canInteract && !shoalEmpty) {
                      onShoalSelect({ depth, shoal: shoalIndex });
                    }
                  }}
                  className={`relative flex h-full flex-col justify-between rounded-xl border-2 border-transparent bg-black/30 p-3 text-white shadow-lg backdrop-blur-sm transition ${
                    isSelected ? 'border-primary ring-2 ring-primary/70' : ''
                  } ${
                    shoalEmpty ? 'opacity-60' : ''
                  } ${
                    canInteract && !shoalEmpty ? 'hover:border-primary/70 hover:bg-black/40' : 'cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-200/80">
                      <span>Shoal {shoalIndex + 1}</span>
                      <span>Depth {depth}</span>
                    </div>

                    {shoalEmpty ? (
                      <div className="flex flex-1 items-center justify-center text-center text-xs text-slate-200">
                        🌊 Empty Waters
                      </div>
                    ) : topFish ? (
                      <div className="space-y-2">
                        <div className="text-lg font-semibold text-white drop-shadow-sm">
                          {topFish.name}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-100/90">
                          <div className="rounded-md bg-slate-900/40 px-2 py-1 text-center">
                            <div className="font-semibold text-fishbuck">Value</div>
                            <div className="text-base font-bold">{topFish.value}</div>
                          </div>
                          <div className="rounded-md bg-slate-900/40 px-2 py-1 text-center">
                            <div className="font-semibold text-rose-200">Difficulty</div>
                            <div className="text-base font-bold text-destructive">{topFish.difficulty}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRevealFish(depth, shoalIndex);
                            }}
                            disabled={!canInteract}
                            className="flex-1 border-white/30 bg-white/10 text-xs text-white hover:bg-white/20"
                          >
                            Reveal
                          </Button>
                          <Button
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCatchFish(topFish, depth, shoalIndex);
                            }}
                            disabled={!canInteract}
                            className="flex-1 text-xs btn-ocean"
                          >
                            Catch (uses ready dice)
                          </Button>
                        </div>
                        <p className="text-[0.65rem] text-slate-200/80">
                          Need finer control? Select dice from the Sea Actions panel before attempting the catch.
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-200">🐟 {shoal.length} fish remaining</div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div className="grid gap-3 text-center sm:grid-cols-3">
        {[1, 2, 3].map((depth) => (
          <div key={`graveyard-${depth}`} className="card-game bg-black/40 p-3 text-slate-200 shadow-inner">
            <div className="text-xs uppercase tracking-wide text-slate-300">Depth {depth} Graveyard</div>
            <div className="text-lg font-semibold text-white">
              {gameState.sea.graveyards[depth]?.length || 0} fish
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
