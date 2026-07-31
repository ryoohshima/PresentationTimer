// タイマーエンジン: 副作用を持たない純粋関数の集合（docs/05-core-logic.md）。
// 「現在の状態 + 入力 → 次の状態」を返すだけにし、時間計測や I/O は UI 層の責務とする。

import type { AgendaItem, TimerState } from "@presentation-timer/types";

/** 再配分後の 1 項目あたりの割当下限（秒）。これ未満には圧縮しない（もともと下回る項目は引き上げない）。 */
export const MIN_ALLOCATED_SEC = 30;

// --- 制御系（状態遷移） ---------------------------------------------------

/**
 * 編集画面で確定したアジェンダを読み込み、計測前の初期状態にする。
 * totalPlannedSec を plannedSec 合計で再計算し、idle・先頭項目・経過 0 にリセットする。
 */
export function loadAgenda(state: TimerState, items: AgendaItem[]): TimerState {
  return {
    ...state,
    agenda: items,
    totalPlannedSec: items.reduce((sum, item) => sum + item.plannedSec, 0),
    status: "idle",
    currentIndex: 0,
    elapsedInItemSec: 0,
    totalElapsedSec: 0,
  };
}

/**
 * 全項目の allocatedSec を plannedSec へ戻す。
 *
 * allocatedSec は redistribute が書き換える可変値であり、計測開始時に計画値へ戻さないと
 * 前回実行の再配分結果を基準に押し/巻きが積み増され、実行を重ねるほど割当がずれる（Issue #98）。
 * 変化が無い場合は同一参照を返し、不要な再レンダリング・再保存を避ける。
 */
function resetAllocations(items: AgendaItem[]): AgendaItem[] {
  if (items.every((item) => item.allocatedSec === item.plannedSec)) return items;
  return items.map((item) => ({ ...item, allocatedSec: item.plannedSec }));
}

/** idle から計測を開始する。割当を計画値へ戻し、先頭項目・経過 0 にリセットする。 */
export function start(state: TimerState): TimerState {
  return {
    ...state,
    agenda: resetAllocations(state.agenda),
    status: "running",
    currentIndex: 0,
    elapsedInItemSec: 0,
    totalElapsedSec: 0,
  };
}

/** 計測を一時停止する。running 以外では状態を変えない。 */
export function pause(state: TimerState): TimerState {
  if (state.status !== "running") return state;
  return { ...state, status: "paused" };
}

/** 一時停止から再開する。paused 以外では状態を変えない。 */
export function resume(state: TimerState): TimerState {
  if (state.status !== "paused") return state;
  return { ...state, status: "running" };
}

/** 経過時間を加算する（UI の tick から毎秒呼ぶ想定）。running 時のみ進む。 */
export function tick(state: TimerState, deltaSec: number): TimerState {
  if (state.status !== "running") return state;
  return {
    ...state,
    elapsedInItemSec: state.elapsedInItemSec + deltaSec,
    totalElapsedSec: state.totalElapsedSec + deltaSec,
  };
}

/**
 * 現項目を確定し、過不足を残項目へ再配分してから次項目へ進む。
 * 最終項目を確定した場合は finished へ遷移する（currentIndex は agenda.length）。
 */
export function advanceItem(state: TimerState): TimerState {
  const redistributed = redistribute(state);
  const nextIndex = redistributed.currentIndex + 1;
  const isLast = nextIndex >= redistributed.agenda.length;
  return {
    ...redistributed,
    currentIndex: nextIndex,
    elapsedInItemSec: 0,
    status: isLast ? "finished" : redistributed.status,
  };
}

/**
 * 現項目で生じた過不足を残項目の allocatedSec へ反映する（advanceItem 内部から利用）。
 *
 * proportional モード: 再配分プール（index > currentIndex かつ !isLocked）各項目の
 * plannedSec 比で delta を配分し、下限でクランプして整数秒に丸める。
 * 下限は min(MIN_ALLOCATED_SEC, 現在の allocatedSec)。一律 MIN_ALLOCATED_SEC にすると
 * もともと 30 秒未満の項目が巻き・押しのどちらでも 30 秒へ「引き上げ」られてしまうため、
 * クランプは圧縮方向にのみ効かせる（下限の意図は docs/05 の「ゼロ／マイナス防止」）。
 * off モードおよびプールが空の場合は state をそのまま返す。
 */
export function redistribute(state: TimerState): TimerState {
  if (state.reallocationMode !== "proportional") return state;

  const currentItem = state.agenda[state.currentIndex];
  if (currentItem === undefined) return state;

  const delta = state.elapsedInItemSec - currentItem.allocatedSec;
  if (delta === 0) return state;

  const pool = state.agenda
    .map((item, index) => ({ item, index }))
    .filter(({ index, item }) => index > state.currentIndex && !item.isLocked);

  if (pool.length === 0) return state;

  const poolPlannedTotal = pool.reduce((sum, { item }) => sum + item.plannedSec, 0);
  const poolIndexSet = new Set(pool.map(({ index }) => index));
  const lastPoolIndex = pool[pool.length - 1]!.index;

  // 丸め残差を最後の項目で吸収するため、プール全体の目標合計を先に確定する
  const poolAllocatedTotal = pool.reduce((sum, { item }) => sum + item.allocatedSec, 0);
  const targetTotal = poolAllocatedTotal - delta;

  let sumAllocated = 0;

  const newAgenda = state.agenda.map((item, index) => {
    if (!poolIndexSet.has(index)) return item;

    const minSec = Math.min(MIN_ALLOCATED_SEC, item.allocatedSec);
    let newAllocatedSec: number;
    if (index === lastPoolIndex) {
      // 残差吸収: 前項目の丸め誤差をここで吸収して合計を目標値に合わせる
      newAllocatedSec = Math.max(minSec, targetTotal - sumAllocated);
    } else {
      const share = poolPlannedTotal === 0 ? 1 / pool.length : item.plannedSec / poolPlannedTotal;
      newAllocatedSec = Math.round(Math.max(minSec, item.allocatedSec - delta * share));
    }

    sumAllocated += newAllocatedSec;
    return { ...item, allocatedSec: newAllocatedSec };
  });

  return { ...state, agenda: newAgenda };
}

// --- セレクタ（派生値の導出。状態には保持しない: docs/04） -----------------

/** 進行中の項目。finished など範囲外では undefined。 */
export function getCurrentItem(state: TimerState): AgendaItem | undefined {
  return state.agenda[state.currentIndex];
}

/** 現項目の残り秒（割当 - 経過）。現項目が無ければ undefined。 */
export function getRemainingSec(state: TimerState): number | undefined {
  const item = getCurrentItem(state);
  if (item === undefined) return undefined;
  return item.allocatedSec - state.elapsedInItemSec;
}

/** 押し/巻き秒（経過 - 割当）。正なら押し、負なら巻き。現項目が無ければ undefined。 */
export function getOverUnderSec(state: TimerState): number | undefined {
  const item = getCurrentItem(state);
  if (item === undefined) return undefined;
  return state.elapsedInItemSec - item.allocatedSec;
}

/** 進捗率（経過 / 割当, 0〜1+）。割当 0 や現項目無しでは undefined。 */
export function getProgressRate(state: TimerState): number | undefined {
  const item = getCurrentItem(state);
  if (item === undefined || item.allocatedSec <= 0) return undefined;
  return state.elapsedInItemSec / item.allocatedSec;
}

/** 次の項目。現項目が最後（または範囲外）なら undefined。 */
export function getNextItem(state: TimerState): AgendaItem | undefined {
  return state.agenda[state.currentIndex + 1];
}

/** アジェンダ全体の残り秒（当初計画合計 - 累積実績）。負なら全体超過。 */
export function getTotalRemainingSec(state: TimerState): number {
  return state.totalPlannedSec - state.totalElapsedSec;
}

/**
 * 全体スケジュール基準の押し/巻き秒。正なら押し、負なら巻き。
 *
 * 累積実績と「予定上の同時点経過（完了項目の plannedSec 合計 + 現項目経過）」の差 =
 * (完了項目の実績 - plannedSec) の合計 + max(0, 現項目の plannedSec 超過分)。
 * 現項目内の巻きは advanceItem で確定するまで反映せず（まだ時間を使い切りうるため）、
 * 押しは即時反映する（使った時間は戻らない）。基準は再配分で変わる allocatedSec ではなく
 * 当初計画の plannedSec（allocatedSec は再配分で常に帳尻が合い偏差が見えないため）。
 */
export function getScheduleOverUnderSec(state: TimerState): number {
  const completedPlannedSec = state.agenda
    .slice(0, state.currentIndex)
    .reduce((sum, item) => sum + item.plannedSec, 0);
  const currentPlannedSec = state.agenda[state.currentIndex]?.plannedSec ?? 0;
  const plannedElapsedSec =
    completedPlannedSec + Math.min(state.elapsedInItemSec, currentPlannedSec);
  return state.totalElapsedSec - plannedElapsedSec;
}

/** 押し/巻きの度合い。safe=余裕 / warning=残りわずか / over=超過。 */
export type PaceLevel = "safe" | "warning" | "over";

/** warning 判定のしきい値（進捗率）。docs/06 に数値既定が無いためここで一元定義する。 */
export const PACE_WARNING_RATE = 0.8;

/**
 * 進捗率から押し/巻きレベルを導出する（docs/06: 緑/黄/赤 の 3 段階）。
 * 進捗率が導出できない状態（現項目無し・割当 0）では undefined。
 */
export function getPaceLevel(state: TimerState): PaceLevel | undefined {
  const rate = getProgressRate(state);
  if (rate === undefined) return undefined;
  if (rate >= 1) return "over";
  if (rate >= PACE_WARNING_RATE) return "warning";
  return "safe";
}
