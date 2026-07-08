export interface TimerMockProps {
  background: string;
  textColor: string;
  nowLabelColor: string;
  time: string;
  timeColor: string;
  progressPercent: number;
  progressTrackColor: string;
  progressFillColor: string;
  nextBg: string;
  nextLabelColor: string;
  nextTextColor: string;
  nextText: string;
  size?: "large" | "compact";
}

const SIZES = {
  large: { title: 26, titleMb: 28, time: 96, timeMb: 24, barMb: 32, next: 16 },
  compact: { title: 24, titleMb: 24, time: 88, timeMb: 20, barMb: 28, next: 15 },
} as const;

export function TimerMock({
  background,
  textColor,
  nowLabelColor,
  time,
  timeColor,
  progressPercent,
  progressTrackColor,
  progressFillColor,
  nextBg,
  nextLabelColor,
  nextTextColor,
  nextText,
  size = "compact",
}: TimerMockProps) {
  const s = SIZES[size];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background,
        display: "flex",
        flexDirection: "column",
        padding: "74px 28px 40px",
        color: textColor,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          color: nowLabelColor,
          marginBottom: 6,
        }}
      >
        NOW
      </div>
      <div style={{ fontSize: s.title, fontWeight: 700, marginBottom: s.titleMb }}>本編</div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: s.time,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: -2,
          color: timeColor,
          marginBottom: s.timeMb,
        }}
      >
        {time}
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 6,
          background: progressTrackColor,
          overflow: "hidden",
          marginBottom: s.barMb,
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            background: progressFillColor,
            borderRadius: 6,
          }}
        />
      </div>
      <div
        style={{ marginTop: "auto", background: nextBg, borderRadius: 14, padding: "16px 18px" }}
      >
        <div
          style={{
            fontSize: 12,
            color: nextLabelColor,
            fontWeight: 700,
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          NEXT
        </div>
        <div style={{ fontSize: s.next, color: nextTextColor }}>{nextText}</div>
      </div>
    </div>
  );
}
