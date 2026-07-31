# 05. コアロジック（タイマーエンジン）

> **本章は設計提案として起草し、その後 `packages/core-logic/src/timerEngine.ts` へ実装済み。** 提示された RFC には含まれず、拙者が起草した章である。本アプリの核心ゆえ、変更時は最優先でレビューされたい。

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

## 制御系（純粋関数）

```ts
// 編集画面で確定したアジェンダを読み込み、計測前の初期状態にする
// （totalPlannedSec を再計算し、idle・先頭項目・経過 0 にリセット）
function loadAgenda(state: TimerState, items: AgendaItem[]): TimerState;

// idle から計測を開始する。割当（allocatedSec）を計画値（plannedSec）へ戻し、
// 先頭項目・経過 0 にリセットする
function start(state: TimerState): TimerState;

function pause(state: TimerState): TimerState;
function resume(state: TimerState): TimerState;

// 経過時間を加算する（UI の tick から毎秒呼ぶ想定）。running 時のみ進む
function tick(state: TimerState, deltaSec: number): TimerState;

// 現項目を確定し、過不足を残項目へ再配分してから次項目へ進む
function advanceItem(state: TimerState): TimerState;

// 現項目で生じた過不足を、残項目の allocatedSec へ反映する（advanceItem 内部から利用）
function redistribute(state: TimerState): TimerState;
```

## セレクタ関数群

状態には保持せず、都度導出する派生値（[04. データモデル](./04-data-model.md#派生値型には持たず関数で算出する想定)）。

```ts
function getCurrentItem(state: TimerState): AgendaItem | undefined;
function getNextItem(state: TimerState): AgendaItem | undefined;

// 現項目の残り秒（allocatedSec - elapsedInItemSec）
function getRemainingSec(state: TimerState): number | undefined;

// 現項目の押し/巻き秒（elapsedInItemSec - allocatedSec）
function getOverUnderSec(state: TimerState): number | undefined;

// 現項目の進捗率（elapsedInItemSec / allocatedSec, 0〜1+）
function getProgressRate(state: TimerState): number | undefined;

// アジェンダ全体の残り秒（totalPlannedSec - totalElapsedSec）
function getTotalRemainingSec(state: TimerState): number;

// 全体スケジュール基準の押し/巻き秒。正なら押し、負なら巻き。
// タイマー画面（②）はこちらを表示する（現項目内の押し/巻きではなく全体の累積偏差）
function getScheduleOverUnderSec(state: TimerState): number;

// 押し/巻きの度合い（進捗率ベース）。safe=余裕 / warning=残りわずか / over=超過
type PaceLevel = "safe" | "warning" | "over";
const PACE_WARNING_RATE = 0.8; // warning 判定のしきい値（進捗率）
function getPaceLevel(state: TimerState): PaceLevel | undefined;
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
  minSec = item.allocatedSec >= MIN_ALLOCATED_SEC ? MIN_ALLOCATED_SEC : 0
  item.allocatedSec = max(minSec, item.allocatedSec - delta * share)
```

- 押し（`delta > 0`）なら残項目が一律圧縮され、巻き（`delta < 0`）なら残項目が緩む。
- 下限は圧縮方向にのみ効かせる。割当が `MIN_ALLOCATED_SEC`（例: 30 秒）以上の項目はそれ未満へ圧縮せず、もともと下限未満の短時間項目は 0 秒を下限に全量圧縮を許す（マイナスのみ防止）。一律の下限だと短時間項目が引き上げられ、`min(下限, 現割当)` だと短時間項目が押しで一切圧縮できない。

> **例**: 残り 2 項目（予定 6 分 / 3 分）。現項目で +90 秒の押し。
> 6 分側へ `90 × 6/9 = 60 秒`、3 分側へ `90 × 3/9 = 30 秒` を圧縮。

### 2. `fixed-end`（終了時刻固定）

> **現状の実装状況**: `redistribute` は `reallocationMode !== "proportional"` の場合に即 `state` を返すため、`fixed-end` の再配分ロジックは未実装であり `off` と同じ挙動（再配分なし）になる。設定画面（③）でも `fixed-end` の選択肢は準備中として無効化している（Issue #90）。以下は Phase 2（[07. ロードマップ](./07-roadmap.md)）で実装する仕様。

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
