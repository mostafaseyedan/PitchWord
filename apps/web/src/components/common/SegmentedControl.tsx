import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { motion } from "framer-motion";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v: string) => {
        if (v) onChange(v as T);
      }}
      className="inline-flex flex-wrap gap-1 rounded-pill bg-white/72 p-1 border border-[#e8dfcf] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(26,26,46,0.04)]"
      aria-label={label}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <ToggleGroup.Item
            key={opt.value}
            value={opt.value}
            className={`relative px-4 py-2 text-[12px] font-semibold tracking-[0.005em] rounded-pill transition-colors duration-200 outline-none ${
              isActive ? "text-[#fff9ee]" : "text-[#7a7c87] hover:text-[#2d2f39]"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={label ?? "seg"}
                className="absolute inset-0 rounded-pill bg-[#3b342b] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_16px_rgba(59,52,43,0.26)]"
                transition={{ type: "spring", stiffness: 560, damping: 32, mass: 0.5 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
}
