import { useState } from 'react';
import { Anchor, Fish as FishIcon, Wrench, Sparkles, ShoppingBag, Store, Package, CircleDollarSign, Trophy, Zap, Skull, Ship } from 'lucide-react';
import { RegretDeck } from './RegretCard';
import { AnchorToken, BoatToken, BoatColor } from './GameTokens';

import harborPortBoard from '@/assets/harbor-port-board.jpg';

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
import { calculateFishSaleValue, hasPortDiscount } from '@/utils/gameEngine';
import { getSlotMultiplier } from '@/utils/mounting';
import { TACKLE_DICE } from '@/data/tackleDice';
import { GameState, GameAction } from '@/types/game';
import { cn } from '@/lib/utils';

interface PortBoardProps {
  gameState: GameState;
  playerColors: Record<string, BoatColor>;
  onAction: (action: GameAction) => void;
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
  hasDiscount: boolean;
  onConfirm: (upgradeId: string, cost: number) => void;
}

const UpgradeOption = ({ item, canInteract, funds, hasDiscount, onConfirm }: UpgradeOptionProps) => {
  const effectiveCost = hasDiscount ? Math.max(0, item.cost - 1) : item.cost;

  return (
    <Card className="card-game border border-border/60">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>{item.name}</span>
          <span className="flex items-center gap-1">
            {hasDiscount && item.cost > 0 && (
              <span className="text-muted-foreground line-through text-xs">${item.cost}</span>
            )}
            <span className={hasDiscount ? 'text-green-400' : 'text-primary-glow'}>${effectiveCost}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        <p className="mb-3 leading-relaxed">{item.description}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="btn-ocean w-full"
              disabled={!canInteract || funds < effectiveCost}
            >
              Purchase Upgrade
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Spend <span className={hasDiscount ? 'text-green-400 font-semibold' : 'text-primary-glow font-semibold'}>${effectiveCost}</span>
                {hasDiscount && <span className="text-green-400 text-xs ml-1">(rabatt!)</span>} to acquire the {item.name}.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              You currently hold <span className="font-semibold text-primary-glow">${funds}</span>. After purchase you&apos;ll have{' '}
              <span className="font-semibold text-primary-glow">${Math.max(funds - effectiveCost, 0)}</span> remaining.
            </p>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  className="btn-ocean"
                  disabled={!canInteract || funds < effectiveCost}
                  onClick={() => onConfirm(item.id, effectiveCost)}
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
};

export const PortBoard = ({ gameState, playerColors, onAction, className }: PortBoardProps) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const canInteract = currentPlayer.location === 'port' && !currentPlayer.hasPassed;
  const [activeMountFishId, setActiveMountFishId] = useState<string | null>(null);
  const [selectedMountSlot, setSelectedMountSlot] = useState<number | null>(null);
  const portPlayers = gameState.players.filter((player) => player.location === 'port');

  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    if (currentPlayer.fishbucks >= cost) {
      onAction({
        type: 'BUY_UPGRADE',
        playerId: currentPlayer.id,
        payload: { upgradeId }
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

  const standardTackleDie = TACKLE_DICE[0];
  const mountingSlots = Array.from({ length: currentPlayer.maxMountSlots }, (_, i) => i);

  const handleBuyTackleDice = (dieId: string, count: number) => {
    const selectedDie = TACKLE_DICE.find(die => die.id === dieId);
    if (!selectedDie) {
      return;
    }

    const totalCost = selectedDie.cost * count;
    if (currentPlayer.fishbucks >= totalCost) {
      onAction({
        type: 'BUY_TACKLE_DICE',
        playerId: currentPlayer.id,
        payload: { dieId, count }
      });
    }
  };

  const hasDiscount = hasPortDiscount(currentPlayer.regrets.length);

  const summaryHeader = (
    <div className="flex items-center justify-between rounded border border-border/60 bg-background/60 px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
      <span>
        Funds: <span className="text-primary-glow font-semibold">${currentPlayer.fishbucks}</span>
      </span>
      <div className="flex items-center gap-3">
        {hasDiscount && (
          <span className="flex items-center gap-1 rounded bg-green-500/20 px-2 py-0.5 text-green-400">
            <CircleDollarSign className="h-3 w-3" />
            -$1 rabatt
          </span>
        )}
        <span>
          Madness: <span className="text-destructive font-semibold">{currentPlayer.madnessLevel}</span>
        </span>
      </div>
    </div>
  );

  return (
    <div className={cn('flex h-full flex-col space-y-6', className)}>
      {summaryHeader}

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-slate-950/60">
        <img
          src={harborPortBoard}
          alt="Harbor Port board"
          className="h-48 w-full object-cover object-center sm:h-56"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/40 to-slate-950/80" />
        {portPlayers.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 flex flex-wrap gap-2">
            {portPlayers.map((player) => {
              const playerIndex = gameState.players.findIndex((p) => p.id === player.id);
              const isCurrentTurn = playerIndex === gameState.currentPlayerIndex;
              const color = playerColors[player.id] ?? 'primary';

              return (
                <div
                  key={player.id}
                  className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/15 bg-slate-900/85 px-2 py-1 shadow-sm"
                >
                  <BoatToken
                    size="sm"
                    color={color}
                    animated
                    highlight={isCurrentTurn}
                    className={isCurrentTurn ? 'animate-[boat-bob_1.6s_ease-in-out_infinite]' : ''}
                  />
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-white">{player.name}</div>
                    <div className="text-[10px] text-muted-foreground">{player.isAI ? 'AI' : 'Spiller'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Show anchor/ship when player is at port */}
        {currentPlayer.location === 'port' && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-2 backdrop-blur-sm border border-primary/30">
            <BoatToken
              size="sm"
              color={playerColors[currentPlayer.id] ?? 'primary'}
              animated
              highlight
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-primary">{currentPlayer.name}</span>
              <span className="text-[10px] text-muted-foreground">I havnen</span>
            </div>
          </div>
        )}
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
          {/* Trophy Wall - Mounted Fish Display */}
          <div className="rounded-xl border-2 border-fishbuck/30 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fishbuck/20">
                <Trophy className="h-4 w-4 text-fishbuck" />
              </div>
              <div>
                <h3 className="font-bold text-fishbuck">Trophy Wall</h3>
                <p className="text-xs text-muted-foreground">Your prized catches mounted for glory</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {mountingSlots.map((slotIndex) => {
                const mountedFish = currentPlayer.mountedFish.find((m) => m.slot === slotIndex);
                const multiplier = getSlotMultiplier(slotIndex);
                return (
                  <div
                    key={`trophy-${slotIndex}`}
                    className={`relative flex min-h-[70px] flex-col items-center justify-center rounded-lg border-2 p-2 text-center ${
                      mountedFish
                        ? 'border-fishbuck/50 bg-fishbuck/10'
                        : 'border-dashed border-white/20 bg-black/30'
                    }`}
                  >
                    <div className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      multiplier >= 3 ? 'bg-fishbuck text-slate-900' : multiplier >= 2 ? 'bg-primary text-slate-900' : 'bg-slate-700 text-white'
                    }`}>
                      ×{multiplier}
                    </div>
                    {mountedFish ? (
                      <>
                        <FishIcon className="mb-1 h-4 w-4 text-fishbuck" />
                        <span className="text-xs font-medium text-white line-clamp-1">{mountedFish.fish.name}</span>
                        <span className="text-xs font-bold text-fishbuck">{mountedFish.fish.value * multiplier} pts</span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Empty Slot</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="card-game">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FishIcon className="h-5 w-5 text-primary" />
                Fish in Hold
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentPlayer.handFish.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No fish aboard. Head out to sea to bring something back.
                </p>
              )}
              {currentPlayer.handFish.map((fish) => {
                const saleDetails = calculateFishSaleValue(fish, currentPlayer.regrets.length);
                const modifierText = saleDetails.modifier !== 0
                  ? ` • Modifiers ${saleDetails.modifier > 0 ? '+' : ''}${saleDetails.modifier}`
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
                          Base {saleDetails.baseValue}{modifierText}
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
                                {fish.quality === 'foul' ? (
                                  <>and draw 1 Regret.</>
                                ) : (
                                  <>with no additional effects.</>
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

                        <Dialog
                          onOpenChange={(open) => {
                            setSelectedMountSlot(null);
                            setActiveMountFishId((current) => {
                              if (open) {
                                return fish.id;
                              }
                              return current === fish.id ? null : current;
                            });
                          }}
                        >
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
                            <div className="flex flex-col gap-2 pt-2">
                              <p className="text-xs text-muted-foreground">Choose a mounting slot:</p>
                              <div className="flex flex-col gap-2 sm:flex-row">
                                {mountingSlots.map((slotIndex) => {
                                  const isOccupied = currentPlayer.mountedFish.some((mount) => mount.slot === slotIndex);
                                  const multiplier = getSlotMultiplier(slotIndex);
                                  const isSelected =
                                    activeMountFishId === fish.id && selectedMountSlot === slotIndex && !isOccupied;

                                  return (
                                    <Button
                                      key={slotIndex}
                                      disabled={isOccupied}
                                      variant={isOccupied ? 'secondary' : 'outline'}
                                      size="sm"
                                      className={cn('flex-1 text-xs', isSelected && 'btn-ocean')}
                                      onClick={() => {
                                        if (!isOccupied) {
                                          setActiveMountFishId(fish.id);
                                          setSelectedMountSlot(slotIndex);
                                        }
                                      }}
                                    >
                                      Slot {slotIndex + 1} (×{multiplier})
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                            <DialogFooter className="pt-4">
                              <DialogClose asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setActiveMountFishId(null);
                                    setSelectedMountSlot(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  className="btn-ocean"
                                  disabled={
                                    !canInteract ||
                                    activeMountFishId !== fish.id ||
                                    selectedMountSlot === null ||
                                    currentPlayer.mountedFish.some((mount) => mount.slot === selectedMountSlot)
                                  }
                                  onClick={() => {
                                    if (selectedMountSlot !== null) {
                                      handleMountFish(fish.id, selectedMountSlot);
                                      setActiveMountFishId(null);
                                      setSelectedMountSlot(null);
                                    }
                                  }}
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
          {/* Tackle Dice Shop */}
          <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-glow">Tackle Dice</h3>
                <p className="text-xs text-muted-foreground">Extra dice for daring catches</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((count) => {
                if (!standardTackleDie) return null;
                const cost = count * standardTackleDie.cost;
                const canAfford = currentPlayer.fishbucks >= cost;
                return (
                  <Dialog key={count}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className={`h-16 flex flex-col items-center justify-center gap-1 ${
                          canAfford ? 'border-primary/40 hover:border-primary hover:bg-primary/10' : 'opacity-50'
                        }`}
                        disabled={!canInteract || !canAfford}
                      >
                        <span className="text-lg font-bold">{count}x</span>
                        <span className="text-xs text-fishbuck">${cost}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background/85 backdrop-blur-lg border-border/60">
                      <DialogHeader>
                        <DialogTitle>Buy {count} Tackle Dice</DialogTitle>
                        <DialogDescription>
                          This purchase costs <span className="text-primary-glow font-semibold">${cost}</span>.
                        </DialogDescription>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">
                        Remaining funds: <span className="text-primary-glow font-semibold">${Math.max(currentPlayer.fishbucks - cost, 0)}</span>
                      </p>
                      <DialogFooter className="pt-4">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <DialogClose asChild>
                          <Button className="btn-ocean" disabled={!canInteract || !canAfford} onClick={() => handleBuyTackleDice(standardTackleDie.id, count)}>
                            Confirm Purchase
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </div>

          {/* Shop Sections - Like Physical Board Game Shops */}
          <div className="space-y-4">
            {/* Rods Shop */}
            <div className="rounded-xl border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-slate-950/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-cyan-400">Rod Shop</h3>
                  <p className="text-xs text-muted-foreground">Enhance your fishing technique</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {gameState.port.shops.rods.length > 0 ? (
                  gameState.port.shops.rods.map((rod) => (
                    <UpgradeOption key={rod.id} item={rod} canInteract={canInteract} funds={currentPlayer.fishbucks} hasDiscount={hasDiscount} onConfirm={handleBuyUpgrade} />
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">Sold out!</p>
                )}
              </div>
            </div>

            {/* Reels Shop */}
            <div className="rounded-xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-950/40 to-slate-950/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                  <Store className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-400">Reel Shop</h3>
                  <p className="text-xs text-muted-foreground">Mechanical advantages for the deep</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {gameState.port.shops.reels.length > 0 ? (
                  gameState.port.shops.reels.map((reel) => (
                    <UpgradeOption key={reel.id} item={reel} canInteract={canInteract} funds={currentPlayer.fishbucks} hasDiscount={hasDiscount} onConfirm={handleBuyUpgrade} />
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">Sold out!</p>
                )}
              </div>
            </div>

            {/* Supplies Shop */}
            <div className="rounded-xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-950/40 to-slate-950/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                  <Package className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-400">Supplies Shop</h3>
                  <p className="text-xs text-muted-foreground">Essential gear and provisions</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {gameState.port.shops.supplies.length > 0 ? (
                  gameState.port.shops.supplies.map((supply) => (
                    <UpgradeOption key={supply.id} item={supply} canInteract={canInteract} funds={currentPlayer.fishbucks} hasDiscount={hasDiscount} onConfirm={handleBuyUpgrade} />
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">Sold out!</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {/* Regrets Deck Display */}
          <div className="rounded-xl border-2 border-destructive/30 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RegretDeck count={gameState.port.regretsDeck.length} size="md" />
                <div>
                  <h3 className="font-bold text-destructive flex items-center gap-2">
                    <Skull className="h-4 w-4" />
                    Regrets Deck
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {gameState.port.regretsDeck.length} cards remaining
                  </p>
                  <p className="text-xs text-destructive/60 mt-1">
                    Discard: {gameState.port.regretsDiscard.length} cards
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Your Regrets</div>
                <div className="text-2xl font-bold text-destructive">{currentPlayer.regrets.length}</div>
              </div>
            </div>
          </div>

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
