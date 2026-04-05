# OMI Agent Catalog

OMI provides a unified agent catalog combining OMC (Think Lane) and OMX (Do Lane) agents, plus OMI-native agents.

## Think Lane Agents (Claude-preferred)

| Agent | Model | Role | Source |
|-------|-------|------|--------|
| analyst | opus | Requirements analysis, constraint discovery | OMC |
| planner | opus | Task sequencing, execution plans | OMC |
| architect | opus | System design, interfaces, tradeoffs | OMC |
| critic | opus | Plan/design gap analysis, multi-angle review | OMC |
| code-reviewer | opus | Comprehensive code review, logic defects | OMC |
| security-reviewer | sonnet | Security vulnerabilities, trust boundaries | OMC |
| test-engineer | sonnet | Test strategy, coverage, TDD workflows | OMC |
| designer | sonnet | UI/UX architecture, interaction design | OMC |
| debugger | sonnet | Root-cause analysis, stack traces | OMC |
| tracer | sonnet | Evidence-driven causal tracing | OMC |
| qa-tester | sonnet | Interactive CLI/service validation | OMC |
| verifier | sonnet | Completion verification, evidence collection | OMC |
| product-manager | opus | Strategy, priorities, roadmap | OMX |
| quality-strategist | opus | Comprehensive QA strategy | OMX |
| **ml-researcher** | **opus** | **ML/DL: papers, experiments, pipelines, models** | **OMI** |
| scientist | sonnet | General data analysis, statistics, EDA | OMC |

## Do Lane Agents (Codex-preferred)

| Agent | Model | Role | Source |
|-------|-------|------|--------|
| executor | sonnet | Code implementation, refactoring | OMC |
| explore | haiku | Fast codebase search and discovery | OMC/OMX |
| writer | haiku | Documentation, migration notes | OMC |
| git-master | sonnet | Git operations, commits, history | OMC |
| code-simplifier | sonnet | Code simplification, cleanup | OMC |
| document-specialist | sonnet | External docs, API/SDK reference | OMC |
| style-reviewer | fast | Code style feedback | OMX |
| researcher | fast | Lightweight exploration | OMX |
| api-reviewer | sonnet | API design review | OMX |
| performance-reviewer | sonnet | Performance analysis | OMX |
| dependency-expert | sonnet | Dependency management | OMX |
| ux-researcher | sonnet | UX research | OMX |

## Routing Rules

- Think agents are invoked via Claude (OMC)
- Do agents are invoked via Codex (OMX) when available, Claude fallback otherwise
- `/think` forces any agent through Claude
- `/do` forces any agent through Codex (or Claude with Do-optimized prompting)
- Hybrid workflows (autopilot, ralph) auto-switch per phase

## ml-researcher vs scientist

- **ml-researcher**: Model architectures, training pipelines (SFT/RLHF/DPO), paper reviews, hyperparameter tuning, quantization (GPTQ/AWQ/GGUF), distributed training (FSDP/DeepSpeed), ML metrics, MLOps
- **scientist**: Statistics, visualization, EDA, A/B testing, hypothesis testing, general data analysis without ML focus
