// TimerState のグローバルストア（docs/04-data-model.md, docs/05-core-logic.md）。
// React Context + useReducer で実装し、状態更新はすべて @agenda-timer/core-logic 経由で行う。

import * as engine from "@agenda-timer/core-logic";
import type { AgendaItem, TimerState } from "@agenda-timer/types";
import { createContext, type Dispatch, useCallback, useContext, useReducer } from "react";

// --- アクション型 -----------------------------------------------------------

type Action =
  | { type: "SET_AGENDA"; items: AgendaItem[] }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK"; deltaSec: number }
  | { type: "ADVANCE_ITEM" };

// --- リデューサ（core-logic への委譲） ----------------------------------------

const DEFAULT_STATE: TimerState = {
  agenda: [],
  currentIndex: 0,
  status: "idle",
  elapsedInItemSec: 0,
  totalPlannedSec: 0,
  reallocationMode: "proportional",
};

function timerReducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case "SET_AGENDA":
      return engine.loadAgenda(state, action.items);
    case "START":
      return engine.start(state);
    case "PAUSE":
      return engine.pause(state);
    case "RESUME":
      return engine.resume(state);
    case "TICK":
      return engine.tick(state, action.deltaSec);
    case "ADVANCE_ITEM":
      return engine.advanceItem(state);
  }
}

// --- Context ----------------------------------------------------------------

const StateContext = createContext<TimerState>(DEFAULT_STATE);
const DispatchContext = createContext<Dispatch<Action>>(() => undefined);

export { DispatchContext as TimerDispatchContext, StateContext as TimerStateContext };

// --- Provider ---------------------------------------------------------------

export type { Action as TimerAction };

export { DEFAULT_STATE as DEFAULT_TIMER_STATE, timerReducer };

/** ルートに配置してすべての子コンポーネントに TimerState を提供するプロバイダ。 */
export function useTimerReducer(): [TimerState, Dispatch<Action>] {
  return useReducer(timerReducer, DEFAULT_STATE);
}

// --- useTimerStore フック ---------------------------------------------------

export interface TimerStore {
  state: TimerState;
  /** 編集画面でアジェンダを確定する。totalPlannedSec を再計算し idle にリセットする。 */
  setAgenda: (items: AgendaItem[]) => void;
  /** idle → running。先頭項目・経過 0 にリセット。 */
  start: () => void;
  /** running → paused。 */
  pause: () => void;
  /** paused → running。 */
  resume: () => void;
  /** 経過時間を加算する（UI の tick から毎秒呼ぶ想定）。 */
  tick: (deltaSec: number) => void;
  /** 現項目を確定し、再配分してから次項目へ進む。 */
  advanceItem: () => void;
}

/**
 * TimerState へのアクセスと dispatch ラッパを返すフック。
 * TimerProvider の子コンポーネントで使う。
 */
export function useTimerStore(): TimerStore {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const setAgenda = useCallback(
    (items: AgendaItem[]) => dispatch({ type: "SET_AGENDA", items }),
    [dispatch],
  );
  const start = useCallback(() => dispatch({ type: "START" }), [dispatch]);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), [dispatch]);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), [dispatch]);
  const tick = useCallback((deltaSec: number) => dispatch({ type: "TICK", deltaSec }), [dispatch]);
  const advanceItem = useCallback(() => dispatch({ type: "ADVANCE_ITEM" }), [dispatch]);

  return { state, setAgenda, start, pause, resume, tick, advanceItem };
}
