import type { CSSProperties } from "react";

export type IconName =
  | "arrow-right"
  | "arrow-left"
  | "chevron"
  | "menu"
  | "close"
  | "phone"
  | "mail"
  | "pin"
  | "clock"
  | "calendar"
  | "cross"
  | "church"
  | "external"
  | "image"
  | "check";

const paths: Record<IconName, React.ReactNode> = {
  "arrow-right": (
    <>
      <path d="M4 12h15M13 5l7 7-7 7" />
    </>
  ),
  "arrow-left": (
    <>
      <path d="M20 12H5M11 5l-7 7 7 7" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  phone: (
    <path d="M21 16.5v3a2 2 0 0 1-2.2 2A19.6 19.6 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4h3l1.4 5-2 1.6a15 15 0 0 0 5.5 5.5l1.6-2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </>
  ),
  cross: <path d="M12 2v20M5 8h14" />,
  church: (
    <>
      <path d="M12 2v5M9.5 4.5h5M7 21V11l5-4 5 4v10M3 21v-7l4-3M21 21v-7l-4-3M1 21h22M10 21v-6h4v6" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7M21 3l-11 11M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <circle cx="8" cy="8" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />
};

export function Icon({
  name,
  size = 20,
  className,
  style
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
