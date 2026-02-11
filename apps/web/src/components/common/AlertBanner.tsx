import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  type?: "error" | "warning" | "info" | "success";
  children: ReactNode;
  onClose?: () => void;
}

const config = {
  error:   { bg: "bg-card-blush", border: "border-l-coral",  icon: AlertCircle,   iconColor: "text-coral" },
  warning: { bg: "bg-card-gold",  border: "border-l-gold",   icon: AlertTriangle, iconColor: "text-gold" },
  info:    { bg: "bg-card-sky",   border: "border-l-sky",    icon: Info,          iconColor: "text-sky" },
  success: { bg: "bg-card-sage",  border: "border-l-sage",   icon: CheckCircle,   iconColor: "text-sage" },
};

export const AlertBanner = ({ type = "error", children, onClose }: AlertBannerProps) => {
  const c = config[type];
  const Icon = c.icon;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`flex items-start gap-3 px-5 py-4 rounded-2xl border-l-4 mb-6 ${c.bg} ${c.border}`}
        role="alert"
      >
        <Icon size={18} className={`shrink-0 mt-0.5 ${c.iconColor}`} />
        <div className="flex-1 text-[15px] text-primary">{children}</div>
        {onClose ? (
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors" aria-label="Dismiss">
            <X size={16} />
          </button>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
};
