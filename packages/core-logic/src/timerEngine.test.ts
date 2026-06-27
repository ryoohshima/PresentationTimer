import type { AgendaItem, TimerState } from "@agenda-timer/types";
import { describe, expect, test } from "vitest";
import {
  advanceItem,
  getCurrentItem,
  getOverUnderSec,
  getProgressRate,
  getRemainingSec,
  MIN_ALLOCATED_SEC,
  pause,
  redistribute,
  resume,
  start,
  tick,
} from "./timerEngine.js";

const makeAgenda = (): AgendaItem[] => [
  { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
  { id: "b", title: "B", plannedSec: 180, allocatedSec: 180, isLocked: false },
];

const makeState = (overrides: Partial<TimerState> = {}): TimerState => ({
  agenda: makeAgenda(),
  currentIndex: 0,
  status: "idle",
  elapsedInItemSec: 0,
  totalPlannedSec: 480,
  reallocationMode: "proportional",
  ...overrides,
});

describe("制御系の状態遷移", () => {
  test("start は idle を running にし、先頭項目・経過 0 にする", () => {
    // Arrange
    const state = makeState({ currentIndex: 1, elapsedInItemSec: 42 });

    // Act
    const next = start(state);

    // Assert
    expect(next.status).toBe("running");
    expect(next.currentIndex).toBe(0);
    expect(next.elapsedInItemSec).toBe(0);
  });

  test("pause は running のときだけ paused にする", () => {
    expect(pause(makeState({ status: "running" })).status).toBe("paused");
    expect(pause(makeState({ status: "idle" })).status).toBe("idle");
  });

  test("resume は paused のときだけ running にする", () => {
    expect(resume(makeState({ status: "paused" })).status).toBe("running");
    expect(resume(makeState({ status: "finished" })).status).toBe("finished");
  });

  test("start は元の state を破壊しない（イミュータブル）", () => {
    // Arrange
    const state = makeState({ elapsedInItemSec: 10 });

    // Act
    start(state);

    // Assert
    expect(state.elapsedInItemSec).toBe(10);
    expect(state.status).toBe("idle");
  });
});

describe("tick による経過加算", () => {
  test("running 中は deltaSec を加算する", () => {
    const next = tick(makeState({ status: "running", elapsedInItemSec: 5 }), 1);
    expect(next.elapsedInItemSec).toBe(6);
  });

  test("paused 中は加算しない", () => {
    const next = tick(makeState({ status: "paused", elapsedInItemSec: 5 }), 1);
    expect(next.elapsedInItemSec).toBe(5);
  });
});

describe("advanceItem による項目進行", () => {
  test("途中項目では currentIndex を進め、経過を 0 リセットし running を維持する", () => {
    // Arrange
    const state = makeState({ status: "running", currentIndex: 0, elapsedInItemSec: 120 });

    // Act
    const next = advanceItem(state);

    // Assert
    expect(next.currentIndex).toBe(1);
    expect(next.elapsedInItemSec).toBe(0);
    expect(next.status).toBe("running");
  });

  test("最終項目を確定すると finished になり currentIndex は agenda.length になる", () => {
    // Arrange
    const state = makeState({ status: "running", currentIndex: 1, elapsedInItemSec: 60 });

    // Act
    const next = advanceItem(state);

    // Assert
    expect(next.status).toBe("finished");
    expect(next.currentIndex).toBe(2);
    expect(next.currentIndex).toBe(state.agenda.length);
  });
});

describe("派生値セレクタ", () => {
  test("getRemainingSec は割当 - 経過を返す", () => {
    const state = makeState({ elapsedInItemSec: 100 }); // 割当 300
    expect(getRemainingSec(state)).toBe(200);
  });

  test("getOverUnderSec は押しで正・巻きで負を返す", () => {
    expect(getOverUnderSec(makeState({ elapsedInItemSec: 330 }))).toBe(30); // 押し
    expect(getOverUnderSec(makeState({ elapsedInItemSec: 250 }))).toBe(-50); // 巻き
  });

  test("getProgressRate は経過 / 割当を返す", () => {
    expect(getProgressRate(makeState({ elapsedInItemSec: 150 }))).toBe(0.5);
  });

  test("finished（範囲外）では現項目セレクタが undefined を返す", () => {
    const state = makeState({ status: "finished", currentIndex: 2 });
    expect(getCurrentItem(state)).toBeUndefined();
    expect(getRemainingSec(state)).toBeUndefined();
    expect(getProgressRate(state)).toBeUndefined();
  });
});

const makeAgenda3 = (): AgendaItem[] => [
  { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
  { id: "b", title: "B", plannedSec: 300, allocatedSec: 300, isLocked: false },
  { id: "c", title: "C", plannedSec: 180, allocatedSec: 180, isLocked: false },
];

describe("redistribute による比例再配分", () => {
  test("押し（delta > 0）で残項目 allocatedSec が plannedSec 比で圧縮される", () => {
    // currentItem A: allocatedSec=300, elapsed=390 → delta=+90
    // pool: B(300), C(180), total=480
    // B: round(max(30, 300 - 90*(300/480))) = round(243.75) = 244
    // C: round(max(30, 180 - 90*(180/480))) = round(146.25) = 146
    const state = makeState({
      agenda: makeAgenda3(),
      currentIndex: 0,
      elapsedInItemSec: 390,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]!.allocatedSec).toBe(244);
    expect(next.agenda[2]!.allocatedSec).toBe(146);
    expect(state.agenda[1]!.allocatedSec).toBe(300); // イミュータブル
  });

  test("巻き（delta < 0）で残項目 allocatedSec が plannedSec 比で緩む", () => {
    // currentItem A: allocatedSec=300, elapsed=210 → delta=-90
    // B: round(max(30, 300 - (-90)*(300/480))) = round(356.25) = 356
    // C: round(max(30, 180 - (-90)*(180/480))) = round(213.75) = 214
    const state = makeState({
      agenda: makeAgenda3(),
      currentIndex: 0,
      elapsedInItemSec: 210,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]!.allocatedSec).toBe(356);
    expect(next.agenda[2]!.allocatedSec).toBe(214);
  });

  test("過不足ゼロ（delta = 0）では allocatedSec が変化しない", () => {
    const state = makeState({
      agenda: makeAgenda3(),
      currentIndex: 0,
      elapsedInItemSec: 300,
      status: "running",
    });
    const next = redistribute(state);
    expect(next).toBe(state);
  });

  test("isLocked 項目は分母・配分から除外され他の項目で全量を吸収する", () => {
    // Pool: B はロックのため除外、C のみ吸収
    // C: round(max(30, 180 - 90*(180/180))) = round(90) = 90
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
      { id: "b", title: "B", plannedSec: 300, allocatedSec: 300, isLocked: true },
      { id: "c", title: "C", plannedSec: 180, allocatedSec: 180, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 390,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]!.allocatedSec).toBe(300); // ロック済み、不変
    expect(next.agenda[2]!.allocatedSec).toBe(90);
  });

  test("allocatedSec が MIN_ALLOCATED_SEC 未満になる場合はクランプされる", () => {
    // delta=400 → B: max(30, 60-400) = 30 = MIN_ALLOCATED_SEC
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
      { id: "b", title: "B", plannedSec: 60, allocatedSec: 60, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 700,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]!.allocatedSec).toBe(MIN_ALLOCATED_SEC);
  });

  test("再配分プールが空（全ロック）のとき state を変えない", () => {
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
      { id: "b", title: "B", plannedSec: 300, allocatedSec: 300, isLocked: true },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 390,
      status: "running",
    });
    const next = redistribute(state);
    expect(next).toBe(state);
  });

  test("reallocationMode が off のとき state を変えない", () => {
    const state = makeState({
      agenda: makeAgenda3(),
      currentIndex: 0,
      elapsedInItemSec: 390,
      reallocationMode: "off",
    });
    const next = redistribute(state);
    expect(next).toBe(state);
  });
});
