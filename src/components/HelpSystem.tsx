import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Anchor,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Coins,
  Dices,
  Fish,
  GraduationCap,
  Heart,
  HelpCircle,
  MapPin,
  Package,
  Search,
  Ship,
  Skull,
  Target,
  Trophy,
  Waves,
} from 'lucide-react';

// ============================================================================
// TUTORIAL DATA
// ============================================================================

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  tips?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Velkommen til Deep Regrets!',
    content: `Deep Regrets er et "push-your-luck" fiskespill satt i en mørk, eldritch-inspirert verden. Du spiller som en skipper som våger seg ut i stadig farligere farvann for å fange verdifull fisk - men jo dypere du går, jo større er risikoen for å miste forstanden.

Spillet varer i 6 dager (Mandag til Lørdag), og den med høyest poengsum ved spillets slutt vinner!`,
    icon: <Ship className="h-6 w-6" />,
    tips: [
      'Spillet handler om å balansere risiko og belønning',
      '2-5 spillere kan delta',
      'En runde tar ca. 30 minutter per spiller',
    ],
  },
  {
    id: 'dice',
    title: 'Terninger - Din Viktigste Ressurs',
    content: `Du starter med 3 terninger som representerer din evne til å handle. Terninger har to tilstander:

**Friske terninger** - Tilgjengelige for bruk
**Brukte terninger** - Allerede benyttet denne runden

Hver handling i spillet koster terninger. For å fange fisk må du bruke terninger som til sammen matcher eller overgår fiskens vanskelighetsgrad.`,
    icon: <Dices className="h-6 w-6" />,
    tips: [
      'Terninger "friskes opp" i begynnelsen av hver dag',
      'Jo flere Regrets du har, jo færre terninger kan du ha friske',
      'Noen karakterer starter med bonusterninger',
    ],
  },
  {
    id: 'sea',
    title: 'Havet - Utforsk Dypet',
    content: `Havet er et 3x3 rutenett fordelt på 3 dybdenivåer:

**Dybde I (Grunt)** - Enkel fisk, lav risiko
**Dybde II (Middels)** - Mer verdifull fisk, moderat risiko
**Dybde III (Dypt)** - Sjelden og verdifull fisk, høy risiko

Hver rute kalles en "shoal" og inneholder en stabel med fiskekort. Du kan kun se og fange den øverste fisken i hver shoal.`,
    icon: <Waves className="h-6 w-6" />,
    tips: [
      'Dypere fisk gir flere poeng men er vanskeligere å fange',
      'Du må bruke terninger for å dykke til dypere nivåer',
      'Når en shoal tømmes, er den tom resten av spillet',
    ],
  },
  {
    id: 'fishing',
    title: 'Fiske - Fang Din Fangst',
    content: `For å fange en fisk:

1. **Velg en shoal** - Klikk på en rute i havet
2. **Avslør fisken** - Se hva som skjuler seg der (koster 1 terning)
3. **Bestem deg** - Fang fisken eller la den være

For å fange må summen av dine valgte terninger være **lik eller høyere** enn fiskens vanskelighetsgrad. Brukte terninger blir "spent" og kan ikke brukes igjen før neste dag.`,
    icon: <Fish className="h-6 w-6" />,
    tips: [
      'Du trenger ikke fange en fisk du avslører',
      'Noen fisk har spesielle evner som aktiveres når du fanger dem',
      'Fisk i hånden gir poeng, men monterte fisk gir mer!',
    ],
  },
  {
    id: 'mounting',
    title: 'Montering - Vis Frem Trofeene',
    content: `Fisk du fanger havner først i hånden din. For å maksimere poeng bør du **montere** fisk på troféveggen din.

Du har 3 monteringsplasser med ulike multiplikatorer:
- **Plass 1:** ×1 (normal verdi)
- **Plass 2:** ×2 (dobbel verdi)
- **Plass 3:** ×3 (trippel verdi)

Montering koster forsyninger (Supplies), og du kan gjøre det i havnen.`,
    icon: <Trophy className="h-6 w-6" />,
    tips: [
      'Planlegg hvilken fisk som skal på hvilken plass',
      'En fisk med verdi 5 på ×3-plassen gir 15 poeng!',
      'Du kan kun montere når du er i havnen',
    ],
  },
  {
    id: 'port',
    title: 'Havnen - Din Trygge Havn',
    content: `Havnen er et trygt sted hvor du kan:

- **Selge fisk** - Bytt uønsket fisk mot Fishbucks
- **Kjøpe oppgraderinger** - Bedre stenger og hjul
- **Kjøpe forsyninger** - Trengs for montering
- **Montere fisk** - Sett fisk på troféveggen
- **Leie Tackle Dice** - Spesialterninger med unike egenskaper

Du velger lokasjon (Hav eller Havn) i Declaration-fasen.`,
    icon: <Anchor className="h-6 w-6" />,
    tips: [
      'Havnen er risikofri - ingen Regrets her',
      'Prisene varierer basert på hva du kjøper',
      'Tackle Dice kan gi deg en strategisk fordel',
    ],
  },
  {
    id: 'regrets',
    title: 'Regrets - Vokterne av Galskap',
    content: `**Regrets** representerer den mentale påkjenningen av å utforske dypet. Du får Regrets når:

- Du avslører visse farlige fisk
- Noen korteffekter gir deg Regrets
- Du dykker for dypt uten forberedelse

Regrets er **skjulte kort** med verdier 0-3. Ved spillslutt trekkes Regrets fra poengsummen din. I tillegg øker Madness-nivået ditt for hver 2-3 Regrets du har.`,
    icon: <Brain className="h-6 w-6" />,
    tips: [
      'Høyere Madness = færre tilgjengelige terninger',
      'Ved Madness 6+ risikerer du å utløse tidlig spillslutt',
      'Life Preserver kan beskytte mot Regrets',
    ],
  },
  {
    id: 'phases',
    title: 'Spillfaser - Dagens Rytme',
    content: `Hver dag har fire faser:

**1. Start** - Nye daglige effekter og "The Plug" aktiveres
**2. Refresh** - Alle spillere frisker opp terninger
**3. Declaration** - Velg lokasjon (Hav eller Havn)
**4. Action** - Utfør handlinger på valgt lokasjon

Etter Action-fasen går turen til neste spiller. Når alle har passert, starter en ny dag.`,
    icon: <CircleDot className="h-6 w-6" />,
    tips: [
      'Pass-knappen avslutter din tur for dagen',
      'Du får bonus-ressurser når du passer',
      'Planlegg dagen din basert på terningene du har',
    ],
  },
  {
    id: 'scoring',
    title: 'Poengberegning - Veien til Seier',
    content: `Ved spillets slutt beregnes poeng slik:

**+ Monterte fisk** - Verdi × monteringsmultiplikator
**+ Fisk i hånden** - Verdi (begrenset av Madness)
**+ Fishbucks** - 1 poeng per 3 Fishbucks
**- Regrets** - Trekk fra total Regret-verdi

Spilleren med høyest totale poengsum vinner! Ved uavgjort vinner den med færrest Regrets.`,
    icon: <Target className="h-6 w-6" />,
    tips: [
      'Høy Madness begrenser hvor mye håndpoeng du kan få',
      'Monterte fisk påvirkes ikke av Madness',
      'Balansér fiske med å holde Regrets nede',
    ],
  },
  {
    id: 'tips',
    title: 'Strategitips for Nybegynnere',
    content: `Her er noen tips for å komme i gang:

🎯 **Start forsiktig** - Lær mekanikkene i Dybde I før du dykker dypere
💰 **Spar Fishbucks** - Du trenger dem til forsyninger og oppgraderinger
🎲 **Bruk terninger smart** - Ikke bruk alle på én fisk
🏆 **Prioritér montering** - ×3-plassen er gull verdt
⚠️ **Pass på Regrets** - En liten mengde er OK, for mange er katastrofe`,
    icon: <GraduationCap className="h-6 w-6" />,
    tips: [
      'Det er bedre å passe tidlig enn å miste alle terningene',
      'Karaktervalg påvirker strategi - les bonusene nøye',
      'Øvelse gjør mester - spill noen runder for å lære!',
    ],
  },
];

// ============================================================================
// RULEBOOK DATA
// ============================================================================

interface RulebookSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  keywords: string[];
}

const rulebookSections: RulebookSection[] = [
  {
    id: 'overview',
    title: 'Spilloversikt',
    icon: <BookOpen className="h-5 w-5" />,
    keywords: ['oversikt', 'introduksjon', 'hva er', 'spill', 'regler', 'mål'],
    content: `**Deep Regrets** er et push-your-luck fiskespill for 2-5 spillere.

**Mål:** Ha flest poeng ved spillets slutt (etter 6 dager).

**Tema:** Du er en skipper som fisker i farlige, eldritch-infiserte farvann. Jo dypere du går, jo bedre fangst - men også større risiko for galskap.

**Spilletid:** Ca. 30 minutter per spiller.

**Komponenter:**
- Fiskekort (3 dybder)
- Terninger (spiller- og tackle-terninger)
- Regret-kort
- Dink-kort
- Fishbucks og Supplies tokens`,
  },
  {
    id: 'dice',
    title: 'Terninger',
    icon: <Dices className="h-5 w-5" />,
    keywords: ['terning', 'dice', 'fresh', 'spent', 'kast', 'rulle', 'tackle'],
    content: `**Spillerterninger:**
- Hver spiller starter med 3 terninger
- Terninger er enten Fresh (tilgjengelig) eller Spent (brukt)
- Refresh-fasen gjør Spent-terninger Fresh igjen
- Madness reduserer maks antall Fresh-terninger

**Tackle Dice:**
- Spesialterninger som kan leies i havnen
- Har unike verdier/distribusjoner
- Koster Fishbucks å leie
- Gir strategiske fordeler

**Bruk av terninger:**
- Avsløre fisk: 1 Fresh die
- Fange fisk: Terninger ≥ fiskens vanskelighetsgrad
- Bevege seg: Varierer basert på handling`,
  },
  {
    id: 'sea',
    title: 'Havet',
    icon: <Waves className="h-5 w-5" />,
    keywords: ['hav', 'sea', 'dybde', 'depth', 'shoal', 'grid', 'brett'],
    content: `**Struktur:**
- 3×3 rutenett per dybde
- 3 dybder totalt (I, II, III)
- Hver rute = en "shoal" med fiskekort

**Dybde I (Grunt):**
- Enkel fisk (verdi 1-4)
- Lav vanskelighetsgrad
- Minimal risiko

**Dybde II (Middels):**
- Moderat verdi (3-8)
- Middels vanskelighetsgrad
- Noe risiko for Regrets

**Dybde III (Dypt):**
- Høy verdi (5-15+)
- Høy vanskelighetsgrad
- Betydelig risiko
- Sjeldne, mektige fisk`,
  },
  {
    id: 'fishing',
    title: 'Fiske',
    icon: <Fish className="h-5 w-5" />,
    keywords: ['fiske', 'fang', 'catch', 'reveal', 'avsløre', 'fisk', 'kort'],
    content: `**Avsløre fisk:**
1. Velg en shoal
2. Betal 1 Fresh die
3. Se den øverste fisken

**Fange fisk:**
1. Velg terninger fra din pool
2. Summer må ≥ fiskens vanskelighetsgrad
3. Valgte terninger blir Spent
4. Fisken går til hånden din

**Fiskekort-egenskaper:**
- **Navn:** Fiskens identitet
- **Verdi:** Poengverdi
- **Vanskelighetsgrad:** Minimum terningsum
- **Evner:** Spesialeffekter ved fangst
- **Kvalitet:** Fair (trygg) eller Foul (kan gi Regrets)`,
  },
  {
    id: 'mounting',
    title: 'Montering',
    icon: <Trophy className="h-5 w-5" />,
    keywords: ['monter', 'mount', 'trophy', 'trofé', 'vegg', 'multiplikator', 'slot'],
    content: `**Troféveggen:**
- 3 monteringsplasser per spiller
- Hver plass har en multiplikator

**Multiplikatorer:**
- Plass 1: ×1 (normal verdi)
- Plass 2: ×2 (dobbel verdi)
- Plass 3: ×3 (trippel verdi)

**Montering:**
- Kun mulig i havnen
- Koster Supplies
- Velg fisk fra hånden
- Plasser på ledig slot

**Tips:**
- Spar høyverdifisk til ×3-plassen
- Planlegg montering tidlig
- Montert fisk påvirkes ikke av Madness`,
  },
  {
    id: 'port',
    title: 'Havnen',
    icon: <Anchor className="h-5 w-5" />,
    keywords: ['havn', 'port', 'harbor', 'butikk', 'shop', 'kjøp', 'selg', 'handel'],
    content: `**Tilgjengelige handlinger:**

**Selge fisk:**
- Selg fisk fra hånden
- Motta Fishbucks basert på verdi

**Kjøpe utstyr:**
- **Stenger (Rods):** Forbedrer fangstevne
- **Hjul (Reels):** Gir spesialeffekter
- **Forsyninger:** Trengs for montering

**Montere fisk:**
- Plasser fisk på troféveggen
- Koster Supplies per fisk

**Leie Tackle Dice:**
- Betal Fishbucks
- Få spesialterninger for dagen

**Sikkerhet:**
- Ingen risiko for Regrets i havnen
- Trygt sted for å reorganisere`,
  },
  {
    id: 'regrets',
    title: 'Regrets og Madness',
    icon: <Skull className="h-5 w-5" />,
    keywords: ['regret', 'madness', 'galskap', 'sinnssykdom', 'mental', 'skjult'],
    content: `**Regrets:**
- Skjulte kort med verdier 0-3
- Representerer mental belastning
- Trekkes fra sluttpoengsum
- Kan ikke ses før spillslutt

**Hvordan du får Regrets:**
- Avsløre Foul-kvalitet fisk
- Visse korteffekter
- Dykke uforsiktig

**Madness-nivåer:**
| Regrets | Madness | Max Fresh Dice |
|---------|---------|----------------|
| 0-2     | 0       | 3              |
| 3-4     | 1       | 3              |
| 5-6     | 2       | 2              |
| 7+      | 3+      | 1              |

**Madness 6+:**
- Kritisk tilstand
- Må kaste 2 fisk ELLER utløse spillslutt`,
  },
  {
    id: 'phases',
    title: 'Spillfaser',
    icon: <CircleDot className="h-5 w-5" />,
    keywords: ['fase', 'phase', 'tur', 'turn', 'dag', 'day', 'runde'],
    content: `**Daglig syklus:**

**1. Start-fase:**
- Daglige effekter aktiveres
- The Plug trekker seg tilbake
- Sjekk for spillslutt-betingelser

**2. Refresh-fase:**
- Alle Spent dice blir Fresh
- Madness begrenser maks Fresh

**3. Declaration-fase:**
- Hver spiller velger lokasjon
- Hav ELLER Havn for dagen
- Kan ikke endres etter valg

**4. Action-fase:**
- Utfør handlinger på valgt lokasjon
- Fortsett til du passer
- Pass gir bonus-ressurser

**Neste dag:**
- Når alle har passert
- Nytt døgn begynner
- 6 dager totalt (Man-Lør)`,
  },
  {
    id: 'theplug',
    title: 'The Plug',
    icon: <MapPin className="h-5 w-5" />,
    keywords: ['plug', 'erosjon', 'erosion', 'slutt', 'drowned', 'world'],
    content: `**Hva er The Plug?**
- Et spesielt kort som representerer havets erosjon
- Når det avsløres, aktiveres erosjonsmekanismen

**Erosjon:**
- Hver Start-fase fjernes én fisk fra shoals
- Erosjon sprer seg systematisk
- Når alle shoals tømmes = "Drowned World"

**Drowned World:**
- Utløser umiddelbart spillslutt
- Poengberegning skjer som normalt
- Kan skje før dag 6!

**Strategi:**
- Hold øye med hvor mange fisk som gjenstår
- The Plug kan akselerere spillslutt
- Planlegg for tidlig slutt`,
  },
  {
    id: 'scoring',
    title: 'Poengberegning',
    icon: <Target className="h-5 w-5" />,
    keywords: ['poeng', 'score', 'vinner', 'slutt', 'beregning', 'total'],
    content: `**Poengkilder:**

**+ Monterte fisk:**
- Verdi × slot-multiplikator
- Eksempel: Verdi 5 × ×3 = 15 poeng

**+ Fisk i hånden:**
- Sum av verdier
- Begrenset av Madness:
  - Madness 0-1: Full verdi
  - Madness 2: Maks 50%
  - Madness 3+: Maks 25%

**+ Fishbucks:**
- 1 poeng per 3 Fishbucks
- Rundes ned

**- Regrets:**
- Avslørt og summert
- Trekkes fra totalen

**Uavgjort:** Spilleren med færrest Regrets vinner.`,
  },
  {
    id: 'characters',
    title: 'Karakterer',
    icon: <Heart className="h-5 w-5" />,
    keywords: ['karakter', 'character', 'captain', 'kaptein', 'bonus', 'evne'],
    content: `**Captain Ahab:**
- +2 Fishbucks ved start
- Bedre startstang

**Captain Nemo:**
- Bedre starthjul
- Ignorerer første Regret

**Marina Deepcurrent:**
- Starter på Dybde II
- +1 ekstra Dink-kort

**Finn Saltwater:**
- +3 Fishbucks ved start
- Kan rerulle 1-ere

**Storm Blackwater:**
- +1 maks terning
- +1 ekstra monteringsslot

**Tips:** Velg karakter basert på spillestil - aggressiv, forsiktig, eller balansert.`,
  },
  {
    id: 'resources',
    title: 'Ressurser',
    icon: <Coins className="h-5 w-5" />,
    keywords: ['ressurs', 'resource', 'fishbucks', 'supplies', 'dinks', 'token'],
    content: `**Fishbucks (💰):**
- Hovedvaluta
- Brukes til kjøp i havnen
- Tjenes ved å selge fisk
- Gir poeng ved spillslutt (1 per 3)

**Supplies (📦):**
- Trengs for montering
- Kjøpes i havnen
- Noen fisk gir Supplies ved fangst

**Dink-kort (🃏):**
- Engangskort med spesialeffekter
- Kan snu kampen
- Begrensede i antall
- Les kortene nøye!

**Life Preserver (🛟):**
- Beskytter mot neste Regret
- Sjelden og verdifull
- Kan være livreddende i dypet`,
  },
  {
    id: 'upgrades',
    title: 'Oppgraderinger',
    icon: <Package className="h-5 w-5" />,
    keywords: ['oppgradering', 'upgrade', 'rod', 'stang', 'reel', 'hjul', 'utstyr'],
    content: `**Stenger (Rods):**
- Forbedrer fangstevne
- Ulike nivåer med bonuser
- Kan gi ekstra terningverdi
- Permanent oppgradering

**Hjul (Reels):**
- Gir passive bonuser
- Kan påvirke dykking
- Noen gir ekstra handlinger
- Velg basert på strategi

**Kjøp i havnen:**
- Koster Fishbucks
- Erstatter gammelt utstyr
- Vurder kost vs. nytte

**Anbefaling:**
- Oppgrader tidlig for langvarig gevinst
- Stenger for aggressive fiskere
- Hjul for forsiktige spillere`,
  },
];

// ============================================================================
// TUTORIAL COMPONENT
// ============================================================================

interface TutorialProps {
  onComplete?: () => void;
}

const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, step.id]));
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Progress bar */}
      <div className="mb-4 flex items-center gap-1">
        {tutorialSteps.map((s, index) => (
          <button
            key={s.id}
            onClick={() => handleStepClick(index)}
            className={`h-2 flex-1 rounded-full transition-all ${
              index === currentStep
                ? 'bg-primary'
                : completedSteps.has(s.id)
                  ? 'bg-primary/50'
                  : 'bg-white/20'
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Steg {currentStep + 1} av {tutorialSteps.length}
        </span>
        <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% fullført</span>
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-primary-glow">{step.title}</h3>
          </div>

          {/* Main content */}
          <div className="prose prose-invert prose-sm max-w-none">
            {step.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/90">
                {paragraph.split('**').map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-primary-glow">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>

          {/* Tips */}
          {step.tips && step.tips.length > 0 && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <HelpCircle className="h-4 w-4" />
                Tips
              </h4>
              <ul className="space-y-1">
                {step.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="border-white/30"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Forrige
        </Button>

        <div className="flex items-center gap-2">
          {completedSteps.size === tutorialSteps.length && (
            <Badge className="bg-green-500/20 text-green-400">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Fullført!
            </Badge>
          )}
        </div>

        <Button onClick={handleNext} className="btn-ocean">
          {isLastStep ? (
            <>
              Fullfør
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Neste
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// RULEBOOK COMPONENT
// ============================================================================

const Rulebook = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return rulebookSections;

    const query = searchQuery.toLowerCase();
    return rulebookSections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query) ||
        section.keywords.some((kw) => kw.includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Søk i regelboken..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="mb-2 text-xs text-muted-foreground">
          {filteredSections.length} resultat{filteredSections.length !== 1 ? 'er' : ''} funnet
        </div>
      )}

      {/* Sections */}
      <ScrollArea className="flex-1 pr-4">
        {filteredSections.length > 0 ? (
          <Accordion type="multiple" className="space-y-2">
            {filteredSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-lg border border-white/10 bg-white/5 px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                      {section.icon}
                    </div>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-invert prose-sm max-w-none pb-4 pt-2">
                    {section.content.split('\n\n').map((paragraph, i) => {
                      // Check if it's a table
                      if (paragraph.includes('|') && paragraph.includes('---')) {
                        const lines = paragraph.split('\n').filter((l) => l.trim());
                        const headers = lines[0]
                          .split('|')
                          .filter((c) => c.trim())
                          .map((c) => c.trim());
                        const rows = lines.slice(2).map((row) =>
                          row
                            .split('|')
                            .filter((c) => c.trim())
                            .map((c) => c.trim())
                        );

                        return (
                          <div key={i} className="my-2 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/20">
                                  {headers.map((h, j) => (
                                    <th
                                      key={j}
                                      className="px-2 py-1 text-left font-semibold text-primary"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, j) => (
                                  <tr key={j} className="border-b border-white/10">
                                    {row.map((cell, k) => (
                                      <td key={k} className="px-2 py-1 text-foreground/80">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      // Check if it's a list
                      if (paragraph.startsWith('- ')) {
                        return (
                          <ul key={i} className="my-2 space-y-1">
                            {paragraph.split('\n').map((item, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2 text-sm text-foreground/80"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                {item
                                  .replace(/^- /, '')
                                  .split('**')
                                  .map((part, k) =>
                                    k % 2 === 1 ? (
                                      <strong key={k} className="text-primary-glow">
                                        {part}
                                      </strong>
                                    ) : (
                                      part
                                    )
                                  )}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      // Regular paragraph
                      return (
                        <p key={i} className="my-2 text-sm leading-relaxed text-foreground/90">
                          {paragraph.split('**').map((part, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} className="text-primary-glow">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Ingen resultater for "{searchQuery}"</p>
            <Button
              variant="link"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-primary"
            >
              Nullstill søk
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* External rulebook link */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <Button asChild variant="outline" className="w-full border-primary/30">
          <a href="/Deep%20Regrets%20Rulebook_EN.pdf" target="_blank" rel="noreferrer">
            <BookOpen className="mr-2 h-4 w-4" />
            Åpne komplett regelbok (PDF)
          </a>
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN HELP SYSTEM COMPONENT
// ============================================================================

interface HelpSystemProps {
  defaultTab?: 'tutorial' | 'rulebook';
  onTutorialComplete?: () => void;
}

export const HelpSystem = ({ defaultTab = 'tutorial', onTutorialComplete }: HelpSystemProps) => {
  return (
    <Tabs defaultValue={defaultTab} className="flex h-full flex-col">
      <TabsList className="grid w-full grid-cols-2 bg-background/50">
        <TabsTrigger
          value="tutorial"
          className="flex items-center gap-2 data-[state=active]:bg-primary/20"
        >
          <GraduationCap className="h-4 w-4" />
          Tutorial
        </TabsTrigger>
        <TabsTrigger
          value="rulebook"
          className="flex items-center gap-2 data-[state=active]:bg-primary/20"
        >
          <BookOpen className="h-4 w-4" />
          Regelbok
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tutorial" className="mt-4 flex-1 overflow-hidden">
        <Tutorial onComplete={onTutorialComplete} />
      </TabsContent>

      <TabsContent value="rulebook" className="mt-4 flex-1 overflow-hidden">
        <Rulebook />
      </TabsContent>
    </Tabs>
  );
};
