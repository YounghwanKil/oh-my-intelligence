# OMI -- Oh My Intelligence

[English](README.md) | [한국어](README.ko.md) | 中文 | [日本語](README.ja.md) | [Español](README.es.md) | [Português](README.pt.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md)

```
  ___  __  __ ___
 / _ \|  \/  |_ _|
| | | | |\/| || |
| |_| | |  | || |
 \___/|_|  |_|___|

Think/Do 多模型编排，专为 Claude Code 设计。
Claude 思考。Codex 执行。OMI 路由。
```

## 什么是 OMI？

OMI 将 [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)（OMC）和 [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)（OMX）的优势整合为统一的编排层。

Claude 擅长**规划、代码审查、调试、测试设计和架构**。Codex 擅长**快速代码生成、高性价比实现和 DevOps**。OMI 根据任务类型自动将每个任务路由到最佳提供者，让你无需手动切换就能获得最合适的工具。

当未安装 Codex 时，一切都仅在 Claude 上运行——无需任何配置。

## Think/Do 范式

每个任务被分类到两条通道之一：

### Think Lane（Claude）

深度推理、分析和设计任务。

| 任务类型 | 示例 |
|----------|------|
| 规划 | "plan the API architecture"、"design the database schema" |
| 代码审查 | "review this PR for security issues"、"audit the auth flow" |
| 调试 | "debug why the login fails"、"trace the race condition" |
| 测试设计 | "what should we test?"、"design the test strategy" |
| 安全 | "check for vulnerabilities"、"audit trust boundaries" |
| 机器学习实验设计 | "compare these model architectures"、"design the fine-tuning experiment" |

### Do Lane（Codex 或 Claude 回退）

实现、执行和文件变更任务。

| 任务类型 | 示例 |
|----------|------|
| 实现 | "implement the auth middleware"、"build the REST endpoint" |
| 重构 | "refactor the user module"、"extract the shared logic" |
| 编写测试 | "write tests for the user model"、"fix the failing test" |
| 构建/修复 | "fix build error"、"fix lint warnings" |
| Git 操作 | "commit and push"、"merge the feature branch" |
| 机器学习流水线 | "train the model"、"run the preprocessing pipeline" |
| 快速修复 | "rename the variable"、"fix the typo" |

## 安装

### 前提条件

- 已安装 [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)（**必需**）
- 已安装 [Codex CLI](https://github.com/openai/codex)（**必需** — `npm i -g @openai/codex`）
- 已安装 [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)（OMC）插件（**必需**）
- 已安装 [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)（OMX）插件（**必需**）

### 安装

选择以下两种方式之一。

#### 方式 A：npm（推荐）

```bash
npm i -g oh-my-intelligence
```

然后在 Claude Code 中：

```
/setup
```

检测 OMC/OMX，初始化 `.omi/` 状态，配置 Hook。

#### 方式 B：Claude Code 市场

在 Claude Code 中：

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

重新加载后，运行设置：

```
/setup
```

#### 从源码安装

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence.git
cd oh-my-intelligence
npm install
npm run build
```

### 验证

在 Claude Code 中运行：

```
/route
```

显示当前路由状态、检测到的提供者和活跃通道。

### 更新

**npm：**
```bash
npm i -g oh-my-intelligence@latest
```

**市场：**
```
/plugin marketplace update oh-my-intelligence
/reload-plugins
```

## 快速开始

```
/think "review the auth architecture"    -> Claude 进行分析
/do "implement the login endpoint"       -> Codex 进行实现（或 Claude 回退）
/autopilot "build a REST API"            -> Think(规划) -> Do(实现) -> Think(验证)
/route                                    -> 显示路由状态
```

## 命令

| 命令 | 描述 |
|------|------|
| `/think <task>` | 强制将此任务分配到 Think Lane（Claude） |
| `/do <task>` | 强制将此任务分配到 Do Lane（Codex 或 Claude 回退） |
| `/route` | 显示路由状态和可用的提供者 |
| `/autopilot` | 混合 Think/Do 流水线：规划、实现、验证、修复、审查 |
| `/ralph` | 每次迭代中带有 Think/Do 切换的持久化循环 |
| `/team N:role` | 混合 Claude + Codex 工作者 |

## 代理（35 个）

### Think Lane（16 个代理）

| 代理 | 模型 | 角色 | 来源 |
|------|------|------|------|
| analyst | opus | 需求分析、约束发现 | OMC |
| planner | opus | 任务排序、执行计划 | OMC |
| architect | opus | 系统设计、接口、权衡 | OMC |
| critic | opus | 计划/设计差距分析、多角度审查 | OMC |
| code-reviewer | opus | 全面代码审查、逻辑缺陷检测 | OMC |
| security-reviewer | sonnet | 安全漏洞、信任边界 | OMC |
| test-engineer | sonnet | 测试策略、覆盖率、TDD 工作流 | OMC |
| designer | sonnet | UI/UX 架构、交互设计 | OMC |
| debugger | sonnet | 根因分析、堆栈追踪 | OMC |
| tracer | sonnet | 证据驱动的因果追踪 | OMC |
| qa-tester | sonnet | 交互式 CLI/服务验证 | OMC |
| verifier | sonnet | 完成度验证、证据收集 | OMC |
| product-manager | opus | 策略、优先级、路线图 | OMX |
| quality-strategist | opus | 全面质量保证策略 | OMX |
| **ml-researcher** | **opus** | **ML/DL：论文、实验、流水线、模型** | **OMI** |
| scientist | sonnet | 通用数据分析、统计、EDA | OMC |

### Do Lane（12 个代理）

| 代理 | 模型 | 角色 | 来源 |
|------|------|------|------|
| executor | sonnet | 代码实现、重构 | OMC |
| explore | haiku | 快速代码库搜索和发现 | OMC/OMX |
| writer | haiku | 文档、迁移说明 | OMC |
| git-master | sonnet | Git 操作、提交、历史 | OMC |
| code-simplifier | sonnet | 代码简化、清理 | OMC |
| document-specialist | sonnet | 外部文档、API/SDK 参考 | OMC |
| style-reviewer | fast | 代码风格反馈 | OMX |
| researcher | fast | 轻量级探索 | OMX |
| api-reviewer | sonnet | API 设计审查 | OMX |
| performance-reviewer | sonnet | 性能分析 | OMX |
| dependency-expert | sonnet | 依赖管理 | OMX |
| ux-researcher | sonnet | 用户体验研究 | OMX |

### ml-researcher（OMI 原生）

ML/DL 研究专家，在 Think Lane 中运行。覆盖完整的机器学习生命周期：论文审查、实验设计、训练流水线架构、模型分析、量化（GPTQ/AWQ/GGUF）、分布式训练（FSDP/DeepSpeed）和 MLOps。区别于通用的 `scientist` 代理，后者处理统计、EDA 和 A/B 测试，不涉及机器学习。

## 工作原理

### 自动路由

OMI 通过关键词模式对每个任务进行分类，并将其路由到最佳提供者。Think 任务发送给 Claude 进行深度推理。Do 任务发送给 Codex 进行快速执行（当 Codex 不可用时，则发送给 Claude 并使用 Do 优化的提示）。

默认通道为 Think（更安全）。使用 `/think` 或 `/do` 可强制指定特定通道。

### 混合工作流

`/autopilot` 和 `/ralph` 等复合工作流会按阶段自动在 Think 和 Do 通道之间切换：

| 阶段 | 通道 | 执行内容 |
|------|------|----------|
| 访谈 | Think | 明确需求 |
| 规划 | Think | 设计方案 |
| 实现 | Do | 编写代码 |
| 验证 | Think | 审查和测试 |
| 修复 | Do | 解决问题 |
| 审查 | Think | 最终质量检查 |

### 纯 Claude 模式

OMI 完全可以在未安装 Codex 的情况下工作。当 Codex 不可用时，Do 任务会路由到 Claude，并使用 `FallbackPromptSpec` 进行以下处理：

- 移除 Codex 特定的工具引用（`codex_run` -> `Bash`）
- 将 OMX 角色映射到 OMC 代理（`deep-worker` -> `executor`）
- 注入 Do 优化的系统提示（执行优先于分析）

### 架构

OMI 是一个轻量级编排层：

- **OMI 封装 OMC（必需）+ OMX（可选）**——从不替代它们
- **从不修改 `.omc/` 或 `.omx/`**——仅读取（ADR-001a）
- **自有状态存储在 `.omi/`**——路由决策、提供者检测、会话数据
- **不依赖 Hook 顺序**——作为下游消费者读取 OMC 状态，无论 Hook 执行顺序如何均可正常工作

## 与 OMC 和 OMX 的关系

### oh-my-claudecode（OMC）

- **必需**依赖
- 提供 Claude 原生代理、技能和 MCP 工具（LSP、AST、Python REPL）
- 19 个代理、30+ 技能、18+ MCP 工具
- OMI 读取 `.omc/` 状态，从不写入

### oh-my-codex（OMX）

- **可选**依赖
- 提供 Codex CLI 集成、Rust 高性能组件、通知系统
- 33 个代理、36 个技能、5 个 MCP 服务器
- 安装后，Do Lane 路由到 Codex 以获得速度和成本优势
- 未安装时，一切仅在 Claude 上运行

### 共存方式

- 三个独立插件，各自位于独立目录中
- OMI 编排，OMC 和 OMX 执行
- 无冲突：OMI Hook 作为下游消费者读取 OMC/OMX 输出
- 每个插件独立演进

## 配置

### 状态目录

```
.omi/
  state/
    router/
      current-decision.json    # 当前路由决策
      hybrid-state.json        # 活跃的混合工作流状态
    providers/
      detected.json            # 检测到的提供者和版本
      version-warning.json     # 版本兼容性警告
    sessions/
      current.json             # 当前会话状态
  plans/                       # 统一执行计划
  logs/                        # 调试日志
```

### 环境变量

| 变量 | 描述 |
|------|------|
| `OMI_DEBUG` | 启用 Hook 的详细调试输出 |
| `GEMINI_API_KEY` | 启用 Gemini 作为额外的提供者 |

## 开发

```bash
npm install
npm run build
npm test
npm run check-vendored-types
```

### 运行测试

```bash
npx vitest run              # 运行所有测试（单次）
npx vitest                  # 监听模式
npx tsc --noEmit            # 仅类型检查
```

### 项目结构

```
src/
  router/         # 任务分类、提供者选择、混合阶段
  state/          # .omi/ 状态管理（统一、提供者、会话）
  interop/        # OMC/OMX 桥接、代理/技能注册表
  config/         # 配置加载、提供者检测
  hud/            # HUD 路由指示器
  mcp/            # MCP 工具服务器
  types/          # TypeScript 类型定义
scripts/          # Hook 脚本（.mjs）
agents/           # 代理定义（.md）
skills/           # 技能定义（think、do、route）
bridge/           # CLI 入口点
tests/            # Vitest 测试套件
```

## 许可证

MIT
