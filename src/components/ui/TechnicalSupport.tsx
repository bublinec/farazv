/** Shared by public fallbacks and admin errors; contains no server dependencies. */
export function TechnicalSupport() {
  return (
    <span className="technicalSupport">
      Pri technických problémoch napíšte na{" "}
      <a href="mailto:jurajbublinec@gmail.com">jurajbublinec@gmail.com</a>.
    </span>
  );
}
