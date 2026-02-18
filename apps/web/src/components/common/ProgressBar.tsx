import * as Progress from "@radix-ui/react-progress";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
}

export const ProgressBar = ({ value, showLabel = true }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3 my-[18px]">
      <Progress.Root
        value={clamped}
        className="flex-1 h-2 rounded-pill bg-border/40 overflow-hidden border border-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
      >
        <Progress.Indicator
          className="h-full rounded-pill bg-gradient-to-r from-gold to-sage overflow-hidden relative transition-[width] duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        >
          {/* Layered Stripe Pattern */}
          <div className="absolute inset-0 bg-striped opacity-30" />
        </Progress.Indicator>
      </Progress.Root>
      {showLabel ? (
        <span className="text-[13px] font-medium text-secondary tabular-nums min-w-[40px] text-right tracking-tight">
          {clamped}%
        </span>
      ) : null}
    </div>
  );
};
