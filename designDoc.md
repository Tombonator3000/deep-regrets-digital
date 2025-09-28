# Deep Regrets - Digital Clone Design Document

## Overview

**Deep Regrets** er et "push-your-luck" eldritch horror fishing spill der spillere balanserer mellom å fange verdifulle fisk i dypere, farligere farvann og å unngå for mange "Regrets" som kan ødelegge sluttscoren.

### Digitale tilpasninger
- Automatisert dagssyklus og regelshåndhevelse
- Visuell representasjon av Sea (3x3 shoals) og Port
- Real-time dice rolling og card management
- Responsive design for desktop og tablet

## Components

### Boards
- **Sea Board**: 3 dybder × 3 stimer per dybde (Depth I-III)
- **Port Board**: Shops, dagsspor, Life Preserver, Fish Coin
- **Player Boards**: Dice tray, mounted fish slots, regrets tracker
- **Madness Track**: Påvirker Max Dice capacity

### Card Types
- **Fish**: 13 kort × 3 stimer × 3 dybder = 117 unike fisk
- **Regrets**: 0-3 skjult verdi, påvirker Madness og sluttstraff
- **Dinks**: Små engangseffekter og shop-rabatter
- **Upgrades**: Rods, Reels, Supplies

### Dice System
- **Player Dice**: 3 per spiller, standard verdier
- **Tackle Dice**: Fargekodede med faste pip-distribusjoner
- **Omen Die**: Spesiell rød terning (ingen poengverdi)

## Rules Reference (Digital Source of Truth)

### Setup
1. **Table & Interface Preparation**
   - Plasser Sea boardet med tre dybder (I-III) i et 3×3-grid og gjør tre shoal-decks pr. dybde tilgjengelige. Digitalt genereres hvert deck fra den fullstendige fiskdatabasen og stokkes separat.
   - Plasser Port boardet med Shop, Mounting Track, Tackle Pool og Day Track. I appen initialiseres butikkens varer ved å trekke tre tilfeldige Upgrade-kort og to Dink-kort inn i tilbudet.
   - Legg frem Madness Track, Regrets-deck, Dinks, Upgrades og Tackle Dice i respektive digitale paneler.
2. **Player Equipment**
   - Hver spiller velger en karakter og mottar standard startutstyr: 3 Player Dice (fresh), 1 Basic Rod, 1 Basic Reel, 2 Supply tokens og 3 Fishbucks. Eventuelle karakterspesifikke bonuser tildeles automatisk (f.eks. ekstra tackle die eller rabatt i butikken).
   - Spillerbrettet viser en Dice Tray (fresh/spent), plass til monterte fisk (tre slots) og en Regrets-tracker startet på 0.
3. **Deck Seeding & Token Placement**
   - **Fish Decks**: For hver shoal stokkes 13 fisk og legges med forsiden ned. Den øverste fisken avsløres ikke under setup.
   - **Regrets Deck**: Stokkes og plasseres ved siden av Madness Track. Tre kort legges i en ansiktsnedkast “Sinking Regrets” queue for digitale hendelser (for bruk av The Plug).
   - **Dink & Upgrade Decks**: Stokkes og plasseres i Port-panelet. Fyll butikklukene (2 Dinks, 3 Upgrades) og Tackle supply (4 terninger) fra toppen av decket/poolen.
   - Plasser Life Preserver marker på Port boardet og Fish Coin på verdien 0.
4. **Starting Day & Phase**
   - Dagspor settes til **Mandag, Start Phase**. Alle globale hendelser (f.eks. værkort) trekkes før første Start Phase dersom scenarioet krever det.
   - The Plug-markør plasseres utenfor Sea boardet. Ingen erosjon er aktiv før The Plug avsløres.

### Daily Cycle (Mandag–Lørdag)
1. **Start Phase**
   - Avanser Day-marker én rute. Hvis markøren går utover Lørdag, start final scoring.
   - Trigger alle «Start of Day»-effekter i denne rekkefølgen:
     1. Fjern alle ikke-fangede, avslørte fisk fra Sea boardet og erstatte dem med nye toppkort fra respektive shoal-decks.
     2. Resolving global weather eller scenarioeffekter som har varighet «neste dag».
     3. The Plug erosjon: hvis The Plug er aktiv (se edge cases), discarder den øverste fisken i neste shoal i erosjonsrekkefølgen. Hvis en shoal tømmes, marker som erodert og hopp til neste. Hvis alle ni shoals er tomme, utløses «Drowned World» og spillet avsluttes umiddelbart.
     4. Madness upkeep: hver spiller teller sine Regrets. For hver terskel (3/5/7) økes Madness-nivået midlertidig og maks antall Fresh Dice justeres. Spillere som passerer en terskel mister tilsvarende Fresh Dice med høyeste verdi.
     5. Start-of-day abilities på monterte fisk, gear eller karakterer trigger simultant; spilleren velger rekkefølgen for egne effekter.
2. **Refresh Phase**
   - Alle spillere flytter spent dice tilbake til Fresh opptil sin nåværende Madness-begrensning. Overflødige dice blir i Spent.
   - Spillere kan re-equip gear (rod, reel, supplies) uten kostnad. Tackle dice returnerer til supply med mindre annet er spesifisert.
   - Draw ett Dink-kort hvis en spiller har en tom Dink-slot og betaler 1 Supply token.
3. **Declaration Phase**
   - Startende spiller (den som har Fish Coin) velger Sea eller Port for runden. Turen går med klokken; hver spiller deklarerer sitt valg etter tur. Spillerne kan være på forskjellige brett.
   - Spillere i Port flytter sine pawns til Port boardet; Sea-spillere forblir på nåværende dybde eller velger en ny startshoal i Depth I.
4. **Action Phase**
   - Utføres i round-robin. På sin tur velger en spiller én handling (Sea eller Port basert på deres lokasjon) og betaler kostnaden. Etter handling kan spilleren enten fortsette (hvis de har handlinger/dice igjen) eller **Pass**. Når en spiller passer, mottar de umiddelbart Pass-belønningen (se nedenfor) og tar ikke flere turer denne dagen.
   - Dagen avsluttes når alle spillere har passet.

#### Passing Rewards
- Første spiller som passer mottar 2 Fishbucks og flytter Fish Coin til sin tavle (blir neste startspiller).
- Andre spiller som passer mottar 1 Supply token.
- Alle senere spillere mottar enten 1 Fishbuck eller kan helbrede 1 Madness (senke terskelen for neste dag) dersom de har færre enn tre Regrets.
- Hvis en spiller tvinges til å passe fordi de ikke kan utføre lovlige handlinger, mottar de fortsatt laveste tilgjengelige Pass-belønning.

#### Start-of-Day Edge Cases
- **The Plug Erosion**: Aktiveres når et The Plug-fiskekort fanges eller avsløres. Når aktiv, legges The Plug-markøren på første shoal i rekkefølgen (Depth I, venstre til høyre; deretter Depth II, etc.). Hver Start Phase discarder markøren det øverste kortet og flyttes til neste shoal. Hvis et shoal allerede er tomt ved startfasen, hop over det uten å trigge ekstra effekter.
- **Regret Handling**: Når en spiller mottar et Regret i Start Phase (f.eks. via event), legger de det med forsiden ned i sin Regrets-stack og justerer Madness umiddelbart. Hvis en spiller har flest Regrets i verdi (avsløres kun ved triggered effekter) må de kassere sin høyest monterte fisk ved Start Phase. Tie-breakers: spilleren med lavest Fishbucks blir påvirket; ved fortsatt tie velger spillere simultant en fisk å kassere.

### Sea Actions (Detaljert Prosedyre)
Sea handlinger benytter Player Dice og eventuelle Tackle Dice. En spiller kan kombinere flere terninger så lenge summen oppfyller kostnaden og minst én die er fersk.

1. **Move / Descend**
   - Kostnad: 1 Fresh die med verdi ≥ 2 for å flytte horisontalt, ≥ 3 for å gå ned én dybde. Ingen kostnad for å stige opp.
   - Prosedyre: Velg destinasjonsshoal som ikke er sperret. Betal kostnaden, flytt pawn. Hvis shoalen har uoppgjorte farer (f.eks. event tokens), resolv disse umiddelbart.
   - Konsekvens: Etter bevegelse kan spilleren utføre en gratis Reveal hvis shoalen er uavslørt.
2. **Reveal Fish**
   - Kostnad: 1 Fresh die (vilkårlig verdi). Tackle dice kan ikke brukes.
   - Prosedyre: Vend toppkortet i shoal-decket. Alle spillere ser kortet. Hvis det er et The Plug, legg markøren ved siden av shoalen og aktiver erosjonsregler fra neste Start Phase.
   - Konsekvens: Revealed fish forblir åpen til den fanges eller dagen slutter.
3. **Catch Fish**
   - Kostnad: Betal fiskens Difficulty med kombinasjon av Fresh/Tackle dice. Enhver die som brukes blir Spent. Supplies eller gear kan redusere kostnaden.
   - Prosedyre: Deklarer hvilke terninger som brukes, påfør gear-effekter, sammenlign sum med Difficulty. Hvis summen ≥ Difficulty, fang fisken og flytt den til din Båt (unmounted). Hvis summen < Difficulty, mislykkes du: fisken forblir, alle brukte terninger blir Spent, og du tar 1 Regret hvis du mislykkes med en Revealed Legendary.
   - Konsekvenser: På vellykket fangst trigger fiskens on-catch ability. Legendary fish kan øke Madness eller gi Fishbucks umiddelbart.
4. **Net Sweep (Special)**
   - Kostnad: 2 Fresh dice, minst én Tackle die.
   - Prosedyre: Revealer opptil to kort i tilstøtende shoals og velg én å forsøke å fange med resterende terninger. The Plug utløser umiddelbart før fangstforsøket.
   - Konsekvens: Uansett utfall genererer handlingen 1 Regret hvis begge kortene var uvanlige (purple tag). Brukt til å håndtere mass fish men øker risikoen.

### Port Actions (Detaljert Prosedyre)
Port-handlinger bruker Fishbucks, Supplies og enkelte terninger.

1. **Sell Fish**
   - Kostnad: Ingen handlingsterninger. Velg valgfritt antall u-monterte fisk.
   - Prosedyre: Flytt valgte fisk til fiskehandleren; motta Fishbucks lik deres verdi justert av aktive Shop multipliers. Legendary fish må først identifiseres (betale 1 Supply) før salg.
   - Konsekvens: Øk Fish Coin-markøren tilsvarende totalen for å spore startspiller. Salg kan trigge Port events (hver 10 Fishbucks).
2. **Mount Fish**
   - Kostnad: 1 Fresh die (valgfri verdi) for å klargjøre plassen + 1 Supply token per fisk.
   - Prosedyre: Velg en fisk fra båten, betal kostnaden og plasser den i et tilgjengelig Trophy slot. Juster permanente multiplikatorer (f.eks. +2 til alle Depth II fangster).
   - Konsekvens: Monterte fisk kan ikke selges men gir sluttspillpoeng og aktiverer passive effekter. Hvis du allerede har tre monterte fisk, må en erstattes.
3. **Shop**
   - Kostnad: Varierer. Upgrades koster Fishbucks, Dinks kan koste Fishbucks eller Supplies.
   - Prosedyre: Velg ett tilbud i butikken. Betal kostnaden. Oppgraderinger blir utstyrt umiddelbart; Dinks går i hånden og kan brukes i en senere handling. Etter kjøp fylles slotten med et nytt kort fra tilsvarende deck.
   - Konsekvens: Visse upgrades reduserer Madness eller øker dice cap. Hvis decket tar slutt, låses slotten.
4. **Tackle Charter**
   - Kostnad: 2 Fishbucks per Tackle die, maks to per dag.
   - Prosedyre: Betal og ta valgt Tackle die til Fresh poolen din. Tackle dice returneres til supply ved slutten av dagen hvis de er Spent.
   - Konsekvens: Ved dagens slutt, for hver Tackle die du fortsatt har Fresh, betal 1 Fishbuck eller mist die tilbake til supply umiddelbart.
5. **Harbor Services (Special)**
   - Kostnad: 1 Fresh die ≥4.
   - Prosedyre: Velg én: helbred 1 Regret (kast ett kort og senk Madness tilsvarende) eller reparer The Plug (se under).
   - Konsekvens: Hvis du reparerer The Plug, flytt markøren av Sea boardet og stopp erosjonen. Alle Sinking Regrets returnerer til bunnen av Regrets-decket.

### Regrets & Madness Handling
- Regrets mottas ved bestemte hendelser (tapte fangster, net sweep, Port events). Alle Regrets forblir skjult til spillets slutt, men antallet påvirker Madness.
- Når en spiller når Madness-nivå 4 mister de permanent én Fresh die slot. På nivå 6 må de kassere en montert fisk. Hvis en spiller ville motta et nytt Regret på nivå 6+, må de i stedet velge mellom å kassere to monterte fisk eller gå umiddelbart til final scoring for alle spillere.

### Ending the Game
- Spillet avsluttes etter Lørdagens Action Phase, når The Plug har erodert alle shoals, eller når en spiller forårsaker en Madness-kollaps.
- Final scoring: Summer Fish value (monterte + u-solgte), trekk Regret verdi (avsløres nå), legg til Fishbucks (1:1). Spilleren med høyest total vinner.

## Data Schema

### Fish Card
```json
{
  "id": "FISH-D3-KRAKEN-001",
  "name": "Ancient Kraken",
  "depth": 3,
  "value": 15,
  "difficulty": 12,
  "abilities": ["onCatch", "endGame"],
  "tags": ["beast", "legendary"],
  "description": "The terror of the deep..."
}
```

### Player State
```json
{
  "id": "player1",
  "name": "Captain Ahab",
  "location": "sea",
  "currentDepth": 1,
  "freshDice": [3, 2, 4],
  "spentDice": [1],
  "fishbucks": 8,
  "mountedFish": [],
  "regrets": [],
  "madnessLevel": 0,
  "lifeboatFlipped": false
}
```

## UI Layout

### Main Game Screen
```
[Player Info Bar - Top]
[Sea Board - Left 60%] [Port Board - Right 40%]
[Dice Tray & Actions - Bottom]
```

### Character Selection
- 5 unique anglers med forskjellige starting bonuses
- Thematic portraits matching eldritch horror aesthetic
- Starting gear variations

### Special Systems

#### The Plug Erosion
- Når The Plug avsløres: erosjon starter
- Cursor beveger seg left→right, top→bottom
- Discard top fish fra hver shoal i rekkefølge
- Spillet slutter hvis alle shoals tømmes

#### Regrets System
- **Count**: Synlig antall kort (påvirker Madness)
- **Value**: Skjult sum 0-3 (påvirker sluttstraff)
- Høyest Regret Value må kassere høyeste mounted trophy

#### Madness Track
- Bestemmer Max Dice capacity
- Øker med antall Regret cards
- Påvirker hvor mange dice du kan holde Fresh

## Technical Implementation

### State Management
- Redux/Zustand for game state
- Immutable updates for all game actions
- Undo/redo capability for accidental moves

### Animations
- Smooth card reveals and movements
- Dice rolling physics
- Water/tentacle background animations
- Dramatic effects for The Plug activation

### Responsive Design
- Desktop-first, scales down to tablets
- Card sizes adjust to screen space
- Touch-friendly interaction zones
- Portrait mode support for mobile

## Extensibility

### Future Features
- Online multiplayer via WebRTC
- Tournament mode med leaderboards
- Custom card creator
- Solo campaign med progressive difficulty
- Achievement system
- Replay system for amazing games

### Modding Support
- JSON-based card definitions
- Custom artwork support
- Rule variations toggle
- Community sharing platform

## Art Direction

### Color Palette
- **Deep Ocean**: Navy blues, dark teals
- **Corruption**: Sickly greens, tentacle purple
- **Surface**: Weathered whites, brass metals
- **Regrets**: Blood reds, shadow blacks

### Typography
- Headers: Bold, weathered serif (maritime feel)
- Body: Clean sans-serif for readability
- Flavour text: Italic serif for atmosphere

### Visual Effects
- Underwater bubble particles
- Tentacle shadows moving across cards
- Lighthouse beam sweeps
- Weather effects (storms in deeper waters)

---

*"The sea gives up her secrets reluctantly, and those who pry too deep may find more than they bargained for..."*