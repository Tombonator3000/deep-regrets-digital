import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Language = 'en' | 'no';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'deep-regrets-language';

// Get browser default language
const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('no') || browserLang.startsWith('nb') || browserLang.startsWith('nn')) {
    return 'no';
  }
  return 'en';
};

const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'no') {
    return stored;
  }
  return getBrowserLanguage();
};

// Translation type for nested objects
type TranslationValue = string | string[] | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

// Norwegian translations
const no: Translations = {
  // Common
  common: {
    back: 'Tilbake',
    next: 'Neste',
    previous: 'Forrige',
    complete: 'Fullfør',
    completed: 'Fullført!',
    cancel: 'Avbryt',
    save: 'Lagre',
    reset: 'Nullstill',
    resetToDefaults: 'Tilbakestill til standard',
    search: 'Søk',
    noResults: 'Ingen resultater',
    loading: 'Laster...',
    error: 'Feil',
    on: 'På',
    off: 'Av',
    step: 'Steg',
    of: 'av',
    tips: 'Tips',
    results: 'resultater',
    result: 'resultat',
    found: 'funnet',
  },

  // Start Screen
  startScreen: {
    title: 'DEEP REGRETS',
    subtitle: 'An Unfortunate Fishing Game',
    description: 'Våg deg ned i havets mørke dyp, fang eldritch-fisk, og håndter dine voksende anger i dette push-your-luck fiskeeventyret.',
    gameTime: 'Spilletid:',
    gameTimeValue: '~30 minutter per spiller',
    objective: 'Mål:',
    objectiveValue: 'Fang verdifull fisk mens du håndterer anger',
    warning: 'Advarsel:',
    warningValue: 'Jo dypere du går, jo større belønninger... og redsel',
    newGame: 'Nytt Spill',
    options: 'Innstillinger',
    howToPlay: 'Hvordan Spille',
    gameSetup: 'Spilloppsett',
    playersTotal: 'Spillere Totalt',
    player: 'Spiller',
    players: 'Spillere',
    humanPlayers: 'Menneskelige Spillere',
    aiOpponents: 'AI Motstandere',
    aiDifficulty: 'AI Vanskelighetsgrad',
    easy: 'Lett',
    medium: 'Medium',
    hard: 'Vanskelig',
    soloPractice: 'Solo treningsrunde',
    localMultiplayer: 'Lokal flerspiller',
    spectatorMode: 'Tilskuermodus - se AI-spillere konkurrere',
    vsAi: 'mot',
    aiOpponent: 'AI motstander',
    aiOpponents2: 'AI motstandere',
    human: 'menneske',
    humans: 'mennesker',
    welcomeBanner: {
      title: 'Velkommen til Deep Regrets!',
      message: 'Første gang? Vi anbefaler å se på tutorialen for å lære spillets regler og mekanikker.',
      seeTutorial: 'Se Tutorial',
    },
  },

  // Options Menu
  options: {
    title: 'Innstillinger',
    description: 'Konfigurer lyd-, visnings- og språkinnstillinger før du dykker ned i dypet.',
    audio: 'Lyd',
    display: 'Visning',
    language: 'Språk',
    masterVolume: 'Hovedvolum',
    masterVolumeDesc: 'Kontrollerer generelt lydnivå',
    backgroundMusic: 'Bakgrunnsmusikk',
    backgroundMusicDesc: 'Atmosfæriske lydspor fra dypet',
    selectTrack: 'Velg Spor',
    chooseTrack: 'Velg et spor',
    play: 'Spill',
    pause: 'Pause',
    stop: 'Stopp',
    musicVolume: 'Musikkvolum',
    browserBlocked: 'Nettleseren blokkerte automatisk avspilling',
    enableSound: 'Aktiver Lyd',
    noMusicTracks: 'Ingen musikkspor funnet. Legg til MP3-filer i',
    soundEffects: 'Lydeffekter',
    soundEffectsDesc: 'Bobler, plasking og grensesnittlyder',
    effectsVolume: 'Effektvolum',
    testSound: 'Test Lyd',
    visualEffects: 'Visuelle Effekter',
    visualEffectsDesc: 'Kontroller animasjoner og partikkeleffekter',
    uiAnimations: 'UI Animasjoner',
    uiAnimationsDesc: 'Kortvendinger, terningkast, overganger',
    oceanParticles: 'Havpartikler',
    oceanParticlesDesc: 'Flytende rusk og lyseffekter',
    risingBubbles: 'Stigende Bobler',
    risingBubblesDesc: 'Animerte bobleeffekter i bakgrunnen',
    performanceTips: 'Ytelsestips',
    performanceTip1: 'Deaktiver visuelle effekter på eldre enheter for jevnere spilling',
    performanceTip2: 'Bobler og partikler har størst innvirkning på ytelsen',
    performanceTip3: 'Bruk fullskjermmodus for best opplevelse',
    languageSelection: 'Språkvalg',
    languageSelectionDesc: 'Velg ditt foretrukne språk for grensesnittet',
    selectLanguage: 'Velg Språk',
    norwegian: 'Norsk',
    english: 'English',
    languageNote: 'Merk: Noe spillinnhold kan være på originalspråket.',
  },

  // Help System
  help: {
    title: 'Hvordan Spille',
    description: 'Lær å spille Deep Regrets med vår interaktive veiledning.',
    tutorial: 'Veiledning',
    rulebook: 'Regelbok',
    searchRulebook: 'Søk i regelboken...',
    resetSearch: 'Nullstill søk',
    openFullRulebook: 'Åpne komplett regelbok (PDF)',
    noResultsFor: 'Ingen resultater for',
  },

  // Tutorial Steps
  tutorial: {
    welcome: {
      title: 'Velkommen til Deep Regrets!',
      content: `Deep Regrets er et "push-your-luck" fiskespill satt i en mørk, eldritch-inspirert verden. Du spiller som en skipper som våger seg ut i stadig farligere farvann for å fange verdifull fisk - men jo dypere du går, jo større er risikoen for å miste forstanden.

Spillet varer i 6 dager (Mandag til Lørdag), og den med høyest poengsum ved spillets slutt vinner!`,
      tips: [
        'Spillet handler om å balansere risiko og belønning',
        '2-5 spillere kan delta',
        'En runde tar ca. 30 minutter per spiller',
      ],
    },
    dice: {
      title: 'Terninger - Din Viktigste Ressurs',
      content: `Du starter med 3 terninger som representerer din evne til å handle. Terninger har to tilstander:

**Friske terninger** - Tilgjengelige for bruk
**Brukte terninger** - Allerede benyttet denne runden

Hver handling i spillet koster terninger. For å fange fisk må du bruke terninger som til sammen matcher eller overgår fiskens vanskelighetsgrad.

**Madness og terninger:** Jo flere Regrets du samler, jo flere terninger kan du ha (4-8 maks), men verdien på fisk endres basert på Madness-nivået ditt.`,
      tips: [
        'Terninger "friskes opp" i begynnelsen av hver dag',
        'Flere Regrets gir deg flere terninger (4 ved 0 Regrets, opptil 8 ved 13+)',
        'Noen karakterer starter med bonusterninger',
      ],
    },
    sea: {
      title: 'Havet - Utforsk Dypet',
      content: `Havet er et 3x3 rutenett fordelt på 3 dybdenivåer:

**Dybde I (Grunt)** - Enkel fisk, lav risiko
**Dybde II (Middels)** - Mer verdifull fisk, moderat risiko
**Dybde III (Dypt)** - Sjelden og verdifull fisk, høy risiko

Hver rute kalles en "shoal" og inneholder en stabel med fiskekort. Du kan kun se og fange den øverste fisken i hver shoal.`,
      tips: [
        'Dypere fisk gir flere poeng men er vanskeligere å fange',
        'Du må bruke terninger for å dykke til dypere nivåer',
        'Når en shoal tømmes, er den tom resten av spillet',
      ],
    },
    fishing: {
      title: 'Fiske - Fang Din Fangst',
      content: `For å fange en fisk:

1. **Velg en shoal** - Klikk på en rute i havet
2. **Avslør fisken** - Se hva som skjuler seg der (koster 1 terning)
3. **Bestem deg** - Fang fisken eller la den være

For å fange må summen av dine valgte terninger være **lik eller høyere** enn fiskens vanskelighetsgrad. Brukte terninger blir "spent" og kan ikke brukes igjen før neste dag.`,
      tips: [
        'Du trenger ikke fange en fisk du avslører',
        'Noen fisk har spesielle evner som aktiveres når du fanger dem',
        'Fisk i hånden gir poeng, men monterte fisk gir mer!',
      ],
    },
    mounting: {
      title: 'Montering - Vis Frem Trofeene',
      content: `Fisk du fanger havner først i hånden din. For å maksimere poeng bør du **montere** fisk på troféveggen din.

Du har 3 monteringsplasser med ulike multiplikatorer:
- **Plass 1:** ×1 (normal verdi)
- **Plass 2:** ×2 (dobbel verdi)
- **Plass 3:** ×3 (trippel verdi)

Montering koster forsyninger (Supplies), og du kan gjøre det i havnen.`,
      tips: [
        'Planlegg hvilken fisk som skal på hvilken plass',
        'En fisk med verdi 5 på ×3-plassen gir 15 poeng!',
        'Du kan kun montere når du er i havnen',
      ],
    },
    port: {
      title: 'Havnen - Din Trygge Havn',
      content: `Havnen er et trygt sted hvor du kan:

- **Selge fisk** - Bytt uønsket fisk mot Fishbucks
- **Kjøpe oppgraderinger** - Bedre stenger og hjul
- **Kjøpe forsyninger** - Trengs for montering
- **Montere fisk** - Sett fisk på troféveggen
- **Leie Tackle Dice** - Spesialterninger med unike egenskaper

**Port-fordeler ved ankomst:**
- **Muster Your Courage** - Kast alle terningene dine på nytt
- **Can of Worms** - Snu kortet med forsiden opp
- **Kast én Regret** - Du kan frivillig kvitte deg med én Regret

Du velger lokasjon (Hav eller Havn) i Declaration-fasen.`,
      tips: [
        'Havnen er risikofri - ingen Regrets her',
        'Ved 13+ Regrets får du $1 rabatt på alle kjøp',
        'Tackle Dice kan gi deg en strategisk fordel',
      ],
    },
    regrets: {
      title: 'Regrets - Vokterne av Galskap',
      content: `**Regrets** representerer den mentale påkjenningen av å utforske dypet. Du får Regrets når:

- Du avslører visse farlige fisk (Foul-kvalitet)
- Noen korteffekter gir deg Regrets
- Du dykker for dypt uten forberedelse

Regrets er **skjulte kort** med verdier 0-3. Ved spillslutt trekkes Regrets fra poengsummen din.

**Madness-systemet** påvirker fiskverdier:
- **0 Regrets:** Fair +2, Foul -2, 4 maks terninger
- **1-3 Regrets:** Fair +1, Foul -1, 4 maks terninger
- **4-6 Regrets:** Fair +1, Foul ±0, 5 maks terninger
- **7-9 Regrets:** Fair ±0, Foul +1, 6 maks terninger
- **10-12 Regrets:** Fair -1, Foul +1, 7 maks terninger
- **13+ Regrets:** Fair -2, Foul +2, 8 maks terninger + portrabatt`,
      tips: [
        'Flere Regrets gir deg flere terninger, men endrer fiskverdier',
        'Ved 13+ Regrets får du $1 rabatt i havnen',
        'Life Preserver kan beskytte mot Regrets',
      ],
    },
    phases: {
      title: 'Spillfaser - Dagens Rytme',
      content: `Hver dag har fire faser:

**1. Start** - Nye daglige effekter og "The Plug" aktiveres
**2. Refresh** - Alle spillere frisker opp terninger
**3. Declaration** - Velg lokasjon (Hav eller Havn)
**4. Action** - Utfør handlinger på valgt lokasjon

**Daglige effekter:**
- **Onsdag/Fredag:** Alle spillere snur Can of Worms-kortet
- **Torsdag/Lørdag:** Alle spillere får én Tackle-terning

**Siste spiller-regelen:** Når alle andre har passet, får siste spiller 2 ekstra turer (hav) eller 4 turer (havn) før de må passe.`,
      tips: [
        'Første spiller som passer får Fish Coin (blir startspiller neste dag)',
        'Planlegg dagen din basert på terningene du har',
        'Siste spiller kan utnytte ekstra turer strategisk',
      ],
    },
    scoring: {
      title: 'Poengberegning - Veien til Seier',
      content: `Ved spillets slutt beregnes poeng slik:

**+ Monterte fisk** - (Basisverdi + Madness-modifier) × monteringsmultiplikator
**+ Fisk i hånden** - Basisverdi + Madness-modifier
**+ Fishbucks** - 1 poeng per Fishbuck
**- Regrets** - Trekk fra total Regret-verdi

**Slutt-straff:** Spilleren med høyest Regret-verdi må kassere én montert fisk (laveste for 2 spillere, høyeste for 3+ spillere).

Spilleren med høyest totale poengsum vinner! Ved uavgjort vinner den med lavest Regret-verdi, deretter færrest Regret-kort.`,
      tips: [
        'Fair fisk gir bonus ved lav Madness, Foul fisk gir bonus ved høy',
        'Monterte fisk justeres FØRST av Madness, SÅ ganget med multiplikator',
        'Balansér mellom Fair og Foul fisk basert på din Madness-strategi',
      ],
    },
    tips: {
      title: 'Strategitips for Nybegynnere',
      content: `Her er noen tips for å komme i gang:

🎯 **Start forsiktig** - Lær mekanikkene i Dybde I før du dykker dypere
💰 **Spar Fishbucks** - Du trenger dem til forsyninger og oppgraderinger
🎲 **Bruk terninger smart** - Ikke bruk alle på én fisk
🏆 **Prioritér montering** - ×3-plassen er gull verdt
⚠️ **Pass på Regrets** - En liten mengde er OK, for mange er katastrofe`,
      tips: [
        'Det er bedre å passe tidlig enn å miste alle terningene',
        'Karaktervalg påvirker strategi - les bonusene nøye',
        'Øvelse gjør mester - spill noen runder for å lære!',
      ],
    },
  },

  // Rulebook Sections
  rulebook: {
    overview: {
      title: 'Spilloversikt',
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
    dice: {
      title: 'Terninger',
      keywords: ['terning', 'dice', 'fresh', 'spent', 'kast', 'rulle', 'tackle'],
      content: `**Spillerterninger:**
- Hver spiller starter med 3 terninger
- Terninger er enten Fresh (tilgjengelig) eller Spent (brukt)
- Refresh-fasen gjør Spent-terninger Fresh igjen
- Madness øker maks antall Fresh-terninger (4-8)

**Tackle Dice:**
- Spesialterninger som kan leies i havnen
- Har unike verdier/distribusjoner
- Koster Fishbucks å leie
- Gir strategiske fordeler
- Alle spillere får gratis Tackle-terning på torsdag og lørdag

**Bruk av terninger:**
- Avsløre fisk: 1 Fresh die
- Fange fisk: Terninger ≥ fiskens vanskelighetsgrad
- Bevege seg dypere: Terning med verdi ≥ 3`,
    },
    sea: {
      title: 'Havet',
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
    fishing: {
      title: 'Fiske',
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
    mounting: {
      title: 'Montering',
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
- Madness-modifier legges til FØR multiplikator`,
    },
    port: {
      title: 'Havnen',
      keywords: ['havn', 'port', 'harbor', 'butikk', 'shop', 'kjøp', 'selg', 'handel'],
      content: `**Port-fordeler ved ankomst:**
- **Muster Your Courage:** Kast alle terningene dine på nytt
- **Can of Worms:** Snu kortet med forsiden opp
- **Kast Regret:** Du kan frivillig kvitte deg med én Regret

**Tilgjengelige handlinger:**

**Selge fisk:**
- Selg fisk fra hånden
- Verdi justeres av Madness (Fair/Foul-modifier)

**Kjøpe utstyr:**
- **Stenger (Rods):** Forbedrer fangstevne
- **Hjul (Reels):** Gir spesialeffekter
- **Forsyninger:** Trengs for montering
- Ved 13+ Regrets: $1 rabatt på alle kjøp

**Montere fisk:**
- Plasser fisk på troféveggen
- Koster Supplies per fisk

**Leie Tackle Dice:**
- Betal Fishbucks
- Få spesialterninger for dagen

**Sikkerhet:**
- Ingen risiko for Regrets i havnen`,
    },
    regrets: {
      title: 'Regrets og Madness',
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

**Madness-systemet (6 nivåer):**
| Regrets | Fair | Foul | Max Dice | Port |
|---------|------|------|----------|------|
| 0       | +2   | -2   | 4        | -    |
| 1-3     | +1   | -1   | 4        | -    |
| 4-6     | +1   | ±0   | 5        | -    |
| 7-9     | ±0   | +1   | 6        | -    |
| 10-12   | -1   | +1   | 7        | -    |
| 13+     | -2   | +2   | 8        | -$1  |

**Fair/Foul:** Modifiserer fiskens verdi ved salg og scoring.
**Port -$1:** Rabatt på alle kjøp i havnen ved 13+ Regrets.`,
    },
    phases: {
      title: 'Spillfaser',
      keywords: ['fase', 'phase', 'tur', 'turn', 'dag', 'day', 'runde'],
      content: `**Daglig syklus:**

**1. Start-fase:**
- Daglige effekter aktiveres
- The Plug trekker seg tilbake
- Sjekk for spillslutt-betingelser
- **Onsdag/Fredag:** Alle snur Can of Worms
- **Torsdag/Lørdag:** Alle får én Tackle-terning

**2. Refresh-fase:**
- Alle Spent dice blir Fresh
- Madness bestemmer maks Fresh (4-8)

**3. Declaration-fase:**
- Hver spiller velger lokasjon
- Hav ELLER Havn for dagen
- Kan ikke endres etter valg

**4. Action-fase:**
- Utfør handlinger på valgt lokasjon
- Fortsett til du passer
- Første å passe får Fish Coin

**Siste spiller-regel:**
- Når alle andre har passet
- Siste spiller får 2 turer (hav) eller 4 turer (havn)

**Neste dag:**
- Når alle har passert
- Nytt døgn begynner
- 6 dager totalt (Man-Lør)`,
    },
    theplug: {
      title: 'The Plug',
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
    scoring: {
      title: 'Poengberegning',
      keywords: ['poeng', 'score', 'vinner', 'slutt', 'beregning', 'total'],
      content: `**Poengkilder:**

**+ Monterte fisk:**
- (Basisverdi + Madness-modifier) × slot-multiplikator
- Eksempel: Fair fisk verdi 5 ved 0 Regrets = (5+2) × 3 = 21 poeng

**+ Fisk i hånden:**
- Basisverdi + Madness-modifier
- Fair fisk: bonus ved lav Madness (+2 til -2)
- Foul fisk: bonus ved høy Madness (-2 til +2)

**+ Fishbucks:**
- 1 poeng per Fishbuck

**- Regrets:**
- Avslørt og summert
- Trekkes fra totalen

**Slutt-straff:**
- Spilleren med høyest Regret-verdi kasserer én mont:
  - 2 spillere: laveste monterte fisk
  - 3+ spillere: høyeste monterte fisk

**Uavgjort:** Lavest Regret-verdi vinner, deretter færrest Regret-kort.`,
    },
    characters: {
      title: 'Karakterer',
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
    resources: {
      title: 'Ressurser',
      keywords: ['ressurs', 'resource', 'fishbucks', 'supplies', 'dinks', 'token'],
      content: `**Fishbucks (💰):**
- Hovedvaluta
- Brukes til kjøp i havnen
- Tjenes ved å selge fisk
- Gir 1 poeng per Fishbuck ved spillslutt

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
    upgrades: {
      title: 'Oppgraderinger',
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
  },
};

// English translations
const en: Translations = {
  // Common
  common: {
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    complete: 'Complete',
    completed: 'Completed!',
    cancel: 'Cancel',
    save: 'Save',
    reset: 'Reset',
    resetToDefaults: 'Reset to Defaults',
    search: 'Search',
    noResults: 'No results',
    loading: 'Loading...',
    error: 'Error',
    on: 'On',
    off: 'Off',
    step: 'Step',
    of: 'of',
    tips: 'Tips',
    results: 'results',
    result: 'result',
    found: 'found',
  },

  // Start Screen
  startScreen: {
    title: 'DEEP REGRETS',
    subtitle: 'An Unfortunate Fishing Game',
    description: 'Venture into the dark depths of the ocean, catch eldritch fish, and manage your growing regrets in this push-your-luck fishing adventure.',
    gameTime: 'Game Time:',
    gameTimeValue: '~30 minutes per player',
    objective: 'Objective:',
    objectiveValue: 'Catch valuable fish while managing regrets',
    warning: 'Warning:',
    warningValue: 'The deeper you go, the greater the rewards... and the horror',
    newGame: 'New Game',
    options: 'Options',
    howToPlay: 'How to Play',
    gameSetup: 'Game Setup',
    playersTotal: 'Players Total',
    player: 'Player',
    players: 'Players',
    humanPlayers: 'Human Players',
    aiOpponents: 'AI Opponents',
    aiDifficulty: 'AI Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    soloPractice: 'Solo practice mode',
    localMultiplayer: 'Local multiplayer',
    spectatorMode: 'Spectator mode - watch AI players compete',
    vsAi: 'vs',
    aiOpponent: 'AI opponent',
    aiOpponents2: 'AI opponents',
    human: 'human',
    humans: 'humans',
    welcomeBanner: {
      title: 'Welcome to Deep Regrets!',
      message: 'First time? We recommend checking out the tutorial to learn the game rules and mechanics.',
      seeTutorial: 'See Tutorial',
    },
  },

  // Options Menu
  options: {
    title: 'Options',
    description: 'Configure your audio, display, and language preferences before descending into the depths.',
    audio: 'Audio',
    display: 'Display',
    language: 'Language',
    masterVolume: 'Master Volume',
    masterVolumeDesc: 'Controls overall audio level',
    backgroundMusic: 'Background Music',
    backgroundMusicDesc: 'Atmospheric soundtracks from the deep',
    selectTrack: 'Select Track',
    chooseTrack: 'Choose a track',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    musicVolume: 'Music Volume',
    browserBlocked: 'Browser blocked audio autoplay',
    enableSound: 'Enable Sound',
    noMusicTracks: 'No music tracks found. Add MP3 files to',
    soundEffects: 'Sound Effects',
    soundEffectsDesc: 'Bubbles, splashes, and interface sounds',
    effectsVolume: 'Effects Volume',
    testSound: 'Test Sound',
    visualEffects: 'Visual Effects',
    visualEffectsDesc: 'Control animations and particle effects',
    uiAnimations: 'UI Animations',
    uiAnimationsDesc: 'Card flips, dice rolls, transitions',
    oceanParticles: 'Ocean Particles',
    oceanParticlesDesc: 'Floating debris and light effects',
    risingBubbles: 'Rising Bubbles',
    risingBubblesDesc: 'Animated bubble effects in background',
    performanceTips: 'Performance Tips',
    performanceTip1: 'Disable visual effects on older devices for smoother gameplay',
    performanceTip2: 'Bubbles and particles have the most impact on performance',
    performanceTip3: 'Use fullscreen mode for the best experience',
    languageSelection: 'Language Selection',
    languageSelectionDesc: 'Choose your preferred language for the interface',
    selectLanguage: 'Select Language',
    norwegian: 'Norsk',
    english: 'English',
    languageNote: 'Note: Some game content may be in the original language.',
  },

  // Help System
  help: {
    title: 'How to Play',
    description: 'Learn how to play Deep Regrets with our interactive tutorial.',
    tutorial: 'Tutorial',
    rulebook: 'Rulebook',
    searchRulebook: 'Search the rulebook...',
    resetSearch: 'Reset search',
    openFullRulebook: 'Open full rulebook (PDF)',
    noResultsFor: 'No results for',
  },

  // Tutorial Steps
  tutorial: {
    welcome: {
      title: 'Welcome to Deep Regrets!',
      content: `Deep Regrets is a "push-your-luck" fishing game set in a dark, eldritch-inspired world. You play as a skipper venturing into increasingly dangerous waters to catch valuable fish - but the deeper you go, the greater the risk of losing your sanity.

The game lasts 6 days (Monday to Saturday), and the player with the highest score at the end wins!`,
      tips: [
        'The game is about balancing risk and reward',
        '2-5 players can participate',
        'A round takes about 30 minutes per player',
      ],
    },
    dice: {
      title: 'Dice - Your Most Important Resource',
      content: `You start with 3 dice representing your ability to act. Dice have two states:

**Fresh dice** - Available for use
**Spent dice** - Already used this round

Every action in the game costs dice. To catch fish, you must use dice that together match or exceed the fish's difficulty rating.

**Madness and dice:** The more Regrets you collect, the more dice you can have (4-8 max), but fish values change based on your Madness level.`,
      tips: [
        'Dice are "refreshed" at the beginning of each day',
        'More Regrets give you more dice (4 at 0 Regrets, up to 8 at 13+)',
        'Some characters start with bonus dice',
      ],
    },
    sea: {
      title: 'The Sea - Explore the Depths',
      content: `The sea is a 3x3 grid spread across 3 depth levels:

**Depth I (Shallow)** - Easy fish, low risk
**Depth II (Medium)** - More valuable fish, moderate risk
**Depth III (Deep)** - Rare and valuable fish, high risk

Each square is called a "shoal" and contains a stack of fish cards. You can only see and catch the top fish in each shoal.`,
      tips: [
        'Deeper fish give more points but are harder to catch',
        'You must spend dice to dive to deeper levels',
        'When a shoal is emptied, it stays empty for the rest of the game',
      ],
    },
    fishing: {
      title: 'Fishing - Catch Your Haul',
      content: `To catch a fish:

1. **Choose a shoal** - Click on a square in the sea
2. **Reveal the fish** - See what's hiding there (costs 1 die)
3. **Decide** - Catch the fish or leave it

To catch, the sum of your chosen dice must be **equal to or higher** than the fish's difficulty rating. Used dice become "spent" and cannot be used again until the next day.`,
      tips: [
        'You don\'t have to catch a fish you reveal',
        'Some fish have special abilities that activate when you catch them',
        'Fish in hand give points, but mounted fish give more!',
      ],
    },
    mounting: {
      title: 'Mounting - Display Your Trophies',
      content: `Fish you catch first go to your hand. To maximize points, you should **mount** fish on your trophy wall.

You have 3 mounting slots with different multipliers:
- **Slot 1:** ×1 (normal value)
- **Slot 2:** ×2 (double value)
- **Slot 3:** ×3 (triple value)

Mounting costs supplies, and you can do it in the port.`,
      tips: [
        'Plan which fish goes on which slot',
        'A fish worth 5 on the ×3 slot gives 15 points!',
        'You can only mount when you\'re in the port',
      ],
    },
    port: {
      title: 'The Port - Your Safe Haven',
      content: `The port is a safe place where you can:

- **Sell fish** - Trade unwanted fish for Fishbucks
- **Buy upgrades** - Better rods and reels
- **Buy supplies** - Needed for mounting
- **Mount fish** - Place fish on the trophy wall
- **Rent Tackle Dice** - Special dice with unique properties

**Port benefits upon arrival:**
- **Muster Your Courage** - Reroll all your dice
- **Can of Worms** - Flip the card face up
- **Discard a Regret** - You can voluntarily get rid of one Regret

You choose location (Sea or Port) in the Declaration phase.`,
      tips: [
        'The port is risk-free - no Regrets here',
        'At 13+ Regrets you get $1 discount on all purchases',
        'Tackle Dice can give you a strategic advantage',
      ],
    },
    regrets: {
      title: 'Regrets - Guardians of Madness',
      content: `**Regrets** represent the mental strain of exploring the depths. You get Regrets when:

- You reveal certain dangerous fish (Foul quality)
- Some card effects give you Regrets
- You dive too deep without preparation

Regrets are **hidden cards** with values 0-3. At game end, Regrets are subtracted from your score.

**The Madness system** affects fish values:
- **0 Regrets:** Fair +2, Foul -2, 4 max dice
- **1-3 Regrets:** Fair +1, Foul -1, 4 max dice
- **4-6 Regrets:** Fair +1, Foul ±0, 5 max dice
- **7-9 Regrets:** Fair ±0, Foul +1, 6 max dice
- **10-12 Regrets:** Fair -1, Foul +1, 7 max dice
- **13+ Regrets:** Fair -2, Foul +2, 8 max dice + port discount`,
      tips: [
        'More Regrets give you more dice, but change fish values',
        'At 13+ Regrets you get $1 discount in the port',
        'Life Preserver can protect against Regrets',
      ],
    },
    phases: {
      title: 'Game Phases - The Daily Rhythm',
      content: `Each day has four phases:

**1. Start** - New daily effects and "The Plug" activates
**2. Refresh** - All players refresh their dice
**3. Declaration** - Choose location (Sea or Port)
**4. Action** - Perform actions at chosen location

**Daily effects:**
- **Wednesday/Friday:** All players flip Can of Worms card
- **Thursday/Saturday:** All players get one Tackle die

**Last player rule:** When everyone else has passed, the last player gets 2 extra turns (sea) or 4 turns (port) before they must pass.`,
      tips: [
        'First player to pass gets Fish Coin (becomes start player next day)',
        'Plan your day based on the dice you have',
        'Last player can exploit extra turns strategically',
      ],
    },
    scoring: {
      title: 'Scoring - The Path to Victory',
      content: `At game end, points are calculated like this:

**+ Mounted fish** - (Base value + Madness modifier) × mounting multiplier
**+ Fish in hand** - Base value + Madness modifier
**+ Fishbucks** - 1 point per Fishbuck
**- Regrets** - Subtract total Regret value

**End penalty:** The player with the highest Regret value must discard one mounted fish (lowest for 2 players, highest for 3+ players).

The player with the highest total score wins! In case of a tie, the one with the lowest Regret value wins, then fewest Regret cards.`,
      tips: [
        'Fair fish give bonus at low Madness, Foul fish give bonus at high',
        'Mounted fish are adjusted FIRST by Madness, THEN multiplied',
        'Balance between Fair and Foul fish based on your Madness strategy',
      ],
    },
    tips: {
      title: 'Strategy Tips for Beginners',
      content: `Here are some tips to get started:

🎯 **Start carefully** - Learn the mechanics in Depth I before diving deeper
💰 **Save Fishbucks** - You need them for supplies and upgrades
🎲 **Use dice wisely** - Don't spend all on one fish
🏆 **Prioritize mounting** - The ×3 slot is worth its weight in gold
⚠️ **Watch your Regrets** - A small amount is OK, too many is catastrophe`,
      tips: [
        'It\'s better to pass early than lose all your dice',
        'Character choice affects strategy - read the bonuses carefully',
        'Practice makes perfect - play a few rounds to learn!',
      ],
    },
  },

  // Rulebook Sections
  rulebook: {
    overview: {
      title: 'Game Overview',
      keywords: ['overview', 'introduction', 'what is', 'game', 'rules', 'goal'],
      content: `**Deep Regrets** is a push-your-luck fishing game for 2-5 players.

**Goal:** Have the most points at game end (after 6 days).

**Theme:** You are a skipper fishing in dangerous, eldritch-infested waters. The deeper you go, the better the catch - but also greater risk of madness.

**Play Time:** About 30 minutes per player.

**Components:**
- Fish cards (3 depths)
- Dice (player and tackle dice)
- Regret cards
- Dink cards
- Fishbucks and Supplies tokens`,
    },
    dice: {
      title: 'Dice',
      keywords: ['die', 'dice', 'fresh', 'spent', 'roll', 'tackle'],
      content: `**Player Dice:**
- Each player starts with 3 dice
- Dice are either Fresh (available) or Spent (used)
- The Refresh phase makes Spent dice Fresh again
- Madness increases max number of Fresh dice (4-8)

**Tackle Dice:**
- Special dice that can be rented in the port
- Have unique values/distributions
- Cost Fishbucks to rent
- Provide strategic advantages
- All players get a free Tackle die on Thursday and Saturday

**Using dice:**
- Reveal fish: 1 Fresh die
- Catch fish: Dice ≥ fish's difficulty rating
- Move deeper: Die with value ≥ 3`,
    },
    sea: {
      title: 'The Sea',
      keywords: ['sea', 'ocean', 'depth', 'shoal', 'grid', 'board'],
      content: `**Structure:**
- 3×3 grid per depth
- 3 depths total (I, II, III)
- Each square = a "shoal" with fish cards

**Depth I (Shallow):**
- Easy fish (value 1-4)
- Low difficulty
- Minimal risk

**Depth II (Medium):**
- Moderate value (3-8)
- Medium difficulty
- Some risk of Regrets

**Depth III (Deep):**
- High value (5-15+)
- High difficulty
- Significant risk
- Rare, powerful fish`,
    },
    fishing: {
      title: 'Fishing',
      keywords: ['fish', 'catch', 'reveal', 'card'],
      content: `**Revealing fish:**
1. Choose a shoal
2. Pay 1 Fresh die
3. See the top fish

**Catching fish:**
1. Choose dice from your pool
2. Sum must be ≥ fish's difficulty
3. Chosen dice become Spent
4. Fish goes to your hand

**Fish card properties:**
- **Name:** The fish's identity
- **Value:** Point value
- **Difficulty:** Minimum dice sum
- **Abilities:** Special effects when caught
- **Quality:** Fair (safe) or Foul (may give Regrets)`,
    },
    mounting: {
      title: 'Mounting',
      keywords: ['mount', 'trophy', 'wall', 'multiplier', 'slot'],
      content: `**Trophy Wall:**
- 3 mounting slots per player
- Each slot has a multiplier

**Multipliers:**
- Slot 1: ×1 (normal value)
- Slot 2: ×2 (double value)
- Slot 3: ×3 (triple value)

**Mounting:**
- Only possible in the port
- Costs Supplies
- Choose fish from hand
- Place on empty slot

**Tips:**
- Save high-value fish for the ×3 slot
- Plan mounting early
- Madness modifier is added BEFORE multiplier`,
    },
    port: {
      title: 'The Port',
      keywords: ['port', 'harbor', 'shop', 'buy', 'sell', 'trade'],
      content: `**Port benefits upon arrival:**
- **Muster Your Courage:** Reroll all your dice
- **Can of Worms:** Flip the card face up
- **Discard Regret:** You can voluntarily get rid of one Regret

**Available actions:**

**Sell fish:**
- Sell fish from hand
- Value adjusted by Madness (Fair/Foul modifier)

**Buy equipment:**
- **Rods:** Improve catching ability
- **Reels:** Give special effects
- **Supplies:** Needed for mounting
- At 13+ Regrets: $1 discount on all purchases

**Mount fish:**
- Place fish on trophy wall
- Costs Supplies per fish

**Rent Tackle Dice:**
- Pay Fishbucks
- Get special dice for the day

**Safety:**
- No risk of Regrets in the port`,
    },
    regrets: {
      title: 'Regrets and Madness',
      keywords: ['regret', 'madness', 'insanity', 'mental', 'hidden'],
      content: `**Regrets:**
- Hidden cards with values 0-3
- Represent mental strain
- Subtracted from final score
- Cannot be seen until game end

**How you get Regrets:**
- Reveal Foul quality fish
- Certain card effects
- Dive carelessly

**The Madness system (6 levels):**
| Regrets | Fair | Foul | Max Dice | Port |
|---------|------|------|----------|------|
| 0       | +2   | -2   | 4        | -    |
| 1-3     | +1   | -1   | 4        | -    |
| 4-6     | +1   | ±0   | 5        | -    |
| 7-9     | ±0   | +1   | 6        | -    |
| 10-12   | -1   | +1   | 7        | -    |
| 13+     | -2   | +2   | 8        | -$1  |

**Fair/Foul:** Modifies fish value when selling and scoring.
**Port -$1:** Discount on all purchases in port at 13+ Regrets.`,
    },
    phases: {
      title: 'Game Phases',
      keywords: ['phase', 'turn', 'day', 'round'],
      content: `**Daily cycle:**

**1. Start Phase:**
- Daily effects activate
- The Plug retreats
- Check for game end conditions
- **Wednesday/Friday:** All flip Can of Worms
- **Thursday/Saturday:** All get one Tackle die

**2. Refresh Phase:**
- All Spent dice become Fresh
- Madness determines max Fresh (4-8)

**3. Declaration Phase:**
- Each player chooses location
- Sea OR Port for the day
- Cannot be changed after choice

**4. Action Phase:**
- Perform actions at chosen location
- Continue until you pass
- First to pass gets Fish Coin

**Last player rule:**
- When everyone else has passed
- Last player gets 2 turns (sea) or 4 turns (port)

**Next day:**
- When all have passed
- New day begins
- 6 days total (Mon-Sat)`,
    },
    theplug: {
      title: 'The Plug',
      keywords: ['plug', 'erosion', 'end', 'drowned', 'world'],
      content: `**What is The Plug?**
- A special card representing the sea's erosion
- When revealed, the erosion mechanism activates

**Erosion:**
- Each Start phase removes one fish from shoals
- Erosion spreads systematically
- When all shoals are empty = "Drowned World"

**Drowned World:**
- Triggers immediate game end
- Scoring happens as normal
- Can happen before day 6!

**Strategy:**
- Keep an eye on how many fish remain
- The Plug can accelerate game end
- Plan for early end`,
    },
    scoring: {
      title: 'Scoring',
      keywords: ['score', 'points', 'winner', 'end', 'calculation', 'total'],
      content: `**Point sources:**

**+ Mounted fish:**
- (Base value + Madness modifier) × slot multiplier
- Example: Fair fish value 5 at 0 Regrets = (5+2) × 3 = 21 points

**+ Fish in hand:**
- Base value + Madness modifier
- Fair fish: bonus at low Madness (+2 to -2)
- Foul fish: bonus at high Madness (-2 to +2)

**+ Fishbucks:**
- 1 point per Fishbuck

**- Regrets:**
- Revealed and summed
- Subtracted from total

**End penalty:**
- Player with highest Regret value discards one mount:
  - 2 players: lowest mounted fish
  - 3+ players: highest mounted fish

**Tiebreaker:** Lowest Regret value wins, then fewest Regret cards.`,
    },
    characters: {
      title: 'Characters',
      keywords: ['character', 'captain', 'bonus', 'ability'],
      content: `**Captain Ahab:**
- +2 Fishbucks at start
- Better starting rod

**Captain Nemo:**
- Better starting reel
- Ignores first Regret

**Marina Deepcurrent:**
- Starts at Depth II
- +1 extra Dink card

**Finn Saltwater:**
- +3 Fishbucks at start
- Can reroll 1s

**Storm Blackwater:**
- +1 max die
- +1 extra mounting slot

**Tip:** Choose character based on playstyle - aggressive, cautious, or balanced.`,
    },
    resources: {
      title: 'Resources',
      keywords: ['resource', 'fishbucks', 'supplies', 'dinks', 'token'],
      content: `**Fishbucks (💰):**
- Main currency
- Used for purchases in port
- Earned by selling fish
- Worth 1 point per Fishbuck at game end

**Supplies (📦):**
- Needed for mounting
- Bought in port
- Some fish give Supplies when caught

**Dink cards (🃏):**
- One-time cards with special effects
- Can turn the tide
- Limited quantity
- Read cards carefully!

**Life Preserver (🛟):**
- Protects against next Regret
- Rare and valuable
- Can be a lifesaver in the deep`,
    },
    upgrades: {
      title: 'Upgrades',
      keywords: ['upgrade', 'rod', 'reel', 'equipment'],
      content: `**Rods:**
- Improve catching ability
- Various levels with bonuses
- Can give extra dice value
- Permanent upgrade

**Reels:**
- Give passive bonuses
- Can affect diving
- Some give extra actions
- Choose based on strategy

**Buying in port:**
- Costs Fishbucks
- Replaces old equipment
- Consider cost vs. benefit

**Recommendation:**
- Upgrade early for long-term gain
- Rods for aggressive fishers
- Reels for cautious players`,
    },
  },
};

const translations: Record<Language, Translations> = { en, no };

// Helper function to get nested translation
const getNestedTranslation = (obj: Translations, path: string): string => {
  const keys = path.split('.');
  let result: TranslationValue = obj;

  for (const key of keys) {
    if (typeof result === 'object' && result !== null && key in result) {
      result = result[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path;
    }
  }

  if (typeof result === 'string') {
    return result;
  }

  console.warn(`Translation key is not a string: ${path}`);
  return path;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  // Persist language to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return getNestedTranslation(translations[language], key);
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};

// Export translations for components that need direct access (like HelpSystem)
export const getTranslations = (language: Language) => translations[language];
