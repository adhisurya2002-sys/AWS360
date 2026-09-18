import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";
import { AppShell } from "@/components/av360/AppShell";
import { PageHeader } from "@/components/av360/PageHeader";
import { AnimalPicker } from "@/components/av360/AnimalPicker";
import { EmptyState, SectionCard } from "@/components/av360/form";
import { assessVitals, RISK_STYLES } from "@/lib/av360/assess";
import {
  useRows,
  useSelectedAnimal,
  type AlertRow,
  type ReadingRow,
  type ReportRow,
  type TreatmentRow,
  type VaccinationRow,
} from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vet-summary")({
  component: VetSummaryPage,
  head: () => ({
    meta: [
      { title: "Clinical Case Summary · AVS 360" },
      {
        name: "description",
        content:
          "A one-screen case overview for veterinary review: vitals, alerts, treatments and vaccinations.",
      },
      { property: "og:title", content: "Veterinary Summary · AVS 360" },
      {
        property: "og:description",
        content: "Quick case overview for faster veterinary intervention.",
      },
    ],
  }),
});

function VetSummaryPage() {
  const { animal } = useSelectedAnimal();
  const eq = animal ? { animal_id: animal.id } : {};
  const { rows: readings } = useRows<ReadingRow>("health_readings", {
    orderBy: "recorded_at",
    eq,
    limit: 20,
  });
  const { rows: alerts } = useRows<AlertRow>("alerts", { orderBy: "created_at", eq, limit: 10 });
  const { rows: treatments } = useRows<TreatmentRow>("treatments", {
    orderBy: "treated_on",
    eq,
    limit: 5,
  });
  const { rows: vaccinations } = useRows<VaccinationRow>("vaccinations", {
    orderBy: "administered_on",
    eq,
    limit: 5,
  });
  const { rows: reports } = useRows<ReportRow>("disease_reports", {
    orderBy: "created_at",
    limit: 5,
  });

  const latest = readings[0];
  const a = assessVitals({
    species: animal?.species ?? null,
    hr: latest?.hr == null ? null : Number(latest.hr),
    spo2: latest?.spo2 == null ? null : Number(latest.spo2),
    temp: latest?.temperature == null ? null : Number(latest.temperature),
  });
  const st = RISK_STYLES[a.level];

  return (
    <AppShell>
      <PageHeader title="Veterinary Clinical Case Dossier" icon={Stethoscope} />

      <div className="mt-4">
        <AnimalPicker />
      </div>

      {!animal ? (
        <div className="mt-4">
          <EmptyState text="Select an animal to generate a comprehensive clinical dossier." />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {(a.level === "CRITICAL" || a.level === "ABNORMAL") && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
              Immediate veterinary clinical attention recommended based on detected physiological
              baseline deviations.
            </div>
          )}

          <SectionCard title="Animal">
            <div className="text-xs text-muted-foreground">
              {animal.name} · {animal.tag_id} · {animal.species}
              {animal.breed ? ` · ${animal.breed}` : ""}
              {animal.age_months ? ` · ${animal.age_months} months` : ""}
              {animal.gender ? ` · ${animal.gender}` : ""}
              {animal.owner_name ? ` · Owner: ${animal.owner_name}` : ""}
            </div>
            {animal.notes && <p className="mt-2 text-xs text-muted-foreground">{animal.notes}</p>}
          </SectionCard>

          <SectionCard title="Latest stored readings">
            {!latest ? (
              <p className="text-xs text-muted-foreground">No stored readings yet.</p>
            ) : (
              <>
                <div className={cn("text-sm font-semibold", st.text)}>{st.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {latest.hr ?? "—"} BPM · {latest.spo2 ?? "—"}% · {latest.temperature ?? "—"}°C ·{" "}
                  {new Date(latest.recorded_at).toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{a.concern}</div>
                <div className="mt-1 text-xs text-muted-foreground">{a.recommendation}</div>
              </>
            )}
          </SectionCard>

          <SectionCard title="Recent history (last 20 readings)">
            {readings.length === 0 ? (
              <p className="text-xs text-muted-foreground">No history.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {readings.map((r) => (
                  <li key={r.id} className="flex justify-between">
                    <span>
                      {r.hr ?? "—"} / {r.spo2 ?? "—"} / {r.temperature ?? "—"}
                    </span>
                    <span>
                      {r.status} · {new Date(r.recorded_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent alerts">
            {alerts.length === 0 ? (
              <p className="text-xs text-muted-foreground">None.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {alerts.map((al) => (
                  <li key={al.id}>
                    {al.severity} · {al.message} · {new Date(al.created_at).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Previous treatments">
            {treatments.length === 0 ? (
              <p className="text-xs text-muted-foreground">None.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {treatments.map((t) => (
                  <li key={t.id}>
                    {t.treated_on} · {t.issue ?? "—"} · {t.medicine ?? "—"} · {t.recovery_status}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Vaccination status">
            {vaccinations.length === 0 ? (
              <p className="text-xs text-muted-foreground">No vaccinations recorded.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {vaccinations.map((v) => (
                  <li key={v.id}>
                    {v.vaccine_name} · {v.administered_on ?? "—"}
                    {v.next_due_on ? ` · next due ${v.next_due_on}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Disease reports">
            {reports.length === 0 ? (
              <p className="text-xs text-muted-foreground">None.</p>
            ) : (
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {reports.map((r) => (
                  <li key={r.id}>
                    {r.observed_on} · {r.suspected_issue ?? "Suspected event"} · {r.status}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}
