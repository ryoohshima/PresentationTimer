import { FONT_DISPLAY } from "../tokens.js";

export function Footer() {
  return (
    <div
      className="lp-footer"
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "32px clamp(20px, 5vw, 32px)",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 15,
          color: "rgba(20,23,26,0.5)",
        }}
      >
        Presentation Timer
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <a
          href="/privacy.html"
          style={{ fontSize: 13, color: "rgba(20,23,26,0.55)", fontWeight: 600 }}
        >
          プライバシーポリシー
        </a>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: "rgba(20,23,26,0.4)" }}>
          © 2026 Presentation Timer
        </div>
      </div>
    </div>
  );
}
