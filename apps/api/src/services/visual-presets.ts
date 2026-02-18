export interface PresetOption {
  id: string;
  label: string;
  promptHint: string;
}

export const STYLE_PRESETS: PresetOption[] = [
  { id: "editorial", label: "Editorial", promptHint: "Clean editorial composition with strong hierarchy and negative space." },
  { id: "minimal_corporate", label: "Minimal Corporate", promptHint: "Minimal enterprise aesthetic with restrained geometry and polished surfaces." },
  { id: "isometric_technical", label: "Isometric Technical", promptHint: "Isometric technical illustration style with precise structure and system clarity." },
  { id: "cinematic_enterprise", label: "Cinematic Enterprise", promptHint: "Cinematic enterprise visual style with depth, directional light, and premium realism." },
  { id: "blueprint_analytic", label: "Blueprint Analytic", promptHint: "Blueprint-inspired analytical visual language with annotation-like detail." },
  { id: "product_showcase", label: "Product Showcase", promptHint: "High-end product showcase framing with focus on material fidelity and spotlighting." }
];

export const GRAPHIC_STYLE_PRESETS: PresetOption[] = [
  { id: "vector_icon_system", label: "Vector Icon System", promptHint: "Vector icon system style with simple geometry, consistent stroke logic, and crisp negative space." },
  { id: "flat_infographic", label: "Flat Infographic", promptHint: "Flat infographic treatment with clean blocks, clear hierarchy, and data-friendly visual structure." },
  { id: "social_hero_poster", label: "Social Hero Poster", promptHint: "Social poster composition with a dominant focal element, bold typography zones, and strong contrast." },
  { id: "ui_illustration", label: "UI Illustration", promptHint: "Product UI illustration style with interface-inspired shapes, soft depth, and enterprise polish." },
  { id: "sticker_badge_3d", label: "Sticker Badge 3D", promptHint: "3D badge or sticker look with compact depth, glossy edges, and clear silhouette readability." },
  { id: "abstract_shape_background", label: "Abstract Shape Background", promptHint: "Abstract background system using layered shapes and gradients suitable for marketing backdrops." }
];

export const FONT_PRESETS: PresetOption[] = [
  { id: "modern_sans", label: "Modern Sans", promptHint: "Modern sans-serif typography style cues where text appears." },
  { id: "montserrat", label: "Montserrat", promptHint: "Montserrat-inspired geometric sans tone with clean modern marketing character." },
  { id: "grotesk", label: "Grotesk", promptHint: "Grotesk type aesthetic with neutral, professional character." },
  { id: "geometric_sans", label: "Geometric Sans", promptHint: "Geometric sans feel with crisp proportional forms." },
  { id: "transitional_serif", label: "Transitional Serif", promptHint: "Transitional serif tone for premium editorial credibility." },
  { id: "mono_tech", label: "Mono Tech", promptHint: "Technical mono-inspired typography cues for interface-like clarity." },
  { id: "humanist_sans", label: "Humanist Sans", promptHint: "Humanist sans tone with approachable professional warmth." }
];

export const COLOR_SCHEMES: PresetOption[] = [
  { id: "executive_blue", label: "Executive Blue", promptHint: "Executive blue dominant palette with neutral balancing tones." },
  { id: "neutral_slate", label: "Neutral Slate", promptHint: "Neutral slate palette with calm, business-first contrast." },
  { id: "tech_cyan", label: "Tech Cyan", promptHint: "Tech cyan accents over dark-to-light neutral framework." },
  { id: "steel_teal", label: "Steel + Teal", promptHint: "Steel-gray base with controlled teal accents." },
  { id: "graphite_mono", label: "Graphite Mono", promptHint: "Graphite monochrome palette with subtle tonal separation." },
  { id: "navy_contrast", label: "Navy Contrast", promptHint: "High-contrast navy-led palette with bright clarity points." },
  { id: "deep_ocean", label: "Deep Ocean", promptHint: "Deep ocean blues with bright aqua accents and clean airy highlights." },
  { id: "forest_ink", label: "Forest Ink", promptHint: "Dark evergreen base with fresh green accents and soft mint highlights." },
  { id: "charcoal_lime", label: "Charcoal + Lime", promptHint: "Charcoal neutrals with energetic lime accents for modern technical contrast." },
  { id: "plum_gold", label: "Plum + Gold", promptHint: "Deep plum foundation with restrained gold accents and warm light neutrals." },
  { id: "sunset_coral", label: "Sunset Coral", promptHint: "Warm sunset coral accents over earthy reds with soft peach highlights." },
  { id: "midnight_ice", label: "Midnight Ice", promptHint: "Midnight navy with icy cyan accents and crisp cool highlights." }
];

export const getPresetHint = (collection: PresetOption[], id?: string): string | undefined => {
  if (!id) {
    return undefined;
  }
  return collection.find((item) => item.id === id)?.promptHint;
};
