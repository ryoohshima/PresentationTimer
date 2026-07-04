// タイマーエンジン: 副作用を持たない純粋関数の集合（docs/05-core-logic.md）。
// 「現在の状態 + 入力 → 次の状態」を返すだけにし、時間計測や I/O は UI 層の責務とする。

import type { AgendaItem, TimerState } from "@agenda-timer/types";

/** 再配分後の 1 項目あたりの割当下限（秒）。これ未満には圧縮しない。 */
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
  };
}

/** idle から計測を開始する。先頭項目・経過 0 にリセットする。 */
export function start(state: TimerState): TimerState {
  return { ...state, status: "running", currentIndex: 0, elapsedInItemSec: 0 };
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
  return { ...state, elapsedInItemSec: state.elapsedInItemSec + deltaSec };
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
 * plannedSec 比で delta を配分し、MIN_ALLOCATED_SEC でクランプして整数秒に丸める。
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

    let newAllocatedSec: number;
    if (index === lastPoolIndex) {
      // 残差吸収: 前項目の丸め誤差をここで吸収して合計を目標値に合わせる
      newAllocatedSec = Math.max(MIN_ALLOCATED_SEC, targetTotal - sumAllocated);
    } else {
      const share = poolPlannedTotal === 0 ? 1 / pool.length : item.plannedSec / poolPlannedTotal;
      newAllocatedSec = Math.round(Math.max(MIN_ALLOCATED_SEC, item.allocatedSec - delta * share));
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
