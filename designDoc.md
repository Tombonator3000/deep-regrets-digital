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

## Gameplay Flow

### Daily Cycle (Monday-Saturday)
1. **Start Phase**: Dagseffekter, fjern revealed fish
2. **Refresh Phase**: Dice refresh, equip gear
3. **Declaration Phase**: Velg Sea eller Port
4. **Action Phase**: Round-robin handlinger til alle passer

### Sea Actions
- **Move/Descend**: Bruk dice for å gå dypere
- **Reveal Fish**: Vend toppkort i shoal
- **Catch Fish**: Betal difficulty med dice values
- **Special**: The Plug triggerer erosjon av shoals

### Port Actions
- **Sell Fish**: Konverter til Fishbucks
- **Mount Fish**: Legg i trophy slots (permanente multipliers)
- **Shop**: Kjøp upgrades med Fishbucks
- **Tackle Dice**: Kjøp temporære dice

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