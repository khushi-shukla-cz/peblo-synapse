import { cn } from "@/lib/utils";

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="relative grid place-items-center rounded-lg shadow-[var(--shadow-glow)]"
        style={{
          width: size,
          height: size,
          background: "var(--gradient-primary)",
        }}
      >
        <span className="absolute inset-[3px] rounded-md bg-background/40 backdrop-blur-sm" />
        <svg
          viewBox="0 0 24 24"
          width={size * 0.55}
          height={size * 0.55}
          className="relative"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="7" r="2" />
          <circle cx="18" cy="7" r="2" />
          <circle cx="12" cy="17" r="2" />
          <path d="M7.7 8.4 10.5 15.4M16.3 8.4 13.5 15.4M8 7h8" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight text-[15px]">
        Peblo <span className="text-aurora">Synapse</span>
      </span>
    </div>
  );
}
