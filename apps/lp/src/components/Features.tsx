const FEATURES = [
  {
    color: "#16803D",
    title: "アジェンダを組む",
    text: "項目と時間配分を並べるだけ。順番はドラッグで自由に入れ替えられます。",
  },
  {
    color: "#EAB308",
    title: "自動で時間を再配分",
    text: "予定を超えても、後の項目の持ち時間を自動で圧縮。全体の終了時刻はブレません。",
  },
  {
    color: "#EF4444",
    title: "遠くからでも読める",
    text: "残り時間を画面いっぱいに表示。押し・巻きは色でひと目にわかります。",
  },
];

export function Features() {
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 32px" }}>
      <h2
        style={{
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: -0.5,
          margin: "0 0 12px",
          textAlign: "center",
        }}
      >
        やることは3つだけ
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "rgba(20,23,26,0.55)",
          fontSize: 16,
          margin: "0 0 56px",
        }}
      >
        複雑な設定はいりません。
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            style={{
              background: "#fff",
              border: "1px solid rgba(20,23,26,0.08)",
              borderRadius: 20,
              padding: "36px 28px",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: feature.color,
                marginBottom: 24,
              }}
            />
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>{feature.title}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(20,23,26,0.6)", margin: 0 }}>
              {feature.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
