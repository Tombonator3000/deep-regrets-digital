import { useState, useMemo } from 'react';
import { Player, RegretCard as RegretCardType } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { CHARACTER_PORTRAITS } from '@/data/characterPortraits';
import { CHARACTERS, CHARACTER_THEMES } from '@/data/characters';
import { AnimatedCounter } from './ParticleEffects';
import {
  Coins,
  Fish,
  MapPin,
} from 'lucide-react';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  onAction: (action: any) => void;
}

export const PlayerPanel = ({ player, isCurrentPlayer, onAction }: PlayerPanelProps) => {
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

  // Calculate total trophy score
  const trophyScore = player.mountedFish.reduce(
    (sum, mount) => sum + mount.fish.value * mount.multiplier,
    0
  );

  return (
    <div className="captain-sheet-v2" style={themeStyle}>
      {/* ===== TOP: Trophy Wall Section ===== */}
      <div className="trophy-wall-v2">
        {/* Left Trophy slots (x2) */}
        <div className="trophy-group-v2">
          <div className="trophy-label-v2">TROPHY</div>
          <div className="trophy-slots-v2">
            {[0, 1].map((slotIndex) => {
              const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
              return (
                <div
                  key={slotIndex}
                  className={`trophy-card-slot ${mountedFish ? 'filled' : ''}`}
                >
                  {mountedFish ? (
                    <div className="mounted-fish-card">
                      <span className="fish-name">{mountedFish.fish.name}</span>
                      <span className="fish-points">{mountedFish.fish.value * 2}</span>
                    </div>
                  ) : (
                    <span className="multiplier-badge">×2</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Prize Catch slots (x3) */}
        <div className="trophy-group-v2 prize-group">
          <div className="trophy-label-v2 prize-label-v2">PRIZE CATCH</div>
          <div className="trophy-slots-v2">
            {[2, 3, 4].map((slotIndex) => {
              const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
              return (
                <div
                  key={slotIndex}
                  className={`trophy-card-slot prize-slot ${mountedFish ? 'filled' : ''}`}
                >
                  {mountedFish ? (
                    <div className="mounted-fish-card">
                      <span className="fish-name">{mountedFish.fish.name}</span>
                      <span className="fish-points">{mountedFish.fish.value * 3}</span>
                    </div>
                  ) : (
                    <span className="multiplier-badge">×3</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Trophy slots (x2) */}
        <div className="trophy-group-v2">
          <div className="trophy-label-v2">TROPHY</div>
          <div className="trophy-slots-v2">
            {[5, 6].map((slotIndex) => {
              const mountedFish = player.mountedFish.find((m) => m.slot === slotIndex);
              return (
                <div
                  key={slotIndex}
                  className={`trophy-card-slot ${mountedFish ? 'filled' : ''}`}
                >
                  {mountedFish ? (
                    <div className="mounted-fish-card">
                      <span className="fish-name">{mountedFish.fish.name}</span>
                      <span className="fish-points">{mountedFish.fish.value * 2}</span>
                    </div>
                  ) : (
                    <span className="multiplier-badge">×2</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fishbucks in corner */}
        <div className="fishbucks-corner">
          <Coins className="h-4 w-4" />
          <AnimatedCounter value={player.fishbucks} prefix="$" className="text-inherit" />
        </div>
      </div>

      {/* ===== MIDDLE: Main Board (Portrait Left + Dice Right) ===== */}
      <div className="main-board-v2">
        {/* Left: Character Portrait */}
        <div className="portrait-side">
          <div className="portrait-frame">
            <img
              src={CHARACTER_PORTRAITS[player.character]}
              alt={player.name}
              className="character-portrait-v2"
            />
            {isCurrentPlayer && !player.hasPassed && (
              <div className="turn-badge">YOUR TURN</div>
            )}
          </div>
          <div className="character-name-v2">{player.name}</div>
          <div className={`location-badge ${player.location === 'sea' ? 'at-sea' : 'at-port'}`}>
            <MapPin className="h-3 w-3" />
            {player.location === 'sea' ? `D${player.currentDepth}` : 'Port'}
          </div>
          {player.hasPassed && (
            <Badge variant="outline" className="passed-badge-v2">
              Passed
            </Badge>
          )}
        </div>

        {/* Right: Dice Area + Score Track */}
        <div className="dice-side">
          {/* Score Track */}
          <div className="score-track-v2">
            <div className="score-numbers">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <div
                  key={num}
                  className={`score-num ${trophyScore >= num * 10 ? 'reached' : ''} ${
                    Math.floor(trophyScore / 10) === num ? 'current' : ''
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="score-points">
              <Fish className="h-3 w-3" />
              <span>{trophyScore} pts</span>
            </div>
          </div>

          {/* Dice Tray */}
          <div className="dice-tray-v2">
            <div className="dice-section fresh-section">
              <div className="dice-label-v2">FRESH</div>
              <div className="dice-row">
                {player.freshDice.length > 0 ? (
                  player.freshDice.map((value, index) => (
                    <div key={`fresh-${index}`} className="die-v2 fresh">
                      {value}
                    </div>
                  ))
                ) : (
                  <span className="no-dice-v2">-</span>
                )}
                {player.tackleDice.map((dieId, index) => {
                  const die = TACKLE_DICE_LOOKUP[dieId];
                  return (
                    <div
                      key={`tackle-${index}`}
                      className="die-v2 tackle"
                      title={die?.name || dieId}
                    >
                      T
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dice-divider-v2"></div>

            <div className="dice-section spent-section">
              <div className="dice-label-v2 spent-label">SPENT</div>
              <div className="dice-row">
                {player.spentDice.length > 0 ? (
                  player.spentDice.map((value, index) => (
                    <div key={`spent-${index}`} className="die-v2 spent">
                      {value}
                    </div>
                  ))
                ) : (
                  <span className="no-dice-v2">-</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM: Equipment Card Slots ===== */}
      <div className="equipment-slots-v2">
        <div className="equip-card supply-slot">
          <div className="equip-type">ITEM</div>
          <div className="equip-name-v2">SUPPLY</div>
          <div className="equip-content supply-content"></div>
        </div>
        <div className="equip-card rod-slot">
          <div className="equip-type">ITEM</div>
          <div className="equip-name-v2">ROD</div>
          <div className="equip-content rod-content">
            {player.equippedRod && (
              <span className="equipped-name">{player.equippedRod.name}</span>
            )}
          </div>
        </div>
        <div className="equip-card reel-slot">
          <div className="equip-type">ITEM</div>
          <div className="equip-name-v2">REEL</div>
          <div className="equip-content reel-content">
            {player.equippedReel && (
              <span className="equipped-name">{player.equippedReel.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
