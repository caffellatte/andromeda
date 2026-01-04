import { DisabledTooltip } from "./DisabledTooltip";
import { Display } from "./Display";
import { Label } from "./Label";
import { disabledSurfaceClass } from "./utils";

type MeterProps = {
  value: number;
  min?: number;
  max?: number;
  orientation?: "horizontal" | "vertical";
  width?: number | string;
  height?: number | string;
  label?: string;
  unit?: string;
  showValue?: boolean;
  disabled?: boolean;
  tooltipText?: string;
  className?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function Meter({
  value,
  min = 0,
  max = 1,
  orientation = "horizontal",
  width = "12rem",
  height = "var(--ui-space-3)",
  label,
  unit,
  showValue = false,
  disabled = false,
  tooltipText = "Disabled",
  className = "",
}: MeterProps) {
  const safeRange = Math.max(max - min, Number.EPSILON);
  const normalized = clamp((value - min) / safeRange, 0, 1);

  return (
    <div className={`group relative select-none ${className}`}>
      {label ? (
        <Label
          text={label}
          size="sm"
          tracking="sm"
          disabled={disabled}
          className="mb-[var(--ui-space-2)]"
        />
      ) : null}
      {disabled ? <DisabledTooltip text={tooltipText} /> : null}
      <div
        role="meter"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className={`relative overflow-hidden rounded-full border border-white/10 ${disabledSurfaceClass(
          disabled,
        )} ${
          disabled ? "bg-[var(--ui-disabled-bg)]" : "bg-zinc-900/80"
        }`}
        style={{
          width,
          height,
        }}
      >
        <div
          className={`absolute left-0 ${orientation === "vertical" ? "bottom-0" : "top-0"} ${
            disabled
              ? "bg-[var(--ui-disabled-fg)]"
              : "bg-amber-200/80 shadow-[0_0_10px_rgba(252,211,77,0.5)]"
          }`}
          style={{
            width: orientation === "vertical" ? "100%" : `${normalized * 100}%`,
            height: orientation === "vertical" ? `${normalized * 100}%` : "100%",
          }}
        />
      </div>
      {showValue ? (
        <Display
          value={value.toFixed(2)}
          unit={unit}
          size="sm"
          disabled={disabled}
          className="mt-[var(--ui-space-1)]"
        />
      ) : null}
    </div>
  );
}
