# todo: ドラッグ並べ替え時のちらつき再発（ネイティブのみ）

> Issue #97 の修正（PR #103）後も、アプリ（ネイティブ）では入れ替え時に一瞬ちらつきが残る。
> Web で再現しないのは既知（Reanimated の JS/UI スレッド競合は Web に存在しない）。

## 根本原因

Reanimated 4（Fabric）は transform 系の更新を `ShadowTree::commit` と**同期しない**高速パス
（`synchronouslyUpdateViewOnUIThread`）で適用する（deepwiki で仕様確認済み）。
そのため PR #103 の「React の並び替え commit と shared value リセットを同一フレームに載せる」
方式は、ネイティブでは 1 フレームの不整合（旧順序＋transform 消失）を原理的に排除できない。

## 修正方針: 表示位置の所有権を UI スレッドへ移す

行を absolute 配置にし、表示位置を shared value `slots`（id → 表示スロット）だけで決める。
`moveItem` の commit はレイアウトへ一切影響しなくなり、スレッド間の適用順序に依存する
見た目そのものが消滅する（sortable list の定石パターン）。

- [x] 原因調査（Reanimated 4 のスレッド同期仕様の確認）
- [x] `useDragReorder.ts`: `slots` マップ主体へ書き換え（リセット機構を全廃）
- [x] `DraggableRow.tsx`: absolute 配置 + slots ベースの translateY へ書き換え
- [x] `app/index.tsx`: agendaIds の受け渡しとリスト高さの明示
- [x] 検証（`biome ci .` / typecheck / test / Web での基本動作）
- [ ] **Android 実機でのちらつき解消確認** ← ユーザーへ依頼（手元に環境なし）

## レビュー

### 実装の要点

- 表示位置の唯一の情報源を shared value `slots`（id → 表示スロット）にし、行を absolute 配置へ変更。
  ドラッグ中の退避・ドロップ確定はすべて UI スレッド上で `slots` を書き換えるだけになり、
  store の `moveItem` commit はレイアウトへ一切影響しない（＝commit と transform の
  フレームずれという競合自体が消滅）。
- #103 の「リセットを 1 コミット遅らせる」機構（pendingReset / useLayoutEffect リセット）は全廃。
  ドロップ後に JS 側から shared value を触る必要が無くなった。
- 行高（rowOffset）測定前は従来どおり通常フローで描画し、測定後に absolute へ切り替える。
  切り替えは同一 commit に初期 translateY ごと載るため見た目の変化は無い。
- 副次改善: ドロップ時に指位置から確定スロットへ withTiming（150ms）で着地するようになった
  （#103 は瞬間スナップだった）。

### 検証結果

| 項目 | 結果 |
| --- | --- |
| `rtk proxy pnpm exec biome ci .` | exit 0（警告 17 件はすべて既存コード由来） |
| `pnpm typecheck` | 6/6 成功 |
| `pnpm test` | 48/48 成功 |
| Web: 初期レイアウト（absolute 切替後） | 3 行が 92px 間隔で正しく積層 |
| Web: ドラッグ並べ替え（2 スロット / 1 スロット） | 順序・座標とも正確、ずれ無し |
| Web: リロード後の復元 | 並び順維持、slots 再同期正常 |
| Web: 削除 | 残行が正しく詰まる |
| Web: 追加 | 新項目が即座に正しいスロットへ（フォールバック経路も動作） |
| **Android 実機でのちらつき解消** | **未検証**（Web ではスレッド競合が原理的に再現しないため） |
