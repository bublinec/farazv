export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`sectionHeading ${
        align === "center" ? "sectionHeadingCenter" : ""
      }`}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <span className="headingRule" aria-hidden="true" />
      {description ? <p className="sectionDescription">{description}</p> : null}
    </div>
  );
}
