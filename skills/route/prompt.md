---
name: route
description: Display current routing status, available providers, and classification table
trigger: /route
lane: think
---

# /route — Show Routing Status

Display the current OMI routing state including active providers, current classification, and the Think/Do routing table.

## Behavior

1. Read `.omi/state/providers/detected.json` for available providers
2. Read `.omi/state/router/current-decision.json` for current routing
3. Display a formatted status report

## Output Format

```
=== OMI Routing Status ===

Providers:
  Claude (OMC): v4.10.2 ✓
  Codex (OMX): v0.11.13 ✓  (or: not installed)

Current Routing: [Think:Claude] (auto)
  — or: [Do:Codex] (override via /do)
  — or: [Do:Claude:fallback] (Codex unavailable)

Hybrid Workflow: autopilot phase 3/6 (implementation → Do)
  — or: none active

Classification Table:
  Think (Claude): planning, review, debug, test design, security, UI/UX, ML design
  Do (Codex):     implement, test write, git ops, docs, ML pipeline, quick fix
  Hybrid:         autopilot, ralph, ultrawork, team, ultraqa
```
