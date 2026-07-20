# todo: サービス名変更「プレゼンタイマー」（presentation-timer.net）対応

> 旧: Agenda Timer / agenda keeper → 新: プレゼンタイマー。リポジトリ名変更（GitHub 側）はユーザーが別途実施のためスコープ外。

## 計画

- [x] 作業ブランチ `chore/rename-presentation-timer` を作成
- [x] 内部識別子の一括置換（`@agenda-timer/*` → `@presentation-timer/*`、`agenda-timer-monorepo` → `presentation-timer-monorepo`）
- [x] Expo 設定変更（app.json: name/slug/scheme/package/bundleIdentifier）
- [x] AsyncStorage 保存キー変更（`@presentation-timer/agenda:v1`）
- [x] 表示名を「プレゼンタイマー」へ統一（web/lp の title・h1、mobile の App.tsx）
- [x] design.pen のロゴ・コピーライト置換（Pencil MCP 経由）
- [x] docs 更新（03-directory のツリー名、01-overview へ正式名称とドメイン追記）
- [x] `pnpm install` で lockfile 更新
- [x] 検証（置換漏れ grep / biome ci / test / typecheck / web 起動確認）
- [ ] 内容ごとにコミット分割

## レビュー

- 置換範囲: package.json ×7・import 文 ×20 ファイル・app.json・保存キー・web/lp title・App.tsx h1/Text・design.pen（ロゴ2箇所＋コピーライト＋LP フレーム名）・docs 2 ファイル。
- design.pen: Pencil MCP の変更がディスクへ flush されなかったため、メモリ上の変更と同一内容を直接編集で適用（内容一致のため矛盾なし）。日本語ロゴにあわせ fontFamily を Space Grotesk → Noto Sans JP へ変更。スクリーンショットでレイアウト崩れ無しを確認。
- 検証結果: `biome ci .` exit 0（置換で崩れた import 順は `biome check --write` で修正）／ test 8 タスク成功（30 tests passed）／ typecheck 6 タスク成功／ vite 起動で `<title>プレゼンタイマー</title>` の配信を実確認。
- 意図的残置: `docs/08-implementation-issues.md` の GitHub Issue URL（`ryoohshima/AgendaTimer`）はリポジトリ名変更後に追従する。tasks/ 配下の過去記録も据え置き。
- 留意点: ポート 5173 はユーザーの既存 dev サーバが使用中（旧 title を配信）。再起動すれば新 title になる。
