type DisabledTooltipProps = {
  text?: string;
  position?: "top" | "bottom";
};

const positionMap = {
  top: "-top-6",
  bottom: "-bottom-6",
};

export function DisabledTooltip({
  text = "Disabled",
  position = "top",
}: DisabledTooltipProps) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-zinc-300 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 ${positionMap[position]}`}
    >
      {text}
    </div>
  );
}
