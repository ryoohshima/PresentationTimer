import type { ReactNode } from "react";
import { TimerDispatchContext, TimerStateContext, useTimerReducer } from "./useTimerStore";

interface Props {
  children: ReactNode;
}

/** ルートに配置し、TimerState を全子コンポーネントに提供する。 */
export function TimerProvider({ children }: Props) {
  const [state, dispatch] = useTimerReducer();
  return (
    <TimerStateContext.Provider value={state}>
      <TimerDispatchContext.Provider value={dispatch}>{children}</TimerDispatchContext.Provider>
    </TimerStateContext.Provider>
  );
}
