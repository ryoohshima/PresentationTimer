import { IOSDevice } from "./IOSDevice.js";

const AGENDA_ROWS = [
  { title: "オープニング", detail: "5分 00秒", locked: false },
  { title: "本編", detail: "10分 00秒 ・ 固定", locked: true },
  { title: "質疑応答", detail: "5分 00秒", locked: false },
];

export function AgendaEditShowcase() {
  return (
    <div
      style={{
        background: "#F1F0EC",
        borderTop: "1px solid rgba(20,23,26,0.08)",
        borderBottom: "1px solid rgba(20,23,26,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "96px 32px",
          display: "flex",
          alignItems: "center",
          gap: 64,
          flexWrap: "wrap-reverse",
        }}
      >
        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
          <IOSDevice title="アジェンダ" width={280} height={606}>
            <div style={{ padding: "8px 0 24px" }}>
              {AGENDA_ROWS.map((row) => (
                <div
                  key={row.title}
                  style={{
                    margin: "0 16px 10px",
                    background: "#fff",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    border: row.locked ? "1.5px solid #16803D" : undefined,
                  }}
                >
                  <span style={{ color: "#9ca3af", fontSize: 18 }}>≡</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{row.title}</div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                      {row.detail}
                    </div>
                  </div>
                  {row.locked && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#16803D",
                        background: "rgba(22,128,61,0.1)",
                        padding: "4px 10px",
                        borderRadius: 100,
                      }}
                    >
                      固定
                    </span>
                  )}
                </div>
              ))}
              <div
                style={{
                  margin: "16px 16px 0",
                  textAlign: "center",
                  border: "1.5px dashed rgba(20,23,26,0.2)",
                  borderRadius: 16,
                  padding: 14,
                  color: "rgba(20,23,26,0.4)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ＋ 項目を追加
              </div>
            </div>
          </IOSDevice>
        </div>
        <div style={{ flex: "1 1 400px", minWidth: 300 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, margin: "0 0 20px" }}>
            本番前に、さっと準備。
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(20,23,26,0.65)", margin: 0 }}>
            項目名と時間を入力するだけ。長押しで並べ替え、譲れない項目は「固定」して再配分の対象から外せます。
          </p>
        </div>
      </div>
    </div>
  );
}
