# プレゼンタイマー（AgendaTimer）

アジェンダ登録型・全画面プレゼンタイマーアプリ。Android をメインターゲットに、同一コードベースから iOS / Web へ展開する React Native モノレポ。

- 公式ドメイン: [presentation-timer.net](https://presentation-timer.net)
- 設計ドキュメント: [docs/](./docs/README.md)（背景・アーキテクチャ・データモデル・コアロジック等）

## 技術スタック

- **モノレポ管理**: pnpm workspace + Turborepo
- **モバイル (`apps/mobile`)**: Expo (SDK 54) + React Native + expo-router
- **Web (`apps/web`)**: React + Vite（大画面共有・管理用クライアント）
- **LP (`apps/lp`)**: React + Vite（プロダクトサイト）
- **共通ロジック (`packages/core-logic`)**: タイマー状態遷移・時間再配分アルゴリズム（UI 非依存の純粋関数）
- **状態管理 (`packages/store`)**: `apps/mobile` / `apps/web` で共有するタイマーストア
- **共通型 (`packages/types`)**: アジェンダ・タイマー状態の型定義
- **Lint / Format**: Biome
- **テスト**: Vitest

## ディレクトリ構成

```text
.
├── apps/
│   ├── mobile/    # Expo (React Native) アプリ [Android / iOS]
│   ├── web/       # Vite + React アプリ [Web]
│   └── lp/        # Vite + React 製ランディングページ
├── packages/
│   ├── core-logic/ # タイマー計算・時間再配分ロジック
│   ├── store/       # 共有タイマーストア
│   └── types/        # 共通型定義
└── docs/           # 設計ドキュメント（RFC）
```

## セットアップ

```sh
corepack enable
pnpm install
```

- Node.js `24`（CI と同一バージョン。`package.json` の `engines` は `>=20`）
- パッケージマネージャは `pnpm@11.6.0` に固定（`packageManager` フィールド参照）

## 開発コマンド

ルートから Turborepo 経由で全ワークスペースに対して実行する。

```sh
pnpm dev         # 各アプリの dev サーバーを起動
pnpm build       # 全ワークスペースをビルド
pnpm test        # 全ワークスペースのテスト（Vitest）
pnpm typecheck   # 全ワークスペースの型チェック
pnpm lint        # Biome lint
pnpm format      # Biome format（自動整形）
pnpm check       # Biome check（lint + format 検査）
pnpm check:fix   # Biome check の自動修正版
pnpm doctor      # react-doctor による診断
```

### 個別アプリの起動

```sh
pnpm --filter @presentation-timer/mobile dev      # Expo dev server
pnpm --filter @presentation-timer/mobile android   # Android 実機/エミュレータ
pnpm --filter @presentation-timer/mobile ios       # iOS シミュレータ
pnpm --filter @presentation-timer/web dev          # Web クライアント
pnpm --filter @presentation-timer/lp dev           # LP
```

## CI

`push` / `pull_request`（`main`, `develop` 対象）で以下を実行する（[`.github/workflows/ci.yml`](./.github/workflows/ci.yml)）。

- `lint`: `biome ci .`（lint + format 検査、無改変）
- `typecheck`: `pnpm typecheck`
- `test`: `pnpm test`

push 前のローカル検証は `pnpm lint` ではなく `pnpm exec biome ci .` を使うこと（`pnpm lint` は format 検査を含まない）。

## 既知の注意事項

- `apps/mobile/app.json` の `experiments.tsconfigPaths: false` は `typescript@7` 対応のための暫定回避。詳細は [CLAUDE.md](./CLAUDE.md) を参照。
