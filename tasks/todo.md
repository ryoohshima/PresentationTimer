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

---

# todo: 起票済み Issue の一括実装（スタック 4 PR）

> 目標: claude-code ラベルの実装対象 Issue（#16〜#25, #29）をスタック 4 PR で実装し、実装済みの #26/#27 はクローズコメントで対応する。
> needs-human（#28, #30, #31, #32）と Epic（#6〜#10）は対象外。

## PR1: fix/expo-sdk52-deps — 依存を Expo SDK 52 に整合

- [ ] ブランチ作成（develop から）
- [ ] apps/mobile/package.json: react/react-dom→18.3.1, @types/react→~18.3.12, expo-status-bar→~2.0.1, @babel/core→^7.26.0
- [ ] pnpm install で lockfile 更新 → biome ci / typecheck / test
- [ ] コミット・push・ドラフト PR 作成

## PR2: feature/agenda-edit-screen — 画面①（Closes #16 #17 #18 #19）

- [ ] packages/store: 編集アクション（ADD/REMOVE/MOVE/UPDATE/TOGGLE_LOCK）+ テスト
- [ ] packages/core-logic: timeFormat（formatMinSec/parseMinSec）+ テスト
- [ ] apps/mobile: 依存追加（async-storage, gesture-handler, reanimated, draggable-flatlist）+ babel plugin
- [ ] app/index.tsx: リスト表示・追加・削除・並べ替え・分:秒入力・空表示
- [ ] hooks/useAgendaPersistence.ts: AsyncStorage 永続化・復元
- [ ] 検証 → コミット・push・ドラフト PR 作成（ベース: PR1 ブランチ）

## PR3: feature/timer-run-screen — 画面②（Closes #20 #21 #22 #23 #24 #25）

- [ ] packages/core-logic: getNextItem / getPaceLevel セレクタ + テスト
- [ ] apps/mobile: expo-keep-awake 追加、hooks/useTimerTick.ts
- [ ] app/timer.tsx: 特大表示・進捗バー色変化・操作系・次項目プレビュー・finished 表示
- [ ] app.json: orientation を default に（縦/横対応）
- [ ] 検証 → コミット・push・ドラフト PR 作成（ベース: PR2 ブランチ）

## PR4: chore/app-json-assets — メタ・アイコン（Closes #29）

- [ ] プレースホルダ PNG 生成（icon / adaptive-icon / splash-icon、#2563eb）
- [ ] app.json: icon / splash / adaptiveIcon 設定
- [ ] 検証 → コミット・push・ドラフト PR 作成（ベース: PR3 ブランチ）

## 後処理

- [ ] #26 クローズ（Biome 導入済み PR #37 を根拠にコメント）
- [ ] #27 クローズ（ci.yml 有効化済みを根拠にコメント）
- [ ] レビューセクション追記

## レビュー

（完了後に記載）
