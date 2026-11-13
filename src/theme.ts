// Material 3 Expressive color tokens — "Monet"-style dynamic palette: every
// color is derived from one seed hue by rotating around the color wheel
// (the same trick Android's Material You / "Monet" engine uses to build a
// tonal palette from a single source color), so the background and every
// shape on top of it are guaranteed to harmonize instead of being picked
// independently.
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const SEED_HUE = 332; // deep rose, same family as the old #C2185B

export const M3 = {
  // Primary — the seed hue itself
  primary:         hslToHex(SEED_HUE, 62, 46),
  onPrimary:       "#FFFFFF",
  primaryContainer:"#FCE4EC",
  onPrimaryContainer:"#880E4F",

  // Secondary — analogous, +18° around the wheel
  secondary:       hslToHex(SEED_HUE + 18, 70, 52),
  secondaryContainer:"#FCE4EC",

  // Tertiary — +60°, lands in warm amber/gold territory
  tertiary:        hslToHex(SEED_HUE + 60, 95, 52),
  tertiaryContainer:"#FFF3E0",

  // Surface
  surface:         "#FFF8F9",
  surfaceVariant:  "#F3E5F5",
  onSurface:       "#1C1B1F",
  onSurfaceVariant:"#49454F",

  // Background — flat single color (no gradient), tone ~15 of the seed hue,
  // per user request ("background chỉ 1 màu thôi"). Nudged a touch brighter
  // than the original tone-10 pass to read closer to the soft pastel feel
  // Google's own M3 Expressive reference videos use.
  bgFlat: hslToHex(SEED_HUE, 52, 15),

  // Decorative shapes use ONE single tone — tone ~27 of the exact same hue
  // as the background (same hue + saturation, one Android-Monet tone step
  // lighter), not a palette of different hues. Every shape is this same
  // color, like the "Primary 10 / Primary 20" steps in a real M3 tonal
  // ramp — the earlier version picking six different hues was wrong.
  shapeTone: hslToHex(SEED_HUE, 52, 27),

  // Typography scale (px). Google Sans Flex is M3's current display face;
  // Be Vietnam Pro is the fallback if any Vietnamese diacritic glyph is
  // missing from the Flex build.
  fontFamily: "'Google Sans Flex', 'Be Vietnam Pro', 'Noto Sans', sans-serif",
  displayLarge:  72,
  headlineHero:  64, // main lyric size — bigger per user request
  headlineLarge: 48,
  headlineMedium:36,
  titleLarge:    28,
  bodyLarge:     20,

  // Shape
  shapeExtraLarge: 28,
  shapeLarge: 16,
  shapeMedium: 12,

  // Lyric text glow — replaces the old card background. White/cream text
  // with a colored glow + a dark drop-shadow so it reads on both the light
  // and dark patches of the moving background.
  lyricTextColor: "#FFF9FB",
  lyricTextColorHum: "#FFECC7",
};

// All indices resolve to the same single tone — kept as an array only so
// the per-satellite `monetIndex` lookups elsewhere don't need to change.
export const MONET_COLORS = [M3.shapeTone, M3.shapeTone, M3.shapeTone, M3.shapeTone, M3.shapeTone, M3.shapeTone] as const;
