import { disabledTextClass } from "./utils";

type DisplayProps = {
  value: string;
  unit?: string;
  size?: "sm" | "md";
  disabled?: boolean;
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
  disabled = false,
  className = "",
}: DisplayProps) {
  return (
    <div
      className={`text-center font-mono text-amber-200/90 px-[var(--ui-space-2)] ${sizeMap[size]} ${disabledTextClass(disabled)} ${className}`}
    >
      {value}
      {unit ? ` ${unit}` : ""}
    </div>
  );
}
