import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Calendar,
  Cat,
  Dog,
  Download,
  Filter,
  Layers,
  MapPin,
  PawPrint,
  Plus,
  Radio,
  Search,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/av360/AppShell";
import { deleteRow, insertRow, setSelectedAnimalId, useRows, type AnimalRow } from "@/lib/av360/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/animals")({
  component: AnimalsPage,
  head: () => ({
    meta: [
      { title: "Livestock & Animal Registry · AVS 360" },
      {
        name: "description",
        content:
          "Official livestock census, individual electronic RFID identification, and animal health directory.",
      },
    ],
  }),
});

function getSpeciesIcon(species: string) {
  const s = species.toUpperCase();
  if (s === "DOG") return Dog;
  if (s === "CAT") return Cat;
  if (s === "GOAT") return Activity;
  return PawPrint; // COW / Bovine
}

function getSpeciesBadge(species: string) {
  const s = species.toUpperCase();
  if (s === "COW")
    return { label: "Bovine · Cattle", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (s === "GOAT")
    return { label: "Caprine · Goat", color: "text-amber-800 bg-amber-50 border-amber-200" };
  if (s === "DOG")
    return { label: "Canine · Working", color: "text-blue-700 bg-blue-50 border-blue-200" };
  if (s === "CAT")
    return { label: "Feline · Domestic", color: "text-purple-700 bg-purple-50 border-purple-200" };
  return { label: species, color: "text-slate-700 bg-slate-50 border-slate-200" };
}

function AnimalsPage() {
  const { rows, loading } = useRows<AnimalRow>("animals", {
    orderBy: "created_at",
    ascending: false,
  });

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  async function handleAddAnimal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);

    const tagId =
      String(f.get("tag_id") || "").trim() || `KA-07-REG-${Date.now().toString().slice(-4)}`;
    const name = String(f.get("name") || "").trim() || "Registered Livestock";
    const species = String(f.get("species") || "COW");
    const breed = String(f.get("breed") || "").trim() || null;
    const age = f.get("age_months") ? Number(f.get("age_months")) : null;
    const gender = String(f.get("gender") || "") || "Female";
    const owner = String(f.get("owner_name") || "").trim() || "District Livestock Owner";
    const notes = String(f.get("notes") || "").trim() || null;

    const res = await insertRow("animals", {
      tag_id: tagId,
      name,
      species,
      breed,
      age_months: age,
      gender,
      owner_name: owner,
      photo_url: null,
      notes,
    });

    setBusy(false);
    setOpen(false);
    toast.success(
      res.pending ? "Queued locally for synchronization" : `Registered ${name} (${tagId})`,
    );
  }

  // Filter animals by search and species category
  const filteredRows = rows.filter((a) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tag_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.owner_name && a.owner_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.breed && a.breed.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      selectedFilter === "ALL" ||
      (selectedFilter === "BOVINE" && a.species.toUpperCase() === "COW") ||
      (selectedFilter === "CAPRINE" && a.species.toUpperCase() === "GOAT") ||
      (selectedFilter === "CANINE" && a.species.toUpperCase() === "DOG") ||
      (selectedFilter === "FELINE" && a.species.toUpperCase() === "CAT");

    return matchesSearch && matchesFilter;
  });

  const countBovine = rows.filter((a) => a.species.toUpperCase() === "COW").length;
  const countCaprine = rows.filter((a) => a.species.toUpperCase() === "GOAT").length;
  const countCanine = rows.filter((a) => a.species.toUpperCase() === "DOG").length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Title & Institutional Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <PawPrint className="h-4 w-4 text-indigo-600" />
              <span>Department Livestock Registry · INAPH & Pashu Aadhaar Link</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Monitored Livestock & Animal Registry
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Census directory of tagged farm livestock, wearable BLE sensor deployments, and
              epidemiological history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                toast.info("Exporting complete district animal census report (CSV)...")
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Export Registry
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Register New Livestock
            </button>
          </div>
        </div>

        {/* Statistical Summary Metric Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">Total Registered</span>
              <Layers className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">{rows.length}</div>
            <div className="mt-1 text-[11px] text-slate-500">Monitored in Kolar District</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Bovine (Cattle/Buffalo)
              </span>
              <PawPrint className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-700">{countBovine}</div>
            <div className="mt-1 text-[11px] text-slate-500">Dairy & breeding stock</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Small Ruminants (Goat/Sheep)
              </span>
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-amber-700">{countCaprine}</div>
            <div className="mt-1 text-[11px] text-slate-500">Flock surveillance active</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium uppercase tracking-wider">
                Companion / Working Dog
              </span>
              <Dog className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-blue-700">{countCanine}</div>
            <div className="mt-1 text-[11px] text-slate-500">Farm protection & guard dogs</div>
          </div>
        </div>

        {/* Search Bar & Species Filter Tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by animal name, tag ID, breed, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {[
              { id: "ALL", label: `All (${rows.length})` },
              { id: "BOVINE", label: `Bovine (${countBovine})` },
              { id: "CAPRINE", label: `Caprine (${countCaprine})` },
              { id: "CANINE", label: `Canine (${countCanine})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition-all",
                  selectedFilter === tab.id
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Livestock Grid */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            Loading district livestock registry...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
            <PawPrint className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-2 text-sm font-bold text-slate-900">No matching livestock found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search criteria or register a new animal.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Register Livestock
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((a) => {
              const Icon = getSpeciesIcon(a.species);
              const badge = getSpeciesBadge(a.species);

              return (
                <div
                  key={a.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div>
                    {/* Header: Icon, Tag ID, Species Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{a.name}</h3>
                            <span
                              className={cn(
                                "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                                badge.color,
                              )}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <Tag className="h-3 w-3 text-slate-400" />
                            <span>{a.tag_id}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Remove ${a.name} from the registry?`)) {
                            await deleteRow("animals", a.id);
                            toast.success(`Removed ${a.name}`);
                          }
                        }}
                        title="Remove livestock"
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Metadata Specs */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Breed & Gender
                        </span>
                        <div className="font-semibold text-slate-800 truncate">
                          {a.breed ?? "Indigenous Breed"}
                        </div>
                        <div className="text-[11px] text-slate-500">{a.gender ?? "Female"}</div>
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Age
                        </span>
                        <div className="font-semibold text-slate-800">
                          {a.age_months ? `${a.age_months} Months` : "Adult"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {a.age_months ? `${(a.age_months / 12).toFixed(1)} yrs` : "—"}
                        </div>
                      </div>
                    </div>

                    {/* Owner & Location */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Owner:{" "}
                        <strong className="text-slate-800">
                          {a.owner_name ?? "State Livestock Farm"}
                        </strong>
                      </span>
                    </div>

                    {/* Clinical Notes */}
                    {a.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2 bg-slate-50 rounded-lg p-2 border border-slate-100">
                        {a.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <Link
                      to="/animals/$animalId"
                      params={{ animalId: a.id }}
                      onClick={() => setSelectedAnimalId(a.id)}
                      className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Health Records & Trends →
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setSelectedAnimalId(a.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Radio className="h-3 w-3 text-emerald-600" />
                      Telemetry
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Register New Livestock Form */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Register New Livestock</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddAnimal} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      RFID Tag / Pashu Aadhaar
                    </label>
                    <input
                      name="tag_id"
                      placeholder={`KA-07-REG-${Date.now().toString().slice(-4)}`}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Animal Call Name *
                    </label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. Kamadhenu"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Species Classification
                    </label>
                    <select
                      name="species"
                      defaultValue="COW"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="COW">Bovine (Cattle / Buffalo)</option>
                      <option value="GOAT">Caprine (Goat / Sheep)</option>
                      <option value="DOG">Canine (Working / Guard Dog)</option>
                      <option value="CAT">Feline (Domestic Cat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Breed Variety
                    </label>
                    <input
                      name="breed"
                      placeholder="e.g. HF Cross, Murrah, Osmanabadi"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Age (in Months)
                    </label>
                    <input
                      name="age_months"
                      type="number"
                      min={0}
                      placeholder="e.g. 24"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      defaultValue="Female"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Farmer / Livestock Keeper Name & Village
                    </label>
                    <input
                      name="owner_name"
                      placeholder="e.g. Ramesh Gowda · Doddahosahalli, Malur Block"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Clinical & Vaccination History Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Vaccination status, ear tag placement, health history..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {busy ? "Registering..." : "Save to Official Registry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
