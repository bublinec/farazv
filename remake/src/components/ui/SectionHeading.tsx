import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`sectionHeading ${
        align === "center" ? "sectionHeadingCenter" : ""
      } ${action ? "sectionHeadingWithAction" : ""}`}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <span className="headingRule" aria-hidden="true" />
      {description ? <p className="sectionDescription">{description}</p> : null}
      {action ? <div className="sectionHeadingAction">{action}</div> : null}
    </div>
  );
}
