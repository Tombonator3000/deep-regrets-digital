import { Card } from '@/components/ui/card';
import { AlertTriangle, Skull, Fish } from 'lucide-react';

interface OverfishingWarningProps {
  shoalFishCount: number;
  isLastFish: boolean;
}

export const OverfishingWarning = ({ shoalFishCount, isLastFish }: OverfishingWarningProps) => {
  if (!isLastFish && shoalFishCount > 2) return null;

  if (isLastFish) {
    return (
      <Card className="card-game p-3 bg-red-900/50 border-red-500/70 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/30">
            <Skull className="h-5 w-5 text-red-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-red-400 flex items-center gap-2">
              ⚠️ OVERFISHING ADVARSEL!
            </h4>
            <p className="text-sm text-red-200">
              Dette er <strong>siste fisk</strong> i denne shoalen!
            </p>
            <p className="text-xs text-red-300">
              Hvis du fanger den, får du <strong>1 ekstra Regret</strong> som straff for overfishing.
            </p>
            <div className="flex items-center gap-2 mt-2 p-2 rounded bg-red-950/50">
              <Fish className="h-4 w-4 text-red-400" />
              <span className="text-xs text-red-200">
                Shoalen blir tom etter dette og ingen kan fiske her mer.
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Warning when only 2 fish left
  if (shoalFishCount === 2) {
    return (
      <Card className="card-game p-2 bg-yellow-900/30 border-yellow-500/40">
        <div className="flex items-center gap-2 text-xs text-yellow-300">
          <AlertTriangle className="h-4 w-4" />
          <span>Kun 2 fisk igjen i denne shoalen. Neste fangst trigger overfishing!</span>
        </div>
      </Card>
    );
  }

  return null;
};
