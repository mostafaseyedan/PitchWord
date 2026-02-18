import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button as VibeButton } from "@vibe/core";

type ButtonVariant = "primary" | "secondary" | "ghost" | "espresso";
type ButtonSize = "xxs" | "xs" | "small" | "medium" | "large";
type VibeButtonColor =
  | "primary"
  | "positive"
  | "negative"
  | "inverted"
  | "on-primary-color"
  | "on-inverted-background"
  | "brand"
  | "fixed-light"
  | "fixed-dark";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
  color?: VibeButtonColor;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "",
  secondary: "",
  ghost: "",
  espresso: "",
};

const vibeKindByVariant: Record<ButtonVariant, "primary" | "secondary" | "tertiary"> = {
  primary: "primary",
  secondary: "secondary",
  ghost: "tertiary",
  espresso: "primary",
};

const vibeColorByVariant: Record<ButtonVariant, VibeButtonColor> = {
  primary: "brand",
  secondary: "primary",
  ghost: "primary",
  espresso: "brand",
};

export const Button = ({
  variant = "primary",
  size = "small",
  loading = false,
  disabled,
  children,
  color,
  className = "",
  ...rest
}: ButtonProps) => {
  const kind = vibeKindByVariant[variant];
  const resolvedColor = color ?? vibeColorByVariant[variant];

  return (
    <VibeButton
      kind={kind}
      color={resolvedColor}
      size={size}
      className={`${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...(rest as any)}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </VibeButton>
  );
};
