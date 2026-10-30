// Pastel take on SMPTE color bars, used as section dividers and the footer sign-off.
const bars = ["#eef1ff", "#fff09a", "#9ff0ff", "#c8ff7a", "#ff8fd6", "#ff9a8f", "#8f9cff"];
const castellations = ["#8f9cff", "#05061a", "#ff8fd6", "#05061a", "#9ff0ff", "#05061a", "#eef1ff"];

/** "fill" stretches the tall pattern to its container, like the no-signal card on the trailer TV. */
export function ColorBars({ size = "thin" }: { size?: "thin" | "tall" | "fill" }) {
  if (size === "thin") {
    return (
      <div aria-hidden="true" className="flex h-1.5 overflow-hidden rounded-full opacity-90">
        {bars.map((color) => (
          <span key={color} className="flex-1" style={{ background: color }} />
        ))}
      </div>
    );
  }

  const fill = size === "fill";
  return (
    <div aria-hidden="true" className={fill ? "flex h-full flex-col" : undefined}>
      <div className={fill ? "flex flex-[5]" : "flex h-12 sm:h-16"}>
        {bars.map((color) => (
          <span key={color} className="flex-1" style={{ background: color }} />
        ))}
      </div>
      <div className={fill ? "flex flex-1" : "flex h-3"}>
        {castellations.map((color, i) => (
          <span key={i} className="flex-1" style={{ background: color }} />
        ))}
      </div>
    </div>
  );
}
