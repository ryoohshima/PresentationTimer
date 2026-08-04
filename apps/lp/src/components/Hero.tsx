import {
  ACCENT_GREEN,
  FONT_EYEBROW,
  GLASS_FILL_STRONG,
  GLASS_STROKE,
  glassBlur,
} from "../tokens.js";
import { PlayIcon } from "./icons.js";
import { PhoneMock } from "./PhoneMock.js";
import { TimerScreen } from "./TimerScreen.js";

export function Hero() {
  return (
    <div
      className="lp-split"
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "24px clamp(20px, 5vw, 32px) 80px",
      }}
    >
      <div className="lp-split-text">
        <div
          style={{
            ...glassBlur(),
            display: "inline-block",
            fontFamily: FONT_EYEBROW,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: ACCENT_GREEN,
            background: GLASS_FILL_STRONG,
            border: `1px solid ${GLASS_STROKE}`,
            padding: "8px 16px",
            borderRadius: 100,
            marginBottom: 24,
          }}
        >
          PRESENTATION AGENDA &amp; TIMER
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 11vw, 56px)",
            lineHeight: 1.15,
            fontWeight: 900,
            margin: "0 0 24px",
            textWrap: "balance",
          }}
        >
          登壇の時間を、
          <br />
          美しく。
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: "rgba(20,23,26,0.65)",
            margin: "0 0 36px",
          }}
        >
          アジェンダを組んでスタートするだけ。押しても巻いても、残り時間は自動で調整。
          <br />
          本番中はスマホ1台で進行管理できます。
        </p>
        <div
          className="lp-row"
          style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
        >
          <a
            href="#cta"
            className="lp-hero-cta"
            style={{
              ...glassBlur(),
              fontWeight: 700,
              fontSize: 16,
              padding: "16px 32px",
              borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "0 10px 28px rgba(22,128,61,0.3)",
              display: "inline-block",
            }}
          >
            ブラウザで始める
          </a>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#0F1115",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              padding: "10px 18px 10px 16px",
            }}
          >
            <PlayIcon size={24} color="#fff" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontFamily: FONT_EYEBROW,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.6,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                GET IT ON
              </span>
              <span
                style={{
                  fontFamily: FONT_EYEBROW,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Google Play
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lp-split-media">
        <PhoneMock width={300} height={648}>
          <TimerScreen timeFontSize={90} />
        </PhoneMock>
      </div>
    </div>
  );
}
