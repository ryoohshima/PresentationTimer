// @agenda-timer/store への再エクスポート。web 固有の追加ロジックはない。
export {
  useTimerStore,
  useTimerReducer,
  DEFAULT_TIMER_STATE,
  timerReducer,
  TimerStateContext,
  TimerDispatchContext,
} from "@agenda-timer/store";
export type { TimerStore, TimerAction } from "@agenda-timer/store";
