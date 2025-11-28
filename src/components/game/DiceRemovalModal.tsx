import { useState, useEffect } from 'react';
import { GameState, GameAction, Player } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Dice6, AlertTriangle } from 'lucide-react';

interface DiceRemovalModalProps {
  gameState: GameState;
  onAction: (action: GameAction) => void;
}

export const DiceRemovalModal = ({ gameState, onAction }: DiceRemovalModalProps) => {
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);

  const pendingRemoval = gameState.pendingDiceRemoval;
  const player = pendingRemoval
    ? gameState.players.find(p => p.id === pendingRemoval.playerId)
    : null;

  const isOpen = Boolean(pendingRemoval && player);

  // Reset selection when modal opens/closes or count changes
  useEffect(() => {
    setSelectedDieIndex(null);
  }, [pendingRemoval?.count]);

  const handleRemoveDie = () => {
    if (selectedDieIndex === null || !player) return;

    onAction({
      type: 'REMOVE_DIE',
      playerId: player.id,
      payload: { dieIndex: selectedDieIndex },
    });

    setSelectedDieIndex(null);
  };

  if (!player || !pendingRemoval) {
    return null;
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="max-w-md bg-slate-950/95 backdrop-blur-xl border border-amber-500/30 p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle className="text-xl font-bold">Velg Terning å Fjerne</DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            Din terninggrense har blitt redusert. Du må fjerne{' '}
            <span className="font-bold text-amber-400">{pendingRemoval.count}</span>{' '}
            terning{pendingRemoval.count > 1 ? 'er' : ''}.
            Velg hvilken terning du vil fjerne.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Dice info */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Terninger: {player.freshDice.length} / Maks: {player.maxDice}
            </span>
            <span className="flex items-center gap-1">
              <Dice6 className="h-4 w-4" />
              Må fjernes: {pendingRemoval.count}
            </span>
          </div>

          {/* Dice selection grid */}
          <div className="grid grid-cols-4 gap-3">
            {player.freshDice.map((value, index) => (
              <Button
                key={`die-${index}-${value}`}
                type="button"
                variant={selectedDieIndex === index ? 'default' : 'outline'}
                className={`
                  h-14 w-14 text-lg font-bold transition-all
                  ${selectedDieIndex === index
                    ? 'bg-amber-500 hover:bg-amber-600 text-black border-amber-400 ring-2 ring-amber-300 scale-110'
                    : 'border-primary/40 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary-glow'
                  }
                `}
                onClick={() => setSelectedDieIndex(index)}
              >
                {value}
              </Button>
            ))}
          </div>

          {/* Hint text */}
          <p className="text-xs text-slate-500 text-center">
            Tips: Fjern lav-verdi terninger for å beholde de høye.
          </p>

          {/* Confirm button */}
          <Button
            className="w-full btn-ocean"
            disabled={selectedDieIndex === null}
            onClick={handleRemoveDie}
          >
            {selectedDieIndex !== null
              ? `Fjern Terning (${player.freshDice[selectedDieIndex]})`
              : 'Velg en terning å fjerne'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
