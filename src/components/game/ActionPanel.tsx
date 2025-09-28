import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ActionPanelProps {
  gameState: GameState;
  selectedShoal: {depth: number, shoal: number} | null;
  selectedCard: any;
  onAction: (action: any) => void;
}

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

  const handleEndTurn = () => {
    onAction({
      type: 'END_TURN',
      playerId: currentPlayer.id,
      payload: {}
    });
  };

  const getAvailableActions = () => {
    const actions = [];
    
    if (!isPlayerTurn) {
      return ['Waiting for other players...'];
    }

    if (currentPlayer.location === 'sea') {
      actions.push('Reveal Fish', 'Catch Fish', 'Move/Descend', 'Draw Dink');
    } else {
      actions.push('Sell Fish', 'Mount Fish', 'Buy Equipment', 'Use Port Services');
    }

    return actions;
  };

  return (
    <Card className="card-game p-4">
      <div className="flex items-center justify-between">
        {/* Action Summary */}
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {isPlayerTurn ? `${currentPlayer.name}'s Turn` : 'Waiting...'}
          </div>
          <div className="text-xs text-muted-foreground">
            Available actions: {getAvailableActions().join(', ')}
          </div>
        </div>

        {/* Phase Controls */}
        <div className="flex items-center space-x-3">
          <div className="text-sm text-muted-foreground">
            {gameState.phase} phase
          </div>
          
          {/* Action Buttons */}
          <div className="space-x-2">
            {gameState.phase === 'declaration' && (
              <Button
                onClick={() => onAction({
                  type: 'DECLARE_LOCATION',
                  playerId: currentPlayer.id,
                  payload: { location: currentPlayer.location === 'sea' ? 'port' : 'sea' }
                })}
                disabled={!isPlayerTurn}
                className="btn-ocean"
                size="sm"
              >
                Declare {currentPlayer.location === 'sea' ? 'Port' : 'Sea'}
              </Button>
            )}
            
            {isPlayerTurn && (
              <Button
                onClick={handleEndTurn}
                variant="outline"
                size="sm"
              >
                End Turn
              </Button>
            )}
            
            {gameState.phase !== 'action' && (
              <Button
                onClick={handleNextPhase}
                variant="outline"
                size="sm"
              >
                Next Phase
              </Button>
            )}
          </div>
        </div>

        {/* Selected Info */}
        {selectedShoal && (
          <div className="text-sm text-primary">
            Selected: Depth {selectedShoal.depth}, Shoal {selectedShoal.shoal + 1}
          </div>
        )}
      </div>
    </Card>
  );
};