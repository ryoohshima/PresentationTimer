import { getCurrentItem, getRemainingSec } from "@agenda-timer/core-logic";
import { useTimerStore } from "@agenda-timer/store";
import { useEffect } from "react";

export function App() {
  const { state, setAgenda, start, pause, resume, tick } = useTimerStore();

  // 初回マウント時にサンプルアジェンダをセットする（編集画面が実装されるまでの仮データ）
  useEffect(() => {
    setAgenda([
      { id: "1", title: "オープニング", plannedSec: 300, allocatedSec: 300, isLocked: false },
      { id: "2", title: "本編", plannedSec: 600, allocatedSec: 600, isLocked: false },
    ]);
  }, [setAgenda]);

  const currentItem = getCurrentItem(state);
  const remainingSec = getRemainingSec(state);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Agenda Timer</h1>
      <p>
        グローバルストア（@agenda-timer/store）経由で TimerState を管理しているでござる。
      </p>
      <dl>
        <dt>ステータス</dt>
        <dd>{state.status}</dd>
        <dt>現在の項目</dt>
        <dd>{currentItem?.title ?? "—"}</dd>
        <dt>残り時間</dt>
        <dd>{remainingSec ?? "—"} 秒</dd>
      </dl>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        {state.status === "idle" && <button type="button" onClick={start}>開始</button>}
        {state.status === "running" && <button type="button" onClick={pause}>一時停止</button>}
        {state.status === "paused" && <button type="button" onClick={resume}>再開</button>}
        {state.status === "running" && (
          <button type="button" onClick={() => tick(10)}>+10 秒</button>
        )}
      </div>
    </main>
  );
}
