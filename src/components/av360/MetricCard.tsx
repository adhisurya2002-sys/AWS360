import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number | null;
  unit?: string;
  icon: LucideIcon;
  tone?: "neon" | "cyan" | "warning" | "danger" | "muted";
  hint?: string;
}

const toneStyles: Record<
  NonNullable<Props["tone"]>,
  { ring: string; text: string; glow: string }
> = {
  neon: { ring: "ring-primary/30", text: "text-primary", glow: "text-glow-neon" },
  cyan: { ring: "ring-accent/30", text: "text-accent", glow: "text-glow-cyan" },
  warning: { ring: "ring-warning/40", text: "text-warning", glow: "" },
  danger: { ring: "ring-danger/50", text: "text-danger", glow: "" },
  muted: { ring: "ring-border", text: "text-muted-foreground", glow: "" },
};

export function MetricCard({ label, value, unit, icon: Icon, tone = "neon", hint }: Props) {
  const t = toneStyles[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-card ring-1 backdrop-blur-xl transition-all",
        t.ring,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", t.text)} />
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("font-display text-4xl font-bold tabular-nums", t.text, t.glow)}>
          {value ?? "—"}
        </span>
        {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
