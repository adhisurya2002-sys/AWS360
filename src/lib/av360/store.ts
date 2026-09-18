// Global state store for AV360 telemetry. Plain pub/sub, no extra deps.

import { useEffect, useState, useSyncExternalStore } from "react";
import { getBleAdapter, type BleAdapter } from "./ble";
import {
  evaluateStatus,
  type Animal,
  type ConnState,
  type DeviceStatus,
  type Reading,
} from "./types";

const NO_CONTACT_TIMEOUT_MS = 3000;
const HISTORY_WINDOW_MS = 15 * 60 * 1000;

interface State {
  animal: Animal | null;
  hr: number | null;
  spo2: number | null;
  temp: number | null;
  status: DeviceStatus;
  connState: ConnState;
  deviceName: string | null;
  lastDataAt: number | null;
  history: Reading[];
}

const initial: State = {
  animal: null,
  hr: null,
  spo2: null,
  temp: null,
  status: "NO CONTACT",
  connState: "idle",
  deviceName: null,
  lastDataAt: null,
  history: [],
};

class TelemetryStore {
  private state: State = initial;
  private listeners = new Set<() => void>();
  private adapter: BleAdapter | null = null;
  private historyTimer: ReturnType<typeof setInterval> | null = null;

  init() {
    if (this.adapter) return;
    if (typeof window === "undefined") return;
    this.adapter = getBleAdapter();
    this.adapter.onState((s) => {
      this.set({ connState: s, deviceName: this.adapter?.getDeviceName() ?? null });
    });
    this.adapter.onData((f) => {
      const next: Partial<State> = {};
      if (f.animal !== undefined) next.animal = f.animal;
      if (f.hr !== undefined) next.hr = f.hr;
      if (f.spo2 !== undefined) next.spo2 = f.spo2;
      if (f.temp !== undefined) next.temp = f.temp;
      next.lastDataAt = Date.now();
      this.set(next, /* recompute */ true);
    });

    // 1-second tick: recompute status / NO CONTACT / push to history.
    this.historyTimer = setInterval(() => this.tick(), 1000);
  }

  private tick() {
    const s = this.state;
    let status: DeviceStatus;
    const stale =
      s.connState !== "connected" ||
      !s.lastDataAt ||
      Date.now() - s.lastDataAt > NO_CONTACT_TIMEOUT_MS;
    if (stale) {
      status = "NO CONTACT";
    } else {
      status = evaluateStatus({ hr: s.hr, spo2: s.spo2, temp: s.temp });
    }

    const reading: Reading = {
      ts: Date.now(),
      animal: s.animal,
      hr: stale ? null : s.hr,
      spo2: stale ? null : s.spo2,
      temp: stale ? null : s.temp,
      status,
      connState: s.connState,
    };
    const cutoff = Date.now() - HISTORY_WINDOW_MS;
    const history = [...s.history, reading].filter((r) => r.ts >= cutoff);
    this.set({ status, history });
  }

  private set(patch: Partial<State>, _recompute = false) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  getSnapshot = () => this.state;
  getServerSnapshot = () => initial;

  // ---- public actions ----
  async scan() {
    this.init();
    return this.adapter!.requestDevice();
  }
  async connect() {
    this.init();
    await this.adapter!.connect();
  }
  async disconnect() {
    await this.adapter?.disconnect(true);
  }
  async setAnimal(a: Animal) {
    this.init();
    if (this.adapter?.getState() === "connected") {
      await this.adapter.writeAnimal(a);
    } else {
      // still update local selection
      this.set({ animal: a });
    }
  }
  getMode() {
    this.init();
    return this.adapter?.mode ?? "mock";
  }
  isWebBluetoothSupported() {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }
}

export const telemetry = new TelemetryStore();

export function useTelemetry(): State {
  return useSyncExternalStore(
    telemetry.subscribe,
    telemetry.getSnapshot,
    telemetry.getServerSnapshot,
  );
}

/** Hook returning a value that re-renders only every `intervalMs` (defaults 1s). */
export function useThrottledTelemetry(intervalMs = 1000): State {
  const live = useTelemetry();
  const [snap, setSnap] = useState(live);
  useEffect(() => {
    const id = setInterval(() => setSnap(telemetry.getSnapshot()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return snap;
}
