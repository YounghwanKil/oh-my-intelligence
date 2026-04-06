[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Português](README.pt.md) | Français | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md) | [Русский](README.ru.md)

# oh-my-intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Issu de [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) et [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex).
> Le meilleur des deux mondes — unifié.

**Claude pense. Codex exécute. OMI route.**

Orchestration multi-modèle Think/Do pour Claude Code. Achemine automatiquement chaque tâche vers le meilleur fournisseur.

[Démarrage rapide](#démarrage-rapide) • [Paradigme Think/Do](#le-paradigme-thinkdo) • [Commandes](#commandes) • [Agents](#agents-35) • [Architecture](#architecture)

---

## Pourquoi OMI ?

Claude Code et Codex CLI ont chacun des forces évidentes. Les benchmarks le confirment :

| Capacité | Claude | Codex | Gagnant |
|-----------|--------|-------|--------|
| Planification et architecture | Plan Mode, points de contrôle interactifs | Pas d'équivalent | Claude |
| Revue de code et sécurité | Détection de bugs nettement supérieure | Standard | Claude |
| Écriture de tests | 95% de couverture, 91% de mutation kill | Standard | Claude |
| Vitesse | ~200 tok/s | ~1 000 tok/s | Codex (5x) |
| Rapport coût-efficacité | Référence | 3-4x moins cher par tâche | Codex |
| DevOps et tâches CLI | 74,7% Terminal-Bench | 77,3% Terminal-Bench | Codex |

**OMI les combine.** Claude gère ce qu'il fait le mieux (réfléchir). Codex gère ce qu'il fait le mieux (exécuter). Vous décrivez simplement votre tâche — OMI s'occupe du reste.

---

## Démarrage rapide

### Prérequis

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installé (**requis**)
- [Codex CLI](https://github.com/openai/codex) installé (**requis** — `npm i -g @openai/codex`)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) plugin installé (**requis**)
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) plugin installé (**requis**)

### Installation

Choisissez l'une des deux méthodes ci-dessous.

#### Option A : npm (recommandé)

```bash
npm i -g oh-my-intelligence
```

Puis dans Claude Code :

```
/setup
```

Détecte OMC/OMX, initialise l'état `.omi/` et configure les hooks.

#### Option B : Claude Code Marketplace

Dans Claude Code :

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

Après le rechargement, lancez la configuration :

```
/setup
```

### Construisez quelque chose

```
autopilot: build a REST API with authentication
```

OMI achemine automatiquement : Claude planifie l'architecture → Codex implémente le code → Claude revoit le résultat.

### Vérification

Dans Claude Code :

```
/route
```

Affiche l'état du routage actuel, les fournisseurs détectés et les voies actives.

### Mise à jour

**npm :**
```bash
npm i -g oh-my-intelligence@latest
```

**Marketplace :**
```
/plugin marketplace update oh-my-intelligence
/reload-plugins
```

---

## Le paradigme Think/Do

Chaque tâche passe par l'une des deux voies :

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

### Think Lane (Claude de préférence)
Pour les tâches nécessitant **raisonnement, jugement et analyse** :
- Planification et conception d'architecture
- Revue de code et audit de sécurité
- Débogage et analyse de cause racine
- Stratégie et conception de tests
- Conception d'expériences ML
- Analyse des exigences

### Do Lane (Codex de préférence)
Pour les tâches nécessitant **vitesse, exécution et volume** :
- Implémentation et refactoring de code
- Écriture de tests et correction de builds
- Opérations Git et releases
- Rédaction de documentation
- Exécution de pipelines ML
- Corrections rapides

### Forcer une voie

```bash
/think "implement the auth middleware"   # Forcer Claude (même pour l'implémentation)
/do "review the architecture"            # Forcer Codex (même pour la revue)
/route                                    # Afficher l'état actuel du routage
```

### Flux de travail hybrides

Les flux composites changent automatiquement de voie par phase :

```
/autopilot "build a REST API"

  Phase 1: Planning         → Think (Claude planifie)
  Phase 2: Implementation   → Do (Codex code)
  Phase 3: Verification     → Think (Claude revoit)
  Phase 4: Fix Loop         → Do (Codex corrige)
  Phase 5: Final Review     → Think (Claude approuve)
```

---

## Commandes

| Commande | Description | Voie |
|---------|-------------|------|
| `/think <task>` | Forcer Think Lane (Claude) | Think |
| `/do <task>` | Forcer Do Lane (Codex ou fallback Claude) | Do |
| `/route` | Afficher l'état du routage et les fournisseurs | — |
| `/autopilot` | Pipeline complet avec alternance Think/Do | Hybride |
| `/ralph` | Boucle de persistance avec Think/Do par itération | Hybride |
| `/ultrawork` | Exécution parallèle maximale en Do | Do |
| `/team N:role` | Workers mixtes Claude+Codex | Hybride |
| `/ultraqa` | Cycle Test→Fix avec Think/Do | Hybride |
| `/deep-interview` | Recueil d'exigences socratique | Think |
| `/ralplan` | Planification par consensus (Planner/Architect/Critic) | Think |

Toutes les compétences OMC existantes (`/oh-my-claudecode:*`) continuent de fonctionner sans changement.

### CLI (installation npm uniquement)

Si vous avez installé via npm (`npm i -g oh-my-intelligence`), ces commandes terminal sont également disponibles :

```bash
omi setup     # Détecter OMC/OMX, initialiser .omi/
omi doctor    # Vérifier les dépendances et l'état
omi route     # Afficher les fournisseurs et l'état du routage
omi version   # Afficher la version
```

> **Note :** Les installations via Marketplace utilisent `/setup` et `/route` dans Claude Code.

---

## Agents (35)

### Think Lane — 16 agents (Claude de préférence)

| Agent | Modèle | Rôle |
|-------|-------|------|
| analyst | opus | Analyse des exigences, découverte de contraintes |
| planner | opus | Séquençage des tâches, plans d'exécution |
| architect | opus | Conception système, interfaces, compromis |
| critic | opus | Analyse des lacunes de plan/conception |
| code-reviewer | opus | Revue de code complète |
| security-reviewer | sonnet | Vulnérabilités de sécurité, frontières de confiance |
| test-engineer | sonnet | Stratégie de tests, couverture, TDD |
| designer | sonnet | Architecture UI/UX |
| debugger | sonnet | Analyse de cause racine |
| tracer | sonnet | Traçage causal basé sur les preuves |
| qa-tester | sonnet | Validation interactive CLI/service |
| verifier | sonnet | Vérification de complétion |
| product-manager | opus | Stratégie, priorités, feuille de route |
| quality-strategist | opus | Stratégie QA complète |
| **ml-researcher** | **opus** | **ML/DL : articles, expériences, pipelines, modèles** |
| scientist | sonnet | Analyse de données générale, statistiques |

### Do Lane — 12 agents (Codex de préférence)

| Agent | Modèle | Rôle |
|-------|-------|------|
| executor | sonnet | Implémentation de code, refactoring |
| explore | haiku | Recherche rapide dans le codebase |
| writer | haiku | Documentation, notes de migration |
| git-master | sonnet | Opérations Git, commits |
| code-simplifier | sonnet | Simplification de code |
| document-specialist | sonnet | Documentation externe, référence API |
| style-reviewer | fast | Retours sur le style de code |
| researcher | fast | Exploration légère |
| api-reviewer | sonnet | Revue de conception d'API |
| performance-reviewer | sonnet | Analyse de performance |
| dependency-expert | sonnet | Gestion des dépendances |
| ux-researcher | sonnet | Recherche UX |

### ml-researcher — NOUVEAU

Agent de recherche ML/DL full-stack. Gère :
- Revue d'articles et veille bibliographique (ArXiv, Semantic Scholar)
- Conception d'expériences (hyperparamètres, architectures, ablations)
- Pipelines d'entraînement (SFT, RLHF, DPO, quantization, entraînement distribué)
- Analyse de modèles (métriques, courbes de perte, comparaisons)

Distinct de `scientist` (analyse de données générale). Tâches ML → ml-researcher. Statistiques/EDA → scientist.

---

## Mode Claude uniquement

**OMI fonctionne sans Codex.** Lorsque OMX n'est pas installé :
- Toutes les tâches Do sont automatiquement redirigées vers Claude
- Claude reçoit un prompting optimisé Do (FallbackPromptSpec)
- Toutes les fonctionnalités marchent — vous ne bénéficiez simplement pas des avantages de vitesse/coût de Codex
- `omi doctor` affiche : "Claude fallback active for Do tasks"

C'est voulu ainsi. Codex est un accélérateur, jamais une exigence.

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

### Décisions de conception clés

- **Orchestration légère** : OMI est environ 6 000 lignes encapsulant 150K+ lignes d'OMC+OMX
- **Composition plutôt que réécriture** : OMC et OMX continuent d'évoluer indépendamment
- **Bridges en lecture seule** : OMI lit `.omc/` et `.omx/` mais n'y écrit jamais
- **Indépendant de l'ordre des hooks** : Fonctionne quel que soit l'ordre de chargement des plugins (ADR-001a)
- **Schémas versionnés** : Types vendorisés avec détection de dérive CI (ADR-003)

### Relation avec OMC et OMX

| Plugin | Rôle | Requis ? |
|--------|------|-----------|
| **oh-my-claudecode (OMC)** | Agents natifs Claude, compétences, outils MCP (LSP, AST, Python REPL). 19 agents, 30+ compétences. | Oui |
| **oh-my-codex (OMX)** | Intégration Codex CLI, crates de performance Rust, système de notifications. 33 agents, 36 compétences. | Non |
| **oh-my-intelligence (OMI)** | Routeur Think/Do, flux hybrides, état unifié. Orchestre OMC et OMX. | — |

OMI ne remplace ni OMC ni OMX. Il se place au-dessus et les fait travailler ensemble.

---

## Configuration

### Répertoire d'état

```
.omi/
  state/
    router/          # Current routing decisions
    providers/       # Detected provider info
    sessions/        # Session data
  plans/             # Unified plans
  logs/              # Execution logs
```

### Variables d'environnement

| Variable | Description |
|----------|-------------|
| `OMI_DEBUG` | Activer les logs de débogage pour les hooks |
| `DISABLE_OMI` | Désactiver entièrement les hooks OMI |

---

## Développement

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence
cd oh-my-intelligence
npm install
npm run build
npm test                        # 68 tests
npm run check-vendored-types    # CI: verify schema compatibility
```

---

## Licence

MIT
