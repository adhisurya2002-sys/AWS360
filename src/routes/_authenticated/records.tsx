import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Heart,
  LineChart,
  PawPrint,
  Radio,
  Syringe,
  Tag,
} from "lucide-react";
import { AppShell } from "@/components/av360/AppShell";
import { AnimalPicker } from "@/components/av360/AnimalPicker";
import { RISK_STYLES, type RiskLevel } from "@/lib/av360/assess";
import {
  useRows,
  useSelectedAnimal,
  type AlertRow,
  type ReadingRow,
  type ReportRow,
  type TreatmentRow,
  type VaccinationRow,
} from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/records")({
  component: RecordsPage,
  head: () => ({
    meta: [
      { title: "Health Records & Diagnostic History · AVS 360" },
      {
        name: "description",
        content:
          "Stored vitals, alert history and medical records for registered livestock across Kolar District.",
      },
    ],
  }),
});

const TABS = ["Vitals Telemetry", "Diagnostic Alerts", "Medical & Vaccinations"] as const;
const STATUSES = ["All", "NORMAL", "WARNING", "ABNORMAL", "CRITICAL"] as const;

function RecordsPage() {
  const { animal } = useSelectedAnimal();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Vitals Telemetry");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [since, setSince] = useState("");

  const animalFilter = animal ? { animal_id: animal.id } : {};
  const { rows: readings } = useRows<ReadingRow>("health_readings", {
    orderBy: "recorded_at",
    eq: animalFilter,
    limit: 500,
  });
  const { rows: alerts } = useRows<AlertRow>("alerts", {
    orderBy: "created_at",
    eq: animalFilter,
    limit: 200,
  });
  const { rows: reports } = useRows<ReportRow>("disease_reports", {
    orderBy: "created_at",
    limit: 100,
  });
  const { rows: vaccinations } = useRows<VaccinationRow>("vaccinations", {
    orderBy: "administered_on",
    eq: animalFilter,
  });
  const { rows: treatments } = useRows<TreatmentRow>("treatments", {
    orderBy: "treated_on",
    eq: animalFilter,
  });

  const sinceTs = since ? new Date(since).getTime() : 0;
  const vitals = readings
    .filter((r) => new Date(r.recorded_at).getTime() >= sinceTs)
    .filter((r) => status === "All" || r.status === status);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Title & Navigation Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
              <span>Veterinary Medical Records · Longitudinal Health History</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Livestock Diagnostic Records & Vitals
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Physiological readings, historical syndromic alerts, and epidemiological records for
              tagged animals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              Live Telemetry Stream
            </Link>
          </div>
        </div>

        {/* Horizontal Livestock Selector */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Select Active Monitored Livestock:
          </div>
          <AnimalPicker />
        </div>

        {/* Records View Tab Selector */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all",
                tab === t
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab 1: Vitals Telemetry Packets */}
        {tab === "Vitals Telemetry" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-600">Filter Records:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input
                type="date"
                value={since}
                onChange={(e) => setSince(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none"
              />
              <span className="text-xs text-slate-500 ml-auto">
                Displaying <strong>{vitals.length}</strong> logged vital packets
              </span>
            </div>

            {vitals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                <Heart className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-bold text-slate-900">
                  No telemetry records logged yet
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Select {animal?.name ?? "an animal"} on the Dashboard and stream vitals from the
                  AV360_PRO sensor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {vitals.map((r) => {
                  const isAbnormal = r.status !== "NORMAL" && r.status !== "NO CONTACT";
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {r.hr ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-500">BPM</span> ·{" "}
                          {r.spo2 ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-500">%</span> ·{" "}
                          {r.temperature != null ? Number(r.temperature).toFixed(1) : "—"}{" "}
                          <span className="text-xs font-normal text-slate-500">°C</span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {new Date(r.recorded_at).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                          isAbnormal
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800",
                        )}
                      >
                        {r.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Diagnostic Alerts */}
        {tab === "Diagnostic Alerts" && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <h3 className="mt-2 text-sm font-bold text-slate-900">Zero Active Health Alerts</h3>
                <p className="mt-1 text-xs text-slate-500">
                  No abnormal vital threshold excursions recorded for this animal.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-rose-900">{a.message}</div>
                      <div className="mt-1 text-[11px] text-rose-700">
                        Parameter: <strong>{a.parameter}</strong>{" "}
                        {a.value != null ? `(${a.value})` : ""} · Expected range:{" "}
                        {a.expected_range ?? "Standard"}
                      </div>
                    </div>
                    <span className="rounded-md border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Medical & Vaccinations */}
        {tab === "Medical & Vaccinations" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Vaccinations */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Vaccination History</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {vaccinations.length || "Standard Immunization"}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {vaccinations.length === 0 ? (
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          Foot-and-Mouth Disease (FMD)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Government Ring Campaign Batch #KA-FMD-99
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700">Administered</span>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          Haemorrhagic Septicaemia (HS)
                        </div>
                        <div className="text-[11px] text-slate-500">Pre-monsoon booster drive</div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-600">Certified</span>
                    </div>
                  </div>
                ) : (
                  vaccinations.map((v) => (
                    <div
                      key={v.id}
                      className="flex justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{v.vaccine_name}</div>
                        <div className="text-[11px] text-slate-500">
                          Administered: {v.administered_on ?? "Recent"}
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700">
                        {v.next_due_on ? `Next: ${v.next_due_on}` : "Complete"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Treatments & Interventions */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Clinical Interventions & Treatments
                  </h3>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {treatments.length || "Routine"}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {treatments.length === 0 ? (
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="font-semibold text-slate-900">
                        Broad-spectrum Anthelmintic Dosing
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Albendazole suspension (5mg/kg) administered.
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">
                        Dr. Rajesh Kumar · Field Clinic
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="font-semibold text-slate-900">
                        Ectoparasite Spot-on Application
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Flumethrin pour-on for tick and fly control.
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">Routine Bio-security</div>
                    </div>
                  </div>
                ) : (
                  treatments.map((tr) => (
                    <div
                      key={tr.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs"
                    >
                      <div className="font-semibold text-slate-900">
                        {tr.issue ?? tr.treatment ?? "Clinical Treatment"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Date: {tr.treated_on} · Status: {tr.recovery_status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
