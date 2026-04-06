# OMI -- Oh My Intelligence

[English](README.md) | [한국어](README.ko.md) | [中文](README.zh.md) | 日本語 | [Español](README.es.md) | [Português](README.pt.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Tiếng Việt](README.vi.md)

```
  ___  __  __ ___
 / _ \|  \/  |_ _|
| | | | |\/| || |
| |_| | |  | || |
 \___/|_|  |_|___|

Think/Do マルチモデルオーケストレーション（Claude Code 向け）
Claudeが考える。Codexが実行する。OMIがルーティングする。
```

## OMI とは？

OMI は [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)（OMC）と [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)（OMX）の長所を統合した単一のオーケストレーション層です。

Claude は**設計、コードレビュー、デバッグ、テスト設計、アーキテクチャ**に優れています。Codex は**高速なコード生成、コスト効率の良い実装、DevOps**に優れています。OMI はタスクの種類に基づいて各タスクを最適なプロバイダに自動ルーティングするため、手動で切り替えることなく適切なツールを利用できます。

Codex がインストールされていない場合でも、すべて Claude だけで動作します——設定は不要です。

## Think/Doパラダイム

すべてのタスクは2つのレーンのいずれかに分類されます：

### Think Lane（Claude）

深い推論、分析、設計タスク。

| タスクの種類 | 例 |
|-------------|-----|
| 設計 | "plan the API architecture"、"design the database schema" |
| コードレビュー | "review this PR for security issues"、"audit the auth flow" |
| デバッグ | "debug why the login fails"、"trace the race condition" |
| テスト設計 | "what should we test?"、"design the test strategy" |
| セキュリティ | "check for vulnerabilities"、"audit trust boundaries" |
| ML 実験設計 | "compare these model architectures"、"design the fine-tuning experiment" |

### Do Lane（Codex または Claude フォールバック）

実装、実行、ファイル変更タスク。

| タスクの種類 | 例 |
|-------------|-----|
| 実装 | "implement the auth middleware"、"build the REST endpoint" |
| リファクタリング | "refactor the user module"、"extract the shared logic" |
| テスト作成 | "write tests for the user model"、"fix the failing test" |
| ビルド/修正 | "fix build error"、"fix lint warnings" |
| Git 操作 | "commit and push"、"merge the feature branch" |
| ML パイプライン | "train the model"、"run the preprocessing pipeline" |
| クイックフィックス | "rename the variable"、"fix the typo" |

## インストール

### 前提条件

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) がインストール済みであること
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)（OMC）プラグインがインストール済みであること（必須）
- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)（OMX）プラグインがインストール済みであること（任意、Codex 機能用）

### インストール

以下の2つの方法のいずれかを選択してください。

#### 方法 A：npm（推奨）

```bash
npm i -g oh-my-intelligence
```

その後、Claude Code 内で：

```
/setup
```

OMC/OMX を検出し、`.omi/` の状態を初期化し、Hook を設定します。

#### 方法 B：Claude Code マーケットプレイス

Claude Code 内で：

```
/plugin marketplace add https://github.com/YounghwanKil/oh-my-intelligence
/plugin install oh-my-intelligence
/reload-plugins
```

リロード後、セットアップを実行：

```
/setup
```

#### ソースからインストール

```bash
git clone https://github.com/YounghwanKil/oh-my-intelligence.git
cd oh-my-intelligence
npm install
npm run build
```

### 確認

Claude Code 内で：

```
/route
```

現在のルーティング状態、検出されたプロバイダ、アクティブなレーンを表示します。

### アップデート

**npm：**
```bash
npm i -g oh-my-intelligence@latest
```

**マーケットプレイス：**
```
/plugin marketplace update oh-my-intelligence
/reload-plugins
```

## クイックスタート

```
/think "review the auth architecture"    -> Claude が分析
/do "implement the login endpoint"       -> Codex が実装（または Claude フォールバック）
/autopilot "build a REST API"            -> Think(設計) -> Do(実装) -> Think(検証)
/route                                    -> ルーティング状態を表示
```

## コマンド

| コマンド | 説明 |
|---------|------|
| `/think <task>` | このタスクを Think Lane（Claude）に強制ルーティング |
| `/do <task>` | このタスクを Do Lane（Codex または Claude フォールバック）に強制ルーティング |
| `/route` | ルーティング状態と利用可能なプロバイダを表示 |
| `/autopilot` | ハイブリッド Think/Do パイプライン：設計、実装、検証、修正、レビュー |
| `/ralph` | 各イテレーションで Think/Do を切り替える永続ループ |
| `/team N:role` | Claude + Codex の混合ワーカー |

## エージェント（35）

### Think Lane（16 エージェント）

| エージェント | モデル | 役割 | ソース |
|-------------|--------|------|--------|
| analyst | opus | 要件分析、制約の発見 | OMC |
| planner | opus | タスクの順序付け、実行計画 | OMC |
| architect | opus | システム設計、インターフェース、トレードオフ | OMC |
| critic | opus | 計画/設計のギャップ分析、多角的レビュー | OMC |
| code-reviewer | opus | 包括的なコードレビュー、ロジック欠陥の検出 | OMC |
| security-reviewer | sonnet | セキュリティ脆弱性、信頼境界 | OMC |
| test-engineer | sonnet | テスト戦略、カバレッジ、TDD ワークフロー | OMC |
| designer | sonnet | UI/UX アーキテクチャ、インタラクション設計 | OMC |
| debugger | sonnet | 根本原因分析、スタックトレース | OMC |
| tracer | sonnet | 証拠に基づく因果関係の追跡 | OMC |
| qa-tester | sonnet | インタラクティブな CLI/サービス検証 | OMC |
| verifier | sonnet | 完了の検証、証拠の収集 | OMC |
| product-manager | opus | 戦略、優先順位、ロードマップ | OMX |
| quality-strategist | opus | 包括的な QA 戦略 | OMX |
| **ml-researcher** | **opus** | **ML/DL：論文、実験、パイプライン、モデル** | **OMI** |
| scientist | sonnet | 汎用データ分析、統計、EDA | OMC |

### Do Lane（12 エージェント）

| エージェント | モデル | 役割 | ソース |
|-------------|--------|------|--------|
| executor | sonnet | コード実装、リファクタリング | OMC |
| explore | haiku | 高速なコードベース検索と探索 | OMC/OMX |
| writer | haiku | ドキュメント、移行メモ | OMC |
| git-master | sonnet | Git 操作、コミット、履歴 | OMC |
| code-simplifier | sonnet | コードの簡素化、クリーンアップ | OMC |
| document-specialist | sonnet | 外部ドキュメント、API/SDK リファレンス | OMC |
| style-reviewer | fast | コードスタイルのフィードバック | OMX |
| researcher | fast | 軽量な調査 | OMX |
| api-reviewer | sonnet | API 設計レビュー | OMX |
| performance-reviewer | sonnet | パフォーマンス分析 | OMX |
| dependency-expert | sonnet | 依存関係管理 | OMX |
| ux-researcher | sonnet | UX リサーチ | OMX |

### ml-researcher（OMI ネイティブ）

Think Lane で動作する ML/DL リサーチスペシャリスト。ML ライフサイクル全体をカバーします：論文レビュー、実験設計、トレーニングパイプラインアーキテクチャ、モデル分析、量子化（GPTQ/AWQ/GGUF）、分散トレーニング（FSDP/DeepSpeed）、MLOps。統計、EDA、A/B テストを ML の観点なしに扱う汎用の `scientist` エージェントとは区別されます。

## 仕組み

### 自動ルーティング

OMI はキーワードパターンで各タスクを分類し、最適なプロバイダにルーティングします。Think タスクは深い推論のために Claude に送られます。Do タスクは高速実行のために Codex に送られます（Codex が利用できない場合は、Do に最適化されたプロンプトで Claude に送られます）。

デフォルトのレーンは Think（より安全）です。`/think` または `/do` で特定のレーンを強制指定できます。

### ハイブリッドワークフロー

`/autopilot` や `/ralph` などの複合ワークフローは、フェーズごとに Think と Do レーンを自動的に切り替えます：

| フェーズ | レーン | 実行内容 |
|---------|--------|----------|
| インタビュー | Think | 要件の明確化 |
| 設計 | Think | アプローチの設計 |
| 実装 | Do | コードの記述 |
| 検証 | Think | レビューとテスト |
| 修正 | Do | 問題の対処 |
| レビュー | Think | 最終品質チェック |

### Claude のみモード

OMI は Codex がインストールされていなくても完全に動作します。Codex が利用できない場合、Do タスクは `FallbackPromptSpec` を使用して Claude にルーティングされ、以下の処理が行われます：

- Codex 固有のツール参照を除去（`codex_run` -> `Bash`）
- OMX のポスチャを OMC エージェントにマッピング（`deep-worker` -> `executor`）
- Do に最適化されたシステムプロンプトを注入（分析よりも実行を優先）

### アーキテクチャ

OMI は薄いオーケストレーション層です：

- **OMI は OMC（必須）+ OMX（任意）をラップ**——置き換えることはありません
- **`.omc/` や `.omx/` を変更しない**——読み取りのみ（ADR-001a）
- **独自の状態は `.omi/` に保存**——ルーティング決定、プロバイダ検出、セッションデータ
- **Hook の順序に依存しない**——下流の消費者として OMC の状態を読み取り、Hook の実行順序に関係なく動作

## OMC および OMX との関係

### oh-my-claudecode（OMC）

- **必須**の依存関係
- Claude ネイティブのエージェント、スキル、MCP ツール（LSP、AST、Python REPL）を提供
- 19 エージェント、30 以上のスキル、18 以上の MCP ツール
- OMI は `.omc/` の状態を読み取るのみで、書き込みは行いません

### oh-my-codex（OMX）

- **任意**の依存関係
- Codex CLI 統合、Rust パフォーマンスクレート、通知システムを提供
- 33 エージェント、36 スキル、5 MCP サーバー
- インストール時、Do Lane は速度とコスト削減のために Codex にルーティング
- 未インストール時、すべて Claude のみで動作

### 共存の仕組み

- 3つの独立したプラグイン、それぞれ独自のディレクトリに配置
- OMI がオーケストレーション、OMC と OMX が実行
- 競合なし：OMI の Hook は下流の消費者として OMC/OMX の出力を読み取る
- 各プラグインは独立して進化を続ける

## 設定

### 状態ディレクトリ

```
.omi/
  state/
    router/
      current-decision.json    # 現在のルーティング決定
      hybrid-state.json        # アクティブなハイブリッドワークフロー状態
    providers/
      detected.json            # 検出されたプロバイダとバージョン
      version-warning.json     # バージョン互換性の警告
    sessions/
      current.json             # 現在のセッション状態
  plans/                       # 統一実行計画
  logs/                        # デバッグログ
```

### 環境変数

| 変数 | 説明 |
|------|------|
| `OMI_DEBUG` | Hook からの詳細なデバッグ出力を有効化 |
| `GEMINI_API_KEY` | 追加プロバイダとして Gemini を有効化 |

## 開発

```bash
npm install
npm run build
npm test
npm run check-vendored-types
```

### テストの実行

```bash
npx vitest run              # すべてのテストを一度実行
npx vitest                  # ウォッチモード
npx tsc --noEmit            # 型チェックのみ
```

### プロジェクト構造

```
src/
  router/         # タスク分類、プロバイダ選択、ハイブリッドフェーズ
  state/          # .omi/ 状態管理（統一、プロバイダ、セッション）
  interop/        # OMC/OMX ブリッジ、エージェント/スキルレジストリ
  config/         # 設定の読み込み、プロバイダ検出
  hud/            # HUD ルーティングインジケーター
  mcp/            # MCP ツールサーバー
  types/          # TypeScript 型定義
scripts/          # Hook スクリプト（.mjs）
agents/           # エージェント定義（.md）
skills/           # スキル定義（think、do、route）
bridge/           # CLI エントリポイント
tests/            # Vitest テストスイート
```

## ライセンス

MIT
