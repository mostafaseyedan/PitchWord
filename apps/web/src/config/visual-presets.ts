export interface VisualPresetOption {
  id: string;
  label: string;
}

export interface FontPresetOption extends VisualPresetOption {
  previewFontFamily: string;
}

export interface ColorSchemeOption extends VisualPresetOption {
  swatches: [string, string, string];
}

export const stylePresetOptions: VisualPresetOption[] = [
  { id: "editorial", label: "Editorial" },
  { id: "minimal_corporate", label: "Minimal Corporate" },
  { id: "isometric_technical", label: "Isometric Technical" },
  { id: "cinematic_enterprise", label: "Cinematic Enterprise" },
  { id: "blueprint_analytic", label: "Blueprint Analytic" },
  { id: "product_showcase", label: "Product Showcase" }
];

export const graphicStylePresetOptions: VisualPresetOption[] = [
  { id: "vector_icon_system", label: "Vector Icon System" },
  { id: "flat_infographic", label: "Flat Infographic" },
  { id: "social_hero_poster", label: "Social Hero Poster" },
  { id: "ui_illustration", label: "UI Illustration" },
  { id: "sticker_badge_3d", label: "Sticker Badge 3D" },
  { id: "abstract_shape_background", label: "Abstract Shape Background" }
];

export const fontPresetOptions: FontPresetOption[] = [
  { id: "modern_sans", label: "Modern Sans", previewFontFamily: '"Figtree", var(--font-sans)' },
  { id: "montserrat", label: "Montserrat", previewFontFamily: '"Montserrat", var(--font-sans)' },
  { id: "grotesk", label: "Grotesk", previewFontFamily: '"Space Grotesk", var(--font-sans)' },
  { id: "geometric_sans", label: "Geometric Sans", previewFontFamily: '"Manrope", var(--font-sans)' },
  { id: "transitional_serif", label: "Transitional Serif", previewFontFamily: '"Merriweather", Georgia, serif' },
  { id: "mono_tech", label: "Mono Tech", previewFontFamily: '"IBM Plex Mono", var(--font-mono)' },
  { id: "humanist_sans", label: "Humanist Sans", previewFontFamily: '"Source Sans 3", var(--font-sans)' }
];

export const colorSchemeOptions: ColorSchemeOption[] = [
  { id: "executive_blue", label: "Executive Blue", swatches: ["#1B365D", "#2D5F99", "#D8E7F8"] },
  { id: "neutral_slate", label: "Neutral Slate", swatches: ["#334155", "#64748B", "#E2E8F0"] },
  { id: "tech_cyan", label: "Tech Cyan", swatches: ["#155E75", "#06B6D4", "#CFFAFE"] },
  { id: "steel_teal", label: "Steel + Teal", swatches: ["#475569", "#0F766E", "#99F6E4"] },
  { id: "graphite_mono", label: "Graphite Mono", swatches: ["#111827", "#4B5563", "#D1D5DB"] },
  { id: "navy_contrast", label: "Navy Contrast", swatches: ["#0B1F3A", "#F59E0B", "#EEF2FF"] },
  { id: "deep_ocean", label: "Deep Ocean", swatches: ["#0E3A5B", "#1D7FA8", "#D7EEF8"] },
  { id: "forest_ink", label: "Forest Ink", swatches: ["#1F3A2E", "#2D7A57", "#D9F2E4"] },
  { id: "charcoal_lime", label: "Charcoal + Lime", swatches: ["#1F2937", "#84CC16", "#EAF9C8"] },
  { id: "plum_gold", label: "Plum + Gold", swatches: ["#4A2D5E", "#C49B2A", "#F3EBDD"] },
  { id: "sunset_coral", label: "Sunset Coral", swatches: ["#7A2E2E", "#F97316", "#FDE7D9"] },
  { id: "midnight_ice", label: "Midnight Ice", swatches: ["#0F172A", "#38BDF8", "#E0F2FE"] }
];
