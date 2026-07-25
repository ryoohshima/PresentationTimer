import { IOSDevice } from "./IOSDevice.js";
import { TimerMock } from "./TimerMock.js";

export function Hero() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 64,
        maxWidth: 1180,
        margin: "0 auto",
        padding: "24px 32px 80px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 460px", minWidth: 320 }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#16803D",
            background: "rgba(22,128,61,0.1)",
            padding: "6px 14px",
            borderRadius: 100,
            marginBottom: 24,
          }}
        >
          PRESENTATION AGENDA &amp; TIMER
        </div>
        <h1
          style={{
            fontSize: 56,
            lineHeight: 1.15,
            fontWeight: 900,
            margin: "0 0 24px",
            letterSpacing: -1,
            textWrap: "balance",
          }}
        >
          登壇の「間」を、
          <br />
          最後まで美しく。
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: "rgba(20,23,26,0.65)",
            margin: "0 0 36px",
            maxWidth: 440,
          }}
        >
          アジェンダを組んでスタートするだけ。押しても巻いても、残り時間は自動で調整。本番中はスマホ1台で進行管理できます。
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <a
            href="#cta"
            className="lp-hero-cta"
            style={{
              fontWeight: 700,
              fontSize: 16,
              padding: "16px 32px",
              borderRadius: 100,
              display: "inline-block",
            }}
          >
            無料ではじめる
          </a>
          <a
            href="#screens"
            className="lp-hero-secondary"
            style={{ fontWeight: 700, fontSize: 15, paddingBottom: 2 }}
          >
            3つの画面案を見る ↓
          </a>
        </div>
      </div>

      <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
        <IOSDevice width={300} height={649} dark>
          <TimerMock
            size="large"
            background="#0B0D10"
            textColor="#fff"
            nowLabelColor="rgba(255,255,255,0.4)"
            time="08:42"
            timeColor="#22C55E"
            progressPercent={38}
            progressTrackColor="rgba(255,255,255,0.12)"
            progressFillColor="#22C55E"
            nextBg="rgba(255,255,255,0.06)"
            nextLabelColor="rgba(255,255,255,0.45)"
            nextTextColor="rgba(255,255,255,0.85)"
            nextText="質疑応答（5:00）"
          />
        </IOSDevice>
      </div>
    </div>
  );
}
