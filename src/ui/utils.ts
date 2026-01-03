export const disabledTextClass = (disabled?: boolean) =>
  disabled ? "text-[var(--ui-disabled-fg)] opacity-70" : "";

export const disabledSurfaceClass = (disabled?: boolean) =>
  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer";
