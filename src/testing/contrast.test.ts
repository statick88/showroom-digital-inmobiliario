import { describe, it, expect } from "vitest";

interface Oklch {
  L: number;
  C: number;
  H: number;
}

function parseOklch(raw: string): Oklch {
  const match = raw.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!match) throw new Error(`Cannot parse OKLCH value: ${raw}`);
  return { L: Number(match[1]), C: Number(match[2]), H: Number(match[3]) };
}

function oklchToLuminance(c: Oklch): number {
  const hRad = (c.H * Math.PI) / 180;
  const a = c.C * Math.cos(hRad);
  const b = c.C * Math.sin(hRad);

  const l_ = c.L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = c.L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = c.L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ratioFromOklch(fgRaw: string, bgRaw: string): number {
  const fg = parseOklch(fgRaw);
  const bg = parseOklch(bgRaw);
  return contrastRatio(oklchToLuminance(fg), oklchToLuminance(bg));
}

const LIGHT = {
  background: "oklch(0.975 0.015 75)",
  foreground: "oklch(0.18 0.01 60)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.18 0.01 60)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.18 0.01 60)",
  primary: "oklch(0.52 0.16 32)",
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.48 0.12 38)",
  secondaryForeground: "oklch(1 0 0)",
  muted: "oklch(0.90 0.015 60)",
  mutedForeground: "oklch(0.48 0.02 40)",
  accent: "oklch(0.80 0.09 42)",
  accentForeground: "oklch(0.18 0.01 60)",
  destructive: "oklch(0.50 0.22 28)",
  destructiveForeground: "oklch(1 0 0)",
  border: "oklch(0.84 0.02 35)",
  input: "oklch(0.84 0.02 35)",
  ring: "oklch(0.52 0.16 32)",
  statusSuccess: "oklch(0.55 0.14 145)",
  statusWarning: "oklch(0.62 0.14 72)",
  statusDestructive: "oklch(0.50 0.22 28)",
} as const;

const DARK = {
  background: "oklch(0.18 0.01 40)",
  foreground: "oklch(0.93 0.01 40)",
  card: "oklch(0.22 0.01 40)",
  cardForeground: "oklch(0.93 0.01 40)",
  popover: "oklch(0.22 0.01 40)",
  popoverForeground: "oklch(0.93 0.01 40)",
  primary: "oklch(0.62 0.14 32)",
  primaryForeground: "oklch(0.18 0.02 40)",
  secondary: "oklch(0.35 0.05 40)",
  secondaryForeground: "oklch(0.93 0.01 40)",
  muted: "oklch(0.25 0.01 40)",
  mutedForeground: "oklch(0.65 0.02 40)",
  accent: "oklch(0.72 0.10 42)",
  accentForeground: "oklch(0.18 0.02 40)",
  destructive: "oklch(0.50 0.18 28)",
  destructiveForeground: "oklch(0.93 0.01 40)",
  border: "oklch(0.30 0.01 40)",
  input: "oklch(0.30 0.01 40)",
  ring: "oklch(0.62 0.14 32)",
  statusSuccess: "oklch(0.60 0.10 145)",
  statusWarning: "oklch(0.70 0.12 75)",
  statusDestructive: "oklch(0.62 0.14 28)",
} as const;

interface ContrastPair {
  name: string;
  fg: string;
  bg: string;
  minRatio: number;
}

function getPairs(p: typeof LIGHT | typeof DARK, mode: string): ContrastPair[] {
  return [
    {
      name: `${mode}: foreground on background`,
      fg: p.foreground,
      bg: p.background,
      minRatio: 4.5,
    },
    { name: `${mode}: card-foreground on card`, fg: p.cardForeground, bg: p.card, minRatio: 4.5 },
    {
      name: `${mode}: popover-foreground on popover`,
      fg: p.popoverForeground,
      bg: p.popover,
      minRatio: 4.5,
    },
    {
      name: `${mode}: primary-foreground on primary`,
      fg: p.primaryForeground,
      bg: p.primary,
      minRatio: 4.5,
    },
    {
      name: `${mode}: secondary-foreground on secondary`,
      fg: p.secondaryForeground,
      bg: p.secondary,
      minRatio: 4.5,
    },
    {
      name: `${mode}: accent-foreground on accent`,
      fg: p.accentForeground,
      bg: p.accent,
      minRatio: 4.5,
    },
    {
      name: `${mode}: destructive-foreground on destructive`,
      fg: p.destructiveForeground,
      bg: p.destructive,
      minRatio: 4.5,
    },
    {
      name: `${mode}: muted-foreground on muted`,
      fg: p.mutedForeground,
      bg: p.muted,
      minRatio: 4.5,
    },
    {
      name: `${mode}: muted-foreground on background`,
      fg: p.mutedForeground,
      bg: p.background,
      minRatio: 4.5,
    },
    { name: `${mode}: primary on background`, fg: p.primary, bg: p.background, minRatio: 3.0 },
    { name: `${mode}: primary on card`, fg: p.primary, bg: p.card, minRatio: 3.0 },
    {
      name: `${mode}: status-success foreground on background`,
      fg: p.statusSuccess,
      bg: p.background,
      minRatio: 3.0,
    },
    {
      name: `${mode}: status-warning foreground on background`,
      fg: p.statusWarning,
      bg: p.background,
      minRatio: 3.0,
    },
    {
      name: `${mode}: status-destructive foreground on background`,
      fg: p.statusDestructive,
      bg: p.background,
      minRatio: 3.0,
    },
    { name: `${mode}: foreground on card`, fg: p.foreground, bg: p.card, minRatio: 4.5 },
    { name: `${mode}: foreground on muted`, fg: p.foreground, bg: p.muted, minRatio: 4.5 },
  ];
}

describe("WCAG 2.1 AA Contrast — Brand Palette", () => {
  describe.each([
    { mode: "Light", palette: LIGHT },
    { mode: "Dark", palette: DARK },
  ])("$mode mode", ({ mode, palette }) => {
    const pairs = getPairs(palette as typeof LIGHT | typeof DARK, mode);

    it.each(pairs)("$name — ≥ $minRatio:1", ({ name, fg, bg, minRatio }) => {
      const ratio = ratioFromOklch(fg, bg);
      expect(
        ratio,
        `${name}: got ${ratio.toFixed(2)}:1, need ≥ ${minRatio}:1`,
      ).toBeGreaterThanOrEqual(minRatio);
    });
  });

  describe("No grayscale values", () => {
    const allowGrayscale = new Set([
      "card",
      "popover",
      "primaryForeground",
      "secondaryForeground",
      "destructiveForeground",
    ]);
    it.each(
      (Object.entries(LIGHT) as [string, string][])
        .concat(Object.entries(DARK) as [string, string][])
        .filter(([k]) => !allowGrayscale.has(k)),
    )("%s has chroma > 0", (name, raw) => {
      const c = parseOklch(raw);
      expect(c.C, `${name} has chroma ${c.C}, expected > 0`).toBeGreaterThan(0);
    });
  });
});
