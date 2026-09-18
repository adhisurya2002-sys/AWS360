// Local, rule-based health-risk assessment engine (works fully offline).
import { ANIMAL_RANGES, type Animal } from "./types";

export type RiskLevel = "NORMAL" | "WARNING" | "ABNORMAL" | "CRITICAL" | "NO CONTACT";

export const RISK_ORDER: RiskLevel[] = ["NO CONTACT", "NORMAL", "WARNING", "ABNORMAL", "CRITICAL"];

export interface Finding {
  parameter: "Heart Rate" | "SpO₂" | "Temperature";
  key: "hr" | "spo2" | "temp";
  value: number;
  unit: string;
  range: string;
  severity: Exclude<RiskLevel, "NO CONTACT" | "NORMAL">;
  message: string;
}

export interface Assessment {
  level: RiskLevel;
  findings: Finding[];
  concern: string;
  recommendation: string;
}

const SPO2 = { normalMin: 95, warnMin: 92, abnormalMin: 88 };

function worse(a: RiskLevel, b: RiskLevel) {
  return RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;
}

export function speciesRanges(species: Animal | string | null) {
  const key = (species ?? "").toString().toUpperCase() as Animal;
  return (
    ANIMAL_RANGES[key] ?? {
      hr: [40, 180] as [number, number],
      temp: [35, 39.5] as [number, number],
    }
  );
}

export function assessVitals(input: {
  species: Animal | string | null;
  hr: number | null | undefined;
  spo2: number | null | undefined;
  temp: number | null | undefined;
  symptoms?: string;
}): Assessment {
  const { hr, spo2, temp } = input;
  const r = speciesRanges(input.species);
  const findings: Finding[] = [];

  if (hr == null && spo2 == null && temp == null) {
    return {
      level: "NO CONTACT",
      findings: [],
      concern: "No readings available.",
      recommendation: "Check sensor placement and device connection.",
    };
  }

  if (hr != null) {
    const [lo, hi] = r.hr;
    const span = hi - lo;
    const dev = hr < lo ? lo - hr : hr > hi ? hr - hi : 0;
    if (dev > 0) {
      const severity: Finding["severity"] =
        hr < 40 || hr > 180 ? "CRITICAL" : dev > span * 0.5 ? "ABNORMAL" : "WARNING";
      findings.push({
        parameter: "Heart Rate",
        key: "hr",
        value: hr,
        unit: "BPM",
        range: `${lo}–${hi} BPM`,
        severity,
        message: hr < lo ? "Low heart rate detected." : "Abnormal heart rate detected.",
      });
    }
  }

  if (spo2 != null && spo2 < SPO2.normalMin) {
    const severity: Finding["severity"] =
      spo2 < SPO2.abnormalMin ? "CRITICAL" : spo2 < SPO2.warnMin ? "ABNORMAL" : "WARNING";
    findings.push({
      parameter: "SpO₂",
      key: "spo2",
      value: spo2,
      unit: "%",
      range: "≥ 95 %",
      severity,
      message: "Low SpO₂ detected.",
    });
  }

  if (temp != null) {
    const [lo, hi] = r.temp;
    const dev = temp < lo ? lo - temp : temp > hi ? temp - hi : 0;
    if (dev > 0) {
      const severity: Finding["severity"] =
        temp < 35 || temp > 40.5 ? "CRITICAL" : dev > 0.8 ? "ABNORMAL" : "WARNING";
      findings.push({
        parameter: "Temperature",
        key: "temp",
        value: temp,
        unit: "°C",
        range: `${lo.toFixed(1)}–${hi.toFixed(1)} °C`,
        severity,
        message: temp < lo ? "Low body temperature detected." : "High body temperature detected.",
      });
    }
  }

  let level: RiskLevel = "NORMAL";
  for (const f of findings) level = worse(level, f.severity);
  // Multiple abnormal parameters escalate one step.
  if (findings.filter((f) => f.severity !== "WARNING").length >= 2) level = "CRITICAL";

  const symptomText = (input.symptoms ?? "").trim();
  if (symptomText && level === "NORMAL") level = "WARNING";

  const concern =
    level === "NORMAL"
      ? "No abnormal vital signs detected."
      : findings.length > 1
        ? "Multiple abnormal parameters detected. Possible health risk detected."
        : `${findings[0]?.message ?? "Possible health risk detected."} Possible health risk detected.`;

  const recommendation =
    level === "CRITICAL"
      ? "Veterinary attention recommended immediately. Keep the animal calm and monitor continuously."
      : level === "ABNORMAL"
        ? "Veterinary evaluation recommended. Re-check the readings within the next few hours."
        : level === "WARNING"
          ? "Monitor the animal and consult a veterinarian if the condition persists."
          : "Continue routine monitoring.";

  return { level, findings, concern, recommendation };
}

export const RISK_STYLES: Record<
  RiskLevel,
  { text: string; bg: string; ring: string; label: string }
> = {
  NORMAL: { text: "text-success", bg: "bg-success/15", ring: "ring-success/40", label: "Normal" },
  WARNING: { text: "text-warning", bg: "bg-warning/15", ring: "ring-warning/40", label: "Warning" },
  ABNORMAL: { text: "text-danger", bg: "bg-danger/10", ring: "ring-danger/40", label: "Abnormal" },
  CRITICAL: { text: "text-danger", bg: "bg-danger/20", ring: "ring-danger/60", label: "Critical" },
  "NO CONTACT": {
    text: "text-muted-foreground",
    bg: "bg-muted",
    ring: "ring-border",
    label: "No Contact",
  },
};
