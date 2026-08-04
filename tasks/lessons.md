# Lessons（自己改善ログ）

ユーザーから修正・指摘を受けたパターンと、再発防止ルールを記録する。

## 2026-07-15 ローカル lint と CI の検査範囲差で push 後に CI が落ちる

### 8. push 前の検証は CI と同じコマンド（`biome ci .`）で行う
- **何があったか**: PR #84 で CI の lint ジョブが失敗。ローカルでは `pnpm lint` が exit 0 だったが、ルートの `lint` スクリプトは `biome lint .`（lint 規則のみ）で、CI は `biome ci .`（lint + **format 検査**）を実行していた。新規作成した `AgendaItemEditModal.tsx` の整形差分（1 行に収まる JSX を複数行で記述）が CI でのみ検出された。
- **ルール**: このリポジトリで push / PR 作成の前は `pnpm lint` ではなく **`pnpm exec biome ci .`** で検証する。`pnpm lint` の成功は format 検査の成功を意味しない。新規ファイル作成時は `biome format --write <file>` を通してからコミットすると安全。

## 2026-06-27 CI・Linter/Formatter セットアップ

### 1. 既存の「明示値」を勝手に別値へ変更しない
- **何があったか**: 雛形 `ci.yml.example` の `node-version: 24` を、計画段階で `engines: ">=20"` に寄せて `20` に下げた。だがユーザーの意図は **24 のまま**だった。
- **ルール**: 既存ファイルに明示された設定値（Node バージョン等）は尊重する。整合性を理由に下げる/変える場合も、必ず理由とともにユーザーへ選択肢を提示してから変更する。`engines: ">=20"` は 24 を包含するため、そもそも 24 と矛盾しなかった点を見落とさない。

### 2. 設定内の人名・アカウント識別子は実値と照合する
- **何があったか**: `CODEOWNERS` と `README.md` が `@Ryo-Ohshima`（ハイフンあり）になっていたが、正しい GitHub username は `ryoohshima`（ハイフンなし）だった。GitHub username は大文字小文字は無視されるが **ハイフンの有無は別アカウント**を指す。
- **ルール**: CODEOWNERS 等にハードコードされたアカウント名は、`git config user` やセッションの Git user 情報と照合し、不一致を疑う。テンプレート由来の値を鵜呑みにしない。

### 3. shell 複合コマンドの `cd` は後続コマンドにも持続する
- **何があったか**: `cd A && find ...` の後、改行して書いた 2 つ目の `find`（B を見るつもり）も cwd が A のまま実行され、ディレクトリ比較が「完全一致」と誤判定された。
- **ルール**: 複数ディレクトリを比較・走査するときは、各操作をサブシェルで隔離する（`( cd X; ... )`）か、絶対パスを直接 `find <abs>` に渡す。1 コマンド内で `cd` を跨いだ相対パス操作をしない。

## 2026-07-04 dependabot × Expo SDK バージョン整合

### 4. CI 失敗は「落ちたステップ」ではなく「共通の前段」を疑う
- **何があったか**: PR #45 で lint/typecheck/test が3つとも FAILURE だったが、真の失敗はどのジョブの本体でもなく、全ジョブ共通の `pnpm install --frozen-lockfile`（pnpm 11 の minimumReleaseAge 検証）だった。
- **ルール**: 複数ジョブが同時に落ちたら、まず各ジョブの共通前段（依存インストール・セットアップ）を最初に確認する。個別ジョブの本体ログから読み始めない。

### 5. Expo / React Native は SDK 単位で揃える。dependabot の個別 bump を鵜呑みにしない
- **何があったか**: dependabot が `@expo/metro-runtime` を `~4.0.1`（SDK 52 用）→ `~57.0.3`（SDK 57 用）へ bump。だが `apps/mobile` は Expo SDK 52（`expo ~52.0.0` / `react-native 0.76.3` / `expo-router ~4.0.22`）であり、SDK を跨いだ単体 bump は破壊的非互換だった。同根で PR #48 の expo-status-bar 56 も既に develop へ混入済み。
- **ルール**: Expo/RN 系パッケージのバージョン変更を見たら、まず `apps/mobile` の `expo` バージョン（= SDK）と整合するか照合する。dependabot の「最新」は SDK 整合を保証しない。SDK 更新は `expo install` / `expo-doctor` で一括手動実施し、dependabot では該当パッケージ群を `ignore` する。
- **設定の在り処**: dependabot は**デフォルトブランチの `.github/dependabot.yml` のみ**を読む。ignore ルールは対象 PR のブランチではなく develop へ入れねば効かない。
- **却下手順**: 不整合な dependabot PR は `@dependabot ignore this dependency` コメントでクローズ＋再提案抑止できる（本件は PR #45 で実施、#51 で ignore ルール恒久化）。

## 2026-07-05 minimumReleaseAge 違反は時間経過で自己解消する

### 6. MINIMUM_RELEASE_AGE 違反はコード修正ではなく「時刻」を確認して再実行で直す
- **何があったか**: PR #56（turbo 2.10.3）の CI が `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` で失敗。パッケージ公開が 2026-07-03T16:49Z、CI 実行が 2026-07-04T13:38Z で、24 時間の閾値に約 3 時間届かなかっただけだった。調査時点（07-05）には閾値を超えており、`gh run rerun <run-id> --failed` の再実行のみで全ジョブ成功した。
- **ルール**: このエラーを見たら、まずログの「published at」と「cutoff」の時刻差を計算する。既に閾値を超えていれば lockfile 再生成やポリシー緩和は行わず、失敗 run の再実行だけで解消する。閾値未達なら経過を待ってから再実行する。ポリシー自体は供給網防御として妥当なので緩めない。
- **構造的背景**: dependabot はリリース直後に PR を作るため、pnpm 11 の minimumReleaseAge（既定 24h）と常に競合し得る。恒久対策は `.github/dependabot.yml` の `cooldown` 設定（別イシュー候補）。

## 2026-07-14 `expo install` 自体もSDKと不整合なバージョンを提案することがある

### 7. `expo install` の出力を鵜呑みにせず bundledNativeModules.json と照合する
- **何があったか**: `apps/mobile`（Expo SDK 54, `expo ~54.0.35`）で `npx expo install expo-linear-gradient` を実行したところ、CLI は「SDK 52.0.0 compatible native module」と表示し `expo-linear-gradient@~14.0.2`（SDK 52 用）を追加した。`node_modules/expo/bundledNativeModules.json` を見ると SDK 54 の正しい対応バージョンは `~15.0.8` だった。
- **ルール**: `expo install` の完了メッセージに表示される「SDK x.x.x compatible」の行を必ず確認する。プロジェクトの `expo` バージョン（= SDK）と一致しない場合は、インストール結果を鵜呑みにせず `node_modules/expo/bundledNativeModules.json` の対応バージョンで `pnpm add <pkg>@<正しいrange>` により手動修正する。[[dependabot-expo-sdk-mismatch]] と同根の問題であり、dependabot だけでなく `expo install` 自体もこの種の不整合を起こし得る。
- **副次的発見（未修正のまま残置）**: 同じ調査中、`apps/mobile` は PR #65（`@babel/core` 7.29.7→8.0.1 bump）以降、`react-native-worklets`/`react-native-gesture-handler` の Babel プラグインが `Requires Babel "^7.0.0-0", but was loaded with "8.0.1"` で例外を投げ、`expo start --web` のバンドルが**常に失敗する**状態になっている（`git stash` で変更前のコードに戻しても同じエラーが再現することを確認済み＝本セッションの変更とは無関係の既存バグ）。UI 修正タスクのスコープ外のため意図的に未修正。次にこのリポジトリに触るときは、`@babel/core` を `^7.26.0` 系へ戻すか worklets 側の対応を待つ必要がある。

## 2026-07-18 dependabot ignore の「前提コメント」が SDK 更新で陳腐化し穴になる

### 9. ignore ルールの前提条件は SDK / メジャー更新のたびに見直す
- **何があったか**: dependabot.yml の ignore コメントに「react / react-dom は web(^19)/mobile(18.3.1) で要求が割れるため、あえて対象に含めない」とあった。これは SDK 52 時代（mobile が react 18.3.1）の判断だが、SDK 54 化（#69）で mobile も react 19.1.0 厳密固定が必要になった。ignore に入っていなかったため dependabot（PR #67/#68）が react を 19.2.7 へ個別 bump し、`react(19.2.7) ≠ react-native-renderer(19.1.0)` の厳密一致違反で Android 起動不能になった。
- **ルール**: Expo SDK 更新など前提が変わる作業をしたら、dependabot.yml の ignore ルールと**そのコメントに書かれた前提**を必ず読み直し、陳腐化していれば同じ PR で更新する。「ignore に入っていない＝安全に bump できる」ではない。
- **恒久対応**: react / react-dom / @types/react / @types/react-dom を pnpm catalog（pnpm-workspace.yaml）で一元管理し、dependabot ignore にも追加した。SDK 更新時は bundledNativeModules.json の値に合わせて catalog を 1 箇所書き換える。
- **副次の学び**: pnpm は文脈に無い peer 依存を最新版で自動解決する（今回 expo-router→vaul の peer @types/react-dom が 19.2.3 に）。`nodeLinker: hoisted` ではこれがトップレベルを占有し catalog 版を覆い隠すため、間接依存の型パッケージは `overrides` でも固定する必要がある。`pnpm peers check` が検知手段。

## 2026-07-19 透過色の修正を Web だけで検証し Android の見え方差を見落とす

### 10. 色・影・透過の修正は「報告されたプラットフォーム」で検証する（Web 検証は Android の代わりにならない）
- **何があったか**: モーダルの半透明背景（`#FFFFFFF2`）が暗いスクリムを透かしてグレーに見える問題を不透明白へ修正し、Expo web ＋ Chrome DevTools のスクリーンショットと computed style で「完了」と報告した。だがユーザーの観測環境は Android 実機であり、「Web では問題ないがネイティブでは差分が残る」との指摘を受けた。
- **原因**: RN の合成はプラットフォーム依存である。(1) CSS の外側 box-shadow は border-box 内側にクリップされ半透明要素を透けないが、Android の `elevation` 影は View の背後に描画され**半透明背景を透けて中身を濁らせる**。(2) Android は backdrop blur 非対応で、本リポジトリは PR #91 で BlurView を非描画にしているため、Web/iOS で blur+tint により白く補正される面が Android では補正されない。
- **ルール**: 色・影・透過に関わる修正では、issue/フィードバックの発生プラットフォームを最初に確認し、そのプラットフォームで検証するまで完了と報告しない。検証環境が手元に無い場合（Android SDK 不在等）は「Web でのみ検証済み。Android は未検証」と明示し、実機スクリーンショットでの裏取りをユーザーに依頼する。
- **副次ルール**: worktree 内の未コミット修正は、ユーザーが別 checkout から起動した実機/開発サーバーには反映されていない。報告前に「ユーザーの実行環境がこの修正を含むコードを指しているか」を確認する（今回は AskUserQuestion で確認し、worktree 起動・モーダルで差分残存と判明）。

## 2026-07-26 依存更新で壊れた下流ツールに対し、公式フラグを探さずダウングレードを推した

### 11. ダウングレードを推す前に、消費側の「公式エスケープハッチ」を実装まで読んで探す
- **何があったか**: Issue #96 の調査中、`typescript` 7.0.2 が `expo start` を全プラットフォームで起動不能にしていることを発見した（TS 7.0 は公開コンパイラ API を持たず `ts.sys` が undefined、`@expo/cli` の `evaluateTsConfig()` がそれを参照して落ちる）。拙者は「TS を `~5.9.2` へ戻す」を推奨案として提示したが、ユーザーから「TS がアップグレードしたら、それに合わせていく方が健全」との方針を示された。その後に実装を読み直した結果、`app.json` に `experiments: { tsconfigPaths: false }` を足すだけで TS 7 を維持したまま起動することが判明し、対照実験でも裏付けが取れた。ダウングレードも pnpm patch も不要だった。
- **原因**: 「壊れた ＝ バージョンを戻す」と短絡し、**壊れている呼び出しが消費側でフラグにガードされていないか**を確認しなかった。実際 `withMetroMultiPlatform.js:732` は `if (isTsconfigPathsEnabled)` で囲まれており、これは `exp.experiments?.tsconfigPaths ?? true` で外から制御できた。
- **ルール**: 依存の更新で下流ツールが壊れたら、次の順で調べてから提案する。(1) 消費側の実装を読み、該当機能を切る公式フラグ・設定が無いか探す。(2) upstream の Issue/PR と最新版の実装を確認し、解消済みなら更新で追随する。(3) それでも塞がらない場合に限りパッチや据え置きを提案し、必ず「外す条件」を添える。(1) を飛ばして (3) を推すと不要な後退を勧めることになる。
- **副次の学び**: 最新版の実装を読むと原因の寿命が分かる。`@expo/cli@57.0.10` では `ts.sys` 参照自体が消えており、SDK 57 系へ上げればフラグは不要になる。「いつ外せるか」を言えるかどうかで、一時措置が負債になるか否かが決まる。
- **注意**: `expo/expo-cli` リポジトリ（2024-01-18 アーカイブ）はレガシーのグローバル CLI であり、現行の `@expo/cli` は `expo/expo` モノレポの `packages/@expo/cli` で活発に開発されている。アーカイブを見て「メンテされていない」と早合点しないこと。

## 2026-07-31 下限クランプが意図しない方向（引き上げ）にも効き、短時間項目の再配分が壊れていた

### 12. クランプを入れたら「効いてよい方向」を明示し、しきい値未満の境界値でテストする
- **何があったか**: 巻き状態で「次へ」を押すと、次項目の残り時間が「30秒」と表示されるバグ報告を受けた（項目1=10秒を5秒で確定→項目2は 5+5=10秒になるべきところ 30秒）。原因は `redistribute` の `Math.max(MIN_ALLOCATED_SEC, …)` が無条件に適用され、もともと割当が 30 秒未満の項目を 30 秒へ**引き上げて**いたこと。下限の設計意図（docs/05）は「圧縮でゼロ／マイナスにしない」であり、増加方向への適用は意図外だった。
- **原因**: クランプ実装時に「圧縮しすぎ防止」だけを考え、**下限がしきい値未満の初期値を持つ項目に対して逆方向（引き上げ）に発火する**ケースを見落とした。既存テストのアジェンダはすべて 60〜300 秒でしきい値（30 秒）を上回っており、しきい値未満の境界値ケースが 1 件も無かったため検出できなかった。
- **ルール**: 下限/上限クランプ（`Math.max`/`Math.min`/clamp）を書いたら、(1) そのクランプが効いてよいのは増加・減少どちらの方向かをコメントで明示し、必要なら `min(しきい値, 現在値)` のように現在値でガードする。(2) テストデータには必ず「しきい値未満の初期値」を含め、クランプが意図しない方向に発火しないことを検証する。定数（MIN_XXX）を導入したら、その定数を下回る入力のテストをセットで書く。
- **関連ファイル**: `packages/core-logic/src/timerEngine.ts`（redistribute）、`packages/core-logic/src/timerEngine.test.ts`

## 2026-07-31 既存コードの `!` 記法を踏襲して lint 警告を増やした

### 13. 新規コードは「既存ファイルの慣習」より「linter のルール」を優先する
- **何があったか**: `timerEngine.test.ts` へテストを追加する際、既存テストの `agenda[1]!.allocatedSec` という非 null アサーション記法に合わせて書いた。だが同記法は biome の `lint/style/noNonNullAssertion` 警告の発生源であり、追加分だけ警告が増えた。`biome ci .` は警告があっても exit 0 のため、「exit code 確認済み＝クリーン」と誤認していた。ユーザーから warn の指摘を受け、ファイル全体（19 箇所）を `?.` へ一括置換した。
- **ルール**: 既存ファイルの記法に合わせる際は、その記法が lint 警告の発生源でないかを先に確認する（警告源なら linter の提案する記法で書く）。push 前の検証では exit code だけでなく、**自分が触ったファイルに警告が出ていないか**を `biome ci <触ったファイル>` で個別確認する。警告の総数が「既存由来」でも、自分の追加分が混ざっていれば増分は自分の責任である。
- **副次の学び**: `biome lint --only=style/<rule> --write --unsafe <file>` でルール単位の一括自動修正ができる。テストの `expect(x!.prop)` は `expect(x?.prop)` へ置換しても、undefined なら `toBe` が失敗するため検証力は落ちない。
- **追記（同日）**: biome の `--unsafe` 修正は文字どおり型安全でない。`expect(x!.prop)` のような検証位置は `?.` で無害だが、**算術・代入の途中の `!`**（`x!.a + y` / `prop: x!.a`）が `?.` になると `number | undefined` が流出し typecheck が落ちる。unsafe fix を当てたら push 前に `pnpm typecheck`（全体）と対象テストを必ず再実行する。今回これを怠り CI（test / typecheck）を一度落とした。

## 2026-08-01 「デザイン反映」タスクの起点確認と、新規ファイル群の lint 一括通過

### 14. デザイン⇔実装の反映依頼は「どちらが先行しているか」を git show --stat で確定してから方針を決める
- **何があったか**: 「デザイン変更を LP に反映して」との依頼。直前コミット 8b06d39 のメッセージは「LP を刷新し、実装との整合性を修正」と読めるが、`git show --stat` で確認すると実際の変更は **design.pen 1 ファイルのみ**で、apps/lp のコードは旧デザインのまま先行差分が存在した。この確認を飛ばしてメッセージだけ信じると「もう反映済み」と誤判断し得た。
- **ルール**: デザインデータと実装コードの同期タスクでは、着手前に (1) `git status`（ライブ編集の未保存差分の有無）、(2) `git show --stat <直近コミット>`（コミットメッセージではなく実変更ファイル）、(3) 実装側の最終変更コミット（`git log -- <実装dir>`）の 3 点で「どちらが先行しているか」を事実で確定する。コミットメッセージの文言は変更範囲の証拠にしない。
- **副次の学び**: 複数ファイルを新規作成する実装では、手書きの import 順・書き残しは必ずずれる（今回 biome ci で 7 エラー）。提出前検証の順序は「`biome check --write <触った範囲>` → `biome ci .`（rtk proxy 生実行）→ typecheck/build」で機械に直させてから確認する。
- **関連ファイル**: `apps/lp/src/`、`design.pen`

## 2026-08-04 LP のレスポンシブ修正で、インラインスタイルとメディアクエリが噛み合っていなかった

### 15. React のインラインスタイルはメディアクエリより強い。上書き対象のプロパティはインラインに残さない
- **何があったか**: モバイル時の中央揃え統一のため `@media (max-width: 768px)` で `.lp-split { flex-direction: column }` 等を書いたが、`.lp-footer { justify-content: center }` と `.lp-nav-inner { padding }` と `.lp-logo { font-size }` が一切効かなかった。対象要素の `style={{ justifyContent: "space-between" }}` 等がインラインで同じプロパティを持っており、インラインスタイルはクラスセレクタより特異性が高い（実質 `!important` 以外では勝てない）ため。ブラウザで実測するまで「書いたのに死んでいるルール」に気づけなかった。
- **原因**: 「クラスを足してメディアクエリを書く」ところまでで手を止め、**同じプロパティがインライン側に既に存在するか**を確認しなかった。CSS ファイルだけを見ると正しく見えるのが厄介である。
- **ルール**: インラインスタイル主体のコンポーネントにメディアクエリを足すときは、(1) 上書きしたいプロパティを**インライン側から削除して CSS クラスへ移す**（デスクトップ既定値も CSS 側に置く）、(2) 単に幅で連続変化させたいだけの値（padding / font-size）はメディアクエリではなく **`clamp()` をインラインのまま使う**とクラスも特異性の問題も不要になる。書いた後は必ず `getComputedStyle()` で実際に適用されたか実測して確認する。
- **関連ファイル**: `apps/lp/src/index.css`、`apps/lp/src/components/{Nav,Hero,AgendaEditShowcase,Footer,PhoneMock}.tsx`

### 16. flex-wrap の折り返し点とメディアクエリのブレークポイントは一致させる（スクロールバー分の余裕を持たせる）
- **何があったか**: 「縦積みになったら中央揃え」を意図したが、縦積みには 2 つの経路（メディアクエリによる `flex-direction: column` と、`flex-wrap: wrap` による自然な折り返し）があり、両者の発火幅がずれていた。結果として **768〜848px の帯だけ「折り返して縦積みなのに左揃えのまま」** というユーザー指摘そのものの状態が残っていた。さらにメディアクエリはスクロールバーを含むビューポート幅で評価される一方、flex の折り返しは `clientWidth`（スクロールバー除外）で決まるため、両者を同値にしても約 15px の隙間が残った。
- **ルール**: 「折り返し ⟺ 中央揃え」のような**レイアウトの不変条件**を作ったら、(1) flex-basis から折り返し幅を算術で出し（`basis + gap + 固定幅要素 + padding`）、(2) メディアクエリのブレークポイントをそれより**スクロールバー幅以上（32px 程度）大きく**取り、(3) 境界の直前・直後・中間の各幅で不変条件が成り立つかをブラウザで実測する。算術の根拠は CSS にコメントで残し、後から flex-basis を触った人が壊せないようにする。
- **副次の学び**: 要素が「横並びか縦積みか」を `getBoundingClientRect().top` の一致で判定してはならない。`align-items: center` では高さが違えば横並びでも top がずれる。**左右の矩形が重ならないか（`a.right <= b.left`）** で判定する。また `overflow: hidden` を持つ祖先があると `scrollWidth` でははみ出しを検出できないため、全要素の `right` の最大値を採って判定する（装飾用の `aria-hidden` 要素は除外する）。
- **関連ファイル**: `apps/lp/src/index.css`
