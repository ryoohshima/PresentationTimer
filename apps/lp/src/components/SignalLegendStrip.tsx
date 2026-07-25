const LEGEND = [
  { color: "#22C55E", label: "余裕あり" },
  { color: "#EAB308", label: "残りわずか" },
  { color: "#EF4444", label: "超過（押し）" },
];

export function SignalLegendStrip() {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(20,23,26,0.08)",
        borderBottom: "1px solid rgba(20,23,26,0.08)",
        background: "#F1F0EC",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "20px 32px",
          display: "flex",
          gap: 36,
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {LEGEND.map((item) => (
          <span
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(20,23,26,0.7)",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: item.color,
                display: "inline-block",
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
