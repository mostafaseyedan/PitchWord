import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  onChange: (value: string) => void;
}

export const InputField = ({ label, onChange, id, ...rest }: InputFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label className="field-label !mb-0" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        className="h-10 w-full px-4 text-[14px] font-normal leading-5 text-[color:var(--primary-text-color)] bg-[color:var(--secondary-background-color)] border border-[color:var(--ui-border-color)] rounded-[var(--border-radius-small)] outline-none transition-colors duration-150 hover:border-[color:var(--primary-text-color)] focus:border-[color:var(--primary-color)] placeholder:text-[color:var(--secondary-text-color)] placeholder:opacity-55 disabled:bg-[color:var(--disabled-background-color)] disabled:text-[color:var(--disabled-text-color)] disabled:border-transparent disabled:cursor-not-allowed read-only:bg-[color:var(--allgrey-background-color)] read-only:border-transparent read-only:cursor-default"
        id={id}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
};
