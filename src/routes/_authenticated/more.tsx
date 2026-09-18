import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BellRing,
  Bluetooth,
  BrainCircuit,
  ChevronRight,
  Layers,
  LineChart,
  Pill,
  Siren,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { AppShell } from "@/components/av360/AppShell";
import { PageHeader } from "@/components/av360/PageHeader";
import { usePendingCount, useOnlineStatus } from "@/lib/av360/offline";

export const Route = createFileRoute("/_authenticated/more")({
  component: MorePage,
  head: () => ({
    meta: [
      { title: "Operations Directory · AVS 360" },
      {
        name: "description",
        content:
          "Alerts, disease reports, vaccinations, treatments, offline AI and device connection.",
      },
      { property: "og:title", content: "Operations Directory · AVS 360" },
      { property: "og:description", content: "All AVS 360 tools and field registry in one place." },
    ],
  }),
});

const ITEMS = [
  {
    to: "/alerts",
    label: "Surveillance Alert Center",
    desc: "Early biosecurity flags & critical alerts",
    icon: BellRing,
  },
  {
    to: "/reports",
    label: "Outbreak Disease Reports",
    desc: "Field epidemiological event submissions",
    icon: Siren,
  },
  {
    to: "/vaccinations",
    label: "Vaccination Registry",
    desc: "Active coverage, upcoming & overdue schedules",
    icon: Syringe,
  },
  {
    to: "/treatments",
    label: "Veterinary Treatment Logs",
    desc: "Clinical interventions & recovery tracking",
    icon: Pill,
  },
  {
    to: "/offline-ai",
    label: "Clinical AI Triage",
    desc: "Rule-based differential triage (no internet required)",
    icon: BrainCircuit,
  },
  {
    to: "/vet-summary",
    label: "Clinical Case Summary",
    desc: "Consolidated longitudinal dossier for attending vets",
    icon: Stethoscope,
  },
  {
    to: "/history",
    label: "Live Telemetry Charts",
    desc: "High-frequency vital buffer graphs",
    icon: LineChart,
  },
  {
    to: "/scanner",
    label: "Pair BLE Sensor Tag",
    desc: "Scan and pair AV360_PRO wearable tag",
    icon: Bluetooth,
  },
] as const;

function MorePage() {
  const pending = usePendingCount();
  const online = useOnlineStatus();

  return (
    <AppShell>
      <PageHeader
        title="Operations & Clinical Directory"
        icon={Layers}
        action={
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            {online ? (
              <span className="text-emerald-700 font-bold">Online Network</span>
            ) : (
              <span className="text-amber-700 font-bold">Offline Local Mode</span>
            )}
            {" · "}
            {pending > 0 ? `${pending} record(s) queued for sync` : "Local database synchronized"}
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {ITEMS.map(({ to, label, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900">{label}</div>
              <div className="text-[11px] text-slate-500 truncate">{desc}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
