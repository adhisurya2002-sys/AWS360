import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pill, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/av360/AppShell";
import { PageHeader } from "@/components/av360/PageHeader";
import {
  EmptyState,
  Field,
  PrimaryButton,
  SectionCard,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/av360/form";
import { insertRow, useRows, useSelectedAnimal, type TreatmentRow } from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/treatments")({
  component: TreatmentsPage,
  head: () => ({
    meta: [
      { title: "Treatments · AVS 360" },
      {
        name: "description",
        content: "Record treatments, follow-up dates and recovery status for each animal.",
      },
      { property: "og:title", content: "Treatment Records · AVS 360" },
      { property: "og:description", content: "Full treatment history per animal." },
    ],
  }),
});

const RECOVERY = ["Ongoing", "Improving", "Recovered", "No change", "Deteriorating"];

function TreatmentsPage() {
  const { rows } = useRows<TreatmentRow>("treatments", { orderBy: "treated_on", limit: 200 });
  const { animals } = useSelectedAnimal();
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await insertRow("treatments", {
      animal_id: String(f.get("animal_id") || "") || null,
      issue: String(f.get("issue") || "") || null,
      treatment: String(f.get("treatment") || "") || null,
      medicine: String(f.get("medicine") || "") || null,
      treated_on: String(f.get("treated_on") || new Date().toISOString().slice(0, 10)),
      vet_name: String(f.get("vet_name") || "") || null,
      follow_up_on: String(f.get("follow_up_on") || "") || null,
      recovery_status: String(f.get("recovery_status") || "Ongoing"),
      notes: String(f.get("notes") || "") || null,
    });
    setOpen(false);
    toast[res.pending ? "info" : "success"](
      res.pending ? "Saved offline — pending sync" : "Treatment saved",
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Veterinary Treatment Logs"
        icon={Pill}
        action={
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {open ? "Cancel" : "Add Treatment"}
          </button>
        }
      />

      {open && (
        <form onSubmit={submit} className="mt-4">
          <SectionCard title="New treatment record">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Animal" className="col-span-2">
                <SelectInput name="animal_id" defaultValue="">
                  <option value="">Select animal</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.tag_id})
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Health issue" className="col-span-2">
                <TextInput
                  name="issue"
                  placeholder="Acute Mastitis, Theileriosis, Tick infestation…"
                />
              </Field>
              <Field label="Treatment provided" className="col-span-2">
                <TextInput
                  name="treatment"
                  placeholder="Intramammary antibiotic infusion, wound dressing…"
                />
              </Field>
              <Field label="Medicine / treatment name" className="col-span-2">
                <TextInput
                  name="medicine"
                  placeholder="Dosage, active ingredient, administration route…"
                />
              </Field>
              <Field label="Treatment date">
                <TextInput
                  name="treated_on"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </Field>
              <Field label="Follow-up date">
                <TextInput name="follow_up_on" type="date" />
              </Field>
              <Field label="Veterinarian">
                <TextInput name="vet_name" defaultValue="Dr. Rajesh Kumar" />
              </Field>
              <Field label="Recovery status">
                <SelectInput name="recovery_status" defaultValue="Ongoing">
                  {RECOVERY.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Notes" className="col-span-2">
                <TextArea
                  name="notes"
                  placeholder="Clinical observation, prognosis, quarantine status…"
                />
              </Field>
            </div>
            <div className="mt-4">
              <PrimaryButton>Save treatment</PrimaryButton>
            </div>
          </SectionCard>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {rows.length === 0 && <EmptyState text="No treatment records yet." />}
        {rows.map((t) => {
          const animal = animals.find((a) => a.id === t.animal_id);
          return (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900">
                    {t.issue || t.treatment || "Veterinary Treatment"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {animal ? `${animal.name} (${animal.tag_id})` : "General Animal Case"}
                    {t.treated_on ? ` · Treated on ${t.treated_on}` : ""}
                    {t.vet_name ? ` · Attending: ${t.vet_name}` : ""}
                    {t.follow_up_on ? ` · Follow-up scheduled ${t.follow_up_on}` : ""}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    t.recovery_status === "Recovered"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : t.recovery_status === "Improving"
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {t.recovery_status}
                </span>
              </div>

              {t.medicine && (
                <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Rx / Prescribed Therapy:</span>{" "}
                  {t.medicine}
                </div>
              )}

              {t.notes && <div className="mt-2 text-xs text-slate-600 italic">{t.notes}</div>}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Treatment records are for documentation only. AV360 Vet+ does not prescribe or recommend
        medicines.
      </p>
    </AppShell>
  );
}
