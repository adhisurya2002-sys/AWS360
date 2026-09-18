import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";
import { AppShell } from "@/components/av360/AppShell";
import { PageHeader } from "@/components/av360/PageHeader";
import { useTelemetry } from "@/lib/av360/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "Telemetry Stream History · AVS 360" }] }),
});

const RANGES = [
  { key: "5m", label: "Last 5 min", ms: 5 * 60 * 1000 },
  { key: "15m", label: "Last 15 min", ms: 15 * 60 * 1000 },
] as const;

type Range = (typeof RANGES)[number]["key"];

interface Series {
  title: string;
  dataKey: "hr" | "spo2" | "temp";
  color: string;
  unit: string;
  domain?: [number, number] | ["auto", "auto"];
}

const SERIES: Series[] = [
  {
    title: "Heart Rate",
    dataKey: "hr",
    color: "#4f46e5",
    unit: "BPM",
    domain: ["auto", "auto"],
  },
  { title: "SpO₂", dataKey: "spo2", color: "#0284c7", unit: "%", domain: [80, 100] },
  {
    title: "Temperature",
    dataKey: "temp",
    color: "#f59e0b",
    unit: "°C",
    domain: ["auto", "auto"],
  },
];

function HistoryPage() {
  const { history } = useTelemetry();
  const [range, setRange] = useState<Range>("5m");
  const ms = RANGES.find((r) => r.key === range)!.ms;
  const cutoff = Date.now() - ms;

  const data = useMemo(
    () =>
      history
        .filter((r) => r.ts >= cutoff)
        .map((r) => ({
          t: new Date(r.ts).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
          hr: r.hr,
          spo2: r.spo2,
          temp: r.temp,
        })),
    [history, cutoff],
  );

  return (
    <AppShell>
      <PageHeader
        title="Biometric Telemetry History"
        icon={Activity}
        action={
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-semibold transition-all",
                  range === r.key
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {data.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
          No telemetry stream buffered yet. The portal displays continuous 1Hz vitals automatically
          when telemetry runs.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {SERIES.map((s) => (
            <div
              key={s.dataKey}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">{s.title}</div>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {s.unit}
                </span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <XAxis dataKey="t" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={s.domain} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: 12,
                        fontSize: 12,
                        color: "#0f172a",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={s.dataKey}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
