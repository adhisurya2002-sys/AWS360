import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Activity,
  BellRing,
  Bluetooth,
  BluetoothConnected,
  BrainCircuit,
  FileSpreadsheet,
  Layers,
  LineChart,
  LogOut,
  PawPrint,
  Pill,
  Radio,
  Shield,
  ShieldAlert,
  Siren,
  Syringe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelemetry } from "@/lib/av360/store";
import { useOnlineStatus, usePendingCount } from "@/lib/av360/offline";
import { VitalsRecorder } from "@/components/av360/VitalsRecorder";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Surveillance Command", icon: ShieldAlert },
  { to: "/animals", label: "Animal Registry", icon: PawPrint },
  { to: "/records", label: "Health Records", icon: LineChart },
  { to: "/reports", label: "Outbreak Reports", icon: Siren },
  { to: "/vaccinations", label: "Vaccinations", icon: Syringe },
  { to: "/treatments", label: "Treatments", icon: Pill },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/offline-ai", label: "Clinical AI", icon: BrainCircuit },
] as const;

function SensorConnBadge() {
  const { connState, deviceName } = useTelemetry();
  const isConnected = connState === "connected";

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
      {isConnected ? (
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
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const online = useOnlineStatus();
  const pending = usePendingCount();

  // Enforce pure white background across the entire browser viewport
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0f172a";
    return () => {
      // Clean up if unmounted
    };
  }, []);

  async function signOut() {
    localStorage.removeItem("av360:demo_mode");
    await supabase.auth.signOut().catch(() => {});
    nav({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Institutional Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        {/* Tier 1: Department Ribbon */}
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
              <span>Hub: IAH&VB Bangalore</span>
              <span className="font-semibold text-slate-700">Official Portal Version 3.4</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Main Institutional Navbar */}
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
                  National Veterinary Health Surveillance & Decision Support System
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-6 border-l border-slate-200 pl-6">
              {NAV_ITEMS.map(({ to, label }) => {
                const active = loc.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <SensorConnBadge />

            {(!online || pending > 0) && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                {!online ? "Offline Mode" : `${pending} queued`}
              </span>
            )}

            {/* Veterinarian Profile & Logout */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="hidden text-right md:block">
                <div className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</div>
                <div className="text-[10px] text-slate-500">KA-VET-8832 · Field Epidemiologist</div>
              </div>
              <button
                type="button"
                onClick={signOut}
                title="Sign out of portal"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Secondary Bar */}
        <div className="flex lg:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-2 bg-white">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Page Body */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 w-full flex-1">{children}</main>

      <VitalsRecorder />

      {/* Institutional Webpage Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-50 py-6 text-xs text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-bold text-slate-900">
              Department of Animal Husbandry & Veterinary Services · Government of Karnataka
            </div>
            <div className="text-[11px] text-slate-500">
              National Livestock Health & Disease Control Surveillance Network (AVS 360 Enterprise)
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <span>
              24x7 Toll-Free Emergency Hotline:{" "}
              <strong className="text-slate-800">1800-425-0012</strong>
            </span>
            <span>·</span>
            <span>Diagnostic Lab: IAH&VB Bangalore</span>
            <span>·</span>
            <span>District Diagnostic Hub: Kolar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
