import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bluetooth, BluetoothSearching, CheckCircle2, Cpu, Info } from "lucide-react";
import { AppShell } from "@/components/av360/AppShell";
import { PageHeader } from "@/components/av360/PageHeader";
import { ConnectionBanner } from "@/components/av360/ConnectionBanner";
import { telemetry, useTelemetry } from "@/lib/av360/store";
import { DEVICE_NAME, NORDIC_UART } from "@/lib/av360/types";

export const Route = createFileRoute("/_authenticated/scanner")({
  component: ScannerPage,
  head: () => ({ meta: [{ title: "Connect Wearable Sensor · AVS 360" }] }),
});

function ScannerPage() {
  const nav = useNavigate();
  const { connState, deviceName } = useTelemetry();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && !!navigator.bluetooth);
  }, []);

  useEffect(() => {
    if (connState === "connected") {
      toast.success(`Connected to ${deviceName ?? DEVICE_NAME}`);
      const t = setTimeout(() => nav({ to: "/dashboard" }), 600);
      return () => clearTimeout(t);
    }
  }, [connState, deviceName, nav]);

  const onScan = async () => {
    try {
      const r = await telemetry.scan();
      if (r) {
        setPicked({ id: r.id, name: r.name });
        await telemetry.connect();
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Connect AV360_PRO Wearable Tag" icon={Bluetooth} />
      <p className="mt-2 text-xs text-slate-500">
        Initiate BLE wireless telemetry discovery to link an ear-tag or collar sensor with the
        portal.
      </p>

      <div className="mt-4">
        <ConnectionBanner />
      </div>

      {supported === false && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <div className="font-bold">Web Bluetooth Unavailable on this Device/Browser</div>
            <div className="mt-1 text-slate-600">
              Open this portal in{" "}
              <span className="font-semibold text-slate-900">Chrome on Android or Edge</span> for
              native BLE. In the meantime, the portal streams simulated 1Hz vital signs in{" "}
              <span className="font-semibold text-slate-900">demo mode</span>.
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onScan}
        disabled={connState === "connecting" || connState === "connected"}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors active:scale-[0.98] disabled:opacity-60"
      >
        {connState === "scanning" || connState === "connecting" ? (
          <BluetoothSearching className="h-4 w-4 animate-pulse" />
        ) : (
          <Bluetooth className="h-4 w-4" />
        )}
        {connState === "scanning"
          ? "Scanning for Sensors…"
          : connState === "connecting"
            ? "Pairing BLE Stream…"
            : connState === "connected"
              ? "Sensor Connected & Streaming"
              : "Scan & Connect AV360_PRO Tag"}
      </button>

      {picked && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
              <Cpu className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900">{picked.name}</div>
              <div className="text-xs text-slate-500">
                Nordic UART Peripheral · GATT Primary Service
              </div>
            </div>
          </div>
          {connState === "connected" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        </div>
      )}

      <details className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs">
        <summary className="cursor-pointer font-semibold text-slate-700">
          Technical GATT Service UUIDs
        </summary>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs text-slate-600">
          <dt className="font-bold text-slate-700">Service:</dt>
          <dd>{NORDIC_UART.service}</dd>
          <dt className="font-bold text-slate-700">TX:</dt>
          <dd>{NORDIC_UART.tx}</dd>
          <dt className="font-bold text-slate-700">RX:</dt>
          <dd>{NORDIC_UART.rx}</dd>
        </dl>
      </details>
    </AppShell>
  );
}
