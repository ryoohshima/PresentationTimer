// TimerState のグローバルストア（docs/04-data-model.md, docs/05-core-logic.md）。
// React Context + useReducer で実装し、状態更新はすべて @agenda-timer/core-logic 経由で行う。

import * as engine from "@agenda-timer/core-logic";
import type { AgendaItem, ReallocationMode, TimerState } from "@agenda-timer/types";
import { createContext, type Dispatch, useCallback, useContext, useReducer } from "react";

// --- アクション型 -----------------------------------------------------------

type Action =
  | { type: "SET_AGENDA"; items: AgendaItem[] }
  | { type: "ADD_ITEM"; title?: string; plannedSec?: number }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "MOVE_ITEM"; id: string; toIndex: number }
  | { type: "UPDATE_ITEM"; id: string; patch: { title?: string; plannedSec?: number } }
  | { type: "TOGGLE_LOCK"; id: string }
  | { type: "SET_REALLOCATION_MODE"; mode: ReallocationMode }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK"; deltaSec: number }
  | { type: "ADVANCE_ITEM" };

// --- アジェンダ編集ヘルパ ------------------------------------------------------

/** 新規項目のデフォルト予定時間（5 分）。 */
const DEFAULT_PLANNED_SEC = 300;

let itemSeq = 0;

/** 端末ローカルで一意になれば十分な項目 ID を生成する（crypto 非依存）。 */
function createItemId(): string {
  itemSeq += 1;
  return `item-${Date.now().toString(36)}-${itemSeq.toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`;
}

/** 秒数入力を 0 以上の整数へ正規化する。 */
function normalizeSec(sec: number): number {
  return Math.max(0, Math.trunc(sec));
}

function applyPatch(item: AgendaItem, patch: { title?: string; plannedSec?: number }): AgendaItem {
  const next = { ...item };
  if (patch.title !== undefined) {
    next.title = patch.title;
  }
  if (patch.plannedSec !== undefined) {
    const plannedSec = normalizeSec(patch.plannedSec);
    next.plannedSec = plannedSec;
    // 編集時点では再配分前なので allocatedSec は plannedSec と同値に保つ（docs/04）。
    next.allocatedSec = plannedSec;
  }
  return next;
}

function moveItem(items: AgendaItem[], id: string, toIndex: number): AgendaItem[] {
  const from = items.findIndex((item) => item.id === id);
  if (from === -1) {
    return items;
  }
  const to = Math.max(0, Math.min(items.length - 1, toIndex));
  if (from === to) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as AgendaItem);
  return next;
}

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
    // 編集系はいずれも「新しい items を組み立てて loadAgenda へ委譲」で統一する。
    // totalPlannedSec 再計算と idle リセットを一元化するため（編集は idle 中の操作前提, docs/06）。
    case "ADD_ITEM": {
      const plannedSec =
        action.plannedSec === undefined ? DEFAULT_PLANNED_SEC : normalizeSec(action.plannedSec);
      return engine.loadAgenda(state, [
        ...state.agenda,
        {
          id: createItemId(),
          title: action.title ?? "",
          plannedSec,
          allocatedSec: plannedSec,
          isLocked: false,
        },
      ]);
    }
    case "REMOVE_ITEM": {
      const items = state.agenda.filter((item) => item.id !== action.id);
      return items.length === state.agenda.length ? state : engine.loadAgenda(state, items);
    }
    case "MOVE_ITEM": {
      const items = moveItem(state.agenda, action.id, action.toIndex);
      return items === state.agenda ? state : engine.loadAgenda(state, items);
    }
    case "UPDATE_ITEM":
      return engine.loadAgenda(
        state,
        state.agenda.map((item) => (item.id === action.id ? applyPatch(item, action.patch) : item)),
      );
    case "TOGGLE_LOCK":
      return engine.loadAgenda(
        state,
        state.agenda.map((item) =>
          item.id === action.id ? { ...item, isLocked: !item.isLocked } : item,
        ),
      );
    case "SET_REALLOCATION_MODE":
      return { ...state, reallocationMode: action.mode };
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
  /** 末尾に新規項目を追加する（plannedSec 省略時はデフォルト 5 分）。 */
  addItem: (title?: string, plannedSec?: number) => void;
  /** 指定 ID の項目を削除する。 */
  removeItem: (id: string) => void;
  /** 指定 ID の項目を toIndex の位置へ移動する（範囲外はクランプ）。 */
  moveItem: (id: string, toIndex: number) => void;
  /** タイトル・予定時間を部分更新する。plannedSec 更新時は allocatedSec も同値になる。 */
  updateItem: (id: string, patch: { title?: string; plannedSec?: number }) => void;
  /** 再配分ロック（isLocked）を反転する。 */
  toggleLock: (id: string) => void;
  /** 再配分モードを設定する（設定画面）。 */
  setReallocationMode: (mode: ReallocationMode) => void;
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
  const addItem = useCallback(
    (title?: string, plannedSec?: number) => dispatch({ type: "ADD_ITEM", title, plannedSec }),
    [dispatch],
  );
  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", id }), [dispatch]);
  const moveItemAction = useCallback(
    (id: string, toIndex: number) => dispatch({ type: "MOVE_ITEM", id, toIndex }),
    [dispatch],
  );
  const updateItem = useCallback(
    (id: string, patch: { title?: string; plannedSec?: number }) =>
      dispatch({ type: "UPDATE_ITEM", id, patch }),
    [dispatch],
  );
  const toggleLock = useCallback((id: string) => dispatch({ type: "TOGGLE_LOCK", id }), [dispatch]);
  const setReallocationMode = useCallback(
    (mode: ReallocationMode) => dispatch({ type: "SET_REALLOCATION_MODE", mode }),
    [dispatch],
  );
  const start = useCallback(() => dispatch({ type: "START" }), [dispatch]);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), [dispatch]);
  const resume = useCallback(() => dispatch({ type: "RESUME" }), [dispatch]);
  const tick = useCallback((deltaSec: number) => dispatch({ type: "TICK", deltaSec }), [dispatch]);
  const advanceItem = useCallback(() => dispatch({ type: "ADVANCE_ITEM" }), [dispatch]);

  return {
    state,
    setAgenda,
    addItem,
    removeItem,
    moveItem: moveItemAction,
    updateItem,
    toggleLock,
    setReallocationMode,
    start,
    pause,
    resume,
    tick,
    advanceItem,
  };
}
