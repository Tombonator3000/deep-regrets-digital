import { GameState, Player } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, Fish, ShoppingBag } from 'lucide-react';

interface LifePreserverUseProps {
  gameState: GameState;
  currentPlayer: Player;
  onAction: (action: any) => void;
}

export const LifePreserverUse = ({ gameState, currentPlayer, onAction }: LifePreserverUseProps) => {
  // Only show if this player owns the Life Preserver
  if (gameState.lifePreserverOwner !== currentPlayer.id) {
    return null;
  }

  const isAtSea = currentPlayer.location === 'sea';
  const isAtPort = currentPlayer.location === 'port';

  const handleUseLifePreserver = (useType: 'reduce_fish_difficulty' | 'reduce_shop_cost') => {
    onAction({
      type: 'USE_LIFE_PRESERVER',
      playerId: currentPlayer.id,
      payload: { useType }
    });
  };

  return (
    <Card className="card-game p-3 border-yellow-500/50 bg-yellow-900/20">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-yellow-400" />
            <span className="font-medium text-yellow-400 text-sm">Life Preserver</span>
          </div>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
            Aktiv
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          Du har Life Preserver! Bruk den for å få en fordel:
        </p>

        <div className="grid grid-cols-1 gap-2">
          {isAtSea && (
            <Button
              onClick={() => handleUseLifePreserver('reduce_fish_difficulty')}
              size="sm"
              variant="outline"
              className="w-full justify-start gap-2 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-900/30 text-xs"
            >
              <Fish className="h-3.5 w-3.5 text-blue-400" />
              <div className="text-left">
                <div className="font-medium">Reduser Vanskelighet -2</div>
                <div className="text-[10px] text-muted-foreground">For neste fangstforsøk</div>
              </div>
            </Button>
          )}

          {isAtPort && (
            <Button
              onClick={() => handleUseLifePreserver('reduce_shop_cost')}
              size="sm"
              variant="outline"
              className="w-full justify-start gap-2 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-900/30 text-xs"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
              <div className="text-left">
                <div className="font-medium">Rabatt -2$</div>
                <div className="text-[10px] text-muted-foreground">For neste kjøp</div>
              </div>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
