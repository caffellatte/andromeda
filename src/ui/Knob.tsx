import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Display } from "./Display";
import { DisabledTooltip } from "./DisabledTooltip";
import { Label } from "./Label";
import { disabledSurfaceClass } from "./utils";

type KnobProps = {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: number | string;
  label?: string;
  unit?: string;
  precision?: number;
  indicatorOffset?: number;
  disabled?: boolean;
  tooltipText?: string;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  className?: string;
};

type DragState = {
  startY: number;
  startValue: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundToStep = (value: number, step: number, min: number) => {
  if (step <= 0) return value;
  const snapped = Math.round((value - min) / step) * step + min;
  return Number(snapped.toFixed(8));
};

const getPrecision = (step: number) => {
  const stepText = step.toString();
  if (!stepText.includes(".")) return 0;
  return Math.min(6, stepText.split(".")[1]?.length ?? 0);
};

export function Knob({
  value,
  defaultValue,
  min = 0,
  max = 1,
  step = 0.01,
  size = "var(--ui-size-3)",
  label,
  unit,
  precision,
  indicatorOffset = 0,
  disabled = false,
  tooltipText = "Disabled",
  onChange,
  onChangeEnd,
  className = "",
}: KnobProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? value ?? min,
  );
  const dragRef = useRef<DragState | null>(null);
  const currentValue = isControlled ? value ?? min : internalValue;

  const safeRange = Math.max(max - min, Number.EPSILON);
  const normalized = clamp((currentValue - min) / safeRange, 0, 1);
  const angle = -135 + normalized * 270;

  const effectivePrecision = useMemo(() => {
    if (precision !== undefined) return precision;
    return getPrecision(step);
  }, [precision, step]);

  const emitChange = (next: number) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const updateValue = (next: number) => {
    const clamped = clamp(next, min, max);
    const stepped = roundToStep(clamped, step, min);
    emitChange(stepped);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startY: event.clientY, startValue: currentValue };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!dragRef.current) return;
    const delta = dragRef.current.startY - event.clientY;
    const sensitivity = safeRange / 150;
    updateValue(dragRef.current.startValue + delta * sensitivity);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    onChangeEnd?.(currentValue);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let delta = 0;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") delta = step;
    if (event.key === "ArrowDown" || event.key === "ArrowLeft") delta = -step;
    if (event.key === "PageUp") delta = step * 10;
    if (event.key === "PageDown") delta = -step * 10;
    if (event.key === "Home") {
      event.preventDefault();
      updateValue(min);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      updateValue(max);
      return;
    }
    if (delta !== 0) {
      event.preventDefault();
      updateValue(currentValue + delta);
    }
  };

  const displayValue = currentValue.toFixed(effectivePrecision);

  const indicatorTranslate = -85 + indicatorOffset;

  return (
    <div className={`group relative select-none ${className}`}>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ?? "Knob"}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(currentValue.toFixed(effectivePrecision))}
        aria-disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className={`group relative grid place-items-center rounded-full border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),_0_8px_20px_-12px_rgba(0,0,0,0.9)] outline-none transition focus-visible:ring-2 focus-visible:ring-amber-300/70 ${disabledSurfaceClass(
          disabled,
        )} ${disabled ? "bg-[var(--ui-disabled-bg)] opacity-70" : "bg-zinc-900/80"}`}
        style={{ width: size, height: size }}
      >
        <div
          className={`absolute inset-[var(--ui-space-2)] rounded-full ${
            disabled ? "bg-[var(--ui-disabled-bg)]" : "bg-zinc-950/70"
          }`}
        />
        <div
          className={`absolute left-1/2 top-1/2 h-[38%] w-[2px] rounded-full transition-transform ${
            disabled
              ? "bg-[var(--ui-disabled-fg)] shadow-none"
              : "bg-amber-200 shadow-[0_0_10px_rgba(252,211,77,0.65)]"
          }`}
          style={{
            transform: `translate(-50%, ${indicatorTranslate}%) rotate(${angle}deg)`,
          }}
        />
        <div
          className={`absolute inset-[var(--ui-space-3)] rounded-full border border-white/10 ${
            disabled ? "bg-[var(--ui-disabled-bg)]" : "bg-zinc-900/80"
          }`}
        />
      </div>
      {disabled ? <DisabledTooltip text={tooltipText} /> : null}
      {label ? (
        <Label
          text={label}
          disabled={disabled}
          className="mt-[var(--ui-space-3)]"
        />
      ) : null}
      <Display
        value={displayValue}
        unit={unit}
        size="sm"
        disabled={disabled}
        className="mt-[var(--ui-space-1)]"
      />
    </div>
  );
}
