type DisplayProps = {
  value: string;
  unit?: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeMap = {
  sm: "text-[var(--ui-font-3)]",
  md: "text-[var(--ui-font-4)]",
};

export function Display({
  value,
  unit,
  size = "sm",
  className = "",
}: DisplayProps) {
  return (
    <div
      className={`text-center font-mono text-amber-200/90 px-[var(--ui-space-2)] ${sizeMap[size]} ${className}`}
    >
      {value}
      {unit ? ` ${unit}` : ""}
    </div>
  );
}
