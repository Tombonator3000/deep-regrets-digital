import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { FishingActions } from './FishingActions';
import { PortActions } from './PortActions';
import { Card } from '@/components/ui/card';

interface ActionPanelProps {
  gameState: GameState;
  selectedShoal: {depth: number, shoal: number} | null;
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

  return (
    <div className="space-y-4">
      {/* Phase Header */}
      <Card className="card-game p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-primary-glow">
              {currentPlayer.name}'s Turn
            </div>
            <div className="text-sm text-muted-foreground">
              Day: {gameState.day} | Phase: {gameState.phase}
            </div>
            <div className="text-sm text-muted-foreground">
              Location: {currentPlayer.location === 'sea' ? `Sea (Depth ${currentPlayer.currentDepth})` : 'Port'}
            </div>
            <div className="text-sm text-muted-foreground">
              Fishbucks: {currentPlayer.fishbucks} | Fresh Dice: {currentPlayer.freshDice.length}
            </div>
          </div>

          <div className="flex gap-2">
            {gameState.phase === 'declaration' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDeclareLocation('sea')} 
                  variant={currentPlayer.location === 'sea' ? "default" : "outline"}
                  className={currentPlayer.location === 'sea' ? "btn-ocean" : "border-primary/30"}
                >
                  Go to Sea
                </Button>
                <Button 
                  onClick={() => handleDeclareLocation('port')} 
                  variant={currentPlayer.location === 'port' ? "default" : "outline"}
                  className={currentPlayer.location === 'port' ? "btn-ocean" : "border-primary/30"}
                >
                  Go to Port
                </Button>
              </div>
            )}
            
            {gameState.phase === 'action' && isPlayerTurn && (
              <Button onClick={handlePass} variant="outline" className="border-primary/30">
                Pass (End Day)
              </Button>
            )}
            
            <Button onClick={handleNextPhase} className="btn-ocean">
              Next Phase
            </Button>
          </div>
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
            <strong>Selected:</strong> Depth {selectedShoal.depth}, Shoal {selectedShoal.shoal + 1}
          </p>
        </Card>
      )}
    </div>
  );
};