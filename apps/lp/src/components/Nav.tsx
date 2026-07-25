export function Nav() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "28px 32px",
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 0.5,
        }}
      >
        TEMPO
      </div>
      <a
        href="#cta"
        className="lp-nav-cta"
        style={{ fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 100 }}
      >
        無料ではじめる
      </a>
    </div>
  );
}
