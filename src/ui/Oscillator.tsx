import { useState } from "react";
import { Knob } from "./Knob";
import { Label } from "./Label";
import { WaveformSelect } from "./WaveformSelect";

type OscillatorValues = {
  waveform: string;
  tune: number;
  level: number;
};

type OscillatorProps = {
  waveform?: string;
  defaultWaveform?: string;
  waveformOptions?: string[];
  tune?: number;
  defaultTune?: number;
  tuneMin?: number;
  tuneMax?: number;
  tuneStep?: number;
  level?: number;
  defaultLevel?: number;
  levelMin?: number;
  levelMax?: number;
  levelStep?: number;
  label?: string;
  disabled?: boolean;
  tooltipText?: string;
  onWaveformChange?: (waveform: string) => void;
  onTuneChange?: (tune: number) => void;
  onLevelChange?: (level: number) => void;
  onChange?: (values: OscillatorValues) => void;
  className?: string;
};

const defaultWaveforms = ["sine", "triangle", "saw", "square"];

export function Oscillator({
  waveform,
  defaultWaveform,
  waveformOptions = defaultWaveforms,
  tune,
  defaultTune,
  tuneMin = -24,
  tuneMax = 24,
  tuneStep = 0.1,
  level,
  defaultLevel,
  levelMin = 0,
  levelMax = 1,
  levelStep = 0.01,
  label = "Oscillator",
  disabled = false,
  tooltipText = "Disabled",
  onWaveformChange,
  onTuneChange,
  onLevelChange,
  onChange,
  className = "",
}: OscillatorProps) {
  const [internal, setInternal] = useState<OscillatorValues>({
    waveform:
      defaultWaveform ?? waveform ?? waveformOptions[0] ?? "sine",
    tune: defaultTune ?? tune ?? 0,
    level: defaultLevel ?? level ?? 0.7,
  });

  const isWaveformControlled = waveform !== undefined;
  const isTuneControlled = tune !== undefined;
  const isLevelControlled = level !== undefined;

  const currentWaveform = isWaveformControlled
    ? waveform ?? internal.waveform
    : internal.waveform;
  const currentTune = isTuneControlled ? tune ?? 0 : internal.tune;
  const currentLevel = isLevelControlled ? level ?? 0 : internal.level;

  const emitChange = (next: OscillatorValues) => {
    onChange?.(next);
  };

  const updateWaveform = (next: string) => {
    if (!isWaveformControlled) {
      setInternal((prev) => ({ ...prev, waveform: next }));
    }
    onWaveformChange?.(next);
    emitChange({
      waveform: next,
      tune: currentTune,
      level: currentLevel,
    });
  };

  const updateTune = (next: number) => {
    if (!isTuneControlled) {
      setInternal((prev) => ({ ...prev, tune: next }));
    }
    onTuneChange?.(next);
    emitChange({
      waveform: currentWaveform,
      tune: next,
      level: currentLevel,
    });
  };

  const updateLevel = (next: number) => {
    if (!isLevelControlled) {
      setInternal((prev) => ({ ...prev, level: next }));
    }
    onLevelChange?.(next);
    emitChange({
      waveform: currentWaveform,
      tune: currentTune,
      level: next,
    });
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
      <div className="mb-[var(--ui-space-4)]">
        <WaveformSelect
          value={currentWaveform}
          options={waveformOptions}
          disabled={disabled}
          tooltipText={tooltipText}
          label="Waveform"
          onChange={updateWaveform}
        />
      </div>
      <div className="grid grid-cols-2 gap-[var(--ui-space-4)]">
        <Knob
          label="Tune"
          value={currentTune}
          min={tuneMin}
          max={tuneMax}
          step={tuneStep}
          unit="st"
          disabled={disabled}
          tooltipText={tooltipText}
          onChange={updateTune}
        />
        <Knob
          label="Level"
          value={currentLevel}
          min={levelMin}
          max={levelMax}
          step={levelStep}
          disabled={disabled}
          tooltipText={tooltipText}
          onChange={updateLevel}
        />
      </div>
    </section>
  );
}
