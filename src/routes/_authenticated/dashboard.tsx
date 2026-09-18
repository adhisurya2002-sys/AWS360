import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bluetooth,
  BluetoothConnected,
  Cat,
  CheckCircle2,
  Clock,
  Dog,
  Download,
  Droplet,
  Heart,
  Layers,
  LogOut,
  PawPrint,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Stethoscope,
  Tag,
  Thermometer,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { SurveillanceCommand } from "@/components/av360/SurveillanceCommand";
import { supabase } from "@/integrations/supabase/client";
import { telemetry, useTelemetry, useThrottledTelemetry } from "@/lib/av360/store";
import { assessVitals, type RiskLevel } from "@/lib/av360/assess";
import { useSelectedAnimal } from "@/lib/av360/db";
import { getAnimalRange, type Animal } from "@/lib/av360/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Epidemic Surveillance & Decision Command · AVS 360" },
      {
        name: "description",
        content:
          "Official animal health surveillance, syndromic outbreak triage, and real-time field telemetry portal.",
      },
    ],
  }),
});

const ANIMAL_PROFILES = [
  { key: "COW" as Animal, label: "Bovine (Cattle)", icon: PawPrint, sub: "Normal: 48–84 BPM" },
  { key: "GOAT" as Animal, label: "Caprine (Goat)", icon: Activity, sub: "Normal: 70–90 BPM" },
  { key: "DOG" as Animal, label: "Canine (Dog)", icon: Dog, sub: "Normal: 60–140 BPM" },
  { key: "CAT" as Animal, label: "Feline (Cat)", icon: Cat, sub: "Normal: 140–220 BPM" },
];

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"surveillance" | "telemetry">("surveillance");
  const nav = useNavigate();

  // Enforce pure white background across the entire browser viewport
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0f172a";
    return () => {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  const t = useThrottledTelemetry(1000);
  const { connState, deviceName } = useTelemetry();
  const { animal, animals, select } = useSelectedAnimal();

  const ranges = getAnimalRange(t.animal);
  const hrHint = `${ranges.hr[0]} – ${ranges.hr[1]} BPM`;
  const tempHint = `${ranges.temp[0].toFixed(1)} – ${ranges.temp[1].toFixed(1)} °C`;

  const assessment = assessVitals({
    species: animal?.species ?? t.animal,
    hr: t.hr,
    spo2: t.spo2,
    temp: t.temp,
  });
  const level: RiskLevel = t.status === "NO CONTACT" ? "NO CONTACT" : assessment.level;

  async function handleSignOut() {
    localStorage.removeItem("av360:demo_mode");
    await supabase.auth.signOut().catch(() => {});
    nav({ to: "/auth", replace: true });
  }

  const handleProfileSelect = async (a: Animal) => {
    localStorage.setItem("av360.animal", a);
    try {
      await telemetry.setAnimal(a);
      toast.success(`Active sensor profile switched to ${a}`);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Institutional Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        {/* Tier 1: Official Department Branding Strip */}
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-1.5 text-xs text-slate-600 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
              <span>
                Government of Karnataka · Department of Animal Husbandry & Veterinary Services
              </span>
            </div>
            <div className="hidden items-center gap-4 text-[11px] text-slate-500 md:flex">
              <span>Jurisdiction: Kolar District (KA-07)</span>
              <span>Regional Diagnostic Hub: IAH&VB Bangalore</span>
              <span className="font-semibold text-slate-700">Official Portal Version 3.4</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Main Navigation Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900">AVS 360</span>
                  <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    SURVEILLANCE
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Animal Disease Early Warning & Decision Support System
                </p>
              </div>
            </Link>

            {/* Main Links */}
            <nav className="hidden xl:flex items-center gap-1 ml-6 border-l border-slate-200 pl-6">
              <Link
                to="/dashboard"
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
              >
                Surveillance Command
              </Link>
              <Link
                to="/animals"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Animal Registry
              </Link>
              <Link
                to="/records"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Health Records
              </Link>
              <Link
                to="/reports"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Outbreak Reports
              </Link>
              <Link
                to="/vaccinations"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Vaccinations
              </Link>
              <Link
                to="/treatments"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Treatments
              </Link>
              <Link
                to="/alerts"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Alerts
              </Link>
              <Link
                to="/offline-ai"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Clinical AI
              </Link>
            </nav>
          </div>

          {/* Right Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Sensor Connection Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              {connState === "connected" ? (
                <>
                  <BluetoothConnected className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-700">{deviceName ?? "AV360_PRO"}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                </>
              ) : (
                <>
                  <Bluetooth className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500">Sensor Standby (Demo)</span>
                </>
              )}
            </div>

            {/* Official Profile & Sign Out */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="hidden text-right md:block">
                <div className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</div>
                <div className="text-[10px] text-slate-500">KA-VET-8832 · Field Epidemiologist</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out of portal"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Webpage Content Body */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        {/* Top Control Strip & Operational Tab Switcher */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {activeTab === "surveillance"
                ? "Veterinary Epidemiological Surveillance & Containment"
                : "Continuous Field Sensor Telemetry (1Hz Vitallink)"}
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              {activeTab === "surveillance"
                ? "Real-time syndromic triage, geospatial containment perimeters, laboratory referral pipeline, and multilingual advisories."
                : "Real-time wearable BLE biometric telemetry streaming (Heart Rate, SpO₂, Temperature, and offline triage assessment)."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("surveillance")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all",
                  activeTab === "surveillance"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
                )}
              >
                <ShieldAlert
                  className={cn(
                    "h-4 w-4",
                    activeTab === "surveillance" ? "text-white" : "text-indigo-600",
                  )}
                />
                Surveillance Command
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("telemetry")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all",
                  activeTab === "telemetry"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
                )}
              >
                <Stethoscope
                  className={cn(
                    "h-4 w-4",
                    activeTab === "telemetry" ? "text-white" : "text-emerald-600",
                  )}
                />
                Live Sensor Telemetry
              </button>
            </div>

            <button
              type="button"
              onClick={() => toast.success("Surveillance epidemiological bulletin exported (PDF).")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Export Bulletin
            </button>
          </div>
        </div>

        {/* Dynamic View: Tab 1 (Macro Surveillance Command) vs Tab 2 (Micro Field Telemetry) */}
        {activeTab === "surveillance" ? (
          <SurveillanceCommand />
        ) : (
          <div className="space-y-6">
            {/* Live Field Telemetry View (Pure White Clinical Portal) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Active Animal Profile & Clinical Diagnostic Card */}
              <div className="space-y-6 lg:col-span-4">
                {/* Animal Profile Selector (Clean, Lucide Icons, ZERO EMOJIS) */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Diagnostic Species Profile
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Configures physiological baseline thresholds
                      </p>
                    </div>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {t.animal ?? "DEFAULT"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {ANIMAL_PROFILES.map(({ key, label, icon: Icon, sub }) => {
                      const active = (t.animal ?? "COW") === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleProfileSelect(key)}
                          className={cn(
                            "flex flex-col items-start rounded-lg border p-3 text-left transition-all",
                            active
                              ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50",
                          )}
                        >
                          <div className="flex w-full items-center justify-between">
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                active ? "text-indigo-600" : "text-slate-500",
                              )}
                            />
                            {active && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                          </div>
                          <div className="mt-2 text-xs font-bold text-slate-900">{label}</div>
                          <div className="text-[10px] text-slate-500">{sub}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Registered Farm Animal Selector */}
                  {animals.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Select Individual Registered Animal
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {animals.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => select(a.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                              animal?.id === a.id
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                            )}
                          >
                            <Tag className="h-3 w-3" />
                            <span>{a.name}</span>
                            <span className="text-[10px] opacity-75">({a.tag_id})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-time Health Risk Assessment Card */}
                <div
                  className={cn(
                    "rounded-xl border p-5 shadow-sm transition-all",
                    level === "CRITICAL"
                      ? "border-rose-300 bg-rose-50/40"
                      : level === "WARNING"
                        ? "border-amber-300 bg-amber-50/40"
                        : level === "NO CONTACT"
                          ? "border-slate-200 bg-slate-50/50"
                          : "border-emerald-300 bg-emerald-50/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Automated Triage Assessment
                      </span>
                      <div
                        className={cn(
                          "mt-0.5 text-xl font-extrabold tracking-tight",
                          level === "CRITICAL"
                            ? "text-rose-700"
                            : level === "WARNING"
                              ? "text-amber-800"
                              : level === "NO CONTACT"
                                ? "text-slate-600"
                                : "text-emerald-800",
                        )}
                      >
                        {level === "CRITICAL"
                          ? "CRITICAL HEALTH ALERT"
                          : level === "WARNING"
                            ? "ATTENTION REQUIRED"
                            : level === "NO CONTACT"
                              ? "SENSOR STANDBY"
                              : "NORMAL PHYSIOLOGICAL STATE"}
                      </div>
                    </div>
                    <Activity
                      className={cn(
                        "h-6 w-6",
                        level === "CRITICAL"
                          ? "text-rose-600"
                          : level === "WARNING"
                            ? "text-amber-600"
                            : level === "NO CONTACT"
                              ? "text-slate-400"
                              : "text-emerald-600",
                      )}
                    />
                  </div>

                  {assessment.findings.length > 0 && level !== "NO CONTACT" ? (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="font-semibold text-slate-900">{assessment.concern}</div>
                      <p className="text-slate-700">{assessment.recommendation}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-600">
                      All streamed vitals fall within standard veterinary reference parameters for{" "}
                      {animal?.species ?? t.animal}.
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] text-slate-500">
                    <span>Engine: Clinical Rule Matrix v2.1</span>
                    <span>
                      Last packet:{" "}
                      {t.lastDataAt ? new Date(t.lastDataAt).toLocaleTimeString() : "Live"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Density Clinical Metric Cards & Real-Time Waveform */}
              <div className="space-y-6 lg:col-span-8">
                {/* 4 Clinical Metric Cards (Pure White, Dark Text, Zero Emojis) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Heart Rate Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-wider">Heart Rate</span>
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {t.hr ?? "—"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">BPM</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span>Normal Band</span>
                      <span className="font-medium text-slate-700">{hrHint}</span>
                    </div>
                  </div>

                  {/* SpO2 Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Pulse Oximetry
                      </span>
                      <Droplet className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {t.spo2 ?? "—"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">% SpO₂</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span>Clinical Threshold</span>
                      <span className="font-medium text-slate-700">≥ 90%</span>
                    </div>
                  </div>

                  {/* Body Temperature Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Temperature
                      </span>
                      <Thermometer className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {t.temp != null ? t.temp.toFixed(1) : "—"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">°C</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span>Pyrexia Band</span>
                      <span className="font-medium text-slate-700">{tempHint}</span>
                    </div>
                  </div>

                  {/* Sensor State Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Device Stream
                      </span>
                      <Radio className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold tracking-tight text-slate-900">
                        {connState === "connected" ? "1.0 Hz" : "SIMULATED"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span>Bluetooth Link</span>
                      <span className="font-medium text-emerald-600">Active</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Real-Time ECG / Pulse Rhythm Oscilloscope */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Real-Time Photoplethysmography (PPG) Waveform
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Continuous optical cardiac rhythm from AV360_PRO BLE collar tag
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Live Optical Stream
                      </span>
                    </div>
                  </div>

                  {/* Simulated SVG Oscilloscope Grid */}
                  <div className="mt-4 relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-4">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                    <svg viewBox="0 0 600 120" className="w-full h-28 stroke-emerald-400 fill-none">
                      <path
                        d="M 0 60 L 50 60 L 60 55 L 70 65 L 80 60 L 120 60 L 130 30 L 140 95 L 150 50 L 160 65 L 170 60 L 220 60 L 230 55 L 240 65 L 250 60 L 290 60 L 300 30 L 310 95 L 320 50 L 330 65 L 340 60 L 390 60 L 400 55 L 410 65 L 420 60 L 460 60 L 470 30 L 480 95 L 490 50 L 500 65 L 510 60 L 560 60 L 600 60"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>SWEEP: 25 mm/s</span>
                      <span>AMPLITUDE: 10 mm/mV</span>
                      <span>SAMPLING: 1000 Hz</span>
                    </div>
                  </div>

                  {/* Fast Action Toolbar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">
                      Subject Tag:{" "}
                      <strong className="text-slate-900">
                        {animal ? animal.tag_id : "AV360-TAG-DEMO"}
                      </strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toast.success("Vital telemetry snapshot saved to clinical database.")
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-100 transition-colors"
                      >
                        Snapshot Telemetry
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info("Diagnostic requisition generated for this animal.")
                        }
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                      >
                        Order Lab Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
