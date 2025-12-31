# Deep Regrets Digital - Endringslogg

Dette dokumentet logger alle endringer gjort av AI-agenter på prosjektet.

---

## 2025-12-31 - Satt opp dual hosting (Lovable + GitHub Pages)

**Branch**: claude/continue-game-dev-7f9jJ

### Endringer
- Konfigurert prosjektet for dual hosting via både Lovable og GitHub Pages
- Lagt til GitHub Actions workflow for automatisk deployment til GitHub Pages
- Oppdatert Vite-konfigurasjon med dynamisk base path basert på deployment-plattform
- Lagt til `.nojekyll` fil for å sikre korrekt GitHub Pages-behandling
- Oppdatert README.md med detaljert informasjon om begge deployment-alternativene

### Filer endret
- `vite.config.ts` - Lagt til base path konfigurasjon for GitHub Pages
- `.github/workflows/deploy.yml` - Ny GitHub Actions workflow for automatisk deployment
- `public/.nojekyll` - Ny fil for å unngå Jekyll-prosessering på GitHub Pages
- `README.md` - Oppdatert med dual hosting-dokumentasjon

### Tekniske detaljer
- Build bruker `GITHUB_PAGES` environment variable for å sette riktig base path
- GitHub Pages URL: `https://tombonator3000.github.io/deep-regrets-digital/`
- Lovable deployment fortsetter å fungere som normalt med base path "/"
- Automatisk deployment ved push til `main` branch

### Fordeler
- ✅ Uavhengighet fra Lovable
- ✅ Backup hvis Lovable har nedetid
- ✅ Redundans og pålitelighet
- ✅ Valgfrihet i deployment

---

## 2025-11-30 - Lagt til agent-dokumentasjon

**Branch**: claude/add-agents-documentation-01QqvFYiTSSDW3yp81i1bY2z

### Endringer
- Opprettet `agents.md` med retningslinjer for AI-agenter
- Opprettet `log.md` for å spore endringer ved PRs

### Filer lagt til
- `agents.md` - Retningslinjer for AI-agenter
- `log.md` - Endringslogg

### Formål
Etablere klare retningslinjer for AI-agenter som jobber på prosjektet, inkludert:
- Krav om å følge regelboken (`deep-regrets-rulebook.pdf`)
- Påkrevd logging av alle PR-endringer
- Kodestandard og beste praksis

---

## Tidligere endringer (før logging ble etablert)

### PR #95 - Fix game bugs and rulebook compliance issues
- Fikset spillfeil og samsvar med regelboken

### PR #94 - Review rulebook gaps
- Gjennomgang av manglende regelbok-implementasjoner

---

## Mal for nye oppføringer

```markdown
## [DATO] - Kort beskrivelse

**Branch**: branch-navn
**PR**: #nummer

### Endringer
- Beskrivelse av endring 1
- Beskrivelse av endring 2

### Filer endret
- path/to/file1.ts
- path/to/file2.tsx

### Relatert til regelboken
- Side X: Beskrivelse av implementert regel
```
