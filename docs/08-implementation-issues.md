# 08. 実装 Issue（MVP）

> 本章は [07. ロードマップ](./07-roadmap.md) の **MVP（Android 初回リリース）** スコープを、GitHub Issue として起票・分解した管理表である。設計（なぜ・何を）は 01〜07、進行管理（いつ・誰が）は本章と GitHub Issue が担う。

## 概要

MVP に必要なステップを GitHub Issue 化した。**親 Issue（Epic）6 件 + 子 Issue 22 件 = 計 28 件**。各子 Issue は単独でレビュー可能な最小 PR 単位（1 Issue = 1 PR）に分割しており、PR の肥大化を避ける方針である。

- リポジトリ: [ryoohshima/AgendaTimer](https://github.com/ryoohshima/AgendaTimer/issues)
- 親子関係は GitHub の **sub-issue** 機能で表現。各 Epic を開くと Sub-issues セクションに完了率が表示される。

## ラベル凡例

実装の主体を一目で判別できるよう、各 Issue に以下のラベルを付与している。

| ラベル | 意味 |
|---|---|
| 🟣 `epic` | ステップをまとめる親 Issue |
| 🟢 `claude-code` | **Claude Code による実装が可能** |
| 🟠 `needs-human` | **人間による操作が必要**（アカウント・署名・審査・アセット等） |

## Epic と sub-issue 一覧

### [Epic #5 feat: コアロジック完成（時間再配分）](https://github.com/ryoohshima/AgendaTimer/issues/5) 🟣

| # | タイトル | ラベル |
|---|---|---|
| [#11](https://github.com/ryoohshima/AgendaTimer/issues/11) | proportional 再配分アルゴリズム実装 | 🟢 claude-code |
| [#12](https://github.com/ryoohshima/AgendaTimer/issues/12) | 再配分のエッジケース対応 | 🟢 claude-code |

### [Epic #6 feat: モバイルアプリ基盤（Expo スキャフォールド）](https://github.com/ryoohshima/AgendaTimer/issues/6) 🟣

| # | タイトル | ラベル |
|---|---|---|
| [#13](https://github.com/ryoohshima/AgendaTimer/issues/13) | Expo プロジェクト作成と monorepo 配線 | 🟢 claude-code |
| [#14](https://github.com/ryoohshima/AgendaTimer/issues/14) | 画面遷移の骨組み | 🟢 claude-code |
| [#15](https://github.com/ryoohshima/AgendaTimer/issues/15) | TimerState グローバル状態管理の導入 | 🟢 claude-code |

### [Epic #7 feat: アジェンダ編集画面（①）](https://github.com/ryoohshima/AgendaTimer/issues/7) 🟣

| # | タイトル | ラベル |
|---|---|---|
| [#16](https://github.com/ryoohshima/AgendaTimer/issues/16) | アジェンダ項目リストの表示と追加・削除 | 🟢 claude-code |
| [#17](https://github.com/ryoohshima/AgendaTimer/issues/17) | アジェンダ項目の並べ替え | 🟢 claude-code |
| [#18](https://github.com/ryoohshima/AgendaTimer/issues/18) | plannedSec 入力 UI | 🟢 claude-code |
| [#19](https://github.com/ryoohshima/AgendaTimer/issues/19) | アジェンダのローカル永続化 | 🟢 claude-code |

### [Epic #8 feat: フルスクリーンタイマー実行画面（②）](https://github.com/ryoohshima/AgendaTimer/issues/8) 🟣

| # | タイトル | ラベル |
|---|---|---|
| [#20](https://github.com/ryoohshima/AgendaTimer/issues/20) | タイマー画面レイアウト（特大表示） | 🟢 claude-code |
| [#21](https://github.com/ryoohshima/AgendaTimer/issues/21) | tick 駆動の実装 | 🟢 claude-code |
| [#22](https://github.com/ryoohshima/AgendaTimer/issues/22) | 進捗バーと押し/巻きの色変化 | 🟢 claude-code |
| [#23](https://github.com/ryoohshima/AgendaTimer/issues/23) | タイマー操作系（一時停止・次へ・編集へ戻る） | 🟢 claude-code |
| [#24](https://github.com/ryoohshima/AgendaTimer/issues/24) | 次項目プレビュー | 🟢 claude-code |
| [#25](https://github.com/ryoohshima/AgendaTimer/issues/25) | keep awake（画面スリープ抑止） | 🟢 claude-code |

### [Epic #9 build: 品質保証・CI 整備](https://github.com/ryoohshima/AgendaTimer/issues/9) 🟣

| # | タイトル | ラベル |
|---|---|---|
| [#26](https://github.com/ryoohshima/AgendaTimer/issues/26) | ESLint/Prettier 整備 | 🟢 claude-code |
| [#27](https://github.com/ryoohshima/AgendaTimer/issues/27) | ci.yml 有効化（typecheck/test 自動実行） | 🟢 claude-code |
| [#28](https://github.com/ryoohshima/AgendaTimer/issues/28) | 実機・エミュレータでの動作確認 | 🟠 needs-human |

### [Epic #10 chore: Android リリース・配布](https://github.com/ryoohshima/AgendaTimer/issues/10) 🟣

| # | タイトル | ラベル |
|---|---|---|
| [#29](https://github.com/ryoohshima/AgendaTimer/issues/29) | app.json メタ情報・アイコン・スプラッシュ設定 | 🟢 claude-code ※アセットは要人手 |
| [#30](https://github.com/ryoohshima/AgendaTimer/issues/30) | EAS Build による Android リリースビルドと署名 | 🟠 needs-human |
| [#31](https://github.com/ryoohshima/AgendaTimer/issues/31) | Google Play Console 登録・掲載・審査申請 | 🟠 needs-human |
| [#32](https://github.com/ryoohshima/AgendaTimer/issues/32) | プライバシーポリシー整備 | 🟠 needs-human |

## 実装の進め方

- **`claude-code`（18 件）** は Epic #5 → #10 の依存順に並んでおり、上から着手すると各 PR の前提が揃った状態で進められる。とりわけ [#11](https://github.com/ryoohshima/AgendaTimer/issues/11)（proportional 再配分）は MVP の核ゆえ最優先。
- **`needs-human`（4 件）** は Claude Code では完結できない作業（実機確認・EAS 署名・Google Play 審査・プライバシーポリシー）であり、人手での対応が必要。
- 進捗は各 Epic の Sub-issues セクション（完了率バー）で追跡する。

## 関連ドキュメント

- スコープと段階の定義 → [07. ロードマップ](./07-roadmap.md)
- 各 Issue の設計的根拠 → [04. データモデル](./04-data-model.md) / [05. コアロジック](./05-core-logic.md) / [06. 画面 & UX](./06-screens.md)
