[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Português](README.pt.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md) | Русский

# oh-my-intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Рождён из [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) и [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex).
> Лучшее от обоих миров — объединено.

**Claude думает. Codex выполняет. OMI маршрутизирует.**

Мультимодельная оркестрация Think/Do для Claude Code. Автоматически направляет каждую задачу лучшему провайдеру.

[Быстрый старт](#быстрый-старт) • [Парадигма Think/Do](#парадигма-thinkdo) • [Команды](#команды) • [Агенты](#агенты-35) • [Архитектура](#архитектура)

---

## Почему OMI?

У Claude Code и Codex CLI есть очевидные сильные стороны. Бенчмарки это подтверждают:

| Возможность | Claude | Codex | Победитель |
|-----------|--------|-------|--------|
| Планирование и архитектура | Plan Mode, интерактивные контрольные точки | Нет аналога | Claude |
| Ревью кода и безопасность | Значительно больше обнаруженных багов | Стандарт | Claude |
| Написание тестов | 95% покрытие, 91% mutation kill | Стандарт | Claude |
| Скорость | ~200 ток/с | ~1 000 ток/с | Codex (5x) |
| Экономичность | Базовый уровень | В 3-4 раза дешевле за задачу | Codex |
| DevOps и CLI-задачи | 74,7% Terminal-Bench | 77,3% Terminal-Bench | Codex |

**OMI объединяет их.** Claude берёт на себя то, что делает лучше всего (мышление). Codex берёт на себя то, что делает лучше всего (исполнение). Вы просто описываете задачу — OMI разберётся с остальным.

---

## Быстрый старт

### Предварительные требования

- Установлен [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI (**обязательно**)
- Установлен [Codex CLI](https://github.com/openai/codex) (**обязательно** — `npm i -g @openai/codex`)
- Установлен плагин [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) (**обязательно**)
- Установлен плагин [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) (**обязательно**)

### Установка

Выберите один из двух способов ниже.

#### Вариант A: npm (рекомендуется)

```bash
npm i -g oh-my-intelligence
```

Затем в Claude Code:

```
/setup
```

Обнаруживает OMC/OMX, инициализирует состояние `.omi/` и настраивает хуки.

#### Вариант B: Claude Code Marketplace

В Claude Code:

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

После перезагрузки запустите настройку:

```
/setup
```

### Создайте что-нибудь

```
autopilot: build a REST API with authentication
```

OMI автоматически маршрутизирует: Claude планирует архитектуру → Codex реализует код → Claude проверяет результат.

### Проверка

В Claude Code:

```
/route
```

Показывает текущее состояние маршрутизации, обнаруженных провайдеров и активные полосы.

### Обновление

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

## Парадигма Think/Do

Каждая задача проходит через одну из двух полос:

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

### Think Lane (предпочтительно Claude)
Для задач, требующих **рассуждения, оценки и анализа**:
- Планирование и проектирование архитектуры
- Ревью кода и аудит безопасности
- Отладка и анализ первопричин
- Стратегия и проектирование тестов
- Дизайн ML-экспериментов
- Анализ требований

### Do Lane (предпочтительно Codex)
Для задач, требующих **скорости, выполнения и объёма**:
- Реализация кода и рефакторинг
- Написание тестов и исправление сборок
- Операции с Git и релизы
- Написание документации
- Выполнение ML-пайплайнов
- Быстрые исправления

### Переопределение

```bash
/think "implement the auth middleware"   # Принудительно Claude (даже для реализации)
/do "review the architecture"            # Принудительно Codex (даже для ревью)
/route                                    # Показать текущий статус маршрутизации
```

### Гибридные рабочие процессы

Составные рабочие процессы автоматически переключаются по фазам:

```
/autopilot "build a REST API"

  Phase 1: Planning         → Think (Claude планирует)
  Phase 2: Implementation   → Do (Codex кодирует)
  Phase 3: Verification     → Think (Claude проверяет)
  Phase 4: Fix Loop         → Do (Codex исправляет)
  Phase 5: Final Review     → Think (Claude утверждает)
```

---

## Команды

| Команда | Описание | Полоса |
|---------|-------------|------|
| `/think <task>` | Принудительно Think Lane (Claude) | Think |
| `/do <task>` | Принудительно Do Lane (Codex или fallback на Claude) | Do |
| `/route` | Показать статус маршрутизации и провайдеров | — |
| `/autopilot` | Полный пайплайн с переключением Think/Do | Гибрид |
| `/ralph` | Цикл с Think/Do на каждой итерации | Гибрид |
| `/ultrawork` | Максимальное параллельное выполнение Do | Do |
| `/team N:role` | Смешанные воркеры Claude+Codex | Гибрид |
| `/ultraqa` | Цикл Test→Fix с Think/Do | Гибрид |
| `/deep-interview` | Сократический сбор требований | Think |
| `/ralplan` | Консенсусное планирование (Planner/Architect/Critic) | Think |

Все существующие навыки OMC (`/oh-my-claudecode:*`) продолжают работать без изменений.

### CLI (только при установке через npm)

Если вы установили через npm (`npm i -g oh-my-intelligence`), также доступны эти команды терминала:

```bash
omi setup     # Обнаружить OMC/OMX, инициализировать .omi/
omi doctor    # Проверить зависимости и состояние
omi route     # Показать провайдеров и состояние маршрутизации
omi version   # Показать версию
```

> **Примечание:** При установке через Marketplace используйте `/setup` и `/route` в Claude Code.

---

## Агенты (35)

### Think Lane — 16 агентов (предпочтительно Claude)

| Агент | Модель | Роль |
|-------|-------|------|
| analyst | opus | Анализ требований, выявление ограничений |
| planner | opus | Последовательность задач, планы выполнения |
| architect | opus | Проектирование систем, интерфейсы, компромиссы |
| critic | opus | Анализ пробелов в планах/проектах |
| code-reviewer | opus | Комплексное ревью кода |
| security-reviewer | sonnet | Уязвимости безопасности, границы доверия |
| test-engineer | sonnet | Стратегия тестирования, покрытие, TDD |
| designer | sonnet | Архитектура UI/UX |
| debugger | sonnet | Анализ первопричин |
| tracer | sonnet | Каузальная трассировка на основе доказательств |
| qa-tester | sonnet | Интерактивная валидация CLI/сервисов |
| verifier | sonnet | Верификация завершённости |
| product-manager | opus | Стратегия, приоритеты, дорожная карта |
| quality-strategist | opus | Комплексная стратегия QA |
| **ml-researcher** | **opus** | **ML/DL: статьи, эксперименты, пайплайны, модели** |
| scientist | sonnet | Общий анализ данных, статистика |

### Do Lane — 12 агентов (предпочтительно Codex)

| Агент | Модель | Роль |
|-------|-------|------|
| executor | sonnet | Реализация кода, рефакторинг |
| explore | haiku | Быстрый поиск по кодовой базе |
| writer | haiku | Документация, заметки по миграции |
| git-master | sonnet | Операции с Git, коммиты |
| code-simplifier | sonnet | Упрощение кода |
| document-specialist | sonnet | Внешняя документация, справочник API |
| style-reviewer | fast | Обратная связь по стилю кода |
| researcher | fast | Лёгкое исследование |
| api-reviewer | sonnet | Ревью дизайна API |
| performance-reviewer | sonnet | Анализ производительности |
| dependency-expert | sonnet | Управление зависимостями |
| ux-researcher | sonnet | Исследование UX |

### ml-researcher — НОВЫЙ

Full-stack агент для исследований в области ML/DL. Выполняет:
- Обзор статей и литературный обзор (ArXiv, Semantic Scholar)
- Проектирование экспериментов (гиперпараметры, архитектуры, абляции)
- Пайплайны обучения (SFT, RLHF, DPO, квантизация, распределённое обучение)
- Анализ моделей (метрики, кривые потерь, сравнения)

Отделён от `scientist` (общий анализ данных). Задачи ML → ml-researcher. Статистика/EDA → scientist.

---

## Режим только Claude

**OMI работает без Codex.** Когда OMX не установлен:
- Все задачи Do автоматически переключаются на Claude
- Claude получает оптимизированный для Do промптинг (FallbackPromptSpec)
- Все функции работают — вы просто не получаете преимуществ Codex в скорости/стоимости
- `omi doctor` показывает: "Claude fallback active for Do tasks"

Это сделано намеренно. Codex — ускоритель, но никогда не обязательное требование.

---

## Архитектура

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

### Ключевые проектные решения

- **Тонкая оркестрация**: OMI — это примерно 6 000 строк, оборачивающих 150K+ строк OMC+OMX
- **Композиция вместо переписывания**: OMC и OMX продолжают развиваться независимо
- **Мосты только для чтения**: OMI читает `.omc/` и `.omx/`, но никогда не пишет в них
- **Независимость от порядка хуков**: Работает вне зависимости от порядка загрузки плагинов (ADR-001a)
- **Версионированные схемы**: Вендоризованные типы с CI-обнаружением рассогласования (ADR-003)

### Связь с OMC и OMX

| Плагин | Роль | Обязателен? |
|--------|------|-----------|
| **oh-my-claudecode (OMC)** | Нативные агенты Claude, навыки, MCP-инструменты (LSP, AST, Python REPL). 19 агентов, 30+ навыков. | Да |
| **oh-my-codex (OMX)** | Интеграция с Codex CLI, Rust-крейты для производительности, система уведомлений. 33 агента, 36 навыков. | Нет |
| **oh-my-intelligence (OMI)** | Маршрутизатор Think/Do, гибридные рабочие процессы, единое состояние. Оркестрирует OMC и OMX. | — |

OMI не заменяет OMC или OMX. Он находится сверху и заставляет их работать вместе.

---

## Конфигурация

### Каталог состояния

```
.omi/
  state/
    router/          # Current routing decisions
    providers/       # Detected provider info
    sessions/        # Session data
  plans/             # Unified plans
  logs/              # Execution logs
```

### Переменные окружения

| Переменная | Описание |
|----------|-------------|
| `OMI_DEBUG` | Включить отладочное логирование для хуков |
| `DISABLE_OMI` | Полностью отключить хуки OMI |

---

## Разработка

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence
cd oh-my-intelligence
npm install
npm run build
npm test                        # 74 tests
npm run check-vendored-types    # CI: verify schema compatibility
```

---

## Лицензия

MIT
