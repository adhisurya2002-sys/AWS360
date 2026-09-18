// AV360 Vet+ shared types.

export type Animal = "DOG" | "CAT" | "COW" | "GOAT";

export type DeviceStatus = "NORMAL" | "WARNING" | "ALERT" | "NO CONTACT";

export type ConnState =
  | "idle"
  | "scanning"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "unsupported";

export interface Reading {
  ts: number;
  animal: Animal | null;
  hr: number | null;
  spo2: number | null;
  temp: number | null;
  status: DeviceStatus;
  connState: ConnState;
}

export const NORDIC_UART = {
  service: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  tx: "6e400003-b5a3-f393-e0a9-e50e24dcca9e", // ESP32 -> App (notify)
  rx: "6e400002-b5a3-f393-e0a9-e50e24dcca9e", // App -> ESP32 (write)
} as const;

export const DEVICE_NAME = "AV360_PRO";

// Animal-specific reference ranges displayed on the dashboard.
export const ANIMAL_RANGES: Record<Animal, { hr: [number, number]; temp: [number, number] }> = {
  DOG: { hr: [70, 120], temp: [37.5, 39.2] },
  CAT: { hr: [120, 140], temp: [38.1, 39.2] },
  COW: { hr: [48, 84], temp: [38.0, 39.3] },
  GOAT: { hr: [70, 80], temp: [38.5, 39.7] },
};

export function getAnimalRange(animal: Animal | null): {
  hr: [number, number];
  temp: [number, number];
} {
  if (!animal) return { hr: [40, 180], temp: [35.0, 39.5] };
  return ANIMAL_RANGES[animal];
}

// Alert thresholds (V1).
export const THRESHOLDS = {
  spo2Min: 90,
  hrMin: 40,
  hrMax: 180,
  tempMin: 35.0,
  tempMax: 39.5,
} as const;

export function evaluateStatus(r: {
  hr: number | null;
  spo2: number | null;
  temp: number | null;
}): DeviceStatus {
  if (r.hr == null && r.spo2 == null && r.temp == null) return "NO CONTACT";
  const t = THRESHOLDS;
  let warn = false;
  if (r.spo2 != null && r.spo2 < t.spo2Min) return "ALERT";
  if (r.hr != null && (r.hr < t.hrMin || r.hr > t.hrMax)) return "ALERT";
  if (r.temp != null && (r.temp < t.tempMin || r.temp > t.tempMax)) return "ALERT";
  if (r.spo2 != null && r.spo2 < t.spo2Min + 3) warn = true;
  if (r.hr != null && (r.hr < t.hrMin + 5 || r.hr > t.hrMax - 10)) warn = true;
  if (r.temp != null && (r.temp < t.tempMin + 0.5 || r.temp > t.tempMax - 0.5)) warn = true;
  return warn ? "WARNING" : "NORMAL";
}
