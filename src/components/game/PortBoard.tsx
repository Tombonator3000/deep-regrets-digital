import { Anchor, Fish as FishIcon, Wrench } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RODS, REELS, SUPPLIES } from '@/data/upgrades';
import { calculateFishSaleValue } from '@/utils/gameEngine';
import { GameState } from '@/types/game';
import { cn } from '@/lib/utils';

interface PortBoardProps {
  gameState: GameState;
  onAction: (action: any) => void;
  className?: string;
}

interface UpgradeOptionProps {
  item: {
    id: string;
    name: string;
    description: string;
    cost: number;
  };
  canInteract: boolean;
  funds: number;
  onConfirm: (upgradeId: string, cost: number) => void;
}

const UpgradeOption = ({ item, canInteract, funds, onConfirm }: UpgradeOptionProps) => (
  <Card className="card-game border border-border/60">
    <CardHeader className="py-3">
      <CardTitle className="text-sm font-semibold flex items-center justify-between">
        <span>{item.name}</span>
        <span className="text-primary-glow">${item.cost}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0 text-xs text-muted-foreground">
      <p className="mb-3 leading-relaxed">{item.description}</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="btn-ocean w-full"
            disabled={!canInteract || funds < item.cost}
          >
            Purchase Upgrade
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Spend <span className="text-primary-glow font-semibold">${item.cost}</span> to acquire the {item.name}.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You currently hold <span className="font-semibold text-primary-glow">${funds}</span>. After purchase you&apos;ll have{' '}
            <span className="font-semibold text-primary-glow">${Math.max(funds - item.cost, 0)}</span> remaining.
          </p>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                className="btn-ocean"
                disabled={!canInteract || funds < item.cost}
                onClick={() => onConfirm(item.id, item.cost)}
              >
                Confirm Purchase
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
);

export const PortBoard = ({ gameState, onAction, className }: PortBoardProps) => {
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

  const summaryHeader = (
    <div className="flex items-center justify-between rounded border border-border/60 bg-background/60 px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
      <span>
        Funds: <span className="text-primary-glow font-semibold">${currentPlayer.fishbucks}</span>
      </span>
      <span>
        Madness: <span className="text-destructive font-semibold">{currentPlayer.madnessLevel}</span>
      </span>
    </div>
  );

  const featuredUpgrades = [
    ...RODS.slice(0, 2),
    ...REELS.slice(0, 2),
    ...SUPPLIES.slice(0, 2)
  ];

  return (
    <div className={cn('flex h-full flex-col space-y-6', className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-glow mb-2">Harbor Port</h2>
        <p className="text-muted-foreground">Safe waters for commerce and rest</p>
      </div>

      <Tabs defaultValue="catch" className="space-y-4">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="catch" className="flex items-center gap-2">
            <FishIcon className="h-4 w-4 text-primary-glow" />
            Catch
          </TabsTrigger>
          <TabsTrigger value="upgrades" className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary-glow" />
            Upgrades
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Anchor className="h-4 w-4 text-primary-glow" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catch" className="space-y-4">
          {summaryHeader}
          <Card className="card-game">
            <CardHeader>
              <CardTitle className="text-lg">Your Catch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentPlayer.handFish.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No fish aboard. Head out to sea to bring something back.
                </p>
              )}
              {currentPlayer.handFish.map((fish) => {
                const saleDetails = calculateFishSaleValue(fish, currentPlayer.madnessLevel);
                const modifierText = saleDetails.modifier !== 0
                  ? ` • Modifiers ${saleDetails.modifier > 0 ? '+' : ''}${saleDetails.modifier}`
                  : '';
                const madnessText = saleDetails.madnessPenalty > 0
                  ? ` • Madness -${saleDetails.madnessPenalty}`
                  : '';

                return (
                  <div key={fish.id} className="rounded border border-border/60 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2 text-sm">
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
                      <div className="flex flex-col gap-2 sm:w-48">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canInteract}
                            >
                              Sell (${saleDetails.adjustedValue})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
                            <DialogHeader>
                              <DialogTitle>Sell {fish.name}</DialogTitle>
                              <DialogDescription>
                                Gain <span className="text-primary-glow font-semibold">${saleDetails.adjustedValue}</span>{' '}
                                {saleDetails.madnessPenalty > 0 ? (
                                  <>
                                    and suffer <span className="font-semibold text-destructive">{saleDetails.madnessPenalty}</span>{' '}
                                    madness.
                                  </>
                                ) : (
                                  <>with no additional madness.</>
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                              Balance after sale:{' '}
                              <span className="text-primary-glow font-semibold">
                                ${currentPlayer.fishbucks + saleDetails.adjustedValue}
                              </span>
                            </p>
                            <DialogFooter className="pt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  className="btn-ocean"
                                  disabled={!canInteract}
                                  onClick={() => handleSellFish(fish.id)}
                                >
                                  Confirm Sale
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="btn-ocean"
                              disabled={!canInteract}
                            >
                              Mount
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
                            <DialogHeader>
                              <DialogTitle>Mount {fish.name}</DialogTitle>
                              <DialogDescription>
                                Display this catch proudly aboard your vessel.
                              </DialogDescription>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                              Madness remains at{' '}
                              <span className="text-destructive font-semibold">{currentPlayer.madnessLevel}</span>.
                            </p>
                            <DialogFooter className="pt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  className="btn-ocean"
                                  disabled={!canInteract}
                                  onClick={() => handleMountFish(fish.id, 1)}
                                >
                                  Confirm Mount
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrades" className="space-y-4">
          {summaryHeader}
          <Card className="card-game">
            <CardHeader>
              <CardTitle className="text-lg">Tackle Dice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Purchase additional dice for daring catches.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((count) => {
                  const cost = count * 2;
                  return (
                    <Dialog key={count}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-xs h-full flex flex-col items-center justify-center"
                          disabled={!canInteract || currentPlayer.fishbucks < cost}
                        >
                          <span className="text-sm font-semibold">{count} Dice</span>
                          <span className="text-primary-glow">${cost}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
                        <DialogHeader>
                          <DialogTitle>Buy {count} Tackle Dice</DialogTitle>
                          <DialogDescription>
                            This purchase costs{' '}
                            <span className="text-primary-glow font-semibold">${cost}</span>.
                          </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Remaining funds after purchase:{' '}
                          <span className="text-primary-glow font-semibold">${Math.max(currentPlayer.fishbucks - cost, 0)}</span>.
                        </p>
                        <DialogFooter className="pt-4">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              className="btn-ocean"
                              disabled={!canInteract || currentPlayer.fishbucks < cost}
                              onClick={() => handleBuyTackleDice(count, cost)}
                            >
                              Confirm Purchase
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {featuredUpgrades.map((upgrade) => (
              <UpgradeOption
                key={upgrade.id}
                item={upgrade}
                canInteract={canInteract}
                funds={currentPlayer.fishbucks}
                onConfirm={handleBuyUpgrade}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {summaryHeader}
          <Card className="card-game">
            <CardHeader>
              <CardTitle className="text-lg">Port Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Take a breath, patch up, and consult the dockhands.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full btn-ocean" disabled={!canInteract}>
                    Use Life Preserver
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
                  <DialogHeader>
                    <DialogTitle>Use Life Preserver</DialogTitle>
                    <DialogDescription>
                      Cash in on the port&apos;s hospitality to steady your nerves and shrug off the depths.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="pt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        className="btn-ocean"
                        disabled={!canInteract}
                        onClick={() => onAction({
                          type: 'USE_LIFE_PRESERVER',
                          playerId: currentPlayer.id,
                          payload: {}
                        })}
                      >
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline" disabled={!canInteract}>
                    Draw Dink Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
                  <DialogHeader>
                    <DialogTitle>Draw a Dink Card</DialogTitle>
                    <DialogDescription>
                      Take a quick side job for a dash of luck—or peril. Are you ready for the consequences?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="pt-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        className="btn-ocean"
                        disabled={!canInteract}
                        onClick={() => onAction({
                          type: 'DRAW_DINK',
                          playerId: currentPlayer.id,
                          payload: {}
                        })}
                      >
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
