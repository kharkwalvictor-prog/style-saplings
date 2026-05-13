import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  repeat?: number;
  speed?: "slow" | "normal" | "fast";
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  repeat = 5,
  speed = "normal",
  ...props
}: MarqueeProps) {
  const speedVariants = {
    slow: "[--duration:60s]",
    normal: "[--duration:30s]",
    fast: "[--duration:15s]",
  };

  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden [--gap:2rem] [gap:var(--gap)]",
        speedVariants[speed],
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 items-center justify-around [gap:var(--gap)]", {
              "animate-marquee": !reverse,
              "animate-marquee-reverse": reverse,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
