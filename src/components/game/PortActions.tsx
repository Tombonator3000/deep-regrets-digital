import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FishCard, GameState, Player, UpgradeCard } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { calculateFishSaleValue } from '@/utils/gameEngine';
import { getSlotMultiplier } from '@/utils/mounting';
import { TACKLE_DICE } from '@/data/tackleDice';
import { Heart, Dice1 } from 'lucide-react';

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
    const saleDetails = calculateFishSaleValue(fish, currentPlayer.madnessLevel);
    onAction({
      type: 'SELL_FISH',
      playerId: currentPlayer.id,
      payload: { fishId: fish.id }
    });
    toast({
      title: "Fish Sold",
      description: `Sold ${fish.name} for ${saleDetails.adjustedValue} Fishbucks`,
    });
  };

  const handleMountFish = (fish: FishCard, slotIndex: number) => {
    const slotOccupied = currentPlayer.mountedFish.some(mount => mount.slot === slotIndex);
    if (slotOccupied) {
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
      payload: { fishId: fish.id, slot: slotIndex }
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

  const handleBuyTackleDie = (dieId: string, cost: number) => {
    if (currentPlayer.fishbucks < cost) {
      toast({
        title: "Insufficient Funds",
        description: `Need ${cost} Fishbucks but only have ${currentPlayer.fishbucks}`,
        variant: "destructive"
      });
      return;
    }

    onAction({
      type: 'BUY_TACKLE_DICE',
      playerId: currentPlayer.id,
      payload: { dieId, count: 1 }
    });
    toast({
      title: "Tackle Die Purchased",
      description: `Bought a tackle die for ${cost} Fishbucks`,
    });
  };

  const handleUseLifePreserver = () => {
    if (currentPlayer.lifeboatFlipped) {
      toast({
        title: "Already Used",
        description: "You have already used the Life Preserver this game",
        variant: "destructive"
      });
      return;
    }

    if (currentPlayer.regrets.length === 0) {
      toast({
        title: "No Regrets",
        description: "You have no Regrets to discard",
        variant: "destructive"
      });
      return;
    }

    onAction({
      type: 'USE_LIFE_PRESERVER',
      playerId: currentPlayer.id,
      payload: {}
    });
    toast({
      title: "Life Preserver Used",
      description: "Discarded 1 Regret and reduced Madness (but +10 penalty at game end)",
    });
  };

  const mountingSlots = Array.from({ length: currentPlayer.maxMountSlots }, (_, i) => i);

  // Color mapping for tackle dice
  const dieColors: Record<string, string> = {
    slate: 'bg-slate-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500'
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-glow">Port Actions</h3>

      {/* Life Preserver */}
      {!currentPlayer.lifeboatFlipped && currentPlayer.regrets.length > 0 && (
        <Card className="card-game p-3 border-red-500/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-medium text-red-400">Life Preserver</h4>
                <p className="text-xs text-muted-foreground">Discard 1 Regret (+10 penalty at end)</p>
              </div>
            </div>
            <Button
              onClick={handleUseLifePreserver}
              size="sm"
              variant="destructive"
            >
              Use
            </Button>
          </div>
        </Card>
      )}

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
                    {fish.quality === 'foul' && (
                      <p className="text-xs text-destructive font-semibold">Selling draws 1 Regret.</p>
                    )}
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
                      const isOccupied = currentPlayer.mountedFish.some(mount => mount.slot === slotIndex);
                      const multiplier = getSlotMultiplier(slotIndex);

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

      {/* Tackle Dice Shop */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Dice1 className="h-4 w-4" />
          Tackle Dice
        </h4>
        <p className="text-xs text-muted-foreground">Special dice with better odds for catching fish</p>
        <div className="grid grid-cols-2 gap-2">
          {TACKLE_DICE.map((die) => (
            <Card key={die.id} className="card-game p-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${dieColors[die.color] || 'bg-gray-500'}`} />
                  <span className="text-sm font-medium">{die.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{die.description}</p>
                <p className="text-xs">Faces: [{die.faces.join(', ')}]</p>
                <Button
                  onClick={() => handleBuyTackleDie(die.id, die.cost)}
                  disabled={currentPlayer.fishbucks < die.cost}
                  size="sm"
                  className="w-full btn-ocean text-xs"
                >
                  Buy ({die.cost} Fishbucks)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Buy Upgrades */}
      <div className="space-y-3">
        <h4 className="font-medium">Upgrade Shop</h4>

        {/* Rods */}
        {gameState.port.shops.rods.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-primary-glow">Rods</h5>
            {gameState.port.shops.rods.map((rod) => (
              <Card key={rod.id} className="card-game p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h6 className="font-medium">{rod.name}</h6>
                    <p className="text-xs text-muted-foreground">{rod.description}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold">{rod.cost} Fishbucks</p>
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
            {gameState.port.shops.reels.map((reel) => (
              <Card key={reel.id} className="card-game p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h6 className="font-medium">{reel.name}</h6>
                    <p className="text-xs text-muted-foreground">{reel.description}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold">{reel.cost} Fishbucks</p>
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

        {/* Supplies */}
        {gameState.port.shops.supplies.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-primary-glow">Supplies</h5>
            {gameState.port.shops.supplies.map((supply) => (
              <Card key={supply.id} className="card-game p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h6 className="font-medium">{supply.name}</h6>
                    <p className="text-xs text-muted-foreground">{supply.description}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold">{supply.cost} Fishbucks</p>
                    <Button
                      onClick={() => handleBuyUpgrade(supply)}
                      disabled={currentPlayer.fishbucks < supply.cost}
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
