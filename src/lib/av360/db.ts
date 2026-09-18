// Record storage helpers for AV360 Vet+ (animals, readings, alerts, reports, vaccinations, treatments).
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { enqueueWrite, flushQueue, isOnline } from "./offline";

export type AnimalRow = Tables<"animals">;
export type ReadingRow = Tables<"health_readings">;
export type AlertRow = Tables<"alerts">;
export type ReportRow = Tables<"disease_reports">;
export type VaccinationRow = Tables<"vaccinations">;
export type TreatmentRow = Tables<"treatments">;
export type AssessmentRow = Tables<"ai_assessments">;

export type TableName =
  | "animals"
  | "health_readings"
  | "alerts"
  | "disease_reports"
  | "vaccinations"
  | "treatments"
  | "ai_assessments";

export const DEFAULT_ANIMALS: AnimalRow[] = [
  {
    id: "animal-cow-1",
    tag_id: "KA-07-DL-4821",
    name: "Lakshmi",
    species: "COW",
    breed: "Holstein-Friesian Cross",
    age_months: 36,
    gender: "Female",
    owner_name: "Ramesh Gowda · Malur West Block",
    photo_url: null,
    notes:
      "High yield dairy cow. Wearable BLE sensor AV360_PRO attached to ear tag. Routine FMD booster completed.",
    created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "animal-buf-2",
    tag_id: "KA-07-MB-1092",
    name: "Ganga",
    species: "COW",
    breed: "Murrah Buffalo",
    age_months: 48,
    gender: "Female",
    owner_name: "Suresh Reddy · Srinivaspur Block",
    photo_url: null,
    notes: "Under ring vaccination monitoring for Lumpy Skin Disease. Lactating female.",
    created_at: new Date(Date.now() - 25 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "animal-goat-3",
    tag_id: "KA-07-OG-3304",
    name: "Bheema",
    species: "GOAT",
    breed: "Osmanabadi",
    age_months: 18,
    gender: "Male",
    owner_name: "Manjunath K · Bangarapet Block",
    photo_url: null,
    notes: "Flock sentinel goat. PPR vaccination scheduled for next cycle.",
    created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "animal-bull-4",
    tag_id: "KA-07-KB-5512",
    name: "Nandi",
    species: "COW",
    breed: "Kankrej Indigenous Bull",
    age_months: 52,
    gender: "Male",
    owner_name: "Anand Kumar · Kolar Central",
    photo_url: null,
    notes: "Draft & breeding bull. Tested negative for Brucellosis and Bovine TB.",
    created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "animal-dog-5",
    tag_id: "KA-07-MD-7701",
    name: "Tiger",
    species: "DOG",
    breed: "Mudhol Hound Guard Dog",
    age_months: 24,
    gender: "Male",
    owner_name: "Venkatesh M · Mulbagal Block",
    photo_url: null,
    notes: "Farm protection canine. Annual Anti-Rabies Vaccine (ARV) and DHPPi administered.",
    created_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "animal-goat-6",
    tag_id: "KA-07-JG-9182",
    name: "Champa",
    species: "GOAT",
    breed: "Jamnapari Goat",
    age_months: 14,
    gender: "Female",
    owner_name: "Shridhar Gowda · Malur Block",
    photo_url: null,
    notes:
      "Isolated for mild catarrhal discharge. Biospecimen sent to DDL Kolar for confirmatory testing.",
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
];

export const DEFAULT_REPORTS: ReportRow[] = [
  {
    id: "rep-1",
    animal_id: "animal-cow-1",
    species: "COW",
    observed_on: "2026-09-15",
    affected_count: 8,
    death_count: 0,
    symptoms:
      "High pyrexia (40.8 °C), excessive ropy salivation, vesicular erosions on dental pad and interdigital cleft.",
    suspected_issue: "Foot-and-Mouth Disease (FMD) Serotype O",
    village: "Doddamalur",
    block_taluk: "Malur",
    district: "Kolar",
    state: "Karnataka",
    status: "Under Review",
    photo_url: null,
    notes:
      "Vesicular fluid swab and epithelial tag collected. Sent to IAH&VB Bangalore diagnostic virology lab.",
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "rep-2",
    animal_id: "animal-goat-3",
    species: "GOAT",
    observed_on: "2026-09-16",
    affected_count: 14,
    death_count: 1,
    symptoms:
      "Acute pyrexia, purulent ocular and nasal discharge, necrotizing stomatitis, severe diarrhea.",
    suspected_issue: "Peste des Petits Ruminants (PPR)",
    village: "Kamasamudram",
    block_taluk: "Bangarapet",
    district: "Kolar",
    state: "Karnataka",
    status: "Escalated",
    photo_url: null,
    notes:
      "Flock quarantine instituted. Ring vaccination buffer of 3 km activated under Karnataka DAH&VS protocol.",
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "rep-3",
    animal_id: "animal-buf-2",
    species: "COW",
    observed_on: "2026-09-17",
    affected_count: 3,
    death_count: 0,
    symptoms:
      "Circumscribed firm cutaneous nodules across neck and back, enlarged prescapular lymph nodes.",
    suspected_issue: "Lumpy Skin Disease (LSD) Sentinel Watch",
    village: "Rayalpad",
    block_taluk: "Srinivaspur",
    district: "Kolar",
    state: "Karnataka",
    status: "Submitted",
    photo_url: null,
    notes:
      "Vector control measures deployed; goat pox heterologous vaccination recommended for in-contact cattle.",
    created_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "rep-4",
    animal_id: "animal-dog-5",
    species: "DOG",
    observed_on: "2026-09-10",
    affected_count: 1,
    death_count: 0,
    symptoms: "Aggressive behavior, ptyalism, barking voice alteration, unprovoked bite incident.",
    suspected_issue: "Canine Rabies Field Quarantine",
    village: "Avani",
    block_taluk: "Mulbagal",
    district: "Kolar",
    state: "Karnataka",
    status: "Resolved",
    photo_url: null,
    notes:
      "Canine secured in isolation cage. Post-exposure prophylaxis initiated for exposed handler.",
    created_at: new Date(Date.now() - 8 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
];

export const DEFAULT_VACCINATIONS: VaccinationRow[] = [
  {
    id: "vac-1",
    animal_id: "animal-cow-1",
    vaccine_name: "Foot-and-Mouth Disease (FMD) Trivalent Vaccine",
    administered_on: "2026-08-10",
    next_due_on: "2027-02-10",
    administered_by: "Dr. Rajesh Kumar · DDL Kolar",
    notes: "Subcutaneous 2ml injection. Batch FMD-KA-883. Ear notch verification completed.",
    created_at: new Date(Date.now() - 35 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "vac-2",
    animal_id: "animal-goat-3",
    vaccine_name: "PPR Homologous Live Attenuated Vaccine",
    administered_on: "2026-06-15",
    next_due_on: "2029-06-15",
    administered_by: "Para-vet M. Gowda · Bangarapet Dispensary",
    notes: "3-year immunity protocol. Herd vaccination card stamped and documented.",
    created_at: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "vac-3",
    animal_id: "animal-bull-4",
    vaccine_name: "Hemorrhagic Septicemia (HS) Alum Precipitated",
    administered_on: "2026-05-20",
    next_due_on: "2026-11-20",
    administered_by: "Dr. Suma Rao · Kolar Central Polyclinic",
    notes: "Pre-monsoon immunization campaign.",
    created_at: new Date(Date.now() - 110 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "vac-4",
    animal_id: "animal-dog-5",
    vaccine_name: "Anti-Rabies Inactivated Cell Culture Vaccine (ARV)",
    administered_on: "2026-09-01",
    next_due_on: "2027-09-01",
    administered_by: "Dr. Rajesh Kumar",
    notes: "Annual booster with national companion registration.",
    created_at: new Date(Date.now() - 17 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "vac-5",
    animal_id: "animal-goat-6",
    vaccine_name: "Enterotoxemia (ET) Vaccine",
    administered_on: null,
    next_due_on: "2026-09-25",
    administered_by: "Malur Veterinary Dispensary",
    notes: "Scheduled for upcoming village vaccination drive.",
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "vac-6",
    animal_id: "animal-cow-1",
    vaccine_name: "Black Quarter (BQ) Polyvalent Vaccine",
    administered_on: "2025-07-10",
    next_due_on: "2026-07-10",
    administered_by: "Dr. Rajesh Kumar",
    notes: "Overdue annual booster reminder dispatched to cattle owner.",
    created_at: new Date(Date.now() - 400 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
];

export const DEFAULT_TREATMENTS: TreatmentRow[] = [
  {
    id: "trt-1",
    animal_id: "animal-cow-1",
    issue: "Acute Mastitis (Right Forequarter)",
    treatment: "Intramammary Cloxacillin Infusion & NSAID",
    medicine: "Cephalosporin 3g + Meloxicam 15ml",
    treated_on: "2026-09-12",
    vet_name: "Dr. Rajesh Kumar",
    follow_up_on: "2026-09-19",
    recovery_status: "Improving",
    notes: "Milk somatic cell count dropping; somatic test scheduled for follow-up.",
    created_at: new Date(Date.now() - 6 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "trt-2",
    animal_id: "animal-goat-6",
    issue: "Contagious Ecthyma (Orf) Lesions",
    treatment: "Antiseptic debridement and topical dressing",
    medicine: "Povidone Iodine ointment + Zinc supplement",
    treated_on: "2026-09-14",
    vet_name: "Dr. Suma Rao",
    follow_up_on: "2026-09-21",
    recovery_status: "Ongoing",
    notes: "Isolated in hospital pen away from sentinel herd.",
    created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "trt-3",
    animal_id: "animal-bull-4",
    issue: "Bovine Theileriosis (Tick-borne)",
    treatment: "Single dose Buparvaquone therapy",
    medicine: "Buparvaquone (2.5 mg/kg) + Oxytetracycline",
    treated_on: "2026-08-20",
    vet_name: "Dr. Rajesh Kumar",
    follow_up_on: "2026-09-05",
    recovery_status: "Recovered",
    notes: "Blood smear post-treatment shows zero intra-erythrocytic piroplasms.",
    created_at: new Date(Date.now() - 28 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
];

export const DEFAULT_ALERTS: AlertRow[] = [
  {
    id: "alt-1",
    animal_id: "animal-cow-1",
    category: "CLINICAL",
    message: "Elevated Core Body Temperature (40.4 °C) flagged by telemetry",
    parameter: "Temperature",
    value: 40.4,
    expected_range: "38.0 – 39.3 °C",
    recommendation:
      "Examine for acute inflammatory/pyrexial response. Inspect oral cavity and hooves.",
    severity: "CRITICAL",
    state: "new",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "alt-2",
    animal_id: "animal-goat-6",
    category: "CONTAINMENT",
    message: "Active PPR containment zone: Ring radius within 3.0 km of Kamasamudram",
    parameter: "Biosecurity",
    value: null,
    expected_range: null,
    recommendation:
      "Strict movement restriction on caprine livestock; ring vaccination team deployed.",
    severity: "WARNING",
    state: "acknowledged",
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "alt-3",
    animal_id: "animal-cow-1",
    category: "VACCINATION",
    message: "Annual BQ (Black Quarter) vaccination booster overdue by >60 days",
    parameter: "Immunization",
    value: null,
    expected_range: "Annual",
    recommendation: "Dispatch mobile veterinary team to Malur West block.",
    severity: "WARNING",
    state: "new",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "00000000-0000-0000-0000-000000000000",
  },
];

const LOCAL_STORAGE_KEYS: Record<string, string> = {
  animals: "av360:local_animals",
  disease_reports: "av360:local_disease_reports",
  vaccinations: "av360:local_vaccinations",
  treatments: "av360:local_treatments",
  alerts: "av360:local_alerts",
};

const DEFAULT_TABLE_ROWS: Record<string, unknown[]> = {
  animals: DEFAULT_ANIMALS,
  disease_reports: DEFAULT_REPORTS,
  vaccinations: DEFAULT_VACCINATIONS,
  treatments: DEFAULT_TREATMENTS,
  alerts: DEFAULT_ALERTS,
};

function getLocalTable<T>(table: string): T[] {
  const fallback = (DEFAULT_TABLE_ROWS[table] ?? []) as T[];
  if (typeof window === "undefined") return fallback;
  const key = LOCAL_STORAGE_KEYS[table];
  if (!key) return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalTable<T>(table: string, rows: T[]) {
  if (typeof window !== "undefined") {
    const key = LOCAL_STORAGE_KEYS[table];
    if (key) {
      localStorage.setItem(key, JSON.stringify(rows));
    }
  }
}

const listeners = new Set<() => void>();
export function notifyRecordsChanged() {
  listeners.forEach((l) => l());
}
function subscribeRecords(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export interface QueryOpts {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  eq?: Record<string, string | null | undefined>;
}

export function useRows<T>(table: TableName, opts: QueryOpts = {}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(opts);

  const load = useCallback(async () => {
    const o: QueryOpts = JSON.parse(key);
    const local = getLocalTable<T>(table);

    let q = supabase.from(table).select("*");
    for (const [col, val] of Object.entries(o.eq ?? {})) {
      if (val) q = q.eq(col, val);
    }
    if (o.orderBy) q = q.order(o.orderBy, { ascending: o.ascending ?? false });
    if (o.limit) q = q.limit(o.limit);

    try {
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        setRows(data as T[]);
      } else {
        setRows(local);
      }
    } catch {
      setRows(local);
    }
    setLoading(false);
  }, [table, key]);

  useEffect(() => {
    load();
    return subscribeRecords(load);
  }, [load]);

  return { rows, loading, reload: load };
}

/** Insert a row; queues locally when offline so nothing is lost. */
export async function insertRow(
  table: TableName,
  payload: Record<string, unknown>,
): Promise<{ pending: boolean }> {
  const { data: auth } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const body = {
    ...payload,
    id: payload.id || `${table.slice(0, 3)}-${Date.now()}`,
    created_at: payload.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: auth?.user?.id || "00000000-0000-0000-0000-000000000000",
  };

  const current = getLocalTable<Record<string, unknown>>(table);
  saveLocalTable(table, [body, ...current]);

  if (!isOnline()) {
    enqueueWrite(table, body);
    notifyRecordsChanged();
    return { pending: true };
  }
  const { error } = await supabase.from(table).insert(body as never);
  if (error) {
    enqueueWrite(table, body);
    notifyRecordsChanged();
    return { pending: true };
  }
  notifyRecordsChanged();
  return { pending: false };
}

export async function updateRow(table: TableName, id: string, patch: Record<string, unknown>) {
  const current = getLocalTable<Record<string, unknown>>(table);
  const updated = current.map((a) =>
    a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a,
  );
  saveLocalTable(table, updated);

  const { error } = await supabase
    .from(table)
    .update(patch as never)
    .eq("id", id);
  if (error) {
    // Handled locally
  }
  notifyRecordsChanged();
}

export async function deleteRow(table: TableName, id: string) {
  const current = getLocalTable<Record<string, unknown>>(table);
  const filtered = current.filter((a) => a.id !== id);
  saveLocalTable(table, filtered);

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    // Handled
  }
  notifyRecordsChanged();
}

export async function syncPending() {
  const n = await flushQueue();
  if (n > 0) notifyRecordsChanged();
  return n;
}

// ---- selected animal (shared across screens) ----
const SELECTED_KEY = "av360.selectedAnimal";
const selectedListeners = new Set<() => void>();

export function setSelectedAnimalId(id: string | null) {
  if (id) localStorage.setItem(SELECTED_KEY, id);
  else localStorage.removeItem(SELECTED_KEY);
  selectedListeners.forEach((l) => l());
}

export function useSelectedAnimal() {
  const { rows } = useRows<AnimalRow>("animals", { orderBy: "created_at", ascending: true });
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const read = () => setId(localStorage.getItem(SELECTED_KEY));
    read();
    selectedListeners.add(read);
    return () => {
      selectedListeners.delete(read);
    };
  }, []);

  const animal = rows.find((a) => a.id === id) ?? rows[0] ?? null;
  return { animal, animals: rows, select: setSelectedAnimalId };
}

export const SPECIES = ["COW", "GOAT", "DOG", "CAT"] as const;
export const SPECIES_EMOJI: Record<string, string> = {
  DOG: "",
  CAT: "",
  COW: "",
  GOAT: "",
};
