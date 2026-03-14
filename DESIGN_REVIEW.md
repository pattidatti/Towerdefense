# Designgjennomgang: Tower Defense

**Dato:** 2026-03-14
**Designdokument:** `docs/Design`
**Kravdokument:** `todo.md`

---

## Sammendrag

Prosjektet implementerer kjernen av et tower defense-spill: landingsside, level-velger, spillmotor med tårn, fiender, prosjektiler og bølgesystem. Arkitekturen er ryddig med god separasjon mellom React UI og spillmotor.

Det er imidlertid **22 vesentlige avvik** fra designdokumentet. De fleste skyldes at mange funksjoner ikke er implementert ennå (mana, oppgraderinger, stjernerating, flere tårn/fiender). I tillegg er det gjort bevisste teknologivalg som avviker fra designet (egen canvas-motor i stedet for Phaser 3, ren CSS i stedet for Tailwind). Det ble også funnet 5 kodefeil/svakheter i spillmotoren.

---

## Samsvar med designdokumentet

Følgende krav fra `docs/Design` er korrekt implementert:

| Krav | Status | Kommentar |
|------|--------|-----------|
| React + Vite | ✅ | React 19, Vite 6 |
| HashRouter (/ → /levels → /game/:levelId) | ✅ | `App.tsx` |
| GitHub Pages hosting | ✅ | Deploy-script konfigurert |
| Landingsside med "Start spill"-knapp | ✅ | `LandingPage.tsx` |
| Level-velger med 3 kort | ✅ | Mangler thumbnail/stjerner |
| Gull som ressurs | ✅ | Start: 150 gull |
| Bueskytter-tårn | ✅ | 50g, 120px, 15 skade |
| Magitårn | ✅ | 80g, 90px, 35 skade (uten mana) |
| Goblin (lav HP, rask) | ✅ | 60 HP, 80 px/s |
| Ork (høy HP, sakte) | ✅ | 180 HP, 48 px/s |
| Helsebar over fiender | ✅ | Fargekodede (grønn/gul/rød) |
| Partikkeleffekter ved død | ✅ | `Game.ts` |
| Kart laget i Tiled | ✅ | `level1.tmx` |
| Seier/Game Over-skjerm | ✅ | `EndScreen.tsx` |
| UI på norsk | ✅ | Alle strenger verifisert |
| Mappestruktur (components/engine/data) | ✅ | Tilpasset fra design |

---

## Avvik fra designdokumentet

### Teknologivalg

| # | Design | Implementasjon | Vurdering |
|---|--------|----------------|-----------|
| 1 | Phaser 3 som spillmotor | Egen canvas-motor uten rammeverk | Bevisst valg. Fungerer godt. |
| 2 | Tailwind CSS for styling | Ren CSS-filer | Bevisst valg. Fungerer. |
| 3 | Tiled-eksport som JSON (.json) | Bruker TMX (XML) format | Fungerer, men avviker fra spec. |

### Manglende funksjoner

| # | Designkrav | Status | Prioritet |
|---|-----------|--------|-----------|
| 4 | 4 tårntyper (Bueskytter, Kanon, Is-tårn, Magitårn) | Kun 2 (Arrow, Magic) — Kanon og Is-tårn mangler | Høy |
| 5 | 4 fiendetyper (Goblin, Ork, Drage, Skjelett) | Kun 2 (Goblin, Orc) — Drage og Skjelett mangler | Høy |
| 6 | Mana som andre ressurs | Ikke implementert — kun gull | Høy |
| 7 | Tårnoppgraderinger (2–3 nivåer) | Ikke implementert | Høy |
| 8 | Stjernerating (1–3 stjerner basert på liv) | Ikke implementert | Middels |
| 9 | localStorage-lagring av progresjon | Ikke implementert | Høy |
| 10 | Level-opplåsing ved fullføring | Hardkodet `unlocked: false` — spillere kan ikke komme forbi Level 1 | Kritisk |
| 11 | 3 levels med kart | Kun 1 kart (level1.tmx) | Høy |
| 12 | 5 waves per level | Level 1 har kun 3 waves | Middels |
| 13 | Manuell wave-start ("Send wave"-knapp) + speed-bonus | Waves starter automatisk | Middels |
| 14 | Flyvende fiender (Drage ignorerer bakkesti) | Ikke implementert | Middels |
| 15 | Splash/AoE-skade (Kanon) | Ikke implementert | Middels |
| 16 | Slow-effekt (Is-tårn) | Ikke implementert | Middels |
| 17 | Touch-støtte for mobil | Ikke implementert | Lav |
| 18 | Pause- og restart-knapp i overlay | Kun retry på EndScreen | Middels |
| 19 | Skjerm blinker rødt ved livtap | Ikke implementert | Lav |
| 20 | Tårn roterer mot fiender | Statiske tårnsprites | Lav |
| 21 | Tiled-lag (ground, path, buildable, objektlag) | Path definert i kode, ikke i kartfil | Middels |
| 22 | Thumbnail og stjernerating på level-kort | Kun navn og låst/ulåst | Lav |

---

## Kodefeil og svakheter

| # | Problem | Fil | Alvorlighet |
|---|---------|-----|-------------|
| 1 | Tower cooldown bruker `=== 0` (float equality). Fungerer pga `Math.max(0,...)` men er skjørt ved refaktorering. Bør bruke `<= 0`. | `src/engine/Tower.ts:39` | Moderat |
| 2 | MapLoader har ingen feilhåndtering for nettverksfeil eller ugyldig XML. Non-null assertions (`!`) overalt. | `src/engine/MapLoader.ts:36-64` | Moderat |
| 3 | `Promise.all` i Sprites.ts krasjer hele lastingen om én bildefil feiler. | `src/engine/Sprites.ts:21-26` | Moderat |
| 4 | Tomme wave-grupper gir umiddelbar seier (queue tom → spawning ferdig → ingen fiender → vinn). | `src/engine/Wave.ts:61` | Lav |
| 5 | Stille redirect ved ugyldig level-ID uten tilbakemelding til brukeren. | `src/components/GameView.tsx:44` | Lav |

---

## Udokumenterte funksjoner

Disse funksjonene finnes i koden men er ikke nevnt i designdokumentet:

- Dødspartikkeleffekter med animasjon
- Hastighetstoggle (1x/2x)
- Tower range-sirkel ved hover
- Grønn/rød farge for gyldig/ugyldig plassering
- ESC for å avbryte tårnvalg
- Gullbelønning per fiende (10g Goblin, 25g Orc)
- Helsebar-fargekoding (grønn > 50%, gul > 25%, rød)
- TiledBackground-komponent for menysider

---

## Anbefalinger (prioritert)

1. **Implementer level-opplåsing** med localStorage — spillere er blokkert på Level 1
2. **Lag kart for Level 2 og 3** i Tiled
3. **Legg til Kanon og Is-tårn** med splash-skade og slow-effekt
4. **Legg til Skjelett og Drage** som fiendetyper
5. **Implementer mana-system** som andre ressurs
6. **Implementer tårnoppgraderinger** (nivå 1–3)
7. **Legg til stjernerating** ved level-fullføring
8. **Øk til 5 waves per level** som designet
9. **Legg til manuell wave-start** med "Send wave"-knapp
10. **Legg til pause-knapp** i HUD
11. **Fiks `cooldownTimer === 0`** til `<= 0` i Tower.ts
12. **Legg til feilhåndtering** i MapLoader.ts og Sprites.ts
13. **Oppdater designdokumentet** med teknologivalg (egen motor vs Phaser, CSS vs Tailwind)
