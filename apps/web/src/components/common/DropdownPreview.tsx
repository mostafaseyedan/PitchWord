import type { ReactNode } from "react";

interface FontPreviewOption {
  label: string;
  previewFontFamily?: string;
}

interface ColorSwatchStripProps {
  swatches: string[];
}

export const renderFontPreviewLabel = (option: FontPreviewOption): ReactNode => (
  <span
    className="text-[13px] font-medium text-primary"
    style={option.previewFontFamily ? { fontFamily: option.previewFontFamily } : undefined}
  >
    {option.label}
  </span>
);

export const ColorSwatchStrip = ({ swatches }: ColorSwatchStripProps): ReactNode => (
  <span className="inline-flex items-center gap-1.5">
    {swatches.map((color) => (
      <span
        key={color}
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-[2px] border border-black/15"
        style={{ backgroundColor: color }}
      />
    ))}
  </span>
);
