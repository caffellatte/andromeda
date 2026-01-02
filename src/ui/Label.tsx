type LabelProps = {
  text: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeMap = {
  sm: "text-[0.6rem]",
  md: "text-[0.7rem]",
};

export function Label({ text, size = "md", className = "" }: LabelProps) {
  return (
    <div
      className={`text-center uppercase tracking-[0.28em] text-zinc-400 px-[var(--ui-space-2)] ${sizeMap[size]} ${className}`}
    >
      {text}
    </div>
  );
}
