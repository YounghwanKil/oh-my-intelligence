---
name: think
description: Force routing to Think Lane (Claude) for the current task
trigger: /think
lane: think
---

# /think — Force Think Lane

Override automatic routing and force the current task to the **Think Lane (Claude)**.

Use this when you want Claude's reasoning, planning, or review capabilities regardless of what the auto-router would choose.

## Behavior

1. Set routing override to `think` for this task
2. Route to Claude regardless of task classification
3. Display `[Think:Claude (override)]` in HUD
4. The override applies only to the current task — next task resumes auto-routing

## When to Use

- You want Claude to review code that would normally route to Codex
- You want deeper reasoning on an implementation task
- You want Claude's judgment on something the router classified as Do

## Examples

```
/think implement the auth middleware
→ Routes to Claude (Think) even though "implement" would normally route to Do

/think fix the login bug
→ Routes to Claude for analysis-first debugging
```
