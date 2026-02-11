import * as Progress from "@radix-ui/react-progress";
import { motion } from "framer-motion";

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
        <Progress.Indicator asChild>
          <motion.div
            className="h-full rounded-pill bg-gradient-to-r from-gold to-sage overflow-hidden relative"
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Layered Stripe Pattern */}
            <div className="absolute inset-0 bg-striped opacity-30" />
          </motion.div>
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
