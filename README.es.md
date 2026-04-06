# OMI -- Oh My Intelligence

[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | Español | [Português](README.pt.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md)

```
  ___  __  __ ___
 / _ \|  \/  |_ _|
| | | | |\/| || |
| |_| | |  | || |
 \___/|_|  |_|___|

Orquestación multi-modelo Think/Do para Claude Code.
Claude piensa. Codex ejecuta. OMI enruta.
```

## ¿Qué es OMI?

OMI combina las fortalezas de [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) y [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) en una única capa de orquestación.

Claude sobresale en **planificación, revisión de código, depuración, diseño de pruebas y arquitectura**. Codex sobresale en **generación rápida de código, implementación eficiente en costos y DevOps**. OMI enruta automáticamente cada tarea al mejor proveedor según el tipo de tarea, para que obtengas la herramienta adecuada para el trabajo adecuado sin cambios manuales.

Cuando Codex no está instalado, todo funciona solo con Claude -- no se necesita configuración.

## El Paradigma Think/Do

Cada tarea se clasifica en uno de dos carriles:

### Think Lane (Claude)

Tareas de razonamiento profundo, análisis y diseño.

| Tipo de Tarea | Ejemplos |
|---------------|----------|
| Planificación | "plan the API architecture", "design the database schema" |
| Revisión de Código | "review this PR for security issues", "audit the auth flow" |
| Depuración | "debug why the login fails", "trace the race condition" |
| Diseño de Pruebas | "what should we test?", "design the test strategy" |
| Seguridad | "check for vulnerabilities", "audit trust boundaries" |
| Diseño de Experimentos ML | "compare these model architectures", "design the fine-tuning experiment" |

### Do Lane (Codex o Claude como respaldo)

Tareas de implementación, ejecución y modificación de archivos.

| Tipo de Tarea | Ejemplos |
|---------------|----------|
| Implementación | "implement the auth middleware", "build the REST endpoint" |
| Refactorización | "refactor the user module", "extract the shared logic" |
| Escritura de Pruebas | "write tests for the user model", "fix the failing test" |
| Compilación/Corrección | "fix build error", "fix lint warnings" |
| Operaciones Git | "commit and push", "merge the feature branch" |
| Pipeline ML | "train the model", "run the preprocessing pipeline" |
| Corrección Rápida | "rename the variable", "fix the typo" |

## Instalación

### Requisitos Previos

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) instalado
- Plugin [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) instalado (requerido)
- Plugin [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) instalado (opcional, para funciones de Codex)

### Desde el Marketplace de Claude Code (Recomendado)

```bash
claude plugin install oh-my-intelligence
```

### Desde npm

```bash
npm i -g oh-my-intelligence
omi setup
```

### Desde el Código Fuente

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence.git
cd oh-my-intelligence
npm install
npm run build
```

### Verificar la Instalación

```bash
omi doctor
```

O desde dentro de Claude Code:

```
/route
```

## Inicio Rápido

```
/think "review the auth architecture"    -> Claude analiza
/do "implement the login endpoint"       -> Codex implementa (o Claude como respaldo)
/autopilot "build a REST API"            -> Think(planificar) -> Do(implementar) -> Think(verificar)
/route                                    -> Mostrar estado del enrutamiento
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `/think <task>` | Forzar Think Lane (Claude) para esta tarea |
| `/do <task>` | Forzar Do Lane (Codex o Claude como respaldo) para esta tarea |
| `/route` | Mostrar estado del enrutamiento y proveedores disponibles |
| `/autopilot` | Pipeline híbrido Think/Do: planificar, implementar, verificar, corregir, revisar |
| `/ralph` | Bucle persistente con cambio Think/Do por iteración |
| `/team N:role` | Workers mixtos de Claude + Codex |

## Agentes (35)

### Think Lane (16 agentes)

| Agente | Modelo | Rol | Origen |
|--------|--------|-----|--------|
| analyst | opus | Análisis de requisitos, descubrimiento de restricciones | OMC |
| planner | opus | Secuenciación de tareas, planes de ejecución | OMC |
| architect | opus | Diseño de sistemas, interfaces, compensaciones | OMC |
| critic | opus | Análisis de brechas en planes/diseños, revisión multi-ángulo | OMC |
| code-reviewer | opus | Revisión exhaustiva de código, defectos lógicos | OMC |
| security-reviewer | sonnet | Vulnerabilidades de seguridad, límites de confianza | OMC |
| test-engineer | sonnet | Estrategia de pruebas, cobertura, flujos TDD | OMC |
| designer | sonnet | Arquitectura UI/UX, diseño de interacción | OMC |
| debugger | sonnet | Análisis de causa raíz, trazas de pila | OMC |
| tracer | sonnet | Rastreo causal basado en evidencia | OMC |
| qa-tester | sonnet | Validación interactiva de CLI/servicios | OMC |
| verifier | sonnet | Verificación de completitud, recopilación de evidencia | OMC |
| product-manager | opus | Estrategia, prioridades, hoja de ruta | OMX |
| quality-strategist | opus | Estrategia integral de QA | OMX |
| **ml-researcher** | **opus** | **ML/DL: papers, experimentos, pipelines, modelos** | **OMI** |
| scientist | sonnet | Análisis general de datos, estadísticas, EDA | OMC |

### Do Lane (12 agentes)

| Agente | Modelo | Rol | Origen |
|--------|--------|-----|--------|
| executor | sonnet | Implementación de código, refactorización | OMC |
| explore | haiku | Búsqueda y descubrimiento rápido en el código base | OMC/OMX |
| writer | haiku | Documentación, notas de migración | OMC |
| git-master | sonnet | Operaciones Git, commits, historial | OMC |
| code-simplifier | sonnet | Simplificación de código, limpieza | OMC |
| document-specialist | sonnet | Documentación externa, referencia de API/SDK | OMC |
| style-reviewer | fast | Retroalimentación de estilo de código | OMX |
| researcher | fast | Exploración ligera | OMX |
| api-reviewer | sonnet | Revisión de diseño de API | OMX |
| performance-reviewer | sonnet | Análisis de rendimiento | OMX |
| dependency-expert | sonnet | Gestión de dependencias | OMX |
| ux-researcher | sonnet | Investigación UX | OMX |

### ml-researcher (nativo de OMI)

Especialista en investigación ML/DL que opera en el Think Lane. Cubre el ciclo completo de ML: revisión de papers, diseño de experimentos, arquitectura de pipelines de entrenamiento, análisis de modelos, cuantización (GPTQ/AWQ/GGUF), entrenamiento distribuido (FSDP/DeepSpeed) y MLOps. Se distingue del agente general `scientist`, que maneja estadísticas, EDA y pruebas A/B sin enfoque en ML.

## Cómo Funciona

### Enrutamiento Automático

OMI clasifica cada tarea mediante patrones de palabras clave y la enruta al mejor proveedor. Las tareas Think van a Claude para razonamiento profundo. Las tareas Do van a Codex para ejecución rápida (o a Claude con prompts optimizados para Do cuando Codex no está disponible).

El carril predeterminado es Think (más seguro). Usa `/think` o `/do` para forzar un carril específico.

### Flujos de Trabajo Híbridos

Los flujos de trabajo compuestos como `/autopilot` y `/ralph` cambian automáticamente entre los carriles Think y Do por fase:

| Fase | Carril | Qué Sucede |
|------|--------|------------|
| Entrevista | Think | Clarificar requisitos |
| Planificación | Think | Diseñar el enfoque |
| Implementación | Do | Escribir el código |
| Verificación | Think | Revisar y probar |
| Corrección | Do | Abordar problemas |
| Revisión | Think | Verificación final de calidad |

### Modo Solo Claude

OMI funciona completamente sin Codex instalado. Cuando Codex no está disponible, las tareas Do se enrutan a Claude con un `FallbackPromptSpec` que:

- Elimina referencias a herramientas específicas de Codex (`codex_run` -> `Bash`)
- Mapea posturas de OMX a agentes de OMC (`deep-worker` -> `executor`)
- Inyecta prompts de sistema optimizados para Do (ejecución sobre análisis)

### Arquitectura

OMI es una capa de orquestación delgada:

- **OMI envuelve OMC (requerido) + OMX (opcional)** -- nunca los reemplaza
- **Nunca modifica `.omc/` o `.omx/`** -- solo lectura (ADR-001a)
- **Estado propio en `.omi/`** -- decisiones de enrutamiento, detección de proveedores, datos de sesión
- **Independiente del orden de hooks** -- lee el estado de OMC como consumidor downstream, funciona independientemente del orden de ejecución de hooks

## Relación con OMC y OMX

### oh-my-claudecode (OMC)

- Dependencia **requerida**
- Proporciona agentes nativos de Claude, habilidades y herramientas MCP (LSP, AST, Python REPL)
- 19 agentes, 30+ habilidades, 18+ herramientas MCP
- OMI lee el estado de `.omc/`, nunca escribe en él

### oh-my-codex (OMX)

- Dependencia **opcional**
- Proporciona integración con Codex CLI, crates de rendimiento en Rust, sistema de notificaciones
- 33 agentes, 36 habilidades, 5 servidores MCP
- Cuando está instalado, Do Lane enruta a Codex para velocidad y ahorro de costos
- Cuando está ausente, todo funciona solo con Claude

### Cómo Coexisten

- Tres plugins separados, cada uno en su propio directorio
- OMI orquesta, OMC y OMX ejecutan
- Sin conflictos: los hooks de OMI leen la salida de OMC/OMX como consumidor downstream
- Cada plugin continúa evolucionando de forma independiente

## Configuración

### Directorio de Estado

```
.omi/
  state/
    router/
      current-decision.json    # Decisión de enrutamiento actual
      hybrid-state.json        # Estado activo del flujo de trabajo híbrido
    providers/
      detected.json            # Proveedores detectados y versiones
      version-warning.json     # Advertencias de compatibilidad de versiones
    sessions/
      current.json             # Estado de sesión actual
  plans/                       # Planes de ejecución unificados
  logs/                        # Registros de depuración
```

### Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `OMI_DEBUG` | Habilitar salida de depuración detallada desde los hooks |
| `GEMINI_API_KEY` | Habilitar Gemini como proveedor adicional |

## Desarrollo

```bash
npm install
npm run build
npm test
npm run check-vendored-types
```

### Ejecutar Pruebas

```bash
npx vitest run              # Ejecutar todas las pruebas una vez
npx vitest                  # Modo observación
npx tsc --noEmit            # Solo verificación de tipos
```

### Estructura del Proyecto

```
src/
  router/         # Clasificación de tareas, selección de proveedor, fases híbridas
  state/          # Gestión de estado .omi/ (unificado, proveedor, sesión)
  interop/        # Puente OMC/OMX, registros de agentes/habilidades
  config/         # Carga de configuración, detección de proveedores
  hud/            # Indicador de enrutamiento HUD
  mcp/            # Servidor de herramientas MCP
  types/          # Definiciones de tipos TypeScript
scripts/          # Scripts de hooks (.mjs)
agents/           # Definiciones de agentes (.md)
skills/           # Definiciones de habilidades (think, do, route)
bridge/           # Punto de entrada CLI
tests/            # Suites de pruebas Vitest
```

## Licencia

MIT
