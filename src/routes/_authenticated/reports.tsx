import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Siren, X } from "lucide-react";
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
import {
  SPECIES,
  insertRow,
  updateRow,
  useRows,
  useSelectedAnimal,
  type ReportRow,
} from "@/lib/av360/db";
import { useOnlineStatus } from "@/lib/av360/offline";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Disease Reports · AV360 Vet+" },
      {
        name: "description",
        content:
          "Report suspected animal disease or health events with village, block, district and state.",
      },
      { property: "og:title", content: "Disease & Outbreak Reporting · AV360 Vet+" },
      { property: "og:description", content: "Submit and track suspected animal health events." },
    ],
  }),
});

const STATUS_STYLE: Record<string, string> = {
  Submitted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  Escalated: "bg-rose-50 text-rose-700 border-rose-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function fmt(d: string | null) {
  if (!d) return "—";
  const parsed = new Date(`${d}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function ReportsPage() {
  const { rows, loading, reload } = useRows<ReportRow>("disease_reports", {
    orderBy: "created_at",
    ascending: false,
    limit: 100,
  });
  const { animals } = useSelectedAnimal();
  const online = useOnlineStatus();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ReportRow | null>(null);
  const [busy, setBusy] = useState(false);

  function startNew() {
    setEditing(null);
    setOpen((v) => !v);
  }

  function startEdit(r: ReportRow) {
    setEditing(r);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditing(null);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const affected = Number(f.get("affected_count") || 1);
    const deaths = Number(f.get("death_count") || 0);
    if (!Number.isFinite(affected) || affected < 1) {
      toast.error("Number of affected animals must be at least 1.");
      return;
    }
    if (!Number.isFinite(deaths) || deaths < 0 || deaths > affected) {
      toast.error("Deaths cannot be negative or greater than the number affected.");
      return;
    }

    setBusy(true);
    const payload = {
      animal_id: String(f.get("animal_id") || "") || null,
      species: String(f.get("species") || "DOG"),
      observed_on: String(f.get("observed_on") || todayISO()),
      affected_count: affected,
      death_count: deaths,
      symptoms: String(f.get("symptoms") || "") || null,
      suspected_issue: String(f.get("suspected_issue") || "") || null,
      village: String(f.get("village") || "") || null,
      block_taluk: String(f.get("block_taluk") || "") || null,
      district: String(f.get("district") || "Kolar"),
      state: String(f.get("state") || "Karnataka"),
      photo_url: String(f.get("photo_url") || "") || null,
      notes: String(f.get("notes") || "") || null,
      status: editing?.status ?? "Submitted",
    };

    try {
      if (editing) {
        await updateRow("disease_reports", editing.id, payload);
        toast.success("Disease report updated");
      } else {
        const res = await insertRow("disease_reports", payload);
        toast[res.pending ? "info" : "success"](
          res.pending ? "Saved offline — will sync automatically" : "Disease report submitted",
        );
      }
      close();
    } catch {
      toast.error("Could not save disease report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Disease Reports"
        icon={Siren}
        action={
          <button
            onClick={startNew}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            {open && !editing ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {open && !editing ? "Cancel" : "New Report"}
          </button>
        }
      />
      {!online && (
        <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          Offline — new reports are stored on this device and marked pending sync.
        </p>
      )}

      {open && (
        <form onSubmit={submit} className="mt-4" key={editing?.id ?? "new"}>
          <SectionCard title={editing ? "Edit disease report" : "Report a suspected health event"}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Animal" className="col-span-2">
                <SelectInput name="animal_id" defaultValue={editing?.animal_id ?? ""}>
                  <option value="">Not linked to one animal</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.tag_id})
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Animal type">
                <SelectInput name="species" defaultValue={editing?.species ?? "COW"}>
                  {SPECIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Date observed">
                <TextInput
                  name="observed_on"
                  type="date"
                  defaultValue={editing?.observed_on ?? todayISO()}
                />
              </Field>
              <Field label="Affected animals">
                <TextInput
                  name="affected_count"
                  type="number"
                  min={1}
                  defaultValue={editing?.affected_count ?? 1}
                />
              </Field>
              <Field label="Deaths">
                <TextInput
                  name="death_count"
                  type="number"
                  min={0}
                  defaultValue={editing?.death_count ?? 0}
                />
              </Field>
              <Field label="Symptoms" className="col-span-2">
                <TextArea
                  name="symptoms"
                  placeholder="Fever, lameness, drooling…"
                  defaultValue={editing?.symptoms ?? ""}
                />
              </Field>
              <Field label="Suspected health issue" className="col-span-2">
                <TextInput name="suspected_issue" defaultValue={editing?.suspected_issue ?? ""} />
              </Field>
              <Field label="Village">
                <TextInput name="village" defaultValue={editing?.village ?? ""} />
              </Field>
              <Field label="Block / Taluk">
                <TextInput name="block_taluk" defaultValue={editing?.block_taluk ?? ""} />
              </Field>
              <Field label="District">
                <TextInput name="district" defaultValue={editing?.district ?? "Kolar"} />
              </Field>
              <Field label="State">
                <TextInput name="state" defaultValue={editing?.state ?? "Karnataka"} />
              </Field>
              <Field label="Photo URL (optional)" className="col-span-2">
                <TextInput
                  name="photo_url"
                  placeholder="https://…"
                  defaultValue={editing?.photo_url ?? ""}
                />
              </Field>
              <Field label="Additional notes" className="col-span-2">
                <TextArea name="notes" defaultValue={editing?.notes ?? ""} />
              </Field>
            </div>
            <div className="mt-4 flex gap-2">
              <PrimaryButton disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Submit report"}
              </PrimaryButton>
              <button
                type="button"
                onClick={close}
                className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {loading && <div className="text-xs text-slate-500">Loading disease reports…</div>}
        {!loading && rows.length === 0 && (
          <EmptyState text="No disease reports yet. Submitted disease reports will appear here." />
        )}
        {!loading &&
          rows.map((r) => {
            const animal = animals.find((a) => a.id === r.animal_id);
            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="break-words text-sm font-bold text-slate-900">
                      {r.suspected_issue || "Suspected health event reported"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {animal ? `${animal.name} (${animal.tag_id}) · ` : ""}
                      {r.species ?? "—"} · Observed {fmt(r.observed_on)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      STATUS_STYLE[r.status] ?? "bg-slate-50 text-slate-600 border-slate-200",
                    )}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700">Affected:</span>{" "}
                    {r.affected_count} animals
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Mortality:</span> {r.death_count}{" "}
                    deaths
                  </div>
                </div>
                {r.symptoms && (
                  <div className="mt-2.5 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Clinical Symptoms:</span>{" "}
                    {r.symptoms}
                  </div>
                )}
                <div className="mt-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Location:</span>{" "}
                  {[r.village, r.block_taluk, r.district, r.state].filter(Boolean).join(", ") ||
                    "Location not specified"}
                </div>
                {r.notes && (
                  <div className="mt-2 text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-100/80">
                    <span className="font-semibold not-italic text-amber-900">
                      Investigation Notes:
                    </span>{" "}
                    {r.notes}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => startEdit(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-500" /> Edit Record
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <p className="mt-6 text-[10px] leading-relaxed text-muted-foreground">
        Submitted entries are recorded as a suspected outbreak / health event. Confirmation requires
        veterinary investigation.
      </p>
    </AppShell>
  );
}
