import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Anchor,
  Waves,
  Fish,
  ShoppingBag,
  Trophy,
  AlertTriangle,
  Heart,
  Dices,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface DeclarationChoiceProps {
  currentLocation: 'sea' | 'port';
  onDeclare: (location: 'sea' | 'port') => void;
  playerHandFish: number;
  playerFishbucks: number;
  playerRegrets: number;
  hasCanOfWorms: boolean;
}

export const DeclarationChoice = ({
  currentLocation,
  onDeclare,
  playerHandFish,
  playerFishbucks,
  playerRegrets,
  hasCanOfWorms,
}: DeclarationChoiceProps) => {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-bold text-primary-glow">Hvor vil du tilbringe dagen?</h3>
        <p className="text-xs text-muted-foreground">Velg nøye - du kan ikke endre valg etter at du har bestemt deg</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* SEA Option */}
        <Card
          className={`card-game p-4 cursor-pointer transition-all hover:scale-[1.02] ${
            currentLocation === 'sea'
              ? 'ring-2 ring-blue-500 bg-blue-900/30'
              : 'hover:bg-blue-900/20'
          }`}
          onClick={() => onDeclare('sea')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Waves className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-400">HAVET</h4>
                  <p className="text-xs text-muted-foreground">Fiske & eventyr</p>
                </div>
              </div>
              {currentLocation === 'sea' && (
                <Badge className="bg-blue-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valgt
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-300">Du kan:</div>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2 text-foreground/80">
                  <Fish className="h-3 w-3 text-blue-400" />
                  Fange fisk fra shoals
                </li>
                <li className="flex items-center gap-2 text-foreground/80">
                  <Dices className="h-3 w-3 text-blue-400" />
                  Bruke terninger for å fange
                </li>
                <li className="flex items-center gap-2 text-foreground/80">
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                  Risiko for Regrets (høy belønning)
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-blue-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Siste spiller får kun <strong className="text-blue-400">2 turer</strong></span>
              </div>
            </div>

            <Button
              onClick={(e) => { e.stopPropagation(); onDeclare('sea'); }}
              className={`w-full ${currentLocation === 'sea' ? 'bg-blue-600 hover:bg-blue-700' : 'btn-ocean'}`}
              size="sm"
            >
              <Waves className="h-4 w-4 mr-2" />
              {currentLocation === 'sea' ? 'Bekreft Havet' : 'Velg Havet'}
            </Button>
          </div>
        </Card>

        {/* PORT Option */}
        <Card
          className={`card-game p-4 cursor-pointer transition-all hover:scale-[1.02] ${
            currentLocation === 'port'
              ? 'ring-2 ring-amber-500 bg-amber-900/30'
              : 'hover:bg-amber-900/20'
          }`}
          onClick={() => onDeclare('port')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Anchor className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-400">HAVNEN</h4>
                  <p className="text-xs text-muted-foreground">Handel & hvile</p>
                </div>
              </div>
              {currentLocation === 'port' && (
                <Badge className="bg-amber-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Valgt
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-amber-300">Du kan:</div>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2 text-foreground/80">
                  <ShoppingBag className="h-3 w-3 text-amber-400" />
                  Selge fisk for Fishbucks
                  {playerHandFish > 0 && (
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {playerHandFish} fisk
                    </Badge>
                  )}
                </li>
                <li className="flex items-center gap-2 text-foreground/80">
                  <Trophy className="h-3 w-3 text-amber-400" />
                  Montere fisk på troféveggen (×1, ×2, ×3)
                </li>
                <li className="flex items-center gap-2 text-foreground/80">
                  <Dices className="h-3 w-3 text-amber-400" />
                  Kjøpe oppgraderinger og terninger
                </li>
                {playerRegrets > 0 && (
                  <li className="flex items-center gap-2 text-green-400">
                    <Heart className="h-3 w-3" />
                    Kaste 1 Regret ved ankomst!
                  </li>
                )}
              </ul>
            </div>

            <div className="pt-2 border-t border-amber-500/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Siste spiller får <strong className="text-amber-400">4 turer</strong></span>
              </div>
              {hasCanOfWorms && (
                <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Can of Worms flippes opp</span>
                </div>
              )}
            </div>

            <Button
              onClick={(e) => { e.stopPropagation(); onDeclare('port'); }}
              className={`w-full ${currentLocation === 'port' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-500/50 text-amber-400 hover:bg-amber-900/30'}`}
              variant={currentLocation === 'port' ? 'default' : 'outline'}
              size="sm"
            >
              <Anchor className="h-4 w-4 mr-2" />
              {currentLocation === 'port' ? 'Bekreft Havnen' : 'Velg Havnen'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick recommendation */}
      <Card className="card-game p-2 bg-primary/10 border-primary/30">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-primary">💡</span>
          <span className="text-foreground/80">
            {playerHandFish === 0 && playerFishbucks < 3
              ? "Du har ingen fisk og lite penger. Havet anbefales for å fange noe verdifullt!"
              : playerHandFish >= 3
                ? "Du har mange fisk! Vurder havnen for å selge eller montere dem."
                : playerRegrets >= 6
                  ? "Høyt Madness-nivå! Havnen lar deg kaste 1 Regret ved ankomst."
                  : "Velg basert på din strategi - risiko på havet eller trygghet i havnen."}
          </span>
        </div>
      </Card>
    </div>
  );
};
