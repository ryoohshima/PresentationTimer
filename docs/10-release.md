# 10. リリース手順

Android アプリのリリースは **`v*` タグの push を唯一の起点**として自動実行される。定義は [`.github/workflows/release.yml`](../.github/workflows/release.yml)。

## リリース手順

### 1. バージョンを更新する

`apps/mobile/app.json` の `expo.version` を新しいバージョンへ更新し、PR 経由で `develop` へマージする。

```json
{ "expo": { "version": "1.0.1" } }
```

`versionCode` は `eas.json` の `autoIncrement: true` により EAS 側で自動採番されるため、手で触らない。

### 2. CI が緑であることを確認する

```sh
gh run list --branch develop --limit 3
```

**タグ push で `main` へ反映される際、CI は発火しない**（`GITHUB_TOKEN` による push は GitHub の再帰起動防止の対象）。`develop` の時点で緑であることが前提となる。

### 3. タグを打つ

```sh
git switch develop && git pull --ff-only
git tag -a v1.0.1 -m "リリース内容の要約"
git push origin v1.0.1
```

以降は自動で進む。所要時間はビルドを含めて約 15 分。

```sh
gh run watch $(gh run list --workflow release.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

### 4. Play Console で公開操作を行う

EAS が担うのは**内部テストトラックへの提出まで**。製品版への昇格はブラウザで行う。

## ワークフローの動作

| # | ステップ | 失敗しうる要因 |
|---|---|---|
| 1 | タグが `develop` 上のコミットか確認 | 別ブランチでタグを打った |
| 2 | タグと `app.json` の version が一致するか確認 | 手順 1 を忘れた |
| 3 | `pnpm install --frozen-lockfile` | lockfile の不整合 |
| 4 | EAS CLI のセットアップ | `EXPO_TOKEN` の失効 |
| 5 | Android を production ビルド | ネイティブ依存の不整合 |
| 6 | Play Console へ提出 | サービスアカウント鍵の権限不足 |
| 7 | `main` へ反映（fast-forward push） | `main` が `develop` から分岐している |
| 8 | GitHub Release を作成（`--generate-notes`） | — |

**検証（1〜2）を最初に、`main` 反映と Release 作成（7〜8）を最後に置いている。** 前者は 14 分のビルドを待たずに設定漏れを弾くため、後者はビルドや提出が失敗したときに「`main` はリリース済みだが成果物が無い」不整合を残さないため。

## 失敗したときのやり直し

ステップ 7 に到達していなければ `main` も GitHub Release も未変更なので、タグを打ち直すだけでやり直せる。

```sh
git push origin :refs/tags/v1.0.1   # リモートのタグを削除
git tag -d v1.0.1                   # ローカルのタグを削除
# 修正を develop へマージした後
git tag -a v1.0.1 -m "..." && git push origin v1.0.1
```

**タグが指すコミットに存在するワークフロー定義が実行される。** `develop` にワークフローの修正を入れただけでは反映されず、タグを新しいコミットへ移す必要がある。

ステップ 7 まで到達済みで Release を作り直す場合は `gh release delete v1.0.1` も併せて実行する。`main` は fast-forward で進んでいるだけなので巻き戻す必要は通常ない。

## 前提となる設定（初回のみ）

いずれも設定済み。再構築が必要になった場合の参照用。

| 設定 | 場所 | 備考 |
|---|---|---|
| `EXPO_TOKEN` | GitHub Repository secrets | [expo.dev の Access tokens](https://expo.dev/settings/access-tokens) で発行 |
| Google サービスアカウント鍵 | EAS サーバー側 | `eas credentials --platform android` で登録。リポジトリにも Secrets にも置かない |

サービスアカウント鍵の作成手順は [Expo の公式ガイド](https://github.com/expo/fyi/blob/main/creating-google-service-account.md)を参照。Google Cloud 側でロールを付与する必要はなく、権限は Play Console の「ユーザーと権限」で付与する。`eas credentials` は非対話モードを持たないため、登録は人手で行う。
