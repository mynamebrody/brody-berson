import Image from "next/image";

/**
 * The memoji shown as a face on a CRT: grayscaled, duotoned through the theme's
 * portrait tint, then viewed through an aperture grille with a little gate weave.
 */
export function CrtPortrait({
  size,
  alt,
  priority = false,
}: {
  size: number;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[28%] border border-white/25 shadow-[0_0_0_6px_rgba(5,6,26,0.9),0_0_60px_-6px_var(--halo)]"
      style={{ width: size, height: size, background: "var(--portrait-bg)" }}
    >
      <div className="weave absolute inset-0">
        <Image
          src="/memoji.png"
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          sizes={`${size}px`}
          className="relative scale-[0.88] object-contain [filter:grayscale(1)_contrast(1.35)_brightness(1.08)_drop-shadow(0_0_10px_var(--glow))]"
        />
        {/* Duotone, masked to the face so the backdrop keeps its own color */}
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-[0.88] mix-blend-color"
          style={{
            background: "var(--portrait-tint)",
            maskImage: "url(/memoji.png)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      </div>
      {/* Aperture grille + scanlines */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(5,6,26,0.38) 0 1px, transparent 1px 3px), repeating-linear-gradient(0deg, rgba(5,6,26,0.18) 0 1px, transparent 1px 4px)",
        }}
      />
      {/* Glass */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_28%_18%,rgba(255,255,255,0.35),transparent_45%)]"
      />
      <span
        aria-hidden="true"
        className="osd absolute bottom-[9%] left-[13%] text-sm text-white/85"
      >
        CAM 1
      </span>
    </div>
  );
}
