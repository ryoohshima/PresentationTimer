import type { TimerState } from '@agenda-timer/types';
import { start, getCurrentItem, getRemainingSec } from '@agenda-timer/core-logic';

// core-logic / types との配線確認用のサンプル状態。
// MVP のタイマー画面・アジェンダ編集画面は後続 Issue（docs/07）で実装する。
const sampleState: TimerState = start({
  agenda: [
    { id: '1', title: 'オープニング', plannedSec: 300, allocatedSec: 300, isLocked: false },
    { id: '2', title: '本編', plannedSec: 600, allocatedSec: 600, isLocked: false },
  ],
  currentIndex: 0,
  status: 'idle',
  elapsedInItemSec: 0,
  totalPlannedSec: 900,
  reallocationMode: 'proportional',
});

export function App() {
  const currentItem = getCurrentItem(sampleState);
  const remainingSec = getRemainingSec(sampleState);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Agenda Timer</h1>
      <p>apps/web の雛形が起動し、@agenda-timer/core-logic と接続できているでござる。</p>
      <dl>
        <dt>現在の項目</dt>
        <dd>{currentItem?.title ?? '—'}</dd>
        <dt>残り時間</dt>
        <dd>{remainingSec ?? '—'} 秒</dd>
      </dl>
    </main>
  );
}
