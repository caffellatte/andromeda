# UI library overview

## Tokens
- Tokens live in `src/ui/tokens.css` and are imported once from `src/App.css`.
- Use the `--ui-space-*` and `--ui-size-*` values for spacing and component sizing.
- Use the `--ui-font-*` and `--ui-letter-*` values for typography sizing and tracking.

## Conventions
- Prefer tokens over raw values in component styles.
- Expose small, composable primitives (e.g. `Label`, `Display`, `Knob`).
- Keep controlled and uncontrolled usage supported when relevant.
