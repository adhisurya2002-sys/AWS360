import { Link } from "@tanstack/react-router";
import { telemetry, useTelemetry } from "@/lib/av360/store";
import { Bluetooth, BluetoothConnected, BluetoothSearching, BluetoothOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConnectionBanner() {
  const { connState, deviceName } = useTelemetry();

  const variants = {
    connected: {
      Icon: BluetoothConnected,
      text: `Connected to ${deviceName ?? "AV360_PRO"}`,
      cls: "border-primary/50 bg-primary/10 text-primary",
    },
    connecting: {
      Icon: BluetoothSearching,
      text: "Connecting…",
      cls: "border-warning/40 bg-warning/10 text-warning",
    },
    reconnecting: {
      Icon: BluetoothSearching,
      text: "Reconnecting… retry every 5s",
      cls: "border-warning/40 bg-warning/10 text-warning",
    },
    scanning: {
      Icon: BluetoothSearching,
      text: "Scanning for devices…",
      cls: "border-accent/40 bg-accent/10 text-accent",
    },
    disconnected: {
      Icon: BluetoothOff,
      text: "Device Disconnected",
      cls: "border-danger/40 bg-danger/10 text-danger",
    },
    idle: {
      Icon: Bluetooth,
      text: "Not connected — tap to connect",
      cls: "border-border bg-card text-muted-foreground",
    },
    unsupported: {
      Icon: BluetoothOff,
      text: "BLE unsupported — running in demo mode",
      cls: "border-border bg-card text-muted-foreground",
    },
  } as const;

  const v = variants[connState] ?? variants.idle;
  const { Icon } = v;

  const isConnected = connState === "connected";
  const action = isConnected ? () => telemetry.disconnect() : null;

  const inner = (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs font-medium",
        v.cls,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{v.text}</span>
      </div>
      {isConnected ? (
        <button onClick={action!} className="text-[10px] uppercase tracking-wider hover:underline">
          Disconnect
        </button>
      ) : (
        <span className="text-[10px] uppercase tracking-wider opacity-70">Tap →</span>
      )}
    </div>
  );

  return isConnected ? inner : <Link to="/scanner">{inner}</Link>;
}
