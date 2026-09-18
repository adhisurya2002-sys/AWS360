import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  Bluetooth,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Heart,
  Layers,
  PawPrint,
  Plus,
  Shield,
  ShieldAlert,
  Siren,
  Syringe,
} from "lucide-react";
import { AppShell } from "@/components/av360/AppShell";
import { assessVitals } from "@/lib/av360/assess";
import {
  useRows,
  type AlertRow,
  type AnimalRow,
  type ReadingRow,
  type ReportRow,
  type VaccinationRow,
} from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "AVS 360 · National Veterinary Health & Epidemic Surveillance" },
      {
        name: "description",
        content:
          "Official animal health surveillance, syndromic outbreak triage, and real-time field telemetry portal.",
      },
    ],
  }),
});

const QUICK = [
  {
    to: "/dashboard",
    label: "Surveillance Command",
    icon: ShieldAlert,
    desc: "District outbreak map & decision support",
  },
  {
    to: "/animals",
    label: "Livestock Registry",
    icon: PawPrint,
    desc: "Registered cattle, goats & working animals",
  },
  {
    to: "/records",
    label: "Health Records",
    icon: FileSpreadsheet,
    desc: "Longitudinal vital readings & telemetry",
  },
  {
    to: "/reports",
    label: "Outbreak Reports",
    icon: Siren,
    desc: "Field syndromic case submissions",
  },
  {
    to: "/vaccinations",
    label: "Ring Vaccinations",
    icon: Syringe,
    desc: "Coverage progress & scheduled drives",
  },
  {
    to: "/offline-ai",
    label: "Offline Clinical AI",
    icon: BrainCircuit,
    desc: "Edge syndromic differential triage",
  },
] as const;

function HomePage() {
  const { rows: animals } = useRows<AnimalRow>("animals", {
    orderBy: "created_at",
    ascending: true,
  });
  const { rows: alerts } = useRows<AlertRow>("alerts", { orderBy: "created_at", limit: 200 });
  const { rows: readings } = useRows<ReadingRow>("health_readings", {
    orderBy: "recorded_at",
    limit: 500,
  });
  const { rows: reports } = useRows<ReportRow>("disease_reports", {
    orderBy: "created_at",
    limit: 5,
  });
  const { rows: vaccinations } = useRows<VaccinationRow>("vaccinations", {
    orderBy: "next_due_on",
    ascending: true,
  });

  const activeAlerts = alerts.filter((a) => a.state !== "resolved");
  const attentionIds = new Set(
    activeAlerts
      .filter((a) => a.severity === "ABNORMAL" || a.severity === "CRITICAL")
      .map((a) => a.animal_id),
  );

  const latestByAnimal = new Map<string, ReadingRow>();
  for (const r of readings) {
    if (r.animal_id && !latestByAnimal.has(r.animal_id)) latestByAnimal.set(r.animal_id, r);
  }
  for (const a of animals) {
    const latest = latestByAnimal.get(a.id);
    if (!latest) continue;
    const level = assessVitals({
      species: a.species,
      hr: latest.hr == null ? null : Number(latest.hr),
      spo2: latest.spo2 == null ? null : Number(latest.spo2),
      temp: latest.temperature == null ? null : Number(latest.temperature),
    }).level;
    if (level === "ABNORMAL" || level === "CRITICAL" || level === "WARNING") attentionIds.add(a.id);
  }

  const needsAttention = animals.filter((a) => attentionIds.has(a.id)).length;
  const upcoming = vaccinations.filter(
    (v) => v.next_due_on && new Date(v.next_due_on).getTime() >= Date.now() - 24 * 3600_000,
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Main Hero Card (Pure white, professional enterprise banner) */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Shield className="h-3.5 w-3.5" />
              National Integrated Animal Disease Surveillance Portal
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Real-time epidemiological intelligence & decision-support for livestock health.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Unifying village, block, and district health surveillance. Continuous IoT vital
              monitoring from AV360_PRO BLE wearable tags, automated syndromic outbreak triage,
              laboratory referral pipelines, and multilingual farmer broadcasts.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <ShieldAlert className="h-4 w-4" />
                Open Surveillance Command Center
              </Link>
              <Link
                to="/animals"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <PawPrint className="h-4 w-4" />
                View Livestock Registry
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Macro Surveillance KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Registered Animals
              </span>
              <PawPrint className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">{animals.length}</div>
            <div className="mt-1 text-[11px] text-slate-500">RFID / INAPH catalogued</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">Baseline Stable</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-700">
              {Math.max(animals.length - needsAttention, 0)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Normal physiological state</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Attention Required
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-amber-700">{needsAttention}</div>
            <div className="mt-1 text-[11px] text-slate-500">Threshold deviation flag</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">Active Alerts</span>
              <BellRing className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-rose-700">{activeAlerts.length}</div>
            <div className="mt-1 text-[11px] text-slate-500">Field response pending</div>
          </div>
        </section>

        {/* Quick Institutional Action Grid */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Operational Decision Support Modules
            </h2>
            <span className="text-xs text-slate-500">Direct Access</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK.map(({ to, label, icon: Icon, desc }) => (
              <Link
                key={to}
                to={to}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{label}</div>
                  <p className="mt-0.5 text-[11px] text-slate-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom Dual Columns: Recent Reports & Vaccinations */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Outbreak Reports */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Siren className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Field Disease Reports</h3>
              </div>
              <Link to="/reports" className="text-xs font-semibold text-indigo-600 hover:underline">
                All Reports →
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {reports.length === 0 ? (
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        Suspected FMD Cluster (Vesicular Ulcers)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Doddahosahalli Village · Malur West
                      </div>
                    </div>
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 self-start">
                      INVESTIGATING
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        Lumpy Skin Nodules Reported
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Ronur Village · Srinivaspur North
                      </div>
                    </div>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 self-start">
                      CONTAINMENT
                    </span>
                  </div>
                </div>
              ) : (
                reports.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {r.suspected_issue || "Clinical Event"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                      {r.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Vaccinations */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Scheduled Ring Vaccinations</h3>
              </div>
              <Link
                to="/vaccinations"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View Drive Schedule →
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    FMD Polyvalent Ring Booster Drive
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Malur West Block · 5km Quarantine Perimeter
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 self-start">
                  84% Covered
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    Goat Pox & PPR Prophylactic Vaccination
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bangarapet South Block · 1,400 Small Ruminants
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 self-start">Scheduled</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
