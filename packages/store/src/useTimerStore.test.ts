// timerReducer が状態更新をすべて @agenda-timer/core-logic に委譲することを検証する
// （Issue #15 受け入れ基準②）。reducer は純粋関数のため React 描画なしで直接テストできる。

import * as engine from "@agenda-timer/core-logic";
import type { AgendaItem } from "@agenda-timer/types";
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
  });

  test("ADVANCE_ITEM は engine.advanceItem に委譲する", () => {
    const running = runningState();
    expect(timerReducer(running, { type: "ADVANCE_ITEM" })).toEqual(engine.advanceItem(running));
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
