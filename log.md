# Deep Regrets Digital - Endringslogg

Dette dokumentet logger alle endringer gjort av AI-agenter på prosjektet.

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
