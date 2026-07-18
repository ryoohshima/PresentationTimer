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

---

# todo: アプリ全画面を design.pen へ書き起こし（2026-07-09）

## 計画

- [x] アプリ3画面（アジェンダ編集 / タイマー実行 / 設定）の実装・docs 調査
- [x] 方針確認（TEMPO トーン / タイマーは 1b ミニマル・ライト基準 / 状態バリエーション込み / 設定は docs 完成形）
- [x] 再利用コンポーネント作成（Toggle / LabelPill / PillButton / AppAgendaRow / AppTimerContent）
- [x] ① アジェンダ編集: 通常＋空状態（2フレーム）
- [x] ② タイマー実行: 余裕あり / 残りわずか / 超過 / 一時停止 / 終了（5フレーム）
- [x] ③ 設定: 再配分モード・終了時刻・通知/アラートの完成形（1フレーム）
- [x] export_html + Chrome で全セクションの視覚検証
- [x] Pencil で Cmd+S 保存後、worktree の design.pen へ再同期（2026-07-09 14:16 完了）

## レビュー

- 信号色は LP 凡例（#22C55E / #EAB308 / #EF4444）をバーに、可読性の高い濃色（#CA8A04 / #DC2626）を大型数字に使用。変数 accent-yellow / accent-red（+ -deep）として登録。
- タイマー5状態は AppTimerContent コンポーネント1つ＋ref の descendants 上書きで表現（LP の TimerMockContent と同型のパターン）。
- 既知の問題: Pencil MCP のスクリーンショット経路が新規サブツリーを描画しない（ライブエディタ表示・データは正常）。検証は export_html 経由で実施。
- 注意: Pencil アプリは main リポジトリ側 design.pen（feature/lp-design ブランチ）に保存する。worktree へは保存後にバイトコピーで同期する運用。

---

# todo: design.pen デザイン差分の解消（2026-07-15）

> 計画: ~/.claude/plans/pencil-mcp-design-pen-frolicking-pizza.md
> design.pen と apps/mobile 実装の突き合わせで見つかった 7 差分（②タイマー中心）を修正する。

## 計画

- [x] A-1: ② 残り時間の文字色を design 準拠へ（safe=ink / warning=accentYellowDeep / over=accentRedDeep）
- [x] A-2: ② ProgressFill を明色系（accentGreenBright / accentYellow / accentRed）へ
- [x] A-3: ② 押し/巻きラベルを中央揃えに
- [x] A-4: ② タイマー数字に letterSpacing -2
- [x] A-5: ① アジェンダ行の間隔 8 → 12
- [x] A-6: ① 「＋ 項目を追加」枠線 1 → 1.5
- [x] A-7: ① 空状態アイコンを clipboard-list 系へ
- [x] lint / typecheck / test 実行（lint exit 0 / typecheck 6 タスク / test 全緑）
- [x] 実画面での目視確認（expo web + Chrome DevTools MCP、①空状態と②running を確認）
- [x] コミット

## レビュー

- design.pen のペース配色は「小さい文字=深色系」「バー=明色系」「特大数字=平常時 ink」の 3 用途で、実装は深色系 1 写像に潰れていたのが根本原因。`paceColors.ts` に `PACE_BAR_COLORS` / `PACE_TIME_COLORS` を追加して用途別写像に分離した（コンポーネント側は写像の差し替えのみ）。
- 修正対象外として維持した近似: Space Grotesk / Noto Sans JP 未適用、影の blur 値差。コード内コメントで方針明示済み。
- 検証: pnpm lint / typecheck / test 全緑。expo start --web + Chrome DevTools MCP で ①（clipboard-list アイコン・枠線 1.5・開始 disabled）と ②（残り時間が黒・巻きラベル中央・バー明色緑）を目視確認。

## 追加対応（同日・ユーザー指摘）: 背景グラデとグラスモーフィズムの実装

- [x] 背景を design.pen 通りの放射グラデ3枚（#9EDDBB / #9CC9E8 / #EFDFA8 on #ECF2E9）へ。react-native-svg 15.12.1（SDK 54 対応版を bundledNativeModules.json で照合）の Ellipse + RadialGradient で実装、expo-linear-gradient は依存ごと除去
- [x] GlassCard / PillButton(secondary) に expo-blur ~15.0.8 の BlurView で実ブラー（background_blur 相当）を追加。web は intensity 100 = 20px が上限（design は 24px）
- [x] バグ修正: web では SVG id がドキュメント全体で共有されるため、スタック内の複数画面で `bg-blob-0` が衝突し ② 以降の画面で背景が描画されなかった → useId() でインスタンスごとに一意化
- [x] lint / typecheck / test 全緑。expo web で ①②③ すべて背景・ガラス質感を目視確認
- 留意: Android の BlurView はデフォルト非対応のため半透明フィルへ退化する（従来と同等の見た目）。実機で必要なら experimentalBlurMethod の検討を別途

## 追加対応（同日・ユーザー指摘 2）: 画面① の入力 UX をモーダル方式へ

> 指摘: 数字と分/秒ラベルが離れすぎ・入力可否が分かりづらい・タイトルも同様・追加ボタンが disabled に見える。
> ユーザー確認の上「モーダル入力方式 + design.pen 同期」を採用。

- [x] packages/store: ADD_ITEM / addItem に plannedSec を追加（モーダルから時間付きで新規追加するため）+ テスト
- [x] components/AgendaItemEditModal.tsx 新規: タイトル・分/秒入力・保存/追加ボタンのモーダル（白背景の入力欄で入力可否を明示、分/秒はラベル近接）
- [x] components/AgendaItemRow.tsx: 表示専用へ（タイトル + 「5分 00秒 ・固定」）。行タップで編集モーダル、ドラッグ/ロック/削除は行上のまま
- [x] app/index.tsx: モーダル配線（add/edit 両モード）。「＋ 項目を追加」ラベルを accentGreen/700 に変更（disabled 誤認の防止）
- [x] lint / typecheck / test 全緑（store 18 tests）。expo web で編集・追加フローを操作して確認
- [x] design.pen へ編集モーダルのデザイン追加（FokaP に EditModalCol: 暗転オーバーレイ + 項目編集モーダルカード）+ AddItemText を accent-green/700 へ同期。スクリーンショットでレイアウト崩れなしを確認
- [x] design.pen の Cmd+S 保存（ユーザー実施）→ worktree へバイトコピー同期（md5 一致確認済み）

---

# todo: ドラッグ並べ替えの自前実装への置き換え（2026-07-16）

> 背景: 画面①のドラッグ並べ替えが Web で動かない（draggable-flatlist × reanimated 4 / Web の非互換疑い、SDK 54 更新時の残リスクが顕在化）。
> 計画: ~/.claude/plans/sprightly-twirling-pixel.md — gesture-handler + reanimated による自前実装へ置き換え。

- [x] package.json から react-native-draggable-flatlist を削除
- [x] pnpm install で lockfile 更新
- [x] apps/mobile/hooks/useDragReorder.ts 新規作成
- [x] apps/mobile/components/DraggableRow.tsx 新規作成
- [x] apps/mobile/components/AgendaItemRow.tsx のハンドルを GestureDetector + Pan に差し替え
- [x] apps/mobile/app/index.tsx を ScrollView + DraggableRow に差し替え
- [x] apps/mobile/app/_layout.tsx のコメント修正
- [x] pnpm turbo run typecheck / test（全緑）+ biome ci（エラー 0、警告 15 は既存）
- [x] Web でドラッグ動作を実機確認（Chrome DevTools MCP）
- [x] コミット（機能実装と依存削除を分割、fix: / chore: プレフィックス）

## レビュー

- 成果物: `useDragReorder` フック（shared value 3 つ + JS 側 activeId、moveItem への委譲）＋ `DraggableRow`（Gesture.Pan 生成・行変位アニメーション・render prop）。store / types は無変更。ハンドルは長押し不要の即ドラッグ開始に変更。
- Web 検証（Chrome DevTools MCP、pointer イベント合成）: 下方向/上方向ドラッグで並べ替え成功、リロード後も AsyncStorage から復元、範囲外ドラッグは端へクランプ、微小ドラッグは無変化、項目追加/削除後のドラッグも正常、合計時間の再計算正確、コンソールエラーなし。
- 検証ハーネスの注意: 合成 PointerEvent は偽 pointerId のため RNGH の setPointerCapture が NotFoundError を出す（実マウスでは発生しない）。検証時は capture をスタブした。また evaluate 呼び出しを跨いでドラッグを保持するとフォーカス喪失でジェスチャーがキャンセルされる。
- 発見（既存問題・未修正）: ロック行（・固定）は Web でサフィックスが縦に折り返し、行高が非ロック行より約 20px 高い（82.5 vs 103）。rowOffset は単一 shared value（最後に onLayout した行の高さ）のため、行高が混在すると長距離ドラッグで移動先が 1 つずれる可能性がある。実測では 2 行ホップまで正確。根本対処はロック表示のレイアウト修正 or 行別高さ測定（v2 候補）。
- iOS / Android 実機・シミュレータでの確認は未実施（人手確認またはフォローアップ）。
- マージ対応（2026-07-18）: PR #84（画面①モーダル化）が develop へ先行マージされコンフリクト。develop の新 UI（表示専用行 + AgendaItemEditModal）を土台に、ドラッグ実装（GestureDetector ハンドル + DraggableRow + useDragReorder）を再適用して統合。行本体の長押しドラッグ（旧 onLongPress={drag}）はタップ編集と競合するため廃止し、ドラッグは ≡ ハンドルに一本化。
- 追加対応（2026-07-18・ユーザー提案）: 編集導線を「行タップ」→「鉛筆アイコン」へ変更。ドラッグ目的で行を触った際にタップ判定が成立して編集モーダルが誤爆する経路を排除し、行上の操作を明示的なアイコン（≡ / 鉛筆 / ロック / 削除）に 1:1 対応させた。Web 検証: 行タップ無反応・鉛筆でモーダル開閉・ドラッグ往復とも正常、コンソールエラーなし。design.pen の AppAgendaRow へ RowEditIcon（lucide pencil）を追加同期済み（Pencil 保存はユーザー実施、md5 一致でバイトコピー確認）。
