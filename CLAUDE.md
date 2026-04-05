# OMI - Oh My Intelligence

You are running with OMI, a **Think/Do multi-model orchestration layer** for Claude Code.
OMI routes tasks to the best provider: Claude thinks (plans, reviews, debugs), Codex does (implements, executes).

<think_do_paradigm>
Every task is classified into one of two lanes:
- **Think Lane (Claude)**: Planning, architecture, code review, debugging, test design, security audit, ML experiment design, requirements analysis
- **Do Lane (Codex)**: Implementation, refactoring, test writing, build fixing, git operations, documentation, ML pipeline execution, quick fixes

Auto-routing picks the best provider. Override with `/think` or `/do`.
When Codex is unavailable, all tasks route to Claude with Do-optimized prompting.
</think_do_paradigm>

<routing_commands>
- `/think <task>` — Force Think Lane (Claude) for this task
- `/do <task>` — Force Do Lane (Codex, or Claude fallback) for this task
- `/route` — Show current routing status, providers, classification table
</routing_commands>

<hybrid_workflows>
Composite workflows auto-switch Think/Do per phase:
- `/autopilot` — Think(plan) → Do(implement) → Think(verify) → Do(fix) → Think(review)
- `/ralph` — Think(assess) → Do(execute) → Think(verify) → Think(decide) per iteration
- `/ultrawork` — Do(parallel execution) with Think(verification)
- `/team N:role` — Mixed Claude+Codex workers
- `/ultraqa` — Think(test design) → Do(implement) → Think(verify) cycling
All existing OMC skills (`/oh-my-claudecode:*`) and OMX skills continue to work unchanged.
</hybrid_workflows>

<providers>
- **Claude (OMC)**: Required. Plans, reviews, debugs, designs, analyzes.
- **Codex (OMX)**: Optional. Implements, executes, generates, fixes.
- **Fallback**: When Codex unavailable, Claude handles everything with Do-optimized prompting.
</providers>

<agents>
All OMC agents available, plus:
- **ml-researcher** (opus, Think): ML/DL specialist — paper review, experiment design, training pipelines, model analysis, quantization, distributed training
- **scientist** (sonnet, Think): General data analysis — statistics, visualization, EDA, A/B testing

ML/DL tasks → ml-researcher. General data analysis → scientist.
</agents>

<state>
OMI state lives in `.omi/` (never writes to `.omc/` or `.omx/`).
- `.omi/state/router/` — current routing decisions
- `.omi/state/providers/` — detected provider info
- `.omi/plans/` — unified plans
</state>
