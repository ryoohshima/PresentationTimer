import { AgendaEditShowcase } from "./components/AgendaEditShowcase.js";
import { Cta } from "./components/Cta.js";
import { Features } from "./components/Features.js";
import { Footer } from "./components/Footer.js";
import { Hero } from "./components/Hero.js";
import { Nav } from "./components/Nav.js";
import { ScreenVariants } from "./components/ScreenVariants.js";
import { SignalLegendStrip } from "./components/SignalLegendStrip.js";

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
      <Nav />
      <Hero />
      <SignalLegendStrip />
      <Features />
      <AgendaEditShowcase />
      <ScreenVariants />
      <Cta />
      <Footer />
    </div>
  );
}
