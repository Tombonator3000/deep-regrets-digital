# AI Agent Guidelines for Deep Regrets Digital

Dette dokumentet inneholder retningslinjer for AI-agenter som jobber på Deep Regrets Digital-prosjektet.

## Om prosjektet

Deep Regrets Digital er en digital adaptasjon av et eldritch horror-tema, push-your-luck fiskebrettspill. Spillet er bygget med:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn-ui
- **State**: React Query + React Hook Form

---

## Regler og spillmekanikk

### Alltid følg regelboken

**VIKTIG**: All spillogikk må følge reglene definert i `deep-regrets-rulebook.pdf` (ligger i prosjektets rotmappe).

Før du gjør endringer i spillmekanikk:
1. Les relevant seksjon i regelboken
2. Verifiser at endringen er i tråd med offisielle regler
3. Referer til spesifikke sidetall når du dokumenterer endringer

Nøkkelseksjoner i regelboken:
- **s. 9**: Passing-regler og belønninger
- **s. 10**: Sea action-regler
- **s. 17**: Port action-regler
- **s. 18-19**: Madness tier-verdier

### Spillogikk-filer

Hovedfilene for spillogikk:
- `src/utils/gameEngine.ts` - Kjerne spillmotor
- `src/data/` - Spilldata (fish, characters, dice, etc.)
- `src/types/game.ts` - TypeScript type-definisjoner

---

## Logging og dokumentasjon

### PR-logg (PÅKREVD)

Når du pusher en PR, **SKAL** du alltid oppdatere `log.md` i rotmappen med:

```markdown
## [DATO] - Kort beskrivelse

**Branch**: branch-navn
**PR**: #nummer (hvis tilgjengelig)

### Endringer
- Punkt 1
- Punkt 2

### Filer endret
- path/to/file1.ts
- path/to/file2.tsx

### Relatert til regelboken
- Side X: Beskrivelse av regel som ble implementert/fikset
```

### Commit-meldinger

Bruk klare, beskrivende commit-meldinger:
- `Fix: [beskrivelse]` - Bugfixer
- `Feature: [beskrivelse]` - Nye funksjoner
- `Refactor: [beskrivelse]` - Refaktorering
- `Docs: [beskrivelse]` - Dokumentasjonsendringer
- `Test: [beskrivelse]` - Testendringer

---

## Kodestandard

### TypeScript

- Bruk streng typing - unngå `any`
- Definer interfaces/types i `src/types/`
- Bruk eksisterende typer fra `game.ts`

### React-komponenter

- Bruk funksjonelle komponenter med hooks
- Plasser spillkomponenter i `src/components/game/`
- Bruk shadcn-ui komponenter fra `src/components/ui/`

### Testing

- Kjør tester før du pusher: `npm run test`
- Legg til tester for ny funksjonalitet i `src/utils/__tests__/`
- Verifiser at eksisterende tester passerer

---

## Viktige filer og mapper

```
├── deep-regrets-rulebook.pdf   # KILDEN TIL SANNHET for spillregler
├── designDoc.md                # Design-dokumentasjon
├── log.md                      # Endringslogg (OPPDATER VED PR)
├── src/
│   ├── utils/gameEngine.ts     # Spillmotor
│   ├── data/                   # Spilldata
│   ├── components/game/        # Spillkomponenter
│   └── types/game.ts           # Type-definisjoner
```

---

## Før du starter

1. **Les regelboken** - Forstå spillmekanikkene
2. **Sjekk designDoc.md** - Se eksisterende design-beslutninger
3. **Kjør prosjektet lokalt** - `npm install && npm run dev`
4. **Forstå eksisterende kode** - Les relevante filer før endringer

---

## Vanlige fallgruver

- **Ikke anta regler** - Verifiser alltid mot regelboken
- **Ikke hopp over logging** - Oppdater alltid `log.md`
- **Ikke bryt eksisterende tester** - Kjør `npm run test`
- **Ikke ignorer TypeScript-feil** - Fiks alle type-problemer

---

## Kontakt og ressurser

- **Regelboken**: `deep-regrets-rulebook.pdf`
- **Design-doc**: `designDoc.md`
- **Lovable prosjekt**: https://lovable.dev/projects/48af93e3-33a6-418b-b8ce-172095dc4d1a
