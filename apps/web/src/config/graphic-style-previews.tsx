/**
 * Shared graphic style preset preview data and renderer.
 * Used by both GraphicGenerationPanel and RunSetupPanel so the visual
 * preview definitions live in exactly one place.
 */

export type GraphicStylePreview = {
    title: string;
    description: string;
    background: string;
    accent: string;
    imageUrl?: string;
    kind:
    | "vector_icon_system"
    | "flat_infographic"
    | "social_hero_poster"
    | "ui_illustration"
    | "sticker_badge_3d"
    | "abstract_shape_background";
};

export const graphicStylePreviewById: Record<string, GraphicStylePreview> = {
    vector_icon_system: {
        title: "Vector Icon System",
        description: "Clean outlines, geometric balance, and crisp negative space.",
        background: "linear-gradient(130deg, #EEF4FD 0%, #DCE8F9 100%)",
        accent: "#285A96",
        imageUrl: "/images/presets/vector_icon_system.png",
        kind: "vector_icon_system",
    },
    flat_infographic: {
        title: "Flat Infographic",
        description: "Bold flat blocks, clear hierarchy, data-friendly composition.",
        background: "linear-gradient(135deg, #EAF8F7 0%, #D6EEEB 100%)",
        accent: "#1A7A73",
        imageUrl: "/images/presets/flat_infographic.png",
        kind: "flat_infographic",
    },
    social_hero_poster: {
        title: "Social Hero Poster",
        description: "Strong focal shape, headline zone, and high contrast framing.",
        background: "#1F2937",
        accent: "#F97316",
        imageUrl: "/images/presets/social_hero_poster.png",
        kind: "social_hero_poster",
    },
    ui_illustration: {
        title: "UI Illustration",
        description: "Interface-like modules with soft depth and polished spacing.",
        background: "linear-gradient(135deg, #EEF2FF 0%, #DDE7FF 100%)",
        accent: "#3E5FC5",
        imageUrl: "/images/presets/ui_illustration.png",
        kind: "ui_illustration",
    },
    sticker_badge_3d: {
        title: "Sticker Badge 3D",
        description: "Layered badges with glossy highlights and compact dimensionality.",
        background: "linear-gradient(135deg, #F4F1FF 0%, #E7DEFF 100%)",
        accent: "#5D3CB2",
        imageUrl: "/images/presets/sticker_badge_3d.png",
        kind: "sticker_badge_3d",
    },
    abstract_shape_background: {
        title: "Abstract Shape Background",
        description: "Layered gradient forms for branded backdrops and hero scenes.",
        background: "#0F172A",
        accent: "#38BDF8",
        imageUrl: "/images/presets/abstract_shape_background.png",
        kind: "abstract_shape_background",
    },
};

export const renderGraphicStylePreviewScene = (preview: GraphicStylePreview) => {
    if (preview.imageUrl) {
        return (
            <img
                src={preview.imageUrl}
                alt={preview.title}
                className="block w-full h-auto rounded-[var(--border-radius-small)] shadow-sm"
            />
        );
    }

    if (preview.kind === "vector_icon_system") {
        return (
            <div className="grid h-full grid-cols-3 gap-1.5">
                <span className="rounded-[var(--border-radius-small)] border-2 border-[color:var(--ui-border-color)] bg-white/85" />
                <span className="rounded-full border-2 bg-white/70" style={{ borderColor: preview.accent }} />
                <span className="rounded-[var(--border-radius-small)] border-2 border-[color:var(--ui-border-color)] bg-white/85" />
                <span className="rounded-full border-2 bg-white/80" style={{ borderColor: preview.accent }} />
                <span className="rounded-[var(--border-radius-small)] border-2 border-[color:var(--ui-border-color)] bg-white/78" />
                <span className="rounded-full border-2 bg-white/75" style={{ borderColor: preview.accent }} />
            </div>
        );
    }

    if (preview.kind === "flat_infographic") {
        return (
            <div className="flex h-full items-end gap-1.5">
                <span className="h-[28%] w-1/5 rounded-[var(--border-radius-small)] bg-white/72" />
                <span className="h-[46%] w-1/5 rounded-[var(--border-radius-small)] bg-white/82" />
                <span className="h-[68%] w-1/5 rounded-[var(--border-radius-small)] opacity-95" style={{ backgroundColor: preview.accent }} />
                <span className="h-[54%] w-1/5 rounded-[var(--border-radius-small)] bg-white/80" />
                <span className="h-[82%] w-1/5 rounded-[var(--border-radius-small)] bg-white/85" />
            </div>
        );
    }

    if (preview.kind === "social_hero_poster") {
        return (
            <div className="relative h-full w-full overflow-hidden rounded-[var(--border-radius-small)] bg-black/10">
                <span className="absolute -left-3 top-2 h-14 w-14 rounded-full opacity-90" style={{ backgroundColor: preview.accent }} />
                <span className="absolute right-2 top-3 h-2 w-16 rounded-full bg-white/85" />
                <span className="absolute right-2 top-7 h-2 w-12 rounded-full bg-white/75" />
                <span className="absolute bottom-2 left-2 right-2 h-7 rounded-[var(--border-radius-small)] bg-white/80" />
            </div>
        );
    }

    if (preview.kind === "ui_illustration") {
        return (
            <div className="h-full rounded-[var(--border-radius-small)] border border-white/65 bg-white/72 p-1.5 shadow-[0_6px_14px_rgba(42,74,154,0.18)]">
                <div className="mb-1.5 h-2 rounded-full bg-white/90" />
                <div className="grid h-[calc(100%-0.875rem)] grid-cols-4 gap-1">
                    <span className="col-span-1 rounded-[var(--border-radius-small)] bg-white/78" />
                    <span className="col-span-3 rounded-[var(--border-radius-small)] opacity-95" style={{ backgroundColor: preview.accent }} />
                    <span className="col-span-2 rounded-[var(--border-radius-small)] bg-white/82" />
                    <span className="col-span-2 rounded-[var(--border-radius-small)] bg-white/74" />
                </div>
            </div>
        );
    }

    if (preview.kind === "sticker_badge_3d") {
        return (
            <div className="relative h-full">
                <span className="absolute left-5 top-3 h-12 w-12 rounded-full bg-white/80 shadow-[0_6px_14px_rgba(71,48,128,0.22)]" />
                <span
                    className="absolute left-10 top-6 h-12 w-12 rounded-full opacity-95 shadow-[0_8px_16px_rgba(71,48,128,0.28)]"
                    style={{ backgroundColor: preview.accent }}
                />
                <span className="absolute left-[3.6rem] top-[1.9rem] h-3 w-3 rounded-full bg-white/80" />
            </div>
        );
    }

    // abstract_shape_background (default)
    return (
        <div className="relative h-full overflow-hidden rounded-[var(--border-radius-small)]">
            <span className="absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-white/68 blur-[1px]" />
            <span className="absolute right-1 top-1 h-14 w-14 rounded-full opacity-90 blur-[0.5px]" style={{ backgroundColor: preview.accent }} />
            <span className="absolute left-9 top-5 h-10 w-10 rounded-full bg-white/76 blur-[0.4px]" />
        </div>
    );
};
