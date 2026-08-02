import { FONT_DISPLAY, GLASS_FILL, GLASS_SHADOW, GLASS_STROKE, glassBlur } from "../tokens.js";

export function Nav() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px 32px 8px" }}>
      <div
        style={{
          ...glassBlur(),
          width: "100%",
          maxWidth: 1180,
          background: GLASS_FILL,
          borderRadius: 100,
          border: `1px solid ${GLASS_STROKE}`,
          boxShadow: `0 8px 24px ${GLASS_SHADOW}`,
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 0.5,
          }}
        >
          Presentation Timer
        </div>
        <a
          href="#cta"
          className="lp-nav-cta"
          style={{
            ...glassBlur(),
            fontWeight: 700,
            fontSize: 14,
            padding: "12px 24px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          ブラウザで始める
        </a>
      </div>
    </div>
  );
}
