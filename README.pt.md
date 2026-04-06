# OMI -- Oh My Intelligence

[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | Português | [Français](README.fr.md) | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md)

```
  ___  __  __ ___
 / _ \|  \/  |_ _|
| | | | |\/| || |
| |_| | |  | || |
 \___/|_|  |_|___|

Orquestração multi-modelo Think/Do para Claude Code.
Claude pensa. Codex executa. OMI roteia.
```

## O que é OMI?

OMI combina os pontos fortes de [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) e [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) em uma camada de orquestração unificada.

Claude se destaca em **planejamento, revisão de código, depuração, design de testes e arquitetura**. Codex se destaca em **geração rápida de código, implementação com custo eficiente e DevOps**. OMI roteia automaticamente cada tarefa para o melhor provedor com base no tipo de tarefa, para que você tenha a ferramenta certa para o trabalho certo sem troca manual.

Quando Codex não está instalado, tudo funciona apenas com Claude -- nenhuma configuração necessária.

## O Paradigma Think/Do

Cada tarefa é classificada em uma de duas faixas:

### Think Lane (Claude)

Tarefas de raciocínio profundo, análise e design.

| Tipo de Tarefa | Exemplos |
|----------------|----------|
| Planejamento | "plan the API architecture", "design the database schema" |
| Revisão de Código | "review this PR for security issues", "audit the auth flow" |
| Depuração | "debug why the login fails", "trace the race condition" |
| Design de Testes | "what should we test?", "design the test strategy" |
| Segurança | "check for vulnerabilities", "audit trust boundaries" |
| Design de Experimentos ML | "compare these model architectures", "design the fine-tuning experiment" |

### Do Lane (Codex ou Claude como fallback)

Tarefas de implementação, execução e modificação de arquivos.

| Tipo de Tarefa | Exemplos |
|----------------|----------|
| Implementação | "implement the auth middleware", "build the REST endpoint" |
| Refatoração | "refactor the user module", "extract the shared logic" |
| Escrita de Testes | "write tests for the user model", "fix the failing test" |
| Build/Correção | "fix build error", "fix lint warnings" |
| Operações Git | "commit and push", "merge the feature branch" |
| Pipeline ML | "train the model", "run the preprocessing pipeline" |
| Correção Rápida | "rename the variable", "fix the typo" |

## Instalação

### Pré-requisitos

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) instalado
- Plugin [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) instalado (obrigatório)
- Plugin [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) instalado (opcional, para funcionalidades do Codex)

### Pelo Marketplace do Claude Code (Recomendado)

```bash
claude plugin install oh-my-intelligence
```

### Pelo npm

```bash
npm i -g oh-my-intelligence
omi setup
```

### A partir do Código Fonte

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence.git
cd oh-my-intelligence
npm install
npm run build
```

### Verificar a Instalação

```bash
omi doctor
```

Ou de dentro do Claude Code:

```
/route
```

## Início Rápido

```
/think "review the auth architecture"    -> Claude analisa
/do "implement the login endpoint"       -> Codex implementa (ou Claude como fallback)
/autopilot "build a REST API"            -> Think(planejar) -> Do(implementar) -> Think(verificar)
/route                                    -> Mostrar estado do roteamento
```

## Comandos

| Comando | Descrição |
|---------|-----------|
| `/think <task>` | Forçar Think Lane (Claude) para esta tarefa |
| `/do <task>` | Forçar Do Lane (Codex ou Claude como fallback) para esta tarefa |
| `/route` | Mostrar estado do roteamento e provedores disponíveis |
| `/autopilot` | Pipeline híbrido Think/Do: planejar, implementar, verificar, corrigir, revisar |
| `/ralph` | Loop persistente com alternância Think/Do por iteração |
| `/team N:role` | Workers mistos de Claude + Codex |

## Agentes (35)

### Think Lane (16 agentes)

| Agente | Modelo | Função | Origem |
|--------|--------|--------|--------|
| analyst | opus | Análise de requisitos, descoberta de restrições | OMC |
| planner | opus | Sequenciamento de tarefas, planos de execução | OMC |
| architect | opus | Design de sistemas, interfaces, trade-offs | OMC |
| critic | opus | Análise de lacunas em planos/designs, revisão multi-ângulo | OMC |
| code-reviewer | opus | Revisão abrangente de código, detecção de defeitos lógicos | OMC |
| security-reviewer | sonnet | Vulnerabilidades de segurança, limites de confiança | OMC |
| test-engineer | sonnet | Estratégia de testes, cobertura, fluxos TDD | OMC |
| designer | sonnet | Arquitetura UI/UX, design de interação | OMC |
| debugger | sonnet | Análise de causa raiz, stack traces | OMC |
| tracer | sonnet | Rastreamento causal baseado em evidências | OMC |
| qa-tester | sonnet | Validação interativa de CLI/serviços | OMC |
| verifier | sonnet | Verificação de completude, coleta de evidências | OMC |
| product-manager | opus | Estratégia, prioridades, roadmap | OMX |
| quality-strategist | opus | Estratégia abrangente de QA | OMX |
| **ml-researcher** | **opus** | **ML/DL: papers, experimentos, pipelines, modelos** | **OMI** |
| scientist | sonnet | Análise geral de dados, estatísticas, EDA | OMC |

### Do Lane (12 agentes)

| Agente | Modelo | Função | Origem |
|--------|--------|--------|--------|
| executor | sonnet | Implementação de código, refatoração | OMC |
| explore | haiku | Busca e descoberta rápida no código base | OMC/OMX |
| writer | haiku | Documentação, notas de migração | OMC |
| git-master | sonnet | Operações Git, commits, histórico | OMC |
| code-simplifier | sonnet | Simplificação de código, limpeza | OMC |
| document-specialist | sonnet | Documentação externa, referência de API/SDK | OMC |
| style-reviewer | fast | Feedback de estilo de código | OMX |
| researcher | fast | Exploração leve | OMX |
| api-reviewer | sonnet | Revisão de design de API | OMX |
| performance-reviewer | sonnet | Análise de desempenho | OMX |
| dependency-expert | sonnet | Gerenciamento de dependências | OMX |
| ux-researcher | sonnet | Pesquisa UX | OMX |

### ml-researcher (nativo do OMI)

Especialista em pesquisa ML/DL que opera no Think Lane. Cobre o ciclo completo de ML: revisão de papers, design de experimentos, arquitetura de pipelines de treinamento, análise de modelos, quantização (GPTQ/AWQ/GGUF), treinamento distribuído (FSDP/DeepSpeed) e MLOps. Distinto do agente genérico `scientist`, que lida com estatísticas, EDA e testes A/B sem foco em ML.

## Como Funciona

### Roteamento Automático

OMI classifica cada tarefa por padrões de palavras-chave e a roteia para o melhor provedor. Tarefas Think vão para Claude para raciocínio profundo. Tarefas Do vão para Codex para execução rápida (ou para Claude com prompts otimizados para Do quando Codex não está disponível).

A faixa padrão é Think (mais segura). Use `/think` ou `/do` para forçar uma faixa específica.

### Fluxos de Trabalho Híbridos

Fluxos de trabalho compostos como `/autopilot` e `/ralph` alternam automaticamente entre as faixas Think e Do por fase:

| Fase | Faixa | O que Acontece |
|------|-------|----------------|
| Entrevista | Think | Esclarecer requisitos |
| Planejamento | Think | Projetar a abordagem |
| Implementação | Do | Escrever o código |
| Verificação | Think | Revisar e testar |
| Correção | Do | Resolver problemas |
| Revisão | Think | Verificação final de qualidade |

### Modo Apenas Claude

OMI funciona completamente sem Codex instalado. Quando Codex não está disponível, tarefas Do são roteadas para Claude com um `FallbackPromptSpec` que:

- Remove referências a ferramentas específicas do Codex (`codex_run` -> `Bash`)
- Mapeia posturas do OMX para agentes do OMC (`deep-worker` -> `executor`)
- Injeta prompts de sistema otimizados para Do (execução sobre análise)

### Arquitetura

OMI é uma camada de orquestração leve:

- **OMI envolve OMC (obrigatório) + OMX (opcional)** -- nunca os substitui
- **Nunca modifica `.omc/` ou `.omx/`** -- apenas leitura (ADR-001a)
- **Estado próprio em `.omi/`** -- decisões de roteamento, detecção de provedores, dados de sessão
- **Independente da ordem de hooks** -- lê o estado do OMC como consumidor downstream, funciona independentemente da ordem de execução dos hooks

## Relação com OMC e OMX

### oh-my-claudecode (OMC)

- Dependência **obrigatória**
- Fornece agentes nativos do Claude, habilidades e ferramentas MCP (LSP, AST, Python REPL)
- 19 agentes, 30+ habilidades, 18+ ferramentas MCP
- OMI lê o estado de `.omc/`, nunca escreve nele

### oh-my-codex (OMX)

- Dependência **opcional**
- Fornece integração com Codex CLI, crates de desempenho em Rust, sistema de notificações
- 33 agentes, 36 habilidades, 5 servidores MCP
- Quando instalado, Do Lane roteia para Codex para velocidade e economia de custos
- Quando ausente, tudo funciona apenas com Claude

### Como Coexistem

- Três plugins separados, cada um em seu próprio diretório
- OMI orquestra, OMC e OMX executam
- Sem conflitos: os hooks do OMI leem a saída de OMC/OMX como consumidor downstream
- Cada plugin continua evoluindo de forma independente

## Configuração

### Diretório de Estado

```
.omi/
  state/
    router/
      current-decision.json    # Decisão de roteamento atual
      hybrid-state.json        # Estado ativo do fluxo de trabalho híbrido
    providers/
      detected.json            # Provedores detectados e versões
      version-warning.json     # Avisos de compatibilidade de versão
    sessions/
      current.json             # Estado da sessão atual
  plans/                       # Planos de execução unificados
  logs/                        # Logs de depuração
```

### Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `OMI_DEBUG` | Habilitar saída de depuração detalhada dos hooks |
| `GEMINI_API_KEY` | Habilitar Gemini como provedor adicional |

## Desenvolvimento

```bash
npm install
npm run build
npm test
npm run check-vendored-types
```

### Executar Testes

```bash
npx vitest run              # Executar todos os testes uma vez
npx vitest                  # Modo observação
npx tsc --noEmit            # Apenas verificação de tipos
```

### Estrutura do Projeto

```
src/
  router/         # Classificação de tarefas, seleção de provedor, fases híbridas
  state/          # Gerenciamento de estado .omi/ (unificado, provedor, sessão)
  interop/        # Bridge OMC/OMX, registros de agentes/habilidades
  config/         # Carregamento de configuração, detecção de provedores
  hud/            # Indicador de roteamento HUD
  mcp/            # Servidor de ferramentas MCP
  types/          # Definições de tipos TypeScript
scripts/          # Scripts de hooks (.mjs)
agents/           # Definições de agentes (.md)
skills/           # Definições de habilidades (think, do, route)
bridge/           # Ponto de entrada CLI
tests/            # Suítes de testes Vitest
```

## Licença

MIT
