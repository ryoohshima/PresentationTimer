import { IOSDevice } from "./IOSDevice.js";
import { TimerMock, type TimerMockProps } from "./TimerMock.js";

const SCREEN_VARIANTS: {
  id: string;
  label: string;
  dark: boolean;
  mock: Omit<TimerMockProps, "size">;
  description: string;
}[] = [
  {
    id: "1a",
    label: "1a — ステージ・ダーク",
    dark: true,
    mock: {
      background: "#0B0D10",
      textColor: "#fff",
      nowLabelColor: "rgba(255,255,255,0.4)",
      time: "02:14",
      timeColor: "#EAB308",
      progressPercent: 82,
      progressTrackColor: "rgba(255,255,255,0.12)",
      progressFillColor: "#EAB308",
      nextBg: "rgba(255,255,255,0.06)",
      nextLabelColor: "rgba(255,255,255,0.45)",
      nextTextColor: "rgba(255,255,255,0.85)",
      nextText: "質疑応答（5:00）",
    },
    description: "暗い会場でも眩しくない。数字だけが浮かび上がる、集中特化のステージモード。",
  },
  {
    id: "1b",
    label: "1b — ミニマル・ライト",
    dark: false,
    mock: {
      background: "#FAFAF8",
      textColor: "#14171A",
      nowLabelColor: "rgba(20,23,26,0.4)",
      time: "08:42",
      timeColor: "#14171A",
      progressPercent: 38,
      progressTrackColor: "rgba(20,23,26,0.08)",
      progressFillColor: "#22C55E",
      nextBg: "#F1F0EC",
      nextLabelColor: "rgba(20,23,26,0.4)",
      nextTextColor: "rgba(20,23,26,0.75)",
      nextText: "質疑応答（5:00）",
    },
    description: "LP全体と同じ清潔なトーン。明るい会場やモニター共有に馴染む定番スタイル。",
  },
  {
    id: "1c",
    label: "1c — カラーウォッシュ",
    dark: false,
    mock: {
      background: "#FEF3C7",
      textColor: "#78350F",
      nowLabelColor: "rgba(120,53,15,0.55)",
      time: "02:14",
      timeColor: "#78350F",
      progressPercent: 82,
      progressTrackColor: "rgba(120,53,15,0.15)",
      progressFillColor: "#78350F",
      nextBg: "rgba(120,53,15,0.08)",
      nextLabelColor: "rgba(120,53,15,0.55)",
      nextTextColor: "rgba(120,53,15,0.85)",
      nextText: "質疑応答（5:00）",
    },
    description: "背景そのものが信号色に染まる。数字を読まなくても、色だけで状況が伝わります。",
  },
];

export function ScreenVariants() {
  return (
    <div id="screens" style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 32px" }}>
      <h2
        style={{
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: -0.5,
          margin: "0 0 12px",
          textAlign: "center",
        }}
      >
        本番画面、3つの方向性
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "rgba(20,23,26,0.55)",
          fontSize: 16,
          margin: "0 0 56px",
        }}
      >
        どれが会場に合いそうか、ぜひご意見ください。
      </p>

      <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
        {SCREEN_VARIANTS.map((variant) => (
          <div
            key={variant.id}
            id={variant.id}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
          >
            <a
              href={`#${variant.id}`}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                background: "#14171A",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: 100,
              }}
            >
              {variant.label}
            </a>
            <IOSDevice width={260} height={562} dark={variant.dark}>
              <TimerMock {...variant.mock} />
            </IOSDevice>
            <p
              style={{
                fontSize: 14,
                color: "rgba(20,23,26,0.55)",
                maxWidth: 280,
                textAlign: "center",
                lineHeight: 1.7,
              }}
            >
              {variant.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
