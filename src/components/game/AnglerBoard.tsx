import { Player, GameState, FishCard } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { getSlotMultiplier } from '@/utils/mounting';
import { Anchor, Fish, Skull, Coins, Brain, Dice6 } from 'lucide-react';
import { PlayerHand, CardDragData } from './PlayerHand';
import { LifebuoyToken, FishCoinToken, BoatToken } from './GameTokens';
import { AnimatedCounter } from './ParticleEffects';
import { CharacterCardModal } from './CharacterCardModal';
import { DragEvent, useState } from 'react';

interface AnglerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  gameState?: GameState;
  onMountFish?: (fish: FishCard, slotIndex: number) => void;
  onViewCaptainSheet?: () => void;
  compact?: boolean;
}

export const AnglerBoard = ({ player, isCurrentPlayer, gameState, onMountFish, onViewCaptainSheet, compact = false }: AnglerBoardProps) => {
  const hasLifePreserver = gameState?.lifePreserverOwner === player.id;
  const hasFishCoin = gameState?.fishCoinOwner === player.id;
  const mountingSlots = Array.from({ length: player.maxMountSlots }, (_, i) => i);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [showCharacterCard, setShowCharacterCard] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
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

  // Compact mode for mobile
  if (compact) {
    return (
      <div className="angler-board relative rounded-lg border border-primary/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-1.5 shadow-lg">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Anchor className="h-3.5 w-3.5 text-primary" />
            <button
              onClick={() => onViewCaptainSheet ? onViewCaptainSheet() : setShowCharacterCard(true)}
              className="text-xs font-bold text-primary-glow hover:text-primary hover:underline cursor-pointer transition-colors"
            >
              {player.name}
            </button>
          </div>
          {isCurrentPlayer && (
            <Badge className="bg-primary/20 text-primary-glow text-[10px] px-1 py-0">
              Your Turn
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-4 gap-0.5">
          <div className="flex items-center justify-center gap-0.5 rounded border border-fishbuck/30 bg-fishbuck/10 p-0.5 py-1">
            <Coins className="h-3 w-3 text-fishbuck" />
            <AnimatedCounter value={player.fishbucks} prefix="$" className="text-[10px] font-bold" />
          </div>
          <div className="flex items-center justify-center gap-0.5 rounded border border-destructive/30 bg-destructive/10 p-0.5 py-1">
            <Skull className="h-3 w-3 text-destructive" />
            <span className="text-[10px] font-bold text-destructive">{player.regrets.length}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5 rounded border border-purple-500/30 bg-purple-500/10 p-0.5 py-1">
            <Brain className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-400">{player.madnessLevel}</span>
          </div>
          <div className="flex items-center justify-center gap-0.5 rounded border border-primary/30 bg-primary/10 p-0.5 py-1">
            <Dice6 className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">{player.freshDice.length}</span>
          </div>
        </div>
        <CharacterCardModal
          characterId={player.character}
          open={showCharacterCard}
          onOpenChange={setShowCharacterCard}
        />
      </div>
    );
  }

  return (
    <div className="angler-board relative flex flex-col h-full min-h-0 rounded-xl border border-primary/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 p-2 shadow-lg overflow-hidden">
      {/* Compact Header */}
      <div className="shrink-0 mb-2 flex items-center justify-between border-b border-primary/20 pb-2">
        <div className="flex items-center gap-2">
          <Anchor className="h-4 w-4 text-primary" />
          <div>
            <button
              onClick={() => onViewCaptainSheet ? onViewCaptainSheet() : setShowCharacterCard(true)}
              className="text-sm font-bold text-primary-glow hover:text-primary hover:underline cursor-pointer transition-colors text-left"
            >
              {player.name}
            </button>
            <p className="text-xs text-muted-foreground">{player.character}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasLifePreserver && <LifebuoyToken size="sm" highlight />}
          {hasFishCoin && <FishCoinToken size="sm" highlight />}
          {isCurrentPlayer && (
            <Badge className="bg-primary/20 text-primary-glow text-xs px-1.5 py-0">
              Turn
            </Badge>
          )}
        </div>
      </div>

      {/* Trophy Mounting Slots - Compact */}
      <div className="shrink-0 mb-2">
        <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Fish className="h-3 w-3" />
          <span>Trophy Wall</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {mountingSlots.map((slotIndex) => {
            const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
            const multiplier = getSlotMultiplier(slotIndex);
            const isDropTarget = dragOverSlot === slotIndex;
            const canDrop = !mountedFish && isCurrentPlayer;

            return (
              <div
                key={slotIndex}
                className={`trophy-slot relative flex min-h-[50px] flex-col items-center justify-center rounded border p-1 text-center transition-all ${
                  mountedFish
                    ? 'border-fishbuck/50 bg-fishbuck/10'
                    : isDropTarget
                    ? 'border-primary border-solid bg-primary/20'
                    : canDrop
                    ? 'border-dashed border-white/30 bg-black/30'
                    : 'border-dashed border-white/20 bg-black/30'
                }`}
                onDragOver={(e) => handleDragOver(e, slotIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slotIndex)}
              >
                <div className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  multiplier >= 3 ? 'bg-fishbuck text-slate-900' :
                  multiplier >= 2 ? 'bg-primary text-slate-900' :
                  'bg-slate-700 text-white'
                }`}>
                  ×{multiplier}
                </div>

                {mountedFish ? (
                  <>
                    <span className="text-[10px] font-medium text-white line-clamp-1">{mountedFish.fish.name}</span>
                    <span className="text-[10px] font-bold text-fishbuck">{mountedFish.fish.value * multiplier}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Empty</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Dice & Stats */}
      <div className="shrink-0 grid grid-cols-2 gap-1 mb-2">
        <div className="rounded border border-primary/30 bg-primary/5 p-1">
          <div className="flex items-center gap-1 text-[10px] text-primary mb-1">
            <Dice6 className="h-3 w-3" />
            Fresh
          </div>
          <div className="flex flex-wrap gap-0.5">
            {player.freshDice.length > 0 ? (
              player.freshDice.map((value, index) => (
                <div key={`fresh-${index}`} className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-[10px] font-bold text-primary-glow">
                  {value}
                </div>
              ))
            ) : (
              <span className="text-[10px] text-muted-foreground">-</span>
            )}
          </div>
        </div>
        <div className="rounded border border-white/10 bg-black/30 p-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
            <Dice6 className="h-3 w-3 opacity-50" />
            Spent
          </div>
          <div className="flex flex-wrap gap-0.5">
            {player.spentDice.length > 0 ? (
              player.spentDice.map((value, index) => (
                <div key={`spent-${index}`} className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-[10px] font-bold text-muted-foreground opacity-50">
                  {value}
                </div>
              ))
            ) : (
              <span className="text-[10px] text-muted-foreground">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="shrink-0 grid grid-cols-3 gap-1 mb-2">
        <div className="flex flex-col items-center rounded border border-fishbuck/30 bg-fishbuck/10 p-1">
          <AnimatedCounter value={player.fishbucks} prefix="$" className="text-sm font-bold" />
        </div>
        <div className="flex flex-col items-center rounded border border-destructive/30 bg-destructive/10 p-1">
          <span className="text-sm font-bold text-destructive">{player.regrets.length}</span>
        </div>
        <div className="flex flex-col items-center rounded border border-purple-500/30 bg-purple-500/10 p-1">
          <span className="text-sm font-bold text-purple-400">{player.madnessLevel}</span>
        </div>
      </div>

      {/* Location */}
      <div className="shrink-0 flex justify-center mb-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${
          player.location === 'sea'
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-fishbuck/50 bg-fishbuck/10 text-fishbuck'
        }`}>
          {player.location === 'sea' ? (
            <>
              <BoatToken size="sm" color="primary" />
              <span>Sea D{player.currentDepth}</span>
            </>
          ) : (
            <>
              <Anchor className="h-3 w-3" />
              <span>Port</span>
            </>
          )}
        </div>
      </div>

      {/* Player Hand - Scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PlayerHand player={player} isCurrentPlayer={isCurrentPlayer} />
      </div>

      <CharacterCardModal
        characterId={player.character}
        open={showCharacterCard}
        onOpenChange={setShowCharacterCard}
      />
    </div>
  );
};
