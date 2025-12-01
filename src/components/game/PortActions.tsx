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
import { FishCard, GameState, Player, UpgradeCard, MAX_FISHBUCKS, ShopType } from '@/types/game';
import { useToast } from '@/hooks/use-toast';
import { calculateFishSaleValue } from '@/utils/gameEngine';
import { getSlotMultiplier } from '@/utils/mounting';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { Anchor, Coins, Dice1, Heart, HelpCircle, Lightbulb, Package, ShoppingBag, Trophy } from 'lucide-react';

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

  // Helper to check if a shop has been visited this turn (per rulebook p.17)
  const hasVisitedShop = (shopType: ShopType): boolean => {
    return currentPlayer.shopVisits?.includes(shopType) ?? false;
  };

  // Check if player is at max fishbucks
  const isAtMaxFishbucks = currentPlayer.fishbucks >= MAX_FISHBUCKS;

  const handleSellFish = (fish: FishCard) => {
    const saleDetails = calculateFishSaleValue(fish, currentPlayer.regrets.length);
    const potentialTotal = currentPlayer.fishbucks + saleDetails.adjustedValue;
    const actualGain = Math.min(saleDetails.adjustedValue, MAX_FISHBUCKS - currentPlayer.fishbucks);
    const excessLost = saleDetails.adjustedValue - actualGain;

    onAction({
      type: 'SELL_FISH',
      playerId: currentPlayer.id,
      payload: { fishId: fish.id }
    });

    if (excessLost > 0) {
      toast({
        title: "Fisk solgt - Overskudd tapt!",
        description: `Solgte ${fish.name} for ${actualGain} Fishbucks (${excessLost} FB tapt - maks ${MAX_FISHBUCKS})`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Fisk solgt",
        description: `Solgte ${fish.name} for ${saleDetails.adjustedValue} Fishbucks`,
      });
    }
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
    // Check shop visit limit per rulebook (p.17)
    const shopTypeMap: Record<string, ShopType> = {
      'rod': 'rods',
      'reel': 'reels',
      'supply': 'supplies'
    };
    const shopType = shopTypeMap[upgrade.type];

    if (hasVisitedShop(shopType)) {
      toast({
        title: "Butikk allerede besøkt",
        description: `Du har allerede handlet i ${shopType === 'rods' ? 'stang' : shopType === 'reels' ? 'hjul' : 'forsynings'}-butikken denne turen`,
        variant: "destructive"
      });
      return;
    }

    if (currentPlayer.fishbucks < upgrade.cost) {
      toast({
        title: "Ikke nok penger",
        description: `Trenger ${upgrade.cost} Fishbucks men har bare ${currentPlayer.fishbucks}`,
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
      title: "Oppgradering kjøpt",
      description: `Kjøpte ${upgrade.name} for ${upgrade.cost} Fishbucks`,
    });
  };

  const handleBuyTackleDie = (dieId: string, cost: number) => {
    // Check shop visit limit per rulebook (p.17)
    if (hasVisitedShop('tackle_dice')) {
      toast({
        title: "Butikk allerede besøkt",
        description: "Du har allerede handlet i terning-butikken denne turen",
        variant: "destructive"
      });
      return;
    }

    if (currentPlayer.fishbucks < cost) {
      toast({
        title: "Ikke nok penger",
        description: `Trenger ${cost} Fishbucks men har bare ${currentPlayer.fishbucks}`,
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
      title: "Terning kjøpt",
      description: `Kjøpte en spesialterning for ${cost} Fishbucks`,
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
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500'
  };

  // Get market dice from game state
  const marketDice = gameState.port.tackleDiceMarket.map(dieId => ({
    id: dieId,
    die: TACKLE_DICE_LOOKUP[dieId]
  })).filter(item => item.die);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Port Actions Header with Tips */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary-glow flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Havnhandlinger
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-semibold mb-1">I havnen kan du:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Selge fisk for Fishbucks</li>
                <li>Montere fisk på troféveggen (×1, ×2, ×3)</li>
                <li>Kjøpe oppgraderinger og utstyr</li>
                <li>Leie spesialterninger</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Tips Card */}
        <Card className="card-game p-3 bg-amber-900/20 border-amber-500/30">
          <div className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <span className="text-amber-200">
              {isAtMaxFishbucks
                ? `⚠️ Du har ${MAX_FISHBUCKS} FB (maks). Overskudd fra salg går tapt!`
                : currentPlayer.handFish.length === 0
                  ? "Du har ingen fisk å selge eller montere. Gå til havet for å fiske!"
                  : currentPlayer.handFish.length === 1
                    ? "Du har 1 fisk. Vurder å montere den på ×3-plassen for maksimale poeng!"
                    : `Du har ${currentPlayer.handFish.length} fisk. Selg eller monter dem for poeng.`}
            </span>
          </div>
        </Card>

        {/* Life Preserver */}
        {!currentPlayer.lifeboatFlipped && currentPlayer.regrets.length > 0 && (
          <Card className="card-game p-3 border-red-500/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-medium text-red-400">Life Preserver</h4>
                  <p className="text-xs text-muted-foreground">Kast 1 Regret (+10 straff ved slutt)</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleUseLifePreserver}
                    size="sm"
                    variant="destructive"
                  >
                    Bruk
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fjern én Regret nå, men få 10 straffpoeng ved spillslutt.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>
        )}

        {/* Sell Fish */}
        {currentPlayer.handFish.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-fishbuck" />
              <h4 className="font-medium">Selg Fisk</h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Selg fisk for Fishbucks. 1 Fishbuck = 1 poeng ved spillslutt.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentPlayer.handFish.map((fish) => {
                const saleValue = calculateFishSaleValue(fish, currentPlayer.regrets.length);
                return (
                  <Card key={fish.id} className="card-game p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-primary-glow">{fish.name}</h5>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Verdi:</span>
                          <span className="ml-1 text-fishbuck font-semibold">{saleValue.adjustedValue}</span>
                          <span className="text-xs text-muted-foreground ml-1">Fishbucks</span>
                        </p>
                        {fish.quality === 'foul' && (
                          <p className="text-xs text-destructive font-semibold">⚠️ Å selge gir 1 Regret</p>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleSellFish(fish)}
                            size="sm"
                            className="btn-ocean"
                          >
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Selg
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Selg for {saleValue.adjustedValue} Fishbucks</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Mount Fish */}
        {currentPlayer.handFish.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <h4 className="font-medium">Monter Fisk (Trofé)</h4>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Monteringsplasser:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Plass 1: ×1 (normal verdi)</li>
                    <li>• Plass 2: ×2 (dobbel verdi)</li>
                    <li>• Plass 3: ×3 (trippel verdi!)</li>
                  </ul>
                  <p className="text-xs mt-1 text-muted-foreground">Spar beste fisk til ×3!</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2">
              {currentPlayer.handFish.map((fish) => (
                <Card key={`mount-${fish.id}`} className="card-game p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium text-primary-glow">{fish.name}</h5>
                      <Badge variant="outline" className="border-green-500/50 text-green-400">
                        Verdi: {fish.value}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {mountingSlots.map((slotIndex) => {
                        const isOccupied = currentPlayer.mountedFish.some(mount => mount.slot === slotIndex);
                        const multiplier = getSlotMultiplier(slotIndex);
                        const potentialScore = fish.value * multiplier;

                        return (
                          <Tooltip key={slotIndex}>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleMountFish(fish, slotIndex)}
                                disabled={isOccupied}
                                size="sm"
                                variant={isOccupied ? "secondary" : "outline"}
                                className={`flex-1 text-xs ${!isOccupied && multiplier === 3 ? 'border-yellow-500/50 text-yellow-400' : ''}`}
                              >
                                {isOccupied ? '🔒' : `×${multiplier}`}
                                {!isOccupied && ` (${potentialScore}p)`}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isOccupied
                                ? 'Denne plassen er opptatt'
                                : `Monter her for ${potentialScore} poeng (${fish.value} × ${multiplier})`}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Player's Owned Tackle Dice */}
        {currentPlayer.tackleDice.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Dice1 className="h-4 w-4 text-red-400" />
              <h4 className="font-medium text-red-400">Dine Tackle Dice</h4>
            </div>
            <div className="flex flex-wrap gap-2 p-2 rounded-lg border-2 border-red-500/40 bg-red-950/20">
              {currentPlayer.tackleDice.map((dieId, index) => {
                const die = TACKLE_DICE_LOOKUP[dieId];
                if (!die) return null;
                return (
                  <div
                    key={`owned-${dieId}-${index}`}
                    className={`w-8 h-8 rounded-lg ${dieColors[die.color] || 'bg-gray-500'} flex items-center justify-center`}
                    title={`${die.name} - ${die.description}`}
                  >
                    <Dice1 className="h-4 w-4 text-white" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tackle Dice Market */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Dice1 className="h-4 w-4 text-violet-400" />
            <h4 className="font-medium">Tackle Dice Marked</h4>
            {hasVisitedShop('tackle_dice') && (
              <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                ✓ Besøkt
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Spesialterninger med bedre odds. Kjøp dem til fiske!</p>
                <p className="text-xs mt-1 text-muted-foreground">Du kan kun besøke hver butikk én gang per tur.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {marketDice.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Utsolgt!</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {marketDice.map((item, index) => (
                <Card key={`market-${item.id}-${index}`} className={`card-game p-2 ${hasVisitedShop('tackle_dice') ? 'opacity-50' : ''}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${dieColors[item.die.color] || 'bg-gray-500'}`} />
                      <span className="text-sm font-medium">{item.die.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.die.description}</p>
                    <p className="text-xs">Sider: [{item.die.faces.join(', ')}]</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleBuyTackleDie(item.id, item.die.cost)}
                          disabled={currentPlayer.fishbucks < item.die.cost || hasVisitedShop('tackle_dice')}
                          size="sm"
                          className="w-full btn-ocean text-xs"
                        >
                          {hasVisitedShop('tackle_dice') ? '🔒 Besøkt' : `Kjøp ($${item.die.cost})`}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {hasVisitedShop('tackle_dice')
                          ? 'Du har allerede besøkt denne butikken denne turen'
                          : currentPlayer.fishbucks < item.die.cost
                            ? `Du trenger ${item.die.cost - currentPlayer.fishbucks} Fishbucks mer`
                            : `Kjøp denne terningen for $${item.die.cost}`}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Buy Upgrades */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-400" />
            <h4 className="font-medium">Oppgraderingsbutikk</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Kjøp permanente oppgraderinger for å forbedre fiskingen.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Rods */}
          {gameState.port.shops.rods.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-primary-glow">Stenger</h5>
                {hasVisitedShop('rods') && (
                  <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                    ✓ Besøkt
                  </Badge>
                )}
              </div>
              {gameState.port.shops.rods.map((rod) => (
                <Card key={rod.id} className={`card-game p-3 ${hasVisitedShop('rods') ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h6 className="font-medium">{rod.name}</h6>
                      <p className="text-xs text-muted-foreground">{rod.description}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-fishbuck">{rod.cost} FB</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleBuyUpgrade(rod)}
                            disabled={currentPlayer.fishbucks < rod.cost || hasVisitedShop('rods')}
                            size="sm"
                            className="btn-ocean mt-1"
                          >
                            {hasVisitedShop('rods') ? '🔒' : 'Kjøp'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasVisitedShop('rods')
                            ? 'Du har allerede besøkt stang-butikken denne turen'
                            : currentPlayer.fishbucks < rod.cost
                              ? `Trenger ${rod.cost - currentPlayer.fishbucks} FB mer`
                              : 'Kjøp denne oppgraderingen'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Reels */}
          {gameState.port.shops.reels.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-primary-glow">Hjul</h5>
                {hasVisitedShop('reels') && (
                  <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                    ✓ Besøkt
                  </Badge>
                )}
              </div>
              {gameState.port.shops.reels.map((reel) => (
                <Card key={reel.id} className={`card-game p-3 ${hasVisitedShop('reels') ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h6 className="font-medium">{reel.name}</h6>
                      <p className="text-xs text-muted-foreground">{reel.description}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-fishbuck">{reel.cost} FB</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleBuyUpgrade(reel)}
                            disabled={currentPlayer.fishbucks < reel.cost || hasVisitedShop('reels')}
                            size="sm"
                            className="btn-ocean mt-1"
                          >
                            {hasVisitedShop('reels') ? '🔒' : 'Kjøp'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasVisitedShop('reels')
                            ? 'Du har allerede besøkt hjul-butikken denne turen'
                            : currentPlayer.fishbucks < reel.cost
                              ? `Trenger ${reel.cost - currentPlayer.fishbucks} FB mer`
                              : 'Kjøp denne oppgraderingen'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Supplies */}
          {gameState.port.shops.supplies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-primary-glow">Forsyninger</h5>
                {hasVisitedShop('supplies') && (
                  <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                    ✓ Besøkt
                  </Badge>
                )}
              </div>
              {gameState.port.shops.supplies.map((supply) => (
                <Card key={supply.id} className={`card-game p-3 ${hasVisitedShop('supplies') ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h6 className="font-medium">{supply.name}</h6>
                      <p className="text-xs text-muted-foreground">{supply.description}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-fishbuck">{supply.cost} FB</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleBuyUpgrade(supply)}
                            disabled={currentPlayer.fishbucks < supply.cost || hasVisitedShop('supplies')}
                            size="sm"
                            className="btn-ocean mt-1"
                          >
                            {hasVisitedShop('supplies') ? '🔒' : 'Kjøp'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {hasVisitedShop('supplies')
                            ? 'Du har allerede besøkt forsynings-butikken denne turen'
                            : currentPlayer.fishbucks < supply.cost
                              ? `Trenger ${supply.cost - currentPlayer.fishbucks} FB mer`
                              : 'Kjøp forsyninger'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
