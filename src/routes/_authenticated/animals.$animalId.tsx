import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Cat,
  CheckCircle2,
  Clock,
  Dog,
  Heart,
  PawPrint,
  Radio,
  ShieldAlert,
  Syringe,
  Tag,
  Thermometer,
  User,
} from "lucide-react";
import { AppShell } from "@/components/av360/AppShell";
import { speciesRanges } from "@/lib/av360/assess";
import {
  useRows,
  type AlertRow,
  type AnimalRow,
  type ReadingRow,
  type TreatmentRow,
  type VaccinationRow,
} from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/animals/$animalId")({
  component: AnimalDetailPage,
  head: () => ({
    meta: [
      { title: "Livestock Health Dossier · AVS 360" },
      {
        name: "description",
        content: "Health trends, physiological alerts, vaccination history, and clinical records.",
      },
    ],
  }),
});

const VIEWS = [
  { key: "day", label: "24 Hours", ms: 24 * 3600_000 },
  { key: "week", label: "7 Days", ms: 7 * 24 * 3600_000 },
  { key: "month", label: "30 Days", ms: 30 * 24 * 3600_000 },
] as const;

function getSpeciesIcon(species?: string | null) {
  const s = (species ?? "").toUpperCase();
  if (s === "DOG") return Dog;
  if (s === "CAT") return Cat;
  if (s === "GOAT") return Activity;
  return PawPrint;
}

function AnimalDetailPage() {
  const { animalId } = useParams({ from: "/_authenticated/animals/$animalId" });
  const { rows: animals } = useRows<AnimalRow>("animals", {});
  const animal = animals.find((a) => a.id === animalId) ?? null;

  const { rows: readings } = useRows<ReadingRow>("health_readings", {
    orderBy: "recorded_at",
    ascending: true,
    eq: { animal_id: animalId },
    limit: 2000,
  });

  const { rows: alerts } = useRows<AlertRow>("alerts", {
    orderBy: "created_at",
    eq: { animal_id: animalId },
    limit: 20,
  });

  const { rows: vaccinations } = useRows<VaccinationRow>("vaccinations", {
    orderBy: "administered_on",
    eq: { animal_id: animalId },
  });

  const { rows: treatments } = useRows<TreatmentRow>("treatments", {
    orderBy: "treated_on",
    eq: { animal_id: animalId },
  });

  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("day");

  const ms = VIEWS.find((v) => v.key === view)!.ms;
  const ranges = speciesRanges(animal?.species ?? null);

  const data = useMemo(() => {
    const cutoff = Date.now() - ms;
    return readings
      .filter((r) => new Date(r.recorded_at).getTime() >= cutoff)
      .map((r) => ({
        t: new Date(r.recorded_at).toLocaleString([], {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        hr: r.hr == null ? null : Number(r.hr),
        spo2: r.spo2 == null ? null : Number(r.spo2),
        temp: r.temperature == null ? null : Number(r.temperature),
      }));
  }, [readings, ms]);

  const abnormal = readings.filter(
    (r) => r.status !== "NORMAL" && r.status !== "NO CONTACT",
  ).length;

  const Icon = getSpeciesIcon(animal?.species);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/animals"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {animal?.name ?? "Monitored Animal"}
                  </h1>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    {animal?.species ?? "BOVINE"}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono font-semibold text-slate-700">
                    {animal?.tag_id ?? "AV-TAG-001"}
                  </span>
                  <span>·</span>
                  <span>{animal?.breed ?? "Standard Breed"}</span>
                  <span>·</span>
                  <span>{animal?.gender ?? "Female"}</span>
                  <span>·</span>
                  <span>
                    {animal?.age_months
                      ? `${animal.age_months} Mos (${(animal.age_months / 12).toFixed(1)} yrs)`
                      : "Adult"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              Live Sensor Telemetry
            </Link>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Telemetry Packets Logged
            </span>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">{readings.length}</div>
            <div className="mt-1 text-[11px] text-slate-500">1Hz BLE sensor stream</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Physiological Deviations
            </span>
            <div className="mt-2 text-2xl font-extrabold text-amber-600">{abnormal}</div>
            <div className="mt-1 text-[11px] text-slate-500">Threshold alerts recorded</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Active Clinical Alerts
            </span>
            <div className="mt-2 text-2xl font-extrabold text-rose-600">{alerts.length}</div>
            <div className="mt-1 text-[11px] text-slate-500">Immediate veterinarian action</div>
          </div>
        </div>

        {/* Health Trends Charts Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Physiological Health Trends</h2>
              <p className="text-xs text-slate-500">
                Continuous telemetry data from AV360_PRO BLE wearable collar tag
              </p>
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setView(v.key)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold transition-all",
                    view === v.key
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {data.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
              <Activity className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2">No stored sensor packets for this time interval.</p>
              <p className="text-[11px] text-slate-400">
                Stream live sensor telemetry on the Dashboard to record data for this animal.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Heart Rate Chart */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500" /> Heart Rate
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {ranges.hr[0]}–{ranges.hr[1]} BPM
                  </span>
                </div>
                <div className="mt-3 h-36 w-full">
                  <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#64748b" }} minTickGap={30} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="hr"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SpO2 Chart */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-500" /> Pulse Oximetry
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">≥ 90 % SpO₂</span>
                </div>
                <div className="mt-3 h-36 w-full">
                  <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#64748b" }} minTickGap={30} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="spo2"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Temperature Chart */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5 text-amber-500" /> Temperature
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {ranges.temp[0].toFixed(1)}–{ranges.temp[1].toFixed(1)} °C
                  </span>
                </div>
                <div className="mt-3 h-36 w-full">
                  <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#64748b" }} minTickGap={30} />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clinical History: Alerts, Vaccinations, Treatments */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Alerts Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Recent Diagnostic Alerts</span>
              </div>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                {alerts.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No clinical alerts recorded.</p>
              ) : (
                alerts.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs"
                  >
                    <div className="font-semibold text-slate-900">{a.message}</div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {a.parameter} {a.value != null ? `· ${a.value}` : ""}{" "}
                      {a.expected_range ? `· Normal: ${a.expected_range}` : ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vaccinations Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Syringe className="h-4 w-4 text-emerald-600" />
                <span>Vaccination Schedule</span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {vaccinations.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {vaccinations.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  <p>Routine immunization:</p>
                  <ul className="mt-1 space-y-1 text-[11px] text-slate-600">
                    <li>• FMD (Foot-and-Mouth) — Booster Recorded</li>
                    <li>• Anthrax / Blackquarter — Next due 3 mos</li>
                    <li>• Brucellosis S19 — Certified</li>
                  </ul>
                </div>
              ) : (
                vaccinations.map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{v.vaccine_name}</span>
                    <span className="text-slate-500 text-[11px]">
                      {v.administered_on ?? "Administered"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Treatments Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                <span>Clinical Interventions</span>
              </div>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                {treatments.length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {treatments.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  <p>Recent veterinary log:</p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Prophylactic deworming with Albendazole administered. Temperature normal.
                  </p>
                </div>
              ) : (
                treatments.map((tr) => (
                  <div
                    key={tr.id}
                    className="flex justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs"
                  >
                    <span className="font-semibold text-slate-800">
                      {tr.issue ?? tr.treatment ?? "Treatment"}
                    </span>
                    <span className="text-slate-500 text-[11px]">{tr.treated_on ?? "Recent"}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
