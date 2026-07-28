# todo: Issue #96 アプリ再起動後にアジェンダが復元されない

> 根本原因は永続化ロジックのバグではなく、dependabot PR #66 による `@react-native-async-storage/async-storage` の Expo SDK 54 非対応バージョンへの bump（2.2.0 → 3.1.1）。
> 調査中に別障害（TS 7 で `expo start` 起動不能）を発見し Issue #107 として起票、その修正も本ブランチに含めた。

## 計画

- [x] `apps/mobile/package.json` の async-storage を SDK 54 対応の `2.2.0` へ戻す
- [x] `.github/dependabot.yml` の ignore に `@react-native-async-storage/*` を追加（スコープ付きパッケージが `react-native-*` パターンをすり抜けた穴を塞ぐ）
- [x] `useAgendaPersistence.ts` の握り潰し catch に開発時ログを追加し、同種の無症状故障を検知可能にする
- [x] `pnpm install` で lockfile を更新
- [x] 検証（`biome ci .` / typecheck / test / Web バンドル生成）
- [x] Issue #107 起票（TS 7 で `expo start` が起動不能）
- [x] `apps/mobile/app.json` に `experiments.tsconfigPaths: false` を追加し起動を回復
- [x] フラグの解除条件を CLAUDE.md に記載
- [ ] **Android 実機での再現確認（作成 → タスクキル → 再起動）** ← 未完了

## レビュー

### Issue #96 の根本原因

`useAgendaPersistence.ts` の実装は正しく、保存・復元・配線のいずれにも欠陥は無かった。
真因は dependabot PR #66 が async-storage を `2.2.0`（SDK 54 想定）から `3.1.1` へメジャー bump したこと。

すり抜けた構造的理由が 2 つある。

1. **ignore パターンの穴**: `dependabot.yml` は `react-native-*` を ignore していたが、
   `@react-native-async-storage/` はスコープ付きゆえマッチしなかった。
2. **peer 制約の撤廃**: lockfile の差分が示すとおり、v3.1.1 の peer は `react-native: '*'` で
   何でも受け入れる。v2.2.0 は `^0.0.0-0 || >=0.65 <1.0`。pnpm も dependabot も不整合を検知できなかった。

症状が「クラッシュせず、復元もされず、エラーも出ない」だったのは、フックが失敗を
`catch {}` / `.catch(() => {})` で握り潰していたため。バリデーション不一致も無言でスキップされていた。

### 検証結果

| 項目 | 結果 |
| --- | --- |
| async-storage と `bundledNativeModules.json` の一致 | 2.2.0 で完全一致 |
| `expo-doctor` の async-storage 指摘 | 消滅 |
| lockfile の peer 依存 | `react-native: '*'` → `>=0.65 <1.0` に正常化 |
| Web バンドル生成 | 成功（7,490,079 bytes。設定変更前後で同一サイズ） |
| `biome ci .` | exit 0（警告 15 件はすべて既存コード由来） |
| `pnpm typecheck` | 6/6 成功 |
| `pnpm test` | 8/8 成功 |
| **Android 実機での復元動作** | **未検証**（Android SDK・実機とも手元に無い） |

### Web 検証の限界（重要）

Web の AsyncStorage は localStorage 実装であり、今回不整合を起こしたネイティブモジュールを通らない。
したがって **Web でのランタイム検証は本修正を原理的に検証できない**。Android 実機での確認が必須である。

### 副次対応: Issue #107

`typescript@7.0.2`（PR #77 の bump）が `expo start` を全プラットフォームで起動不能にしていた。
TS 7.0 は公開コンパイラ API を持たず `ts.sys` が undefined になるため、`@expo/cli@54` の
`evaluateTsConfig()` が落ちる。CI の `tsc --noEmit` は通るため検知されていなかった。

typescript は 7 系のまま追随する方針に基づき、`app.json` に `experiments.tsconfigPaths: false` を追加して回避した。
対照実験で因果を確認済み（設定ありで起動成功・設定なしで同エラー再現）。
本リポジトリはどの tsconfig にも `paths` を定義していないため機能低下は無い。
解除条件（SDK 57 系への更新）は CLAUDE.md に記載した。

### 未解決事項（別スコープ）

- `@expo/vector-icons` が `14.0.4`（SDK 54 の想定は `^15.0.3`）。二重インストールも発生しており、
  async-storage と同種の SDK 不整合。SDK 54 化（PR #69）の更新漏れと思われる。
- `typescript@7.0.2` に対し `@expo/require-utils` が `^5.0.0` を要求する peer 警告が残存。
