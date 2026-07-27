# プロジェクト固有の Claude Code 指示

このファイルは本プロジェクトに固有のルール・コンテキストを Claude Code に伝えるためのものでござる。
全プロジェクト共通のガイドラインは `~/.claude/CLAUDE.md` に記載されており、本ファイルはそれを補完する形で記述するでござる。

## プロジェクト概要

<!-- このリポジトリの目的・スコープを 2-3 行で記述 -->

## 技術スタック

<!-- 言語 / フレームワーク / 主要ライブラリ / DB / インフラ など -->

- 言語:
- フレームワーク:
- パッケージマネージャ:

## ディレクトリ構成

<!-- 主要ディレクトリの役割を簡潔に記述 -->

```
.
├── src/           # ソースコード
├── tests/         # テストコード
├── docs/          # ドキュメント
└── tasks/         # Claude Code 作業記録（todo.md / lessons.md）
```

## 開発コマンド

<!-- よく使うコマンドを記載。Claude が即座に実行できるようコピペ可能な形で -->

```sh
# 起動
# pnpm dev

# テスト
# pnpm test

# Lint / Type check
# pnpm lint
# pnpm typecheck

# ビルド
# pnpm build
```

## このリポジトリ固有の注意事項

### `app.json` の `experiments.tsconfigPaths: false`（Issue #107）

`typescript@7` は公開コンパイラ API を同梱せず `ts.sys` が `undefined` になる。
`@expo/cli@54` の `evaluateTsConfig()` がそれを参照するため、既定のままだと `expo start` が
全プラットフォームで起動できない。このフラグで tsconfig paths 解決を切って回避している。

本リポジトリはどの tsconfig にも `paths` を定義していないため機能低下は無い。
`paths` を導入する場合はこのフラグと両立しないので、先に下記の解除条件を満たすこと。

**解除条件**: Expo SDK を 57 系へ更新する（`@expo/cli@57` では `ts.sys` 依存が実装から消えている）。
または typescript 7.1（programmatic API 復活）と Expo 側の対応が揃うこと。

## 参照ドキュメント

<!-- README, アーキテクチャドキュメント、外部参照など -->

- [README.md](./README.md)
