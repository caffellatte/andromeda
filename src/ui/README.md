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
| Knob | `value`, `defaultValue`, `min`, `max`, `step`, `size`, `label`, `unit`, `precision`, `indicatorOffset`, `disabled`, `onChange`, `onChangeEnd`, `className` | `min/max` default `0/1`; `step` default `0.01`; `size` default `var(--ui-size-3)` |
| Slider | `value`, `defaultValue`, `min`, `max`, `step`, `width`, `height`, `orientation`, `thickness`, `trackHeight`, `thumbSize`, `label`, `unit`, `precision`, `disabled`, `onChange`, `onChangeEnd`, `className` | `min/max` default `0/1`; `step` default `0.01`; `orientation` default `horizontal`; `height` used for vertical; `thickness` uses `--ui-thickness-*`; `trackHeight` uses `--ui-track-*`; `thumbSize` uses `--ui-thumb-*` |
| Toggle | `checked`, `defaultChecked`, `size`, `label`, `disabled`, `onChange`, `className` | `size` defaults to `md`; supports controlled/uncontrolled usage |
