import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Waves, Anchor } from 'lucide-react';

interface LastToPassWarningProps {
  isLastPlayer: boolean;
  location: 'sea' | 'port';
  turnsRemaining: number;
  maxTurns: number;
}

export const LastToPassWarning = ({
  isLastPlayer,
  location,
  turnsRemaining,
  maxTurns,
}: LastToPassWarningProps) => {
  if (!isLastPlayer) return null;

  const isUrgent = turnsRemaining <= 1;
  const isSea = location === 'sea';

  return (
    <Card className={`card-game p-3 ${isUrgent ? 'bg-red-900/40 border-red-500/60 animate-pulse' : 'bg-yellow-900/30 border-yellow-500/50'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-500/30' : 'bg-yellow-500/20'}`}>
          <AlertTriangle className={`h-5 w-5 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`} />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className={`font-bold ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`}>
              Du er siste spiller!
            </h4>
            <Badge className={isUrgent ? 'bg-red-500' : 'bg-yellow-500'}>
              {isSea ? <Waves className="h-3 w-3 mr-1" /> : <Anchor className="h-3 w-3 mr-1" />}
              {location === 'sea' ? 'Havet' : 'Havnen'}
            </Badge>
          </div>

          <p className="text-sm text-foreground/80">
            Alle andre har passet. Du har begrenset med turer igjen.
          </p>

          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`} />
            <div className="flex gap-1">
              {Array.from({ length: maxTurns }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    i < turnsRemaining
                      ? isUrgent
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-black'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <span className="text-sm text-foreground/70">
              {turnsRemaining} {turnsRemaining === 1 ? 'tur' : 'turer'} igjen
            </span>
          </div>

          {isUrgent && (
            <p className="text-xs text-red-300 font-medium">
              ⚠️ Siste sjanse! Gjør det viktigste nå.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
