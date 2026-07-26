# 05. コアロジック（タイマーエンジン）

> **本章は設計提案である。** 提示された RFC には含まれず、拙者が起草した。本アプリの核心ゆえ、最優先でレビューされたい。実装フェーズの検証により変更されうる。
>
> 配置先想定: `packages/core-logic/src/timerEngine.ts`

## 設計方針：純粋関数の集合

タイマーエンジンは **副作用を持たない純粋関数の集合** として設計する。`setInterval` 等の時間計測やストレージ I/O は UI 層（`apps/*`）の責務とし、エンジンは「現在の状態 + 入力 → 次の状態」を返すだけにする。これにより:

- UI フレームワーク非依存でユニットテストが完結する。
- モバイル・Web で同一ロジックを共有できる。
- 状態遷移が決定的（同じ入力なら同じ出力）になり、デバッグが容易。

## 状態機械（`TimerStatus` 遷移）

```text
        start            advanceItem(最終項目で)
 idle ────────► running ───────────────────────► finished
                 ▲  │
          resume │  │ pause
                 │  ▼
               paused
```

| 遷移 | トリガ | `currentIndex` | `elapsedInItemSec` | `status` |
|---|---|---|---|---|
| 開始 | `start` | 0 | 0 | `idle → running` |
| 経過 | `tick` | 不変 | `+= deltaSec` | `running` のまま |
| 一時停止 | `pause` | 不変 | 不変 | `running → paused` |
| 再開 | `resume` | 不変 | 不変 | `paused → running` |
| 次へ | `advanceItem`（途中） | `+1` | 0 にリセット | `running` のまま |
| 終了 | `advanceItem`（最終項目） | `agenda.length` | 0 | `running → finished` |

`advanceItem` は「現項目を確定して次へ進む」操作であり、確定時に **再配分（`redistribute`）を内部で呼び出す**点が要となる。

`start` は上記に加えて全項目の `allocatedSec` を **`plannedSec` へ戻す**。`allocatedSec` は再配分で書き換わる可変値であり、計測開始時に計画値へ戻さないと前回実行の再配分結果を基準に過不足が積み増され、実行を重ねるほど割当がずれる（Issue #98）。裏を返せば **`idle` の間は常に `allocatedSec === plannedSec`** が不変条件となる。

## 純粋関数シグネチャ（案）

```ts
// 経過時間を加算する（UI の tick から毎秒呼ぶ想定）
function tick(state: TimerState, deltaSec: number): TimerState;

// 現項目を確定し、過不足を残項目へ再配分してから次項目へ進む
function advanceItem(state: TimerState): TimerState;

// 現項目で生じた過不足を、残項目の allocatedSec へ反映する（advanceItem 内部から利用）
function redistribute(state: TimerState): TimerState;

// 制御系（必要に応じて）
function start(state: TimerState): TimerState;
function pause(state: TimerState): TimerState;
function resume(state: TimerState): TimerState;
```

## 時間再配分アルゴリズム（3モード）

`reallocationMode` により挙動を切り替える。再配分の対象は常に **「未着手（`index > currentIndex`）かつ `isLocked === false`」** の項目のみ（＝再配分プール）。

### 1. `proportional`（比例再配分・**既定**）

現項目で生じた過不足を、再配分プール各項目の **`plannedSec` 比** で配分する。

```text
delta = elapsedInItemSec - currentItem.allocatedSec   // 正=押し / 負=巻き
poolPlannedTotal = Σ plannedSec (再配分プール)

各 item について:
  share = item.plannedSec / poolPlannedTotal
  item.allocatedSec = max(MIN_ALLOCATED_SEC, item.allocatedSec - delta * share)
```

- 押し（`delta > 0`）なら残項目が一律圧縮され、巻き（`delta < 0`）なら残項目が緩む。
- `MIN_ALLOCATED_SEC`（例: 30 秒）を下限とし、項目がゼロ／マイナスになるのを防ぐ。

> **例**: 残り 2 項目（予定 6 分 / 3 分）。現項目で +90 秒の押し。
> 6 分側へ `90 × 6/9 = 60 秒`、3 分側へ `90 × 3/9 = 30 秒` を圧縮。

### 2. `fixed-end`（終了時刻固定）

発表全体の終了時刻 `endAtEpochSec` を固定し、残時間を再配分プールへ比例配分する。「会議の終了時刻は動かせない」ユースケース向け。

```text
remainingSec = endAtEpochSec - now          // 残りの実時間
poolPlannedTotal = Σ plannedSec (再配分プール)

各 item について:
  share = item.plannedSec / poolPlannedTotal
  item.allocatedSec = max(MIN_ALLOCATED_SEC, remainingSec * share)
```

- `now` はエンジンに引数として渡す（純粋性維持のため、エンジン内で時刻を取得しない）。
- 残時間がプールの最低合計を下回る場合は、全項目を `MIN_ALLOCATED_SEC` に張り付け、UI 側で「時間超過」を警告する。

### 3. `off`（再配分なし）

`allocatedSec` を一切変更しない。各項目が独立してカウントダウンする従来型。再配分の挙動が不要なユーザー向けのシンプルモード。

## エッジケースと方針

| ケース | 方針 |
|---|---|
| 再配分プールが空（残項目なし or 全ロック） | 再配分をスキップし状態を変えない。押し/巻きは現項目内で表示のみ |
| `poolPlannedTotal === 0` | ゼロ除算回避。プール各項目へ **均等配分** にフォールバック |
| 配分後に下限割れ | `MIN_ALLOCATED_SEC` でクランプ。クランプで吸収しきれない過不足は UI に警告として通知 |
| 秒の端数 | `allocatedSec` は整数秒に丸める（`Math.round`）。丸め残差は最後の項目で吸収 |
| `fixed-end` で `remainingSec <= 0` | 即 `finished` 相当として UI に超過を通知 |

## テスト方針

純粋関数ゆえ、`TimerState` を入力に与えて出力 `TimerState` を assert するだけでよい。最低限カバーすべきケース:

- 押し / 巻き / 過不足ゼロ の各 `proportional` 再配分
- `isLocked` 項目が分母・配分から除外されること
- 下限クランプ（`MIN_ALLOCATED_SEC`）の発火
- `fixed-end` の残時間配分と超過検知
- `advanceItem` による `currentIndex` 進行と `finished` 到達
- ゼロ除算・空プールのフォールバック

## 関連ドキュメント

- 操作対象の型 → [04. データモデル](./04-data-model.md)
- 再配分結果を表示する画面 → [06. 画面 & UX](./06-screens.md)
- モード別の提供段階 → [07. ロードマップ](./07-roadmap.md)
