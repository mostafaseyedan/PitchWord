import type { AspectRatio, ImageResolution, LibraryAsset } from "@marketing/shared";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { WandSparkles } from "lucide-react";
import { Button } from "../common/Button";
import { SegmentedControl } from "../common/SegmentedControl";
import { DropdownField } from "../common/DropdownField";
import { ColorSwatchStrip, renderFontPreviewLabel } from "../common/DropdownPreview";
import { TextAreaField } from "../common/TextAreaField";
import { ReferenceGallery } from "../common/ReferenceGallery";
import {
  colorSchemeOptions,
  fontPresetOptions,
  graphicStylePresetOptions,
} from "../../config/visual-presets";

interface GraphicGenerationPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerateTopic: () => void;
  promptOptions: string[];
  selectedPromptOptionIndex: number | null;
  onSelectPromptOption: (value: string, index: number) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  imageResolution: ImageResolution;
  onImageResolutionChange: (value: ImageResolution) => void;
  stylePresetId: string;
  onStylePresetIdChange: (value: string) => void;
  styleOverride: string;
  onStyleOverrideChange: (value: string) => void;
  fontPresetId: string;
  onFontPresetIdChange: (value: string) => void;
  colorSchemeId: string;
  onColorSchemeIdChange: (value: string) => void;
  referenceAssets: LibraryAsset[];
  selectedReferenceAssetIds: string[];
  onToggleReferenceAsset: (assetId: string) => void;
  onReferenceUpload: (files: FileList | null) => void;
  onReferenceDelete: (assetId: string) => void | Promise<void>;
  onGenerate: () => void;
  topicBusy: boolean;
  busy: boolean;
}

const aspectRatioOptions: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1" },
  { value: "2:3", label: "2:3" },
  { value: "3:2", label: "3:2" },
  { value: "3:4", label: "3:4" },
  { value: "4:3", label: "4:3" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
  { value: "21:9", label: "21:9" }
];

const imageResolutionOptions: { value: ImageResolution; label: string }[] = [
  { value: "1K", label: "1K" },
  { value: "2K", label: "2K" },
  { value: "4K", label: "4K" }
];

type GraphicStylePreview = {
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

const graphicStylePreviewById: Record<string, GraphicStylePreview> = {
  vector_icon_system: {
    title: "Vector Icon System",
    description: "Clean outlines, geometric balance, and crisp negative space.",
    background: "linear-gradient(130deg, #EEF4FD 0%, #DCE8F9 100%)",
    accent: "#285A96",
    kind: "vector_icon_system"
  },
  flat_infographic: {
    title: "Flat Infographic",
    description: "Bold flat blocks, clear hierarchy, data-friendly composition.",
    background: "linear-gradient(135deg, #EAF8F7 0%, #D6EEEB 100%)",
    accent: "#1A7A73",
    kind: "flat_infographic"
  },
  social_hero_poster: {
    title: "Social Hero Poster",
    description: "Strong focal shape, headline zone, and high contrast framing.",
    background: "#1F2937",
    accent: "#F97316",
    imageUrl: "/images/presets/social_hero_poster.png",
    kind: "social_hero_poster"
  },
  ui_illustration: {
    title: "UI Illustration",
    description: "Interface-like modules with soft depth and polished spacing.",
    background: "linear-gradient(135deg, #EEF2FF 0%, #DDE7FF 100%)",
    accent: "#3E5FC5",
    kind: "ui_illustration"
  },
  sticker_badge_3d: {
    title: "Sticker Badge 3D",
    description: "Layered badges with glossy highlights and compact dimensionality.",
    background: "linear-gradient(135deg, #F4F1FF 0%, #E7DEFF 100%)",
    accent: "#5D3CB2",
    kind: "sticker_badge_3d"
  },
  abstract_shape_background: {
    title: "Abstract Shape Background",
    description: "Layered gradient forms for branded backdrops and hero scenes.",
    background: "#0F172A",
    accent: "#38BDF8",
    imageUrl: "/images/presets/abstract_shape_background.png",
    kind: "abstract_shape_background"
  }
};

const renderGraphicStylePreviewScene = (preview: GraphicStylePreview) => {
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

  return (
    <div className="relative h-full overflow-hidden rounded-[var(--border-radius-small)]">
      <span className="absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-white/68 blur-[1px]" />
      <span className="absolute right-1 top-1 h-14 w-14 rounded-full opacity-90 blur-[0.5px]" style={{ backgroundColor: preview.accent }} />
      <span className="absolute left-9 top-5 h-10 w-10 rounded-full bg-white/76 blur-[0.4px]" />
    </div>
  );
};

const truncatePromptPreview = (value: string, maxLength = 110): string => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}...`;
};

export const GraphicGenerationPanel = ({
  prompt,
  onPromptChange,
  onGenerateTopic,
  promptOptions,
  selectedPromptOptionIndex,
  onSelectPromptOption,
  aspectRatio,
  onAspectRatioChange,
  imageResolution,
  onImageResolutionChange,
  stylePresetId,
  onStylePresetIdChange,
  styleOverride,
  onStyleOverrideChange,
  fontPresetId,
  onFontPresetIdChange,
  colorSchemeId,
  onColorSchemeIdChange,
  referenceAssets,
  selectedReferenceAssetIds,
  onToggleReferenceAsset,
  onReferenceUpload,
  onReferenceDelete,
  onGenerate,
  topicBusy,
  busy
}: GraphicGenerationPanelProps) => {
  const sectionClassName = "rounded-[var(--border-radius-medium)] border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] p-4";
  const stepClassName = "rounded-[var(--border-radius-medium)] border border-[color:var(--layout-border-color)] bg-[color:var(--primary-highlighted-color)] p-4";
  const fontPresetDropdownOptions = fontPresetOptions.map((item) => ({
    value: item.id,
    label: item.label,
    previewFontFamily: item.previewFontFamily,
  }));
  const colorSchemeDropdownOptions = colorSchemeOptions.map((item) => ({
    value: item.id,
    label: item.label,
    startElement: {
      type: "custom" as const,
      render: () => <ColorSwatchStrip swatches={item.swatches} />,
    },
  }));
  const graphicStyleDropdownOptions = graphicStylePresetOptions.map((item) => ({
    value: item.id,
    label: item.label,
    preview: graphicStylePreviewById[item.id] ?? null
  }));

  return (
    <Tooltip.Provider delayDuration={180}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="card-elevated card-elevated-neutral panel-surface"
      >
        <div className="section-header !items-start">
          <div>
            <div className="text-label">Graphic Generation</div>
            <h2 className="heading-md mt-1 text-primary">Design Standalone Visual Assets</h2>
            <p className="body-md mt-1 max-w-2xl !text-secondary">
              Generate one-off icons and graphics with dedicated graphic presets and optional style override.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] bg-[color:var(--allgrey-background-color)] px-3 py-1 text-[12px] font-medium text-secondary">
              {selectedReferenceAssetIds.length}/14 references
            </span>
            <span className="rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] bg-[color:var(--allgrey-background-color)] px-3 py-1 text-[12px] font-medium text-secondary">
              {aspectRatio}
            </span>
          </div>
        </div>
        <div className="form-stack [&_.dropdown-field-compact]:w-full">
          <section className={stepClassName}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] text-[12px] font-semibold text-primary">
                1
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Step 1</div>
                <h3 className="text-[15px] font-semibold text-primary mt-0.5">Prompt and Render Settings</h3>
              </div>
            </div>

            <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
              <section className={sectionClassName}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Prompt</div>
                    <p className="text-[14px] text-secondary mt-1">
                      Describe the visual objective, scene composition, and any iconography constraints.
                    </p>
                  </div>
                </div>

                <TextAreaField
                  id="graphic-prompt"
                  label="Prompt"
                  value={prompt}
                  onChange={onPromptChange}
                  placeholder="Describe the icon/graphic you want..."
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[12px] text-secondary">Need ideas? Generate 6 prompt options and select one.</p>
                  <button
                    type="button"
                    onClick={onGenerateTopic}
                    disabled={busy || topicBusy}
                    className="inline-flex items-center justify-center gap-1.5 max-w-full px-2.5 py-1.5 rounded-[var(--border-radius-small)] border border-transparent bg-primary text-white text-[10px] font-semibold shadow-[0_4px_12px_rgba(27,54,93,0.22)] hover:bg-[#162f4f] hover:shadow-[0_8px_18px_rgba(27,54,93,0.28)] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <WandSparkles size={12} strokeWidth={2} className="text-white/90" />
                    <span>{topicBusy ? "Generating..." : "Generate 6 prompts"}</span>
                  </button>
                </div>

                {promptOptions.length > 0 ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {promptOptions.slice(0, 6).map((item, idx) => {
                      const selected = idx === selectedPromptOptionIndex;
                      return (
                        <button
                          key={`${idx}-${item}`}
                          type="button"
                          onClick={() => onSelectPromptOption(item, idx)}
                          title={item}
                          className={`rounded-[var(--border-radius-small)] border px-3 py-2 text-left text-[12px] leading-5 transition-colors ${selected
                            ? "border-[color:var(--primary-color)] bg-[color:var(--primary-selected-color)] text-primary"
                            : "border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] text-secondary hover:border-[color:var(--primary-color)] hover:text-primary"
                            }`}
                        >
                          {truncatePromptPreview(item)}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>

              <section className={sectionClassName}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Render Settings</div>
                    <p className="text-[14px] text-secondary mt-1">Configure canvas and visual presets for this asset generation pass.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <DropdownField
                    id="graphic-aspect-ratio-selector"
                    label="Aspect Ratio"
                    options={aspectRatioOptions}
                    value={aspectRatio}
                    onChange={onAspectRatioChange}
                    ariaLabel="Graphic aspect ratio selector"
                  />

                  <div>
                    <label className="field-label">Size</label>
                    <SegmentedControl
                      options={imageResolutionOptions}
                      value={imageResolution}
                      onChange={onImageResolutionChange}
                      label="Graphic size selector"
                    />
                  </div>
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-3">
                  <DropdownField
                    id="graphic-style-selector"
                    label="Style Preset"
                    options={graphicStyleDropdownOptions}
                    value={stylePresetId}
                    onChange={onStylePresetIdChange}
                    ariaLabel="Graphic style selector"
                    optionRenderer={(option) => (
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <span className="inline-flex items-center text-[13px] font-medium text-primary">{option.label}</span>
                        </Tooltip.Trigger>
                        {option.preview ? (
                          <Tooltip.Portal>
                            <Tooltip.Content
                              side="right"
                              align="center"
                              sideOffset={10}
                              className="z-[100010] w-64 rounded-[var(--border-radius-medium)] border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] p-2.5 shadow-[0_14px_32px_rgba(24,38,58,0.24)]"
                            >
                              <div
                                className={`mb-2 w-full rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] ${option.preview.imageUrl ? "p-1 h-auto" : "p-2 h-24"}`}
                                style={{ background: option.preview.background }}
                              >
                                {renderGraphicStylePreviewScene(option.preview)}
                              </div>
                              <div className="text-[12px] font-semibold text-primary">{option.preview.title}</div>
                              <p className="mt-1 text-[12px] leading-4 text-secondary">{option.preview.description}</p>
                              <Tooltip.Arrow className="fill-[color:var(--secondary-background-color)]" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        ) : null}
                      </Tooltip.Root>
                    )}
                  />
                  <DropdownField
                    id="graphic-font-selector"
                    label="Font Preset"
                    options={fontPresetDropdownOptions}
                    value={fontPresetId}
                    onChange={onFontPresetIdChange}
                    ariaLabel="Graphic font selector"
                    optionRenderer={renderFontPreviewLabel}
                    valueRenderer={renderFontPreviewLabel}
                  />
                  <DropdownField
                    id="graphic-color-selector"
                    label="Color Scheme"
                    options={colorSchemeDropdownOptions}
                    value={colorSchemeId}
                    onChange={onColorSchemeIdChange}
                    ariaLabel="Graphic color selector"
                  />
                  <div className="md:col-span-3">
                    <TextAreaField
                      id="graphic-style-override"
                      label="Style Override (optional)"
                      value={styleOverride}
                      onChange={onStyleOverrideChange}
                      placeholder="Optional: add extra style direction that should override preset baseline if needed."
                    />
                  </div>
                </div>
              </section>
            </div>
          </section>

          <section className={stepClassName}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] text-[12px] font-semibold text-primary">
                2
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Step 2</div>
                <h3 className="text-[15px] font-semibold text-primary mt-0.5">Reference Context</h3>
              </div>
            </div>

            <section className={`${sectionClassName} mt-4`}>
              <div className="mb-4">
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Reference Context</div>
                <p className="text-[14px] text-secondary mt-1">
                  Add existing visuals to steer style consistency and icon treatment.
                </p>
              </div>
              <ReferenceGallery
                assets={referenceAssets}
                selectedIds={selectedReferenceAssetIds}
                onToggle={onToggleReferenceAsset}
                onUpload={onReferenceUpload}
                onDelete={onReferenceDelete}
                busy={busy}
                maxSelectable={14}
              />
            </section>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="espresso"
              loading={busy}
              onClick={onGenerate}
              disabled={!prompt.trim()}
              className="w-full sm:w-auto"
            >
              Generate graphic
            </Button>
          </div>
        </div>
      </motion.div>
    </Tooltip.Provider>
  );
};
