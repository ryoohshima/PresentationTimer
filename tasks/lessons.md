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
