English | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Português](README.pt.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md) | [Русский](README.ru.md)

# oh-my-intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Born from [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) and [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex).
> The best of both worlds — unified.

**Claude thinks. Codex does. OMI routes.**

Think/Do multi-model orchestration for Claude Code. Auto-routes every task to the best provider.

[Quick Start](#quick-start) • [Think/Do Paradigm](#the-thinkdo-paradigm) • [Commands](#commands) • [Agents](#agents-35) • [Architecture](#architecture)

---

## Why OMI?

Claude Code and Codex CLI each have clear strengths. Benchmarks confirm it:

| Capability | Claude | Codex | Winner |
|-----------|--------|-------|--------|
| Planning & Architecture | Plan Mode, interactive checkpoints | No equivalent | Claude |
| Code Review & Security | Significantly more bug detection | Standard | Claude |
| Test Writing | 95% coverage, 91% mutation kill | Standard | Claude |
| Speed | ~200 tok/s | ~1,000 tok/s | Codex (5x) |
| Cost Efficiency | Baseline | 3-4x cheaper per task | Codex |
| DevOps & CLI Tasks | 74.7% Terminal-Bench | 77.3% Terminal-Bench | Codex |

**OMI combines them.** Claude handles what it's best at (thinking). Codex handles what it's best at (doing). You just describe your task — OMI figures out the rest.

---

## Quick Start

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) plugin installed (**required**)
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) installed (*optional* — for Codex features)

### Install

Choose one of the two methods below.

#### Option A: npm (recommended)

```bash
npm i -g oh-my-intelligence
```

Then inside Claude Code:

```
/setup
```

This detects OMC/OMX, initializes `.omi/` state, and configures hooks.

#### Option B: Claude Code Marketplace

Inside Claude Code:

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

After reload, run setup:

```
/setup
```

### Build something

```
autopilot: build a REST API with authentication
```

OMI auto-routes: Claude plans the architecture → Codex implements the code → Claude reviews the result.

### Verify

Inside Claude Code:

```
/route
```

This shows the current routing status, detected providers, and active lanes.

### Updating

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

## The Think/Do Paradigm

Every task flows through one of two lanes:

```
                    ┌──────────────────────────┐
                    │      Your Request        │
                    └────────────┬─────────────┘
                                 │
                          ┌──────▼───────┐
                          │ Intent Router│
                          │ (auto-route) │
                          └──┬───────┬───┘
                             │       │
                    ┌────────▼─┐   ┌─▼─────────┐
                    │  THINK   │   │    DO     │
                    │  Lane    │   │   Lane    │
                    │ (Claude) │   │  (Codex)  │
                    └──────────┘   └───────────┘
```

### Think Lane (Claude-preferred)
For tasks that require **reasoning, judgment, and analysis**:
- Planning & architecture design
- Code review & security audit
- Debugging & root cause analysis
- Test strategy & design
- ML experiment design
- Requirements analysis

### Do Lane (Codex-preferred)
For tasks that require **speed, execution, and volume**:
- Code implementation & refactoring
- Test writing & build fixing
- Git operations & releases
- Documentation writing
- ML pipeline execution
- Quick fixes

### Override

```bash
/think "implement the auth middleware"   # Force Claude (even for implementation)
/do "review the architecture"            # Force Codex (even for review)
/route                                    # Show current routing status
```

### Hybrid Workflows

Composite workflows auto-switch per phase:

```
/autopilot "build a REST API"

  Phase 1: Planning         → Think (Claude plans)
  Phase 2: Implementation   → Do (Codex codes)
  Phase 3: Verification     → Think (Claude reviews)
  Phase 4: Fix Loop         → Do (Codex patches)
  Phase 5: Final Review     → Think (Claude approves)
```

---

## Commands

| Command | Description | Lane |
|---------|-------------|------|
| `/think <task>` | Force Think Lane (Claude) | Think |
| `/do <task>` | Force Do Lane (Codex or Claude fallback) | Do |
| `/route` | Show routing status and providers | — |
| `/autopilot` | Full pipeline with Think/Do switching | Hybrid |
| `/ralph` | Persistence loop with Think/Do per iteration | Hybrid |
| `/ultrawork` | Maximum parallel Do execution | Do |
| `/team N:role` | Mixed Claude+Codex workers | Hybrid |
| `/ultraqa` | Test→Fix cycling with Think/Do | Hybrid |
| `/deep-interview` | Socratic requirements gathering | Think |
| `/ralplan` | Consensus planning (Planner/Architect/Critic) | Think |

All existing OMC skills (`/oh-my-claudecode:*`) continue to work unchanged.

### CLI (npm install only)

If you installed via npm (`npm i -g oh-my-intelligence`), these terminal commands are also available:

```bash
omi setup     # Detect OMC/OMX, initialize .omi/
omi doctor    # Check dependencies and status
omi route     # Show providers and routing state
omi version   # Show version
```

> **Note:** Marketplace installs use `/setup` and `/route` inside Claude Code instead.

---

## Agents (35)

### Think Lane — 16 agents (Claude-preferred)

| Agent | Model | Role |
|-------|-------|------|
| analyst | opus | Requirements analysis, constraint discovery |
| planner | opus | Task sequencing, execution plans |
| architect | opus | System design, interfaces, tradeoffs |
| critic | opus | Plan/design gap analysis |
| code-reviewer | opus | Comprehensive code review |
| security-reviewer | sonnet | Security vulnerabilities, trust boundaries |
| test-engineer | sonnet | Test strategy, coverage, TDD |
| designer | sonnet | UI/UX architecture |
| debugger | sonnet | Root-cause analysis |
| tracer | sonnet | Evidence-driven causal tracing |
| qa-tester | sonnet | Interactive CLI/service validation |
| verifier | sonnet | Completion verification |
| product-manager | opus | Strategy, priorities, roadmap |
| quality-strategist | opus | Comprehensive QA strategy |
| **ml-researcher** | **opus** | **ML/DL: papers, experiments, pipelines, models** |
| scientist | sonnet | General data analysis, statistics |

### Do Lane — 12 agents (Codex-preferred)

| Agent | Model | Role |
|-------|-------|------|
| executor | sonnet | Code implementation, refactoring |
| explore | haiku | Fast codebase search |
| writer | haiku | Documentation, migration notes |
| git-master | sonnet | Git operations, commits |
| code-simplifier | sonnet | Code simplification |
| document-specialist | sonnet | External docs, API reference |
| style-reviewer | fast | Code style feedback |
| researcher | fast | Lightweight exploration |
| api-reviewer | sonnet | API design review |
| performance-reviewer | sonnet | Performance analysis |
| dependency-expert | sonnet | Dependency management |
| ux-researcher | sonnet | UX research |

### ml-researcher — NEW

Full-stack ML/DL research agent. Handles:
- Paper review & literature survey (ArXiv, Semantic Scholar)
- Experiment design (hyperparameters, architectures, ablations)
- Training pipeline (SFT, RLHF, DPO, quantization, distributed training)
- Model analysis (metrics, loss curves, comparisons)

Separate from `scientist` (general data analysis). ML tasks → ml-researcher. Statistics/EDA → scientist.

---

## Claude-Only Mode

**OMI works without Codex.** When OMX is not installed:
- All Do tasks automatically fall back to Claude
- Claude receives Do-optimized prompting (FallbackPromptSpec)
- Every feature works — you just don't get Codex's speed/cost benefits
- `omi doctor` shows: "Claude fallback active for Do tasks"

This is by design. Codex is an accelerator, never a requirement.

---

## Architecture

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

### Key Design Decisions

- **Thin orchestration**: OMI is ~6,000 lines wrapping 150K+ lines of OMC+OMX
- **Composition over rewrite**: OMC and OMX continue shipping independently
- **Read-only bridges**: OMI reads `.omc/` and `.omx/` but never writes to them
- **Hook-order independent**: Works regardless of plugin load order (ADR-001a)
- **Version-pinned schemas**: Vendored types with CI drift detection (ADR-003)

### Relationship with OMC and OMX

| Plugin | Role | Required? |
|--------|------|-----------|
| **oh-my-claudecode (OMC)** | Claude-native agents, skills, MCP tools (LSP, AST, Python REPL). 19 agents, 30+ skills. | Yes |
| **oh-my-codex (OMX)** | Codex CLI integration, Rust performance crates, notification system. 33 agents, 36 skills. | No |
| **oh-my-intelligence (OMI)** | Think/Do router, hybrid workflows, unified state. Orchestrates OMC and OMX. | — |

OMI doesn't replace OMC or OMX. It sits on top and makes them work together.

---

## Configuration

### State Directory

```
.omi/
  state/
    router/          # Current routing decisions
    providers/       # Detected provider info
    sessions/        # Session data
  plans/             # Unified plans
  logs/              # Execution logs
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OMI_DEBUG` | Enable debug logging for hooks |
| `DISABLE_OMI` | Disable OMI hooks entirely |

---

## Development

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence
cd oh-my-intelligence
npm install
npm run build
npm test                        # 68 tests
npm run check-vendored-types    # CI: verify schema compatibility
```

---

## License

MIT
