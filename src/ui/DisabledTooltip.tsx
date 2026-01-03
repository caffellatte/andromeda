type DisabledTooltipProps = {
  text?: string;
};

export function DisabledTooltip({ text = "Disabled" }: DisabledTooltipProps) {
  return (
    <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
      {text}
    </div>
  );
}
