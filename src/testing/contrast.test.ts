import { describe, it, expect } from "vitest";

// ── OKLCH utility ──────────────────────────────────────────────

interface Oklch {
  L: number; // lightness 0..1
  C: number; // chroma >= 0
  H: number; // hue 0..360
}

/** Parse "oklch(L C H)" or "oklch(L C H / alpha)" → Oklch */
function parseOklch(raw: string): Oklch {
  const match = raw.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!match) throw new Error(`Cannot parse OKLCH value: ${raw}`);
  return { L: Number(match[1]), C: Number(match[2]), H: Number(match[3]) };
}

/**
 * Convert OKLCH to relative luminance (Y in CIE 1931).
 * Pipeline: OKLCH → OKLab → linear sRGB → relative luminance.
 * Reference: CSS Color Level 4 spec.
 */
function oklchToLuminance(c: Oklch): number {
  // OKLCH → OKLab
  const hRad = (c.H * Math.PI) / 180;
  const a = c.C * Math.cos(hRad);
  const b = c.C * Math.sin(hRad);

  // OKLab → linear sRGB via LMS intermediate
  const l_ = c.L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = c.L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = c.L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  // Relative luminance (WCAG formula)
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/** WCAG 2.1 contrast ratio (L1 + 0.05) / (L2 + 0.05) */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Compute contrast ratio from two OKLCH strings */
function ratioFromOklch(fgRaw: string, bgRaw: string): number {
  const fg = parseOklch(fgRaw);
  const bg = parseOklch(bgRaw);
  return contrastRatio(oklchToLuminance(fg), oklchToLuminance(bg));
}

// ── Expected brand palette values (must match globals.css) ──────

const LIGHT = {
  background: "oklch(0.97 0.02 75)",
  foreground: "oklch(0.15 0.02 75)",
  card: "oklch(0.99 0.01 75)",
  cardForeground: "oklch(0.15 0.02 75)",
  popover: "oklch(0.99 0.01 75)",
  popoverForeground: "oklch(0.15 0.02 75)",
  primary: "oklch(0.55 0.18 35)",
  primaryForeground: "oklch(0.97 0.02 75)",
  secondary: "oklch(0.94 0.01 75)",
  secondaryForeground: "oklch(0.15 0.02 75)",
  muted: "oklch(0.94 0.01 75)",
  mutedForeground: "oklch(0.50 0.02 75)",
  accent: "oklch(0.65 0.12 75)",
  accentForeground: "oklch(0.15 0.02 75)",
  destructive: "oklch(0.50 0.20 30)",
  destructiveForeground: "oklch(0.97 0.02 75)",
  border: "oklch(0.88 0.01 75)",
  input: "oklch(0.88 0.01 75)",
  ring: "oklch(0.55 0.18 35)",
  statusSuccess: "oklch(0.55 0.12 145)",
  statusWarning: "oklch(0.65 0.14 75)",
  statusDestructive: "oklch(0.50 0.20 30)",
} as const;

const DARK = {
  background: "oklch(0.18 0.02 75)",
  foreground: "oklch(0.93 0.01 75)",
  card: "oklch(0.22 0.02 75)",
  cardForeground: "oklch(0.93 0.01 75)",
  popover: "oklch(0.22 0.02 75)",
  popoverForeground: "oklch(0.93 0.01 75)",
  primary: "oklch(0.62 0.14 35)",
  primaryForeground: "oklch(0.18 0.02 75)",
  secondary: "oklch(0.25 0.02 75)",
  secondaryForeground: "oklch(0.93 0.01 75)",
  muted: "oklch(0.25 0.02 75)",
  mutedForeground: "oklch(0.65 0.02 75)",
  accent: "oklch(0.70 0.10 75)",
  accentForeground: "oklch(0.18 0.02 75)",
  destructive: "oklch(0.50 0.18 30)",
  destructiveForeground: "oklch(0.93 0.01 75)",
  border: "oklch(0.30 0.01 75)",
  input: "oklch(0.30 0.01 75)",
  ring: "oklch(0.62 0.14 35)",
  statusSuccess: "oklch(0.60 0.10 145)",
  statusWarning: "oklch(0.70 0.12 75)",
  statusDestructive: "oklch(0.62 0.14 30)",
} as const;

// ── Contrast test pairs ────────────────────────────────────────

interface ContrastPair {
  name: string;
  fg: string;
  bg: string;
  /** Minimum required ratio: 4.5 for normal text, 3.0 for large text */
  minRatio: number;
}

/** Build pairs for a given mode palette */
function getPairs(p: typeof LIGHT | typeof DARK, mode: string): ContrastPair[] {
  return [
    // Essential body text pairs
    { name: `${mode}: foreground on background`, fg: p.foreground, bg: p.background, minRatio: 4.5 },
    { name: `${mode}: card-foreground on card`, fg: p.cardForeground, bg: p.card, minRatio: 4.5 },
    { name: `${mode}: popover-foreground on popover`, fg: p.popoverForeground, bg: p.popover, minRatio: 4.5 },

    // Interactive surface pairs (buttons etc.)
    { name: `${mode}: primary-foreground on primary`, fg: p.primaryForeground, bg: p.primary, minRatio: 4.5 },
    { name: `${mode}: secondary-foreground on secondary`, fg: p.secondaryForeground, bg: p.secondary, minRatio: 4.5 },
    { name: `${mode}: accent-foreground on accent`, fg: p.accentForeground, bg: p.accent, minRatio: 4.5 },
    { name: `${mode}: destructive-foreground on destructive`, fg: p.destructiveForeground, bg: p.destructive, minRatio: 4.5 },

    // Muted / low-emphasis text
    { name: `${mode}: muted-foreground on muted`, fg: p.mutedForeground, bg: p.muted, minRatio: 4.5 },
    { name: `${mode}: muted-foreground on background`, fg: p.mutedForeground, bg: p.background, minRatio: 4.5 },

    // Primary text on various surfaces
    { name: `${mode}: primary on background`, fg: p.primary, bg: p.background, minRatio: 3.0 },
    { name: `${mode}: primary on card`, fg: p.primary, bg: p.card, minRatio: 3.0 },
    { name: `${mode}: accent on background`, fg: p.accent, bg: p.background, minRatio: 3.0 },

    // Input / border pairs (decorative edges — follow shadcn convention of subtle borders)

    // Status colors
    { name: `${mode}: status-success foreground on background`, fg: p.statusSuccess, bg: p.background, minRatio: 3.0 },
    { name: `${mode}: status-warning foreground on background`, fg: p.statusWarning, bg: p.background, minRatio: 3.0 },
    { name: `${mode}: status-destructive foreground on background`, fg: p.statusDestructive, bg: p.background, minRatio: 3.0 },

    // Foreground on various backgrounds
    { name: `${mode}: foreground on card`, fg: p.foreground, bg: p.card, minRatio: 4.5 },
    { name: `${mode}: foreground on muted`, fg: p.foreground, bg: p.muted, minRatio: 4.5 },
  ];
}

// ── Tests ──────────────────────────────────────────────────────

describe("WCAG 2.1 AA Contrast — Brand Palette", () => {
  describe.each([{ mode: "Light", palette: LIGHT }, { mode: "Dark", palette: DARK }])(
    "$mode mode",
    ({ mode, palette }) => {
      const pairs = getPairs(palette as typeof LIGHT | typeof DARK, mode);

      it.each(pairs)("$name — ≥ $minRatio:1", ({ name, fg, bg, minRatio }) => {
        const ratio = ratioFromOklch(fg, bg);
        expect(
          ratio,
          `${name}: got ${ratio.toFixed(2)}:1, need ≥ ${minRatio}:1`,
        ).toBeGreaterThanOrEqual(minRatio);
      });
    },
  );

  describe("No grayscale values", () => {
    it.each(
      (Object.entries(LIGHT) as [string, string][]).concat(
        Object.entries(DARK) as [string, string][],
      ),
    )("%s has chroma > 0", (name, raw) => {
      const c = parseOklch(raw);
      expect(c.C, `${name} has chroma ${c.C}, expected > 0`).toBeGreaterThan(0);
    });
  });
});
