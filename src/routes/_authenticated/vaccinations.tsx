import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Syringe, X } from "lucide-react";
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
import { insertRow, useRows, useSelectedAnimal, type VaccinationRow } from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vaccinations")({
  component: VaccinationsPage,
  head: () => ({
    meta: [
      { title: "Vaccinations · AV360 Vet+" },
      {
        name: "description",
        content: "Track completed, upcoming and overdue animal vaccinations with reminders.",
      },
      { property: "og:title", content: "Vaccination Records · AV360 Vet+" },
      { property: "og:description", content: "Keep vaccination schedules for every animal." },
    ],
  }),
});

type Bucket = "upcoming" | "overdue" | "completed";
const TABS: Bucket[] = ["upcoming", "overdue", "completed"];

/** Today as YYYY-MM-DD in local time — avoids timezone drift on date-only fields. */
function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/**
 * Classification (string compare on date-only values):
 * - next due date in the past  -> overdue
 * - next due date today/future -> upcoming
 * - no next due date, already administered -> completed
 * - nothing recorded yet -> upcoming
 */
export function bucketOf(v: {
  administered_on: string | null;
  next_due_on: string | null;
}): Bucket {
  const today = todayISO();
  if (v.next_due_on) return v.next_due_on < today ? "overdue" : "upcoming";
  return v.administered_on ? "completed" : "upcoming";
}

const EMPTY_TEXT: Record<Bucket, string> = {
  upcoming:
    "No upcoming vaccinations. Scheduled vaccinations with a next due date will appear here.",
  overdue: "No overdue vaccinations. Anything past its due date will appear here.",
  completed:
    "No completed vaccinations yet. Administered vaccinations without a next due date will appear here.",
};

function fmt(d: string | null) {
  if (!d) return "—";
  const parsed = new Date(`${d}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function VaccinationsPage() {
  const { rows, loading, reload } = useRows<VaccinationRow>("vaccinations", {
    orderBy: "created_at",
    ascending: false,
    limit: 200,
  });
  const { animals } = useSelectedAnimal();
  const [tab, setTab] = useState<Bucket>("upcoming");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const autoTabbed = useRef(false);

  // On first load, land on a tab that actually has records so saved data is never hidden.
  useEffect(() => {
    if (loading || autoTabbed.current || rows.length === 0) return;
    autoTabbed.current = true;
    const firstWithRows = TABS.find((t) => rows.some((v) => bucketOf(v) === t));
    if (firstWithRows) setTab(firstWithRows);
  }, [loading, rows]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const vaccine_name = String(f.get("vaccine_name") || "").trim();
    const administered_on = String(f.get("administered_on") || "") || null;
    const next_due_on = String(f.get("next_due_on") || "") || null;
    if (!vaccine_name) {
      toast.error("Enter the vaccine name.");
      return;
    }
    if (!administered_on && !next_due_on) {
      toast.error("Add either the date administered or the next due date.");
      return;
    }
    if (administered_on && next_due_on && next_due_on < administered_on) {
      toast.error("The next due date must be after the date administered.");
      return;
    }

    setBusy(true);
    const res = await insertRow("vaccinations", {
      animal_id: String(f.get("animal_id") || "") || null,
      vaccine_name,
      administered_on,
      next_due_on,
      administered_by: String(f.get("administered_by") || "") || null,
      notes: String(f.get("notes") || "") || null,
    });
    setBusy(false);
    setOpen(false);
    // Show the tab the new record belongs to, then refresh from the database.
    autoTabbed.current = true;
    setTab(bucketOf({ administered_on, next_due_on }));
    await reload();
    toast[res.pending ? "info" : "success"](
      res.pending
        ? "Saved on this device — will sync when you're back online"
        : "Vaccination saved",
    );
  }

  const counts = TABS.reduce(
    (acc, t) => ({ ...acc, [t]: rows.filter((v) => bucketOf(v) === t).length }),
    {} as Record<Bucket, number>,
  );
  const list = rows.filter((v) => bucketOf(v) === tab);

  return (
    <AppShell>
      <PageHeader
        title="Vaccination Records"
        icon={Syringe}
        action={
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {open ? "Cancel" : "Add Vaccination"}
          </button>
        }
      />

      {open && (
        <form onSubmit={submit} className="mt-4">
          <SectionCard title="New vaccination">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Animal" className="col-span-2">
                <SelectInput name="animal_id" defaultValue="">
                  <option value="">Not linked to one animal</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.tag_id})
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Vaccine name" className="col-span-2">
                <TextInput name="vaccine_name" required placeholder="FMD, Rabies, PPR…" />
              </Field>
              <Field label="Date administered">
                <TextInput name="administered_on" type="date" defaultValue={todayISO()} />
              </Field>
              <Field label="Next due date">
                <TextInput name="next_due_on" type="date" />
              </Field>
              <Field label="Veterinarian / health worker" className="col-span-2">
                <TextInput name="administered_by" defaultValue="Dr. Rajesh Kumar" />
              </Field>
              <Field label="Notes" className="col-span-2">
                <TextArea
                  name="notes"
                  placeholder="Batch number, route of administration, adverse reactions…"
                />
              </Field>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Add a next due date to keep the vaccination in Upcoming; leave it empty to file it as
              Completed.
            </p>
            <div className="mt-4 flex gap-2">
              <PrimaryButton disabled={busy}>{busy ? "Saving…" : "Save vaccination"}</PrimaryButton>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      <div className="mt-4 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              autoTabbed.current = true;
              setTab(t);
            }}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all",
              tab === t
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60",
            )}
          >
            {t} ({counts[t] ?? 0})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading && <div className="text-xs text-slate-500">Loading vaccination records…</div>}
        {!loading && list.length === 0 && <EmptyState text={EMPTY_TEXT[tab]} />}
        {!loading &&
          list.map((v) => {
            const animal = animals.find((a) => a.id === v.animal_id);
            const overdue = bucketOf(v) === "overdue";
            return (
              <div
                key={v.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">{v.vaccine_name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {animal
                        ? `${animal.name} (${animal.tag_id})`
                        : "Universal Herd / Sentinel Stock"}
                      {v.administered_on
                        ? ` · Administered on ${fmt(v.administered_on)}`
                        : " · Not yet administered"}
                      {v.administered_by ? ` · By ${v.administered_by}` : ""}
                    </div>
                  </div>
                  {v.next_due_on && (
                    <span
                      className={cn(
                        "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        overdue
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700",
                      )}
                    >
                      {overdue ? "Overdue" : "Next Due"} {fmt(v.next_due_on)}
                    </span>
                  )}
                </div>
                {v.notes && (
                  <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600">
                    {v.notes}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </AppShell>
  );
}
