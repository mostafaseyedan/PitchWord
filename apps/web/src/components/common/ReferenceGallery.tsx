import { type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LibraryAsset } from "@marketing/shared";
import { Check, Download, Eye, Upload, X } from "lucide-react";

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
  const [viewerAsset, setViewerAsset] = useState<LibraryAsset | null>(null);

  const handleDeselectAll = () => {
    for (const assetId of selectedIds) {
      onToggle(assetId);
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewerAsset(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const getAssetFilename = (asset: LibraryAsset): string => {
    const sanitizedTitle = asset.title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 60);
    const extension = asset.mimeType.split("/")[1]?.split("+")[0] ?? "png";
    if (sanitizedTitle.length > 0) {
      return sanitizedTitle.includes(".") ? sanitizedTitle : `${sanitizedTitle}.${extension}`;
    }
    return `${asset.id}.${extension}`;
  };

  const handleDownload = async (asset: LibraryAsset) => {
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getAssetFilename(asset);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="field-label !mb-0">Reference Gallery</label>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-secondary/70">{selectedIds.length}/{maxSelectable} selected</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            disabled={busy || selectedIds.length === 0}
            className="text-[11px] font-medium text-secondary/75 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Deselect all
          </button>
        </div>
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
        className="inline-flex items-center justify-center gap-2 w-[122px] max-w-full px-3 py-2 rounded-[var(--border-radius-small)] border border-transparent bg-primary text-white text-[11px] font-semibold shadow-[0_4px_12px_rgba(27,54,93,0.22)] hover:bg-[#162f4f] hover:shadow-[0_8px_18px_rgba(27,54,93,0.28)] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Upload size={14} strokeWidth={2} className="text-white/90" />
        <span>Upload</span>
      </button>

      <div className="columns-4 sm:columns-6 [column-gap:0.5rem]">
        {assets.map((asset) => {
          const selected = selectedIds.includes(asset.id);
          const disabled = !selected && selectedIds.length >= maxSelectable;
          return (
            <div
              key={asset.id}
              className={`group relative mb-2 [break-inside:avoid] rounded-[var(--border-radius-small)] overflow-hidden border-2 shadow-[0_2px_8px_rgba(31,53,88,0.08)] transition-all ${
                selected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border-warm/70 hover:border-primary/45"
              } ${disabled ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}`}
              title={asset.title}
            >
              <button
                type="button"
                onClick={() => onToggle(asset.id)}
                disabled={disabled}
                className="block w-full text-left"
                aria-label={selected ? `Deselect ${asset.title}` : `Select ${asset.title}`}
              >
                <img src={asset.uri} alt={asset.title} className="block w-full h-auto object-contain" />
                <span className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-150 group-hover:bg-primary/10" />
              </button>
              <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setViewerAsset(asset);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--border-radius-small)] border border-white/30 bg-primary/85 text-white hover:bg-primary"
                  aria-label={`View ${asset.title}`}
                >
                  <Eye size={13} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void handleDownload(asset);
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--border-radius-small)] border border-white/30 bg-primary/85 text-white hover:bg-primary"
                  aria-label={`Download ${asset.title}`}
                >
                  <Download size={13} />
                </button>
              </span>
              {selected ? (
                <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white shadow-[0_4px_10px_rgba(27,54,93,0.2)]">
                  <Check size={12} strokeWidth={2.4} />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {viewerAsset ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-12 bg-primary/90 backdrop-blur-xl cursor-zoom-out"
            onClick={() => setViewerAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(event: ReactMouseEvent) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setViewerAsset(null)}
                className="absolute -top-12 right-0 inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors px-2 py-1 text-[12px] font-semibold"
              >
                <X size={14} />
                Close
              </button>
              <button
                type="button"
                onClick={() => void handleDownload(viewerAsset)}
                className="absolute -top-12 right-[74px] inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors px-2 py-1 text-[12px] font-semibold"
              >
                <Download size={14} />
                Download
              </button>
              <img
                src={viewerAsset.uri}
                alt={viewerAsset.title}
                className="max-w-full max-h-[85vh] object-contain rounded-[var(--border-radius-medium)] shadow-2xl"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
