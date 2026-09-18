// Buffered line parser for ESP32 plain-text telemetry.
// Telemetry format (one key per line):
//   Animal: DOG
//   Heart Rate: 90
//   SpO2: 98
//   Temperature: 38.2
//   Status: NORMAL

import type { Animal, DeviceStatus } from "./types";

export interface ParsedFields {
  animal?: Animal;
  hr?: number;
  spo2?: number;
  temp?: number;
  status?: DeviceStatus;
}

const ANIMALS: Animal[] = ["DOG", "CAT", "COW", "GOAT"];

function parseAnimal(v: string): Animal | undefined {
  const up = v.trim().toUpperCase();
  return (ANIMALS as string[]).includes(up) ? (up as Animal) : undefined;
}

function parseStatus(v: string): DeviceStatus | undefined {
  const up = v.trim().toUpperCase();
  if (up === "NORMAL" || up === "WARNING" || up === "ALERT") return up;
  if (up === "NO CONTACT" || up === "NO_CONTACT") return "NO CONTACT";
  return undefined;
}

function parseNum(v: string): number | undefined {
  const n = Number(v.trim().replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export function parseLine(line: string): ParsedFields {
  const idx = line.indexOf(":");
  if (idx < 0) return {};
  const key = line.slice(0, idx).trim().toLowerCase();
  const val = line.slice(idx + 1);
  switch (key) {
    case "animal": {
      const a = parseAnimal(val);
      return a ? { animal: a } : {};
    }
    case "heart rate":
    case "hr":
      return { hr: parseNum(val) };
    case "spo2":
    case "spo₂":
      return { spo2: parseNum(val) };
    case "temperature":
    case "temp":
      return { temp: parseNum(val) };
    case "status": {
      const s = parseStatus(val);
      return s ? { status: s } : {};
    }
    default:
      return {};
  }
}

/** Buffers fragmented BLE packets and emits parsed fields per complete line. */
export class LineBufferParser {
  private buf = "";
  private decoder = new TextDecoder();

  feedBytes(data: ArrayBuffer | Uint8Array): ParsedFields {
    const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
    return this.feedText(this.decoder.decode(u8, { stream: true }));
  }

  feedText(text: string): ParsedFields {
    this.buf += text;
    const merged: ParsedFields = {};
    let nlIdx: number;
    while ((nlIdx = this.buf.search(/\r?\n/)) >= 0) {
      const line = this.buf.slice(0, nlIdx);
      this.buf = this.buf.slice(nlIdx + (this.buf[nlIdx] === "\r" ? 2 : 1));
      Object.assign(merged, parseLine(line));
    }
    // Cap buffer to avoid runaway memory if device never sends newlines.
    if (this.buf.length > 4096) this.buf = this.buf.slice(-1024);
    return merged;
  }

  reset() {
    this.buf = "";
  }
}
