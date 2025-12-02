import { useState, useMemo } from 'react';
import { Player, RegretCard as RegretCardType } from '@/types/game';
import { Badge } from '@/components/ui/badge';
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

  // Create trophy slots array matching physical board: x2, x2, x3, x3, x3, x2, x2
  const trophySlotConfig = [
    { multiplier: 2, type: 'trophy' },
    { multiplier: 2, type: 'trophy' },
    { multiplier: 3, type: 'prize' },
    { multiplier: 3, type: 'prize' },
    { multiplier: 3, type: 'prize' },
    { multiplier: 2, type: 'trophy' },
    { multiplier: 2, type: 'trophy' },
  ];

  return (
    <div className="captain-sheet" style={themeStyle}>
      {/* Trophy Wall - Top Section */}
      <div className="trophy-wall-section">
        <div className="trophy-row">
          {/* Left Trophy slots (x2) */}
          <div className="trophy-group">
            <div className="trophy-label">TROPHY</div>
            <div className="trophy-slots-pair">
              {[0, 1].map((slotIndex) => {
                const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
                return (
                  <div
                    key={slotIndex}
                    className={`trophy-circle ${mountedFish ? 'filled' : ''}`}
                  >
                    <span className="multiplier-label">×2</span>
                    {mountedFish && (
                      <span className="fish-value">{mountedFish.fish.value * 2}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Prize Catch slots (x3) */}
          <div className="trophy-group prize-catch-group">
            <div className="trophy-label prize-label">PRIZE CATCH</div>
            <div className="trophy-slots-triple">
              {[2, 3, 4].map((slotIndex) => {
                const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
                return (
                  <div
                    key={slotIndex}
                    className={`trophy-circle prize-circle ${mountedFish ? 'filled' : ''}`}
                  >
                    <span className="multiplier-label">×3</span>
                    {mountedFish && (
                      <span className="fish-value">{mountedFish.fish.value * 3}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Trophy slots (x2) */}
          <div className="trophy-group">
            <div className="trophy-label">TROPHY</div>
            <div className="trophy-slots-pair">
              {[5, 6].map((slotIndex) => {
                const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
                return (
                  <div
                    key={slotIndex}
                    className={`trophy-circle ${mountedFish ? 'filled' : ''}`}
                  >
                    <span className="multiplier-label">×2</span>
                    {mountedFish && (
                      <span className="fish-value">{mountedFish.fish.value * 2}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fishbucks in corner */}
        <div className="fishbucks-display">
          <Coins className="h-4 w-4" />
          <AnimatedCounter value={player.fishbucks} prefix="$" className="text-inherit" />
        </div>
      </div>

      {/* Character Portrait Section */}
      <div className="portrait-section">
        <div className="portrait-container">
          <img
            src={CHARACTER_PORTRAITS[player.character]}
            alt={player.name}
            className="character-portrait"
          />
          {isCurrentPlayer && !player.hasPassed && (
            <div className="turn-indicator">YOUR TURN</div>
          )}
        </div>
        <div className="character-name">{player.name}</div>

        {/* Location Badge */}
        <div className={`location-indicator ${player.location === 'sea' ? 'at-sea' : 'at-port'}`}>
          <MapPin className="h-3 w-3" />
          {player.location === 'sea' ? `D${player.currentDepth}` : 'Port'}
        </div>

        {player.hasPassed && (
          <Badge variant="outline" className="passed-badge">
            Passed
          </Badge>
        )}
      </div>

      {/* Trophy Score Track */}
      <div className="score-track-section">
        <div className="score-track">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <div
              key={num}
              className={`score-number ${trophyScore >= num * 10 ? 'reached' : ''} ${
                Math.floor(trophyScore / 10) === num ? 'current' : ''
              }`}
            >
              {num}
            </div>
          ))}
        </div>
        <div className="score-total">
          <Fish className="h-4 w-4" />
          <span>{trophyScore} pts</span>
        </div>
      </div>

      {/* Dice Tray Section */}
      <div className="dice-tray-section">
        <div className="dice-area fresh-dice-area">
          <div className="dice-label">FRESH</div>
          <div className="dice-container">
            {player.freshDice.length > 0 ? (
              player.freshDice.map((value, index) => (
                <div key={`fresh-${index}`} className="die fresh">
                  {value}
                </div>
              ))
            ) : (
              <span className="no-dice">-</span>
            )}
            {/* Tackle Dice shown with fresh dice */}
            {player.tackleDice.map((dieId, index) => {
              const die = TACKLE_DICE_LOOKUP[dieId];
              return (
                <div
                  key={`tackle-${index}`}
                  className="die tackle"
                  title={die?.name || dieId}
                >
                  T
                </div>
              );
            })}
          </div>
        </div>

        <div className="dice-divider"></div>

        <div className="dice-area spent-dice-area">
          <div className="dice-label">SPENT</div>
          <div className="dice-container">
            {player.spentDice.length > 0 ? (
              player.spentDice.map((value, index) => (
                <div key={`spent-${index}`} className="die spent">
                  {value}
                </div>
              ))
            ) : (
              <span className="no-dice">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Icons */}
      <div className="equipment-icons">
        <div className="equipment-icon rod-icon">
          <span className="equip-label">ROD</span>
          <div className="equip-image">🎣</div>
          {player.equippedRod && (
            <span className="equip-name">{player.equippedRod.name}</span>
          )}
        </div>
        <div className="equipment-icon reel-icon">
          <span className="equip-label">REEL</span>
          <div className="equip-image">🪝</div>
          {player.equippedReel && (
            <span className="equip-name">{player.equippedReel.name}</span>
          )}
        </div>
      </div>

      {/* Regrets Display */}
      <div className="regrets-display">
        <div className="regrets-header">
          <Skull className="h-4 w-4" />
          <span className="regrets-count">{player.regrets.length}</span>
          <Brain className="h-4 w-4 madness-icon" />
          <span className="madness-level">{player.madnessLevel}</span>
        </div>
      </div>

      {/* Item Cards Section */}
      <div className="item-cards-section">
        <div className="item-card supply-card">
          <div className="item-type">ITEM</div>
          <div className="item-name">SUPPLY</div>
          <div className="item-pattern supply-pattern"></div>
        </div>
        <div className="item-card rod-card">
          <div className="item-type">ITEM</div>
          <div className="item-name">ROD</div>
          <div className="item-pattern rod-pattern"></div>
          {player.equippedRod && (
            <div className="equipped-item">{player.equippedRod.name}</div>
          )}
        </div>
        <div className="item-card reel-card">
          <div className="item-type">ITEM</div>
          <div className="item-name">REEL</div>
          <div className="item-pattern reel-pattern"></div>
          {player.equippedReel && (
            <div className="equipped-item">{player.equippedReel.name}</div>
          )}
        </div>
      </div>

      {/* Character Info Toggle */}
      {character && (
        <button
          onClick={() => setShowCharacterInfo(!showCharacterInfo)}
          className="captain-info-btn"
        >
          <Anchor className="h-4 w-4" />
          <span>Info</span>
          {showCharacterInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}

      {showCharacterInfo && character && (
        <div className="character-info-expanded">
          <span className="char-title">{character.title}</span>
          <p className="char-description">{character.description}</p>
          <div className="starting-bonus">
            <Sparkles className="h-4 w-4" />
            <span>{character.startingBonus}</span>
          </div>
        </div>
      )}

      {/* Regrets Hand (clickable) */}
      {player.regrets.length > 0 && (
        <div className="regrets-hand-section">
          <RegretHand
            regrets={player.regrets}
            isOwner={isCurrentPlayer}
            size="sm"
            onCardClick={(regret) => setSelectedRegret(regret)}
          />
        </div>
      )}

      {/* Action Buttons */}
      {isCurrentPlayer && !player.hasPassed && (
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleToggleLocation}>
            <MapPin className="h-4 w-4" />
            Go to {player.location === 'sea' ? 'Port' : 'Sea'}
          </button>
          <button className="action-btn secondary" onClick={handlePass}>
            Pass Turn
          </button>
        </div>
      )}

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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
