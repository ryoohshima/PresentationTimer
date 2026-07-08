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

- [x] ブランチ作成（develop から）
- [x] apps/mobile/package.json: react/react-dom→18.3.1, @types/react→~18.3.12, expo-status-bar→~2.0.1, @babel/core→^7.26.0
- [x] pnpm install で lockfile 更新 → biome ci / typecheck / test
- [x] コミット・push・ドラフト PR 作成

## PR2: feature/agenda-edit-screen — 画面①（Closes #16 #17 #18 #19）

- [x] packages/store: 編集アクション（ADD/REMOVE/MOVE/UPDATE/TOGGLE_LOCK）+ テスト
- [x] packages/core-logic: timeFormat（formatMinSec）+ テスト（parseMinSec は分/秒を個別入力にしたため不要と判断し見送り）
- [x] apps/mobile: 依存追加（async-storage, gesture-handler, reanimated, draggable-flatlist）+ babel plugin
- [x] app/index.tsx: リスト表示・追加・削除・並べ替え・分:秒入力・空表示
- [x] hooks/useAgendaPersistence.ts: AsyncStorage 永続化・復元
- [x] 検証 → コミット・push・ドラフト PR 作成（ベース: PR1 ブランチ）

## PR3: feature/timer-run-screen — 画面②（Closes #20 #21 #22 #23 #24 #25）

- [x] packages/core-logic: getNextItem / getPaceLevel セレクタ + テスト
- [x] apps/mobile: expo-keep-awake 追加、hooks/useTimerTick.ts
- [x] app/timer.tsx: 特大表示・進捗バー色変化・操作系・次項目プレビュー・finished 表示
- [x] app.json: orientation を default に（縦/横対応）
- [x] 検証 → コミット・push・ドラフト PR 作成（ベース: PR2 ブランチ）

## PR4: chore/app-json-assets — メタ・アイコン（Closes #29）

- [x] プレースホルダ PNG 生成（icon / adaptive-icon / splash-icon、#2563eb）
- [x] app.json: icon / splash / adaptiveIcon 設定
- [x] 検証 → コミット・push・ドラフト PR 作成（ベース: PR3 ブランチ）

## 後処理

- [x] #26 クローズ（Biome 導入済み PR #37 を根拠にコメント）
- [x] #27 クローズ（ci.yml 有効化済みを根拠にコメント）
- [x] レビューセクション追記

## レビュー

- 成果物（スタック 4 ドラフト PR、ベース: develop → 順に積む）:
  - PR #60 `fix/expo-sdk52-deps`: react 18.3.1 / react-dom 18.3.1 / @types/react ~18.3.12 / expo-status-bar ~2.0.1 / @babel/core ^7.26.0 へ復元（typescript 6 は tsconfig の ignoreDeprecations で対応済みのため据え置き）
  - PR #61 `feature/agenda-edit-screen`: 画面①（#16 #17 #18 #19）。編集アクションは packages/store の reducer に追加し「新 items → loadAgenda 委譲」で totalPlannedSec 再計算を一元化。ドラッグは draggable-flatlist + gesture-handler ~2.20.2 + reanimated ~3.16.1（babel plugin 追加）。永続化は mobile 側 hook（AsyncStorage 1.23.1）
  - PR #62 `feature/timer-run-screen`: 画面②（#20〜#25）。tick は useTimerTick（running 中のみ setInterval）、色は core-logic の getPaceLevel（warning しきい値 0.8 を PACE_WARNING_RATE で一元定義）、keep awake は running 中のみマウントする子コンポーネント。orientation を default に変更（縦/横対応）
  - PR #63 `chore/app-json-assets`: #29。icon/splash/adaptiveIcon を配線し、Node zlib のみで生成した単色プレースホルダ PNG を配置（正式アセット差し替えは人手フォロー）
- Issue クローズ: #26（Biome 導入済み PR #37）、#27（ci.yml 有効化済み）をコメント付きクローズ
- 検証: 各 PR で biome ci / typecheck（5 workspace）/ test（最終 51 tests、新規 20 件）緑。PR2/PR3 は `expo export` で web/ios/android 3 バンドル生成成功を確認
- 対象外: needs-human（#28 #30 #31 #32）と Epic（#6〜#10）。実機挙動（ドラッグ・keep awake・視認性）は #28 でフォロー想定

---

# todo: Expo SDK 52 → 54 アップグレード

> 背景: Expo Go（実機）が自動更新で SDK 54 専用となり、SDK 52 の本プロジェクトを開けなくなった。
> 計画: ~/.claude/plans/expo-go-sdk-zany-bunny.md

- [x] ブランチ作成（chore/expo-sdk54、develop 起点）
- [x] expo install expo@^54.0.0 + expo install --fix で SDK 54 へ一括更新
- [x] react-native-worklets の追加確認（reanimated 4 要件）→ 手動追加（0.5.1）＋ babel plugin は babel-preset-expo の自動適用に切替
- [x] expo-doctor で整合チェック → 18/18 パス（metro watchFolders 修正・store の react 重複解消で対応）
- [x] app.json の edge-to-edge 等の追随確認 → doctor 指摘なし、変更不要
- [x] pnpm lint / typecheck / test → 全緑（typecheck は --force で再確認）
- [x] 動作確認 → expo export（web/android/ios 3 バンドル生成成功）＋ dev サーバーのバンドル配信 200 を確認。実機 Expo Go での並べ替え・タイマー操作は人手確認待ち
- [x] PR 作成（base: develop）→ PR #69（ドラフト）。CI（lint / typecheck / test / claude-review）全緑を確認済み（lint は Expo CLI の tsconfig 自動書き換えが整形不一致となり 1 回失敗 → biome format で修正）

## レビュー

- SDK 54 更新: expo ~54.0.35 / react-native 0.81.5 / react 19.1.0 / expo-router ~6.0.24 / reanimated ~4.1.7 / typescript ~5.9（expo install --fix の解決に従う）
- reanimated 4 対応: react-native-worklets 0.5.1 追加。babel.config.js の手動 plugin 指定は削除（babel-preset-expo が worklets plugin を自動適用、二重適用防止）
- react 重複解消: packages/store の peer 自動解決が react 19.2.7 をネスト配置し mobile(19.1.0) と二重化 → store の devDependencies に 19.1.0 を明示して dedupe（web の ^19.2.7 は不変）
- tsconfig: SDK 54 base が moduleResolution=bundler になったため ignoreDeprecations "6.0" を撤去。expo-env.d.ts は CLI 自動管理化で削除
- 残リスク: react-native-draggable-flatlist ^4.0.3 × reanimated 4 の実機ドラッグ挙動は未確認（Expo Go 実機での確認が必要。壊れていれば別イシューで代替検討）
