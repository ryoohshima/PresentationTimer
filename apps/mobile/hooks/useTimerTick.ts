import { useTimerStore } from "@presentation-timer/store";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

// 実時刻基準の tick 駆動（Issue #21, docs/05: 時間計測は UI 層の責務、エンジンは純粋関数）。
//
// バックグラウンドでは OS が JS 実行をサスペンドし setInterval が発火しないため、
// 「発火回数 = 経過秒」とみなす方式では不在時間がまるごと計時から漏れる。
// そこで基準時刻（anchor）からの実経過を Date.now() で逆算し、確定した秒数だけ
// tick(deltaSec) でまとめて送る。foreground 復帰時（AppState change）にも同じ精算を
// 走らせることで、復帰直後に不在分が一括反映される。interval 自体のドリフトも
// 実時刻から逆算するため累積しない。

// 秒の確定を検知するポーリング間隔。1 秒ちょうどだと発火ジッタで表示が 1 秒飛ぶことが
// あるため、表示解像度（1 秒）より短くする。flush は未確定なら何もしないので安価。
const TICK_INTERVAL_MS = 250;

/** タイマー実行画面でマウントし、running 中のみ実経過秒を tick で dispatch するフック。 */
export function useTimerTick(): void {
  const { state, tick } = useTimerStore();
  const isRunning = state.status === "running";
  // 未精算区間の起点（ms）。effect 再実行をまたいで端数を持ち越すため ref に置く。
  const anchorMsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      anchorMsRef.current = null;
      return;
    }
    anchorMsRef.current = Date.now();

    // anchor からの経過を秒単位で確定して dispatch する。端数ミリ秒は anchor に残す。
    const flush = () => {
      const anchorMs = anchorMsRef.current;
      if (anchorMs === null) {
        return;
      }
      const deltaSec = Math.floor((Date.now() - anchorMs) / 1000);
      if (deltaSec <= 0) {
        return;
      }
      anchorMsRef.current = anchorMs + deltaSec * 1000;
      tick(deltaSec);
    };

    const intervalId = setInterval(flush, TICK_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (status) => {
      // サスペンド中に溜まった不在時間を復帰直後に一括精算する
      if (status === "active") {
        flush();
      }
    });
    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [isRunning, tick]);
}
