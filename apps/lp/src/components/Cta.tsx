import { GLASS_FILL_STRONG, GLASS_STROKE, glassBlur } from "../tokens.js";

export function Cta() {
  return (
    <div
      id="cta"
      style={{
        padding: "72px clamp(20px, 5vw, 32px) 96px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...glassBlur(),
          background: GLASS_FILL_STRONG,
          borderRadius: 36,
          border: `1px solid ${GLASS_STROKE}`,
          boxShadow: "0 16px 40px rgba(20,23,26,0.12)",
          padding: "72px clamp(32px, 8vw, 112px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "clamp(26px, 7vw, 38px)", fontWeight: 900, margin: 0 }}>
          次のプレゼンから、時間に追われない。
        </h2>
        <p style={{ fontSize: 16, color: "rgba(20,23,26,0.55)", margin: 0 }}>
          アジェンダを組んで、あとはスマホを置くだけ。
        </p>
        <button
          type="button"
          className="lp-final-cta"
          style={{
            fontWeight: 700,
            fontSize: 16,
            padding: "16px 36px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          ブラウザで始める
        </button>
      </div>
    </div>
  );
}
