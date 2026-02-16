import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  onChange: (value: string) => void;
}

export const InputField = ({ label, onChange, id, ...rest }: InputFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="text-[12px] font-medium tracking-[0.01em] text-secondary" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        className="w-full px-5 py-3.5 text-[14px] font-medium leading-[1.25] text-primary bg-white border border-border/60 rounded-full outline-none shadow-[inset_0_2px_4px_rgba(31,53,88,0.02),0_2px_8px_rgba(31,53,88,0.02)] transition-[background-color,border-color,box-shadow] duration-200 focus:border-gold/40 focus:ring-4 focus:ring-gold/5 focus:shadow-[0_8px_24px_rgba(31,53,88,0.08)] placeholder:text-[12px] placeholder:font-light placeholder:text-muted/60"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
};
