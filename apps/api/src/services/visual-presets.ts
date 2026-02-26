/* ------------------------------------------------------------------ */
/*  Interfaces                                                         */
/* ------------------------------------------------------------------ */

export interface PresetOption {
  id: string;
  label: string;
  promptHint: string;
}

export interface ColorRole {
  hex: string;
  name: string;
}

export interface ColorSchemePreset extends PresetOption {
  roles: {
    primaryDark: ColorRole;
    primaryAccent: ColorRole;
    primaryLight: ColorRole;
  };
}

export interface FontRoleSet {
  family: string;
  headline: string;
  subhead: string;
  body: string;
  label: string;
}

export interface FontPreset extends PresetOption {
  roles: FontRoleSet;
}

/* ------------------------------------------------------------------ */
/*  STYLE_PRESETS  (Content Engine)                                     */
/*  Template vars: {{primary_dark}}, {{primary_accent}}, {{primary_light}} */
/*                 {{font_headline}}, {{font_subhead}}, {{font_body}},     */
/*                 {{font_label}}, {{font_family}}                         */
/* ------------------------------------------------------------------ */

export const STYLE_PRESETS: PresetOption[] = [
  {
    id: "editorial",
    label: "Editorial",
    promptHint: [
      "Create a breathtaking editorial marketing composition that evokes the sophistication of Vogue, Monocle, or Kinfolk magazine spreads — where typography IS the art and whitespace speaks louder than imagery.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the calm authority of a luxury brand lookbook: unhurried, confident, impossibly refined.",
      "- The overall feeling should be 'less is more, but what remains is perfect.'",
      "- Think: a gallery wall with a single perfectly-placed piece — every pixel is intentional.",
      "",
      "PAGE STYLE:",
      "- Canvas: warm off-white (#F8F8F6) with a barely-perceptible paper grain texture at 2% opacity for tactile warmth.",
      "- {{primary_dark}} headline zone spanning the top third — this is the anchor that commands attention.",
      "- Accent color: {{primary_accent}} used sparingly for pull-quotes, rule lines, drop caps, and secondary highlights.",
      "- Section dividers: ultra-thin 0.5px light-gray (#D9D9D9) horizontal rules that barely whisper.",
      "- Content blocks float on the canvas with 50-60px of breathing room on all sides.",
      "- A subtle vertical rhythm line (1px, {{primary_accent}} at 8% opacity) runs down the left margin like a magazine gutter.",
      "- Overall feel: Condé Nast editorial director approved — restrained, sophisticated, gallery-worthy.",
      "",
      "TYPOGRAPHY — THE HERO:",
      "- Headline: {{font_headline}}, 32-44pt, in {{primary_dark}} tone or white on dark backgrounds, with -0.02em tracking for editorial tightness.",
      "- Subheadline: {{font_subhead}}, 14-16pt, in {{primary_accent}} tone, uppercase with 0.12em letter-spacing for magazine flair.",
      "- Body text: {{font_body}}, 11-12pt, charcoal (#333333), generous 1.65x line height — every line should feel like it has room to breathe.",
      "- Pull-quote: medium italic {{font_family}}, 20-26pt, with a thin 2px left border in {{primary_accent}} and 24px left padding — make it feel like a whispered secret.",
      "- Drop cap (optional): first letter of body text, {{font_headline}}, 48pt, {{primary_accent}}, spanning 3 lines — a subtle luxury detail.",
      "- Caption/attribution: {{font_label}}, 8pt, medium gray (#999999), uppercase, 0.08em tracking.",
      "- ALL text must be crisp, optically kerned, anti-aliased, and feel like it was set by a master typographer.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Top zone: headline and subheadline with clean left or center alignment, 60px top margin minimum.",
      "- Middle: 1-2 content blocks using single-column (max 600px wide) or asymmetric 60/40 two-column layout.",
      "- One featured pull-quote block with 2px left accent border — positioned to break the text rhythm elegantly.",
      "- Optional: one supporting visual element (a subtle geometric accent, thin-line icon, or minimal data point) at restrained 80x80px max size.",
      "- Bottom: clean sign-off with a thin horizontal rule, brand mark area, and optional CTA in pill outline style.",
      "- Vertical rhythm: all elements snap to a baseline grid with consistent 8px increments.",
      "",
      "TEXTURE & DETAIL:",
      "- Subtle paper grain at 2% opacity across the entire canvas for analog warmth.",
      "- Thin geometric accents: a single small circle (6px, {{primary_accent}} outline), a short diagonal line, or a thin cross mark placed asymmetrically as editorial punctuation.",
      "- Rule lines should have perfectly rounded ends, not squared.",
      "- Consider a subtle folio/page number element ({{font_label}}, 7pt, gray) in the bottom corner.",
      "",
      "VISUAL RULES:",
      "- Maximum two accent colors ({{primary_dark}} + {{primary_accent}}) beyond white and charcoal. Restraint IS the design.",
      "- Absolutely no decorative illustrations, gradients, heavy shadows, or ornamental elements.",
      "- Whitespace is the primary design element — at least 40% of the canvas should be empty.",
      "- Text blocks breathe with 24-32px internal padding and 40px inter-block spacing.",
      "- If any graphic element appears, it must be minimal, geometric, and monochrome.",
      "- The composition should feel perfectly balanced even if asymmetric — visual weight must be distributed with intention.",
      "",
      "MUST INCLUDE:",
      "- Commanding headline with unmistakable visual weight and editorial presence.",
      "- Generous whitespace creating luxury breathing room — the viewer should feel calm.",
      "- At least one accent rule or pull-quote with left border.",
      "- Flawless typographic hierarchy: headline > subhead > body > pull-quote > caption.",
      "- Balanced overall composition with intentional negative space.",
      "- The feel of a $200 coffee-table magazine spread — premium, timeless, and effortlessly cool."
    ].join("\n")
  },
  {
    id: "minimal_corporate",
    label: "Minimal Corporate",
    promptHint: [
      "Create a razor-sharp minimal corporate enterprise visual that radiates authority and data-driven confidence — the kind of slide that silences a boardroom and commands respect.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the precision of a Swiss watch, the authority of a McKinsey final deliverable, the clarity of a Bloomberg terminal.",
      "- Every pixel must feel deliberate. Nothing is decoration — everything communicates.",
      "- The viewer should think: 'these people know exactly what they're doing.'",
      "",
      "PAGE STYLE:",
      "- Canvas: light neutral (#F0F2F5) with a micro-crosshatch pattern at 1.5% opacity for premium texture depth.",
      "- Content areas: white card surfaces with crisp 1px border (#E0E0E0) and minimalist shadow (0 1px 3px rgba(0,0,0,0.04)).",
      "- {{primary_dark}} for headers, primary text, and data-heavy elements — it carries the authority.",
      "- {{primary_accent}} for highlights, accent lines, status indicators, and active states — used surgically.",
      "- No gradients anywhere. Flat, clean, mathematical surfaces throughout.",
      "- Section separators: hair-thin rules (0.5px) in light gray (#E8E8E8), spanning 80% width, centered.",
      "- Overall feel: IBM Carbon Design System meets McKinsey deck — conservative, credible, boardroom-ready.",
      "",
      "TYPOGRAPHY:",
      "- Title: {{font_headline}}, 26-30pt, in {{primary_dark}} tone, -0.01em tracking, weight 600-700.",
      "- Section headers: {{font_subhead}}, 13-15pt, in {{primary_dark}} tone, preceded by a small {{primary_accent}} square indicator (4x4px, 2px left margin).",
      "- Body text: {{font_body}}, 10.5-11pt, charcoal (#444444), 1.55x line height, max-width 520px per column.",
      "- Metric hero values: {{font_headline}}, 36-48pt, in {{primary_dark}} tone, weight 700 — these numbers must PUNCH.",
      "- Metric delta indicators: {{font_label}}, 10pt, green (#2E7D32) for positive, red (#C62828) for negative, with ▲/▼ prefix.",
      "- Caption/fine print: {{font_label}}, 8.5pt, medium gray (#888888), uppercase, 0.04em tracking.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Top: clean title block with text in {{primary_dark}} tone, no background band — just precision-placed text with 32px top margin.",
      "- Subtitle or context line: one sentence in {{font_body}}, 12pt, medium gray, directly beneath title with 8px gap.",
      "- Content area: modular white cards arranged in a 2-3 column grid with precise 16px gutters.",
      "- Each card: thin top accent line (2px) in {{primary_accent}}, 20px internal padding, header + content structure.",
      "- Hero metric card: one oversized card spanning 2 columns with a single massive number and sparkline or trend bar.",
      "- Supporting data element: simple table, flat bar chart, or progress indicator matrix using flat fills only.",
      "- Bottom: subtle light-gray strip (#F5F5F5) with key takeaway, action item, or 'Source:' attribution text.",
      "",
      "DATA VISUALIZATION RULES:",
      "- Charts: flat bars with 4px border-radius tops, {{primary_dark}} for primary series, {{primary_accent}} for secondary, 1px #E0E0E0 axes.",
      "- Tables: {{primary_dark}} header row with white text (12pt), alternating white/#F8F8F8 body rows, 1px #E8E8E8 borders.",
      "- Sparklines: thin 1.5px line in {{primary_accent}}, area fill below at 6% opacity, no axis labels.",
      "- Progress bars: 4px height, rounded, {{primary_accent}} fill on #E8E8E8 track.",
      "- All data elements must use real-looking (not obviously fake) numbers.",
      "",
      "VISUAL RULES:",
      "- Sharp corners on all containers (0px border radius) — rounded corners feel casual, sharp feels executive.",
      "- No decorative icons, illustrations, abstract shapes, or ornamental elements.",
      "- Every element aligns to an invisible 8px grid. Precision is paramount — misalignment by even 1px is unacceptable.",
      "- Whitespace is a design element; at least 30% of the canvas should be empty — density ≠ value.",
      "- Color usage: strictly {{primary_dark}}/{{primary_accent}}/grays — no other hue may appear except semantic delta colors.",
      "",
      "MUST INCLUDE:",
      "- Authority-commanding title without any decorative elements.",
      "- Modular white card grid with {{primary_accent}} top accents creating visual rhythm.",
      "- At least one hero metric with oversized number that anchors the narrative.",
      "- At least one structured data element: table, chart, or number matrix.",
      "- Conservative corporate polish — every detail should feel boardroom-tested and executive-approved."
    ].join("\n")
  },
  {
    id: "isometric_technical",
    label: "Isometric Technical",
    promptHint: [
      "Create a stunning isometric technical illustration that feels like a premium enterprise architecture diagram brought to life — precise structural clarity meets elegant depth and system-level sophistication.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the feel of a beautifully designed technical whitepaper illustration or a Stripe/Figma engineering blog hero image.",
      "- Precision and clarity, but with enough visual richness to be genuinely captivating — not sterile.",
      "- The viewer should think: 'this is complex technology made beautiful and understandable.'",
      "",
      "PAGE STYLE:",
      "- Canvas: light cool-gray (#EDF1F5) with a subtle dot-grid pattern (1px dots, 20px spacing, 6% opacity) for engineering feel.",
      "- Isometric objects rendered on a strict 30-degree grid with unified vanishing geometry — consistency is non-negotiable.",
      "- Primary: {{primary_dark}} for structural elements, outlines, and weight-bearing visual elements.",
      "- Accent: {{primary_accent}} for highlights, active data flows, pulsing connection states, and interactive elements.",
      "- Neutral: {{primary_light}} for supporting elements, background depth fills, ambient shadow tints, and inactive states.",
      "- Floor plane: subtle isometric ground surface in very light gray (#F5F7FA) with thin 1px grid lines at 3% opacity.",
      "- Ambient gradient: very subtle radial gradient from center (white at 3%) to edges (transparent) for focus.",
      "",
      "TYPOGRAPHY:",
      "- Title: {{font_headline}}, 26-30pt, in {{primary_dark}} tone, top-left with a thin underline (2px, 40px wide) in {{primary_accent}}.",
      "- Subtitle: {{font_subhead}}, 13pt, medium gray, directly below title with 6px gap.",
      "- Labels: {{font_label}}, 9-11pt, dark charcoal, connected to objects via thin 1px leader lines with circle terminations (4px).",
      "- Callout cards: {{font_body}}, 10-11pt on small white card surfaces (rounded 6px, shadow 0 2px 6px rgba(0,0,0,0.08)) near objects.",
      "- Caption: {{font_label}}, 8pt, gray (#999), bottom margin with data source attribution.",
      "",
      "ISOMETRIC OBJECT DESIGN:",
      "- All objects follow strict 30-degree isometric axes — no perspective cheating or faked angles.",
      "- Primary outlines: 2px stroke in {{primary_dark}} for main structures, 1px for internal details.",
      "- Depth shading: three distinct tonal values — top face (lightest, 100%), left face (medium, 85%), right face (darkest, 70%).",
      "- Internal detail: subtle panel lines, LED indicator dots (3px circles in {{primary_accent}}), ventilation grille patterns.",
      "- Connection lines: 2px strokes in {{primary_accent}} with arrowhead terminals (6px), strictly following isometric axes.",
      "- Data flow animation cues: dashed lines (4px dash, 3px gap) with small data-packet indicators (tiny squares or circles) along paths.",
      "- Pulsing glow: active/hot elements have a subtle {{primary_accent}} glow halo (4px spread, 15% opacity).",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Title zone: flat 2D text block in top-left (non-isometric) with title, subtitle, and optional legend.",
      "- Main scene: 4-8 isometric objects representing system components — servers, databases, workflow modules, API gateways, cloud nodes.",
      "- Each object should be detailed enough to suggest function: server racks with blinking LEDs, database cylinders with data layers, cloud forms with network icons.",
      "- Connection architecture: arrows and data lines showing flow, dependencies, and process relationships. At least 3 connection paths.",
      "- Exploded view: at least one object with a cutaway or exploded view revealing internal layers (3-4 layers visible).",
      "- Floating info cards: 2-3 white callout cards with metrics, labels, or status indicators near key objects.",
      "",
      "VISUAL RULES:",
      "- ZERO flat 2D shapes in the isometric scene — everything in the 3D space must follow isometric geometry.",
      "- Shadows: short, consistent bottom-right direction, 8% opacity dark gray, 4px offset max.",
      "- No photorealistic textures — surfaces are clean, flat-colored with subtle face-shading for depth.",
      "- Maximum 3 chromatic colors ({{primary_dark}}, {{primary_accent}}, {{primary_light}}) plus grays.",
      "- All connection lines follow isometric grid axes — no diagonal freeform curves or arbitrary angles.",
      "- Scale consistency: all objects should feel proportionally correct relative to each other.",
      "",
      "MUST INCLUDE:",
      "- Perfectly consistent 30-degree isometric grid with no perspective breaks.",
      "- At least 4 distinct, detailed enterprise system elements with visible internal features.",
      "- Connection architecture with directional data flow arrows and animated-style indicators.",
      "- One exploded or cutaway element showing internal layers.",
      "- Floating label callouts with leader lines and circle terminations.",
      "- Technical dot-grid background with subtle floor plane — the scene should feel grounded, not floating."
    ].join("\n")
  },
  {
    id: "cinematic_enterprise",
    label: "Cinematic Enterprise",
    promptHint: [
      "Create a jaw-dropping cinematic enterprise visual that feels like it belongs in a Blade Runner 2049 title sequence or an Apple keynote stage backdrop — dramatic depth, volumetric lighting, and premium realism that stops people mid-scroll.",
      "",
      "ATMOSPHERE & MOOD:",
      "- This is pure visual theater. Think: IMAX movie poster meets Fortune 500 brand film.",
      "- The emotional response should be awe — 'I want to know what this company does.'",
      "- Deep, atmospheric, volumetric. The viewer should feel like they could step into the scene.",
      "- Dark, moody, and premium — never gimmicky or over-the-top.",
      "",
      "PAGE STYLE:",
      "- Background: deep cinematic gradient from near-black (#0D0D18) at edges to {{primary_dark}} tone at center, creating a vignette effect.",
      "- Secondary gradient layer: very subtle radial glow of {{primary_accent}} at 4% opacity behind the hero element for focus hierarchy.",
      "- Volumetric light: soft light rays from upper-left, visible as subtle diagonal streaks at 3-5% opacity — the scene should feel alive with atmosphere.",
      "- Atmospheric particles: sparse floating dust motes or bokeh circles (2-4px, white at 6-10% opacity) scattered in the midground for depth.",
      "- Surface materials: brushed dark metal, frosted glass, polished obsidian, and matte carbon — every surface reacts to light realistically.",
      "- Noise texture: film-grain overlay at 2-3% opacity for cinematic warmth and anti-banding.",
      "",
      "LIGHTING MODEL — CRITICAL:",
      "- Key light: strong directional from upper-left (45° angle), creating crisp highlight edges and deep shadows on hero element.",
      "- Fill light: soft ambient from lower-right at 20% intensity, preventing total black in shadows.",
      "- Rim/edge light: thin bright highlight on the hero element's silhouette edge — this separates subject from background beautifully.",
      "- Accent light: small focused {{primary_accent}} colored light creating a subtle color spill on nearby surfaces.",
      "- Specular highlights: sharp white points on glass/metal surfaces where key light reflects — these make the scene 'pop'.",
      "",
      "TYPOGRAPHY:",
      "- Headline: {{font_headline}}, 36-48pt, pure white (#FFFFFF) with cinematic text-shadow (0 4px 20px rgba(0,0,0,0.5)) for floaty depth.",
      "- Subheadline: {{font_subhead}}, 14-17pt, in {{primary_accent}} tone, 0.06em tracking, directly below headline with 10px gap.",
      "- Body/label text: {{font_body}}, 11-12pt, silvery gray (#C8C8D0), on dark surfaces — should feel like HUD text.",
      "- Metric callout: {{font_headline}}, 52-72pt, white or {{primary_accent}}, with dramatic glow ({{primary_accent}} at 25% opacity, 12px blur spread).",
      "- Caption: {{font_label}}, 8pt, dim gray (#666680), uppercase, 0.06em tracking.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Headline zone: upper 25% with dramatic typography floating on dark atmosphere.",
      "- Hero element (center 50%): one premium 3D-rendered object, abstract tech form, or interface mockup with full lighting treatment.",
      "- Hero must have: strong key-light highlight, visible rim light edge, realistic specular points, and grounding shadow.",
      "- Floating glass cards (2-4): frosted glass surfaces (white at 6-8%, 1px white border at 12%, backdrop-blur effect), containing data metrics or feature labels.",
      "- Glass cards should float at different depths — some slightly blurred (further back), some sharp (closer).",
      "- Bottom zone: subtle gradient fade to black with optional CTA text or brand mark.",
      "",
      "GLASS CARD DESIGN:",
      "- Material: frosted glass — background blur visible through semi-transparent surface.",
      "- Border: 1px solid white at 10-15% opacity, slightly brighter on top edge (light catch effect).",
      "- Internal padding: 16-20px, with small {{primary_accent}} indicator dot (4px) or icon preceding the label.",
      "- Shadow: 0 8px 32px rgba(0,0,0,0.3) for floating depth.",
      "- Content: metric number in {{font_headline}} 24pt + label in {{font_label}} 9pt, stacked vertically.",
      "",
      "VISUAL RULES:",
      "- Single dominant light source — shadow direction must be 100% consistent across ALL elements.",
      "- Glowing elements: limited to {{primary_accent}}, maximum 3 glow points — restraint creates drama.",
      "- EVERY surface must respond to the lighting model — no flat, unlit elements allowed.",
      "- Depth of field: slight Gaussian blur on background particles and furthest glass cards; razor-sharp focus on hero.",
      "- Color discipline: only {{primary_accent}} and {{primary_light}} as chromatic accents — everything else is grayscale.",
      "- No visible hard edges between background gradient zones — all transitions must be silk-smooth.",
      "",
      "MUST INCLUDE:",
      "- Dark cinematic background with vignette, volumetric light rays, and atmospheric particles.",
      "- Full three-point lighting (key, fill, rim) creating Hollywood-grade highlights and shadows.",
      "- One show-stopping hero element with specular detail and realistic material response.",
      "- 2-4 frosted glass floating info cards at varying depths.",
      "- {{primary_accent}} accent glow on 2-3 key elements — never more.",
      "- Film-grain texture for cinematic warmth.",
      "- The overall effect should make viewers audibly say 'wow' — this is premium visual storytelling."
    ].join("\n")
  },
  {
    id: "blueprint_analytic",
    label: "Blueprint Analytic",
    promptHint: [
      "Create a mesmerizing blueprint-inspired analytical visual that feels like a classified aerospace engineering document — meticulous annotation, technical precision, and the unmistakable authority of a master draftsperson's work.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the mystique of NASA mission planning documents, Da Vinci's technical notebooks, or classified defense schematics.",
      "- The viewer should feel like they've been granted access to something precise, methodical, and deeply intelligent.",
      "- A sense of craftsmanship — every line, annotation, and label placed with engineering exactitude.",
      "",
      "PAGE STYLE:",
      "- Background: deep {{primary_dark}} tone simulating cyanotype blueprint paper, with visible cloth/linen fiber texture at 5-6% opacity.",
      "- Grid system: dual-layer grid — primary grid (thin white lines at 3% opacity, 20px spacing) + secondary sub-grid (white at 1.5% opacity, 5px spacing) for engineering precision.",
      "- All drawings, text, and annotations rendered in white or {{primary_light}} — like architect's chalk/pencil on cyanotype.",
      "- Highlight color: {{primary_accent}} for critical callouts, dimension emphasis, warning indicators, and key measurement lines.",
      "- Edge treatment: subtle darker vignette at canvas edges ({{primary_dark}} at 120% darkness) simulating aged blueprint paper.",
      "- Faint fold marks: two barely-visible creased lines (white at 1.5% opacity) suggesting the document was physically folded — adds realism.",
      "",
      "TYPOGRAPHY — TECHNICAL DRAFTING STYLE:",
      "- Title: condensed {{font_headline}}, 28-32pt, white, ALL CAPS, top of canvas in bordered cartouche block.",
      "- Section headers: {{font_subhead}}, 13-14pt, {{primary_light}} tone, ALL CAPS, 0.08em tracking, with thin underline rule (1px).",
      "- Annotation text: {{font_label}}, 8.5-10pt, white at 75-85% opacity, connected by thin leader lines — should feel hand-lettered.",
      "- Dimension labels: {{font_label}}, 7.5-8pt, in {{primary_accent}} tone, placed centered along dimension lines between end caps.",
      "- Measurement values: {{font_headline}}, 9-10pt, white, inside small label shields along dimension lines.",
      "- Revision notes: {{font_label}}, 7pt, white at 50% opacity, bottom corner in a small bordered revision table.",
      "",
      "ANNOTATION SYSTEM — HIGHLY DETAILED:",
      "- Leader lines: 1px white at 55-65% opacity, straight with single right-angle bends, rounded termination dots (3px).",
      "- Callout circles: outlined circles (8-14px diameter) at annotation anchor points with thin crosshairs inside.",
      "- Dimension lines: fine 0.75px lines with small perpendicular end caps (6px tall), measurement text centered above in small shield.",
      "- Section markers: circled numbers (white outline, 20px diameter, 1.5px stroke) in sequential order with leader to section.",
      "- Dashed construction lines: 3px dash, 3px gap, white at 18-22% opacity, showing geometric alignment relationships.",
      "- Centerlines: dash-dot pattern (12px dash, 3px gap, 2px dot, 3px gap), white at 15% opacity, marking symmetry axes.",
      "- Detail bubbles: thin circles (40-60px diameter) with internal crosshair, connected by leader to enlarged detail view.",
      "- Tolerance annotations: small ± symbols with values in {{font_label}} 7pt near critical dimensions.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Title block: top-left cartouche (bordered rectangle with double-line frame) containing title, project reference, date field, revision marker, and scale indicator.",
      "- Main diagram: technical drawing, exploded assembly view, or annotated system schematic in thin white linework with multi-weight hierarchy.",
      "- Annotation density: at least 6-10 annotation callouts with leader lines pointing to specific features — the diagram should feel richly documented.",
      "- Dimension lines: at least 4-6 dimension lines showing measurements, spacing, or specification values.",
      "- Detail inset: one zoomed-in circular detail view (60-80px diameter) connected to main diagram by a thin leader, showing magnified internal feature.",
      "- Second detail option: one cross-section view showing a sliced-through component.",
      "- Legend block: bottom-right area with small legend explaining line types, symbols, and color coding.",
      "- Scale bar: precise measurement scale bar (100px wide) with 10px tick marks, bottom-right.",
      "",
      "LINE HIERARCHY:",
      "- Primary structural outlines: 2px white, crisp and confident.",
      "- Secondary details and internal features: 1px white at 90% opacity.",
      "- Annotation leaders and dimension lines: 0.75px white at 60% opacity.",
      "- Construction and alignment guides: 0.5px white at 20% opacity, dashed.",
      "- Grid lines: 0.5px white at 3% opacity (background), 1.5% for sub-grid.",
      "",
      "VISUAL RULES:",
      "- All elements drawn in white/{{primary_light}} on {{primary_dark}} background — no filled shapes except very subtle area tints at 5-8% opacity.",
      "- NO gradients, NO shadows, NO 3D perspective effects — pure flat technical drawing style, orthographic only.",
      "- Cross-hatching patterns at 20-25% opacity for material call-outs (45° lines, 3px spacing).",
      "- Material indicators: different hatch patterns for different materials (parallel lines vs cross-hatch vs stipple).",
      "- Maintain obsessive engineering-drawing precision in all line work — misalignment is unacceptable.",
      "- The overall composition should feel like it took days to draft by hand.",
      "",
      "MUST INCLUDE:",
      "- Rich {{primary_dark}} background with dual-layer grid and subtle cloth texture.",
      "- Formal title block (cartouche) with title, revision, date, and scale.",
      "- Densely annotated diagram with abundant leader lines, callout circles, and crosshair anchors.",
      "- Multiple dimension lines with measurement labels in accent color.",
      "- At least one circular detail inset with magnified view.",
      "- Multi-weight line hierarchy that creates visual depth without 3D.",
      "- White/{{primary_light}} linework throughout — no other hue except {{primary_accent}} for critical callouts.",
      "- The unmistakable feel of a real engineering document — precise, authoritative, and impossibly detailed."
    ].join("\n")
  },
  {
    id: "product_showcase",
    label: "Product Showcase",
    promptHint: [
      "Create a breathtaking product showcase that rivals Apple.com hero shots and luxury brand campaigns — a single hero object, bathed in perfect studio lighting, floating in pristine space like a jewel on display.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Channel the visual language of Apple Product Photography, Bang & Olufsen campaigns, and Porsche Design catalogs.",
      "- The product is the absolute star — everything else exists only to make it look extraordinary.",
      "- The viewer should feel desire, admiration, and a sense that this object is premium and worth coveting.",
      "- Clean, minimal, but never sterile — there should be warmth in the lighting and softness in the reflections.",
      "",
      "PAGE STYLE:",
      "- Light variant: soft gradient from {{primary_light}} at top through warm white to pure white (#FFFFFF) at bottom.",
      "- Dark variant: smooth gradient from {{primary_dark}} at top through rich charcoal (#1A1A1E) to near-black (#0F0F12) at bottom.",
      "- Reflection plane: invisible glossy floor surface beneath the hero object, showing a soft mirrored reflection at 12-18% opacity, fading to transparent over 40% of object height.",
      "- Ambient environment: very subtle environment reflections on the hero object's surfaces suggesting a clean studio space.",
      "- Noise/grain: fine film grain at 1.5% opacity for analog warmth and premium feel.",
      "- NO cluttered backgrounds, patterns, or distracting elements — the product owns 100% of the viewer's attention.",
      "",
      "STUDIO LIGHTING — CRITICAL:",
      "- Key light: large soft-box style, upper-right at 40° angle, creating a smooth gradient highlight across the product's primary surface.",
      "- Fill light: diffused ambient from left at 25-30% intensity, preventing harsh shadows while maintaining dimensionality.",
      "- Rim/edge light: thin, bright highlight tracing the product's silhouette edge on the shadow side — this separates the object from background and creates a 'wow' edge.",
      "- Specular highlights: 2-3 small, sharp white reflection points on glass, metal, or polished surfaces — these make the product feel REAL and expensive.",
      "- Ground shadow: soft, medium-distance shadow (16px blur, 8-12% opacity), slightly elongated, grounding the object on the reflection plane.",
      "- Subtle caustics (optional): if the product has glass/transparent elements, faint light caustic patterns on the floor plane.",
      "",
      "TYPOGRAPHY:",
      "- Product title: {{font_headline}}, 30-40pt, in {{primary_dark}} tone (light bg) or white (dark bg), 500-600 weight, positioned above or beside the hero with 40px clearance.",
      "- Subtitle/tagline: {{font_subhead}}, 15-17pt, muted warm gray (#8A8A8A) or {{primary_accent}} at 70%, one elegant line.",
      "- Feature callouts: {{font_body}}, 10-11pt, positioned around the product with thin leader lines (0.75px, gray at 40%).",
      "- Callout anchors: small circle dots (3-4px, {{primary_accent}}) at the product end of each leader line — subtle but precise.",
      "- CTA button (optional): {{font_subhead}}, 12-13pt, in a thin rounded pill button (1px {{primary_accent}} border, 24px horizontal padding).",
      "",
      "HERO OBJECT TREATMENT:",
      "- Render at a cinematic 15-20° three-quarter angle — showing two faces of the object for depth and form.",
      "- Surface materials must feel tactile and real: brushed metal with directional grain, glass with transparency and internal reflections, matte surfaces with soft gradient shading.",
      "- Edge quality: razor-sharp product silhouette against the background — no aliasing, no fuzziness.",
      "- Internal detail: if the product has screens, buttons, ports, or features — render them with precision.",
      "- Scale: the hero object should command 45-55% of the total canvas area — it must feel important.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Hero zone: center 60% of canvas, vertically centered or slightly above center (golden ratio: 38% from top).",
      "- Reflection plane below the object, seamlessly integrated into the background gradient.",
      "- 3-5 feature callout leader lines radiating from key product areas to text labels — arranged to avoid overlap and crossing.",
      "- Title and tagline: upper-left aligned or centered above the hero with generous top margin (60px+).",
      "- Bottom zone: clean, either empty white/dark space or a single subtle CTA element centered.",
      "",
      "VISUAL RULES:",
      "- Object surfaces must react to lighting with physically accurate specular and diffuse responses.",
      "- Only ONE reflective surface (the floor plane) — nothing else mirrors, to avoid visual clutter.",
      "- ZERO decorative elements, frames, borders, badges, or geometric shapes in the composition.",
      "- Color restraint: the palette comes from the product itself + warm neutral background + {{primary_accent}} for small accents only.",
      "- Leader lines for callouts must never cross each other — spatial arrangement is critical.",
      "- The composition should feel like a professional product photographer's final hero shot — obsessively composed.",
      "",
      "MUST INCLUDE:",
      "- Perfectly lit hero product at three-quarter angle with visible depth and material quality.",
      "- Soft reflection on the ground plane fading to transparent.",
      "- Full studio lighting: key + fill + rim lights creating dimensional, premium highlights.",
      "- 3-5 feature callout leader lines with anchor dots and clean labels.",
      "- Film-grain texture for premium analog warmth.",
      "- Premium, distraction-free composition where the product IS the entire story.",
      "- Clean title and tagline with editorial typography.",
      "- The overall feel of a $10,000+ product photography shoot — flawless, aspirational, and mesmerizing."
    ].join("\n")
  }
];

/* ------------------------------------------------------------------ */
/*  GRAPHIC_STYLE_PRESETS  (Graphic Engine)                             */
/* ------------------------------------------------------------------ */

export const GRAPHIC_STYLE_PRESETS: PresetOption[] = [
  {
    id: "vector_icon_system",
    label: "Vector Icon System",
    promptHint: [
      "Create a show-stopping, ultra-vibrant marketing vector illustration that radiates innovation and high-growth energy — think Stripe marketing graphics meet high-end fintech branding, where precision meets playful motion.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the high-octane energy of a premium SaaS homepage or a high-growth fintech campaign.",
      "- Visceral, engaging, and 'living' — the illustration should feel like it's in a state of perfectly orchestrated movement.",
      "- The viewer should think: 'This looks like the future of professional software.'",
      "",
      "STYLE — VIBRANT VECTOR ART:",
      "- Layered vector composition with a mix of sharp geometric edges and soft, flowing organic curves.",
      "- Material quality: A sophisticated blend of flat opaque solids, semi-transparent glass shards (15-25% opacity), and vibrant mesh gradients.",
      "- Highlights: Surgical use of {{primary_accent}} for 'active' parts of the illustration — glowing nodes, directional arrows, or pulsing data packets.",
      "- Depth: Subtle 3D-iso feel achieved through layered stacking and soft directional shadows (0 4px 12px rgba(0,0,0,0.06)) — not true 3D, but high-perceived depth.",
      "- Line work: Minimal. Use shape boundaries and color contrast to define forms rather than outlines.",
      "",
      "COMPOSITION EQUATION:",
      "- One dominant hero graphic in the center (occupying 50% of canvas) composed of interlocking geometric modules.",
      "- 4-6 smaller 'satellite' assets (floating icons, data dots, or abstract shapes) orbiting the hero at varying depths.",
      "- Subtle directional 'speed lines' or trail effects (1px, {{primary_accent}} at 10% opacity) that imply upward growth/momentum.",
      "- Background: Crisp white with a very soft radial gradient of {{primary_light}} in the center-right to create a focal 'light source'.",
      "",
      "VISUAL RULES:",
      "- Ultra-vibrant color palette using {{primary_dark}} and {{primary_accent}} as the pillars of contrast.",
      "- ZERO blurry or fuzzy edges — everything must be vector-sharp and high-fidelity.",
      "- No literal human characters — focus on abstract systems, data-flows, and architectural modules that represent growth.",
      "- The composition MUST feel balanced but dynamic — visual weight should pull towards the upper-right like a growth chart.",
      "",
      "MUST INCLUDE:",
      "- One complex, interlocking hero graphic that feels like a piece of high-tech machinery or a data processor.",
      "- Vibrant mesh gradients that transition seamlessly between {{primary_dark}} and {{primary_accent}}.",
      "- Multiple layers of transparency (glassmorphism) creating a sense of sophisticated z-axis depth.",
      "- Floating 'satellite' icons that reinforce a marketing/data narrative.",
      "- High-energy, professional, and undeniably expensive aesthetic."
    ].join("\n")
  },
  {
    id: "flat_infographic",
    label: "Flat Infographic",
    promptHint: [
      "Create a visually stunning flat infographic that transforms complex information into an irresistible narrative journey — the kind that gets shared, bookmarked, and referenced repeatedly.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the clarity of a premium consulting deliverable crossed with the visual appeal of a beautifully designed annual report.",
      "- Information should feel accessible and exciting, never overwhelming — the viewer should WANT to read every section.",
      "- Think: McKinsey meets Stripe's documentation — authoritative data storytelling with design studio polish.",
      "",
      "PAGE STYLE:",
      "- Canvas: crisp white with a narrow vertical accent stripe (4px) in {{primary_dark}} along the left edge — the anchoring spine.",
      "- Section blocks separated by elegant thin horizontal dividers (0.75px, #E5E5E5) with 32px vertical breathing room.",
      "- Each section: colored left border (6px, {{primary_accent}}) for rapid visual scanning — the viewer can jump to any section instantly.",
      "- Section header backgrounds: {{primary_light}} tinted strips (full width, 8px vertical padding) for hierarchy contrast.",
      "- Overall layout: single-column narrative flow, top to bottom, with consistent 600px max content width for readability.",
      "- Subtle dot-grid texture at 1.5% opacity on white areas for premium tactile feel.",
      "",
      "TYPOGRAPHY — INFORMATION HIERARCHY:",
      "- Title: {{font_headline}}, 28-34pt, in {{primary_dark}} tone, top of canvas with a 2px {{primary_accent}} underline (60px wide).",
      "- Subtitle: {{font_subhead}}, 14pt, medium gray (#777), directly below title with 6px gap.",
      "- Section headers: {{font_subhead}}, 16-18pt, in {{primary_dark}} tone, with numbered circle badges (26px diameter, {{primary_accent}} fill, white number in {{font_headline}} 12pt).",
      "- Body: {{font_body}}, 10.5-11pt, dark charcoal (#2D2D2D), 1.55x line height, max 520px per column.",
      "- Metric hero values: {{font_headline}}, 32-42pt, in {{primary_accent}} tone, weight 700 — these numbers anchor each section.",
      "- Metric labels: {{font_label}}, 9pt, medium gray (#888), uppercase, 0.04em tracking, below each metric.",
      "- Delta indicators: {{font_label}}, 9pt, green (#2E7D32) ▲ for positive / red (#C62828) ▼ for negative.",
      "- Caption/source: {{font_label}}, 7.5pt, gray (#999), bottom of infographic with 'Source:' prefix.",
      "",
      "STRUCTURE REQUIREMENTS — NARRATIVE FLOW:",
      "- Opening: bold title + subtitle + brief context paragraph (2-3 sentences) setting the stage.",
      "- Challenge callout box: light warm-tinted (#FFF8F5) background, 1px {{primary_accent}} left border, warning-triangle icon (16px) + concise problem statement.",
      "- Solution framework: horizontal process flow — 3-5 rounded rectangles (8px radius, {{primary_light}} fill, 1px {{primary_accent}} border) connected by forward arrows ({{primary_accent}}, 6px) with step labels.",
      "- Key metrics dashboard: 2-4 metric tiles in a row — white cards with {{primary_accent}} top border (3px), hero number, label, delta indicator, and optional sparkline.",
      "- Differentiator checklist: {{primary_accent}} checkmark bullets (16px, 2px stroke) with concise benefit text — 4-6 items max.",
      "- Evidence block: simple flat bar chart or comparison table showing quantitative proof.",
      "- Compliance badges (optional): small rounded rectangles (4px radius) at bottom with certification icons and labels.",
      "",
      "DATA VISUALIZATION:",
      "- Bar charts: flat fills, {{primary_dark}} primary + {{primary_accent}} secondary, 4px border-radius tops, 1px #E0E0E0 axes, labeled values above each bar.",
      "- Comparison tables: {{primary_dark}} header row (white text), alternating white/#F8F8F8 rows, 1px #E8E8E8 borders.",
      "- Process arrows: smooth, flat {{primary_accent}} chevrons (not chunky — elegant and minimal).",
      "- Sparklines in metric tiles: thin 1.5px {{primary_accent}} line, area fill below at 5% opacity.",
      "- All data must use realistic-looking numbers and percentages — never obviously fake.",
      "",
      "VISUAL RULES:",
      "- Flat fills only — absolutely no gradients, shadows, or dimensional effects within elements.",
      "- Icons: simple outlined style, 1.5px stroke, in {{primary_dark}} or {{primary_accent}}, consistent 20x20px size.",
      "- All text horizontal — no rotated, angled, or vertical text anywhere.",
      "- Maximum 3 chromatic colors ({{primary_dark}}, {{primary_accent}}, {{primary_light}}) plus grays and semantic colors (green/red for deltas).",
      "- Consistent spacing: 16px internal card padding, 24px between cards, 32px between sections.",
      "- Every element aligns to an 8px grid — precision is paramount.",
      "",
      "MUST INCLUDE:",
      "- Numbered section headers with circle badges creating a clear narrative sequence.",
      "- Horizontal process flow with styled arrows showing methodology progression.",
      "- At least 2 metric outcome tiles with large hero numbers and delta indicators.",
      "- Checklist section with {{primary_accent}} checkmarks.",
      "- Clear narrative arc: Challenge → Approach → Solution → Evidence → Outcomes.",
      "- The overall feel of a premium consulting deliverable that wins business — polished, data-rich, and undeniably professional."
    ].join("\n")
  },
  {
    id: "social_hero_poster",
    label: "Social Hero Poster",
    promptHint: [
      "Create a scroll-stopping social hero poster that hits like a billboard at 200mph — instant impact, visceral attraction, and a message that burns into memory in under 2 seconds.",
      "",
      "ATMOSPHERE & MOOD:",
      "- This is the visual equivalent of a mic drop. It should command attention with the authority of a Super Bowl ad poster.",
      "- The emotional response: 'I NEED to know more.' — curiosity, desire, and professional aspiration.",
      "- Think: Nike campaign poster meets Bloomberg Businessweek cover — bold, confident, culturally aware.",
      "- It should look just as powerful as a 40px thumbnail in a social feed as it does at full size.",
      "",
      "PAGE STYLE:",
      "- Full-bleed, edge-to-edge composition — no visible margins within the design (safe zones for crop tolerance only).",
      "- Background: dramatic multi-stop gradient — {{primary_dark}} at base flowing through rich mid-tones to {{primary_accent}} at top/edges, creating depth and energy.",
      "- Optional secondary gradient layer: subtle radial glow of white at 3% opacity behind the hero for focal emphasis.",
      "- High-contrast figure-ground separation — the hero element must POP with absolute clarity.",
      "- Noise texture: fine grain at 3-4% opacity across the gradient for premium depth and anti-banding.",
      "- Subtle light leak: a soft, warm highlight at one edge ({{primary_accent}} at 8% opacity, 200px Gaussian blur) for cinematic energy.",
      "",
      "HERO ELEMENT TAXONOMY — choose one dominant hero type:",
      "- Abstract tech form: flowing mesh gradient, particle field, geometric lattice, or holographic shape — technology-forward, aspirational, and visually novel.",
      "- Symbolic concept: one single icon or metaphor at ultra-large scale (140-200px equivalent) with gradient fill and layered depth shadow — immediately legible as a symbol.",
      "- Product render fragment: dramatically close-cropped UI screen or device fragment hinting at a product without full reveal — intrigue and curiosity over literal explanation.",
      "- Data visualization hero: an oversized KPI number, percentage, or chart form treated as the primary visual element — the statistic IS the composition.",
      "- Environmental cutout: a professional silhouette or abstract figure on the gradient, surrounded by orbiting floating chip labels with proof points.",
      "- Universal construction rule: the hero MUST break at least one grid boundary — bleed, overlap, or extend beyond its expected zone for compositional energy and dynamism.",
      "- Hero integration: apply a soft {{primary_dark}} radial vignette at 20-30% opacity on the outer edges of the hero element to seamlessly integrate it with the gradient background.",
      "",
      "TYPOGRAPHY — IMPACT FIRST:",
      "- Headline: {{font_headline}}, 40-56pt, pure white (#FFFFFF), weight 700-800, maximum 6-8 words that hit hard.",
      "- Headline treatment: -0.02em tracking for tightness, optional text-shadow (0 2px 12px rgba(0,0,0,0.3)) for depth.",
      "- Support line: {{font_body}}, 14-17pt, white at 75-85% opacity, positioned 8-12px below headline — one clarifying sentence.",
      "- Tag pill: {{font_label}}, 8-9pt, ALL CAPS, 0.1em tracking, white text on semi-transparent pill (white at 12-18% opacity, 16px horizontal padding, 24px height, 12px radius).",
      "- Optional: proof-point numbers — {{font_headline}}, 28-36pt, white, with {{font_label}} 8pt gray label beneath.",
      "- ALL text must be instantly readable against the gradient — contrast ratio minimum 4.5:1.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Headline band: top 25-30% with short, bold statement — this is the hook, the anchor, the first thing the eye hits.",
      "- Central hero zone (40-55% of canvas): one dominant visual — concept illustration, abstract tech form, product render, or bold symbolic shape.",
      "- Hero element should break the expected grid slightly — bleed beyond sections, overlap edges — for dynamic energy.",
      "- Floating highlight chips: 2-4 small rounded pills or badges with benefit text, proof points, or feature labels, orbiting the hero element.",
      "- Chip style: semi-transparent (white at 10-15%), 1px white border at 20% opacity, {{font_label}} 8pt white text.",
      "- Bottom CTA zone: subtle tonal gradient strip (darker) with call-to-action text and optional arrow indicator.",
      "",
      "VISUAL RULES:",
      "- Color discipline: only {{primary_dark}}, {{primary_accent}}, and white — ZERO secondary or tertiary colors.",
      "- Bold scale contrast: headline massive and commanding, support text deliberately small — the ratio creates drama.",
      "- Hierarchy must be parseable in under 1.5 seconds: headline → hero → support → chips → CTA.",
      "- Safe margins: minimum 40px inset from ALL edges for social platform crop tolerance (Instagram, LinkedIn, Twitter).",
      "- If photography is used: apply {{primary_dark}} overlay at 50-65% opacity for absolute text legibility.",
      "- No complex multi-column layouts — this is a single-impact missile, not a brochure.",
      "",
      "PLATFORM PRODUCTION SPECS:",
      "- LinkedIn feed: primary safe zone 1080×566px with 60px inset buffer on all sides — headline and CTA must survive this crop without clipping.",
      "- Instagram square: plan a 1:1 center crop at 1080×1080px — headline and hero must communicate the full message without relayouting.",
      "- Stories/Reels 9:16: tertiary vertical plan — headline occupies top 25%, hero center 50%, CTA bottom 20%, nothing critical in bottom 15% (platform UI chrome zone).",
      "- Thumbnail test: the core message must be legible as a 200×105px scaled-down thumbnail — if it fails, simplify until it passes.",
      "- Color profile: sRGB only — no wide-gamut values that degrade unpredictably on standard displays.",
      "- Export minimum: @2x at intended display resolution for all assets to avoid blur on high-DPI screens.",
      "",
      "MUST INCLUDE:",
      "- One utterly dominant focal element that owns the center of the composition — from the hero element taxonomy above.",
      "- Headline with bulletproof readability contrast — white on gradient, immediately legible at minimum 4.5:1 ratio.",
      "- Dramatic gradient background with noise texture and optional cinematic light leak.",
      "- Hero element breaking at least one grid boundary for compositional energy.",
      "- 2-4 floating highlight chips orbiting the hero with proof points or benefit labels.",
      "- Safe margins validated against LinkedIn, Instagram, and Stories crop zones.",
      "- Feed-stopping visual impact that works at BOTH 200px thumbnail and full-screen scale.",
      "- The visceral 'I need to stop scrolling and look at this' reaction — this poster must WIN the feed."
    ].join("\n")
  },
  {
    id: "ui_illustration",
    label: "UI Illustration",
    promptHint: [
      "Create a jaw-droppingly realistic product UI illustration that looks like a screenshot of the world's most beautifully designed enterprise application — Figma-quality fidelity with every pixel considered.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the polish of Linear, Notion, or Vercel's dashboard — interfaces so beautiful they make people want to use the product immediately.",
      "- The illustration should feel like a REAL, functioning application — not a wireframe, not a mockup, but a finished product.",
      "- The viewer should think: 'I want to use this software right now.'",
      "",
      "PAGE STYLE:",
      "- Canvas: light modern interface with layered depth — the screenshot should feel like it has Z-axis dimension.",
      "- Navigation bar: {{primary_dark}} tone, 48px height, with white text labels (13pt), subtle icon indicators, and search input field.",
      "- Optional sidebar: 240px wide, {{primary_dark}} at 95% opacity, with white nav items (11pt), active state highlighted with {{primary_accent}} left border (3px) and tinted background.",
      "- Content body: clean white (#FFFFFF) with {{primary_light}} section separator backgrounds.",
      "- Active/selected states: {{primary_accent}} backgrounds at 8-12% opacity, {{primary_accent}} borders, or subtle {{primary_accent}} left indicators.",
      "- Card surfaces: white with crisp 1px border in {{primary_light}} tone and refined shadow (0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)).",
      "- Input fields: white with 1px #D8D8D8 border, 6px radius, focus state: 2px {{primary_accent}} ring with {{primary_accent}} at 15% background tint.",
      "",
      "TYPOGRAPHY — INTERFACE PRECISION:",
      "- Nav labels: {{font_label}}, 11-12pt, white on {{primary_dark}} bar, weight 500.",
      "- Sidebar items: {{font_label}}, 11pt, white at 70% (inactive), white at 100% (active), weight 400/500.",
      "- Page title: {{font_headline}}, 20-24pt, {{primary_dark}} tone, weight 600, with subtle breadcrumb in {{font_label}} 10pt above.",
      "- Card headings: {{font_subhead}}, 13-14pt, in {{primary_dark}} tone, weight 600.",
      "- Body text: {{font_body}}, 11pt, charcoal (#333), weight 400, 1.5x line height.",
      "- Input labels: {{font_label}}, 10pt, medium gray (#666), weight 500, above input fields with 4px gap.",
      "- Button text: {{font_subhead}}, 12pt, white on {{primary_accent}} fill, 6px radius, 12px/24px padding.",
      "- Table cell text: {{font_body}}, 11pt, #333, with {{font_label}} 10pt gray for secondary columns.",
      "- Status badges: {{font_label}}, 9pt, colored text on tinted pills (green/yellow/red semantic backgrounds at 10%).",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Primary frame: browser chrome or app window with nav bar, optional sidebar, and main content area — must look like a real application.",
      "- KPI summary row: 3-5 metric cards in a horizontal flex row — each card: large number ({{font_headline}} 28-36pt), label ({{font_label}} 9pt gray), sparkline or trend indicator, and delta badge.",
      "- Main workflow panel: the hero section — form/table/chart hybrid showing realistic enterprise data with at least 5 rows/entries.",
      "- Action bar: top-right aligned with primary button ({{primary_accent}} fill, solid), secondary button (outlined, 1px border), and optional icon-only buttons.",
      "- Interactive depth indicator: at least ONE modal dialog, dropdown menu, tooltip, or popover showing the UI has interactive depth.",
      "  • Modal: centered, 400-500px wide, white surface, {{primary_dark}} header strip, shadow 0 16px 48px rgba(0,0,0,0.15).",
      "  • Dropdown: 200px wide, white surface, rounded 8px, items 36px tall with hover highlight.",
      "",
      "DATA ELEMENTS:",
      "- Tables: {{primary_light}} header row ({{font_label}} 10pt, uppercase, #666), alternating white/#FAFAFA body rows, hover highlight row in {{primary_accent}} at 4%.",
      "- Charts: flat fills — {{primary_dark}} primary series, {{primary_accent}} secondary, {{primary_light}} tertiary. Clean 1px #E0E0E0 axes, no 3D.",
      "- Small data indicators: inline sparklines (40x16px), progress bars (4px height, rounded), percentage circles.",
      "- All data must look realistic — real company names, plausible metrics, natural date ranges.",
      "",
      "MICRO-INTERACTIONS & LIVE STATE INDICATORS:",
      "- Toast notification: top-right corner, 280-320px wide, white surface, 8px radius, shadow 0 4px 16px rgba(0,0,0,0.1), with {{primary_accent}} left border (4px) and dismiss X — shows the interface is reactive.",
      "- Loading skeleton: one card or table row in half-loaded state — #E8E8E8 shimmer bars (4px height, 60-80% widths) replacing text content — communicates a live, active system with async data.",
      "- Contextual tooltip: {{font_label}} 10pt white text on {{primary_dark}} rounded pill (4px radius, 8px/12px padding), with 4px downward arrow, anchored to a specific data point or button.",
      "- Notification badge: small dot (8px, semantic red #D32F2F) or count pill on a nav icon — the system has pending activity and is alive.",
      "- Breadcrumb trail: {{font_label}} 9pt, #999 > #999 > {{primary_dark}} hierarchy in the page header zone — always present, communicates navigational depth and application structure.",
      "",
      "APPLICATION CONTEXT — SPECIFICITY IS EVERYTHING:",
      "- The interface must represent ONE clear, named use case — enterprise analytics dashboard, CRM pipeline board, project management console, or HR management platform. Never a generic 'dashboard.'",
      "- Visible user identity: top-right user avatar (24-28px circle, initials or gradient photo-style fill) with name label — grounds the interface in real human use.",
      "- Data internal consistency: if a row shows '87% complete,' the progress bar must show exactly 87%. If a chart total reads $2.4M, table row values must sum to $2.4M. Never contradictory data.",
      "- System status indicator: small green dot (8px) in the nav bar status area — the system is online, connected, and healthy.",
      "- Column density realism: table column widths must reflect actual data type widths — ID (60px), Name (180px), Status (100px), Date (100px), Amount (90px, right-aligned). Never uniform widths.",
      "",
      "VISUAL RULES:",
      "- Realistic UI proportions — elements must look exactly like a production application screenshot, not a wireframe.",
      "- Consistent 8px spacing grid for ALL padding, margins, and gaps — pixel-perfect alignment throughout.",
      "- No decorative elements that wouldn't exist in a shipping SaaS application.",
      "- Layer hierarchy: nav bar > sidebar > modals/overlays > content cards > page background — depth cues must be visually unambiguous.",
      "- Interaction states visible: at least one hovered button, one active nav item, one focused input — the interface is mid-use.",
      "- The interface should feel alive — not a static wireframe but a genuine snapshot of a working product in active use.",
      "",
      "MUST INCLUDE:",
      "- Distinct navigation/header strip with realistic controls: search bar, user avatar, notification bell, and system status dot.",
      "- At least one chart or data-visualization block with realistic, internally consistent data.",
      "- At least one data table with realistic column-width variation, alternating rows, and visible interaction states.",
      "- KPI summary row with metric cards: hero number, label, sparkline, and delta indicator on each card.",
      "- One loading skeleton state and one toast notification for system liveness.",
      "- Clear panel hierarchy with multi-layer depth cues: shadows, borders, background tints, and z-index separation.",
      "- One interactive overlay element (modal, dropdown, or tooltip) demonstrating UI interactive depth.",
      "- Production-quality fidelity — the final illustration should be indistinguishable from a real application screenshot."
    ].join("\n")
  },
  {
    id: "sticker_badge_3d",
    label: "Sticker Badge 3D",
    promptHint: [
      "Create a show-stopping 3D sticker/badge that feels like a premium collectible enamel pin — the kind of badge people would genuinely want to own, display, and show off. Tangible, lustrous, and irresistibly detailed.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the tactile delight of a high-end enamel pin, a limited-edition sneaker badge, or a prestigious military challenge coin.",
      "- The viewer should instinctively want to reach out and touch it — the materials should feel REAL.",
      "- Think: Supreme sticker meets Apple product badge — collectible, premium, and instantly iconic.",
      "",
      "PAGE STYLE:",
      "- Background: clean stage for maximum subject isolation — very light gray (#F5F5F5) or transparent/checker pattern.",
      "- Optional pedestal shadow: soft elliptical ground shadow directly beneath (20px horizontal, 6px vertical, 12% opacity) for grounding.",
      "- Ambient light: soft, even studio lighting from upper-left creating subtle tonal variation across the badge face.",
      "- Film grain: 1.5% opacity noise texture on background for premium photographic feel.",
      "",
      "BADGE MATERIAL & SURFACE — CRITICAL:",
      "- Primary badge fill: rich gradient from {{primary_dark}} to {{primary_accent}} — smooth 180° transition evoking polished enamel.",
      "- Surface texture: smooth, slightly glossy enamel feel with subtle color depth variation (not perfectly flat).",
      "- Edge/bevel: 3-4px visible edge thickness showing real physical depth — lighter tone of badge color on top edge, darker on bottom edge.",
      "- Bevel highlight: thin {{primary_light}} specular line along the top-left edge (1px, 60% opacity) simulating light catching the raised rim.",
      "- Specular gloss spot: one prominent specular highlight on upper-left quadrant (white at 35-45% opacity, 12px soft burst) — the 'shine' that makes it feel glossy.",
      "- Secondary specular: smaller, sharper highlight (white at 20%, 4px) offset from main specular for realistic multi-point lighting.",
      "- Inner enamel dividers: thin metal-colored lines ({{primary_light}} at 80%, 1px) separating colored sections like real cloisonné enamel.",
      "- Material overall: the badge must feel like you could hold it — weight, depth, and luster must be palpable.",
      "",
      "TYPOGRAPHY:",
      "- Badge label: {{font_headline}}, bold, white on badge surface, max 2-3 words — embossed or raised appearance.",
      "- Text treatment: subtle 1px dark shadow below text ({{primary_dark}} at 20%) for engraved/embossed depth effect.",
      "- Tag text: {{font_label}}, 7-8pt, subtle gray, positioned outside badge area as caption/context.",
      "",
      "3D CONSTRUCTION:",
      "- Front face: smooth gradient fill with central emblem, monogram, icon, or concept symbol.",
      "- Outer ring: contrasting border ring (3-4px wide, {{primary_dark}} or metallic silver) creating clear separation and structural frame.",
      "- Inner motif: central icon or symbol — clean, bold, geometric, readable at 32px.",
      "- Edge thickness: visible on bottom and right sides, showing 3-4px of physical depth with consistent {{primary_light}} coloring.",
      "- Drop shadow: soft, medium-distance (0 4px 12px rgba(0,0,0,0.15)) for floating elevation effect.",
      "- Contact shadow: tight, darker shadow directly beneath (0 1px 3px rgba(0,0,0,0.2)) for grounding realism.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Primary hero badge: dominant, commanding 55-65% of canvas area.",
      "- Badge silhouette: clean, iconic shape — circle, shield, hexagon, or star-burst — instantly recognizable even as a tiny favicon.",
      "- Outer frame ring with contrasting material (metallic, darker enamel, or polished border).",
      "- Inner composition: central motif + surrounding decorative elements (stars, laurels, lines, dots) for visual richness.",
      "- Material detail layers: gloss, bevel, embossed text, enamel divider lines — the badge should feel detailed on close inspection.",
      "- Shadow/reflection grounding plane beneath.",
      "- Optional: 1-2 smaller companion badges at 40-50% scale, slightly rotated (±8°), layered behind the hero for system/collection feel.",
      "",
      "VISUAL RULES:",
      "- Badge silhouette MUST be clean and iconic — readable at 24px thumbnail size.",
      "- No complex internal detail that muddies at small sizes — bold, confident shapes only.",
      "- Maximum 4 colors in badge: {{primary_dark}}, {{primary_accent}}, {{primary_light}}, and white — no others.",
      "- Edge thickness must be perfectly consistent around entire perimeter — no tapering or uneven depth.",
      "- Specular highlights must feel physically motivated — positioned where studio light would naturally hit.",
      "- The badge should look like a photograph of a real physical object, not a flat digital illustration.",
      "",
      "MUST INCLUDE:",
      "- One dominant 3D hero badge with unmistakable silhouette and premium material feel.",
      "- Multi-layer depth: shadow + edge bevel + surface gradient + specular highlights.",
      "- Enamel-like surface quality with visible gloss and color depth.",
      "- Embossed or engraved text treatment on badge surface.",
      "- Clean outer contour readable at thumbnail scale.",
      "- Unambiguous foreground/background separation.",
      "- The tactile premium quality of a $25 collectors' enamel pin — lustrous, weighty, and covetable."
    ].join("\n")
  },
  {
    id: "abstract_shape_background",
    label: "Abstract Shape Background",
    promptHint: [
      "Create a mesmerizing abstract shape background that feels like living, breathing digital art — the kind of backdrop that makes any headline placed on top look like it belongs on a Fortune 500 homepage.",
      "",
      "ATMOSPHERE & MOOD:",
      "- Evoke the visual poetry of a high-end brand campaign backdrop: Apple's gradient backgrounds, Stripe's flowing mesh gradients, or Vercel's aurora effects.",
      "- Abstract but never random — every shape should feel intentionally placed, creating a sense of orchestrated movement.",
      "- The background should feel alive with subtle energy, like slow-motion liquid or softly shifting light.",
      "- Premium and enterprise-appropriate — no childish blobs, no playful cartoon shapes.",
      "",
      "PAGE STYLE:",
      "- Base gradient field: luxurious multi-stop gradient using {{primary_dark}} at one anchor, flowing through {{primary_accent}} mid-tones, arriving at {{primary_light}} at the opposite anchor.",
      "- Gradient direction: diagonal (135° preferred) or radial from center — choose based on composition balance.",
      "- Gradient quality: super-smooth transitions with NO visible banding — use at least 5-7 color stops for silk-smooth blending.",
      "- Noise texture: fine grain overlay at 2-4% opacity across the entire surface for anti-banding and premium depth.",
      "- Subtle light source: one brighter zone (white at 5-8% opacity, large 300px+ Gaussian blur) suggesting ambient directional lighting.",
      "",
      "SHAPE LANGUAGE — LAYERED DEPTH:",
      "- Background layer (furthest back):",
      "  • 2-3 large, very soft organic blobs (150-400px range), heavily blurred (20-40px Gaussian).",
      "  • Opacity: 15-25%. Colors: tints of {{primary_dark}} and {{primary_accent}}.",
      "  • These create the atmospheric foundation — like out-of-focus light through frosted glass.",
      "",
      "- Midground layer:",
      "  • 3-5 medium organic shapes (60-150px range), moderately blurred (6-12px Gaussian).",
      "  • Opacity: 30-55%. Colors: {{primary_accent}}, {{primary_light}}, white at 20%.",
      "  • These create movement and visual flow — they should guide the eye across the composition.",
      "  • Mix of softly rounded rectangles, ellipses, and organic blob forms.",
      "",
      "- Foreground layer (closest to viewer):",
      "  • 4-8 fine accent elements: thin lines (1px), small circles (4-10px), tiny geometric forms, subtle dot clusters.",
      "  • Opacity: 50-100%. Colors: white, {{primary_light}}.",
      "  • These add texture, detail, and sophistication — like scattered light particles.",
      "  • Include at least 2 thin lines (80-150px long, 1px, white at 30%) for geometric structure.",
      "",
      "COMPOSITION RULES:",
      "- Asymmetric balance: shapes should NOT be symmetrically placed — use dynamic, off-center composition.",
      "- Flow direction: create a subtle visual current that moves diagonally across the canvas.",
      "- Density variation: some areas should be shape-dense, others intentionally sparse — contrast creates interest.",
      "- Text-safe zone: one clearly defined area (at least 25-30% of canvas) with reduced visual complexity and consistent contrast for headline overlay.",
      "- Text-safe zone should have enough contrast for BOTH white and dark text options.",
      "",
      "STRUCTURE REQUIREMENTS:",
      "- Base gradient field establishing color temperature, mood, and lighting direction.",
      "- 2-3 large background blobs creating atmospheric depth foundation.",
      "- 3-5 mid-size organic shapes creating movement and visual rhythm.",
      "- 4-8 scattered fine accent elements (lines, dots, small polygons) for textural detail.",
      "- One clearly defined text-overlay-safe area with significantly reduced visual noise.",
      "- Subtle light-source indicator through brightness differential across the canvas.",
      "",
      "VISUAL RULES:",
      "- ZERO recognizable objects, icons, symbols, or representational imagery — purely abstract.",
      "- Maximum 4 chromatic colors: {{primary_dark}}, {{primary_accent}}, {{primary_light}}, and white — no other hues.",
      "- All major shapes should feel organic or softly rounded — no sharp geometric edges or hard angles on large forms.",
      "- Fine accent elements (foreground) can be geometric (lines, circles) for contrast against organic backgrounds.",
      "- No visible hard edges between color zones — all transitions must be smooth, blurred, or feathered.",
      "- The text-safe zone must have contrast delta of at least 40% from surrounding areas.",
      "- Noise texture applied uniformly across entire canvas — no patchy grain.",
      "",
      "MUST INCLUDE:",
      "- Three-layer depth system: background blobs → midground shapes → foreground accents.",
      "- Silk-smooth gradient foundation with no visible banding.",
      "- One clearly defined low-noise text-safe area suitable for headline overlay.",
      "- Balanced shape density — no empty corners, no overcrowded zones.",
      "- Film-grain noise texture for premium depth and anti-banding.",
      "- Enterprise-appropriate elegance — this should feel like a $50,000 brand campaign backdrop, not a student project.",
      "- The mesmerizing quality of staring into shifting aurora lights — beautiful, dynamic, and endlessly sophisticated."
    ].join("\n")
  }
];

/* ------------------------------------------------------------------ */
/*  FONT_PRESETS                                                        */
/* ------------------------------------------------------------------ */

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "modern_sans",
    label: "Modern Sans",
    roles: { family: "sans-serif", headline: "bold sans-serif", subhead: "medium sans-serif", body: "regular sans-serif", label: "light sans-serif" },
    promptHint: [
      "Apply modern sans-serif typography wherever text appears.",
      "",
      "TYPOGRAPHIC CHARACTER:",
      "- Clean, contemporary sans-serif with balanced proportions and open apertures.",
      "- Inspired by Figtree, Inter, or Plus Jakarta Sans. Friendly yet professional.",
      "",
      "WEIGHT & HIERARCHY:",
      "- Headlines: bold (600-700). Subheadings: medium (500). Body: regular (400). Labels/captions: light (300-400).",
      "",
      "SPACING & LAYOUT:",
      "- Letter-spacing: slightly tight (-0.01em) for headlines, normal for body.",
      "- Line height: 1.2x headlines, 1.5-1.6x body. Generous paragraph spacing.",
      "",
      "CASE TREATMENT:",
      "- Headlines: sentence or title case. Labels/badges: uppercase with wide tracking (0.08-0.12em).",
      "",
      "PAIRING RULES:",
      "- Single font family throughout. Use weight contrast for hierarchy, not font variety."
    ].join("\n")
  },
  {
    id: "montserrat",
    label: "Montserrat",
    roles: { family: "sans-serif", headline: "extra-bold sans-serif", subhead: "semi-bold sans-serif", body: "regular sans-serif", label: "medium sans-serif" },
    promptHint: [
      "Apply Montserrat-inspired geometric sans typography with punchy marketing character.",
      "",
      "TYPOGRAPHIC CHARACTER:",
      "- Geometric sans-serif with rounded forms and even stroke distribution.",
      "- Confident, modern, and marketing-forward. Strong display presence.",
      "",
      "WEIGHT & HIERARCHY:",
      "- Headlines: bold to extra-bold (700-800). Subheadings: semi-bold (600). Body: regular (400).",
      "",
      "SPACING & LAYOUT:",
      "- Headlines: tight letter-spacing (-0.02em). Body: normal. Line height: 1.15-1.2x headlines, 1.5x body.",
      "",
      "CASE TREATMENT:",
      "- Headlines: all-uppercase with moderate tracking (0.04-0.06em) for bold campaign feel.",
      "- Body and labels: sentence case.",
      "",
      "PAIRING RULES:",
      "- Pair bold headlines with regular body in the same family. Excellent for hero text and metrics."
    ].join("\n")
  },
  {
    id: "grotesk",
    label: "Grotesk",
    roles: { family: "sans-serif", headline: "bold sans-serif", subhead: "medium sans-serif", body: "regular sans-serif", label: "medium sans-serif" },
    promptHint: [
      "Apply grotesk-style typography with neutral, professional character.",
      "",
      "TYPOGRAPHIC CHARACTER:",
      "- Neo-grotesque sans-serif with minimal stroke contrast.",
      "- Inspired by Space Grotesk or Akzidenz Grotesk. Unobtrusive and authoritative.",
      "",
      "WEIGHT & HIERARCHY:",
      "- Headlines: medium to bold (500-700). Subheadings: medium (500). Body: regular (400).",
      "",
      "SPACING & LAYOUT:",
      "- Slightly tight letter-spacing (-0.01em) across all sizes. Line height: 1.2x headlines, 1.45-1.5x body.",
      "",
      "CASE TREATMENT:",
      "- Headlines: sentence case. Section labels: uppercase with generous tracking (0.1em).",
      "",
      "PAIRING RULES:",
      "- Single family, weight-driven hierarchy. Can pair with monospace for technical callouts."
    ].join("\n")
  },
  {
    id: "geometric_sans",
    label: "Geometric Sans",
    roles: { family: "sans-serif", headline: "bold sans-serif", subhead: "semi-bold sans-serif", body: "regular sans-serif", label: "medium sans-serif" },
    promptHint: [
      "Apply geometric sans-serif typography with crisp proportional forms.",
      "",
      "TYPOGRAPHIC CHARACTER:",
      "- Geometric sans built on circular and rectangular base shapes.",
      "- Inspired by Manrope, Gilroy, or Circular. Clean, modern, and structured.",
      "",
      "WEIGHT & HIERARCHY:",
      "- Headlines: bold (700). Subheadings: semi-bold (600). Body: regular (400). Numbers: bold (700).",
      "",
      "SPACING & LAYOUT:",
      "- Normal to slightly loose (0-0.01em) for headlines. Line height: 1.2x headlines, 1.5x body.",
      "- Strong left-alignment; geometric type looks best with precise edges.",
      "",
      "CASE TREATMENT:",
      "- Headlines: title case. Labels: uppercase with tracking (0.06-0.1em).",
      "",
      "PAIRING RULES:",
      "- Single family. Excellent for dashboards and data displays."
    ].join("\n")
  },
  {
    id: "transitional_serif",
    label: "Transitional Serif",
    roles: { family: "serif", headline: "bold serif", subhead: "semi-bold serif", body: "regular serif", label: "light serif" },
    promptHint: [
      "Apply transitional serif typography for premium editorial credibility.",
      "",
      "TYPOGRAPHIC CHARACTER:",
      "- Transitional serif with moderate stroke contrast and bracketed serifs.",
      "- Inspired by Merriweather or Libre Baskerville. Trusted and authoritative.",
      "",
      "WEIGHT & HIERARCHY:",
      "- Headlines: bold (700). Subheadings: semi-bold or bold italic. Body: regular (400). Pull-quotes: regular italic, 18-22pt.",
      "",
      "SPACING & LAYOUT:",
      "- Normal letter-spacing. Line height: 1.25x headlines, 1.6-1.7x body (serif needs more leading).",
      "- Narrower text columns (50-65 chars/line).",
      "",
      "CASE TREATMENT:",
      "- Headlines: title case only. Never use all-uppercase for serif text.",
      "",
      "PAIRING RULES:",
      "- Can pair with clean sans-serif for UI labels and captions. Use italic for emphasis rather than bold."
    ].join("\n")
  },
  {
    id: "mono_tech",
    label: "Mono Tech",
    roles: { family: "monospace", headline: "bold monospace", subhead: "medium monospace", body: "regular monospace", label: "medium monospace" },
    promptHint: [
      "Apply monospace technical typography for interface-like precision.",
      "",
      "TYPOGRAPHIC CHARACTER:",
      "- Monospace typeface with equal character widths.",
      "- Inspired by IBM Plex Mono or JetBrains Mono. Technical, precise, and systematic.",
      "",
      "WEIGHT & HIERARCHY:",
      "- Headlines: bold (700). Subheadings: medium (500). Body: regular (400) at 12-14pt. Data labels: medium (500).",
      "",
      "SPACING & LAYOUT:",
      "- Normal letter-spacing (monospace has built-in). Line height: 1.4x headlines, 1.6x body.",
      "- Use fixed-width alignment for natural column grids.",
      "",
      "CASE TREATMENT:",
      "- Headlines: all-uppercase for terminal aesthetic. Labels: uppercase with 0.04em tracking.",
      "",
      "PAIRING RULES:",
      "- Can pair with geometric sans for prose. Excellent for dashboards, terminals, and technical specs."
    ].join("\n")
  },
  {
    id: "humanist_sans",
    label: "Humanist Sans",
    roles: { family: "sans-serif", headline: "semi-bold sans-serif", subhead: "medium sans-serif", body: "regular sans-serif", label: "light sans-serif" },
    promptHint: [
      "Apply humanist sans-serif typography with approachable professional warmth.",
      "",
      "TYPOGRAPHIC CHARACTER:",
      "- Humanist sans-serif with calligraphic influence in stroke modulation.",
      "- Inspired by Source Sans 3 or Fira Sans. Warm, readable, and accessible.",
      "",
      "WEIGHT & HIERARCHY:",
      "- Headlines: semi-bold (600). Subheadings: medium (500). Body: regular (400). Captions: light (300).",
      "",
      "SPACING & LAYOUT:",
      "- Normal letter-spacing. Line height: 1.25x headlines, 1.55-1.6x body.",
      "- Wider text columns (60-75 chars/line) acceptable due to high legibility.",
      "",
      "CASE TREATMENT:",
      "- Headlines: sentence or title case. Avoid heavy uppercase; humanist type loses warmth in all-caps.",
      "",
      "PAIRING RULES:",
      "- Single family with weight variation. Excellent for people-focused and accessible designs."
    ].join("\n")
  }
];

/* ------------------------------------------------------------------ */
/*  COLOR_SCHEMES                                                       */
/* ------------------------------------------------------------------ */

export const COLOR_SCHEMES: ColorSchemePreset[] = [
  {
    id: "executive_blue",
    label: "Executive Blue",
    roles: { primaryDark: { hex: "#1B365D", name: "deep navy" }, primaryAccent: { hex: "#2D5F99", name: "steel blue" }, primaryLight: { hex: "#D8E7F8", name: "soft blue wash" } },
    promptHint: [
      "Apply an executive blue dominant palette.",
      "",
      "PALETTE: deep navy (#1B365D) primary, steel blue (#2D5F99) accent, soft blue wash (#D8E7F8) light.",
      "",
      "USAGE RULES:",
      "- Text on dark: white or soft blue wash. Text on light: deep navy headlines, charcoal (#333) body.",
      "- Charts: deep navy primary, steel blue secondary, soft blue wash fills.",
      "- No warm colors except for explicit warning/error states.",
      "- Feel: Fortune-500 corporate, institutional trust."
    ].join("\n")
  },
  {
    id: "neutral_slate",
    label: "Neutral Slate",
    roles: { primaryDark: { hex: "#334155", name: "deep slate" }, primaryAccent: { hex: "#64748B", name: "medium slate" }, primaryLight: { hex: "#E2E8F0", name: "ice gray" } },
    promptHint: [
      "Apply a neutral slate palette with calm contrast.",
      "",
      "PALETTE: deep slate (#334155) primary, medium slate (#64748B) accent, ice gray (#E2E8F0) light.",
      "",
      "USAGE RULES:",
      "- Intentionally muted. Use weight and size contrast for emphasis, not color.",
      "- Charts: deep slate primary, medium slate secondary, ice gray fills.",
      "- Feel: understated, professional, calm authority."
    ].join("\n")
  },
  {
    id: "tech_cyan",
    label: "Tech Cyan",
    roles: { primaryDark: { hex: "#155E75", name: "dark teal" }, primaryAccent: { hex: "#06B6D4", name: "bright cyan" }, primaryLight: { hex: "#CFFAFE", name: "cyan wash" } },
    promptHint: [
      "Apply a tech cyan accent palette.",
      "",
      "PALETTE: dark teal (#155E75) primary, bright cyan (#06B6D4) accent, cyan wash (#CFFAFE) light.",
      "",
      "USAGE RULES:",
      "- Bright cyan is the star — use for interactive elements, sparklines, and emphasis.",
      "- Glow effects on dark backgrounds: bright cyan at 20-30% opacity blur.",
      "- Feel: modern SaaS, developer tooling, technical innovation."
    ].join("\n")
  },
  {
    id: "steel_teal",
    label: "Steel + Teal",
    roles: { primaryDark: { hex: "#475569", name: "cool steel" }, primaryAccent: { hex: "#0F766E", name: "enterprise teal" }, primaryLight: { hex: "#99F6E4", name: "mint wash" } },
    promptHint: [
      "Apply steel-gray base with controlled teal accents.",
      "",
      "PALETTE: cool steel (#475569) primary, enterprise teal (#0F766E) accent, mint wash (#99F6E4) light.",
      "",
      "USAGE RULES:",
      "- Teal for positive data, progress, and highlights. Steel for neutral structure.",
      "- Max 30% of colored elements should be teal.",
      "- Feel: balanced enterprise tech, operational clarity."
    ].join("\n")
  },
  {
    id: "graphite_mono",
    label: "Graphite Mono",
    roles: { primaryDark: { hex: "#111827", name: "near-black" }, primaryAccent: { hex: "#4B5563", name: "dark graphite" }, primaryLight: { hex: "#D1D5DB", name: "silver gray" } },
    promptHint: [
      "Apply a graphite monochrome palette.",
      "",
      "PALETTE: near-black (#111827) primary, dark graphite (#4B5563) accent, silver gray (#D1D5DB) light.",
      "",
      "USAGE RULES:",
      "- Strictly monochrome — NO accent colors. Emphasis through weight and size contrast only.",
      "- Charts: near-black primary, graphite secondary, silver fills.",
      "- Feel: ultra-minimal, editorial authority."
    ].join("\n")
  },
  {
    id: "navy_contrast",
    label: "Navy Contrast",
    roles: { primaryDark: { hex: "#0B1F3A", name: "midnight navy" }, primaryAccent: { hex: "#F59E0B", name: "warm amber" }, primaryLight: { hex: "#EEF2FF", name: "pale indigo" } },
    promptHint: [
      "Apply high-contrast navy with bright amber clarity points.",
      "",
      "PALETTE: midnight navy (#0B1F3A) primary, warm amber (#F59E0B) accent, pale indigo (#EEF2FF) light.",
      "",
      "USAGE RULES:",
      "- Amber is the high-contrast attention grabber — max 2-3 elements per composition.",
      "- Amber on navy creates maximum contrast — reserve for hero metrics and CTAs.",
      "- Feel: bold enterprise statement, attention-commanding."
    ].join("\n")
  },
  {
    id: "deep_ocean",
    label: "Deep Ocean",
    roles: { primaryDark: { hex: "#0E3A5B", name: "deep ocean" }, primaryAccent: { hex: "#1D7FA8", name: "ocean blue" }, primaryLight: { hex: "#D7EEF8", name: "sky wash" } },
    promptHint: [
      "Apply a deep ocean blue palette with aqua accents.",
      "",
      "PALETTE: deep ocean (#0E3A5B) primary, ocean blue (#1D7FA8) accent, sky wash (#D7EEF8) light.",
      "",
      "USAGE RULES:",
      "- Ocean blue is the mid-tone workhorse — buttons, links, chart accents.",
      "- Stay within the blue spectrum. No warm accents.",
      "- Feel: deep tech trust, cloud infrastructure, calm confidence."
    ].join("\n")
  },
  {
    id: "forest_ink",
    label: "Forest Ink",
    roles: { primaryDark: { hex: "#1F3A2E", name: "deep forest" }, primaryAccent: { hex: "#2D7A57", name: "vibrant green" }, primaryLight: { hex: "#D9F2E4", name: "mint wash" } },
    promptHint: [
      "Apply dark evergreen palette with fresh green accents.",
      "",
      "PALETTE: deep forest (#1F3A2E) primary, vibrant green (#2D7A57) accent, mint wash (#D9F2E4) light.",
      "",
      "USAGE RULES:",
      "- Vibrant green for growth indicators and CTAs.",
      "- No red or orange. Use amber (#D4930D) sparingly only for warnings.",
      "- Feel: sustainable enterprise, growth narrative."
    ].join("\n")
  },
  {
    id: "charcoal_lime",
    label: "Charcoal + Lime",
    roles: { primaryDark: { hex: "#1F2937", name: "deep charcoal" }, primaryAccent: { hex: "#84CC16", name: "electric lime" }, primaryLight: { hex: "#EAF9C8", name: "lime wash" } },
    promptHint: [
      "Apply charcoal base with energetic lime accents.",
      "",
      "PALETTE: deep charcoal (#1F2937) primary, electric lime (#84CC16) accent, lime wash (#EAF9C8) light.",
      "",
      "USAGE RULES:",
      "- Lime on charcoal creates a dev-tool/terminal vibe.",
      "- Keep lime to 15-25% of colored surface; charcoal dominates.",
      "- Feel: modern startup, dev-tool energy."
    ].join("\n")
  },
  {
    id: "plum_gold",
    label: "Plum + Gold",
    roles: { primaryDark: { hex: "#4A2D5E", name: "deep plum" }, primaryAccent: { hex: "#C49B2A", name: "antique gold" }, primaryLight: { hex: "#F3EBDD", name: "warm cream" } },
    promptHint: [
      "Apply deep plum with restrained gold accents.",
      "",
      "PALETTE: deep plum (#4A2D5E) primary, antique gold (#C49B2A) accent, warm cream (#F3EBDD) light.",
      "",
      "USAGE RULES:",
      "- Gold conveys premium quality — awards, key metrics. Use sparingly (10-15%).",
      "- No cool blues or greens; stay warm.",
      "- Feel: luxury enterprise, distinguished consulting."
    ].join("\n")
  },
  {
    id: "sunset_coral",
    label: "Sunset Coral",
    roles: { primaryDark: { hex: "#7A2E2E", name: "deep terracotta" }, primaryAccent: { hex: "#F97316", name: "vibrant coral-orange" }, primaryLight: { hex: "#FDE7D9", name: "peach wash" } },
    promptHint: [
      "Apply warm sunset coral accent palette.",
      "",
      "PALETTE: deep terracotta (#7A2E2E) primary, vibrant coral-orange (#F97316) accent, peach wash (#FDE7D9) light.",
      "",
      "USAGE RULES:",
      "- Coral-orange for urgency, CTAs, and attention-driving elements.",
      "- Avoid mixing with cool blues; keep entirely warm.",
      "- Feel: warm enterprise energy, human-centered urgency."
    ].join("\n")
  },
  {
    id: "midnight_ice",
    label: "Midnight Ice",
    roles: { primaryDark: { hex: "#0F172A", name: "midnight" }, primaryAccent: { hex: "#38BDF8", name: "ice blue" }, primaryLight: { hex: "#E0F2FE", name: "frost wash" } },
    promptHint: [
      "Apply midnight navy with icy cyan accents.",
      "",
      "PALETTE: midnight (#0F172A) primary, ice blue (#38BDF8) accent, frost wash (#E0F2FE) light.",
      "",
      "USAGE RULES:",
      "- Ice blue on midnight creates futuristic glow. Use 20-25% opacity blur for neon ambiance.",
      "- No warm accents. If warnings needed, pale amber (#FFB347) minimally.",
      "- Feel: futuristic enterprise, high-tech elegance."
    ].join("\n")
  }
];

/* ------------------------------------------------------------------ */
/*  Resolution & helpers                                                */
/* ------------------------------------------------------------------ */

const DEFAULT_COLOR_ROLES: ColorSchemePreset["roles"] = {
  primaryDark: { hex: "#1B365D", name: "deep navy" },
  primaryAccent: { hex: "#2D5F99", name: "steel blue" },
  primaryLight: { hex: "#D8E7F8", name: "soft blue wash" }
};

const DEFAULT_FONT_ROLES: FontRoleSet = {
  family: "sans-serif",
  headline: "bold sans-serif",
  subhead: "semi-bold sans-serif",
  body: "regular sans-serif",
  label: "light sans-serif"
};

function formatRole(role: ColorRole): string {
  return `${role.name} (${role.hex})`;
}

/**
 * Resolve template variables in a style hint using the selected font and color presets.
 */
export function resolveStyleHint(
  styleHint: string,
  fontPreset?: FontPreset,
  colorPreset?: ColorSchemePreset
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

/**
 * Look up a style preset and return its hint with all template variables resolved.
 */
export function getResolvedStyleHint(
  stylePresets: PresetOption[],
  styleId?: string,
  fontId?: string,
  colorId?: string
): string | undefined {
  if (!styleId) return undefined;

  // Search in the provided collection first
  let style = stylePresets.find((p) => p.id === styleId);

  // If not found, try the other collection (cross-pollination)
  if (!style) {
    const alternate = stylePresets === STYLE_PRESETS ? GRAPHIC_STYLE_PRESETS : STYLE_PRESETS;
    style = alternate.find((p) => p.id === styleId);
  }

  if (!style) return undefined;

  const font = fontId ? FONT_PRESETS.find((p) => p.id === fontId) : undefined;
  const color = colorId ? (COLOR_SCHEMES as ColorSchemePreset[]).find((p) => p.id === colorId) : undefined;
  return resolveStyleHint(style.promptHint, font, color);
}

/**
 * Return a raw (unresolved) preset hint by ID. Use for font/color presets
 * that do not contain template variables.
 */
export const getPresetHint = (collection: PresetOption[], id?: string): string | undefined => {
  if (!id) {
    return undefined;
  }
  return collection.find((item) => item.id === id)?.promptHint;
};
