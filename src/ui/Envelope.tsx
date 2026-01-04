import { useState } from "react";
import { Knob } from "./Knob";
import { Label } from "./Label";

type EnvelopeValues = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

type EnvelopeProps = {
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  defaultAttack?: number;
  defaultDecay?: number;
  defaultSustain?: number;
  defaultRelease?: number;
  timeMin?: number;
  timeMax?: number;
  timeStep?: number;
  sustainMin?: number;
  sustainMax?: number;
  sustainStep?: number;
  label?: string;
  disabled?: boolean;
  tooltipText?: string;
  onChange?: (values: EnvelopeValues) => void;
  className?: string;
};

export function Envelope({
  attack,
  decay,
  sustain,
  release,
  defaultAttack,
  defaultDecay,
  defaultSustain,
  defaultRelease,
  timeMin = 0,
  timeMax = 1,
  timeStep = 0.01,
  sustainMin = 0,
  sustainMax = 1,
  sustainStep = 0.01,
  label = "Envelope",
  disabled = false,
  tooltipText = "Disabled",
  onChange,
  className = "",
}: EnvelopeProps) {
  const [internal, setInternal] = useState<EnvelopeValues>({
    attack: defaultAttack ?? attack ?? timeMin,
    decay: defaultDecay ?? decay ?? timeMin,
    sustain: defaultSustain ?? sustain ?? sustainMax,
    release: defaultRelease ?? release ?? timeMin,
  });

  const isAttackControlled = attack !== undefined;
  const isDecayControlled = decay !== undefined;
  const isSustainControlled = sustain !== undefined;
  const isReleaseControlled = release !== undefined;

  const currentAttack = isAttackControlled ? attack ?? timeMin : internal.attack;
  const currentDecay = isDecayControlled ? decay ?? timeMin : internal.decay;
  const currentSustain = isSustainControlled
    ? sustain ?? sustainMax
    : internal.sustain;
  const currentRelease = isReleaseControlled
    ? release ?? timeMin
    : internal.release;

  const emitChange = (next: EnvelopeValues) => {
    onChange?.(next);
  };

  const updateAttack = (next: number) => {
    if (!isAttackControlled) {
      setInternal((prev) => ({ ...prev, attack: next }));
    }
    emitChange({
      attack: next,
      decay: currentDecay,
      sustain: currentSustain,
      release: currentRelease,
    });
  };

  const updateDecay = (next: number) => {
    if (!isDecayControlled) {
      setInternal((prev) => ({ ...prev, decay: next }));
    }
    emitChange({
      attack: currentAttack,
      decay: next,
      sustain: currentSustain,
      release: currentRelease,
    });
  };

  const updateSustain = (next: number) => {
    if (!isSustainControlled) {
      setInternal((prev) => ({ ...prev, sustain: next }));
    }
    emitChange({
      attack: currentAttack,
      decay: currentDecay,
      sustain: next,
      release: currentRelease,
    });
  };

  const updateRelease = (next: number) => {
    if (!isReleaseControlled) {
      setInternal((prev) => ({ ...prev, release: next }));
    }
    emitChange({
      attack: currentAttack,
      decay: currentDecay,
      sustain: currentSustain,
      release: next,
    });
  };

  const buildCurvePath = () => {
    const width = 220;
    const height = 64;
    const padding = 8;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const attackNorm =
      timeMax - timeMin === 0 ? 0 : (currentAttack - timeMin) / (timeMax - timeMin);
    const decayNorm =
      timeMax - timeMin === 0 ? 0 : (currentDecay - timeMin) / (timeMax - timeMin);
    const releaseNorm =
      timeMax - timeMin === 0 ? 0 : (currentRelease - timeMin) / (timeMax - timeMin);
    const sustainNorm =
      sustainMax - sustainMin === 0
        ? 0
        : (currentSustain - sustainMin) / (sustainMax - sustainMin);

    const attackSpan = 0.25 + attackNorm * 0.2;
    const decaySpan = 0.2 + decayNorm * 0.15;
    const sustainSpan = 0.25;
    const releaseSpan = 0.2 + releaseNorm * 0.2;
    const totalSpan = attackSpan + decaySpan + sustainSpan + releaseSpan;

    const x0 = padding;
    const x1 = x0 + (attackSpan / totalSpan) * usableWidth;
    const x2 = x1 + (decaySpan / totalSpan) * usableWidth;
    const x3 = x2 + (sustainSpan / totalSpan) * usableWidth;
    const x4 = x3 + (releaseSpan / totalSpan) * usableWidth;

    const yTop = padding;
    const ySustain = padding + (1 - sustainNorm) * usableHeight;
    const yBottom = padding + usableHeight;

    return `M ${x0} ${yBottom} L ${x1} ${yTop} L ${x2} ${ySustain} L ${x3} ${ySustain} L ${x4} ${yBottom}`;
  };

  const curvePath = buildCurvePath();

  return (
    <section className={`w-full ${className}`}>
      {label ? (
        <Label
          text={label}
          size="sm"
          tracking="sm"
          disabled={disabled}
          className="mb-[var(--ui-space-3)]"
        />
      ) : null}
      <div className="mb-[var(--ui-space-4)] rounded-[var(--ui-radius-2)] border border-white/5 bg-zinc-950/70 p-[var(--ui-space-3)]">
        <svg
          viewBox="0 0 220 64"
          className="h-16 w-full"
          role="img"
          aria-label="Envelope curve"
        >
          <path
            d={curvePath}
            className={`fill-none stroke-[2] ${
              disabled ? "stroke-[var(--ui-disabled-fg)]" : "stroke-amber-200"
            }`}
          />
          <path
            d={curvePath}
            className={`fill-none stroke-[6] opacity-30 ${
              disabled ? "stroke-[var(--ui-disabled-fg)]" : "stroke-amber-200"
            }`}
          />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-[var(--ui-space-4)] md:grid-cols-4">
        <Knob
          label="Attack"
          value={currentAttack}
          min={timeMin}
          max={timeMax}
          step={timeStep}
          unit="s"
          disabled={disabled}
          tooltipText={tooltipText}
          onChange={updateAttack}
        />
        <Knob
          label="Decay"
          value={currentDecay}
          min={timeMin}
          max={timeMax}
          step={timeStep}
          unit="s"
          disabled={disabled}
          tooltipText={tooltipText}
          onChange={updateDecay}
        />
        <Knob
          label="Sustain"
          value={currentSustain}
          min={sustainMin}
          max={sustainMax}
          step={sustainStep}
          unit="%"
          disabled={disabled}
          tooltipText={tooltipText}
          onChange={updateSustain}
        />
        <Knob
          label="Release"
          value={currentRelease}
          min={timeMin}
          max={timeMax}
          step={timeStep}
          unit="s"
          disabled={disabled}
          tooltipText={tooltipText}
          onChange={updateRelease}
        />
      </div>
    </section>
  );
}
