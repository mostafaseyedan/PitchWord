import type { LibraryAsset } from "@marketing/shared";
import type {
  AspectRatio,
  Category,
  ImageResolution,
  Tone,
  VideoAspectRatio,
  VideoDuration,
  VideoResolution
} from "@marketing/shared";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Button } from "../common/Button";
import { SegmentedControl } from "../common/SegmentedControl";
import { DropdownField } from "../common/DropdownField";
import { ColorSwatchStrip, renderFontPreviewLabel } from "../common/DropdownPreview";
import { InputField } from "../common/InputField";
import { TextAreaField } from "../common/TextAreaField";
import { ReferenceGallery } from "../common/ReferenceGallery";
import { colorSchemeOptions, fontPresetOptions, stylePresetOptions } from "../../config/visual-presets";

interface RunSetupPanelProps {
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  category: Category;
  onCategoryChange: (category: Category) => void;
  mediaMode: "image_only" | "image_video";
  onMediaModeChange: (mode: "image_only" | "image_video") => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  imageResolution: ImageResolution;
  onImageResolutionChange: (value: ImageResolution) => void;
  videoDurationSeconds: VideoDuration;
  onVideoDurationSecondsChange: (value: VideoDuration) => void;
  videoAspectRatio: VideoAspectRatio;
  onVideoAspectRatioChange: (value: VideoAspectRatio) => void;
  videoResolution: VideoResolution;
  onVideoResolutionChange: (value: VideoResolution) => void;
  imageStyleInstruction: string;
  onImageStyleInstructionChange: (value: string) => void;
  stylePresetId: string;
  onStylePresetIdChange: (value: string) => void;
  fontPresetId: string;
  onFontPresetIdChange: (value: string) => void;
  colorSchemeId: string;
  onColorSchemeIdChange: (value: string) => void;
  newsTopic: string;
  onNewsTopicChange: (value: string) => void;
  manualIdea: string;
  onManualIdeaChange: (value: string) => void;
  referenceAssets: LibraryAsset[];
  selectedReferenceAssetIds: string[];
  onToggleReferenceAsset: (assetId: string) => void;
  onReferenceUpload: (files: FileList | null) => void;
  onReferenceDelete: (assetId: string) => void | Promise<void>;
  onStartManual: () => void;
  onStartDaily: () => void;
  busy: boolean;
}

const toneOptions: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "urgent_hiring", label: "Urgent hiring" },
  { value: "educational", label: "Educational" },
  { value: "sales_focused", label: "Sales" },
  { value: "funny", label: "Funny" },
  { value: "engaging", label: "Engaging" },
  { value: "casual", label: "Casual" },
  { value: "absurd", label: "Absurd" }
];

const categoryOptions: { value: Category; label: string; tooltip: string }[] = [
  { value: "industry_news", label: "Industry trend", tooltip: "Recent enterprise tech developments affecting ITSM, Microsoft, and Infor markets.\nVisual: cinematic command center with holographic data panels and strong directional lighting." },
  { value: "customer_pain_point", label: "Pain point", tooltip: "Frame around recurring customer friction like skills gaps, upgrade fatigue, or key-person dependency.\nVisual: vintage blueprint infographic with technical annotations, isometric elements, and sepia overlay." },
  { value: "company_update", label: "Update", tooltip: "Highlight a recent Cendien project win, delivery milestone, or capability expansion.\nVisual: premium corporate announcement with architectural lines, polished surfaces, and abstract transformation motifs." },
  { value: "hiring", label: "Hiring", tooltip: "Spotlight team growth needs with clear role and value framing for ITSM, Microsoft, or Infor consulting.\nVisual: elite recruiting campaign with diverse professionals collaborating in a contemporary tech office." },
  { value: "product_education", label: "Education", tooltip: "Teach a specific ITSM, Microsoft, or Infor concept with a practical how-to angle.\nVisual: realistic 3D render of a single object, half photorealistic and half wireframe interior cutaway." },
  { value: "infor", label: "Infor", tooltip: "Focus on Infor ERP modernization, integration challenges, and operational transformation.\nVisual: strategic enterprise integration scene with layered interface elements across finance, supply chain, and service operations." },
  { value: "team", label: "Team", tooltip: "Spotlight team members, culture, expertise, and trusted delivery capability.\nVisual: professional group photo composited from real team reference images in a modern office setting." }
];

const mediaModeOptions: { value: "image_only" | "image_video"; label: string }[] = [
  { value: "image_only", label: "Image only" },
  { value: "image_video", label: "Image + video" },
];

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

const videoDurationOptions: { value: VideoDuration; label: string }[] = [
  { value: 4, label: "4s" },
  { value: 6, label: "6s" },
  { value: 8, label: "8s" }
];

const videoAspectRatioOptions: { value: VideoAspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" }
];

const videoResolutionOptions: { value: VideoResolution; label: string }[] = [
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
  { value: "4k", label: "4K" }
];

type ContentStylePreview = {
  title: string;
  description: string;
  background: string;
  accent: string;
  imageUrl?: string;
  kind:
  | "editorial"
  | "minimal_corporate"
  | "isometric_technical"
  | "cinematic_enterprise"
  | "blueprint_analytic"
  | "product_showcase";
};

const contentStylePreviewById: Record<string, ContentStylePreview> = {
  editorial: {
    title: "Editorial",
    description: "Clean typographic hierarchy with generous whitespace and balanced blocks.",
    background: "#F8F8F6",
    accent: "#2D5F99",
    imageUrl: "/images/presets/editorial.png",
    kind: "editorial"
  },
  minimal_corporate: {
    title: "Minimal Corporate",
    description: "Polished neutral surfaces, restrained geometry, and conservative contrast.",
    background: "linear-gradient(135deg, #EEF1F5 0%, #DDE3EA 100%)",
    accent: "#3D5268",
    kind: "minimal_corporate"
  },
  isometric_technical: {
    title: "Isometric Technical",
    description: "Structured isometric modules with technical line rhythm and depth.",
    background: "linear-gradient(135deg, #ECF5FB 0%, #DCEBF7 100%)",
    accent: "#2A6EA0",
    kind: "isometric_technical"
  },
  cinematic_enterprise: {
    title: "Cinematic Enterprise",
    description: "Directional lighting, dramatic depth, and premium enterprise atmosphere.",
    background: "#0D0D18",
    accent: "#38BDF8",
    imageUrl: "/images/presets/cinematic_enterprise.png",
    kind: "cinematic_enterprise"
  },
  blueprint_analytic: {
    title: "Blueprint Analytic",
    description: "Blueprint grids, annotation-like layers, and analytical composition logic.",
    background: "#1B365D",
    accent: "#F59E0B",
    imageUrl: "/images/presets/blueprint_analytic.png",
    kind: "blueprint_analytic"
  },
  product_showcase: {
    title: "Product Showcase",
    description: "Hero object spotlight with premium framing and controlled reflections.",
    background: "linear-gradient(135deg, #F6F2EE 0%, #EDE3D9 100%)",
    accent: "#8A5A2E",
    kind: "product_showcase"
  }
};

const renderContentStylePreviewScene = (preview: ContentStylePreview) => {
  if (preview.imageUrl) {
    return (
      <img
        src={preview.imageUrl}
        alt={preview.title}
        className="block w-full h-auto rounded-[var(--border-radius-small)] shadow-sm"
      />
    );
  }

  if (preview.kind === "editorial") {
    return (
      <div className="h-full space-y-1.5">
        <span className="block h-2.5 w-2/3 rounded-full bg-white/90" />
        <span className="block h-2 w-1/2 rounded-full bg-white/78" />
        <span className="block h-10 rounded-[var(--border-radius-small)] bg-white/84" />
      </div>
    );
  }

  if (preview.kind === "minimal_corporate") {
    return (
      <div className="grid h-full grid-cols-3 gap-1.5">
        <span className="rounded-[var(--border-radius-small)] bg-white/80" />
        <span className="rounded-[var(--border-radius-small)] bg-white/72" />
        <span className="rounded-[var(--border-radius-small)] bg-white/76" />
        <span className="col-span-3 rounded-[var(--border-radius-small)] opacity-90" style={{ backgroundColor: preview.accent }} />
      </div>
    );
  }

  if (preview.kind === "isometric_technical") {
    return (
      <div className="relative h-full">
        <span className="absolute left-3 top-2 h-8 w-8 rotate-[25deg] rounded-[var(--border-radius-small)] border-2 bg-white/76" style={{ borderColor: preview.accent }} />
        <span className="absolute left-10 top-6 h-8 w-8 rotate-[25deg] rounded-[var(--border-radius-small)] bg-white/84" />
        <span className="absolute left-16 top-3 h-8 w-8 rotate-[25deg] rounded-[var(--border-radius-small)] border-2 bg-white/72" style={{ borderColor: preview.accent }} />
      </div>
    );
  }

  if (preview.kind === "cinematic_enterprise") {
    return (
      <div className="relative h-full overflow-hidden rounded-[var(--border-radius-small)] bg-slate-900/18">
        <span className="absolute -left-5 top-0 h-20 w-12 rotate-[20deg] opacity-80" style={{ backgroundColor: preview.accent }} />
        <span className="absolute bottom-2 left-2 h-6 w-20 rounded-[var(--border-radius-small)] bg-white/78" />
      </div>
    );
  }

  if (preview.kind === "blueprint_analytic") {
    return (
      <div className="relative h-full rounded-[var(--border-radius-small)] border border-white/65 bg-white/30">
        <span className="absolute inset-x-0 top-1/3 border-t border-dashed border-white/75" />
        <span className="absolute inset-x-0 top-2/3 border-t border-dashed border-white/75" />
        <span className="absolute inset-y-0 left-1/3 border-l border-dashed border-white/75" />
        <span className="absolute inset-y-0 left-2/3 border-l border-dashed border-white/75" />
        <span className="absolute left-3 top-3 h-8 w-8 rounded-full border-2 border-white/85" />
        <span className="absolute right-3 bottom-3 h-2 w-14 rounded-full" style={{ backgroundColor: preview.accent }} />
      </div>
    );
  }

  return (
    <div className="relative h-full rounded-[var(--border-radius-small)]">
      <span className="absolute left-8 top-2 h-12 w-12 rounded-full bg-white/82 shadow-[0_6px_14px_rgba(70,45,18,0.2)]" />
      <span className="absolute left-4 top-6 h-14 w-14 rounded-full opacity-80 blur-[0.8px]" style={{ backgroundColor: preview.accent }} />
      <span className="absolute right-2 bottom-2 h-2 w-12 rounded-full bg-white/78" />
    </div>
  );
};

export const RunSetupPanel = ({
  tone,
  onToneChange,
  category,
  onCategoryChange,
  mediaMode,
  onMediaModeChange,
  aspectRatio,
  onAspectRatioChange,
  imageResolution,
  onImageResolutionChange,
  videoDurationSeconds,
  onVideoDurationSecondsChange,
  videoAspectRatio,
  onVideoAspectRatioChange,
  videoResolution,
  onVideoResolutionChange,
  imageStyleInstruction,
  onImageStyleInstructionChange,
  stylePresetId,
  onStylePresetIdChange,
  fontPresetId,
  onFontPresetIdChange,
  colorSchemeId,
  onColorSchemeIdChange,
  newsTopic,
  onNewsTopicChange,
  manualIdea,
  onManualIdeaChange,
  referenceAssets,
  selectedReferenceAssetIds,
  onToggleReferenceAsset,
  onReferenceUpload,
  onReferenceDelete,
  onStartManual,
  onStartDaily,
  busy,
}: RunSetupPanelProps) => {
  const selectedCategory = categoryOptions.find((option) => option.value === category);
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
  const contentStyleDropdownOptions = stylePresetOptions.map((item) => ({
    value: item.id,
    label: item.label,
    preview: contentStylePreviewById[item.id] ?? null
  }));

  return (
    <Tooltip.Provider delayDuration={180}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="card-elevated card-elevated-neutral panel-surface"
      >
        <div className="section-header !items-start">
          <div>
            <div className="text-label">Engine Config</div>
            <h2 className="heading-md mt-1 text-primary">Build and Launch a Content Run</h2>
            <p className="body-md mt-1 max-w-2xl !text-secondary">
              Shape your campaign strategy, visual language, and output format before starting a new pipeline run.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] bg-[color:var(--allgrey-background-color)] px-3 py-1 text-[12px] font-medium text-secondary">
              {mediaMode === "image_video" ? "Image + video" : "Image only"}
            </span>
            <span className="rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] bg-[color:var(--allgrey-background-color)] px-3 py-1 text-[12px] font-medium text-secondary">
              {selectedReferenceAssetIds.length}/14 references
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
                <h3 className="text-[15px] font-semibold text-primary mt-0.5">Strategy and Visual Direction</h3>
              </div>
            </div>

            <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
              <section className={sectionClassName}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Strategy</div>
                    <p className="text-[14px] text-secondary mt-1">Pick narrative framing and the primary input source.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <DropdownField
                    id="tone-selector"
                    label="Tone"
                    options={toneOptions}
                    value={tone}
                    onChange={onToneChange}
                    ariaLabel="Tone selector"
                  />
                  <DropdownField
                    id="category-selector"
                    label="Category"
                    options={categoryOptions.map(({ value, label }) => ({ value, label }))}
                    value={category}
                    onChange={onCategoryChange}
                    ariaLabel="Category selector"
                  />
                </div>

                {selectedCategory ? (
                  <div className="mt-4 rounded-[var(--border-radius-small)] border border-[color:var(--layout-border-color)] bg-[color:var(--primary-highlighted-color)] px-3 py-2.5">
                    <p className="text-[13px] leading-5 text-secondary whitespace-pre-line">{selectedCategory.tooltip}</p>
                  </div>
                ) : null}

                <div className="mt-4">
                  <InputField
                    id="news-topic"
                    label="Topic (optional)"
                    value={newsTopic}
                    onChange={onNewsTopicChange}
                    placeholder="e.g. AI personalization regulations"
                  />
                </div>

                <div className="mt-4">
                  <TextAreaField
                    id="manual-idea"
                    label="Manual Idea"
                    value={manualIdea}
                    onChange={onManualIdeaChange}
                    placeholder="Type manual idea to skip news selection..."
                  />
                </div>
              </section>

              <section className={sectionClassName}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Visual Direction</div>
                    <p className="text-[14px] text-secondary mt-1">Control look-and-feel presets and optional style override.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DropdownField
                    id="style-preset-selector"
                    reserveLabelSpace
                    options={contentStyleDropdownOptions}
                    value={stylePresetId}
                    onChange={onStylePresetIdChange}
                    ariaLabel="Style preset selector"
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
                                {renderContentStylePreviewScene(option.preview)}
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
                    id="font-preset-selector"
                    label="Font Preset"
                    options={fontPresetDropdownOptions}
                    value={fontPresetId}
                    onChange={onFontPresetIdChange}
                    ariaLabel="Font preset selector"
                    optionRenderer={renderFontPreviewLabel}
                    valueRenderer={renderFontPreviewLabel}
                  />
                  <DropdownField
                    id="color-scheme-selector"
                    label="Color Scheme"
                    options={colorSchemeDropdownOptions}
                    value={colorSchemeId}
                    onChange={onColorSchemeIdChange}
                    ariaLabel="Color scheme selector"
                  />
                </div>

                <div className="mt-4">
                  <TextAreaField
                    id="image-style-instruction"
                    label="Image Design Override (optional)"
                    value={imageStyleInstruction}
                    onChange={onImageStyleInstructionChange}
                    placeholder="e.g. clean editorial composition, warm sunset lighting, shallow depth of field, subtle geometric background..."
                  />
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
                <h3 className="text-[15px] font-semibold text-primary mt-0.5">Output and Reference Context</h3>
              </div>
            </div>

            <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
              <section className={sectionClassName}>
                <div className="mb-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Output Format</div>
                  <p className="text-[14px] text-secondary mt-1">Tune delivery mode and canvas constraints.</p>
                </div>

                <div>
                  <label className="field-label">Media Mode</label>
                  <SegmentedControl
                    options={mediaModeOptions}
                    value={mediaMode}
                    onChange={onMediaModeChange}
                    label="Media mode selector"
                  />
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-2">
                  <DropdownField
                    id="image-aspect-ratio-selector"
                    label="Image Aspect Ratio"
                    options={aspectRatioOptions}
                    value={aspectRatio}
                    onChange={onAspectRatioChange}
                    ariaLabel="Aspect ratio selector"
                  />

                  <div>
                    <label className="field-label">Image Resolution</label>
                    <SegmentedControl
                      options={imageResolutionOptions}
                      value={imageResolution}
                      onChange={onImageResolutionChange}
                      label="Resolution selector"
                    />
                  </div>
                </div>

                {mediaMode === "image_video" ? (
                  <div className="mt-4 rounded-[var(--border-radius-small)] border border-[color:var(--layout-border-color)] bg-[color:var(--allgrey-background-color)] px-3 py-3">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary mb-3">Video Settings</div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="field-label">Video Length</label>
                        <SegmentedControl
                          options={videoDurationOptions}
                          value={videoDurationSeconds}
                          onChange={onVideoDurationSecondsChange}
                          label="Video duration selector"
                        />
                        <p className="text-[12px] text-secondary mt-1.5">
                          Veo 3.1 uses 8s when reference images are included.
                        </p>
                      </div>

                      <div>
                        <label className="field-label">Video Aspect Ratio</label>
                        <SegmentedControl
                          options={videoAspectRatioOptions}
                          value={videoAspectRatio}
                          onChange={onVideoAspectRatioChange}
                          label="Video aspect ratio selector"
                        />
                      </div>

                      <div>
                        <label className="field-label">Video Resolution</label>
                        <SegmentedControl
                          options={videoResolutionOptions}
                          value={videoResolution}
                          onChange={onVideoResolutionChange}
                          label="Video resolution selector"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className={sectionClassName}>
                <div className="mb-4">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Reference Context</div>
                  <p className="text-[14px] text-secondary mt-1">
                    Add visual references to align generated output with brand context.
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
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="espresso" loading={busy} onClick={onStartManual} className="w-full sm:w-auto">
              Start manual run
            </Button>
            <Button variant="secondary" loading={busy} onClick={onStartDaily} className="w-full sm:w-auto">
              Daily run
            </Button>
          </div>
        </div>
      </motion.div>
    </Tooltip.Provider>
  );
};
