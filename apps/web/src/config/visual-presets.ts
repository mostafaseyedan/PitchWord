export interface VisualPresetOption {
  id: string;
  label: string;
}

export const stylePresetOptions: VisualPresetOption[] = [
  { id: "editorial", label: "Editorial" },
  { id: "minimal_corporate", label: "Minimal Corporate" },
  { id: "isometric_technical", label: "Isometric Technical" },
  { id: "cinematic_enterprise", label: "Cinematic Enterprise" },
  { id: "blueprint_analytic", label: "Blueprint Analytic" },
  { id: "product_showcase", label: "Product Showcase" }
];

export const fontPresetOptions: VisualPresetOption[] = [
  { id: "modern_sans", label: "Modern Sans" },
  { id: "grotesk", label: "Grotesk" },
  { id: "geometric_sans", label: "Geometric Sans" },
  { id: "transitional_serif", label: "Transitional Serif" },
  { id: "mono_tech", label: "Mono Tech" },
  { id: "humanist_sans", label: "Humanist Sans" }
];

export const colorSchemeOptions: VisualPresetOption[] = [
  { id: "executive_blue", label: "Executive Blue" },
  { id: "neutral_slate", label: "Neutral Slate" },
  { id: "tech_cyan", label: "Tech Cyan" },
  { id: "steel_teal", label: "Steel + Teal" },
  { id: "graphite_mono", label: "Graphite Mono" },
  { id: "navy_contrast", label: "Navy Contrast" }
];
