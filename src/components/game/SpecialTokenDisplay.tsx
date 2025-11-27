import { GameState } from '@/types/game';
import { LifebuoyToken, FishCoinToken } from './GameTokens';
import { cn } from '@/lib/utils';

interface SpecialTokenDisplayProps {
  gameState: GameState;
  className?: string;
}

/**
 * Displays special game tokens (Life Preserver and Fish Coin)
 * with their current owners
 */
export const SpecialTokenDisplay = ({ gameState, className }: SpecialTokenDisplayProps) => {
  const lifePreserverOwner = gameState.players.find(
    (p) => p.id === gameState.lifePreserverOwner
  );
  const fishCoinOwner = gameState.players.find(
    (p) => p.id === gameState.fishCoinOwner
  );

  return (
    <div className={cn('flex gap-4', className)}>
      {/* Life Preserver Token */}
      <div className="flex flex-col items-center gap-2">
        <LifebuoyToken
          size="lg"
          animated={!!lifePreserverOwner}
          highlight={!!lifePreserverOwner}
        />
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Life Preserver
          </div>
          {lifePreserverOwner ? (
            <div className="text-sm font-medium text-red-400 animate-slide-up-fade">
              {lifePreserverOwner.name}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">Unclaimed</div>
          )}
        </div>
      </div>

      {/* Fish Coin Token */}
      <div className="flex flex-col items-center gap-2">
        <FishCoinToken
          size="lg"
          animated={!!fishCoinOwner}
          highlight={!!fishCoinOwner}
        />
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Fish Coin
          </div>
          {fishCoinOwner ? (
            <div className="text-sm font-medium text-fishbuck animate-slide-up-fade">
              {fishCoinOwner.name}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">Unclaimed</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Compact inline display of a special token with owner
 */
interface TokenBadgeProps {
  type: 'lifePreserver' | 'fishCoin';
  ownerName?: string;
  className?: string;
}

export const SpecialTokenBadge = ({ type, ownerName, className }: TokenBadgeProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-slate-800/60 border border-slate-700/50',
        ownerName && 'animate-bounce-in',
        className
      )}
    >
      {type === 'lifePreserver' ? (
        <LifebuoyToken size="sm" animated={!!ownerName} />
      ) : (
        <FishCoinToken size="sm" animated={!!ownerName} />
      )}
      <span className="text-sm">
        {ownerName || (
          <span className="text-muted-foreground italic">Available</span>
        )}
      </span>
    </div>
  );
};

/**
 * Player token indicator showing which special tokens a player owns
 */
interface PlayerTokensProps {
  playerId: string;
  gameState: GameState;
  className?: string;
}

export const PlayerTokenIndicator = ({
  playerId,
  gameState,
  className,
}: PlayerTokensProps) => {
  const hasLifePreserver = gameState.lifePreserverOwner === playerId;
  const hasFishCoin = gameState.fishCoinOwner === playerId;

  if (!hasLifePreserver && !hasFishCoin) return null;

  return (
    <div className={cn('flex gap-1', className)}>
      {hasLifePreserver && (
        <div className="animate-token-appear" title="Owns Life Preserver">
          <LifebuoyToken size="sm" highlight />
        </div>
      )}
      {hasFishCoin && (
        <div className="animate-token-appear" title="Owns Fish Coin">
          <FishCoinToken size="sm" highlight />
        </div>
      )}
    </div>
  );
};
