import type { AgendaItem, TimerState } from "@presentation-timer/types";
import { describe, expect, test } from "vitest";
import {
  advanceItem,
  getCurrentItem,
  getNextItem,
  getOverUnderSec,
  getPaceLevel,
  getProgressRate,
  getRemainingSec,
  getScheduleOverUnderSec,
  getTotalRemainingSec,
  loadAgenda,
  MIN_ALLOCATED_SEC,
  pause,
  redistribute,
  resume,
  start,
  tick,
} from "./timerEngine";

const makeAgenda = (): AgendaItem[] => [
  { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
  { id: "b", title: "B", plannedSec: 180, allocatedSec: 180, isLocked: false },
];

const makeState = (overrides: Partial<TimerState> = {}): TimerState => ({
  agenda: makeAgenda(),
  currentIndex: 0,
  status: "idle",
  elapsedInItemSec: 0,
  totalElapsedSec: 0,
  totalPlannedSec: 480,
  reallocationMode: "proportional",
  ...overrides,
});

describe("loadAgenda によるアジェンダ読み込み", () => {
  test("totalPlannedSec を plannedSec 合計で再計算する", () => {
    // Arrange
    const items = makeAgenda(); // 300 + 180

    // Act
    const next = loadAgenda(makeState(), items);

    // Assert
    expect(next.agenda).toBe(items);
    expect(next.totalPlannedSec).toBe(480);
  });

  test("status・currentIndex・elapsedInItemSec を計測前の初期値にリセットする", () => {
    // Arrange
    const state = makeState({
      status: "running",
      currentIndex: 1,
      elapsedInItemSec: 99,
    });

    // Act
    const next = loadAgenda(state, makeAgenda());

    // Assert
    expect(next.status).toBe("idle");
    expect(next.currentIndex).toBe(0);
    expect(next.elapsedInItemSec).toBe(0);
  });

  test("空配列では totalPlannedSec が 0 になる", () => {
    const next = loadAgenda(makeState(), []);
    expect(next.agenda).toEqual([]);
    expect(next.totalPlannedSec).toBe(0);
  });

  test("元の state を破壊しない（イミュータブル）", () => {
    // Arrange
    const state = makeState({ status: "running", elapsedInItemSec: 42 });

    // Act
    loadAgenda(state, []);

    // Assert
    expect(state.status).toBe("running");
    expect(state.elapsedInItemSec).toBe(42);
    expect(state.totalPlannedSec).toBe(480);
  });
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
    expect(next.agenda[1]?.allocatedSec).toBe(244);
    expect(next.agenda[2]?.allocatedSec).toBe(146);
    expect(state.agenda[1]?.allocatedSec).toBe(300); // イミュータブル
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
    expect(next.agenda[1]?.allocatedSec).toBe(356);
    expect(next.agenda[2]?.allocatedSec).toBe(214);
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
    expect(next.agenda[1]?.allocatedSec).toBe(300); // ロック済み、不変
    expect(next.agenda[2]?.allocatedSec).toBe(90);
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
    expect(next.agenda[1]?.allocatedSec).toBe(MIN_ALLOCATED_SEC);
  });

  test("巻きでは MIN_ALLOCATED_SEC 未満の項目が引き上げられない（項目1=10秒を5秒で確定）", () => {
    // delta=-5（巻き）。B は残差吸収枝: 下限は min(30, 5)=5 なので max が効かず 5+5=10 になる。
    // 旧実装では max(30, 10)=30 となり「残り30秒」と表示されていた（報告バグの再現）
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 10, allocatedSec: 10, isLocked: false },
      { id: "b", title: "B", plannedSec: 5, allocatedSec: 5, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 5,
      totalPlannedSec: 15,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]?.allocatedSec).toBe(10);
  });

  test("押しでは MIN_ALLOCATED_SEC 未満の項目も全体残りまで圧縮される（項目1=10秒を12秒で確定）", () => {
    // delta=+2（押し）。B は 30 秒未満なので下限は 0 となり、5-2=3 へ圧縮される。
    // 旧実装では下限 min(30, 5)=5 が現割当を固定し「残り5秒」のままだった（報告バグの再現）
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 10, allocatedSec: 10, isLocked: false },
      { id: "b", title: "B", plannedSec: 5, allocatedSec: 5, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 12,
      totalPlannedSec: 15,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]?.allocatedSec).toBe(3);
  });

  test("押しが残割当を超える場合、MIN_ALLOCATED_SEC 未満の項目は 0 でクランプされ負にならない", () => {
    // delta=+10（押し）。targetTotal = 5-10 = -5 だが下限 0 でクランプ
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 10, allocatedSec: 10, isLocked: false },
      { id: "b", title: "B", plannedSec: 5, allocatedSec: 5, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 20,
      totalPlannedSec: 15,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]?.allocatedSec).toBe(0);
  });

  test("押しの比例配分枝（残差吸収でない項目）でも MIN_ALLOCATED_SEC 未満の項目が圧縮される", () => {
    // delta=+2, pool: B(5), C(5), poolPlannedTotal=10
    // B: round(max(0, 5 - 2*(5/10))) = 4, C (残差吸収): (10-2) - 4 = 4
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 10, allocatedSec: 10, isLocked: false },
      { id: "b", title: "B", plannedSec: 5, allocatedSec: 5, isLocked: false },
      { id: "c", title: "C", plannedSec: 5, allocatedSec: 5, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 12,
      totalPlannedSec: 20,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]?.allocatedSec).toBe(4);
    expect(next.agenda[2]?.allocatedSec).toBe(4);
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

  test("poolPlannedTotal が 0 のとき均等配分にフォールバックする", () => {
    // 全プール項目の plannedSec=0 → ゼロ除算回避のため均等配分
    // delta=60, pool: B(plannedSec=0, alloc=120), C(plannedSec=0, alloc=120)
    // B: round(max(30, 120 - 60*(1/2))) = round(90) = 90
    // C (last): remaining = (240-60) - 90 = 90
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
      { id: "b", title: "B", plannedSec: 0, allocatedSec: 120, isLocked: false },
      { id: "c", title: "C", plannedSec: 0, allocatedSec: 120, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 360,
      totalPlannedSec: 300,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]?.allocatedSec).toBe(90);
    expect(next.agenda[2]?.allocatedSec).toBe(90);
  });

  test("丸め残差は最後のプール項目で吸収される", () => {
    // delta=1, プール3項目（plannedSec均等）→ 各項目に 1/3 ずつ配分
    // B: round(max(30, 100 - 1/3)) = round(99.67) = 100
    // C: round(max(30, 100 - 1/3)) = round(99.67) = 100
    // D (last): remaining = (300-1) - 100 - 100 = 99（残差吸収）
    const agenda: AgendaItem[] = [
      { id: "a", title: "A", plannedSec: 300, allocatedSec: 300, isLocked: false },
      { id: "b", title: "B", plannedSec: 100, allocatedSec: 100, isLocked: false },
      { id: "c", title: "C", plannedSec: 100, allocatedSec: 100, isLocked: false },
      { id: "d", title: "D", plannedSec: 100, allocatedSec: 100, isLocked: false },
    ];
    const state = makeState({
      agenda,
      currentIndex: 0,
      elapsedInItemSec: 301,
      totalPlannedSec: 600,
      status: "running",
    });
    const next = redistribute(state);
    expect(next.agenda[1]?.allocatedSec).toBe(100);
    expect(next.agenda[2]?.allocatedSec).toBe(100);
    expect(next.agenda[3]?.allocatedSec).toBe(99);
    // プール合計が poolAllocatedTotal - delta = 300 - 1 = 299 に一致する
    const poolTotal = [1, 2, 3].reduce((s, i) => s + (next.agenda[i]?.allocatedSec ?? 0), 0);
    expect(poolTotal).toBe(299);
  });
});

describe("実行をまたぐ再配分の累積防止（Issue #98）", () => {
  /** 先頭項目を overSec だけ押して確定し、残りは割当どおりに消費して finished まで進める。 */
  const runSession = (initial: TimerState, overSec: number): TimerState => {
    let state = start(initial);
    state = advanceItem({
      ...state,
      elapsedInItemSec: (state.agenda[0]?.allocatedSec ?? 0) + overSec,
    });
    while (state.status !== "finished") {
      state = advanceItem({
        ...state,
        elapsedInItemSec: state.agenda[state.currentIndex]?.allocatedSec ?? 0,
      });
    }
    return state;
  };

  const makeState3 = (overrides: Partial<TimerState> = {}): TimerState =>
    makeState({ agenda: makeAgenda3(), totalPlannedSec: 780, ...overrides });

  test("start は前回実行で書き換わった allocatedSec を plannedSec へ戻す", () => {
    // Arrange: A を 90 秒押しで確定した実行を 1 回終える
    const finished = runSession(makeState3(), 90);
    expect(finished.agenda.map((item) => item.allocatedSec)).toEqual([300, 244, 146]);

    // Act
    const restarted = start(finished);

    // Assert
    expect(restarted.agenda.map((item) => item.allocatedSec)).toEqual([300, 300, 180]);
  });

  test("同じ押し方で 2 回実行しても再配分結果が一致する", () => {
    // Arrange & Act
    const first = runSession(makeState3(), 90);
    const second = runSession(first, 90);

    // Assert
    expect(second.agenda).toEqual(first.agenda);
  });

  test("off モードでも start は割当を計画値へ戻す", () => {
    // Arrange: proportional で実行した後に「再配分しない」へ切り替える
    const finished = runSession(makeState3(), 90);

    // Act
    const restarted = start({ ...finished, reallocationMode: "off" });

    // Assert
    expect(restarted.agenda.map((item) => item.allocatedSec)).toEqual([300, 300, 180]);
  });

  test("割当が計画値と一致していれば agenda を同一参照で返す", () => {
    const state = makeState3();
    expect(start(state).agenda).toBe(state.agenda);
  });
});

describe("totalElapsedSec の遷移（全体スケジュール基準の実績）", () => {
  test("tick は totalElapsedSec も加算する", () => {
    const next = tick(makeState({ status: "running", totalElapsedSec: 100 }), 1);
    expect(next.totalElapsedSec).toBe(101);
  });

  test("running 以外では加算しない", () => {
    const next = tick(makeState({ status: "paused", totalElapsedSec: 100 }), 1);
    expect(next.totalElapsedSec).toBe(100);
  });

  test("start / loadAgenda は totalElapsedSec を 0 リセットする", () => {
    const state = makeState({ totalElapsedSec: 100 });
    expect(start(state).totalElapsedSec).toBe(0);
    expect(loadAgenda(state, makeAgenda()).totalElapsedSec).toBe(0);
  });

  test("advanceItem 後も totalElapsedSec は維持される", () => {
    const state = makeState({ status: "running", elapsedInItemSec: 120, totalElapsedSec: 120 });
    const next = advanceItem(state);
    expect(next.totalElapsedSec).toBe(120);
    expect(next.elapsedInItemSec).toBe(0);
  });
});

describe("getTotalRemainingSec / getScheduleOverUnderSec（全体基準セレクタ）", () => {
  test("getTotalRemainingSec は当初計画合計 - 累積実績を返し、超過で負になる", () => {
    expect(getTotalRemainingSec(makeState({ totalElapsedSec: 100 }))).toBe(380);
    expect(getTotalRemainingSec(makeState({ totalElapsedSec: 500 }))).toBe(-20);
  });

  test("現項目が予定内なら完了項目の偏差のみを返す（項目内の巻きは未確定扱い）", () => {
    // A(planned 300) を 200 秒で確定 → 巻き 100。B 進行中 50 秒（planned 180 未満）
    const state = makeState({ currentIndex: 1, elapsedInItemSec: 50, totalElapsedSec: 250 });
    expect(getScheduleOverUnderSec(state)).toBe(-100);
  });

  test("現項目が予定超過なら超過分が上乗せされる（押しは即時反映）", () => {
    // A を予定どおり 300 秒で確定。B 進行中 200 秒（planned 180 を 20 秒超過）
    const state = makeState({ currentIndex: 1, elapsedInItemSec: 200, totalElapsedSec: 500 });
    expect(getScheduleOverUnderSec(state)).toBe(20);
  });

  test("進行中の先頭項目が予定内のあいだは 0 を保つ", () => {
    const state = makeState({ status: "running", elapsedInItemSec: 100, totalElapsedSec: 100 });
    expect(getScheduleOverUnderSec(state)).toBe(0);
  });

  test("finished では累積実績 - 当初計画合計になる", () => {
    // 全項目確定済み（currentIndex = agenda.length）。実績合計 520 vs 計画 480 → 押し 40
    const state = makeState({ status: "finished", currentIndex: 2, totalElapsedSec: 520 });
    expect(getScheduleOverUnderSec(state)).toBe(40);
  });

  test("空アジェンダ・idle では 0 を返す", () => {
    const state = makeState({ agenda: [], totalPlannedSec: 0 });
    expect(getScheduleOverUnderSec(state)).toBe(0);
    expect(getTotalRemainingSec(state)).toBe(0);
  });
});

describe("getNextItem / getPaceLevel（画面②用セレクタ, Issue #22 #24）", () => {
  test("getNextItem は currentIndex+1 の項目を返す", () => {
    const state = makeState({ currentIndex: 0 });
    expect(getNextItem(state)?.id).toBe("b");
  });

  test("getNextItem は最終項目では undefined を返す", () => {
    const state = makeState({ currentIndex: 1 });
    expect(getNextItem(state)).toBeUndefined();
  });

  test("getPaceLevel は進捗率に応じて safe / warning / over を返す", () => {
    // 割当 300 秒: 210 秒 (70%) = safe, 240 秒 (80%) = warning, 300 秒 (100%) = over
    expect(getPaceLevel(makeState({ elapsedInItemSec: 210, status: "running" }))).toBe("safe");
    expect(getPaceLevel(makeState({ elapsedInItemSec: 240, status: "running" }))).toBe("warning");
    expect(getPaceLevel(makeState({ elapsedInItemSec: 300, status: "running" }))).toBe("over");
    expect(getPaceLevel(makeState({ elapsedInItemSec: 330, status: "running" }))).toBe("over");
  });

  test("getPaceLevel は現項目が無い（finished 等）と undefined を返す", () => {
    const state = makeState({ currentIndex: 2, status: "finished" });
    expect(getPaceLevel(state)).toBeUndefined();
  });
});
