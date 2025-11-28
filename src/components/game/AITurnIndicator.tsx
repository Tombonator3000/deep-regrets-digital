import { useState, useEffect } from 'react';
import { Player, GameState } from '@/types/game';
import { AIDecision } from '@/types/ai';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bot, Anchor, Fish, ArrowDown, ShoppingCart, Trophy, HandCoins, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AITurnIndicatorProps {
  player: Player;
  gameState: GameState;
  currentAction?: AIDecision | null;
  isThinking?: boolean;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'DECLARE_LOCATION': <Anchor className="h-5 w-5" />,
  'CATCH_FISH': <Fish className="h-5 w-5" />,
  'DESCEND': <ArrowDown className="h-5 w-5" />,
  'BUY_UPGRADE': <ShoppingCart className="h-5 w-5" />,
  'MOUNT_FISH': <Trophy className="h-5 w-5" />,
  'SELL_FISH': <HandCoins className="h-5 w-5" />,
  'PASS': <Pause className="h-5 w-5" />,
};

const ACTION_LABELS: Record<string, string> = {
  'DECLARE_LOCATION': 'Velger lokasjon',
  'CATCH_FISH': 'Fanger fisk',
  'DESCEND': 'Dykker dypere',
  'BUY_UPGRADE': 'Kjper oppgradering',
  'MOUNT_FISH': 'Monterer trofé',
  'SELL_FISH': 'Selger fisk',
  'PASS': 'Passer',
  'REVEAL_FISH': 'Avslrer fisk',
  'BUY_TACKLE_DICE': 'Kjper terning',
  'DISCARD_REGRET': 'Forkaster anger',
};

export const AITurnIndicator = ({
  player,
  gameState,
  currentAction,
  isThinking = false,
}: AITurnIndicatorProps) => {
  const [dots, setDots] = useState('');

  // Animate thinking dots
  useEffect(() => {
    if (!isThinking) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => clearInterval(interval);
  }, [isThinking]);

  const actionType = currentAction?.action?.type;
  const actionIcon = actionType ? ACTION_ICONS[actionType] : null;
  const actionLabel = actionType ? ACTION_LABELS[actionType] : null;

  return (
    <div className="fixed inset-x-0 top-20 z-50 flex justify-center pointer-events-none px-4">
      <Card className={cn(
        "pointer-events-auto bg-purple-950/95 border-purple-500/50 backdrop-blur-lg shadow-2xl",
        "px-6 py-4 max-w-md w-full",
        "animate-in slide-in-from-top-4 duration-300"
      )}>
        <div className="flex items-center gap-4">
          {/* AI Avatar */}
          <div className="relative">
            <div className={cn(
              "w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700",
              "flex items-center justify-center shadow-lg",
              isThinking && "animate-pulse"
            )}>
              <Bot className="h-7 w-7 text-white" />
            </div>
            {isThinking && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center animate-bounce">
                <span className="text-[10px] text-purple-900 font-bold">?</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-purple-200 truncate">{player.name}</span>
              <Badge className="bg-purple-600/50 text-purple-200 text-xs shrink-0">
                AI
              </Badge>
            </div>

            {isThinking ? (
              <div className="flex items-center gap-2 text-purple-300">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span className="text-sm">Tenker{dots}</span>
              </div>
            ) : currentAction ? (
              <div className="flex items-center gap-2 text-purple-100">
                {actionIcon && (
                  <span className="text-purple-400">{actionIcon}</span>
                )}
                <span className="text-sm font-medium">
                  {actionLabel || currentAction.reasoning}
                </span>
              </div>
            ) : null}

            {/* Additional details for specific actions */}
            {currentAction && !isThinking && (
              <div className="mt-2 text-xs text-purple-400/80">
                {actionType === 'DECLARE_LOCATION' && (
                  <span>
                    Går til {currentAction.action.payload?.location === 'sea' ? 'havet' : 'havnen'}
                  </span>
                )}
                {actionType === 'CATCH_FISH' && currentAction.action.payload?.fish && (
                  <span>
                    Fanger {currentAction.action.payload.fish.name} (verdi: ${currentAction.action.payload.fish.value})
                  </span>
                )}
                {actionType === 'DESCEND' && (
                  <span>
                    Dykker til dybde {currentAction.action.payload?.targetDepth}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Confidence indicator */}
          {currentAction && !isThinking && (
            <div className="shrink-0 flex flex-col items-center">
              <div className="text-[10px] text-purple-400 uppercase tracking-wide mb-1">
                Sikkerhet
              </div>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                currentAction.confidence >= 0.8 && "bg-green-500/30 text-green-300",
                currentAction.confidence >= 0.5 && currentAction.confidence < 0.8 && "bg-yellow-500/30 text-yellow-300",
                currentAction.confidence < 0.5 && "bg-red-500/30 text-red-300"
              )}>
                {Math.round(currentAction.confidence * 100)}%
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
