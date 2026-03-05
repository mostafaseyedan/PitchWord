import { ColorSchemeOption, FontPresetOption, VisualPresetOption } from "@marketing/shared";

export interface ColorRole {
  hex: string;
  name: string;
}

export const stylePresetOptions: VisualPresetOption[] = [
  {
    id: "editorial",
    label: "Editorial",
    promptHint: `Create a breathtaking editorial marketing composition that evokes the sophistication of a luxury magazine spread — where typography is the art and whitespace speaks louder than imagery.

TYPOGRAPHY:
- Headline: {{font_headline}} in {{primary_dark}}
- Subhead: {{font_subhead}} in {{primary_accent}}
- Body: {{font_body}} with generous line height

COLORS & STYLE:
- Canvas: warm off-white or soft texture
- Use {{primary_dark}} for anchors and text
- Use {{primary_accent}} sparingly for highlights
- Minimalist, balanced composition with 40% empty space
- Avoid heavy shadows, gradients, and decorative elements`
  },
  {
    id: "minimal_corporate",
    label: "Minimal Corporate",
    promptHint: `Create a razor-sharp minimal corporate enterprise visual that radiates authority and data-driven confidence.

TYPOGRAPHY:
- Title: {{font_headline}} in {{primary_dark}}
- Body/Data: {{font_body}} for precise legibility

COLORS & STYLE:
- Canvas: light neutral background
- Use {{primary_dark}} for structural elements and main text
- Use {{primary_accent}} for key metrics and data highlights
- Sharp, modular grid layouts with flat, clean surfaces
- No decorative illustrations; pure professional polish`
  },
  {
    id: "isometric_technical",
    label: "Isometric Technical",
    promptHint: `Create a stunning isometric technical illustration that feels like a premium enterprise architecture diagram.

TYPOGRAPHY:
- Use {{font_headline}} for primary labels
- Use {{font_body}} for technical callouts and cards

COLORS & STYLE:
- Use {{primary_dark}} for main structural elements
- Use {{primary_accent}} for active data flows and highlights
- Use {{primary_light}} for background and inactive states
- Strict 30-degree isometric grid with connected architecture
- Include floating info cards and data flow indicators`
  },
  {
    id: "cinematic_enterprise",
    label: "Cinematic Enterprise",
    promptHint: `Create a jaw-dropping cinematic enterprise visual with dramatic depth, volumetric lighting, and premium realism.

TYPOGRAPHY:
- Use {{font_headline}} floating on atmospheric backgrounds
- Use {{font_body}} for secondary text that feels like HUD metrics

COLORS & STYLE:
- Deep cinematic gradient using {{primary_dark}}
- Glows and highlights restricted to {{primary_accent}}
- Use {{primary_light}} for specular reflections and bright details
- Strong directional key light with dramatic shadows
- Frosted glass cards at varying Z-depths`
  },
  {
    id: "blueprint_analytic",
    label: "Blueprint Analytic",
    promptHint: `Create a mesmerizing blueprint-inspired analytical visual that feels like a classified engineering document with meticulous annotation.

TYPOGRAPHY:
- Use {{font_headline}} for technical titles and values
- Use {{font_label}} for dense dimension styling and callouts

COLORS & STYLE:
- Background: deep {{primary_dark}} cyanotype base
- Linework: mostly white or {{primary_light}}
- Use {{primary_accent}} for critical measurements or warnings
- Flat technical drawing style with NO 3D perspective
- Include leader lines, callout circles, and dimension indicators`
  },
  {
    id: "product_showcase",
    label: "Product Showcase",
    promptHint: `Create a breathtaking product showcase that treats the central subject like a luxury item bathed in perfect studio lighting.

TYPOGRAPHY:
- Clean title using {{font_headline}}
- Elegant feature callouts using {{font_body}} and thin leader lines

COLORS & STYLE:
- Background from {{primary_light}} to pure neutral
- Highlight specific features with {{primary_accent}} sparingly
- Key+fill studio lighting with razor-sharp specular highlights
- Centered 3/4 angle product focus with soft floor reflection
- Minimalist background with zero distractions`
  }
];

export const graphicStylePresetOptions: VisualPresetOption[] = [
  {
    id: "vector_icon_system",
    label: "Vector Icon System",
    promptHint: `Create a show-stopping, ultra-vibrant marketing vector illustration that radiates innovation and high-growth energy.

TYPOGRAPHY:
- Integrated text or numbers use {{font_headline}}

COLORS & STYLE:
- Interlocking geometric layers using {{primary_dark}}
- Vibrant mesh gradients with {{primary_accent}}
- Abstract, tech-forward system modules with glassmorphism
- Orbiting satellite elements like floating icons or data dots
- Crisp vector edges with a sense of upward momentum`
  },
  {
    id: "flat_infographic",
    label: "Infographic",
    promptHint: `Create an 8k visually stunning infographic. Less words more visual.
    
TYPOGRAPHY:
- Use {{font_headline}} for key headers
- Use {{font_body}} for supporting text

COLORS:
- Use {{primary_dark}} as the foundation
- Use {{primary_accent}} for highlights and important visual data`
  },
  {
    id: "social_hero_poster",
    label: "Social Hero Poster",
    promptHint: `Create a scroll-stopping social hero poster with massive visual impact and pure focal energy.

TYPOGRAPHY:
- High-contrast, hyper-legible headline using {{font_headline}}
- Use {{font_subhead}} for supplementary proof points

COLORS & STYLE:
- Edge-to-edge multi-stop gradient from {{primary_dark}} to {{primary_accent}}
- Make the main hero element POP against the background
- Dramatic color separation and scale contrast
- High-energy aesthetics with optional subtle light leaks`
  },
  {
    id: "ui_illustration",
    label: "UI Illustration",
    promptHint: `Create a jaw-droppingly realistic product UI illustration that looks like a pixel-perfect screenshot of a premium dashboard.

TYPOGRAPHY:
- Page titles and numbers in {{font_headline}}
- Clean content blocks and navigation in {{font_body}}

COLORS & STYLE:
- Interface foundation in pristine whites and {{primary_light}}
- Dark nav or deep contrast sections with {{primary_dark}}
- Use {{primary_accent}} for active states and critical buttons
- Show multiple UI depths, data charts, and metric row
- Highly structured, convincing data visualization`
  },
  {
    id: "sticker_badge_3d",
    label: "Sticker Badge 3D",
    promptHint: `Create a show-stopping 3D sticker/badge that feels like a premium collectible enamel pin.

TYPOGRAPHY:
- Use {{font_headline}} for the central monogram or text

COLORS & STYLE:
- Primary badge fill using a gradient from {{primary_dark}} to {{primary_accent}}
- Light catching bevels and reflections using {{primary_light}}
- Tangible 3D thickness with a shiny enamel surface
- Clean, thick outer contour readable at small scales`
  },
  {
    id: "abstract_shape_background",
    label: "Abstract Shape Background",
    promptHint: `Create a mesmerizing abstract shape background that feels like living, breathing digital art.

COLORS & STYLE:
- Luxurious multi-stop gradient using {{primary_dark}}, {{primary_accent}}, and {{primary_light}}
- Layered depths of soft, highly blurred organic masses
- Fine accent shapes in the foreground for texture
- Smooth, noise-textured gradients with space for text`
  }
];

export const fontPresetOptions: FontPresetOption[] = [
  {
    id: "modern_sans",
    label: "Modern Sans",
    previewFontFamily: '"Figtree", var(--font-sans)',
    roles: { family: "sans-serif", headline: "bold sans-serif", subhead: "medium sans-serif", body: "regular sans-serif", label: "light sans-serif" },
    promptHint: "Apply modern sans-serif typography (inspired by Figtree or Inter)."
  },
  {
    id: "montserrat",
    label: "Montserrat",
    previewFontFamily: '"Montserrat", var(--font-sans)',
    roles: { family: "sans-serif", headline: "extra-bold sans-serif", subhead: "semi-bold sans-serif", body: "regular sans-serif", label: "medium sans-serif" },
    promptHint: "Apply Montserrat-inspired geometric sans typography with punchy marketing character."
  },
  {
    id: "grotesk",
    label: "Grotesk",
    previewFontFamily: '"Space Grotesk", var(--font-sans)',
    roles: { family: "sans-serif", headline: "bold sans-serif", subhead: "medium sans-serif", body: "regular sans-serif", label: "medium sans-serif" },
    promptHint: "Apply grotesk-style typography (inspired by Space Grotesk) with neutral, professional character."
  },
  {
    id: "geometric_sans",
    label: "Geometric Sans",
    previewFontFamily: '"Manrope", var(--font-sans)',
    roles: { family: "sans-serif", headline: "bold sans-serif", subhead: "semi-bold sans-serif", body: "regular sans-serif", label: "medium sans-serif" },
    promptHint: "Apply geometric sans-serif typography (inspired by Manrope or Circular) with crisp proportional forms."
  },
  {
    id: "transitional_serif",
    label: "Transitional Serif",
    previewFontFamily: '"Merriweather", Georgia, serif',
    roles: { family: "serif", headline: "bold serif", subhead: "semi-bold serif", body: "regular serif", label: "light serif" },
    promptHint: "Apply transitional serif typography (inspired by Merriweather) for premium editorial credibility."
  },
  {
    id: "mono_tech",
    label: "Mono Tech",
    previewFontFamily: '"IBM Plex Mono", var(--font-mono)',
    roles: { family: "monospace", headline: "bold monospace", subhead: "medium monospace", body: "regular monospace", label: "medium monospace" },
    promptHint: "Apply monospace technical typography (inspired by IBM Plex Mono) for interface-like precision."
  },
  {
    id: "humanist_sans",
    label: "Humanist Sans",
    previewFontFamily: '"Source Sans 3", var(--font-sans)',
    roles: { family: "sans-serif", headline: "semi-bold sans-serif", subhead: "medium sans-serif", body: "regular sans-serif", label: "light sans-serif" },
    promptHint: "Apply humanist sans-serif typography (inspired by Source Sans 3) with approachable professional warmth."
  }
];

export const colorSchemeOptions: ColorSchemeOption[] = [
  {
    id: "executive_blue",
    label: "Executive Blue",
    swatches: ["#1B365D", "#2D5F99", "#D8E7F8"],
    roles: { primaryDark: { hex: "#1B365D", name: "deep navy" }, primaryAccent: { hex: "#2D5F99", name: "steel blue" }, primaryLight: { hex: "#D8E7F8", name: "soft blue wash" } },
    promptHint: "Apply an executive blue dominant palette. Foundation/background: soft blue wash (#D8E7F8). Deep navy (#1B365D) primary, steel blue (#2D5F99) accent."
  },
  {
    id: "neutral_slate",
    label: "Neutral Slate",
    swatches: ["#334155", "#64748B", "#E2E8F0"],
    roles: { primaryDark: { hex: "#334155", name: "deep slate" }, primaryAccent: { hex: "#64748B", name: "medium slate" }, primaryLight: { hex: "#E2E8F0", name: "ice gray" } },
    promptHint: "Apply a neutral slate palette with calm contrast. Foundation/background: ice gray (#E2E8F0). Deep slate (#334155) primary, medium slate (#64748B) accent."
  },
  {
    id: "tech_cyan",
    label: "Tech Cyan",
    swatches: ["#155E75", "#06B6D4", "#CFFAFE"],
    roles: { primaryDark: { hex: "#155E75", name: "dark teal" }, primaryAccent: { hex: "#06B6D4", name: "bright cyan" }, primaryLight: { hex: "#CFFAFE", name: "cyan wash" } },
    promptHint: "Apply a tech cyan accent palette. Foundation/background: cyan wash (#CFFAFE). Dark teal (#155E75) primary, bright cyan (#06B6D4) accent."
  },
  {
    id: "steel_teal",
    label: "Steel + Teal",
    swatches: ["#475569", "#0F766E", "#99F6E4"],
    roles: { primaryDark: { hex: "#475569", name: "cool steel" }, primaryAccent: { hex: "#0F766E", name: "enterprise teal" }, primaryLight: { hex: "#99F6E4", name: "mint wash" } },
    promptHint: "Apply steel-gray base with controlled teal accents. Foundation/background: mint wash (#99F6E4). Cool steel (#475569) primary, enterprise teal (#0F766E) accent."
  },
  {
    id: "graphite_mono",
    label: "Graphite Mono",
    swatches: ["#111827", "#4B5563", "#D1D5DB"],
    roles: { primaryDark: { hex: "#111827", name: "near-black" }, primaryAccent: { hex: "#4B5563", name: "dark graphite" }, primaryLight: { hex: "#D1D5DB", name: "silver gray" } },
    promptHint: "Apply a graphite monochrome palette. Foundation/background: silver gray (#D1D5DB). Near-black (#111827) primary, dark graphite (#4B5563) accent."
  },
  {
    id: "navy_contrast",
    label: "Navy Contrast",
    swatches: ["#0B1F3A", "#F59E0B", "#EEF2FF"],
    roles: { primaryDark: { hex: "#0B1F3A", name: "midnight navy" }, primaryAccent: { hex: "#F59E0B", name: "warm amber" }, primaryLight: { hex: "#EEF2FF", name: "pale indigo" } },
    promptHint: "Apply high-contrast navy with bright amber clarity points. Foundation/background: pale indigo (#EEF2FF). Midnight navy (#0B1F3A) primary, warm amber (#F59E0B) accent."
  },
  {
    id: "deep_ocean",
    label: "Deep Ocean",
    swatches: ["#0E3A5B", "#1D7FA8", "#D7EEF8"],
    roles: { primaryDark: { hex: "#0E3A5B", name: "deep ocean" }, primaryAccent: { hex: "#1D7FA8", name: "ocean blue" }, primaryLight: { hex: "#D7EEF8", name: "sky wash" } },
    promptHint: "Apply a deep ocean blue palette. Foundation/background: sky wash (#D7EEF8). Deep ocean (#0E3A5B) primary, ocean blue (#1D7FA8) accent."
  },
  {
    id: "forest_ink",
    label: "Forest Ink",
    swatches: ["#1F3A2E", "#2D7A57", "#D9F2E4"],
    roles: { primaryDark: { hex: "#1F3A2E", name: "deep forest" }, primaryAccent: { hex: "#2D7A57", name: "vibrant green" }, primaryLight: { hex: "#D9F2E4", name: "mint wash" } },
    promptHint: "Apply dark evergreen palette with fresh green accents. Foundation/background: mint wash (#D9F2E4). Deep forest (#1F3A2E) primary, vibrant green (#2D7A57) accent."
  },
  {
    id: "charcoal_lime",
    label: "Charcoal + Lime",
    swatches: ["#1F2937", "#84CC16", "#EAF9C8"],
    roles: { primaryDark: { hex: "#1F2937", name: "deep charcoal" }, primaryAccent: { hex: "#84CC16", name: "electric lime" }, primaryLight: { hex: "#EAF9C8", name: "lime wash" } },
    promptHint: "Apply charcoal base with energetic lime accents. Foundation/background: lime wash (#EAF9C8). Deep charcoal (#1F2937) primary, electric lime (#84CC16) accent."
  },
  {
    id: "plum_gold",
    label: "Plum + Gold",
    swatches: ["#4A2D5E", "#C49B2A", "#F3EBDD"],
    roles: { primaryDark: { hex: "#4A2D5E", name: "deep plum" }, primaryAccent: { hex: "#C49B2A", name: "antique gold" }, primaryLight: { hex: "#F3EBDD", name: "warm cream" } },
    promptHint: "Apply deep plum with restrained gold accents. Foundation/background: warm cream (#F3EBDD). Deep plum (#4A2D5E) primary, antique gold (#C49B2A) accent."
  },
  {
    id: "sunset_coral",
    label: "Sunset Coral",
    swatches: ["#7A2E2E", "#F97316", "#FDE7D9"],
    roles: { primaryDark: { hex: "#7A2E2E", name: "deep terracotta" }, primaryAccent: { hex: "#F97316", name: "vibrant coral-orange" }, primaryLight: { hex: "#FDE7D9", name: "peach wash" } },
    promptHint: "Apply warm sunset coral accent palette. Foundation/background: peach wash (#FDE7D9). Deep terracotta (#7A2E2E) primary, vibrant coral-orange (#F97316) accent."
  },
  {
    id: "midnight_ice",
    label: "Midnight Ice",
    swatches: ["#0F172A", "#38BDF8", "#E0F2FE"],
    roles: { primaryDark: { hex: "#0F172A", name: "midnight" }, primaryAccent: { hex: "#38BDF8", name: "ice blue" }, primaryLight: { hex: "#E0F2FE", name: "frost wash" } },
    promptHint: "Apply midnight navy with icy cyan accents. Foundation/background: frost wash (#E0F2FE). Midnight (#0F172A) primary, ice blue (#38BDF8) accent."
  }
];

const DEFAULT_COLOR_ROLES = {
  primaryDark: { hex: "#1B365D", name: "deep navy" },
  primaryAccent: { hex: "#2D5F99", name: "steel blue" },
  primaryLight: { hex: "#D8E7F8", name: "soft blue wash" }
};

const DEFAULT_FONT_ROLES = {
  family: "sans-serif",
  headline: "bold sans-serif",
  subhead: "semi-bold sans-serif",
  body: "regular sans-serif",
  label: "light sans-serif"
};

function formatRole(role: ColorRole): string {
  return `${role.name} (${role.hex})`;
}

export function resolveStyleHint(
  styleHint: string,
  fontPreset?: FontPresetOption,
  colorPreset?: ColorSchemeOption
): string {
  const cr = colorPreset?.roles ?? DEFAULT_COLOR_ROLES;
  const fr = fontPreset?.roles ?? DEFAULT_FONT_ROLES;

  return styleHint
    .replaceAll("{{primary_dark}}", formatRole(cr.primaryDark))
    .replaceAll("{{primary_accent}}", formatRole(cr.primaryAccent))
    .replaceAll("{{primary_light}}", formatRole(cr.primaryLight))
    .replaceAll("{{font_headline}}", fr.headline)
    .replaceAll("{{font_subhead}}", fr.subhead)
    .replaceAll("{{font_body}}", fr.body)
    .replaceAll("{{font_label}}", fr.label)
    .replaceAll("{{font_family}}", fr.family);
}
