import { Player, GameState, FishCard } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { getSlotMultiplier } from '@/utils/mounting';
import { Anchor, Fish, Skull, Coins, Brain, Dice6 } from 'lucide-react';
import { PlayerHand, CardDragData } from './PlayerHand';
import { LifebuoyToken, FishCoinToken, BoatToken } from './GameTokens';
import { DragEvent, useState } from 'react';

interface AnglerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  gameState?: GameState;
  onMountFish?: (fish: FishCard, slotIndex: number) => void;
  compact?: boolean;
}

export const AnglerBoard = ({ player, isCurrentPlayer, gameState, onMountFish, compact = false }: AnglerBoardProps) => {
  const hasLifePreserver = gameState?.lifePreserverOwner === player.id;
  const hasFishCoin = gameState?.fishCoinOwner === player.id;
  const mountingSlots = Array.from({ length: player.maxMountSlots }, (_, i) => i);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
    // Only allow drop if slot is empty and player is current player
    if (!mountedFish && isCurrentPlayer) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverSlot(slotIndex);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    setDragOverSlot(null);

    const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
    if (mountedFish || !isCurrentPlayer) return;

    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const dragData: CardDragData = JSON.parse(data);
        if (dragData.type === 'fish' && onMountFish) {
          onMountFish(dragData.card as FishCard, slotIndex);
        }
      }
    } catch (err) {
      console.error('Failed to parse drag data', err);
    }
  };

  // Compact mode for mobile - show essential info only
  if (compact) {
    return (
      <div className="angler-board relative rounded-xl border border-primary/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-3 shadow-lg">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Anchor className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-glow">{player.name}</h3>
              <p className="text-xs text-muted-foreground">{player.character}</p>
            </div>
          </div>
          {isCurrentPlayer && (
            <Badge className="bg-primary/20 text-primary-glow animate-pulse text-xs">
              Your Turn
            </Badge>
          )}
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="flex flex-col items-center rounded-lg border border-fishbuck/30 bg-fishbuck/10 p-1.5">
            <Coins className="h-3 w-3 text-fishbuck" />
            <span className="text-sm font-bold text-fishbuck">${player.fishbucks}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/10 p-1.5">
            <Skull className="h-3 w-3 text-destructive" />
            <span className="text-sm font-bold text-destructive">{player.regrets.length}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-purple-500/30 bg-purple-500/10 p-1.5">
            <Brain className="h-3 w-3 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">{player.madnessLevel}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-primary/30 bg-primary/10 p-1.5">
            <Dice6 className="h-3 w-3 text-primary" />
            <span className="text-sm font-bold text-primary">{player.freshDice.length}</span>
          </div>
        </div>

        {/* Compact Dice Display */}
        <div className="flex flex-wrap gap-1 mb-3">
          {player.freshDice.map((value, index) => (
            <div
              key={`fresh-${index}`}
              className="flex h-7 w-7 items-center justify-center rounded bg-primary/20 text-xs font-bold text-primary-glow"
            >
              {value}
            </div>
          ))}
        </div>

        {/* Compact Location */}
        <div
          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
            player.location === 'sea'
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-fishbuck/50 bg-fishbuck/10 text-fishbuck'
          }`}
        >
          {player.location === 'sea' ? `At Sea (Depth ${player.currentDepth})` : 'In Port'}
        </div>
      </div>
    );
  }

  return (
    <div className="angler-board relative rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 p-4 shadow-xl">
      {/* Board Header - Player Info */}
      <div className="mb-4 flex items-center justify-between border-b border-primary/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-primary-glow">{player.name}</h3>
            <p className="text-xs text-muted-foreground">{player.character}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Special Token Indicators */}
          {hasLifePreserver && (
            <div className="animate-token-appear" title="Owns Life Preserver - Protection from regrets">
              <LifebuoyToken size="sm" highlight animated />
            </div>
          )}
          {hasFishCoin && (
            <div className="animate-token-appear" title="Owns Fish Coin - Bonus earnings">
              <FishCoinToken size="sm" highlight animated />
            </div>
          )}
          {isCurrentPlayer && (
            <Badge className="bg-primary/20 text-primary-glow animate-pulse">
              Your Turn
            </Badge>
          )}
        </div>
      </div>

      {/* Trophy Mounting Slots - Key Feature from Board Game */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Fish className="h-3 w-3" />
          <span>Trophy Wall</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {mountingSlots.map((slotIndex) => {
            const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
            const multiplier = getSlotMultiplier(slotIndex);

            const isDropTarget = dragOverSlot === slotIndex;
            const canDrop = !mountedFish && isCurrentPlayer;

            return (
              <div
                key={slotIndex}
                className={`trophy-slot relative flex min-h-[80px] flex-col items-center justify-center rounded-lg border-2 p-2 text-center transition-all ${
                  mountedFish
                    ? 'border-fishbuck/50 bg-fishbuck/10'
                    : isDropTarget
                    ? 'border-primary border-solid bg-primary/20 scale-105 shadow-lg'
                    : canDrop
                    ? 'border-dashed border-white/30 bg-black/30 hover:border-primary/50 hover:bg-primary/5'
                    : 'border-dashed border-white/20 bg-black/30'
                }`}
                onDragOver={(e) => handleDragOver(e, slotIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slotIndex)}
              >
                {/* Multiplier Badge */}
                <div className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  multiplier >= 3 ? 'bg-fishbuck text-slate-900' :
                  multiplier >= 2 ? 'bg-primary text-slate-900' :
                  'bg-slate-700 text-white'
                }`}>
                  ×{multiplier}
                </div>

                {mountedFish ? (
                  <>
                    <Fish className="mb-1 h-4 w-4 text-fishbuck" />
                    <span className="text-xs font-medium text-white line-clamp-2">
                      {mountedFish.fish.name}
                    </span>
                    <span className="mt-1 text-xs font-bold text-fishbuck">
                      {mountedFish.fish.value} × {multiplier} = {mountedFish.fish.value * multiplier}
                    </span>
                  </>
                ) : (
                  <>
                    <div className={`h-8 w-8 rounded border border-dashed ${isDropTarget ? 'border-primary/60' : 'border-white/20'}`} />
                    <span className={`mt-1 text-xs ${isDropTarget ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {isDropTarget ? 'Slipp for å montere' : 'Dra fisk hit'}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dice Tray - Fresh & Spent */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* Fresh Dice */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
            <Dice6 className="h-3 w-3" />
            <span>Fresh Dice</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {player.freshDice.length > 0 ? (
              player.freshDice.map((value, index) => (
                <div
                  key={`fresh-${index}`}
                  className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-sm font-bold text-primary-glow"
                >
                  {value}
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">None</span>
            )}
          </div>
        </div>

        {/* Spent Dice */}
        <div className="rounded-lg border border-white/10 bg-black/30 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Dice6 className="h-3 w-3 opacity-50" />
            <span>Spent Dice</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {player.spentDice.length > 0 ? (
              player.spentDice.map((value, index) => (
                <div
                  key={`spent-${index}`}
                  className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-sm font-bold text-muted-foreground opacity-50"
                >
                  {value}
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row - Like Edge Trackers on Physical Board */}
      <div className="grid grid-cols-3 gap-2">
        {/* Fishbucks */}
        <div className="flex flex-col items-center rounded-lg border border-fishbuck/30 bg-fishbuck/10 p-2">
          <Coins className="mb-1 h-4 w-4 text-fishbuck" />
          <span className="text-lg font-bold text-fishbuck">${player.fishbucks}</span>
          <span className="text-xs text-muted-foreground">Fishbucks</span>
        </div>

        {/* Regrets */}
        <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/10 p-2">
          <Skull className="mb-1 h-4 w-4 text-destructive" />
          <span className="text-lg font-bold text-destructive">{player.regrets.length}</span>
          <span className="text-xs text-muted-foreground">Regrets</span>
        </div>

        {/* Madness */}
        <div className="flex flex-col items-center rounded-lg border border-purple-500/30 bg-purple-500/10 p-2">
          <Brain className="mb-1 h-4 w-4 text-purple-400" />
          <span className="text-lg font-bold text-purple-400">{player.madnessLevel}</span>
          <span className="text-xs text-muted-foreground">Madness</span>
        </div>
      </div>

      {/* Location Badge with Token */}
      <div className="mt-4 flex justify-center">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            player.location === 'sea'
              ? 'border-primary/50 bg-primary/10'
              : 'border-fishbuck/50 bg-fishbuck/10'
          }`}
        >
          {player.location === 'sea' ? (
            <>
              <BoatToken size="sm" animated color="primary" />
              <span className="text-sm font-medium text-primary">
                At Sea (Depth {player.currentDepth})
              </span>
            </>
          ) : (
            <>
              <Anchor className="h-4 w-4 text-fishbuck" />
              <span className="text-sm font-medium text-fishbuck">In Port</span>
            </>
          )}
        </div>
      </div>

      {/* Player Hand - Cards */}
      <div className="mt-4">
        <PlayerHand
          player={player}
          isCurrentPlayer={isCurrentPlayer}
        />
      </div>
    </div>
  );
};
