import { GameState } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import boardImage from '@/assets/briny-deep-board.svg';

interface SeaBoardProps {
  gameState: GameState;
  selectedShoal: {depth: number, shoal: number} | null;
  onShoalSelect: (shoal: {depth: number, shoal: number}) => void;
  onInspectShoal?: (shoal: {depth: number, shoal: number}) => void;
  onAction: (action: any) => void;
}

export const SeaBoard = ({ gameState, selectedShoal, onShoalSelect, onInspectShoal, onAction }: SeaBoardProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleDescend = (targetDepth: number) => {
    onAction({
      type: 'DESCEND',
      playerId: currentPlayer.id,
      payload: { targetDepth }
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200 shadow-inner">
        <h2 className="text-lg font-bold text-primary-glow sm:text-xl">The Deep Sea</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <span className="flex items-center gap-1">
            <span>Current Depth:</span>
            <span className="text-primary font-semibold">{currentPlayer.currentDepth}</span>
          </span>
          <span className="hidden lg:inline">•</span>
          <span className="max-w-xs text-muted-foreground lg:max-w-none">
            Choose dice for catches in the Sea Actions panel. Failing or passing a catch will burn one die and add a Dink card.
          </span>
        </div>
        {gameState.sea.plugActive && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-destructive/20 px-3 py-1 text-xs font-semibold text-destructive shadow-sm">
            ⚠️ The Plug is active - Erosion in progress!
          </span>
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

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="relative mx-auto flex h-full max-h-full w-full items-center justify-center px-2">
          <div
            className="relative h-full max-h-full w-full max-w-4xl"
            style={{ aspectRatio: '3 / 4' }}
          >
            <img
              src={boardImage}
              alt="The Briny Deep board"
              className="h-full w-full select-none rounded-xl object-contain drop-shadow-2xl"
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
                  role={canInteract ? 'button' : undefined}
                  tabIndex={canInteract ? 0 : -1}
                  aria-label={
                    shoalEmpty
                      ? `Shoal ${shoalIndex + 1} at depth ${depth} is empty`
                      : `${topFish?.name ?? 'Unknown fish'} in shoal ${shoalIndex + 1} at depth ${depth}. Difficulty ${topFish?.difficulty ?? 'unknown'}, value ${topFish?.value ?? 'unknown'}`
                  }
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
                    canInteract ? 'hover:border-primary/70 hover:bg-black/40' : 'cursor-not-allowed'
                  }`}
                >
                  <div className="flex h-full flex-col justify-between gap-4 text-sm">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-200/80">
                      <span>Shoal {shoalIndex + 1}</span>
                      <span>Depth {depth}</span>
                    </div>

                    {shoalEmpty ? (
                      <div className="flex flex-1 items-center justify-center text-center text-xs text-slate-200">
                        🌊 Empty Waters
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-white drop-shadow-sm">
                            {topFish?.name ?? 'Unknown Catch'}
                          </div>
                          <p className="sr-only">Difficulty {topFish?.difficulty ?? 'unknown'} at depth {depth}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-fishbuck/20 text-fishbuck">Value {topFish?.value ?? '?'}</Badge>
                          <Badge variant="outline" className="border-destructive/50 text-destructive">
                            Difficulty {topFish?.difficulty ?? '?'}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-900/60 text-slate-100">
                            {shoal.length} fish remaining
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              onShoalSelect({ depth, shoal: shoalIndex });
                              onInspectShoal?.({ depth, shoal: shoalIndex });
                            }}
                            disabled={!canInteract || shoalEmpty}
                            className={`flex-1 text-xs ${
                              !canInteract || shoalEmpty
                                ? 'border border-white/20 bg-white/10 text-slate-200'
                                : 'btn-ocean'
                            }`}
                          >
                            Inspect Shoal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-xl border border-white/10 bg-black/20 p-3 shadow-inner">
        <div className="flex flex-wrap items-stretch justify-between gap-3 text-center">
          {[1, 2, 3].map((depth) => (
            <div key={`graveyard-${depth}`} className="card-game flex-1 min-w-[120px] bg-black/40 p-3 text-slate-200 shadow-inner">
              <div className="text-xs uppercase tracking-wide text-slate-300">Depth {depth} Graveyard</div>
              <div className="text-lg font-semibold text-white">
                {gameState.sea.graveyards[depth]?.length || 0} fish
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
