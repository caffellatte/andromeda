# UI library overview

## Tokens
- Tokens live in `src/ui/tokens.css` and are imported once from `src/App.css`.
- Use the `--ui-space-*` and `--ui-size-*` values for spacing and component sizing.
- Use the `--ui-font-*` and `--ui-letter-*` values for typography sizing and tracking.

## Conventions
- Prefer tokens over raw values in component styles.
- Expose small, composable primitives (e.g. `Label`, `Display`, `Knob`).
- Keep controlled and uncontrolled usage supported when relevant.

## Usage examples
```tsx
import { Knob, Slider } from "../ui";

<Knob label="Cutoff" min={20} max={20000} step={1} unit="Hz" defaultValue={440} />
<Slider label="Gain" min={-24} max={6} step={0.1} unit="dB" defaultValue={0} />
<Slider
  orientation="vertical"
  height="12rem"
  thickness="sm"
  trackHeight="sm"
  thumbSize="lg"
  label="Resonance"
  min={0}
  max={1}
  step={0.01}
  defaultValue={0.5}
/>
```

## Contribution checklist
- Add new tokens to `src/ui/tokens.css` and reuse existing ones where possible.
- Export new components via `src/ui/index.ts`.
- Keep props small and predictable (controlled + uncontrolled support).

## Props reference
| Component | Props | Notes |
| --- | --- | --- |
| Knob | `value`, `defaultValue`, `min`, `max`, `step`, `size`, `label`, `unit`, `precision`, `indicatorOffset`, `disabled`, `tooltipText`, `onChange`, `onChangeEnd`, `className` | `min/max` default `0/1`; `step` default `0.01`; `size` default `var(--ui-size-3)` |
| Slider | `value`, `defaultValue`, `min`, `max`, `step`, `width`, `height`, `orientation`, `thickness`, `trackHeight`, `thumbSize`, `label`, `unit`, `precision`, `disabled`, `tooltipText`, `onChange`, `onChangeEnd`, `className` | `min/max` default `0/1`; `step` default `0.01`; `orientation` default `horizontal`; `height` used for vertical; `thickness` uses `--ui-thickness-*`; `trackHeight` uses `--ui-track-*`; `thumbSize` uses `--ui-thumb-*` |
| Toggle | `checked`, `defaultChecked`, `size`, `label`, `disabled`, `tooltipText`, `onChange`, `className` | `size` defaults to `md`; supports controlled/uncontrolled usage |
| Envelope | `attack`, `decay`, `sustain`, `release`, `defaultAttack`, `defaultDecay`, `defaultSustain`, `defaultRelease`, `timeMin`, `timeMax`, `timeStep`, `sustainMin`, `sustainMax`, `sustainStep`, `label`, `disabled`, `tooltipText`, `onChange`, `className` | `timeMin/timeMax` default `0/1`; `sustainMin/sustainMax` default `0/1`; `label` defaults to `Envelope` |
| Oscillator | `waveform`, `defaultWaveform`, `waveformOptions`, `tune`, `defaultTune`, `tuneMin`, `tuneMax`, `tuneStep`, `level`, `defaultLevel`, `levelMin`, `levelMax`, `levelStep`, `label`, `disabled`, `tooltipText`, `onWaveformChange`, `onTuneChange`, `onLevelChange`, `onChange`, `className` | `waveformOptions` defaults to `sine/triangle/saw/square`; `tune` in semitones; `level` default `0.7` |
| WaveformSelect | `value`, `defaultValue`, `options`, `label`, `disabled`, `tooltipText`, `onChange`, `className` | `options` defaults to `sine/triangle/saw/square`; `label` can be `false` to hide |
| Meter | `value`, `min`, `max`, `orientation`, `width`, `height`, `label`, `unit`, `showValue`, `showPeak`, `peakHoldMs`, `peakFalloffPerSec`, `disabled`, `tooltipText`, `className` | `orientation` default `horizontal`; `min/max` default `0/1`; `showPeak` default `true`; `peakHoldMs` default `700`; `peakFalloffPerSec` default `1`; use `width/height` for layout |
