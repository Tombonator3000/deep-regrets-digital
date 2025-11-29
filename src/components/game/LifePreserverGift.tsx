import { GameState, Player } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, User } from 'lucide-react';

interface LifePreserverGiftProps {
  gameState: GameState;
  currentPlayer: Player;
  onAction: (action: any) => void;
}

export const LifePreserverGift = ({ gameState, currentPlayer, onAction }: LifePreserverGiftProps) => {
  // Only show if this player needs to give away the Life Preserver
  if (gameState.pendingLifePreserverGift?.fromPlayerId !== currentPlayer.id) {
    return null;
  }

  // Get other players to give the Life Preserver to
  const otherPlayers = gameState.players.filter(p => p.id !== currentPlayer.id);

  const handleGiveLifePreserver = (targetPlayerId: string) => {
    onAction({
      type: 'GIVE_LIFE_PRESERVER',
      playerId: currentPlayer.id,
      payload: { targetPlayerId }
    });
  };

  // Calculate dice totals for display
  const diceTotals = gameState.players.map(p => ({
    player: p,
    total: p.freshDice.reduce((sum, die) => sum + die, 0)
  }));

  return (
    <Card className="card-game p-4 border-yellow-500/50 bg-yellow-900/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold text-yellow-400">Gi Bort Life Preserver</h3>
        </div>

        <p className="text-sm text-foreground/80">
          Du har den høyeste terningsummen ({diceTotals.find(d => d.player.id === currentPlayer.id)?.total}) og må gi Life Preserver til en annen spiller.
        </p>

        <div className="text-xs text-muted-foreground mb-2">
          Life Preserver kan brukes til:
          <ul className="list-disc list-inside mt-1">
            <li>Reduser fiskevanskelighetsgrad med 2 (til sjøs)</li>
            <li>Reduser butikkpris med 2$ (i havnen)</li>
          </ul>
        </div>

        <div className="space-y-2">
          {otherPlayers.map(player => {
            const playerTotal = diceTotals.find(d => d.player.id === player.id)?.total ?? 0;
            return (
              <Button
                key={player.id}
                onClick={() => handleGiveLifePreserver(player.id)}
                variant="outline"
                className="w-full justify-between border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-900/30"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{player.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Terningsum: {playerTotal}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
