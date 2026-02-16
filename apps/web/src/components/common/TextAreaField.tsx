import type { TextareaHTMLAttributes } from "react";

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  helpText?: string;
  onChange: (value: string) => void;
}

export const TextAreaField = ({ label, helpText, onChange, id, ...rest }: TextAreaFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="text-[12px] font-medium tracking-[0.01em] text-secondary" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea
        className="w-full px-5 py-3 text-[14px] font-medium leading-relaxed text-primary bg-white border border-border/60 rounded-[24px] outline-none resize-none min-h-[52px] shadow-[inset_0_2px_4px_rgba(31,53,88,0.02),0_2px_8px_rgba(31,53,88,0.02)] transition-all duration-300 focus:min-h-[120px] focus:py-4 focus:border-gold/40 focus:ring-4 focus:ring-gold/5 focus:shadow-[0_8px_24px_rgba(31,53,88,0.08)] placeholder:text-[12px] placeholder:font-light placeholder:text-muted/60"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      {helpText ? <span className="text-[11px] tracking-[0.01em] text-muted">{helpText}</span> : null}
    </div>
  );
};
