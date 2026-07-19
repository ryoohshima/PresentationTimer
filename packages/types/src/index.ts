// アジェンダおよびタイマー進行状態の共通型。
// apps/* と packages/core-logic がこれを共通参照する（docs/04-data-model.md）。

/** アジェンダの 1 項目。 */
export interface AgendaItem {
  id: string;
  title: string;
  /** 当初の予定時間（秒）。再配分では不変。 */
  plannedSec: number;
  /** 再配分後の現在の割当時間（秒）。 */
  allocatedSec: number;
  /** true なら再配分の対象外（時間固定）。 */
  isLocked: boolean;
}

/** タイマー全体の進行状態。 */
export type TimerStatus = "idle" | "running" | "paused" | "finished";

/** 時間再配分のモード（詳細は docs/05-core-logic.md）。 */
export type ReallocationMode = "proportional" | "fixed-end" | "off";

/** タイマー全体の進行状態。派生値は保持せずセレクタで都度導出する。 */
export interface TimerState {
  agenda: AgendaItem[];
  /** 進行中の項目インデックス（0 始まり）。finished 時は agenda.length を取りうる。 */
  currentIndex: number;
  status: TimerStatus;
  /** 現項目に入ってからの経過秒。項目を進める際に 0 リセットされる。 */
  elapsedInItemSec: number;
  /**
   * 開始からの累積実績秒。tick で加算し、start / loadAgenda で 0 リセットする。
   * advanceItem では維持され、完了済み項目の実績合計 + 現項目経過を常に表す
   * （全体スケジュール基準の押し/巻き算出に使う）。
   */
  totalElapsedSec: number;
  /** 全項目の plannedSec 合計（不変の基準）。 */
  totalPlannedSec: number;
  reallocationMode: ReallocationMode;
  /** fixed-end モード時の発表終了時刻（エポック秒・任意）。 */
  endAtEpochSec?: number;
}
