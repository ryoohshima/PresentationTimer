import { describe, expect, test } from 'vitest';
import type { AgendaItem, TimerState } from '@agenda-timer/types';
import {
  advanceItem,
  getCurrentItem,
  getOverUnderSec,
  getProgressRate,
  getRemainingSec,
  pause,
  resume,
  start,
  tick,
} from './timerEngine.js';

const makeAgenda = (): AgendaItem[] => [
  { id: 'a', title: 'A', plannedSec: 300, allocatedSec: 300, isLocked: false },
  { id: 'b', title: 'B', plannedSec: 180, allocatedSec: 180, isLocked: false },
];

const makeState = (overrides: Partial<TimerState> = {}): TimerState => ({
  agenda: makeAgenda(),
  currentIndex: 0,
  status: 'idle',
  elapsedInItemSec: 0,
  totalPlannedSec: 480,
  reallocationMode: 'proportional',
  ...overrides,
});

describe('制御系の状態遷移', () => {
  test('start は idle を running にし、先頭項目・経過 0 にする', () => {
    // Arrange
    const state = makeState({ currentIndex: 1, elapsedInItemSec: 42 });

    // Act
    const next = start(state);

    // Assert
    expect(next.status).toBe('running');
    expect(next.currentIndex).toBe(0);
    expect(next.elapsedInItemSec).toBe(0);
  });

  test('pause は running のときだけ paused にする', () => {
    expect(pause(makeState({ status: 'running' })).status).toBe('paused');
    expect(pause(makeState({ status: 'idle' })).status).toBe('idle');
  });

  test('resume は paused のときだけ running にする', () => {
    expect(resume(makeState({ status: 'paused' })).status).toBe('running');
    expect(resume(makeState({ status: 'finished' })).status).toBe('finished');
  });

  test('start は元の state を破壊しない（イミュータブル）', () => {
    // Arrange
    const state = makeState({ elapsedInItemSec: 10 });

    // Act
    start(state);

    // Assert
    expect(state.elapsedInItemSec).toBe(10);
    expect(state.status).toBe('idle');
  });
});

describe('tick による経過加算', () => {
  test('running 中は deltaSec を加算する', () => {
    const next = tick(makeState({ status: 'running', elapsedInItemSec: 5 }), 1);
    expect(next.elapsedInItemSec).toBe(6);
  });

  test('paused 中は加算しない', () => {
    const next = tick(makeState({ status: 'paused', elapsedInItemSec: 5 }), 1);
    expect(next.elapsedInItemSec).toBe(5);
  });
});

describe('advanceItem による項目進行', () => {
  test('途中項目では currentIndex を進め、経過を 0 リセットし running を維持する', () => {
    // Arrange
    const state = makeState({ status: 'running', currentIndex: 0, elapsedInItemSec: 120 });

    // Act
    const next = advanceItem(state);

    // Assert
    expect(next.currentIndex).toBe(1);
    expect(next.elapsedInItemSec).toBe(0);
    expect(next.status).toBe('running');
  });

  test('最終項目を確定すると finished になり currentIndex は agenda.length になる', () => {
    // Arrange
    const state = makeState({ status: 'running', currentIndex: 1, elapsedInItemSec: 60 });

    // Act
    const next = advanceItem(state);

    // Assert
    expect(next.status).toBe('finished');
    expect(next.currentIndex).toBe(2);
    expect(next.currentIndex).toBe(state.agenda.length);
  });
});

describe('派生値セレクタ', () => {
  test('getRemainingSec は割当 - 経過を返す', () => {
    const state = makeState({ elapsedInItemSec: 100 }); // 割当 300
    expect(getRemainingSec(state)).toBe(200);
  });

  test('getOverUnderSec は押しで正・巻きで負を返す', () => {
    expect(getOverUnderSec(makeState({ elapsedInItemSec: 330 }))).toBe(30); // 押し
    expect(getOverUnderSec(makeState({ elapsedInItemSec: 250 }))).toBe(-50); // 巻き
  });

  test('getProgressRate は経過 / 割当を返す', () => {
    expect(getProgressRate(makeState({ elapsedInItemSec: 150 }))).toBe(0.5);
  });

  test('finished（範囲外）では現項目セレクタが undefined を返す', () => {
    const state = makeState({ status: 'finished', currentIndex: 2 });
    expect(getCurrentItem(state)).toBeUndefined();
    expect(getRemainingSec(state)).toBeUndefined();
    expect(getProgressRate(state)).toBeUndefined();
  });
});
