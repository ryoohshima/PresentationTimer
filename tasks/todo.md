# todo: Issue #32 プライバシーポリシー整備

> 前回タスク（押し圧縮バグ）は PR #114 反映済みのため本ファイルを置き換え。

## 計画

- [x] Issue #32 と過去の Claude Action の作業状況を確認（リモートブランチに commit 7cba03b あり・PR 未作成）
- [x] 旧 commit を最新 develop ベースへ cherry-pick（App.tsx はコンポーネント分割済みのためコンフリクト解消し Footer.tsx へ移植）
- [x] 「個人情報を収集しない」前提の妥当性を現行コードで再確認（解析 SDK・外部通信なし、AsyncStorage のみ）
- [x] 検証: biome ci（rtk proxy 生実行）/ tsc --noEmit / vite build すべて pass、dist/privacy.html 生成確認
- [x] push（--force-with-lease）とドラフト PR #120 作成
- [x] CI green 確認（react-doctor / test / lint / claude-review / typecheck すべて pass）

## レビュー

- 追加: apps/lp/public/privacy.html（143 行）、apps/lp/src/components/Footer.tsx にリンク追加
- 判断留保（PR 本文に記載）: 問い合わせメール実在確認 / 公開 URL のデプロイ設定 / モバイル内導線 / Play Console 登録（人手）
