import { useTimerStore } from "@presentation-timer/store";
import { useEffect } from "react";

// tick 駆動（Issue #21, docs/05: 時間計測は UI 層の責務、エンジンは純粋関数）。
// running の間だけ毎秒 tick(1) を送り、pause / アンマウントで interval を確実に解放する。

const TICK_INTERVAL_MS = 1000;

/** タイマー実行画面でマウントし、running 中のみ毎秒 tick を dispatch するフック。 */
export function useTimerTick(): void {
  const { state, tick } = useTimerStore();
  const isRunning = state.status === "running";

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const intervalId = setInterval(() => tick(1), TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);
}
