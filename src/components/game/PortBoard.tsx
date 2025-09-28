import { GameState } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RODS, REELS, SUPPLIES } from '@/data/upgrades';
import { calculateFishSaleValue } from '@/utils/gameEngine';

interface PortBoardProps {
  gameState: GameState;
  onAction: (action: any) => void;
}

export const PortBoard = ({ gameState, onAction }: PortBoardProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const canInteract = currentPlayer.location === 'port' && !currentPlayer.hasPassed;

  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    if (currentPlayer.fishbucks >= cost) {
      onAction({
        type: 'BUY_UPGRADE',
        playerId: currentPlayer.id,
        payload: { upgradeId, cost }
      });
    }
  };

  const handleSellFish = (fishId: string) => {
    onAction({
      type: 'SELL_FISH',
      playerId: currentPlayer.id,
      payload: { fishId }
    });
  };

  const handleMountFish = (fishId: string, slot: number) => {
    onAction({
      type: 'MOUNT_FISH',
      playerId: currentPlayer.id,
      payload: { fishId, slot }
    });
  };

  const handleBuyTackleDice = (count: number, cost: number) => {
    if (currentPlayer.fishbucks >= cost) {
      onAction({
        type: 'BUY_TACKLE_DICE',
        playerId: currentPlayer.id,
        payload: { count, cost }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-glow mb-2">Harbor Port</h2>
        <p className="text-muted-foreground">Safe waters for commerce and rest</p>
      </div>

      {/* Fish Management */}
      {currentPlayer.handFish.length > 0 && (
        <Card className="card-game">
          <CardHeader>
            <CardTitle className="text-lg">Your Catch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentPlayer.handFish.map((fish) => {
              const saleDetails = calculateFishSaleValue(fish, currentPlayer.madnessLevel);
              const modifierText = saleDetails.modifier !== 0
                ? ` • Modifiers ${saleDetails.modifier > 0 ? '+' : ''}${saleDetails.modifier}`
                : '';
              const madnessText = saleDetails.madnessPenalty > 0
                ? ` • Madness -${saleDetails.madnessPenalty}`
                : '';

              return (
                <div key={fish.id} className="flex items-center justify-between p-2 border border-border rounded">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {fish.name}
                      <span className={`text-xs uppercase tracking-wide font-semibold ${fish.quality === 'foul' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {fish.quality === 'foul' ? 'Foul' : 'Fair'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Base {saleDetails.baseValue}{modifierText}{madnessText}
                    </div>
                    <div className="text-sm">
                      Sale Value: <span className="text-primary-glow font-medium">${saleDetails.adjustedValue}</span>
                    </div>
                    {fish.quality === 'foul' && (
                      <div className="text-xs text-destructive font-semibold mt-1">
                        Selling draws 1 Regret.
                      </div>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSellFish(fish.id)}
                      disabled={!canInteract}
                    >
                      Sell (${saleDetails.adjustedValue})
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMountFish(fish.id, 1)} // Simplified slot selection
                      disabled={!canInteract}
                      className="btn-ocean"
                    >
                      Mount
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Tackle Dice Shop */}
      <Card className="card-game">
        <CardHeader>
          <CardTitle className="text-lg">Tackle Dice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Purchase additional dice for fishing
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((count) => (
              <Button
                key={count}
                variant="outline"
                onClick={() => handleBuyTackleDice(count, count * 2)}
                disabled={!canInteract || currentPlayer.fishbucks < count * 2}
                className="text-xs"
              >
                {count} dice
                <br />
                ${count * 2}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Shops */}
      <div className="space-y-4">
        {/* Rods */}
        <Card className="card-game">
          <CardHeader>
            <CardTitle className="text-lg">Fishing Rods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RODS.slice(0, 2).map((rod) => (
              <div key={rod.id} className="border border-border rounded p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{rod.name}</div>
                    <div className="text-xs text-muted-foreground">{rod.description}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuyUpgrade(rod.id, rod.cost)}
                    disabled={!canInteract || currentPlayer.fishbucks < rod.cost}
                    className="btn-ocean text-xs"
                  >
                    ${rod.cost}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reels */}
        <Card className="card-game">
          <CardHeader>
            <CardTitle className="text-lg">Fishing Reels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {REELS.slice(0, 2).map((reel) => (
              <div key={reel.id} className="border border-border rounded p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{reel.name}</div>
                    <div className="text-xs text-muted-foreground">{reel.description}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuyUpgrade(reel.id, reel.cost)}
                    disabled={!canInteract || currentPlayer.fishbucks < reel.cost}
                    className="btn-ocean text-xs"
                  >
                    ${reel.cost}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Supplies */}
        <Card className="card-game">
          <CardHeader>
            <CardTitle className="text-lg">Supplies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SUPPLIES.slice(0, 2).map((supply) => (
              <div key={supply.id} className="border border-border rounded p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{supply.name}</div>
                    <div className="text-xs text-muted-foreground">{supply.description}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuyUpgrade(supply.id, supply.cost)}
                    disabled={!canInteract || currentPlayer.fishbucks < supply.cost}
                    className="btn-ocean text-xs"
                  >
                    ${supply.cost}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Port Actions */}
      <Card className="card-game">
        <CardHeader>
          <CardTitle className="text-lg">Port Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full btn-ocean"
            disabled={!canInteract}
            onClick={() => onAction({
              type: 'USE_LIFE_PRESERVER',
              playerId: currentPlayer.id,
              payload: {}
            })}
          >
            Use Life Preserver
          </Button>
          <Button
            className="w-full"
            variant="outline"
            disabled={!canInteract}
            onClick={() => onAction({
              type: 'DRAW_DINK',
              playerId: currentPlayer.id,
              payload: {}
            })}
          >
            Draw Dink Card
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};