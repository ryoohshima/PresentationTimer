// @presentation-timer/store への再エクスポート。web 固有の追加ロジックはない。

export type { TimerAction, TimerStore } from "@presentation-timer/store";
export {
  DEFAULT_TIMER_STATE,
  TimerDispatchContext,
  TimerStateContext,
  timerReducer,
  useTimerReducer,
  useTimerStore,
} from "@presentation-timer/store";
