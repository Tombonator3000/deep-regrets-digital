import { Player } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { RegretHand } from './RegretCard';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  onAction: (action: any) => void;
}

export const PlayerPanel = ({ player, isCurrentPlayer, onAction }: PlayerPanelProps) => {
  const handleRollDice = () => {
    onAction({
      type: 'ROLL_DICE',
      playerId: player.id,
      payload: {}
    });
  };

  const handlePass = () => {
    onAction({
      type: 'PASS',
      playerId: player.id,
      payload: {}
    });
  };

  const handleToggleLocation = () => {
    onAction({
      type: 'CHANGE_LOCATION',
      playerId: player.id,
      payload: { location: player.location === 'sea' ? 'port' : 'sea' }
    });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Player Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-primary">{player.name}</h3>
          <p className="text-sm text-muted-foreground">{player.character}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-fishbuck">${player.fishbucks}</div>
          <div className="text-xs text-muted-foreground">Fishbucks</div>
        </div>
      </div>

      {/* Location & Status */}
      <div className="flex items-center space-x-4">
        <Badge variant={player.location === 'sea' ? 'default' : 'secondary'}>
          {player.location === 'sea' ? '🌊 At Sea' : '⚓ In Port'}
          {player.location === 'sea' && ` (Depth ${player.currentDepth})`}
        </Badge>
        {player.hasPassed && (
          <Badge variant="outline" className="text-muted-foreground">
            Passed
          </Badge>
        )}
        {isCurrentPlayer && !player.hasPassed && (
          <Badge className="bg-primary">Your Turn</Badge>
        )}
      </div>

      {/* Dice Tray */}
      <Card className="card-game">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Dice ({player.freshDice.length + player.spentDice.length}/{player.maxDice})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Fresh Dice */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Fresh Dice:</div>
            <div className="flex space-x-2">
              {player.freshDice.map((value, index) => (
                <div key={`fresh-${index}`} className="dice-face">
                  {value}
                </div>
              ))}
              {player.freshDice.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No fresh dice</div>
              )}
            </div>
          </div>

          {/* Spent Dice */}
          {player.spentDice.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Spent Dice:</div>
              <div className="flex space-x-2">
                {player.spentDice.map((value, index) => (
                  <div key={`spent-${index}`} className="dice-face opacity-50">
                    {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tackle Dice */}
          {player.tackleDice.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Tackle Dice:</div>
              <div className="flex space-x-2">
                {player.tackleDice.map((dieId, index) => {
                  const die = TACKLE_DICE_LOOKUP[dieId];
                  const borderColor = die?.color ?? 'slate';
                  return (
                    <div key={`tackle-${index}`} className={`dice-face border-${borderColor}-500`}>
                      T
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="card-game">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs">
            <div className="flex justify-between">
              <span>Rod:</span>
              <span className="text-primary">{player.equippedRod?.name || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Reel:</span>
              <span className="text-primary">{player.equippedReel?.name || 'None'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mounted Fish */}
      {player.mountedFish.length > 0 && (
        <Card className="card-game">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trophy Case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {player.mountedFish.map((mount, index) => (
              <div key={index} className="text-xs flex justify-between">
                <span>{mount.fish.name}</span>
                <span className="text-fishbuck">
                  {mount.fish.value} × {mount.multiplier} = {mount.fish.value * mount.multiplier}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Regrets */}
      <Card className="card-game">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            Regrets
            <Badge variant="destructive" className="ml-2 text-xs">
              {player.regrets.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegretHand
            regrets={player.regrets}
            isOwner={isCurrentPlayer}
            size="sm"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isCurrentPlayer && !player.hasPassed && (
        <div className="space-y-2">
          <Button 
            className="w-full btn-ocean" 
            onClick={handleToggleLocation}
            size="sm"
          >
            Go to {player.location === 'sea' ? 'Port' : 'Sea'}
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handlePass}
            size="sm"
          >
            Pass Turn
          </Button>
        </div>
      )}
    </div>
  );
};