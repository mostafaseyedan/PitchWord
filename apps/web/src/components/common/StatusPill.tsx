import type { RunStatus } from "@marketing/shared";

const statusConfig: Record<RunStatus, { dot: string; bg: string; text: string }> = {
  queued: { dot: "bg-secondary", bg: "bg-border", text: "text-secondary" },
  researching: { dot: "bg-sky", bg: "bg-card-sky", text: "text-sky" },
  drafting: { dot: "bg-plum", bg: "bg-plum/10", text: "text-plum" },
  image_generation: { dot: "bg-gold", bg: "bg-gold/10", text: "text-[#7c6630]" },
  video_generation: { dot: "bg-plum", bg: "bg-plum/10", text: "text-plum" },
  review_ready: { dot: "bg-gold-hover", bg: "bg-gold/10", text: "text-[#7c6630]" },
  posted: { dot: "bg-sage", bg: "bg-card-sage", text: "text-sage" },
  failed: { dot: "bg-coral", bg: "bg-card-blush", text: "text-coral" },
};

export const StatusPill = ({ status }: { status: RunStatus }) => {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium tracking-[0.05em] rounded-pill whitespace-nowrap ${c.bg} ${c.text} border border-border-warm/10`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {status.replaceAll("_", " ")}
    </span>
  );
};
