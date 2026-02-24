import { useState } from "react";
import type { AspectRatio, ImageResolution, LibraryAsset } from "@marketing/shared";
import { AnimatePresence, motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { WandSparkles, X } from "lucide-react";
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
import {
  type GraphicStylePreview,
  graphicStylePreviewById,
  renderGraphicStylePreviewScene,
} from "../../config/graphic-style-previews";

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
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<"generated" | "uploaded">("generated");
  const [modalTab, setModalTab] = useState<"uploaded" | "generated">("uploaded");
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
            <h3 className="text-[15px] font-semibold text-primary">Prompt and Render Settings</h3>

            <div className="mt-4 flex flex-col gap-4">
              <section className={sectionClassName}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Prompt</div>
                    <p className="text-[14px] text-secondary mt-1">
                      Describe the visual objective, scene composition, and any iconography constraints.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReferenceModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 w-auto max-w-full px-3 py-2 rounded-[var(--border-radius-small)] border border-transparent bg-primary text-white text-[11px] font-semibold shadow-[0_4px_12px_rgba(27,54,93,0.22)] hover:bg-[#162f4f] hover:shadow-[0_8px_18px_rgba(27,54,93,0.28)] transition-all duration-150 cursor-pointer shrink-0"
                  >
                    <span>Add reference image</span>
                  </button>
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                </div>

                <div className="grid gap-4 mt-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="field-label">Style Preset</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-2">
                      {graphicStylePresetOptions.map((preset) => {
                        const preview = graphicStylePreviewById[preset.id];
                        const isSelected = stylePresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => onStylePresetIdChange(preset.id)}
                            className={`flex flex-col items-center gap-2 p-2 rounded-[var(--border-radius-medium)] border-2 transition-all text-left ${isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-transparent bg-[color:var(--secondary-background-color)] hover:border-border-warm/70"
                              }`}
                          >
                            <span className={`text-[11px] font-semibold text-center leading-tight ${isSelected ? "text-primary" : "text-secondary"}`}>
                              {preset.label}
                            </span>
                            <div
                              className={`w-full rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] overflow-hidden ${preview?.imageUrl ? "p-0" : "aspect-video p-2"}`}
                              style={{ background: preview?.background }}
                            >
                              {preview ? renderGraphicStylePreviewScene(preview) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2">
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
          </section>

          <section className={stepClassName}>
            <h3 className="text-[15px] font-semibold text-primary">Generated Graphics Gallery</h3>

            <section className={`${sectionClassName} mt-4`}>
              <div className="mb-4 flex flex-col gap-3">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary">Gallery</div>
                  <p className="text-[14px] text-secondary mt-1">
                    Browse and manage your generated graphics.
                  </p>
                </div>
                <div className="self-start">
                  <SegmentedControl
                    options={[
                      { value: "generated", label: "Generated" },
                      { value: "uploaded", label: "Uploaded" },
                    ]}
                    value={galleryTab}
                    onChange={(val) => setGalleryTab(val as "generated" | "uploaded")}
                    label="Gallery Tab"
                  />
                </div>
              </div>
              <ReferenceGallery
                assets={referenceAssets.filter(a => galleryTab === "generated" ? a.source === "graphic_generated" : a.source === "upload")}
                selectedIds={[]}
                onToggle={() => { }}
                onUpload={() => { }}
                onDelete={onReferenceDelete}
                busy={busy}
                mode="view"
                onRegenerate={onPromptChange}
              />
            </section>
          </section>
        </div>
      </motion.div>

      <AnimatePresence>
        {isReferenceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-primary/80 backdrop-blur-sm"
            onClick={() => setIsReferenceModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[var(--border-radius-large)] bg-[color:var(--primary-background-color)] p-6 shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-primary">Reference Images</h2>
                  <p className="text-sm text-secondary mt-1">Select images to guide the generation style.</p>
                </div>
                <div className="flex items-center gap-4">
                  <SegmentedControl
                    options={[
                      { value: "generated", label: "Generated" },
                      { value: "uploaded", label: "Uploaded" },
                    ]}
                    value={modalTab}
                    onChange={(val) => setModalTab(val as "generated" | "uploaded")}
                    label="Modal Tab"
                  />
                  <button
                    type="button"
                    onClick={() => setIsReferenceModalOpen(false)}
                    className="p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-black/5"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <ReferenceGallery
                assets={referenceAssets.filter(a => modalTab === "generated" ? a.source === "graphic_generated" : a.source === "upload")}
                selectedIds={selectedReferenceAssetIds}
                onToggle={onToggleReferenceAsset}
                onUpload={onReferenceUpload}
                onDelete={onReferenceDelete}
                busy={busy}
                maxSelectable={14}
                mode="select"
              />

              <div className="mt-6 flex justify-end border-t border-[color:var(--ui-border-color)] pt-4">
                <Button variant="primary" onClick={() => setIsReferenceModalOpen(false)}>
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Tooltip.Provider>
  );
};
