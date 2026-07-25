export function Cta() {
  return (
    <div id="cta" style={{ background: "#14171A", padding: "100px 32px", textAlign: "center" }}>
      <h2
        style={{
          fontSize: 38,
          fontWeight: 900,
          color: "#fff",
          margin: "0 0 20px",
          letterSpacing: -0.5,
        }}
      >
        次のプレゼンから、時間に追われない。
      </h2>
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", margin: "0 0 36px" }}>
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
          border: "none",
          cursor: "pointer",
        }}
      >
        無料ではじめる
      </button>
    </div>
  );
}
