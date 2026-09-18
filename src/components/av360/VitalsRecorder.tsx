import { useEffect, useRef } from "react";
import { useTelemetry } from "@/lib/av360/store";
import { assessVitals } from "@/lib/av360/assess";
import { insertRow, useSelectedAnimal } from "@/lib/av360/db";
import { syncPending } from "@/lib/av360/db";

const SAVE_EVERY_MS = 30_000;
const ALERT_COOLDOWN_MS = 5 * 60_000;

/**
 * Side-effect component: persists real BLE readings to Health Records and
 * creates early alerts. It never invents readings — it only stores what the
 * existing BLE pipeline delivered.
 */
export function VitalsRecorder() {
  const t = useTelemetry();
  const { animal } = useSelectedAnimal();
  const lastSave = useRef(0);
  const lastAlert = useRef<Record<string, number>>({});

  // Flush any offline-queued records once connectivity returns.
  useEffect(() => {
    const run = () => void syncPending();
    run();
    window.addEventListener("online", run);
    return () => window.removeEventListener("online", run);
  }, []);

  useEffect(() => {
    if (t.connState !== "connected") return;
    if (!t.lastDataAt || Date.now() - t.lastDataAt > 3000) return;
    if (t.hr == null && t.spo2 == null && t.temp == null) return;

    const a = assessVitals({
      species: animal?.species ?? t.animal,
      hr: t.hr,
      spo2: t.spo2,
      temp: t.temp,
    });

    const now = Date.now();
    if (now - lastSave.current >= SAVE_EVERY_MS) {
      lastSave.current = now;
      void insertRow("health_readings", {
        animal_id: animal?.id ?? null,
        hr: t.hr,
        spo2: t.spo2,
        temperature: t.temp,
        status: a.level,
        recorded_at: new Date().toISOString(),
      });
    }

    if (a.level === "ABNORMAL" || a.level === "CRITICAL") {
      for (const f of a.findings) {
        if (f.severity === "WARNING") continue;
        const key = `${animal?.id ?? "unassigned"}:${f.key}`;
        if (now - (lastAlert.current[key] ?? 0) < ALERT_COOLDOWN_MS) continue;
        lastAlert.current[key] = now;
        void insertRow("alerts", {
          animal_id: animal?.id ?? null,
          category: "VITALS",
          parameter: f.parameter,
          value: f.value,
          expected_range: f.range,
          severity: f.severity,
          message: f.message,
          recommendation: a.recommendation,
        });
      }
    }
  }, [t.hr, t.spo2, t.temp, t.connState, t.lastDataAt, t.animal, animal]);

  return null;
}
