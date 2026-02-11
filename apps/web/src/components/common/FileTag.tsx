import { Paperclip, X } from "lucide-react";

interface FileTagProps {
  name: string;
  onRemove?: () => void;
}

export const FileTag = ({ name, onRemove }: FileTagProps) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-card-warm border border-border rounded-pill text-[11px] text-primary">
      <Paperclip size={12} className="text-muted" />
      <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
      {onRemove ? (
        <button onClick={onRemove} className="text-muted hover:text-coral transition-colors" aria-label={`Remove ${name}`}>
          <X size={12} />
        </button>
      ) : null}
    </span>
  );
};
