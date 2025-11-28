import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  X,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Info
} from 'lucide-react';

// Define all hint types
export type HintId =
  | 'first_fishing'
  | 'first_reveal'
  | 'first_descend'
  | 'first_catch'
  | 'first_port'
  | 'first_sell'
  | 'first_mount'
  | 'first_regret'
  | 'madness_tier_up'
  | 'can_of_worms'
  | 'last_to_pass'
  | 'overfishing'
  | 'free_tackle_die'
  | 'market_rotation'
  | 'the_plug'
  | 'fair_foul_fish'
  | 'fish_abilities';

interface Hint {
  id: HintId;
  title: string;
  content: string;
  tips?: string[];
  priority: 'low' | 'medium' | 'high';
}

const HINTS: Record<HintId, Hint> = {
  first_fishing: {
    id: 'first_fishing',
    title: 'Din første fisketur!',
    content: 'Klikk på en shoal (fiskestim) for å begynne å fiske. Jo dypere du går, jo mer verdifulle fisk - men også vanskeligere å fange!',
    tips: [
      'Dybde 1 er enklest å starte med',
      'Du trenger terninger for å avsløre og fange fisk',
      'Sjekk dine tilgjengelige terninger øverst på skjermen',
    ],
    priority: 'high',
  },
  first_reveal: {
    id: 'first_reveal',
    title: 'Avsløre fisk',
    content: 'For å se hvilken fisk som ligger øverst i en shoal, må du betale 1 terning (hvilken som helst verdi). Først når fisken er avslørt kan du prøve å fange den.',
    tips: [
      'Bruk terninger med lav verdi til å avsløre',
      'Spar høye terninger til selve fangsten',
    ],
    priority: 'high',
  },
  first_descend: {
    id: 'first_descend',
    title: 'Dykke dypere',
    content: 'Noen fisk befinner seg dypere enn din nåværende posisjon. Du må bruke Sinkers (lodd) for å dykke ned til fiskens dybde før du kan fange den.',
    tips: [
      'Hver Sinker lar deg dykke 1 nivå dypere',
      'Du kan kjøpe flere Sinkers i havnen',
    ],
    priority: 'medium',
  },
  first_catch: {
    id: 'first_catch',
    title: 'Fange fisk',
    content: 'For å fange en fisk må summen av terningene du bruker være lik eller høyere enn fiskens difficulty (vanskelighetsgrad).',
    tips: [
      'Du kan bruke flere terninger om nødvendig',
      'Terninger du bruker blir "brukt opp" til neste dag',
      'Fair fisk gir + på scoren, Foul fisk gir - basert på Madness',
    ],
    priority: 'high',
  },
  first_port: {
    id: 'first_port',
    title: 'Velkommen til havnen!',
    content: 'I havnen kan du selge fisk, montere trofeer, og kjøpe oppgraderinger. Du mister også 1 Regret bare ved å være her!',
    tips: [
      'Selg fisk for Fishbucks',
      'Monter fisk på troféveggen for sluttpoeng',
      'Kjøp terninger og Sinkers for bedre fangst',
    ],
    priority: 'high',
  },
  first_sell: {
    id: 'first_sell',
    title: 'Selge fisk',
    content: 'Fisk i hånden din kan selges for Fishbucks. Verdien påvirkes av din Madness - Fair fisk er mer verdt når du er rolig, Foul fisk når du er gal!',
    tips: [
      'Markedsprisen roterer hver dag',
      'Noen fisk har evner som aktiveres når de selges',
    ],
    priority: 'medium',
  },
  first_mount: {
    id: 'first_mount',
    title: 'Montere trofeer',
    content: 'Troféveggen har 3 plasser med multiplikatorer: ×1, ×2, og ×3. Fisk montert her gir poeng ved spillets slutt basert på verdi × multiplikator!',
    tips: [
      'Plasseringen er viktig - høyverdi-fisk bør på ×3',
      'Du kan ikke flytte fisk etter montering',
      'Multiplier-effekten beregnes ved spillslutt',
    ],
    priority: 'high',
  },
  first_regret: {
    id: 'first_regret',
    title: 'Din første Regret',
    content: 'Regrets øker din Ocean Madness. Høyere Madness endrer verdien på fisk og gir deg flere terninger, men Foul fisk blir mer verdifulle enn Fair fisk!',
    tips: [
      'Gå til havnen for å miste 1 Regret',
      'Foul fisk er bedre med høy Madness',
      'Fair fisk er bedre med lav Madness',
    ],
    priority: 'medium',
  },
  madness_tier_up: {
    id: 'madness_tier_up',
    title: 'Madness-nivå økt!',
    content: 'Din Ocean Madness har økt til et nytt nivå. Sjekk hvordan dette påvirker Fair/Foul-modifikatorer og maks terninger.',
    tips: [
      'Hver 3 Regrets = 1 Madness-nivå',
      'Høyere Madness = flere terninger men verre Fair-fisk',
    ],
    priority: 'medium',
  },
  can_of_worms: {
    id: 'can_of_worms',
    title: 'Can of Worms',
    content: 'Din Can of Worms lar deg kikke på en skjult fisk uten å betale! Den flippes tilbake etter bruk, men aktiveres igjen på onsdag og fredag.',
    tips: [
      'Bruk den strategisk før du velger shoal',
      'Flippes tilbake på onsdag og fredag',
    ],
    priority: 'medium',
  },
  last_to_pass: {
    id: 'last_to_pass',
    title: 'Siste spiller!',
    content: 'Du er den siste aktive spilleren! Hvis du er på havet får du 2 turer til, i havnen får du 4 turer til.',
    tips: [
      'Planlegg dine siste turer nøye',
      'Etter dine turer går dagen videre',
    ],
    priority: 'high',
  },
  overfishing: {
    id: 'overfishing',
    title: 'Overfishing!',
    content: 'Når du fanger den siste fisken i en shoal, får du +1 Regret! Tenk deg om før du tømmer en shoal.',
    tips: [
      'Vurder om fisken er verdt ekstra Regret',
      'La gjerne en fisk være igjen om mulig',
    ],
    priority: 'high',
  },
  free_tackle_die: {
    id: 'free_tackle_die',
    title: 'Gratis terning!',
    content: 'På torsdager og lørdager får alle spillere én gratis tackle-terning (blå eller oransje, ellers grønn hvis tom).',
    tips: [],
    priority: 'low',
  },
  market_rotation: {
    id: 'market_rotation',
    title: 'Markedet roterer',
    content: 'Hver dag forsvinner nederste rad i markedet og nye varer avdekkes. Planlegg kjøpene dine!',
    tips: [
      'Kjøp det du trenger før det forsvinner',
      'Nye varer kan være bedre eller verre',
    ],
    priority: 'low',
  },
  the_plug: {
    id: 'the_plug',
    title: 'The Plug',
    content: 'Hver dag eroderer The Plug og topp-fisken fra en tilfeldig shoal kastes. Havet krymper stadig!',
    tips: [
      'Fang fisk før de forsvinner',
      'Spillet slutter når havet er tomt',
    ],
    priority: 'low',
  },
  fair_foul_fish: {
    id: 'fair_foul_fish',
    title: 'Fair vs Foul fisk',
    content: 'Fair fisk (grønne) er mer verdifulle når du er rolig (lav Madness). Foul fisk (røde) er mer verdifulle når du er gal (høy Madness).',
    tips: [
      'Tilpass strategien til din Madness',
      'Sjekk modifikatorene i Madness-trackeren',
    ],
    priority: 'medium',
  },
  fish_abilities: {
    id: 'fish_abilities',
    title: 'Fiskens evner',
    content: 'Noen fisk har spesielle evner som aktiveres når de avsløres, fanges, selges eller monteres. Les evnen nøye!',
    tips: [
      'Reveal-evner skjer umiddelbart',
      'Catch-evner skjer når du fanger fisken',
      'Mount-evner påvirker sluttscoren',
    ],
    priority: 'medium',
  },
};

// Context for hint management
interface HintContextType {
  seenHints: Set<HintId>;
  markHintSeen: (id: HintId) => void;
  showHint: (id: HintId) => void;
  hideHint: () => void;
  activeHint: Hint | null;
  resetHints: () => void;
}

const HintContext = createContext<HintContextType | null>(null);

// Local storage key
const SEEN_HINTS_KEY = 'deep-regrets-seen-hints';

export const HintProvider = ({ children }: { children: ReactNode }) => {
  const [seenHints, setSeenHints] = useState<Set<HintId>>(() => {
    try {
      const stored = localStorage.getItem(SEEN_HINTS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [activeHint, setActiveHint] = useState<Hint | null>(null);

  // Save to localStorage when seenHints changes
  useEffect(() => {
    localStorage.setItem(SEEN_HINTS_KEY, JSON.stringify([...seenHints]));
  }, [seenHints]);

  const markHintSeen = (id: HintId) => {
    setSeenHints(prev => new Set([...prev, id]));
  };

  const showHint = (id: HintId) => {
    if (!seenHints.has(id)) {
      setActiveHint(HINTS[id]);
    }
  };

  const hideHint = () => {
    if (activeHint) {
      markHintSeen(activeHint.id);
      setActiveHint(null);
    }
  };

  const resetHints = () => {
    setSeenHints(new Set());
    localStorage.removeItem(SEEN_HINTS_KEY);
  };

  return (
    <HintContext.Provider
      value={{ seenHints, markHintSeen, showHint, hideHint, activeHint, resetHints }}
    >
      {children}
    </HintContext.Provider>
  );
};

export const useHints = () => {
  const context = useContext(HintContext);
  if (!context) {
    throw new Error('useHints must be used within a HintProvider');
  }
  return context;
};

// Hint display component
export const HintPopup = () => {
  const { activeHint, hideHint } = useHints();

  if (!activeHint) return null;

  const priorityColors = {
    low: 'border-slate-500/50 bg-slate-800/90',
    medium: 'border-blue-500/50 bg-blue-900/90',
    high: 'border-primary/50 bg-primary/20',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <Card className={`p-4 ${priorityColors[activeHint.priority]} backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/20 shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-primary-glow">{activeHint.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                onClick={hideHint}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-foreground/80 mt-1">{activeHint.content}</p>

            {activeHint.tips && activeHint.tips.length > 0 && (
              <div className="mt-2 space-y-1">
                {activeHint.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
                    <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}

            <Button
              size="sm"
              className="mt-3 w-full btn-ocean"
              onClick={hideHint}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Forstått!
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Inline hint trigger (question mark icon)
interface InlineHintProps {
  hintId: HintId;
  className?: string;
}

export const InlineHint = ({ hintId, className = '' }: InlineHintProps) => {
  const { showHint, seenHints } = useHints();
  const hint = HINTS[hintId];
  const isSeen = seenHints.has(hintId);

  return (
    <button
      onClick={() => showHint(hintId)}
      className={`inline-flex items-center justify-center rounded-full transition-all ${
        isSeen
          ? 'opacity-50 hover:opacity-100'
          : 'animate-pulse'
      } ${className}`}
      title={hint.title}
    >
      <HelpCircle className="h-4 w-4 text-primary" />
    </button>
  );
};

// Hook to trigger hints based on game state
export const useTriggerHint = (hintId: HintId, condition: boolean) => {
  const { showHint, seenHints } = useHints();

  useEffect(() => {
    if (condition && !seenHints.has(hintId)) {
      // Small delay to not overwhelm on initial render
      const timer = setTimeout(() => showHint(hintId), 500);
      return () => clearTimeout(timer);
    }
  }, [condition, hintId, seenHints, showHint]);
};

// Settings component to reset hints
export const HintSettings = () => {
  const { resetHints, seenHints } = useHints();

  return (
    <Card className="p-3 bg-slate-800/50 border-slate-600/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Hjelpetips</div>
            <div className="text-xs text-muted-foreground">
              {seenHints.size} av {Object.keys(HINTS).length} tips vist
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetHints}>
          Nullstill tips
        </Button>
      </div>
    </Card>
  );
};
