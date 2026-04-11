[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Português](README.pt.md) | [Français](README.fr.md) | Deutsch | [Tiếng Việt](README.vi.md) | [Русский](README.ru.md)

# oh-my-intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Entstanden aus [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) und [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex).
> Das Beste aus beiden Welten — vereint.

**Claude denkt. Codex handelt. OMI routet.**

Think/Do Multi-Modell-Orchestrierung für Claude Code. Leitet jede Aufgabe automatisch an den besten Anbieter weiter.

[Schnellstart](#schnellstart) • [Think/Do-Paradigma](#das-thinkdo-paradigma) • [Befehle](#befehle) • [Agents](#agents-35) • [Architektur](#architektur)

---

## Warum OMI?

Claude Code und Codex CLI haben jeweils klare Stärken. Benchmarks bestätigen das:

| Fähigkeit | Claude | Codex | Gewinner |
|-----------|--------|-------|--------|
| Planung und Architektur | Plan Mode, interaktive Checkpoints | Kein Äquivalent | Claude |
| Code-Review und Sicherheit | Deutlich höhere Fehlererkennung | Standard | Claude |
| Tests schreiben | 95% Abdeckung, 91% Mutation Kill | Standard | Claude |
| Geschwindigkeit | ~200 tok/s | ~1.000 tok/s | Codex (5x) |
| Kosteneffizienz | Referenzwert | 3-4x günstiger pro Aufgabe | Codex |
| DevOps und CLI-Aufgaben | 74,7% Terminal-Bench | 77,3% Terminal-Bench | Codex |

**OMI kombiniert beide.** Claude übernimmt, was es am besten kann (Denken). Codex übernimmt, was es am besten kann (Ausführen). Sie beschreiben einfach Ihre Aufgabe — OMI erledigt den Rest.

---

## Schnellstart

### Voraussetzungen

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installiert (**erforderlich**)
- [Codex CLI](https://github.com/openai/codex) installiert (**erforderlich** — `npm i -g @openai/codex`)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) Plugin installiert (**erforderlich**)
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) Plugin installiert (**erforderlich**)

### Installation

Wählen Sie eine der beiden folgenden Methoden.

#### Option A: npm (empfohlen)

```bash
npm i -g oh-my-intelligence
```

Dann in Claude Code:

```
/setup
```

Erkennt OMC/OMX, initialisiert den `.omi/`-State und konfiguriert Hooks.

#### Option B: Claude Code Marketplace

In Claude Code:

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

Nach dem Neuladen die Einrichtung starten:

```
/setup
```

### Etwas bauen

```
autopilot: build a REST API with authentication
```

OMI routet automatisch: Claude plant die Architektur → Codex implementiert den Code → Claude überprüft das Ergebnis.

### Überprüfung

In Claude Code:

```
/route
```

Zeigt den aktuellen Routing-Status, erkannte Anbieter und aktive Bahnen an.

### Aktualisierung

**npm:**
```bash
npm i -g oh-my-intelligence@latest
```

**Marketplace:**
```
/plugin marketplace update oh-my-intelligence
/reload-plugins
```

---

## Das Think/Do-Paradigma

Jede Aufgabe durchläuft eine von zwei Bahnen:

```
                    ┌──────────────────────────┐
                    │      Your Request        │
                    └────────────┬─────────────┘
                                 │
                          ┌──────▼───────┐
                          │ Intent Router │
                          │ (auto-route)  │
                          └──┬───────┬───┘
                             │       │
                    ┌────────▼──┐  ┌─▼──────────┐
                    │  THINK    │  │    DO       │
                    │  Lane     │  │   Lane      │
                    │ (Claude)  │  │  (Codex)    │
                    └───────────┘  └────────────┘
```

### Think Lane (Claude bevorzugt)
Für Aufgaben, die **Überlegung, Urteilsvermögen und Analyse** erfordern:
- Planung und Architekturentwurf
- Code-Review und Sicherheitsaudit
- Debugging und Ursachenanalyse
- Teststrategie und -entwurf
- ML-Experimentdesign
- Anforderungsanalyse

### Do Lane (Codex bevorzugt)
Für Aufgaben, die **Geschwindigkeit, Ausführung und Volumen** erfordern:
- Code-Implementierung und Refactoring
- Tests schreiben und Builds reparieren
- Git-Operationen und Releases
- Dokumentation schreiben
- ML-Pipeline-Ausführung
- Schnelle Korrekturen

### Überschreiben

```bash
/think "implement the auth middleware"   # Claude erzwingen (auch für Implementierung)
/do "review the architecture"            # Codex erzwingen (auch für Review)
/route                                    # Aktuellen Routing-Status anzeigen
```

### Hybride Workflows

Zusammengesetzte Workflows wechseln automatisch pro Phase:

```
/autopilot "build a REST API"

  Phase 1: Planning         → Think (Claude plant)
  Phase 2: Implementation   → Do (Codex programmiert)
  Phase 3: Verification     → Think (Claude überprüft)
  Phase 4: Fix Loop         → Do (Codex korrigiert)
  Phase 5: Final Review     → Think (Claude genehmigt)
```

---

## Befehle

| Befehl | Beschreibung | Bahn |
|---------|-------------|------|
| `/think <task>` | Think Lane erzwingen (Claude) | Think |
| `/do <task>` | Do Lane erzwingen (Codex oder Claude-Fallback) | Do |
| `/route` | Routing-Status und Anbieter anzeigen | — |
| `/autopilot` | Vollständige Pipeline mit Think/Do-Wechsel | Hybrid |
| `/ralph` | Persistenzschleife mit Think/Do pro Iteration | Hybrid |
| `/ultrawork` | Maximale parallele Do-Ausführung | Do |
| `/team N:role` | Gemischte Claude+Codex-Worker | Hybrid |
| `/ultraqa` | Test→Fix-Zyklus mit Think/Do | Hybrid |
| `/deep-interview` | Sokratische Anforderungserhebung | Think |
| `/ralplan` | Konsensplanung (Planner/Architect/Critic) | Think |

Alle bestehenden OMC-Skills (`/oh-my-claudecode:*`) funktionieren weiterhin unverändert.

### CLI (nur bei npm-Installation)

Wenn Sie über npm installiert haben (`npm i -g oh-my-intelligence`), sind auch diese Terminal-Befehle verfügbar:

```bash
omi setup                 # OMC/OMX erkennen, .omi/ initialisieren
omi setup --install-deps  # OMC + OMX global installieren, dann setup
omi doctor    # Abhängigkeiten und Status prüfen
omi route     # Anbieter und Routing-Status anzeigen
omi version   # Version anzeigen
```

> **Hinweis:** Bei Marketplace-Installationen verwenden Sie `/setup` und `/route` in Claude Code.

---

## Agents (35)

### Think Lane — 16 Agents (Claude bevorzugt)

| Agent | Modell | Rolle |
|-------|-------|------|
| analyst | opus | Anforderungsanalyse, Einschränkungen aufdecken |
| planner | opus | Aufgabensequenzierung, Ausführungspläne |
| architect | opus | Systementwurf, Schnittstellen, Abwägungen |
| critic | opus | Lückenanalyse von Plänen/Entwürfen |
| code-reviewer | opus | Umfassende Code-Review |
| security-reviewer | sonnet | Sicherheitslücken, Vertrauensgrenzen |
| test-engineer | sonnet | Teststrategie, Abdeckung, TDD |
| designer | sonnet | UI/UX-Architektur |
| debugger | sonnet | Ursachenanalyse |
| tracer | sonnet | Evidenzbasierte kausale Rückverfolgung |
| qa-tester | sonnet | Interaktive CLI/Service-Validierung |
| verifier | sonnet | Abschlussprüfung |
| product-manager | opus | Strategie, Prioritäten, Roadmap |
| quality-strategist | opus | Umfassende QA-Strategie |
| **ml-researcher** | **opus** | **ML/DL: Paper, Experimente, Pipelines, Modelle** |
| scientist | sonnet | Allgemeine Datenanalyse, Statistik |

### Do Lane — 12 Agents (Codex bevorzugt)

| Agent | Modell | Rolle |
|-------|-------|------|
| executor | sonnet | Code-Implementierung, Refactoring |
| explore | haiku | Schnelle Codebase-Suche |
| writer | haiku | Dokumentation, Migrationsnotizen |
| git-master | sonnet | Git-Operationen, Commits |
| code-simplifier | sonnet | Code-Vereinfachung |
| document-specialist | sonnet | Externe Dokumentation, API-Referenz |
| style-reviewer | fast | Code-Stil-Feedback |
| researcher | fast | Leichtgewichtige Exploration |
| api-reviewer | sonnet | API-Design-Review |
| performance-reviewer | sonnet | Performance-Analyse |
| dependency-expert | sonnet | Abhängigkeitsmanagement |
| ux-researcher | sonnet | UX-Forschung |

### ml-researcher — NEU

Full-Stack ML/DL-Forschungsagent. Bearbeitet:
- Paper-Review und Literaturrecherche (ArXiv, Semantic Scholar)
- Experimentdesign (Hyperparameter, Architekturen, Ablationen)
- Trainingspipelines (SFT, RLHF, DPO, Quantisierung, verteiltes Training)
- Modellanalyse (Metriken, Verlustkurven, Vergleiche)

Getrennt von `scientist` (allgemeine Datenanalyse). ML-Aufgaben → ml-researcher. Statistik/EDA → scientist.

---

## Nur-Claude-Modus

**OMI funktioniert ohne Codex.** Wenn OMX nicht installiert ist:
- Alle Do-Aufgaben fallen automatisch auf Claude zurück
- Claude erhält Do-optimiertes Prompting (FallbackPromptSpec)
- Alle Funktionen sind verfügbar — Sie profitieren nur nicht von Codex' Geschwindigkeits-/Kostenvorteilen
- `omi doctor` zeigt: "Claude fallback active for Do tasks"

Das ist so beabsichtigt. Codex ist ein Beschleuniger, niemals eine Voraussetzung.

---

## Architektur

```
┌──────────────────────────────────────────┐
│              OMI Plugin                   │
│  ┌────────┐ ┌─────────┐ ┌────────────┐  │
│  │ Router │ │  State   │ │   Interop  │  │
│  │Think/Do│ │  .omi/   │ │ OMC Bridge │  │
│  └───┬────┘ └────┬────┘ │ OMX Bridge │  │
│      │           │      └─────┬──────┘  │
└──────┼───────────┼────────────┼──────────┘
       │           │            │
  ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
  │   OMC   │ │  .omi/  │ │   OMX   │
  │ (Claude)│ │  state  │ │ (Codex) │
  │ Required│ │  files  │ │Optional │
  └─────────┘ └─────────┘ └─────────┘
```

### Wichtige Designentscheidungen

- **Schlanke Orchestrierung**: OMI umfasst ca. 6.000 Zeilen, die 150K+ Zeilen von OMC+OMX umschließen
- **Komposition statt Neuentwicklung**: OMC und OMX werden weiterhin unabhängig weiterentwickelt
- **Nur-Lese-Bridges**: OMI liest `.omc/` und `.omx/`, schreibt aber niemals hinein
- **Hook-Reihenfolge-unabhängig**: Funktioniert unabhängig von der Plugin-Ladereihenfolge (ADR-001a)
- **Versionierte Schemas**: Vendorisierte Typen mit CI-Drift-Erkennung (ADR-003)

### Beziehung zu OMC und OMX

| Plugin | Rolle | Erforderlich? |
|--------|------|-----------|
| **oh-my-claudecode (OMC)** | Claude-native Agents, Skills, MCP-Tools (LSP, AST, Python REPL). 19 Agents, 30+ Skills. | Ja |
| **oh-my-codex (OMX)** | Codex-CLI-Integration, Rust-Performance-Crates, Benachrichtigungssystem. 33 Agents, 36 Skills. | Nein |
| **oh-my-intelligence (OMI)** | Think/Do-Router, hybride Workflows, vereinheitlichter State. Orchestriert OMC und OMX. | — |

OMI ersetzt weder OMC noch OMX. Es sitzt darüber und lässt sie zusammenarbeiten.

---

## Konfiguration

### State-Verzeichnis

```
.omi/
  state/
    router/          # Current routing decisions
    providers/       # Detected provider info
    sessions/        # Session data
  plans/             # Unified plans
  logs/              # Execution logs
```

### Umgebungsvariablen

| Variable | Beschreibung |
|----------|-------------|
| `OMI_DEBUG` | Debug-Logging für Hooks aktivieren |
| `DISABLE_OMI` | OMI-Hooks vollständig deaktivieren |

---

## Entwicklung

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence
cd oh-my-intelligence
npm install
npm run build
npm test                        # 74 tests
npm run check-vendored-types    # CI: verify schema compatibility
```

---

## Lizenz

MIT
