import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";

interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  tooltip?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <ToggleGroup.Root
        type="single"
        value={String(value)}
        onValueChange={(v: string) => {
          if (!v) return;
          const selected = options.find((opt) => String(opt.value) === v);
          if (selected) {
            onChange(selected.value);
          }
        }}
        className="inline-flex flex-wrap gap-1 rounded-pill bg-white/72 p-1 border border-[#d6e2f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(26,26,46,0.04)]"
        aria-label={label}
      >
        {options.map((opt) => {
          const isActive = opt.value === value;
          const item = (
            <ToggleGroup.Item
              key={opt.value}
              value={String(opt.value)}
              className={`relative px-4 py-2 text-[12px] font-semibold tracking-[0.005em] rounded-pill transition-colors duration-200 outline-none ${
                isActive ? "text-white" : "text-secondary hover:text-primary"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={label ?? "seg"}
                  className="absolute inset-0 rounded-pill bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_16px_rgba(31,53,88,0.26)]"
                  transition={{ type: "spring", stiffness: 560, damping: 32, mass: 0.5 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </ToggleGroup.Item>
          );

          if (!opt.tooltip) return item;

          return (
            <Tooltip.Root key={opt.value}>
              <Tooltip.Trigger asChild>{item}</Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="top"
                  sideOffset={10}
                  className="z-[100000] max-w-[560px] rounded-xl bg-card-warm px-3 py-1.5 text-[12px] font-medium text-primary border border-border-warm shadow-[0_8px_24px_rgba(31,53,88,0.08)]"
                >
                  {opt.tooltip?.split("\n").map((line, i) => (
                    <span key={i}>{i > 0 && <br />}{line}</span>
                  ))}
                  <Tooltip.Arrow className="fill-card-warm" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </ToggleGroup.Root>
    </Tooltip.Provider>
  );
}
