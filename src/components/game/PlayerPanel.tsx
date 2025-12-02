import { useState, useMemo, useCallback } from 'react';
import { Player, RegretCard as RegretCardType, UpgradeCard, FishCard } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { TACKLE_DICE_LOOKUP } from '@/data/tackleDice';
import { CHARACTER_PORTRAITS } from '@/data/characterPortraits';
import { CHARACTERS, CHARACTER_THEMES } from '@/data/characters';
import { AnimatedCounter } from './ParticleEffects';
import { useCardModal } from './CardModal';
import { getFishImage, getDefaultFishImage } from '@/data/fishImages';
import { getSupplyImage } from '@/data/supplyImages';
import rodCardBack from '@/assets/rod-card-back.png';
import reelCardBack from '@/assets/reel-card-back.png';
import supplyCardBack from '@/assets/supply-card-back.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Coins,
  Fish,
  MapPin,
} from 'lucide-react';

// Equipment card displayed as actual card image on captain sheet (like physical game)
interface EquipmentCardOverlayProps {
  equipment: UpgradeCard | null;
  type: 'rod' | 'reel' | 'supply';
  onClick?: () => void;
}

const EquipmentCardOverlay = ({ equipment, type, onClick }: EquipmentCardOverlayProps) => {
  // Get the card back image based on type
  const getCardBackImage = () => {
    switch (type) {
      case 'rod': return rodCardBack;
      case 'reel': return reelCardBack;
      case 'supply': return supplyCardBack;
    }
  };

  const typeTextColors = {
    rod: 'text-blue-300',
    reel: 'text-green-300',
    supply: 'text-emerald-300',
  };

  const cardBackImage = getCardBackImage();

  // Check for specific supply image (full card design)
  const supplyImage = equipment && type === 'supply' ? getSupplyImage(equipment.id) : undefined;
  const displayImage = supplyImage || cardBackImage;

  if (equipment) {
    // When equipment is present, show the card image
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="equipment-card-overlay has-equipment cursor-pointer"
            onClick={onClick}
          >
            <img
              src={displayImage}
              alt={equipment.name}
              className="equipment-card-image"
            />
            <div className="equipment-card-name-overlay">
              {equipment.name}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className={`font-semibold ${typeTextColors[type]}`}>{equipment.name}</div>
            <div className="text-xs text-muted-foreground">{equipment.description}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {equipment.effects.map((effect) => (
                <Badge key={effect} variant="secondary" className="text-xs">
                  {effect}
                </Badge>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // When empty, show a faded card back as placeholder
  return (
    <div className="equipment-card-overlay empty-slot">
      <img
        src={cardBackImage}
        alt={`Empty ${type} slot`}
        className="equipment-card-image empty"
      />
    </div>
  );
};

// Mini card for mounted fish on trophy wall
interface MountedFishMiniCardProps {
  fish: FishCard;
  multiplier: number;
  onClick?: () => void;
}

const MountedFishMiniCard = ({ fish, multiplier, onClick }: MountedFishMiniCardProps) => {
  const fishImage = getFishImage(fish.id) || getDefaultFishImage(fish.depth);
  const qualityClass = fish.quality === 'foul'
    ? 'border-purple-400/60'
    : 'border-cyan-400/60';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`mounted-fish-mini-card ${qualityClass} cursor-pointer hover:scale-110 transition-transform`}
          onClick={onClick}
        >
          {fishImage ? (
            <div className="mounted-fish-image">
              <img src={fishImage} alt={fish.name} />
            </div>
          ) : (
            <Fish className="h-4 w-4 text-cyan-300" />
          )}
          <span className="mounted-fish-name">{fish.name}</span>
          <span className="mounted-fish-points">{fish.value * multiplier}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <div className="font-semibold text-primary">{fish.name}</div>
          <div className="text-xs text-muted-foreground">{fish.description}</div>
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary" className="text-fishbuck">Base: ${fish.value}</Badge>
            <Badge variant="outline">×{multiplier} = {fish.value * multiplier} pts</Badge>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  onAction: (action: any) => void;
}

export const PlayerPanel = ({ player, isCurrentPlayer, onAction }: PlayerPanelProps) => {
  const character = CHARACTERS.find(c => c.id === player.character);
  const { openCard } = useCardModal();

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

  // Callbacks for enlarging cards
  const handleEnlargeFish = useCallback((fish: FishCard) => {
    openCard(fish, 'fish');
  }, [openCard]);

  const handleEnlargeEquipment = useCallback((equipment: UpgradeCard) => {
    openCard(equipment, 'supply');
  }, [openCard]);

  return (
    <TooltipProvider delayDuration={200}>
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
                    <MountedFishMiniCard
                      fish={mountedFish.fish}
                      multiplier={2}
                      onClick={() => handleEnlargeFish(mountedFish.fish)}
                    />
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
                    <MountedFishMiniCard
                      fish={mountedFish.fish}
                      multiplier={3}
                      onClick={() => handleEnlargeFish(mountedFish.fish)}
                    />
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
                    <MountedFishMiniCard
                      fish={mountedFish.fish}
                      multiplier={2}
                      onClick={() => handleEnlargeFish(mountedFish.fish)}
                    />
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

      {/* ===== BOTTOM: Equipment Cards (displayed as actual cards like physical game) ===== */}
      <div className="equipment-cards-row">
        {/* Supply Card */}
        <EquipmentCardOverlay
          equipment={player.supplies.length > 0 ? player.supplies[0] : null}
          type="supply"
          onClick={player.supplies.length > 0 ? () => handleEnlargeEquipment(player.supplies[0]) : undefined}
        />

        {/* Rod Card */}
        <EquipmentCardOverlay
          equipment={player.equippedRod || null}
          type="rod"
          onClick={player.equippedRod ? () => handleEnlargeEquipment(player.equippedRod!) : undefined}
        />

        {/* Reel Card */}
        <EquipmentCardOverlay
          equipment={player.equippedReel || null}
          type="reel"
          onClick={player.equippedReel ? () => handleEnlargeEquipment(player.equippedReel!) : undefined}
        />
      </div>
    </div>
    </TooltipProvider>
  );
};
