import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FishCard, GameState, Player, UpgradeCard } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface PortActionsProps {
  gameState: GameState;
  currentPlayer: Player;
  onAction: (action: any) => void;
}

export const PortActions = ({ gameState, currentPlayer, onAction }: PortActionsProps) => {
  const [selectedFish, setSelectedFish] = useState<FishCard | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeCard | null>(null);
  const { toast } = useToast();

  if (currentPlayer.location !== 'port') {
    return null;
  }

  const handleSellFish = (fish: FishCard) => {
    onAction({
      type: 'SELL_FISH',
      playerId: currentPlayer.id,
      payload: { fishId: fish.id }
    });
    toast({
      title: "Fish Sold",
      description: `Sold ${fish.name} for ${fish.value} Fishbucks`,
    });
  };

  const handleMountFish = (fish: FishCard, slotIndex: number) => {
    if (currentPlayer.mountedFish[slotIndex]) {
      toast({
        title: "Slot Occupied",
        description: "This mounting slot is already occupied",
        variant: "destructive"
      });
      return;
    }

    onAction({
      type: 'MOUNT_FISH',
      playerId: currentPlayer.id,
      payload: { fishId: fish.id, slotIndex }
    });
    toast({
      title: "Fish Mounted",
      description: `${fish.name} mounted in trophy slot ${slotIndex + 1}`,
    });
  };

  const handleBuyUpgrade = (upgrade: UpgradeCard) => {
    if (currentPlayer.fishbucks < upgrade.cost) {
      toast({
        title: "Insufficient Funds",
        description: `Need ${upgrade.cost} Fishbucks but only have ${currentPlayer.fishbucks}`,
        variant: "destructive"
      });
      return;
    }

    onAction({
      type: 'BUY_UPGRADE',
      playerId: currentPlayer.id,
      payload: { upgradeId: upgrade.id }
    });
    toast({
      title: "Upgrade Purchased",
      description: `Bought ${upgrade.name} for ${upgrade.cost} Fishbucks`,
    });
  };

  const mountingSlots = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-glow">Port Actions</h3>
      
      {/* Sell Fish */}
      {currentPlayer.handFish.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Sell Fish</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {currentPlayer.handFish.map((fish) => (
              <Card key={fish.id} className="card-game p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-primary-glow">{fish.name}</h5>
                    <p className="text-sm text-muted-foreground">Value: {fish.value} Fishbucks</p>
                  </div>
                  <Button
                    onClick={() => handleSellFish(fish)}
                    size="sm"
                    className="btn-ocean"
                  >
                    Sell
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mount Fish */}
      {currentPlayer.handFish.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Mount Fish (Trophy)</h4>
          <div className="space-y-2">
            {currentPlayer.handFish.map((fish) => (
              <Card key={`mount-${fish.id}`} className="card-game p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-primary-glow">{fish.name}</h5>
                    <Badge variant="outline">Value: {fish.value}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {mountingSlots.map((slotIndex) => {
                      const isOccupied = !!currentPlayer.mountedFish[slotIndex];
                      const multiplier = slotIndex === 0 ? 1 : slotIndex === 1 ? 2 : 3;
                      
                      return (
                        <Button
                          key={slotIndex}
                          onClick={() => handleMountFish(fish, slotIndex)}
                          disabled={isOccupied}
                          size="sm"
                          variant={isOccupied ? "secondary" : "outline"}
                          className="flex-1 text-xs"
                        >
                          Slot {slotIndex + 1} (×{multiplier})
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Buy Upgrades */}
      <div className="space-y-3">
        <h4 className="font-medium">Shop</h4>
        
        {/* Rods */}
        {gameState.port.shops.rods.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-primary-glow">Rods</h5>
            {gameState.port.shops.rods.slice(0, 2).map((rod) => (
              <Card key={rod.id} className="card-game p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h6 className="font-medium">{rod.name}</h6>
                    <p className="text-xs text-muted-foreground">{rod.description}</p>
                    <div className="flex gap-1 mt-1">
                      {rod.effects.map((effect, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold">{rod.cost}💰</p>
                    <Button
                      onClick={() => handleBuyUpgrade(rod)}
                      disabled={currentPlayer.fishbucks < rod.cost}
                      size="sm"
                      className="btn-ocean mt-1"
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Reels */}
        {gameState.port.shops.reels.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-primary-glow">Reels</h5>
            {gameState.port.shops.reels.slice(0, 2).map((reel) => (
              <Card key={reel.id} className="card-game p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h6 className="font-medium">{reel.name}</h6>
                    <p className="text-xs text-muted-foreground">{reel.description}</p>
                    <div className="flex gap-1 mt-1">
                      {reel.effects.map((effect, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold">{reel.cost}💰</p>
                    <Button
                      onClick={() => handleBuyUpgrade(reel)}
                      disabled={currentPlayer.fishbucks < reel.cost}
                      size="sm"
                      className="btn-ocean mt-1"
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};