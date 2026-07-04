// @agenda-timer/store への再エクスポート。web 固有の追加ロジックはない。

export type { TimerAction, TimerStore } from "@agenda-timer/store";
export {
  DEFAULT_TIMER_STATE,
  TimerDispatchContext,
  TimerStateContext,
  timerReducer,
  useTimerReducer,
  useTimerStore,
} from "@agenda-timer/store";
