# todo: Issue #31 Google Play Console 登録・掲載・審査申請

> 前回タスク（Issue #32 プライバシーポリシー）は PR #120 マージ済みのため本ファイルを置き換え。

## 前提（確認済みの事実）

- 開発者アカウント: 未登録（承認まで数日かかる場合あり → クリティカルパス）
- プライバシーポリシー: `apps/lp/public/privacy.html` は存在するが未公開（公開 URL がデータセーフティ申告に必須）
- Issue #30（EAS Build / aab 署名）が未完了 → aab アップロードの前提
- 新規個人アカウントは製品版公開前に「テスター 12 人以上 × 継続 14 日間」のクローズドテストが必須

## 計画

### フェーズ 1: 並行着手（今すぐ）

- [x] 【ユーザー】Google Play 開発者アカウント登録を申請（2026-08-01 承認待ち）
- [x] 【Claude】プライバシーポリシーを Cloudflare Pages に公開（https://presentation-timer-czq.pages.dev/privacy で 200 確認済み）
- [x] 【ユーザー】presentation-timer.net の DNS 移管完了（NS 反映確認済み）
- [x] 【ユーザー】apex の DNS レコード修正（旧パーキング A レコード削除 → Pages への CNAME 追加）
- [x] 【Claude】Pages カスタムドメイン有効化: **https://presentation-timer.net/privacy が 200 を返すことを確認済み**（www は CNAME 未反映・任意）
- [x] 【Claude】Email Routing 設定完了: support@ → ryo.ohshima.official@gmail.com（転送先は自動検証済み・MX/SPF 配信確認済み）
- [x] 【Claude】ストア掲載情報の草案を起草（`docs/09-play-store-listing.md` に保存、docs/README.md 索引へ追記）
  - アプリ名（30 字）/ 短い説明（80 字）/ 詳細説明（4000 字）
  - データセーフティ申告の回答案（収集なし・AsyncStorage のみの実態に基づく）
  - コンテンツレーティング質問票の回答方針
  - 必要素材の要件整理（スクショ 2 枚以上、フィーチャーグラフィック 1024×500、アイコン 512×512）

### フェーズ 2: アカウント承認後

- [ ] 【ユーザー】Console でアプリ作成・掲載情報とフォーム入力（草案をコピペ）
- [ ] 【Claude/#30】eas.json 整備 → aab リリースビルド（Issue #30 として実施）
- [ ] 【ユーザー】aab をクローズドテストトラックへアップロード、テスター 12 人招集

### フェーズ 3: クローズドテスト（14 日間）〜審査申請

- [ ] 14 日間のテスト実績達成 → 製品版アクセス申請
- [ ] 【ユーザー】製品版リリース作成・審査申請 → Issue #31 クローズ

## レビュー

（完了時に記載）
