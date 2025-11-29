import { GameState, Player } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, Trash2, Coins, SkipForward } from 'lucide-react';

interface PassingRewardProps {
  gameState: GameState;
  currentPlayer: Player;
  onAction: (action: any) => void;
}

export const PassingReward = ({ gameState, currentPlayer, onAction }: PassingRewardProps) => {
  // Only show if this player has a pending passing reward
  if (gameState.pendingPassingReward?.playerId !== currentPlayer.id) {
    return null;
  }

  const hasRegrets = currentPlayer.regrets.length > 0;
  const isFirstPass = gameState.pendingPassingReward.isFirstPass;

  const handleClaimReward = (choice: 'draw_dink' | 'discard_regret') => {
    onAction({
      type: 'CLAIM_PASSING_REWARD',
      playerId: currentPlayer.id,
      payload: { choice }
    });
  };

  return (
    <Card className="card-game p-4 border-green-500/50 bg-green-900/20">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {isFirstPass ? (
            <Gift className="h-5 w-5 text-green-400" />
          ) : (
            <SkipForward className="h-5 w-5 text-blue-400" />
          )}
          <h3 className="font-semibold text-green-400">
            {isFirstPass ? 'Passeringsbelønning' : 'Hoppet Over-belønning'}
          </h3>
          {isFirstPass && <Badge className="bg-yellow-600 text-xs">Fish Coin</Badge>}
        </div>

        <p className="text-sm text-foreground/80">
          {isFirstPass
            ? 'Du var første til å passe og har mottatt Fish Coin! Du blir førstespiller neste dag.'
            : 'Du ble hoppet over i turrekkefølgen og har rett på en belønning!'}
        </p>

        <p className="text-sm text-foreground/80">
          Velg en belønning:
        </p>

        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => handleClaimReward('draw_dink')}
            variant="outline"
            className="w-full justify-start gap-2 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-900/30"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <div className="text-left">
              <div className="font-medium">Trekk Dink</div>
              <div className="text-xs text-muted-foreground">Få et nytt Dink-kort</div>
            </div>
          </Button>

          <Button
            onClick={() => handleClaimReward('discard_regret')}
            disabled={!hasRegrets}
            variant="outline"
            className={`w-full justify-start gap-2 ${
              hasRegrets
                ? 'border-red-500/30 hover:border-red-500/60 hover:bg-red-900/30'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            <div className="text-left">
              <div className="font-medium">Kast Tilfeldig Regret</div>
              <div className="text-xs text-muted-foreground">
                {hasRegrets
                  ? `Fjern 1 av dine ${currentPlayer.regrets.length} Regrets`
                  : 'Du har ingen Regrets'}
              </div>
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
};
