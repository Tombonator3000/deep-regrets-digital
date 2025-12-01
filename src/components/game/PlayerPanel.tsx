import { useState } from 'react';
import { Player, RegretCard as RegretCardType } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { CHARACTER_PORTRAITS } from '@/data/characterPortraits';
import { CHARACTERS } from '@/data/characters';
import { RegretHand } from './RegretCard';
import { AnimatedCounter } from './ParticleEffects';
import { getSlotMultiplier } from '@/utils/mounting';
import {
  Anchor,
  Coins,
  Fish,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Skull,
  Brain,
  Dice6,
  Trophy,
  Wrench,
} from 'lucide-react';
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
  const [showCharacterInfo, setShowCharacterInfo] = useState(false);
  const [selectedRegret, setSelectedRegret] = useState<RegretCardType | null>(null);

  const character = CHARACTERS.find(c => c.id === player.character);
  const mountingSlots = Array.from({ length: player.maxMountSlots }, (_, i) => i);

  const handleToggleLocation = () => {
    onAction({
      type: 'CHANGE_LOCATION',
      playerId: player.id,
      payload: { location: player.location === 'sea' ? 'port' : 'sea' }
    });
  };

  const handlePass = () => {
    onAction({
      type: 'PASS',
      playerId: player.id,
      payload: {}
    });
  };

  // Calculate total trophy score
  const trophyScore = player.mountedFish.reduce(
    (sum, mount) => sum + mount.fish.value * mount.multiplier,
    0
  );

  return (
    <div className="space-y-4">
      {/* Captain Header */}
      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-primary/10">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-fishbuck blur-3xl" />
        </div>

        <div className="relative p-4">
          <div className="flex gap-4">
            {/* Portrait */}
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-primary/50 shadow-lg shadow-primary/20">
                <img
                  src={CHARACTER_PORTRAITS[player.character]}
                  alt={player.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {isCurrentPlayer && !player.hasPassed && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-lg">
                  TURN
                </div>
              )}
            </div>

            {/* Name and Title */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-primary-glow truncate">
                {player.name}
              </h2>
              {character && (
                <Badge variant="outline" className="mt-1 border-primary/40 bg-primary/10 text-primary/90">
                  {character.title}
                </Badge>
              )}
              {/* Fishbucks */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-fishbuck/30 bg-fishbuck/10 px-3 py-1.5">
                  <Coins className="h-4 w-4 text-fishbuck" />
                  <AnimatedCounter value={player.fishbucks} prefix="$" className="text-lg font-bold text-fishbuck" />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-col items-end gap-1">
              <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${
                player.location === 'sea'
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-fishbuck/40 bg-fishbuck/10 text-fishbuck'
              }`}>
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {player.location === 'sea' ? `Sea D${player.currentDepth}` : 'Port'}
                </span>
              </div>
              {player.hasPassed && (
                <Badge variant="outline" className="border-slate-500/40 text-slate-400">
                  Passed
                </Badge>
              )}
            </div>
          </div>

          {/* Character Info Toggle */}
          {character && (
            <button
              onClick={() => setShowCharacterInfo(!showCharacterInfo)}
              className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Anchor className="h-4 w-4" />
                Captain Info
              </span>
              {showCharacterInfo ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}

          {showCharacterInfo && character && (
            <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-white/80 leading-relaxed">
                {character.description}
              </p>
              <div className="rounded-lg border border-fishbuck/30 bg-fishbuck/10 p-3">
                <div className="flex items-center gap-1.5 text-xs text-fishbuck mb-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-semibold">Starting Bonus</span>
                </div>
                <p className="text-sm text-fishbuck/90">
                  {character.startingBonus}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-xl border border-destructive/30 bg-gradient-to-b from-destructive/10 to-destructive/5 p-3">
          <Skull className="h-5 w-5 text-destructive mb-1" />
          <span className="text-2xl font-bold text-destructive">{player.regrets.length}</span>
          <span className="text-xs text-destructive/80">Regrets</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-purple-500/5 p-3">
          <Brain className="h-5 w-5 text-purple-400 mb-1" />
          <span className="text-2xl font-bold text-purple-400">{player.madnessLevel}</span>
          <span className="text-xs text-purple-400/80">Madness</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-fishbuck/30 bg-gradient-to-b from-fishbuck/10 to-fishbuck/5 p-3">
          <Trophy className="h-5 w-5 text-fishbuck mb-1" />
          <span className="text-2xl font-bold text-fishbuck">{trophyScore}</span>
          <span className="text-xs text-fishbuck/80">Trophy Score</span>
        </div>
      </div>

      {/* Dice Tray */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Dice6 className="h-4 w-4 text-primary" />
            Dice Tray
          </h3>
          <span className="text-xs text-muted-foreground">
            {player.freshDice.length + player.spentDice.length}/{player.maxDice}
          </span>
        </div>

        <div className="space-y-3">
          {/* Fresh Dice */}
          <div>
            <div className="text-xs text-primary/80 mb-2 font-medium">Fresh Dice</div>
            <div className="flex flex-wrap gap-2">
              {player.freshDice.length > 0 ? (
                player.freshDice.map((value, index) => (
                  <div
                    key={`fresh-${index}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-gradient-to-br from-primary/20 to-primary/10 text-lg font-bold text-primary-glow shadow-inner"
                  >
                    {value}
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">No fresh dice</span>
              )}
            </div>
          </div>

          {/* Spent Dice */}
          {player.spentDice.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">Spent Dice</div>
              <div className="flex flex-wrap gap-2">
                {player.spentDice.map((value, index) => (
                  <div
                    key={`spent-${index}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-800/50 text-lg font-bold text-muted-foreground/50"
                  >
                    {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tackle Dice */}
          {player.tackleDice.length > 0 && (
            <div>
              <div className="text-xs text-cyan-400/80 mb-2 font-medium">Tackle Dice</div>
              <div className="flex flex-wrap gap-2">
                {player.tackleDice.map((dieId, index) => {
                  const die = TACKLE_DICE_LOOKUP[dieId];
                  return (
                    <div
                      key={`tackle-${index}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 text-lg font-bold text-cyan-400"
                      title={die?.name || dieId}
                    >
                      T
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <Wrench className="h-4 w-4 text-slate-400" />
          Equipment
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-muted-foreground mb-1">Rod</div>
            <div className="text-sm font-medium text-white">
              {player.equippedRod?.name || <span className="text-muted-foreground italic">None</span>}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-muted-foreground mb-1">Reel</div>
            <div className="text-sm font-medium text-white">
              {player.equippedReel?.name || <span className="text-muted-foreground italic">None</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Trophy Case */}
      <div className="rounded-xl border border-fishbuck/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <Fish className="h-4 w-4 text-fishbuck" />
          Trophy Wall
          {trophyScore > 0 && (
            <Badge className="ml-auto bg-fishbuck/20 text-fishbuck text-xs">
              {trophyScore} pts
            </Badge>
          )}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {mountingSlots.map((slotIndex) => {
            const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
            const multiplier = getSlotMultiplier(slotIndex);

            return (
              <div
                key={slotIndex}
                className={`relative flex min-h-[70px] flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                  mountedFish
                    ? 'border-fishbuck/50 bg-fishbuck/10'
                    : 'border-dashed border-white/20 bg-black/20'
                }`}
              >
                <div className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow ${
                  multiplier >= 3 ? 'bg-fishbuck text-slate-900' :
                  multiplier >= 2 ? 'bg-primary text-slate-900' :
                  'bg-slate-600 text-white'
                }`}>
                  ×{multiplier}
                </div>

                {mountedFish ? (
                  <>
                    <span className="text-xs font-medium text-white line-clamp-2 mb-1">{mountedFish.fish.name}</span>
                    <span className="text-sm font-bold text-fishbuck">
                      {mountedFish.fish.value} × {multiplier} = {mountedFish.fish.value * multiplier}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Empty</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regrets */}
      <div className="rounded-xl border border-destructive/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <Skull className="h-4 w-4 text-destructive" />
          Regrets
          <Badge variant="destructive" className="ml-1 text-xs">
            {player.regrets.length}
          </Badge>
          {player.regrets.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              (klikk for å lese)
            </span>
          )}
        </h3>
        <RegretHand
          regrets={player.regrets}
          isOwner={isCurrentPlayer}
          size="sm"
          onCardClick={(regret) => setSelectedRegret(regret)}
        />
      </div>

      {/* Regret Detail Modal */}
      <Dialog open={selectedRegret !== null} onOpenChange={(open) => !open && setSelectedRegret(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive flex items-center gap-2">
              <Skull className="h-5 w-5" />
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
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 btn-ocean"
            onClick={handleToggleLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Go to {player.location === 'sea' ? 'Port' : 'Sea'}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={handlePass}
          >
            Pass Turn
          </Button>
        </div>
      )}
    </div>
  );
};
