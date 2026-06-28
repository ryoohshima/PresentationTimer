// TimerState のグローバルストア（docs/04-data-model.md, docs/05-core-logic.md）。
// 状態更新はすべて @agenda-timer/core-logic の純粋関数を介して行う。

import * as engine from "@agenda-timer/core-logic";
import type { AgendaItem, TimerState } from "@agenda-timer/types";
import { create } from "zustand";

export interface TimerStore {
  state: TimerState;
  /** 編集画面でアジェンダを確定する。totalPlannedSec を再計算し、ステータスを idle にリセットする。 */
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

const DEFAULT_STATE: TimerState = {
  agenda: [],
  currentIndex: 0,
  status: "idle",
  elapsedInItemSec: 0,
  totalPlannedSec: 0,
  reallocationMode: "proportional",
};

export const useTimerStore = create<TimerStore>((set) => ({
  state: DEFAULT_STATE,
  setAgenda: (items) =>
    set(({ state }) => ({
      state: {
        ...state,
        agenda: items,
        totalPlannedSec: items.reduce((sum, item) => sum + item.plannedSec, 0),
        status: "idle",
        currentIndex: 0,
        elapsedInItemSec: 0,
      },
    })),
  start: () => set(({ state }) => ({ state: engine.start(state) })),
  pause: () => set(({ state }) => ({ state: engine.pause(state) })),
  resume: () => set(({ state }) => ({ state: engine.resume(state) })),
  tick: (deltaSec) => set(({ state }) => ({ state: engine.tick(state, deltaSec) })),
  advanceItem: () => set(({ state }) => ({ state: engine.advanceItem(state) })),
}));
