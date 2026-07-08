import { IOSDevice } from "./components/IOSDevice.js";
import { TimerMock, type TimerMockProps } from "./components/TimerMock.js";

const LEGEND = [
  { color: "#22C55E", label: "余裕あり" },
  { color: "#EAB308", label: "残りわずか" },
  { color: "#EF4444", label: "超過（押し）" },
];

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

const SCREEN_VARIANTS: {
  id: string;
  label: string;
  dark: boolean;
  mock: Omit<TimerMockProps, "size">;
  description: string;
}[] = [
  {
    id: "1a",
    label: "1a — ステージ・ダーク",
    dark: true,
    mock: {
      background: "#0B0D10",
      textColor: "#fff",
      nowLabelColor: "rgba(255,255,255,0.4)",
      time: "02:14",
      timeColor: "#EAB308",
      progressPercent: 82,
      progressTrackColor: "rgba(255,255,255,0.12)",
      progressFillColor: "#EAB308",
      nextBg: "rgba(255,255,255,0.06)",
      nextLabelColor: "rgba(255,255,255,0.45)",
      nextTextColor: "rgba(255,255,255,0.85)",
      nextText: "質疑応答（5:00）",
    },
    description: "暗い会場でも眩しくない。数字だけが浮かび上がる、集中特化のステージモード。",
  },
  {
    id: "1b",
    label: "1b — ミニマル・ライト",
    dark: false,
    mock: {
      background: "#FAFAF8",
      textColor: "#14171A",
      nowLabelColor: "rgba(20,23,26,0.4)",
      time: "08:42",
      timeColor: "#14171A",
      progressPercent: 38,
      progressTrackColor: "rgba(20,23,26,0.08)",
      progressFillColor: "#22C55E",
      nextBg: "#F1F0EC",
      nextLabelColor: "rgba(20,23,26,0.4)",
      nextTextColor: "rgba(20,23,26,0.75)",
      nextText: "質疑応答（5:00）",
    },
    description: "LP全体と同じ清潔なトーン。明るい会場やモニター共有に馴染む定番スタイル。",
  },
  {
    id: "1c",
    label: "1c — カラーウォッシュ",
    dark: false,
    mock: {
      background: "#FEF3C7",
      textColor: "#78350F",
      nowLabelColor: "rgba(120,53,15,0.55)",
      time: "02:14",
      timeColor: "#78350F",
      progressPercent: 82,
      progressTrackColor: "rgba(120,53,15,0.15)",
      progressFillColor: "#78350F",
      nextBg: "rgba(120,53,15,0.08)",
      nextLabelColor: "rgba(120,53,15,0.55)",
      nextTextColor: "rgba(120,53,15,0.85)",
      nextText: "質疑応答（5:00）",
    },
    description: "背景そのものが信号色に染まる。数字を読まなくても、色だけで状況が伝わります。",
  },
];

const AGENDA_ROWS = [
  { title: "オープニング", detail: "5分 00秒", locked: false },
  { title: "本編", detail: "10分 00秒 ・ 固定", locked: true },
  { title: "質疑応答", detail: "5分 00秒", locked: false },
];

export function App() {
  return (
    <div
      style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        background: "#FAFAF8",
        color: "#14171A",
        overflowX: "hidden",
      }}
    >
      {/* NAV */}
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

      {/* HERO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 64,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "24px 32px 80px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 460px", minWidth: 320 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: "#16803D",
              background: "rgba(22,128,61,0.1)",
              padding: "6px 14px",
              borderRadius: 100,
              marginBottom: 24,
            }}
          >
            PRESENTATION AGENDA &amp; TIMER
          </div>
          <h1
            style={{
              fontSize: 56,
              lineHeight: 1.15,
              fontWeight: 900,
              margin: "0 0 24px",
              letterSpacing: -1,
              textWrap: "balance",
            }}
          >
            登壇の「間」を、
            <br />
            最後まで美しく。
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "rgba(20,23,26,0.65)",
              margin: "0 0 36px",
              maxWidth: 440,
            }}
          >
            アジェンダを組んでスタートするだけ。押しても巻いても、残り時間は自動で調整。本番中はスマホ1台で進行管理できます。
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <a
              href="#cta"
              className="lp-hero-cta"
              style={{
                fontWeight: 700,
                fontSize: 16,
                padding: "16px 32px",
                borderRadius: 100,
                display: "inline-block",
              }}
            >
              無料ではじめる
            </a>
            <a
              href="#screens"
              className="lp-hero-secondary"
              style={{ fontWeight: 700, fontSize: 15, paddingBottom: 2 }}
            >
              3つの画面案を見る ↓
            </a>
          </div>
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
          <IOSDevice width={300} height={649} dark>
            <TimerMock
              size="large"
              background="#0B0D10"
              textColor="#fff"
              nowLabelColor="rgba(255,255,255,0.4)"
              time="08:42"
              timeColor="#22C55E"
              progressPercent={38}
              progressTrackColor="rgba(255,255,255,0.12)"
              progressFillColor="#22C55E"
              nextBg="rgba(255,255,255,0.06)"
              nextLabelColor="rgba(255,255,255,0.45)"
              nextTextColor="rgba(255,255,255,0.85)"
              nextText="質疑応答（5:00）"
            />
          </IOSDevice>
        </div>
      </div>

      {/* SIGNAL LEGEND STRIP */}
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

      {/* FEATURES */}
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

      {/* AGENDA EDIT SHOWCASE */}
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

      {/* 3 TIMER VARIATIONS */}
      <div id="screens" style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 32px" }}>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: -0.5,
            margin: "0 0 12px",
            textAlign: "center",
          }}
        >
          本番画面、3つの方向性
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "rgba(20,23,26,0.55)",
            fontSize: 16,
            margin: "0 0 56px",
          }}
        >
          どれが会場に合いそうか、ぜひご意見ください。
        </p>

        <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
          {SCREEN_VARIANTS.map((variant) => (
            <div
              key={variant.id}
              id={variant.id}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
            >
              <a
                href={`#${variant.id}`}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  background: "#14171A",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: 100,
                }}
              >
                {variant.label}
              </a>
              <IOSDevice width={260} height={562} dark={variant.dark}>
                <TimerMock {...variant.mock} />
              </IOSDevice>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(20,23,26,0.55)",
                  maxWidth: 280,
                  textAlign: "center",
                  lineHeight: 1.7,
                }}
              >
                {variant.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
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

      {/* FOOTER */}
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
        <div style={{ fontSize: 13, color: "rgba(20,23,26,0.4)" }}>© 2026 TEMPO</div>
      </div>
    </div>
  );
}
