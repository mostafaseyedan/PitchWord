interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  tooltip?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const useFullWidth = options.length <= 4;

  return (
    <div className="segmented-control-wrap">
      <div
        role="group"
        aria-label={label}
        className={`${useFullWidth ? "w-full" : "segmented-control-inline"} h-10 flex items-center bg-[color:var(--secondary-background-color)] rounded-[var(--border-radius-medium)] p-1 border border-[color:var(--ui-border-color)]`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              title={option.tooltip}
              aria-pressed={isSelected}
              className={`relative h-8 px-4 text-[12px] font-semibold tracking-[0.005em] rounded-[var(--border-radius-small)] transition-all duration-200 outline-none ${
                useFullWidth ? "flex-1 text-center" : "whitespace-nowrap"
              } ${
                isSelected
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(27,54,93,0.22)]"
                  : "text-secondary hover:bg-[color:var(--primary-selected-color)] hover:text-[color:var(--primary-color)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
