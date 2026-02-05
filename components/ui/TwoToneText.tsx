"use client";

/**
 * Product overlay text with two colors: brand (primary) + dark/navy/white contrast (secondary).
 * Reusable for hero sliders, promo banners, product overlays.
 */
interface TwoToneTextProps {
  /** Primary text – uses brand color */
  primary: string;
  /** Secondary text – uses dark/white contrast. If omitted, splits primary by first word. */
  secondary?: string;
  /** Order: "primary-first" | "secondary-first" */
  order?: "primary-first" | "secondary-first";
  /** Variant: default = brand+dark on light bg; on-dark = brand+white for dark overlays */
  variant?: "default" | "on-dark";
  className?: string;
  /** HTML element */
  as?: "span" | "p" | "h1" | "h2" | "h3";
}

function splitForTwoTone(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return [text, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export default function TwoToneText({
  primary,
  secondary,
  order = "primary-first",
  variant = "default",
  className = "",
  as: Component = "span",
}: TwoToneTextProps) {
  const [firstPart, secondPart] = secondary != null
    ? order === "primary-first" ? [primary, secondary] : [secondary, primary]
    : splitForTwoTone(primary);

  if (!secondPart) {
    return (
      <Component className={`font-bold text-[var(--brand)] ${className}`}>
        {firstPart}
      </Component>
    );
  }

  const contrastColor = variant === "on-dark" ? "text-white" : "text-[var(--brand-dark)]";
  const brandColor = "text-[var(--brand)]";

  return (
    <Component className={`inline font-bold ${className}`}>
      <span className={brandColor}>{firstPart}</span>
      {" "}
      <span className={contrastColor}>{secondPart}</span>
    </Component>
  );
}
