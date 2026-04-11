[English](README.md) | 한국어 | [中文](README.zh.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Português](README.pt.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md)

# oh-my-intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)와 [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)에서 탄생했습니다.
> 두 세계의 장점만 모아 — 하나로 통합.

**Claude가 생각합니다. Codex가 실행합니다. OMI가 라우팅합니다.**

Claude Code를 위한 Think/Do 멀티모델 오케스트레이션. 모든 작업을 최적의 프로바이더로 자동 라우팅합니다.

[빠른 시작](#빠른-시작) • [Think/Do 패러다임](#thinkdo-패러다임) • [명령어](#명령어) • [에이전트](#에이전트-35) • [아키텍처](#아키텍처)

---

## 왜 OMI인가?

Claude Code와 Codex CLI는 각각 뚜렷한 강점을 가지고 있습니다. 벤치마크가 이를 증명합니다:

| 역량 | Claude | Codex | 승자 |
|------|--------|-------|------|
| 설계 & 아키텍처 | Plan Mode, 인터랙티브 체크포인트 | 해당 없음 | Claude |
| 코드 리뷰 & 보안 | 월등히 높은 버그 탐지율 | 표준 | Claude |
| 테스트 작성 | 95% 커버리지, 91% 뮤테이션 킬 | 표준 | Claude |
| 속도 | ~200 tok/s | ~1,000 tok/s | Codex (5배) |
| 비용 효율 | 기준선 | 작업당 3-4배 저렴 | Codex |
| DevOps & CLI 작업 | 74.7% Terminal-Bench | 77.3% Terminal-Bench | Codex |

**OMI는 이 둘을 결합합니다.** Claude는 가장 잘하는 것(사고)을 담당하고, Codex는 가장 잘하는 것(실행)을 담당합니다. 작업을 설명하기만 하면 — OMI가 나머지를 알아서 처리합니다.

---

## 빠른 시작

### 사전 요구사항

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI 설치 (**필수**)
- [Codex CLI](https://github.com/openai/codex) 설치 (**필수** — `npm i -g @openai/codex`)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) (OMC) 플러그인 설치 (**필수**)
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) (OMX) 플러그인 설치 (**필수**)

### 설치

#### 방법 A: npm (권장)

```bash
npm i -g oh-my-intelligence@latest
```

그런 다음 프로젝트 루트에서 한 줄로 OMI + OMC + OMX를 전부 세팅:

```bash
omi setup --install-deps     # OMC + OMX 자동 설치 후 각 플러그인 setup까지 실행
# 또는 감지만:
omi setup
```

`--install-deps`는 `npm i -g oh-my-claude-sisyphus oh-my-codex`와 각 플러그인의 `setup`을 자동으로 돌려줍니다. 안전하게 감지만 하려면 플래그를 빼고 실행하세요.

> **`--install-deps` 주의사항**
> - 전역 `npm i -g`는 npm prefix에 쓰기 권한이 필요합니다. `EACCES`가 뜨면 `sudo`로 재실행하거나 사용자 홈에 prefix를 잡아두세요 (`npm config set prefix ~/.npm-global` 후 `$(npm config get prefix)/bin`이 `PATH`에 있어야 합니다).
> - 후속 `omc setup` / `omx setup`은 Claude Code 프로젝트 안에서 실행된다고 가정합니다. 플러그인 setup이 실패해도 OMI 자체 초기화는 그대로 끝나므로, 실패한 단계는 나중에 수동으로 다시 돌릴 수 있습니다.

그 후 같은 프로젝트를 Claude Code로 열면 OMI가 훅을 통해 `.omi/` 상태를 계속 갱신합니다. Claude Code 안에서는 `/route` 로 라우팅 상태 확인.

#### 방법 B: Claude Code 마켓플레이스

Claude Code 안에서:

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

리로드 후 Claude Code 세션을 시작하거나 다시 시작하세요. OMI가 세션 시작 시 OMC/OMX를 자동 감지하고 `.omi/`를 초기화합니다.

#### 방법 C: 소스에서 설치

기여자용 또는 최신 커밋을 쓰고 싶을 때:

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence.git
cd oh-my-intelligence
npm i -g .
omi setup --install-deps
```

### 빌드해 보기

```
autopilot: build a REST API with authentication
```

OMI가 자동으로 라우팅합니다: Claude가 아키텍처를 설계 → Codex가 코드를 구현 → Claude가 결과를 리뷰.

### 확인

Claude Code 안에서:

```
/route
```

현재 라우팅 상태, 감지된 프로바이더, 활성 레인을 표시합니다.

### 업데이트

**소스 설치:**
```bash
cd oh-my-intelligence
git pull
npm i -g .
```

**마켓플레이스:**
```
/plugin marketplace update oh-my-intelligence
/reload-plugins
```

---

## Think/Do 패러다임

모든 작업은 두 레인 중 하나를 통해 처리됩니다:

```
                    ┌──────────────────────────┐
                    │       사용자 요청          │
                    └────────────┬─────────────┘
                                 │
                          ┌──────▼───────┐
                          │ Intent Router │
                          │ (자동 라우팅)  │
                          └──┬───────┬───┘
                             │       │
                    ┌────────▼──┐  ┌─▼──────────┐
                    │  THINK    │  │    DO       │
                    │   레인    │  │   레인      │
                    │ (Claude)  │  │  (Codex)    │
                    └───────────┘  └────────────┘
```

### Think 레인 (Claude 우선)
**추론, 판단, 분석**이 필요한 작업:
- 설계 & 아키텍처 디자인
- 코드 리뷰 & 보안 감사
- 디버깅 & 근본 원인 분석
- 테스트 전략 & 설계
- ML 실험 설계
- 요구사항 분석

### Do 레인 (Codex 우선)
**속도, 실행, 대량 처리**가 필요한 작업:
- 코드 구현 & 리팩토링
- 테스트 작성 & 빌드 수정
- Git 작업 & 릴리스
- 문서 작성
- ML 파이프라인 실행
- 빠른 수정

### 오버라이드

```bash
/think "implement the auth middleware"   # Claude 강제 (구현 작업이라도)
/do "review the architecture"            # Codex 강제 (리뷰 작업이라도)
/route                                    # 현재 라우팅 상태 확인
```

### 하이브리드 워크플로우

복합 워크플로우는 단계별로 자동 전환됩니다:

```
/autopilot "build a REST API"

  Phase 1: 설계           → Think (Claude가 설계)
  Phase 2: 구현           → Do (Codex가 코딩)
  Phase 3: 검증           → Think (Claude가 리뷰)
  Phase 4: 수정 루프      → Do (Codex가 패치)
  Phase 5: 최종 리뷰      → Think (Claude가 승인)
```

---

## 명령어

| 명령어 | 설명 | 레인 |
|--------|------|------|
| `/think <task>` | Think 레인 강제 (Claude) | Think |
| `/do <task>` | Do 레인 강제 (Codex 또는 Claude 폴백) | Do |
| `/route` | 라우팅 상태 및 프로바이더 표시 | — |
| `/autopilot` | Think/Do 전환이 포함된 전체 파이프라인 | Hybrid |
| `/ralph` | 반복당 Think/Do 전환이 있는 지속 루프 | Hybrid |
| `/ultrawork` | 최대 병렬 Do 실행 | Do |
| `/team N:role` | Claude+Codex 혼합 워커 | Hybrid |
| `/ultraqa` | Think/Do를 활용한 테스트→수정 사이클 | Hybrid |
| `/deep-interview` | 소크라테스식 요구사항 수집 | Think |
| `/ralplan` | 합의 기반 설계 (Planner/Architect/Critic) | Think |

기존 OMC 스킬(`/oh-my-claudecode:*`)은 모두 변경 없이 그대로 사용할 수 있습니다.

### CLI (소스 설치 시 사용 가능)

소스에서 npm으로 설치한 경우(클론한 저장소 안에서 `npm i -g .`) 터미널에서 다음 명령어도 사용할 수 있습니다:

```bash
omi setup                 # OMC/OMX 감지, .omi/ 초기화
omi setup --install-deps  # OMC + OMX 전역 설치 후 setup 자동 실행
omi doctor    # 의존성 및 상태 확인
omi route     # 프로바이더 및 라우팅 상태 표시
omi version   # 버전 표시
```

> **참고:** 마켓플레이스로 설치한 경우 Claude Code 세션 시작 시 자동 초기화됩니다. Claude Code 안에서 `/route`로 상태를 확인하세요.

---

## 에이전트 (35)

### Think 레인 — 16개 에이전트 (Claude 우선)

| 에이전트 | 모델 | 역할 |
|----------|------|------|
| analyst | opus | 요구사항 분석, 제약조건 발견 |
| planner | opus | 작업 순서 결정, 실행 계획 |
| architect | opus | 시스템 설계, 인터페이스, 트레이드오프 |
| critic | opus | 설계/계획 갭 분석 |
| code-reviewer | opus | 종합 코드 리뷰 |
| security-reviewer | sonnet | 보안 취약점, 신뢰 경계 |
| test-engineer | sonnet | 테스트 전략, 커버리지, TDD |
| designer | sonnet | UI/UX 아키텍처 |
| debugger | sonnet | 근본 원인 분석 |
| tracer | sonnet | 증거 기반 인과 추적 |
| qa-tester | sonnet | 인터랙티브 CLI/서비스 검증 |
| verifier | sonnet | 완료 검증 |
| product-manager | opus | 전략, 우선순위, 로드맵 |
| quality-strategist | opus | 종합 QA 전략 |
| **ml-researcher** | **opus** | **ML/DL: 논문, 실험, 파이프라인, 모델** |
| scientist | sonnet | 일반 데이터 분석, 통계 |

### Do 레인 — 12개 에이전트 (Codex 우선)

| 에이전트 | 모델 | 역할 |
|----------|------|------|
| executor | sonnet | 코드 구현, 리팩토링 |
| explore | haiku | 빠른 코드베이스 탐색 |
| writer | haiku | 문서 작성, 마이그레이션 노트 |
| git-master | sonnet | Git 작업, 커밋 |
| code-simplifier | sonnet | 코드 단순화 |
| document-specialist | sonnet | 외부 문서, API 레퍼런스 |
| style-reviewer | fast | 코드 스타일 피드백 |
| researcher | fast | 경량 탐색 |
| api-reviewer | sonnet | API 설계 리뷰 |
| performance-reviewer | sonnet | 성능 분석 |
| dependency-expert | sonnet | 의존성 관리 |
| ux-researcher | sonnet | UX 리서치 |

### ml-researcher — 신규

풀스택 ML/DL 연구 에이전트. 다음을 처리합니다:
- 논문 리뷰 & 문헌 조사 (ArXiv, Semantic Scholar)
- 실험 설계 (하이퍼파라미터, 아키텍처, 어블레이션)
- 학습 파이프라인 (SFT, RLHF, DPO, 양자화, 분산 학습)
- 모델 분석 (메트릭, 로스 커브, 비교)

`scientist`(일반 데이터 분석)와 분리되어 있습니다. ML 작업 → ml-researcher. 통계/EDA → scientist.

---

## 폴백 모드

Claude Code와 Codex 모두 필수이지만, OMI는 우아한 성능 저하를 포함합니다. Codex가 일시적으로 사용 불가능한 경우:
- Do 작업이 자동으로 Claude로 폴백
- Claude가 Do 최적화 프롬프팅(FallbackPromptSpec)을 수신
- 모든 기능이 계속 작동 — Codex의 속도/비용 이점만 없을 뿐
- `/route` 표시: "Claude fallback active for Do tasks"

이를 통해 OMI는 작업 흐름을 절대 차단하지 않습니다.

---

## 아키텍처

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
  │  필수    │ │  files  │ │  선택    │
  └─────────┘ └─────────┘ └─────────┘
```

### 주요 설계 결정

- **얇은 오케스트레이션**: OMI는 OMC+OMX의 150K+ 라인을 ~6,000 라인으로 래핑
- **재작성보다 합성**: OMC와 OMX는 독립적으로 계속 출시
- **읽기 전용 브릿지**: OMI는 `.omc/`와 `.omx/`를 읽기만 하고 쓰지 않음
- **훅 순서 독립적**: 플러그인 로드 순서와 관계없이 동작 (ADR-001a)
- **버전 고정 스키마**: CI 드리프트 감지를 통한 벤더 타입 (ADR-003)

### OMC 및 OMX와의 관계

| 플러그인 | 역할 | 필수 여부 |
|----------|------|-----------|
| **oh-my-claudecode (OMC)** | Claude 네이티브 에이전트, 스킬, MCP 도구 (LSP, AST, Python REPL). 19개 에이전트, 30+ 스킬. | 예 |
| **oh-my-codex (OMX)** | Codex CLI 통합, Rust 성능 크레이트, 알림 시스템. 33개 에이전트, 36개 스킬. | 아니오 |
| **oh-my-intelligence (OMI)** | Think/Do 라우터, 하이브리드 워크플로우, 통합 상태. OMC와 OMX를 오케스트레이션. | — |

OMI는 OMC나 OMX를 대체하지 않습니다. 그 위에서 둘을 함께 동작하게 만듭니다.

---

## 설정

### 상태 디렉토리

```
.omi/
  state/
    router/          # 현재 라우팅 결정
    providers/       # 감지된 프로바이더 정보
    sessions/        # 세션 데이터
  plans/             # 통합 계획
  logs/              # 실행 로그
```

### 환경 변수

| 변수 | 설명 |
|------|------|
| `OMI_DEBUG` | 훅 디버그 로깅 활성화 |
| `DISABLE_OMI` | OMI 훅 완전 비활성화 |

---

## 개발

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence
cd oh-my-intelligence
npm install
npm run build
npm test                        # 74개 테스트
npm run check-vendored-types    # CI: 스키마 호환성 검증
```

---

## 라이선스

MIT
