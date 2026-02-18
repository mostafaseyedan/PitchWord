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
        <label className="field-label !mb-0" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea
        className="w-full min-h-[96px] px-4 py-2 text-[14px] font-normal leading-5 text-[color:var(--primary-text-color)] bg-[color:var(--secondary-background-color)] border border-[color:var(--ui-border-color)] rounded-[var(--border-radius-small)] outline-none resize-y transition-colors duration-150 hover:border-[color:var(--primary-text-color)] focus:border-[color:var(--primary-color)] placeholder:text-[color:var(--secondary-text-color)] placeholder:opacity-55 disabled:bg-[color:var(--disabled-background-color)] disabled:text-[color:var(--disabled-text-color)] disabled:border-transparent disabled:resize-none disabled:cursor-not-allowed read-only:bg-[color:var(--allgrey-background-color)] read-only:border-transparent read-only:resize-none read-only:cursor-default"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      {helpText ? <span className="text-[12px] leading-4 text-secondary">{helpText}</span> : null}
    </div>
  );
};
