// タイマーエンジン: 副作用を持たない純粋関数の集合（docs/05-core-logic.md）。
// 「現在の状態 + 入力 → 次の状態」を返すだけにし、時間計測や I/O は UI 層の責務とする。

import type { AgendaItem, TimerState } from '@agenda-timer/types';

/** 再配分後の 1 項目あたりの割当下限（秒）。これ未満には圧縮しない。 */
export const MIN_ALLOCATED_SEC = 30;

// --- 制御系（状態遷移） ---------------------------------------------------

/** idle から計測を開始する。先頭項目・経過 0 にリセットする。 */
export function start(state: TimerState): TimerState {
  return { ...state, status: 'running', currentIndex: 0, elapsedInItemSec: 0 };
}

/** 計測を一時停止する。running 以外では状態を変えない。 */
export function pause(state: TimerState): TimerState {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused' };
}

/** 一時停止から再開する。paused 以外では状態を変えない。 */
export function resume(state: TimerState): TimerState {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'running' };
}

/** 経過時間を加算する（UI の tick から毎秒呼ぶ想定）。running 時のみ進む。 */
export function tick(state: TimerState, deltaSec: number): TimerState {
  if (state.status !== 'running') return state;
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
    status: isLast ? 'finished' : redistributed.status,
  };
}

/**
 * 現項目で生じた過不足を残項目の allocatedSec へ反映する（advanceItem 内部から利用）。
 *
 * TODO(MVP): proportional / fixed-end の再配分アルゴリズムを実装する（docs/05-core-logic.md）。
 * 現状は再配分を行わず state をそのまま返すプレースホルダ（= off モード相当）であり、
 * advanceItem の項目進行ロジックのみが有効。
 */
export function redistribute(state: TimerState): TimerState {
  return state;
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
