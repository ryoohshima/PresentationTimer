# 04. データモデル

> **本章は設計提案である。** 提示された RFC には含まれず、拙者が起草した。実装フェーズの検証により変更されうる。
>
> 配置先想定: `packages/types/src/index.ts`

アジェンダおよびタイマー進行状態の共通型を定義する。`apps/mobile` / `apps/web` / `packages/core-logic` がこれを共通参照する。

## 設計の要点：`planned` と `allocated` の分離

本モデル最大のポイントは、各項目が **2つの時間** を持つことである。

- `plannedSec`（**予定**）: ユーザーが最初に登録した時間。再配分では **変化しない**。
- `allocatedSec`（**割当**）: 再配分ロジックによって更新される、現在有効な持ち時間。

この分離により、「当初 5 分の予定だった項目が、押しの影響で今は 3 分に圧縮されている」といった状態を同時に表現でき、UI で「予定比 −2 分」のような差分提示が可能になる。再配分後も基準（予定）を失わないことが、押し/巻きの可視化の前提となる。

## 型定義

```ts
// アジェンダの 1 項目
interface AgendaItem {
  id: string;
  title: string;
  plannedSec: number;   // 当初の予定時間（秒）。再配分で不変
  allocatedSec: number; // 再配分後の現在の割当時間（秒）
  isLocked: boolean;    // true なら再配分の対象外（時間固定）
}

// タイマー全体の進行状態
type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

// 時間再配分のモード（詳細は 05-core-logic.md）
type ReallocationMode = 'proportional' | 'fixed-end' | 'off';

interface TimerState {
  agenda: AgendaItem[];
  currentIndex: number;     // 進行中の項目インデックス（0 始まり）
  status: TimerStatus;
  elapsedInItemSec: number; // 現項目の経過秒
  totalPlannedSec: number;  // 全項目の plannedSec 合計（不変の基準）
  reallocationMode: ReallocationMode;
  endAtEpochSec?: number;   // fixed-end モード時の発表終了時刻（任意）
}
```

## フィールド補足

| 型 / フィールド | 説明 |
|---|---|
| `AgendaItem.isLocked` | 「この項目だけは時間を削られたくない」を表現。再配分の分母から除外される |
| `TimerState.currentIndex` | `finished` 時は `agenda.length`（全項目消化）を取りうる |
| `TimerState.elapsedInItemSec` | 現項目に入ってからの経過。項目を進める際に 0 リセットされる |
| `TimerState.totalPlannedSec` | 編集時に確定する不変値。進捗率や全体差分の算出基準 |
| `TimerState.endAtEpochSec` | `fixed-end` モードでのみ参照。発表全体の終了時刻（エポック秒） |

## 派生値（型には持たず、関数で算出する想定）

状態の正規化（single source of truth）のため、以下は **保存せず** セレクタ関数で都度導出する。

- 現項目の残り秒: `currentItem.allocatedSec - elapsedInItemSec`
- 進捗率: `elapsedInItemSec / currentItem.allocatedSec`
- 押し/巻き: `elapsedInItemSec - currentItem.allocatedSec`（正なら押し、負なら巻き）

## 関連ドキュメント

- この型を操作するロジック → [05. コアロジック](./05-core-logic.md)
- 派生値を表示する画面 → [06. 画面 & UX](./06-screens.md)
