import {
  ACCENT_GREEN,
  ACCENT_RED,
  ACCENT_RED_DEEP,
  ACCENT_YELLOW,
  ACCENT_YELLOW_DEEP,
  FONT_EYEBROW,
} from "../tokens.js";
import { EyeIcon } from "./icons.js";
import { PhoneMock } from "./PhoneMock.js";
import { TimerScreen, type TimerScreenProps } from "./TimerScreen.js";

const VARIANTS: { id: string; mock: TimerScreenProps }[] = [
  { id: "green", mock: {} },
  {
    id: "yellow",
    mock: {
      time: "02:14",
      timeColor: ACCENT_YELLOW_DEEP,
      progressPercent: 79,
      progressColor: ACCENT_YELLOW,
      statusLabel: "定刻",
      statusColor: ACCENT_YELLOW_DEEP,
      totalText: "全体 残り 07:14 / 20:00",
    },
  },
  {
    id: "red",
    mock: {
      title: "質疑応答",
      time: "-01:30",
      timeColor: ACCENT_RED_DEEP,
      progressPercent: 100,
      progressColor: ACCENT_RED,
      statusLabel: "押し 01:30",
      statusColor: ACCENT_RED_DEEP,
      totalText: "全体 残り -01:30 / 20:00",
      nextText: "最後の項目です",
    },
  },
];

export function ScreenVariants() {
  return (
    <div
      id="screens"
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "clamp(64px, 12vw, 96px) clamp(20px, 5vw, 32px)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <EyeIcon size={18} color={ACCENT_GREEN} />
        <span
          style={{
            fontFamily: FONT_EYEBROW,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: ACCENT_GREEN,
          }}
        >
          遠くからでも読める
        </span>
      </div>
      <h2
        style={{
          fontSize: "clamp(26px, 8vw, 36px)",
          fontWeight: 900,
          margin: 0,
          textAlign: "center",
        }}
      >
        進捗をわかりやすく。
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "rgba(20,23,26,0.55)",
          fontSize: 16,
          margin: 0,
        }}
      >
        残り時間に応じて色が変わり、数字を読まなくても状況が伝わります。
      </p>

      <div
        style={{
          display: "flex",
          gap: 40,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 28,
        }}
      >
        {VARIANTS.map((variant) => (
          <PhoneMock key={variant.id} width={300} height={648}>
            <TimerScreen timeFontSize={64} {...variant.mock} />
          </PhoneMock>
        ))}
      </div>
    </div>
  );
}
