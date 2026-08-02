import type { CSSProperties } from "react";
import { AgendaEditShowcase } from "./components/AgendaEditShowcase.js";
import { Cta } from "./components/Cta.js";
import { Footer } from "./components/Footer.js";
import { Hero } from "./components/Hero.js";
import { Nav } from "./components/Nav.js";
import { ScreenVariants } from "./components/ScreenVariants.js";

// design.pen の背景ブロブ（Blob*）。1440px キャンバス基準の配置を左右アンカーで再現
const BLOBS: CSSProperties[] = [
  { top: -160, left: -220, width: 720, height: 720, background: "rgba(34,197,94,0.18)" },
  { top: 240, right: -120, width: 640, height: 640, background: "rgba(234,179,8,0.16)" },
  { top: 1480, left: -260, width: 800, height: 800, background: "rgba(147,197,253,0.24)" },
  { top: 2760, right: -140, width: 700, height: 700, background: "rgba(34,197,94,0.14)" },
];

export function App() {
  return (
    <div
      style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        background: "#EEF3EF",
        color: "#14171A",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {BLOBS.map((blob, index) => (
        <div
          key={index}
          aria-hidden="true"
          style={{
            position: "absolute",
            borderRadius: "50%",
            filter: "blur(160px)",
            pointerEvents: "none",
            ...blob,
          }}
        />
      ))}
      <div style={{ position: "relative" }}>
        <Nav />
        <Hero />
        <AgendaEditShowcase />
        <ScreenVariants />
        <Cta />
        <Footer />
      </div>
    </div>
  );
}
