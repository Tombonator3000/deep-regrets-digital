import { useState, useMemo } from 'react';
import { Player, RegretCard as RegretCardType } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { CHARACTER_PORTRAITS } from '@/data/characterPortraits';
import { CHARACTERS, CHARACTER_THEMES } from '@/data/characters';
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

  // Get character-specific theme colors
  const theme = useMemo(() => {
    return CHARACTER_THEMES[player.character] || CHARACTER_THEMES.bert;
  }, [player.character]);

  // CSS custom properties for character theming
  const themeStyle = useMemo(() => ({
    '--char-primary': theme.primary,
    '--char-primary-glow': theme.primaryGlow,
    '--char-secondary': theme.secondary,
    '--char-background': theme.background,
    '--char-border': theme.border,
  } as React.CSSProperties), [theme]);

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
    <div className="captain-info-panel space-y-4" style={themeStyle}>
      {/* Captain Header - Board Game Style */}
      <div className="board-game-frame relative overflow-hidden">
        {/* Wood/paper texture overlay is handled by CSS */}

        <div className="relative p-4 z-[1]">
          <div className="flex gap-4">
            {/* Portrait - Larger and more prominent */}
            <div className="portrait-frame-board relative">
              <img
                src={CHARACTER_PORTRAITS[player.character]}
                alt={player.name}
                className="h-full w-full object-cover"
              />
              {isCurrentPlayer && !player.hasPassed && (
                <div className="turn-badge-board">
                  TURN
                </div>
              )}
            </div>

            {/* Name and Title - Board Game Typography */}
            <div className="flex-1 min-w-0">
              <h2 className="captain-name-board truncate">
                {player.name}
              </h2>
              {character && (
                <span className="captain-title-badge mt-1 inline-block">
                  {character.title}
                </span>
              )}
              {/* Fishbucks - Coin styling */}
              <div className="mt-3">
                <div className="fishbuck-coin">
                  <Coins className="h-5 w-5" />
                  <AnimatedCounter value={player.fishbucks} prefix="$" className="text-inherit" />
                </div>
              </div>
            </div>

            {/* Location Badge - Board Game Style */}
            <div className="flex flex-col items-end gap-2">
              <div className={`location-badge-board ${
                player.location === 'sea' ? 'at-sea' : 'at-port'
              }`}>
                <MapPin className="h-4 w-4" />
                <span>
                  {player.location === 'sea' ? `Sea D${player.currentDepth}` : 'Port'}
                </span>
              </div>
              {player.hasPassed && (
                <Badge variant="outline" className="border-slate-500/40 text-slate-400 font-['Patrick_Hand']">
                  Passed
                </Badge>
              )}
            </div>
          </div>

          {/* Character Info Toggle - Board Game Style */}
          {character && (
            <button
              onClick={() => setShowCharacterInfo(!showCharacterInfo)}
              className="captain-info-toggle mt-4"
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
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-white/80 leading-relaxed font-['Patrick_Hand'] text-base">
                {character.description}
              </p>
              <div className="starting-bonus-board">
                <div className="bonus-label">
                  <Sparkles className="h-4 w-4" />
                  <span>Starting Bonus</span>
                </div>
                <p className="bonus-text">
                  {character.startingBonus}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Board Game Style */}
      <div className="grid grid-cols-3 gap-2">
        <div className="stat-box-board stat-regrets">
          <Skull className="h-5 w-5 mb-1" />
          <span className="stat-value-board">{player.regrets.length}</span>
          <span className="stat-label-board">Regrets</span>
        </div>
        <div className="stat-box-board stat-madness">
          <Brain className="h-5 w-5 mb-1" />
          <span className="stat-value-board">{player.madnessLevel}</span>
          <span className="stat-label-board">Madness</span>
        </div>
        <div className="stat-box-board stat-trophy">
          <Trophy className="h-5 w-5 mb-1" />
          <span className="stat-value-board">{trophyScore}</span>
          <span className="stat-label-board">Trophy Score</span>
        </div>
      </div>

      {/* Dice Tray - Board Game Style */}
      <div className="dice-tray-board">
        <div className="flex items-center justify-between mb-3">
          <h3 className="board-section-header flex items-center gap-2">
            <Dice6 className="h-4 w-4" />
            Dice Tray
          </h3>
          <span className="text-xs text-muted-foreground font-['Patrick_Hand']">
            {player.freshDice.length + player.spentDice.length}/{player.maxDice}
          </span>
        </div>

        <div className="space-y-3">
          {/* Fresh Dice */}
          <div>
            <div className="text-xs mb-2 font-['Patrick_Hand'] text-[hsl(var(--char-primary-glow))] uppercase tracking-wide">Fresh Dice</div>
            <div className="flex flex-wrap gap-2">
              {player.freshDice.length > 0 ? (
                player.freshDice.map((value, index) => (
                  <div
                    key={`fresh-${index}`}
                    className="die-board die-fresh"
                  >
                    {value}
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic font-['Patrick_Hand']">No fresh dice</span>
              )}
            </div>
          </div>

          {/* Spent Dice */}
          {player.spentDice.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-['Patrick_Hand'] uppercase tracking-wide">Spent Dice</div>
              <div className="flex flex-wrap gap-2">
                {player.spentDice.map((value, index) => (
                  <div
                    key={`spent-${index}`}
                    className="die-board die-spent"
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
              <div className="text-xs text-cyan-400/80 mb-2 font-['Patrick_Hand'] uppercase tracking-wide">Tackle Dice</div>
              <div className="flex flex-wrap gap-2">
                {player.tackleDice.map((dieId, index) => {
                  const die = TACKLE_DICE_LOOKUP[dieId];
                  return (
                    <div
                      key={`tackle-${index}`}
                      className="die-board die-fresh"
                      style={{ background: 'linear-gradient(145deg, hsl(185 70% 40%), hsl(185 65% 30%))' }}
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

      {/* Equipment - Board Game Style */}
      <div className="board-game-frame p-4">
        <h3 className="board-section-header flex items-center gap-2 mb-3">
          <Wrench className="h-4 w-4" />
          Equipment
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="equipment-card-board">
            <div className="equipment-label-board">Rod</div>
            <div className="equipment-name-board">
              {player.equippedRod?.name || <span className="text-muted-foreground italic font-['Patrick_Hand']">None</span>}
            </div>
          </div>
          <div className="equipment-card-board">
            <div className="equipment-label-board">Reel</div>
            <div className="equipment-name-board">
              {player.equippedReel?.name || <span className="text-muted-foreground italic font-['Patrick_Hand']">None</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Trophy Wall - Board Game Style */}
      <div className="board-game-frame p-4">
        <h3 className="board-section-header flex items-center gap-2 mb-3" style={{ color: 'hsl(var(--fishbuck))' }}>
          <Fish className="h-4 w-4" />
          Trophy Wall
          {trophyScore > 0 && (
            <span className="ml-auto text-sm font-['Bangers'] tracking-wide">
              {trophyScore} pts
            </span>
          )}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {mountingSlots.map((slotIndex) => {
            const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
            const multiplier = getSlotMultiplier(slotIndex);

            return (
              <div
                key={slotIndex}
                className={`trophy-slot-board relative flex min-h-[70px] flex-col items-center justify-center p-2 text-center ${
                  mountedFish ? 'filled' : ''
                }`}
              >
                <div className={`multiplier-badge-board ${
                  multiplier >= 3 ? 'x3' :
                  multiplier >= 2 ? 'x2' :
                  'x1'
                }`}>
                  ×{multiplier}
                </div>

                {mountedFish ? (
                  <>
                    <span className="text-xs font-['Bangers'] text-white line-clamp-2 mb-1 tracking-wide">{mountedFish.fish.name}</span>
                    <span className="text-sm font-['Bangers'] text-fishbuck">
                      {mountedFish.fish.value} × {multiplier} = {mountedFish.fish.value * multiplier}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground font-['Patrick_Hand']">Empty</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regrets - Board Game Style */}
      <div className="regrets-section-board">
        <div className="regrets-header-board">
          <Skull className="h-4 w-4 text-destructive" />
          <span className="board-section-header" style={{ color: 'hsl(var(--destructive))' }}>Regrets</span>
          <span className="regrets-count-badge">
            {player.regrets.length}
          </span>
          {player.regrets.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground font-['Patrick_Hand']">
              (klikk for å lese)
            </span>
          )}
        </div>
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

      {/* Action Buttons - Board Game Style */}
      {isCurrentPlayer && !player.hasPassed && (
        <div className="flex gap-3 pt-2">
          <button
            className="action-btn-board primary flex-1 flex items-center justify-center gap-2"
            onClick={handleToggleLocation}
          >
            <MapPin className="h-4 w-4" />
            Go to {player.location === 'sea' ? 'Port' : 'Sea'}
          </button>
          <button
            className="action-btn-board secondary flex-1"
            onClick={handlePass}
          >
            Pass Turn
          </button>
        </div>
      )}
    </div>
  );
};
