import {
  ACCENT_GREEN,
  ACCENT_GREEN_BRIGHT,
  FONT_DISPLAY,
  FONT_EYEBROW,
  GLASS_FILL,
  GLASS_SHADOW,
  GLASS_STROKE,
  glassBlur,
  INK,
} from "../tokens.js";
import { PillButton } from "./PillButton.js";

export interface TimerScreenProps {
  title?: string;
  time?: string;
  timeColor?: string;
  timeFontSize?: number;
  progressPercent?: number;
  progressColor?: string;
  statusLabel?: string;
  statusColor?: string;
  totalText?: string;
  nextText?: string;
}

// design.pen の AppTimerContent（WGRYW）。既定値はコンポーネント定義に一致
export function TimerScreen({
  title = "本編",
  time = "08:42",
  timeColor = INK,
  timeFontSize = 96,
  progressPercent = 48,
  progressColor = ACCENT_GREEN_BRIGHT,
  statusLabel = "巻き 00:30",
  statusColor = ACCENT_GREEN,
  totalText = "全体 残り 13:42 / 20:00",
  nextText = "次: 質疑応答（5:00）",
}: TimerScreenProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px 24px 20px",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{title}</div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: timeFontSize,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: timeFontSize >= 90 ? -2 : -1,
            color: timeColor,
          }}
        >
          {time}
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,0.4)",
            border: `1px solid ${GLASS_STROKE}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              borderRadius: 4,
              background: progressColor,
            }}
          />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(20,23,26,0.55)" }}>
          {totalText}
        </div>
      </div>

      <div
        style={{
          ...glassBlur(),
          background: GLASS_FILL,
          borderRadius: 16,
          border: `1px solid ${GLASS_STROKE}`,
          boxShadow: `0 6px 18px ${GLASS_SHADOW}`,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontFamily: FONT_EYEBROW,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "rgba(20,23,26,0.4)",
          }}
        >
          NEXT
        </div>
        <div style={{ fontSize: 15, color: "rgba(20,23,26,0.75)" }}>{nextText}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <PillButton label="一時停止" variant="glass" grow />
          <PillButton label="次へ" grow />
        </div>
        <div style={{ fontSize: 13, color: "rgba(20,23,26,0.55)" }}>編集に戻る</div>
      </div>
    </div>
  );
}
