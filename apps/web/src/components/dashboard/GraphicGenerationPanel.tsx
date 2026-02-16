import type { AspectRatio, ImageResolution, LibraryAsset } from "@marketing/shared";
import { motion } from "framer-motion";
import { Button } from "../common/Button";
import { SegmentedControl } from "../common/SegmentedControl";
import { TextAreaField } from "../common/TextAreaField";
import { ReferenceGallery } from "../common/ReferenceGallery";
import { colorSchemeOptions, fontPresetOptions, stylePresetOptions } from "../../config/visual-presets";

interface GraphicGenerationPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  imageResolution: ImageResolution;
  onImageResolutionChange: (value: ImageResolution) => void;
  stylePresetId: string;
  onStylePresetIdChange: (value: string) => void;
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-elevated card-elevated-neutral rounded-[32px] p-8"
    >
      <div className="text-label mb-6">Graphic Generation</div>
      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Aspect Ratio</label>
          <SegmentedControl options={aspectRatioOptions} value={aspectRatio} onChange={onAspectRatioChange} label="Graphic aspect ratio selector" />
        </div>

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Size</label>
          <SegmentedControl options={imageResolutionOptions} value={imageResolution} onChange={onImageResolutionChange} label="Graphic size selector" />
        </div>

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Style Preset</label>
          <SegmentedControl options={stylePresetOptions.map((item) => ({ value: item.id, label: item.label }))} value={stylePresetId} onChange={onStylePresetIdChange} label="Graphic style selector" />
        </div>

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Font Preset</label>
          <SegmentedControl options={fontPresetOptions.map((item) => ({ value: item.id, label: item.label }))} value={fontPresetId} onChange={onFontPresetIdChange} label="Graphic font selector" />
        </div>

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Color Scheme</label>
          <SegmentedControl options={colorSchemeOptions.map((item) => ({ value: item.id, label: item.label }))} value={colorSchemeId} onChange={onColorSchemeIdChange} label="Graphic color selector" />
        </div>

        <TextAreaField
          id="graphic-prompt"
          label="Prompt"
          value={prompt}
          onChange={onPromptChange}
          placeholder="Describe the icon/graphic you want..."
          helpText="This mode uses image generation only and stores output in the global reference gallery."
        />

        <ReferenceGallery
          assets={referenceAssets}
          selectedIds={selectedReferenceAssetIds}
          onToggle={onToggleReferenceAsset}
          onUpload={onReferenceUpload}
          busy={busy}
          maxSelectable={14}
        />

        <div className="pt-2">
          <Button variant="espresso" loading={busy} onClick={onGenerate} disabled={!prompt.trim()}>
            Generate Graphic
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
