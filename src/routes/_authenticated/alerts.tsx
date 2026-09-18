import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/av360/AppShell";
import { PageHeader } from "@/components/av360/PageHeader";
import { EmptyState } from "@/components/av360/form";
import { RISK_STYLES, type RiskLevel } from "@/lib/av360/assess";
import { updateRow, useRows, type AlertRow, type AnimalRow } from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/alerts")({
  component: AlertsPage,
  head: () => ({
    meta: [
      { title: "Surveillance Alert Center · AVS 360" },
      {
        name: "description",
        content:
          "Early health alerts, vaccination reminders and treatment follow-ups in one place.",
      },
      { property: "og:title", content: "Alert Center · AVS 360" },
      {
        property: "og:description",
        content: "Review, acknowledge and resolve animal health alerts.",
      },
    ],
  }),
});

const FILTERS = ["all", "new", "acknowledged", "resolved"] as const;

function AlertsPage() {
  const { rows } = useRows<AlertRow>("alerts", { orderBy: "created_at", limit: 200 });
  const { rows: animals } = useRows<AnimalRow>("animals", {});
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const list = rows.filter((a) => (filter === "all" ? true : a.state === filter));

  async function setState(id: string, state: string) {
    await updateRow("alerts", id, { state });
    toast.success(`Marked as ${state}`);
  }

  return (
    <AppShell>
      <PageHeader title="Surveillance & Health Alerts" icon={BellRing} />

      <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
              filter === f
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 && (
          <EmptyState text="No alerts in this category. Real-time abnormal telemetry and surveillance thresholds will appear here automatically." />
        )}
        {list.map((a) => {
          const animal = animals.find((x) => x.id === a.animal_id);
          const isCritical = a.severity === "CRITICAL";
          return (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{a.message}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {animal
                      ? `${animal.name} (${animal.tag_id}) · ${animal.species}`
                      : "Universal Surveillance Watch"}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    isCritical
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {a.severity}
                </span>
              </div>
              {a.parameter && (
                <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{a.parameter}:</span>{" "}
                  {a.value ?? "—"}{" "}
                  {a.expected_range ? ` (baseline expected: ${a.expected_range})` : ""}
                </div>
              )}
              {a.recommendation && (
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Action Protocol:</span>{" "}
                  {a.recommendation}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-[11px] text-slate-400">
                  Triggered {new Date(a.created_at).toLocaleString()}
                </div>
                <div className="flex gap-1.5">
                  {(["read", "acknowledged", "resolved"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setState(a.id, s)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                        a.state === s
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Alerts indicate a possible health or epidemiological biosecurity risk based on sensor
        readings. Veterinary clinical evaluation is recommended.
      </p>
    </AppShell>
  );
}
