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
- `apps/mobile`（Expo）のスキャフォールド
- `apps/web` のタイマー画面・アジェンダ編集画面の実装（MVP 本体, docs/06）

## レビュー

- 生成物: ルート基盤4点 + `packages/types`（共通型）+ `packages/core-logic`（純粋関数 + テスト）。
- 依存: `core-logic → types` を `workspace:*` で接続。ビルドステップ無しのソース直参照（`moduleResolution: Bundler`）。
- 検証結果（`pnpm install` 済み, node v25.5.0 / pnpm 11.6.0）:
  - `pnpm run typecheck` → 2 パッケージ成功
  - `pnpm run test` → 12 tests passed（`turbo` で test 前に typecheck を強制）
- 留意点: pnpm 11 のビルドスクリプト承認で `esbuild`（vitest 依存）を `pnpm-workspace.yaml` の `allowBuilds` で許可済み。
- 未着手（意図的にスコープ外）: `redistribute` の再配分アルゴリズム本体、`apps/*` のスキャフォールド。

---

# todo: apps/web 最小雛形のセットアップ（フェーズ2）

> スコープ: 「起動する最小雛形のみ」。ユーザー選択により MVP の Android 先行ではなく、検証容易性を優先し `apps/web`（Vite + React）を先行スキャフォールド。タイマー画面等の MVP 本体は後続。

## 計画

- [x] 対象アプリ・作り込み度合いをユーザーに確認（→ `apps/web` / 起動する最小雛形のみ）
- [x] 公式 create-vite 現行構成を context7 で確認（Vite 8 / plugin-react 6 / React 19.2）
- [x] `apps/web` 雛形生成: `package.json` / `tsconfig.json` / `vite.config.ts` / `index.html` / `src/main.tsx` / `src/App.tsx`
- [x] workspace 組込み: `pnpm-workspace.yaml` に `apps/*`、`turbo.json` に `build`/`dev`、ルート `package.json` に `dev`/`build`
- [x] `pnpm install` → `typecheck` / `build` で検証（緑）
- [x] `pnpm --filter @agenda-timer/web dev` 起動 → ブラウザで描画確認

## レビュー

- 生成物: `apps/web`（Vite + React 19.2 の最小雛形）。`App.tsx` は `core-logic` の `start`/`getCurrentItem`/`getRemainingSec` を呼び、配線が通っていることを画面で示す。
- 技術判断:
  - TS は個別追加せずルート hoisted の `typescript@5.9`（`^5.7.0`）を共用（モノレポ整合）。`build` は `vite build` 単体とし型検証は `turbo run typecheck` に委譲。
  - `apps/web/tsconfig.json` は base を extends しつつ `lib` に DOM 系を追加・`jsx: react-jsx` を上書き（base は純粋ロジック用で DOM/JSX 非対応のため）。
  - ローカル import は既存慣習に合わせ `.js` 拡張子参照（`Bundler` 解決, `TS5097` 回避）。
- 検証結果（node v25.5.0 / pnpm 11.6.0）:
  - `pnpm typecheck` → 3 パッケージ成功
  - `pnpm build` → `vite v8.1.0` で 17 modules 変換・bundle 生成成功
  - `pnpm --filter @agenda-timer/web dev` → `http://localhost:5173/` 起動、ブラウザで「現在の項目: オープニング / 残り時間: 300 秒」を描画（core-logic がブラウザ上で実行されていることを確認）
- 未着手（意図的にスコープ外）: MVP のタイマー画面・アジェンダ編集画面（docs/06）、`redistribute` 本体、`apps/mobile`（Expo）。
