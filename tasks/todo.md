# todo: モノレポ基盤 + packages の最低限セットアップ

> スコープ: 「基盤＋packages のみ」。apps/* は今回作らない（docs/07 のロードマップに沿い後続フェーズ）。

## 計画

- [x] docs 確認（01〜07）と技術スタック把握（Turborepo + pnpm + TS）
- [x] スコープ確認（基盤＋packages のみ）
- [x] ルート基盤: `package.json` / `pnpm-workspace.yaml` / `turbo.json` / `tsconfig.base.json`
- [x] `packages/types`: docs/04 のデータモデルを共通型として定義
- [x] `packages/core-logic`: 純粋関数の骨組み（制御系・tick・セレクタ実装、再配分は TODO）
- [x] Vitest テスト基盤 + 状態遷移テスト
- [x] `pnpm install` → `typecheck` / `test` で検証（緑）

## スコープ外（次フェーズ）

- `redistribute` の proportional / fixed-end アルゴリズム実装（docs/05）
- `apps/mobile`（Expo）・`apps/web`（Vite）のスキャフォールド

## レビュー

- 生成物: ルート基盤4点 + `packages/types`（共通型）+ `packages/core-logic`（純粋関数 + テスト）。
- 依存: `core-logic → types` を `workspace:*` で接続。ビルドステップ無しのソース直参照（`moduleResolution: Bundler`）。
- 検証結果（`pnpm install` 済み, node v25.5.0 / pnpm 11.6.0）:
  - `pnpm run typecheck` → 2 パッケージ成功
  - `pnpm run test` → 12 tests passed（`turbo` で test 前に typecheck を強制）
- 留意点: pnpm 11 のビルドスクリプト承認で `esbuild`（vitest 依存）を `pnpm-workspace.yaml` の `allowBuilds` で許可済み。
- 未着手（意図的にスコープ外）: `redistribute` の再配分アルゴリズム本体、`apps/*` のスキャフォールド。
