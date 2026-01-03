import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Display } from "./Display";
import { Label } from "./Label";
import { disabledSurfaceClass } from "./utils";

type SliderProps = {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  width?: number | string;
  height?: number | string;
  orientation?: "horizontal" | "vertical";
  thickness?: number | string | "sm" | "md" | "lg";
  trackHeight?: number | string | "sm" | "md" | "lg";
  thumbSize?: number | string | "sm" | "md" | "lg";
  label?: string;
  unit?: string;
  precision?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  className?: string;
};

type DragState = {
  rect: DOMRect;
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

const resolvePreset = (
  value: number | string | "sm" | "md" | "lg",
  map: Record<"sm" | "md" | "lg", string>,
) => {
  if (value === "sm" || value === "md" || value === "lg") {
    return map[value];
  }
  return value;
};

export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 1,
  step = 0.01,
  width = "14rem",
  height = "10rem",
  orientation = "horizontal",
  thickness = "md",
  trackHeight = "md",
  thumbSize = "md",
  label,
  unit,
  precision,
  disabled = false,
  onChange,
  onChangeEnd,
  className = "",
}: SliderProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? value ?? min,
  );
  const dragRef = useRef<DragState | null>(null);
  const currentValue = isControlled ? value ?? min : internalValue;

  const safeRange = Math.max(max - min, Number.EPSILON);
  const normalized = clamp((currentValue - min) / safeRange, 0, 1);
  const resolvedThickness = resolvePreset(thickness, {
    sm: "var(--ui-thickness-sm)",
    md: "var(--ui-thickness-md)",
    lg: "var(--ui-thickness-lg)",
  });
  const resolvedTrackHeight = resolvePreset(trackHeight, {
    sm: "var(--ui-track-sm)",
    md: "var(--ui-track-md)",
    lg: "var(--ui-track-lg)",
  });
  const resolvedThumbSize = resolvePreset(thumbSize, {
    sm: "var(--ui-thumb-sm)",
    md: "var(--ui-thumb-md)",
    lg: "var(--ui-thumb-lg)",
  });

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

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (disabled) return;
    const rect = dragRef.current?.rect;
    if (!rect) return;
    let ratio = 0;
    if (orientation === "vertical") {
      const y = clamp(clientY - rect.top, 0, rect.height);
      ratio = rect.height > 0 ? 1 - y / rect.height : 0;
    } else {
      const x = clamp(clientX - rect.left, 0, rect.width);
      ratio = rect.width > 0 ? x / rect.width : 0;
    }
    updateValue(min + ratio * safeRange);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { rect: event.currentTarget.getBoundingClientRect() };
    updateFromPointer(event.clientX, event.clientY);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!dragRef.current) return;
    updateFromPointer(event.clientX, event.clientY);
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
    if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = step;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = -step;
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

  return (
    <div className={`group relative select-none ${className}`}>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label ?? "Slider"}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(currentValue.toFixed(effectivePrecision))}
        aria-orientation={orientation}
        aria-disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className={`group relative flex outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 ${disabledSurfaceClass(
          disabled,
        )}`}
        style={{
          width: orientation === "vertical" ? resolvedThickness : width,
          height: orientation === "vertical" ? height : resolvedThickness,
          alignItems: orientation === "vertical" ? "stretch" : "center",
        }}
      >
        {orientation === "vertical" ? (
          <>
            <div
              className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)] ${
                disabled ? "bg-[var(--ui-disabled-bg)]" : "bg-zinc-800/90"
              }`}
              style={{ width: resolvedTrackHeight }}
            />
            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(252,211,77,0.55)] ${
                disabled
                  ? "bg-[var(--ui-disabled-fg)] shadow-none"
                  : "bg-amber-200/90"
              }`}
              style={{
                height: `${normalized * 100}%`,
                width: resolvedTrackHeight,
              }}
            />
            <div
              className={`absolute left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-white/10 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.9)] ${
                disabled ? "bg-[var(--ui-disabled-fg)]" : "bg-zinc-900"
              }`}
              style={{
                bottom: `${normalized * 100}%`,
                width: resolvedThumbSize,
                height: resolvedThumbSize,
              }}
            />
          </>
        ) : (
          <>
            <div
              className={`absolute left-0 right-0 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)] ${
                disabled ? "bg-[var(--ui-disabled-bg)]" : "bg-zinc-800/90"
              }`}
              style={{ height: resolvedTrackHeight }}
            />
            <div
              className={`absolute left-0 rounded-full shadow-[0_0_10px_rgba(252,211,77,0.55)] ${
                disabled
                  ? "bg-[var(--ui-disabled-fg)] shadow-none"
                  : "bg-amber-200/90"
              }`}
              style={{
                width: `${normalized * 100}%`,
                height: resolvedTrackHeight,
              }}
            />
            <div
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.9)] ${
                disabled ? "bg-[var(--ui-disabled-fg)]" : "bg-zinc-900"
              }`}
              style={{
                left: `${normalized * 100}%`,
                width: resolvedThumbSize,
                height: resolvedThumbSize,
              }}
            />
          </>
        )}
      </div>
      {disabled ? (
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          Disabled
        </div>
      ) : null}
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
