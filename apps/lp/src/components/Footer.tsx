export function Footer() {
  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: 32,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "rgba(20,23,26,0.5)",
        }}
      >
        TEMPO
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <a
          href="/privacy.html"
          style={{ fontSize: 13, color: "rgba(20,23,26,0.55)", fontWeight: 600 }}
        >
          プライバシーポリシー
        </a>
        <div style={{ fontSize: 13, color: "rgba(20,23,26,0.4)" }}>© 2026 TEMPO</div>
      </div>
    </div>
  );
}
