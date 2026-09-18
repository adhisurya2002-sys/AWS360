import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BrainCircuit, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/av360/AppShell";
import { PageHeader } from "@/components/av360/PageHeader";
import {
  Field,
  PrimaryButton,
  SectionCard,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/av360/form";
import { assessVitals, RISK_STYLES, type Assessment } from "@/lib/av360/assess";
import { SPECIES, insertRow, useSelectedAnimal } from "@/lib/av360/db";
import { useOnlineStatus } from "@/lib/av360/offline";
import { useTelemetry } from "@/lib/av360/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/offline-ai")({
  component: OfflineAiPage,
  head: () => ({
    meta: [
      { title: "Offline Clinical AI Triage · AVS 360" },
      {
        name: "description",
        content: "Rule-based animal health-risk assessment that works without internet.",
      },
      { property: "og:title", content: "Offline Clinical AI · AVS 360" },
      {
        property: "og:description",
        content: "Preliminary health-risk assessment for dogs, cats, cows and goats — offline.",
      },
    ],
  }),
});

function OfflineAiPage() {
  const online = useOnlineStatus();
  const t = useTelemetry();
  const { animal } = useSelectedAnimal();
  const [result, setResult] = useState<Assessment | null>(null);
  const [form, setForm] = useState({
    species: animal?.species ?? t.animal ?? "COW",
    hr: "",
    spo2: "",
    temp: "",
    symptoms: "",
    observations: "",
  });

  function useLive() {
    setForm((f) => ({
      ...f,
      hr: t.hr != null ? String(t.hr) : "",
      spo2: t.spo2 != null ? String(t.spo2) : "",
      temp: t.temp != null ? String(t.temp) : "",
    }));
    toast.success("Filled with the latest sensor telemetry readings");
  }

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const a = assessVitals({
      species: form.species,
      hr: num(form.hr),
      spo2: num(form.spo2),
      temp: num(form.temp),
      symptoms: form.symptoms,
    });
    setResult(a);
    const res = await insertRow("ai_assessments", {
      animal_id: animal?.id ?? null,
      species: form.species,
      hr: num(form.hr),
      spo2: num(form.spo2),
      temperature: num(form.temp),
      symptoms: form.symptoms || null,
      observations: form.observations || null,
      status: a.level,
      risk_level: a.level,
      concern: a.concern,
      recommendation: a.recommendation,
    });
    if (res.pending) toast.info("Assessment saved offline — pending sync");
    else toast.success("Health-risk assessment computed successfully");
  }

  const st = result ? RISK_STYLES[result.level] : null;

  return (
    <AppShell>
      <PageHeader
        title="Offline Clinical AI Triage"
        icon={BrainCircuit}
        action={
          !online ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
              <WifiOff className="h-3.5 w-3.5" /> Edge Engine Offline
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              Local Rulepack Active
            </span>
          )
        }
      />

      <p className="mt-2 text-xs text-slate-500">
        Rule-based epidemiological health-risk assessment using animal-specific physiological
        baseline reference ranges. Operates 100% locally without cloud dependency.
      </p>

      <form onSubmit={run} className="mt-4">
        <SectionCard
          title="Clinical & Physiological Inputs"
          action={
            <button
              type="button"
              onClick={useLive}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Use Live Telemetry Readings
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Animal type">
              <SelectInput
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
              >
                {SPECIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Heart rate (BPM)">
              <TextInput
                inputMode="decimal"
                value={form.hr}
                placeholder="e.g. 65"
                onChange={(e) => setForm({ ...form, hr: e.target.value })}
              />
            </Field>
            <Field label="SpO₂ (%)">
              <TextInput
                inputMode="decimal"
                value={form.spo2}
                placeholder="e.g. 97"
                onChange={(e) => setForm({ ...form, spo2: e.target.value })}
              />
            </Field>
            <Field label="Core Temperature (°C)">
              <TextInput
                inputMode="decimal"
                value={form.temp}
                placeholder="e.g. 38.6"
                onChange={(e) => setForm({ ...form, temp: e.target.value })}
              />
            </Field>
            <Field label="Observed Symptoms" className="col-span-2">
              <TextArea
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                placeholder="Loss of appetite, nasal discharge, salivation, lameness…"
              />
            </Field>
            <Field label="Epidemiological Observations" className="col-span-2">
              <TextArea
                value={form.observations}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                placeholder="Flock contact history, pasture access, recent cattle fairs…"
              />
            </Field>
          </div>
          <div className="mt-4">
            <PrimaryButton>Assess Health Risk</PrimaryButton>
          </div>
        </SectionCard>
      </form>

      {result && st && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Computed Clinical Health Status
              </div>
              <div className={cn("text-xl font-extrabold mt-0.5", st.text)}>{st.label}</div>
            </div>
            <span
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-bold uppercase",
                result.level === "CRITICAL"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : result.level === "WARNING"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
            >
              Risk: {result.level}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {result.findings.length === 0 ? (
              <p className="text-xs text-slate-600">
                All physiological parameters within normal baseline range.
              </p>
            ) : (
              result.findings.map((f) => (
                <div
                  key={f.key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
                >
                  <div className="font-bold text-slate-900">{f.message}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {f.parameter}:{" "}
                    <span className="font-semibold text-slate-800">
                      {f.value} {f.unit}
                    </span>{" "}
                    (expected baseline {f.range}) · Severity: {f.severity}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <div className="font-bold text-slate-900">Possible Health Concern</div>
              <p className="mt-1 text-slate-600">{result.concern}</p>
            </div>
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs">
              <div className="font-bold text-indigo-950">Recommended Clinical Action</div>
              <p className="mt-1 text-indigo-900">{result.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-500">
        This is a preliminary epidemiological health-risk assessment engine and does not replace
        confirmed laboratory diagnosis or licensed veterinary intervention.
      </p>
    </AppShell>
  );
}
