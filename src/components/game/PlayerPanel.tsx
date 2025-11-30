import { useState } from 'react';
import { Player, RegretCard as RegretCardType } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { CHARACTER_PORTRAITS } from '@/data/characterPortraits';
import { CHARACTERS } from '@/data/characters';
import { RegretHand } from './RegretCard';
import { AnimatedCounter } from './ParticleEffects';
import { Anchor, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  onAction: (action: any) => void;
}

export const PlayerPanel = ({ player, isCurrentPlayer, onAction }: PlayerPanelProps) => {
  const [showCharacterInfo, setShowCharacterInfo] = useState(true);
  const [selectedRegret, setSelectedRegret] = useState<RegretCardType | null>(null);

  const character = CHARACTERS.find(c => c.id === player.character);

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
      {/* Captain Header with Character Info */}
      <Card className="card-game border-primary/30 bg-gradient-to-b from-slate-900/90 to-slate-950">
        <CardContent className="p-3 space-y-3">
          {/* Player Header */}
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full border-2 border-primary/50 overflow-hidden flex-shrink-0">
              <img
                src={CHARACTER_PORTRAITS[player.character]}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-primary-glow truncate">
                {player.name}
              </h2>
              {character && (
                <Badge variant="outline" className="text-xs text-muted-foreground border-primary/30">
                  {character.title}
                </Badge>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold">
                <AnimatedCounter value={player.fishbucks} prefix="$" className="text-2xl font-bold" />
              </div>
              <div className="text-xs text-muted-foreground">Fishbucks</div>
            </div>
          </div>

          {/* Expandable Character Info */}
          {character && (
            <>
              <button
                onClick={() => setShowCharacterInfo(!showCharacterInfo)}
                className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-primary transition-colors py-1"
              >
                <span className="flex items-center gap-1">
                  <Anchor className="h-3 w-3" />
                  Captain Info
                </span>
                {showCharacterInfo ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              {showCharacterInfo && (
                <div className="space-y-2 pt-1">
                  <p className="text-sm text-white/80">
                    {character.description}
                  </p>
                  <div className="rounded-lg border border-fishbuck/30 bg-fishbuck/10 p-2">
                    <div className="flex items-center gap-1 text-xs text-fishbuck mb-1">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-semibold">Starting Bonus</span>
                    </div>
                    <p className="text-xs text-fishbuck/90">
                      {character.startingBonus}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
            {player.regrets.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                (klikk for å lese)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegretHand
            regrets={player.regrets}
            isOwner={isCurrentPlayer}
            size="sm"
            onCardClick={(regret) => setSelectedRegret(regret)}
          />
        </CardContent>
      </Card>

      {/* Regret Detail Modal */}
      <Dialog open={selectedRegret !== null} onOpenChange={(open) => !open && setSelectedRegret(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive flex items-center gap-2">
              Regret
            </DialogTitle>
          </DialogHeader>
          {selectedRegret && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-base text-white/90 italic">
                  "{selectedRegret.frontText}"
                </p>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Denne regret gir deg <span className="text-destructive font-bold">-{selectedRegret.value}</span> poeng ved spillets slutt.
              </DialogDescription>
              <div className="text-xs text-muted-foreground">
                Regrets påvirker ditt Madness-nivå og kan gi ulike effekter under spillet.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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