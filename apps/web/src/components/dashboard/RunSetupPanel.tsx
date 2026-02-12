import { useRef } from "react";
import type {
  AspectRatio,
  Category,
  ImageResolution,
  Tone,
  VideoAspectRatio,
  VideoDuration,
  VideoResolution
} from "@marketing/shared";
import { Upload, Play, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../common/Button";
import { SegmentedControl } from "../common/SegmentedControl";
import { InputField } from "../common/InputField";
import { TextAreaField } from "../common/TextAreaField";
import { FileTag } from "../common/FileTag";

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
  newsTopic: string;
  onNewsTopicChange: (value: string) => void;
  manualIdea: string;
  onManualIdeaChange: (value: string) => void;
  uploadedFileRefs: string[];
  onUpload: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
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
  newsTopic,
  onNewsTopicChange,
  manualIdea,
  onManualIdeaChange,
  uploadedFileRefs,
  onUpload,
  onRemoveFile,
  onStartManual,
  onStartDaily,
  busy,
}: RunSetupPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="card-elevated card-elevated-gold rounded-[34px] p-10 lg:p-12"
    >
      <div className="mb-8">
        <div className="text-label mb-2">Engine Config</div>
        <div className="mt-4 pb-4 border-b border-border-warm/30" />
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Tone</label>
          <SegmentedControl options={toneOptions} value={tone} onChange={onToneChange} label="Tone selector" />
        </div>

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Category</label>
          <SegmentedControl options={categoryOptions} value={category} onChange={onCategoryChange} label="Category selector" />
        </div>

        <InputField
          id="news-topic"
          label="Topic (optional)"
          value={newsTopic}
          onChange={onNewsTopicChange}
          placeholder="e.g. AI personalization regulations"
        />

        <TextAreaField
          id="manual-idea"
          label="Manual Idea"
          value={manualIdea}
          onChange={onManualIdeaChange}
          placeholder="Type manual idea to skip news selection..."
          helpText="If provided, this is used as primary content input."
        />

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Media Mode</label>
          <SegmentedControl options={mediaModeOptions} value={mediaMode} onChange={onMediaModeChange} label="Media mode selector" />
        </div>

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Image Aspect Ratio</label>
          <SegmentedControl options={aspectRatioOptions} value={aspectRatio} onChange={onAspectRatioChange} label="Aspect ratio selector" />
        </div>

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Image Resolution</label>
          <SegmentedControl options={imageResolutionOptions} value={imageResolution} onChange={onImageResolutionChange} label="Resolution selector" />
        </div>

        {mediaMode === "image_video" ? (
          <>
            <div>
              <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Video Length</label>
              <SegmentedControl
                options={videoDurationOptions}
                value={videoDurationSeconds}
                onChange={onVideoDurationSecondsChange}
                label="Video duration selector"
              />
              <p className="text-[11px] text-muted mt-1.5">
                Veo 3.1 uses 8s when reference images are included.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Video Aspect Ratio</label>
              <SegmentedControl
                options={videoAspectRatioOptions}
                value={videoAspectRatio}
                onChange={onVideoAspectRatioChange}
                label="Video aspect ratio selector"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">Video Resolution</label>
              <SegmentedControl
                options={videoResolutionOptions}
                value={videoResolution}
                onChange={onVideoResolutionChange}
                label="Video resolution selector"
              />
            </div>
          </>
        ) : null}

        <TextAreaField
          id="image-style-instruction"
          label="Image Design Override (optional)"
          value={imageStyleInstruction}
          onChange={onImageStyleInstructionChange}
          placeholder="e.g. clean editorial composition, warm sunset lighting, shallow depth of field, subtle geometric background..."
          helpText="Overrides the default visual style instruction for the image model."
        />

        <div>
          <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary mb-2">File Upload</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => onUpload(e.target.files)}
            className="file-input-hidden"
          />
          <motion.button
            whileHover={{ scale: 1.002 }}
            whileTap={{ scale: 0.998 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl border-2 border-dashed border-border-warm bg-card/60 text-secondary text-[13px] font-medium hover:border-gold hover:bg-card transition-all duration-200 cursor-pointer"
          >
            <Upload size={18} strokeWidth={1.6} className="text-gold" />
            <span>Click to upload files</span>
          </motion.button>
          {uploadedFileRefs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {uploadedFileRefs.map((ref, i) => (
                <FileTag key={ref} name={ref} onRemove={() => onRemoveFile(i)} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 pt-3">
          <Button variant="espresso" loading={busy} onClick={onStartManual}>
            <Play size={14} /> Start manual run
          </Button>
          <Button variant="secondary" loading={busy} onClick={onStartDaily}>
            <Zap size={14} /> Daily run
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
