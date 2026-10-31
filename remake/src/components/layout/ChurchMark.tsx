import { useId } from "react";

/** Cleaned extraction of the supplied parish logo, tinted with the surrounding text. */
export function ChurchMark({ className }: { className?: string }) {
  const maskId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="156 32 836 1450"
      width="38"
      height="64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Crop transparent margins and use the original alpha, without redrawing its lines. */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="156"
          y="32"
          width="836"
          height="1450"
          style={{ maskType: "alpha" }}
        >
          <image
            href="/images/parish-church-mark.png"
            width="1036"
            height="1518"
          />
        </mask>
      </defs>
      <rect
        x="156"
        y="32"
        width="836"
        height="1450"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
