import { disabledTextClass } from "./utils";

type LabelProps = {
  text: string;
  size?: "sm" | "md";
  tracking?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "text-[var(--ui-font-1)]",
  md: "text-[var(--ui-font-2)]",
};

const trackingMap = {
  sm: "tracking-[var(--ui-letter-1)]",
  md: "tracking-[var(--ui-letter-2)]",
};

export function Label({
  text,
  size = "md",
  tracking = "md",
  disabled = false,
  className = "",
}: LabelProps) {
  return (
    <div
      className={`text-center uppercase text-zinc-400 px-[var(--ui-space-2)] ${sizeMap[size]} ${trackingMap[tracking]} ${disabledTextClass(disabled)} ${className}`}
    >
      {text}
    </div>
  );
}
