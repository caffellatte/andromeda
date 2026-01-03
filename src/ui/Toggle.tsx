import { useState } from "react";
import { DisabledTooltip } from "./DisabledTooltip";
import { Label } from "./Label";
import { disabledSurfaceClass } from "./utils";

type ToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
};

const sizeMap = {
  sm: {
    trackWidth: "var(--ui-size-1)",
    trackHeight: "var(--ui-space-4)",
    thumbSize: "var(--ui-space-3)",
  },
  md: {
    trackWidth: "var(--ui-size-2)",
    trackHeight: "var(--ui-space-5)",
    thumbSize: "var(--ui-space-4)",
  },
  lg: {
    trackWidth: "var(--ui-size-3)",
    trackHeight: "var(--ui-size-1)",
    thumbSize: "var(--ui-space-5)",
  },
};

export function Toggle({
  checked,
  defaultChecked,
  size = "md",
  label,
  disabled = false,
  onChange,
  className = "",
}: ToggleProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isOn = isControlled ? checked ?? false : internalChecked;
  const { trackWidth, trackHeight, thumbSize } = sizeMap[size];

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  return (
    <div className={`group relative select-none ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex items-center rounded-full border border-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 ${disabledSurfaceClass(
          disabled,
        )} ${disabled ? "bg-[var(--ui-disabled-bg)]" : "bg-zinc-900/80"}`}
        style={{ width: trackWidth, height: trackHeight }}
      >
        <span
          className={`absolute left-[var(--ui-space-1)] top-1/2 -translate-y-1/2 rounded-full border border-white/10 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.9)] transition ${
            disabled
              ? "bg-[var(--ui-disabled-fg)]"
              : isOn
                ? "translate-x-full bg-amber-200"
                : "bg-zinc-700"
          }`}
          style={{
            width: thumbSize,
            height: thumbSize,
            transform: isOn
              ? "translate(100%, -50%)"
              : "translate(0, -50%)",
          }}
        />
        <span
          className={`absolute inset-0 rounded-full transition ${
            isOn ? "bg-amber-200/10" : "bg-zinc-900/80"
          }`}
        />
      </button>
      {disabled ? <DisabledTooltip /> : null}
      {label ? (
        <Label text={label} disabled={disabled} className="mt-[var(--ui-space-3)]" />
      ) : null}
    </div>
  );
}
