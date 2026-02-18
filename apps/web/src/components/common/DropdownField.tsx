import type { ReactNode } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

interface DropdownOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
  leftRenderer?: ReactNode;
  startElement?: { type?: string; render?: () => ReactNode };
  [key: string]: unknown;
}

interface DropdownFieldProps<T extends string | number> {
  id: string;
  label?: string;
  reserveLabelSpace?: boolean;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  optionRenderer?: (option: any) => ReactNode;
  valueRenderer?: ReactNode | ((option: any) => ReactNode);
}

export function DropdownField<T extends string | number>({
  id,
  label,
  reserveLabelSpace = false,
  options,
  value,
  onChange,
  ariaLabel,
  optionRenderer,
  valueRenderer,
}: DropdownFieldProps<T>) {
  const selectedValue = String(value);
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0] ?? null;
  const optionLookup = new Map<string, DropdownOption<T>>(
    options.map((option) => [String(option.value), option])
  );

  const getOptionLeading = (option: DropdownOption<T>): ReactNode => {
    if (option.leftRenderer) return option.leftRenderer;
    if (option.startElement?.type === "custom" && option.startElement.render) {
      return option.startElement.render();
    }
    return null;
  };

  const renderOptionMain = (option: DropdownOption<T>): ReactNode =>
    optionRenderer ? optionRenderer(option) : <span className="text-[13px] font-medium text-primary">{option.label}</span>;

  const selectedValueContent = (() => {
    if (!selectedOption) return null;
    if (typeof valueRenderer === "function") return valueRenderer(selectedOption);
    if (valueRenderer) return valueRenderer;
    return renderOptionMain(selectedOption);
  })();

  return (
    <div className="dropdown-field-compact">
      {label ? (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      ) : reserveLabelSpace ? (
        <span className="field-label invisible" aria-hidden="true">
          Label
        </span>
      ) : null}
      <Select.Root
        value={selectedValue}
        onValueChange={(newValue: string) => {
          const nextOption = optionLookup.get(newValue);
          if (!nextOption) return;
          onChange(nextOption.value);
        }}
      >
        <Select.Trigger
          id={id}
          aria-label={ariaLabel ?? label ?? id}
          className="group flex h-10 w-full items-center justify-between gap-2 rounded-[var(--border-radius-small)] border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] px-2.5 text-left transition-colors hover:border-[color:var(--primary-text-color)] focus-visible:border-[color:var(--primary-color)] focus-visible:outline-none"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedOption && getOptionLeading(selectedOption) ? (
              <span className="shrink-0">{getOptionLeading(selectedOption)}</span>
            ) : null}
            <span className="truncate">
              {selectedOption ? selectedValueContent : <span className="text-[13px] text-secondary/55">Select</span>}
            </span>
            <Select.Value className="sr-only" />
          </span>
          <Select.Icon>
            <ChevronDown size={16} className="shrink-0 text-secondary/70 transition-transform group-data-[state=open]:rotate-180" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            align="start"
            className="z-[100001] overflow-hidden rounded-[var(--border-radius-medium)] border border-[color:var(--ui-border-color)] bg-[color:var(--secondary-background-color)] shadow-[0_14px_32px_rgba(24,38,58,0.18)]"
          >
            <Select.Viewport className="max-h-[280px] p-1 min-w-[var(--radix-select-trigger-width)]">
              {options.map((option) => (
                <Select.Item
                  key={`${id}-${option.value}`}
                  value={String(option.value)}
                  disabled={option.disabled}
                  className="relative flex w-full cursor-default select-none items-center justify-between gap-2 rounded-[var(--border-radius-small)] px-2 py-1.5 text-left outline-none data-[state=checked]:bg-[color:var(--primary-selected-color)] data-[disabled]:opacity-45 data-[disabled]:pointer-events-none data-[highlighted]:bg-[color:var(--primary-background-hover-color)]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {getOptionLeading(option) ? (
                      <span className="shrink-0">{getOptionLeading(option)}</span>
                    ) : null}
                    <span className="truncate">{renderOptionMain(option)}</span>
                    <Select.ItemText>
                      <span className="sr-only">{option.label}</span>
                    </Select.ItemText>
                  </span>
                  <Select.ItemIndicator>
                    <Check size={14} className="shrink-0 text-[color:var(--primary-color)]" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
