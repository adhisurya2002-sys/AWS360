import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTelemetry } from "@/lib/av360/store";
import { THRESHOLDS } from "@/lib/av360/types";

const RATE_LIMIT_MS = 10_000;

function beep() {
  try {
    const Ctx =
      (
        window as unknown as {
          AudioContext?: typeof AudioContext;
          webkitAudioContext?: typeof AudioContext;
        }
      ).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.value = 0.06;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 220);
  } catch {
    /* ignore */
  }
}

function vibrate() {
  try {
    navigator.vibrate?.([180, 80, 180]);
  } catch {
    /* ignore */
  }
}

interface AlertKey {
  type: "spo2" | "hr" | "temp";
  msg: string;
}

function evaluateAlerts(s: {
  hr: number | null;
  spo2: number | null;
  temp: number | null;
}): AlertKey[] {
  const out: AlertKey[] = [];
  const t = THRESHOLDS;
  if (s.spo2 != null && s.spo2 < t.spo2Min) out.push({ type: "spo2", msg: `Low SpO₂: ${s.spo2}%` });
  if (s.hr != null && (s.hr < t.hrMin || s.hr > t.hrMax))
    out.push({ type: "hr", msg: `Abnormal heart rate: ${s.hr} BPM` });
  if (s.temp != null && (s.temp < t.tempMin || s.temp > t.tempMax))
    out.push({ type: "temp", msg: `Abnormal temperature: ${s.temp}°C` });
  return out;
}

/** Side-effect component: watches telemetry and fires alerts. */
export function AlertWatcher() {
  const { hr, spo2, temp, connState } = useTelemetry();
  const lastFired = useRef<Record<string, number>>({});
  const wasAbnormal = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (connState !== "connected") return;
    const alerts = evaluateAlerts({ hr, spo2, temp });
    const now = Date.now();
    const activeTypes = new Set(alerts.map((a) => a.type));

    // Reset rate-limit when value returns to normal.
    (["spo2", "hr", "temp"] as const).forEach((k) => {
      if (!activeTypes.has(k) && wasAbnormal.current[k]) {
        wasAbnormal.current[k] = false;
        toast.success(`${k.toUpperCase()} returned to normal`);
      }
    });

    for (const a of alerts) {
      const last = lastFired.current[a.type] ?? 0;
      if (!wasAbnormal.current[a.type] || now - last > RATE_LIMIT_MS) {
        lastFired.current[a.type] = now;
        wasAbnormal.current[a.type] = true;
        toast.error(a.msg, { duration: 4000 });
        beep();
        vibrate();
      }
    }
  }, [hr, spo2, temp, connState]);

  return null;
}
