import type { ReactNode } from "react";

// lucide (ISC License) のパスデータを流用したインライン SVG アイコン
function LucideIcon({
  size,
  color,
  children,
}: {
  size: number;
  color: string;
  children: ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function SettingsIcon({ size, color }: { size: number; color: string }) {
  return (
    <LucideIcon size={size} color={color}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </LucideIcon>
  );
}

export function SparklesIcon({ size, color }: { size: number; color: string }) {
  return (
    <LucideIcon size={size} color={color}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </LucideIcon>
  );
}

export function EyeIcon({ size, color }: { size: number; color: string }) {
  return (
    <LucideIcon size={size} color={color}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </LucideIcon>
  );
}

export function PencilIcon({ size, color }: { size: number; color: string }) {
  return (
    <LucideIcon size={size} color={color}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </LucideIcon>
  );
}

export function LockIcon({ size, color }: { size: number; color: string }) {
  return (
    <LucideIcon size={size} color={color}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </LucideIcon>
  );
}

export function LockOpenIcon({ size, color }: { size: number; color: string }) {
  return (
    <LucideIcon size={size} color={color}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </LucideIcon>
  );
}

export function TrashIcon({ size, color }: { size: number; color: string }) {
  return (
    <LucideIcon size={size} color={color}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </LucideIcon>
  );
}

// design.pen の App Icon コンポーネント（512 座標系）と 1:1 対応するブランドマーク
export function AppMarkIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 512 512" fill="none">
      <path
        d="M372.87 167.17A154.88 154.88 0 1 0 372.87 344.83"
        stroke={color}
        strokeWidth={42.24}
      />
      <g stroke={color} strokeWidth={22} strokeLinecap="round">
        <path d="M256 256l71.1-56.78" />
        <path d="M256 256l71.1 56.78" />
        <path d="M415.34 292.04a44 44 0 0 0 0-72.08" />
        <path d="M435.35 309.93a70.4 70.4 0 0 0 0-107.86" opacity={0.75} />
        <path d="M457.34 325.63a96.8 96.8 0 0 0 0-139.26" opacity={0.5} />
      </g>
      <circle cx="246" cy="256" r="19.8" fill={color} />
    </svg>
  );
}

export function PlayIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}
