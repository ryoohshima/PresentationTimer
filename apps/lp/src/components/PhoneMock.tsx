import type { ReactNode } from "react";

// design.pen の PhoneMock（eHuov）: ベース色 + 3 つの放射グラデーション
const PHONE_BACKGROUND = [
  "radial-gradient(65% 45% at 15% 12%, #9EDDBB 0%, rgba(158,221,187,0) 100%)",
  "radial-gradient(60% 42.5% at 90% 42%, #9CC9E8 0%, rgba(156,201,232,0) 100%)",
  "radial-gradient(75% 45% at 40% 95%, #EFDFA8 0%, rgba(239,223,168,0) 100%)",
  "#ECF2E9",
].join(", ");

interface PhoneMockProps {
  children: ReactNode;
  width?: number;
  height?: number;
}

export function PhoneMock({ children, width = 300, height = 648 }: PhoneMockProps) {
  return (
    <div
      style={{
        width,
        maxWidth: "100%",
        height,
        borderRadius: 48,
        overflow: "hidden",
        background: PHONE_BACKGROUND,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 60, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {children}
      </div>
      <div
        style={{
          height: 34,
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingBottom: 8,
        }}
      >
        <div style={{ width: 140, height: 4, borderRadius: 100, background: "rgba(0,0,0,0.25)" }} />
      </div>
    </div>
  );
}
