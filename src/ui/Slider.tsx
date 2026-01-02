import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Display } from "./Display";
import { Label } from "./Label";

type SliderProps = {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  width?: number | string;
  label?: string;
  unit?: string;
  precision?: number;
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

export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 1,
  step = 0.01,
  width = "14rem",
  label,
  unit,
  precision,
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

  const updateFromClientX = (clientX: number) => {
    const rect = dragRef.current?.rect;
    if (!rect) return;
    const x = clamp(clientX - rect.left, 0, rect.width);
    const ratio = rect.width > 0 ? x / rect.width : 0;
    updateValue(min + ratio * safeRange);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { rect: event.currentTarget.getBoundingClientRect() };
    updateFromClientX(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    updateFromClientX(event.clientX);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    onChangeEnd?.(currentValue);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
    <div className={`select-none ${className}`}>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label ?? "Slider"}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(currentValue.toFixed(effectivePrecision))}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="group relative flex items-center outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
        style={{ width, height: "var(--ui-space-6)" }}
      >
        <div className="absolute left-0 right-0 h-[var(--ui-space-1)] rounded-full bg-zinc-800/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]" />
        <div
          className="absolute left-0 h-[var(--ui-space-1)] rounded-full bg-amber-200/90 shadow-[0_0_10px_rgba(252,211,77,0.55)]"
          style={{ width: `${normalized * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-[var(--ui-space-4)] w-[var(--ui-space-4)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-zinc-900 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.9)]"
          style={{ left: `${normalized * 100}%` }}
        />
      </div>
      {label ? (
        <Label text={label} className="mt-[var(--ui-space-3)]" />
      ) : null}
      <Display
        value={displayValue}
        unit={unit}
        size="sm"
        className="mt-[var(--ui-space-1)]"
      />
    </div>
  );
}
