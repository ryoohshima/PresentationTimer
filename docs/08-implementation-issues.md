# 08. 実装 Issue（MVP）

> 本章は [07. ロードマップ](./07-roadmap.md) の **MVP（Android 初回リリース）** スコープを、GitHub Issue として起票・分解した管理表である。設計（なぜ・何を）は 01〜07、進行管理（いつ・誰が）は本章と GitHub Issue が担う。

## 概要

MVP に必要なステップを GitHub Issue 化した。**親 Issue（Epic）6 件 + 子 Issue 22 件 = 計 28 件**。各子 Issue は単独でレビュー可能な最小 PR 単位（1 Issue = 1 PR）に分割しており、PR の肥大化を避ける方針である。

- リポジトリ: [ryoohshima/AgendaTimer](https://github.com/ryoohshima/AgendaTimer/issues)
- 親子関係は GitHub の **sub-issue** 機能で表現。各 Epic を開くと Sub-issues セクションに完了率が表示される。

## ラベル凡例

各 Issue は **2 つの軸**でラベル付けし、「誰が・いつ着手すべきか」を判別できるようにしている。親 Issue（Epic）は `epic` で示す。

### 軸 1: 実装の主体（誰が）

| ラベル | 意味 |
|---|---|
| 🟢 `claude-code` | **Claude Code による実装が可能** |
| 🟠 `needs-human` | **人間による操作が必要**（アカウント・署名・審査・アセット等） |

### 軸 2: 依存位置（いつ）

| ラベル | 意味 |
|---|---|
| 🔴 `blocker` | **後続 Issue の前提となる土台**。先に倒さないと後続が詰まるため優先着手すべき |
| 🟢 `standalone` | **前後関係なく単独で実装できる**横断的/独立タスク。手が空いたときの並行作業に向く |

> どちらの軸 2 ラベルにも当てはまらない中間 Issue（単一の前提に連なるが後続を塞がない末端）はラベルなし。判定基準と全 Issue の対応は章末の [付録: 依存位置の分類](#付録-依存位置の分類) を参照。

### 親 Issue

| ラベル | 意味 |
|---|---|
| 🟣 `epic` | ステップをまとめる親 Issue |

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

## 付録: 依存位置の分類

軸 2（`blocker` / `standalone`）は以下の基準で判定している。

- **`blocker`** = 複数の後続 Issue の前提になる土台。先に倒さないと後続が詰まる。
- **`standalone`** = 他の機能実装の前後関係に縛られず、単独で着手・完結できる横断的/独立タスク。
- どちらにも当たらない中間ノード（単一の前提に連なるが後続を塞がない末端）は **ラベルなし**。

### 🔴 blocker（6 件）

| # | タイトル | 後続の前提となる理由 |
|---|---|---|
| [#13](https://github.com/ryoohshima/AgendaTimer/issues/13) | Expo プロジェクト作成と monorepo 配線 | 全 UI の前提（最上流） |
| [#14](https://github.com/ryoohshima/AgendaTimer/issues/14) | 画面遷移の骨組み | 全画面配置の前提 |
| [#15](https://github.com/ryoohshima/AgendaTimer/issues/15) | TimerState グローバル状態管理 | 編集/実行 両画面の前提 |
| [#11](https://github.com/ryoohshima/AgendaTimer/issues/11) | proportional 再配分アルゴリズム | MVP 中核ロジック・#23 操作系の前提 |
| [#16](https://github.com/ryoohshima/AgendaTimer/issues/16) | アジェンダ項目リストの表示と追加・削除 | 編集画面の基礎（#17/#18 が乗る） |
| [#20](https://github.com/ryoohshima/AgendaTimer/issues/20) | タイマー画面レイアウト（特大表示） | 実行画面の基礎（#22/#23/#24 が乗る） |

### 🟢 standalone（5 件）

| # | タイトル | 独立している理由 |
|---|---|---|
| [#26](https://github.com/ryoohshima/AgendaTimer/issues/26) | ESLint/Prettier 整備 | 既存コードに対し今すぐ独立着手可 |
| [#27](https://github.com/ryoohshima/AgendaTimer/issues/27) | ci.yml 有効化 | 既存 typecheck/test に対し独立 |
| [#19](https://github.com/ryoohshima/AgendaTimer/issues/19) | アジェンダのローカル永続化 | 独立した永続化層 |
| [#25](https://github.com/ryoohshima/AgendaTimer/issues/25) | keep awake | 実行画面に挿すだけの横断機能 |
| [#32](https://github.com/ryoohshima/AgendaTimer/issues/32) | プライバシーポリシー整備 | 実装と無関係に単独作成可 |

### 着手順の目安

```text
最上流（まず倒すべき blocker）
  #13 Expo作成 ──┬─→ #14 画面遷移 ──┐
                 └─→ #15 状態管理 ──┼─→ #16 編集画面基礎 ─→ #17/#18
                                    └─→ #20 実行画面基礎 ─→ #22/#23/#24
  #11 再配分ロジック ────────────────────────→ #23 操作系

並行可能（standalone・いつでも着手可）
  #26 ESLint   #27 CI   #19 永続化   #25 keep awake   #32 プライバシーポリシー
```

> `#11`（再配分ロジック）と `#13`（Expo 基盤）は互いに独立した二大上流であり、並行で着手できる。`standalone` 群は依存チェーンの外にあるため、待ち時間の埋め草に適する。

## 関連ドキュメント

- スコープと段階の定義 → [07. ロードマップ](./07-roadmap.md)
- 各 Issue の設計的根拠 → [04. データモデル](./04-data-model.md) / [05. コアロジック](./05-core-logic.md) / [06. 画面 & UX](./06-screens.md)
