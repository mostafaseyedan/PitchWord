import { useRef } from "react";
import type { LibraryAsset } from "@marketing/shared";
import { Upload } from "lucide-react";

interface ReferenceGalleryProps {
  assets: LibraryAsset[];
  selectedIds: string[];
  onToggle: (assetId: string) => void;
  onUpload: (files: FileList | null) => void;
  busy?: boolean;
  maxSelectable?: number;
}

export const ReferenceGallery = ({
  assets,
  selectedIds,
  onToggle,
  onUpload,
  busy = false,
  maxSelectable = 14
}: ReferenceGalleryProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[12px] font-medium tracking-[0.01em] text-secondary">Reference Gallery</label>
        <span className="text-[11px] text-secondary/70">{selectedIds.length}/{maxSelectable} selected</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => onUpload(e.target.files)}
        className="file-input-hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl border-2 border-dashed border-border-warm bg-card/60 text-secondary text-[13px] font-medium hover:border-gold hover:bg-card transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Upload size={18} strokeWidth={1.6} className="text-gold" />
        <span>Upload reference images</span>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
        {assets.map((asset) => {
          const selected = selectedIds.includes(asset.id);
          const disabled = !selected && selectedIds.length >= maxSelectable;
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onToggle(asset.id)}
              disabled={disabled}
              className={`relative rounded-xl overflow-hidden border transition-all ${
                selected
                  ? "border-gold ring-2 ring-gold/20"
                  : "border-border-warm/40 hover:border-gold/40"
              } ${disabled ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}`}
              title={asset.title}
            >
              <img src={asset.uri} alt={asset.title} className="w-full h-24 object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-black/45 text-white text-[10px] px-2 py-1 truncate">{asset.title}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
