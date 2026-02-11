import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: 16, md: 24, lg: 36 };

export const Spinner = ({ size = "md" }: SpinnerProps) => {
  return (
    <Loader2
      size={sizes[size]}
      className="animate-spin text-gold"
      role="status"
      aria-label="Loading"
    />
  );
};
