# Lessons（自己改善ログ）

ユーザーから修正・指摘を受けたパターンと、再発防止ルールを記録する。

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
