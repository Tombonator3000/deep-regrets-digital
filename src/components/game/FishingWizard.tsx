import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export type FishingStep = 'select' | 'reveal' | 'trigger' | 'descend' | 'pay' | 'catch' | 'complete';

interface FishingWizardProps {
  currentStep: FishingStep;
  canDescend?: boolean;
  hasTriggerAbility?: boolean;
}

const FISHING_STEPS = [
  { id: 'select' as const, label: 'Velg Shoal', shortLabel: '1', description: 'Klikk på en shoal for å velge den' },
  { id: 'reveal' as const, label: 'Avslør', shortLabel: '2', description: 'Betal 1 terning for å se fisken' },
  { id: 'trigger' as const, label: 'Evner', shortLabel: '3', description: 'Sjekk reveal-evner' },
  { id: 'descend' as const, label: 'Dykk', shortLabel: '4', description: 'Gå dypere om nødvendig' },
  { id: 'pay' as const, label: 'Betal', shortLabel: '5', description: 'Velg terninger ≥ difficulty' },
  { id: 'catch' as const, label: 'Fang', shortLabel: '6', description: 'Fang fisken!' },
];

const getStepIndex = (step: FishingStep): number => {
  const idx = FISHING_STEPS.findIndex(s => s.id === step);
  return idx >= 0 ? idx : 0;
};

export const FishingWizard = ({ currentStep, canDescend, hasTriggerAbility }: FishingWizardProps) => {
  const currentIndex = getStepIndex(currentStep);

  // Filter out steps that don't apply
  const visibleSteps = FISHING_STEPS.filter(step => {
    if (step.id === 'trigger' && !hasTriggerAbility) return false;
    if (step.id === 'descend' && !canDescend) return false;
    return true;
  });

  if (currentStep === 'complete') {
    return (
      <Card className="card-game p-2 bg-green-900/30 border-green-500/50">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Fisk fanget! Velg en ny shoal for å fortsette.</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-game p-2 bg-primary/10 border-primary/30">
      <div className="space-y-2">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Fiskeprosessen</span>
          <Badge variant="outline" className="text-[10px]">
            Steg {currentIndex + 1} av {visibleSteps.length}
          </Badge>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1">
          {visibleSteps.map((step, index) => {
            const stepIndex = getStepIndex(step.id);
            const isCompleted = stepIndex < currentIndex;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                    transition-all duration-300
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                </div>
                {index < visibleSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${stepIndex < currentIndex ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current step description */}
        <div className="flex items-center gap-2 p-2 rounded bg-primary/20">
          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="text-sm font-medium text-primary-glow">
              {visibleSteps.find(s => s.id === currentStep)?.label || 'Velg Shoal'}:
            </span>
            <span className="text-xs text-foreground/80 ml-1">
              {visibleSteps.find(s => s.id === currentStep)?.description || 'Klikk på en shoal for å begynne'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const getFishingStep = (
  selectedShoal: { depth: number; shoal: number } | null,
  isShoalRevealed: boolean,
  revealedFish: { abilities?: string[] } | null,
  playerDepth: number,
  fishDepth?: number,
  selectedDiceCount?: number
): FishingStep => {
  if (!selectedShoal) return 'select';
  if (!isShoalRevealed) return 'reveal';
  if (!revealedFish) return 'reveal';

  // Check for reveal abilities
  const hasRevealAbility = revealedFish.abilities?.some(a => a.includes('reveal')) || false;
  if (hasRevealAbility) {
    // Trigger step would be handled by the game automatically
  }

  // Check if player needs to descend
  if (fishDepth && playerDepth < fishDepth) return 'descend';

  // Ready to pay/catch
  if (!selectedDiceCount || selectedDiceCount === 0) return 'pay';

  return 'catch';
};
