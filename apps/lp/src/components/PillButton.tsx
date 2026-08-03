import { GLASS_FILL_STRONG, GLASS_STROKE, glassBlur, INK } from "../tokens.js";

interface PillButtonProps {
  label: string;
  variant?: "primary" | "glass";
  grow?: boolean;
}

// design.pen の PillButton（P62dBk）
export function PillButton({ label, variant = "primary", grow = false }: PillButtonProps) {
  const primary = variant === "primary";
  return (
    <div
      style={{
        ...glassBlur(),
        flex: grow ? 1 : undefined,
        background: primary ? "rgba(22,128,61,0.8)" : GLASS_FILL_STRONG,
        border: `1px solid ${primary ? "rgba(255,255,255,0.35)" : GLASS_STROKE}`,
        boxShadow: primary ? "0 8px 24px rgba(22,128,61,0.25)" : undefined,
        borderRadius: 100,
        padding: grow ? "16px 12px" : "16px 32px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          whiteSpace: "nowrap",
          color: primary ? "#fff" : INK,
        }}
      >
        {label}
      </span>
    </div>
  );
}
