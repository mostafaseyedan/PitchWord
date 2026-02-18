import type { AspectRatio, ImageResolution, LibraryAsset } from "@marketing/shared";
import { motion } from "framer-motion";
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
  onGenerate: () => void;
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

export const GraphicGenerationPanel = ({
  prompt,
  onPromptChange,
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
  onGenerate,
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

  return (
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
                  options={graphicStylePresetOptions.map((item) => ({ value: item.id, label: item.label }))}
                  value={stylePresetId}
                  onChange={onStylePresetIdChange}
                  ariaLabel="Graphic style selector"
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
  );
};
