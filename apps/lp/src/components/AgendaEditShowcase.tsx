import type { ReactNode } from "react";
import {
  ACCENT_GREEN,
  FONT_EYEBROW,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_SHADOW,
  GLASS_STROKE,
  glassBlur,
  INK,
} from "../tokens.js";
import {
  LockIcon,
  LockOpenIcon,
  PencilIcon,
  SettingsIcon,
  SparklesIcon,
  TrashIcon,
} from "./icons.js";
import { PhoneMock } from "./PhoneMock.js";
import { PillButton } from "./PillButton.js";

const ICON_GRAY = "#9CA3AF";

function AgendaRow({
  title,
  locked = false,
  detail,
}: {
  title: string;
  locked?: boolean;
  detail: ReactNode;
}) {
  return (
    <div
      style={{
        ...glassBlur(),
        background: GLASS_FILL_STRONG,
        borderRadius: 16,
        border: `1.5px solid ${locked ? ACCENT_GREEN : GLASS_STROKE}`,
        boxShadow: `0 8px 24px ${GLASS_SHADOW}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 16,
      }}
    >
      <span style={{ fontFamily: FONT_EYEBROW, fontSize: 18, color: ICON_GRAY }}>≡</span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{title}</div>
        <div style={{ fontSize: 13, color: "#6B7280" }}>{detail}</div>
      </div>
      <PencilIcon size={20} color={ICON_GRAY} />
      {locked ? (
        <LockIcon size={20} color={ACCENT_GREEN} />
      ) : (
        <LockOpenIcon size={20} color={ICON_GRAY} />
      )}
      <TrashIcon size={20} color={ICON_GRAY} />
    </div>
  );
}

export function AgendaEditShowcase() {
  return (
    <div
      style={{
        ...glassBlur(),
        background: GLASS_FILL,
        borderTop: `1px solid ${GLASS_STROKE}`,
        borderBottom: `1px solid ${GLASS_STROKE}`,
      }}
    >
      <div
        className="lp-split"
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(64px, 12vw, 96px) clamp(20px, 5vw, 32px)",
        }}
      >
        <div className="lp-split-media">
          <PhoneMock width={320} height={692}>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                padding: "8px 16px 24px",
                minHeight: 0,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>アジェンダ</div>
                  <SettingsIcon size={22} color={INK} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(20,23,26,0.55)" }}>
                  合計 20:00
                </div>
                <AgendaRow title="オープニング" detail="5分 00秒" />
                <AgendaRow
                  title="本編"
                  locked
                  detail={
                    <>
                      10分 00秒
                      <span style={{ color: ACCENT_GREEN, fontWeight: 600 }}> ・時間固定</span>
                    </>
                  }
                />
                <AgendaRow title="質疑応答" detail="5分 00秒" />
                <div
                  style={{
                    background: GLASS_FILL,
                    borderRadius: 16,
                    border: `1.5px solid ${GLASS_STROKE}`,
                    padding: 16,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: ACCENT_GREEN }}>
                    ＋ 項目を追加
                  </span>
                </div>
              </div>
              <PillButton label="開始" />
            </div>
          </PhoneMock>
        </div>
        <div className="lp-split-text">
          <div
            className="lp-row"
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}
          >
            <SparklesIcon size={18} color={ACCENT_GREEN} />
            <span
              style={{
                fontFamily: FONT_EYEBROW,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: ACCENT_GREEN,
              }}
            >
              たったひとつのステップ
            </span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 8.5vw, 38px)", fontWeight: 900, margin: "0 0 20px" }}>
            アジェンダを組む。
            <br />
            準備はそれだけ。
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(20,23,26,0.65)", margin: 0 }}>
            項目名と時間を並べるだけ。あとは本番中、アプリが残り時間を自動で調整します。
          </p>
        </div>
      </div>
    </div>
  );
}
