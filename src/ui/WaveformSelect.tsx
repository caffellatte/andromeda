import { DisabledTooltip } from "./DisabledTooltip";
import { Label } from "./Label";
import { disabledSurfaceClass } from "./utils";

type WaveformSelectProps = {
  value?: string;
  defaultValue?: string;
  options?: string[];
  label?: string;
  disabled?: boolean;
  tooltipText?: string;
  onChange?: (value: string) => void;
  className?: string;
};

const defaultOptions = ["sine", "triangle", "saw", "square"];

export function WaveformSelect({
  value,
  defaultValue,
  options = defaultOptions,
  label = "Waveform",
  disabled = false,
  tooltipText = "Disabled",
  onChange,
  className = "",
}: WaveformSelectProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? value ?? options[0] ?? "sine",
  );
  const currentValue = isControlled ? value ?? internalValue : internalValue;

  const updateValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  return (
    <section className={`group relative w-full ${className}`}>
      {label ? (
        <Label
          text={label}
          size="sm"
          tracking="sm"
          disabled={disabled}
          className="mb-[var(--ui-space-3)]"
        />
      ) : null}
      {disabled ? <DisabledTooltip text={tooltipText} /> : null}
      <div className="grid grid-cols-2 gap-[var(--ui-space-2)]">
        {options.map((option) => {
          const isActive = option === currentValue;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => updateValue(option)}
              className={`h-9 rounded-[var(--ui-radius-1)] border border-white/10 text-[0.6rem] uppercase tracking-[var(--ui-letter-1)] transition ${disabledSurfaceClass(
                disabled,
              )} ${
                isActive
                  ? "bg-amber-200/15 text-amber-100"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
