import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  accent?: "gold" | "sage" | "sky" | "coral" | "plum";
}

export const MetricCard = ({ label, value, icon: Icon, accent = "gold" }: MetricCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col gap-0.5"
    >
      <div className="flex items-end gap-3">
        {Icon && (
          <div className={`p-2 rounded-xl bg-page/80 border border-border-warm/30 shadow-sm mb-2 text-${accent}`}>
            <Icon size={18} strokeWidth={1.5} />
          </div>
        )}
        <span className="text-[48px] font-normal text-primary leading-none tabular-nums tracking-[-0.05em]">
          {value}
        </span>
      </div>
      <div className="text-label-small opacity-50 pl-1">
        {label}
      </div>
    </motion.div>
  );
};
