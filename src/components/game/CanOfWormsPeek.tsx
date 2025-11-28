import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Bug, Eye, EyeOff, Fish, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CanOfWormsPeekProps {
  isAvailable: boolean;
  isUsed: boolean;
  onPeek: (shoalId: { depth: number; shoal: number }) => void;
  onClose: () => void;
  peekedFish?: {
    name: string;
    value: number;
    type: 'fair' | 'foul';
    difficulty: number;
    abilities?: string[];
  } | null;
  availableShoals: Array<{ depth: number; shoal: number; hasHiddenFish: boolean }>;
}

export const CanOfWormsPeek = ({
  isAvailable,
  isUsed,
  onPeek,
  onClose,
  peekedFish,
  availableShoals,
}: CanOfWormsPeekProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShoal, setSelectedShoal] = useState<{ depth: number; shoal: number } | null>(null);

  const handleOpenPeek = () => {
    if (isAvailable && !isUsed) {
      setIsDialogOpen(true);
    }
  };

  const handleConfirmPeek = () => {
    if (selectedShoal) {
      onPeek(selectedShoal);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedShoal(null);
    onClose();
  };

  // Compact button indicator
  if (!isDialogOpen) {
    return (
      <Button
        onClick={handleOpenPeek}
        disabled={!isAvailable || isUsed}
        variant={isUsed ? 'ghost' : 'outline'}
        size="sm"
        className={`
          gap-2 transition-all
          ${isAvailable && !isUsed
            ? 'border-green-500/50 text-green-400 hover:bg-green-900/30 animate-pulse'
            : isUsed
              ? 'opacity-50 line-through'
              : 'opacity-30'
          }
        `}
      >
        <Bug className="h-4 w-4" />
        <span className="text-xs">Can of Worms</span>
        {isUsed ? (
          <Badge variant="outline" className="text-[10px] bg-red-900/30 border-red-500/50">
            <EyeOff className="h-2 w-2 mr-1" />
            Brukt
          </Badge>
        ) : isAvailable ? (
          <Badge variant="outline" className="text-[10px] bg-green-900/30 border-green-500/50">
            <Eye className="h-2 w-2 mr-1" />
            Klar
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            Ikke tilgjengelig
          </Badge>
        )}
      </Button>
    );
  }

  const shoalsWithHiddenFish = availableShoals.filter(s => s.hasHiddenFish);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-green-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Bug className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">Can of Worms</div>
              <div className="text-sm font-normal text-muted-foreground">
                Kikk på én skjult fisk før du bestemmer deg
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {!peekedFish ? (
          <div className="space-y-4 my-4">
            <p className="text-sm text-foreground/80">
              Velg en shoal for å se den øverste skjulte fisken. Dette bruker opp din Can of Worms for denne uken.
            </p>

            {shoalsWithHiddenFish.length === 0 ? (
              <Card className="p-4 bg-yellow-900/30 border-yellow-500/40">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Ingen shoals har skjulte fisk akkurat nå.</span>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {shoalsWithHiddenFish.map((shoal) => (
                  <Card
                    key={`${shoal.depth}-${shoal.shoal}`}
                    onClick={() => setSelectedShoal(shoal)}
                    className={`p-3 cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedShoal?.depth === shoal.depth && selectedShoal?.shoal === shoal.shoal
                        ? 'ring-2 ring-green-500 bg-green-900/30'
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Fish className="h-4 w-4 text-blue-400" />
                      <div>
                        <div className="text-sm font-medium">
                          Dybde {shoal.depth}, Shoal {shoal.shoal + 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Klikk for å velge
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 p-2 rounded bg-yellow-900/20 border border-yellow-500/30">
              <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-200/80">
                Husk: Du ser bare fisken - du må fortsatt betale for å avsløre og fange den!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            <p className="text-sm text-foreground/80">
              Du kikket på shoalen og fant:
            </p>

            <Card className={`p-4 ${
              peekedFish.type === 'fair'
                ? 'bg-green-900/30 border-green-500/40'
                : 'bg-red-900/30 border-red-500/40'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fish className={`h-5 w-5 ${
                      peekedFish.type === 'fair' ? 'text-green-400' : 'text-red-400'
                    }`} />
                    <span className="font-bold text-lg">{peekedFish.name}</span>
                  </div>
                  <Badge className={peekedFish.type === 'fair' ? 'bg-green-600' : 'bg-red-600'}>
                    {peekedFish.type === 'fair' ? 'Fair' : 'Foul'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Verdi:</span>
                    <span className="font-bold text-fishbuck">${peekedFish.value}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="font-bold">{peekedFish.difficulty}</span>
                  </div>
                </div>

                {peekedFish.abilities && peekedFish.abilities.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Evner:</div>
                    <div className="flex flex-wrap gap-1">
                      {peekedFish.abilities.map((ability, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex items-center gap-2 p-2 rounded bg-green-900/20 border border-green-500/30">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <p className="text-xs text-green-200/80">
                Can of Worms er nå brukt opp for denne uken.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!peekedFish ? (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Avbryt
              </Button>
              <Button
                onClick={handleConfirmPeek}
                disabled={!selectedShoal}
                className="bg-green-600 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Kikk på fisken
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full btn-ocean">
              Fortsett
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Compact status indicator for the action panel
export const CanOfWormsStatus = ({
  isAvailable,
  isUsed,
}: {
  isAvailable: boolean;
  isUsed: boolean;
}) => {
  return (
    <div className={`
      flex items-center gap-1.5 px-2 py-1 rounded text-xs
      ${isAvailable && !isUsed
        ? 'bg-green-900/30 border border-green-500/40 text-green-400'
        : isUsed
          ? 'bg-slate-800/50 border border-slate-600/40 text-slate-400 line-through'
          : 'bg-slate-800/50 border border-slate-600/40 text-slate-500'
      }
    `}>
      <Bug className={`h-3 w-3 ${isAvailable && !isUsed ? 'animate-pulse' : ''}`} />
      <span>Worms</span>
      {isUsed && <EyeOff className="h-3 w-3" />}
      {isAvailable && !isUsed && <Eye className="h-3 w-3" />}
    </div>
  );
};
