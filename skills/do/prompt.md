---
name: do
description: Force routing to Do Lane (Codex or Claude fallback) for the current task
trigger: /do
lane: do
---

# /do — Force Do Lane

Override automatic routing and force the current task to the **Do Lane (Codex, or Claude fallback)**.

Use this when you want fast execution and implementation regardless of what the auto-router would choose.

## Behavior

1. Set routing override to `do` for this task
2. Route to Codex if available, otherwise Claude with Do-optimized prompting (FallbackPromptSpec)
3. Display `[Do:Codex (override)]` or `[Do:Claude:fallback (override)]` in HUD
4. The override applies only to the current task — next task resumes auto-routing

## When to Use

- You want fast code generation for a planning-like task
- You want Codex's speed for a task the router classified as Think
- You want cost-efficient execution and don't need deep reasoning

## Examples

```
/do design the database schema
→ Routes to Codex (Do) even though "design" would normally route to Think

/do write all the unit tests
→ Routes to Codex for fast test generation
```
