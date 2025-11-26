import { Player } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { getSlotMultiplier } from '@/utils/mounting';
import { Anchor, Fish, Skull, Coins, Brain, Dice6 } from 'lucide-react';
import { PlayerHand } from './PlayerHand';

interface AnglerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export const AnglerBoard = ({ player, isCurrentPlayer }: AnglerBoardProps) => {
  const mountingSlots = Array.from({ length: player.maxMountSlots }, (_, i) => i);

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
        {isCurrentPlayer && (
          <Badge className="bg-primary/20 text-primary-glow animate-pulse">
            Your Turn
          </Badge>
        )}
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

            return (
              <div
                key={slotIndex}
                className={`trophy-slot relative flex min-h-[80px] flex-col items-center justify-center rounded-lg border-2 p-2 text-center transition-all ${
                  mountedFish
                    ? 'border-fishbuck/50 bg-fishbuck/10'
                    : 'border-dashed border-white/20 bg-black/30'
                }`}
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
                    <div className="h-8 w-8 rounded border border-dashed border-white/20" />
                    <span className="mt-1 text-xs text-muted-foreground">Empty</span>
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

      {/* Location Badge */}
      <div className="mt-4 flex justify-center">
        <Badge
          variant="outline"
          className={`px-4 py-1 ${
            player.location === 'sea'
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-fishbuck/50 bg-fishbuck/10 text-fishbuck'
          }`}
        >
          {player.location === 'sea' ? `🌊 At Sea (Depth ${player.currentDepth})` : '⚓ In Port'}
        </Badge>
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
