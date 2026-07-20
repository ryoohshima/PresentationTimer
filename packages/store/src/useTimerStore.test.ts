// timerReducer が状態更新をすべて @presentation-timer/core-logic に委譲することを検証する
// （Issue #15 受け入れ基準②）。reducer は純粋関数のため React 描画なしで直接テストできる。

import * as engine from "@presentation-timer/core-logic";
import type { AgendaItem } from "@presentation-timer/types";
import { describe, expect, test } from "vitest";
import { DEFAULT_TIMER_STATE, timerReducer } from "./useTimerStore";

const makeAgenda = (): AgendaItem[] => [
  { id: "1", title: "オープニング", plannedSec: 300, allocatedSec: 300, isLocked: false },
  { id: "2", title: "本編", plannedSec: 600, allocatedSec: 600, isLocked: false },
];

/** アジェンダ投入済み・running の state を組み立てる。 */
const runningState = () => {
  const loaded = timerReducer(DEFAULT_TIMER_STATE, { type: "SET_AGENDA", items: makeAgenda() });
  return timerReducer(loaded, { type: "START" });
};

describe("timerReducer の core-logic 委譲", () => {
  test("SET_AGENDA は engine.loadAgenda に委譲し、agenda と totalPlannedSec を反映する", () => {
    // Arrange
    const items = makeAgenda();

    // Act
    const next = timerReducer(DEFAULT_TIMER_STATE, { type: "SET_AGENDA", items });

    // Assert
    expect(next).toEqual(engine.loadAgenda(DEFAULT_TIMER_STATE, items));
    expect(next.totalPlannedSec).toBe(900);
    expect(next.status).toBe("idle");
  });

  test("START は engine.start に委譲する", () => {
    const loaded = timerReducer(DEFAULT_TIMER_STATE, { type: "SET_AGENDA", items: makeAgenda() });
    expect(timerReducer(loaded, { type: "START" })).toEqual(engine.start(loaded));
  });

  test("PAUSE / RESUME は engine.pause / engine.resume に委譲する", () => {
    const running = runningState();
    const paused = timerReducer(running, { type: "PAUSE" });
    expect(paused).toEqual(engine.pause(running));
    expect(timerReducer(paused, { type: "RESUME" })).toEqual(engine.resume(paused));
  });

  test("TICK は engine.tick に委譲して経過を加算する", () => {
    const running = runningState();
    const next = timerReducer(running, { type: "TICK", deltaSec: 10 });
    expect(next).toEqual(engine.tick(running, 10));
    expect(next.elapsedInItemSec).toBe(10);
    expect(next.totalElapsedSec).toBe(10);
  });

  test("ADVANCE_ITEM は engine.advanceItem に委譲する", () => {
    const running = runningState();
    expect(timerReducer(running, { type: "ADVANCE_ITEM" })).toEqual(engine.advanceItem(running));
  });
});

describe("アジェンダ編集アクション（Issue #16-#18）", () => {
  const loadedState = () =>
    timerReducer(DEFAULT_TIMER_STATE, { type: "SET_AGENDA", items: makeAgenda() });

  test("ADD_ITEM は末尾に新規項目を追加し、totalPlannedSec を再計算する", () => {
    const next = timerReducer(loadedState(), { type: "ADD_ITEM", title: "質疑応答" });

    expect(next.agenda).toHaveLength(3);
    const added = next.agenda[2];
    expect(added?.title).toBe("質疑応答");
    expect(added?.plannedSec).toBe(300);
    expect(added?.allocatedSec).toBe(300);
    expect(added?.isLocked).toBe(false);
    expect(next.totalPlannedSec).toBe(1200);
  });

  test("ADD_ITEM は plannedSec 指定時にその値で追加する（allocatedSec も同値）", () => {
    const next = timerReducer(loadedState(), {
      type: "ADD_ITEM",
      title: "休憩",
      plannedSec: 90,
    });

    const added = next.agenda[2];
    expect(added?.plannedSec).toBe(90);
    expect(added?.allocatedSec).toBe(90);
    expect(next.totalPlannedSec).toBe(990);
  });

  test("ADD_ITEM が生成する id は既存項目と重複しない", () => {
    let state = loadedState();
    for (let i = 0; i < 10; i += 1) {
      state = timerReducer(state, { type: "ADD_ITEM" });
    }
    const ids = state.agenda.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("REMOVE_ITEM は該当項目を削除し、totalPlannedSec を再計算する", () => {
    const next = timerReducer(loadedState(), { type: "REMOVE_ITEM", id: "1" });

    expect(next.agenda.map((item) => item.id)).toEqual(["2"]);
    expect(next.totalPlannedSec).toBe(600);
  });

  test("REMOVE_ITEM は存在しない id では state を変えない", () => {
    const state = loadedState();
    expect(timerReducer(state, { type: "REMOVE_ITEM", id: "nope" })).toBe(state);
  });

  test("MOVE_ITEM は項目を指定位置へ移動する", () => {
    const next = timerReducer(loadedState(), { type: "MOVE_ITEM", id: "2", toIndex: 0 });
    expect(next.agenda.map((item) => item.id)).toEqual(["2", "1"]);
  });

  test("MOVE_ITEM の範囲外 toIndex は端へクランプされる", () => {
    const next = timerReducer(loadedState(), { type: "MOVE_ITEM", id: "1", toIndex: 99 });
    expect(next.agenda.map((item) => item.id)).toEqual(["2", "1"]);
  });

  test("UPDATE_ITEM で plannedSec を変えると allocatedSec も同値になり合計が再計算される", () => {
    const next = timerReducer(loadedState(), {
      type: "UPDATE_ITEM",
      id: "1",
      patch: { plannedSec: 120 },
    });

    expect(next.agenda[0]?.plannedSec).toBe(120);
    expect(next.agenda[0]?.allocatedSec).toBe(120);
    expect(next.totalPlannedSec).toBe(720);
  });

  test("UPDATE_ITEM の負値・小数 plannedSec は 0 以上の整数へ正規化される", () => {
    const state = loadedState();
    const negative = timerReducer(state, {
      type: "UPDATE_ITEM",
      id: "1",
      patch: { plannedSec: -10 },
    });
    expect(negative.agenda[0]?.plannedSec).toBe(0);

    const fractional = timerReducer(state, {
      type: "UPDATE_ITEM",
      id: "1",
      patch: { plannedSec: 90.9 },
    });
    expect(fractional.agenda[0]?.plannedSec).toBe(90);
  });

  test("UPDATE_ITEM でタイトルのみ変更しても時間は変わらない", () => {
    const next = timerReducer(loadedState(), {
      type: "UPDATE_ITEM",
      id: "2",
      patch: { title: "本編（改）" },
    });

    expect(next.agenda[1]?.title).toBe("本編（改）");
    expect(next.agenda[1]?.plannedSec).toBe(600);
    expect(next.totalPlannedSec).toBe(900);
  });

  test("TOGGLE_LOCK は isLocked を反転する", () => {
    const once = timerReducer(loadedState(), { type: "TOGGLE_LOCK", id: "1" });
    expect(once.agenda[0]?.isLocked).toBe(true);

    const twice = timerReducer(once, { type: "TOGGLE_LOCK", id: "1" });
    expect(twice.agenda[0]?.isLocked).toBe(false);
  });

  test("編集アクションは running 状態を idle に戻す（loadAgenda 委譲のため）", () => {
    const running = runningState();
    const next = timerReducer(running, { type: "ADD_ITEM" });
    expect(next.status).toBe("idle");
    expect(next.currentIndex).toBe(0);
    expect(next.elapsedInItemSec).toBe(0);
  });
});

describe("受け入れ基準: 編集で組んだ agenda が実行画面に反映される", () => {
  test("SET_AGENDA 後、実行画面が参照する getCurrentItem に先頭項目が現れる", () => {
    // Arrange: 編集画面でアジェンダを確定する
    const next = timerReducer(DEFAULT_TIMER_STATE, { type: "SET_AGENDA", items: makeAgenda() });

    // Assert: 実行画面（App）は getCurrentItem で現在項目を表示する
    expect(engine.getCurrentItem(next)?.title).toBe("オープニング");
  });
});
