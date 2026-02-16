import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "espresso";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-white shadow-sm hover:bg-primary hover:text-white active:scale-[0.985]",
  secondary:
    "bg-white text-primary border border-border-warm shadow-sm hover:bg-page hover:border-gold/30 active:scale-[0.985]",
  ghost:
    "text-primary hover:bg-primary/5 active:scale-[0.985]",
  espresso:
    "bg-primary text-white shadow-[0_8px_16px_rgba(31,53,88,0.2)] hover:bg-primary/95 active:scale-[0.985]",
};

export const Button = ({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-pill px-6 py-2.5 text-[13px] font-medium tracking-tight transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
};
