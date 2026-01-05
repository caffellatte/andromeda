import { useEffect, useRef, useState } from "react";
import { DisabledTooltip } from "./DisabledTooltip";
import { Display } from "./Display";
import { Label } from "./Label";

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
  showPeak?: boolean;
  peakHoldMs?: number;
  peakFalloffPerSec?: number;
  peakFps?: number;
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
  showPeak = true,
  peakHoldMs = 700,
  peakFalloffPerSec = 1,
  peakFps = 30,
  disabled = false,
  tooltipText = "Disabled",
  className = "",
}: MeterProps) {
  const safeRange = Math.max(max - min, Number.EPSILON);
  const normalized = clamp((value - min) / safeRange, 0, 1);
  const [peakValue, setPeakValue] = useState(value);
  const peakTimeRef = useRef(Date.now());
  const peakTickRef = useRef(Date.now());
  const lastFrameRef = useRef(0);
  const hiddenRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (value >= peakValue) {
      setPeakValue(value);
      peakTimeRef.current = now;
      peakTickRef.current = now;
    }
  }, [value, peakValue]);

  useEffect(() => {
    const updateHidden = () => {
      hiddenRef.current = document.visibilityState !== "visible";
    };
    updateHidden();
    document.addEventListener("visibilitychange", updateHidden);
    return () => {
      document.removeEventListener("visibilitychange", updateHidden);
    };
  }, []);

  useEffect(() => {
    if (!showPeak) return;
    let frameId = 0;
    const tick = () => {
      const now = Date.now();
      const frameInterval = peakFps > 0 ? 1000 / peakFps : 0;
      if (frameInterval > 0 && now - lastFrameRef.current < frameInterval) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }
      lastFrameRef.current = now;
      if (value < peakValue) {
        const dt = (now - peakTickRef.current) / 1000;
        peakTickRef.current = now;
        if (now - peakTimeRef.current >= peakHoldMs) {
          if (peakFalloffPerSec <= 0) {
            setPeakValue(value);
          } else {
            const next = Math.max(value, peakValue - peakFalloffPerSec * dt);
            setPeakValue(next);
          }
        }
      } else {
        peakTickRef.current = Date.now();
      }
      if (hiddenRef.current) {
        timeoutRef.current = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(tick);
        }, 500);
        return;
      }
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [showPeak, peakHoldMs, peakFalloffPerSec, peakFps, value, peakValue]);

  const peakNormalized = clamp((peakValue - min) / safeRange, 0, 1);

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
        className={`relative cursor-default overflow-hidden rounded-full border border-white/10 ${
          disabled ? "bg-[var(--ui-disabled-bg)] opacity-60" : "bg-zinc-900/80"
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
        {showPeak ? (
          <div
            className={`absolute ${
              disabled ? "bg-[var(--ui-disabled-fg)]" : "bg-amber-100"
            }`}
            style={
              orientation === "vertical"
                ? {
                    height: "2px",
                    width: "100%",
                    bottom: `${peakNormalized * 100}%`,
                  }
                : {
                    width: "2px",
                    height: "100%",
                    left: `${peakNormalized * 100}%`,
                  }
            }
          />
        ) : null}
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
