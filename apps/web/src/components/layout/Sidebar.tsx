import { LayoutGrid, Clock, BarChart3, Send } from "lucide-react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";

type ViewName = "dashboard" | "preview" | "logs";

interface SidebarProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
}

const navItems: { view: ViewName; label: string; icon: typeof LayoutGrid }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { view: "preview", label: "Studio", icon: Send },
  { view: "logs", label: "Analytics", icon: BarChart3 },
];

export const Sidebar = ({ activeView, onNavigate }: SidebarProps) => {
  return (
    <Tooltip.Provider delayDuration={220}>
      <nav
        className="sidebar-dock fixed left-[var(--sidebar-left)] top-1/2 -translate-y-1/2 z-[9999] h-[var(--sidebar-height)] w-[var(--sidebar-width)] flex flex-col items-center justify-between rounded-[var(--sidebar-radius)] bg-sidebar/95 backdrop-blur-xl px-3 py-8 shadow-float border border-border-warm"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          const Icon = item.icon;
          return (
            <Tooltip.Root key={item.view}>
              <Tooltip.Trigger asChild>
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`relative z-[10000] pointer-events-auto cursor-pointer flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${isActive
                    ? "bg-espresso text-white shadow-[0_8px_16px_rgba(59,52,43,0.2)]"
                    : "bg-transparent text-secondary hover:bg-espresso/10 hover:text-primary"
                    }`}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onNavigate(item.view)}
                  type="button"
                >
                  <Icon size={20} strokeWidth={1.8} />
                </motion.button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={10}
                  className="z-[100000] rounded-xl bg-card-warm px-3 py-1.5 text-[12px] font-medium text-primary border border-border-warm shadow-[0_8px_24px_rgba(43,36,22,0.08)]"
                >
                  {item.label}
                  <Tooltip.Arrow className="fill-card-warm" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </nav>
    </Tooltip.Provider>
  );
};

export type { ViewName };
