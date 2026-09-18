import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CloudRain,
  Database,
  FileText,
  Languages,
  Layers,
  MapPin,
  Microscope,
  PhoneCall,
  Radio,
  Send,
  ShieldAlert,
  Syringe,
  ThermometerSun,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  ACTIVE_CLUSTERS,
  CURRENT_WEATHER_EPI,
  DISTRICT_BLOCKS,
  LAB_REFERRALS,
  MULTILINGUAL_ADVISORIES,
  type AdminLevel,
  type LabReferral,
  type OutbreakCluster,
} from "@/lib/av360/surveillance";
import { OpenStreetMapGIS } from "@/components/av360/OpenStreetMapGIS";
import { cn } from "@/lib/utils";

export function SurveillanceCommand() {
  const [adminLevel, setAdminLevel] = useState<AdminLevel>("DISTRICT");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [selectedCluster, setSelectedCluster] = useState<OutbreakCluster>(ACTIVE_CLUSTERS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "kn" | "hi" | "ta" | "te">("en");
  const [labSamples, setLabSamples] = useState<LabReferral[]>(LAB_REFERRALS);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const advisory = MULTILINGUAL_ADVISORIES[selectedLanguage];
  const weather = CURRENT_WEATHER_EPI;

  const filteredClusters =
    selectedBlock === "all"
      ? ACTIVE_CLUSTERS
      : ACTIVE_CLUSTERS.filter((c) => c.block.toLowerCase().includes(selectedBlock.toLowerCase()));

  const totalHerds = DISTRICT_BLOCKS.reduce((acc, b) => acc + b.totalHerds, 0);
  const totalAnimals = DISTRICT_BLOCKS.reduce((acc, b) => acc + b.totalAnimals, 0);
  const totalReportedCases = ACTIVE_CLUSTERS.reduce((acc, c) => acc + c.reportedCases, 0);
  const totalMortalities = ACTIVE_CLUSTERS.reduce((acc, c) => acc + c.mortalityCount, 0);
  const morbidityRate = ((totalReportedCases / totalAnimals) * 100).toFixed(2);
  const avgVaccinationCoverage = Math.round(
    ACTIVE_CLUSTERS.reduce((acc, c) => acc + c.vaccinationCoveragePct, 0) / ACTIVE_CLUSTERS.length,
  );

  function handleDispatchRRT(clusterCode: string) {
    toast.success(`Rapid Response Team (RRT) dispatched for cluster ${clusterCode}`);
  }

  function handleBroadcastAdvisory(channel: "SMS" | "IVR") {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      toast.success(
        `${channel} broadcast transmitted to 2,450 registered livestock keepers in ${advisory.languageName}`,
      );
    }, 1200);
  }

  function updateSampleStatus(id: string) {
    setLabSamples((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status === "COLLECTED") return { ...s, status: "IN_TRANSIT_COLD_CHAIN" };
        if (s.status === "IN_TRANSIT_COLD_CHAIN") return { ...s, status: "AT_DISTRICT_LAB" };
        if (s.status === "AT_DISTRICT_LAB") return { ...s, status: "PCR_CONFIRMED" };
        return s;
      }),
    );
    toast.success("Sample laboratory chain-of-custody status updated.");
  }

  return (
    <div className="space-y-6">
      {/* Scope Navigation & Administrative Drill-Down Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department of Animal Husbandry & Veterinary Services
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            District Epidemic Surveillance & Decision Command
          </h2>
          <p className="text-xs text-slate-600">
            Unified multi-tier syndromic monitoring, laboratory referral pipeline, and outbreak
            containment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(["DISTRICT", "BLOCK", "VILLAGE"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setAdminLevel(lvl)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors",
                  adminLevel === lvl
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {lvl}
              </button>
            ))}
          </div>

          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Taluks / Blocks (Kolar District)</option>
            {DISTRICT_BLOCKS.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name} ({b.totalHerds} Herds)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary KPI Aggregate Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Monitored Herds</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{totalHerds}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {totalAnimals.toLocaleString()} cattle, buffalo, goats
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-medium uppercase tracking-wider">Active Clusters</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-700">
            {ACTIVE_CLUSTERS.length}
          </div>
          <div className="mt-1 text-[11px] font-medium text-rose-600">2 Critical (FMD, PPR)</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Reported Morbidity</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {morbidityRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {totalReportedCases} symptomatic animals
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Mortalities</span>
            <Activity className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {totalMortalities}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Case fatality: 12.5%</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Ring Vaccination</span>
            <Syringe className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            {avgVaccinationCoverage}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">5km perimeter target</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Lab Turnaround</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">22.4 hrs</div>
          <div className="mt-1 text-[11px] text-slate-500">Field to DDL confirmation</div>
        </div>
      </div>

      {/* Geospatial Outbreak Mapping & Syndromic Cluster Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* OpenStreetMap Real-Time GIS Spatial Surveillance */}
        <div className="lg:col-span-7">
          <OpenStreetMapGIS
            selectedCluster={selectedCluster}
            onSelectCluster={setSelectedCluster}
            filterBlock={selectedBlock}
          />
        </div>

        {/* AI Syndromic Triage & Cluster Detail Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Outbreak Identification Engine
              </span>
              <h3 className="text-base font-bold text-slate-900">{selectedCluster.disease}</h3>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
                selectedCluster.severity === "CRITICAL"
                  ? "bg-rose-100 text-rose-800"
                  : selectedCluster.severity === "HIGH"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-800",
              )}
            >
              {selectedCluster.severity}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <div className="text-[11px] text-slate-500">Outbreak Probability Index</div>
                <div className="text-xl font-extrabold text-slate-900">
                  {selectedCluster.outbreakScore} / 100
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Cluster Identifier</div>
                <div className="text-xs font-mono font-bold text-slate-800">
                  {selectedCluster.code}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-200 p-2.5">
                <span className="text-[10px] uppercase text-slate-400">Location Focus</span>
                <div className="font-semibold text-slate-900">{selectedCluster.village}</div>
                <div className="text-[11px] text-slate-500">{selectedCluster.block}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <span className="text-[10px] uppercase text-slate-400">Containment Protocol</span>
                <div className="font-semibold text-slate-900">
                  {selectedCluster.containmentStatus}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedCluster.vaccinationRingKm}km Buffer Ring
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Key Clinical & Syndromic Findings
              </span>
              <ul className="mt-1.5 space-y-1">
                {selectedCluster.symptoms.map((s) => (
                  <li key={s} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  Ring Vaccination Coverage
                </span>
                <span className="text-xs font-extrabold text-emerald-800">
                  {selectedCluster.vaccinationCoveragePct}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${selectedCluster.vaccinationCoveragePct}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDispatchRRT(selectedCluster.code)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:scale-[0.99]"
            >
              <Send className="h-3.5 w-3.5" />
              Dispatch Mobile Rapid Response Team (RRT)
            </button>
          </div>
        </div>
      </div>

      {/* Environmental Epidemiology & Weather Correlation Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Weather & Environmental Epidemiological Correlation
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Correlating meteorological telemetry with vector hatching cycles and seasonal
              pathology models.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Vector Risk Index: {weather.vectorRisk.level}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Ambient Temperature</span>
              <ThermometerSun className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">{weather.temperatureC} °C</div>
            <div className="text-[11px] text-slate-500">
              Heat stress category: {weather.heatStressCategory}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Relative Humidity</span>
              <CloudRain className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">
              {weather.relativeHumidityPct} %
            </div>
            <div className="text-[11px] text-slate-500">Microclimate condensation active</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">24h Cumulative Rainfall</span>
              <CloudRain className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">{weather.rainfall24hMm} mm</div>
            <div className="text-[11px] text-slate-500">
              Standing water index: {weather.standingWaterIndex}
            </div>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-xs font-semibold">Threatened Pathologies</span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-1 text-xs font-bold text-rose-900">
              {weather.vectorRisk.threatenedPathologies.join(", ")}
            </div>
            <div className="mt-1 text-[10px] text-rose-700">
              Primary vectors: {weather.vectorRisk.primaryVectors.join(", ")}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <span className="font-bold text-slate-900">Epidemiological Field Directive: </span>
          {weather.vectorRisk.actionAdvice}
        </div>
      </div>

      {/* Laboratory Referral, Sample Collection & Case Escalation Pipeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Diagnostic Laboratory Referral & Chain-of-Custody Tracking
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Tracking biospecimens from field collection through cold-chain transit to District
              Diagnostic Labs (DDL).
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.info("New biospecimen requisition form opened.")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-100"
          >
            <FileText className="h-3.5 w-3.5" />
            Generate Specimen Requisition
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Sample Code</th>
                <th className="px-3 py-2.5">Animal Tag / Species</th>
                <th className="px-3 py-2.5">Sample Type</th>
                <th className="px-3 py-2.5">Suspected Pathogen</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Testing Status</th>
                <th className="px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labSamples.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-3 font-mono font-bold text-slate-900">{s.sampleCode}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-900">{s.animalTag}</div>
                    <div className="text-[11px] text-slate-500">{s.species}</div>
                  </td>
                  <td className="px-3 py-3">{s.sampleType}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{s.suspectedPathogen}</td>
                  <td className="px-3 py-3">
                    <div>{s.village}</div>
                    <div className="text-[11px] text-slate-500">{s.block}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                        s.status === "PCR_CONFIRMED"
                          ? "bg-rose-100 text-rose-800"
                          : s.status === "RULED_OUT_NEGATIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.status === "AT_DISTRICT_LAB"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-amber-100 text-amber-800",
                      )}
                    >
                      {s.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => updateSampleStatus(s.id)}
                      className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      Advance Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multilingual Farmer Advisory & Community Alert Broadcaster */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Multilingual Farmer Advisory & Community Broadcast System
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Disseminating official containment directives and biosecurity advisories across
              regional languages.
            </p>
          </div>

          {/* Language Selector Tabs */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(
              [
                { id: "en", label: "English" },
                { id: "kn", label: "ಕನ್ನಡ" },
                { id: "hi", label: "हिन्दी" },
                { id: "ta", label: "தமிழ்" },
                { id: "te", label: "తెలుగు" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLanguage(lang.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  selectedLanguage === lang.id
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Target Condition: {advisory.diseaseTarget}
            </span>
            <span className="text-xs text-slate-500">
              Broadcasting Channel: Mobile SMS & Voice IVR
            </span>
          </div>

          <h4 className="mt-2 text-sm font-bold text-slate-900">{advisory.title}</h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            {advisory.containmentNotice}
          </p>

          <div className="mt-3">
            <span className="text-[11px] font-bold uppercase text-slate-600">
              Action Directives for Farmers:
            </span>
            <ul className="mt-1.5 space-y-1.5">
              {advisory.preventiveDirectives.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-800">
                    {i + 1}
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-600">
              <PhoneCall className="h-4 w-4 text-slate-500" />
              <span>{advisory.hotline}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isBroadcasting}
                onClick={() => handleBroadcastAdvisory("SMS")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                <Radio className="h-3.5 w-3.5 text-indigo-600" />
                Broadcast SMS Blast
              </button>
              <button
                type="button"
                disabled={isBroadcasting}
                onClick={() => handleBroadcastAdvisory("IVR")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                <PhoneCall className="h-3.5 w-3.5 text-white" />
                Trigger Voice IVR Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
