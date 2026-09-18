import { Link } from "@tanstack/react-router";
import { Activity, Cat, Dog, PawPrint } from "lucide-react";
import { useSelectedAnimal } from "@/lib/av360/db";
import { cn } from "@/lib/utils";

function getSpeciesIcon(species?: string | null) {
  const s = (species ?? "").toUpperCase();
  if (s === "DOG") return Dog;
  if (s === "CAT") return Cat;
  if (s === "GOAT") return Activity;
  return PawPrint;
}

/** Horizontal animal chooser used across records screens (Pure white, zero emojis). */
export function AnimalPicker({ compact = false }: { compact?: boolean }) {
  const { animal, animals, select } = useSelectedAnimal();

  if (animals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
        No livestock registered yet.{" "}
        <Link to="/animals" className="font-semibold text-indigo-600 hover:underline">
          Register livestock
        </Link>{" "}
        to monitor health records.
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1", compact && "text-xs")}>
      {animals.map((a) => {
        const Icon = getSpeciesIcon(a.species);
        const active = animal?.id === a.id;

        return (
          <button
            key={a.id}
            type="button"
            onClick={() => select(a.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all shadow-2xs",
              active
                ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <Icon className={cn("h-4 w-4", active ? "text-indigo-600" : "text-slate-500")} />
            <span>{a.name}</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">({a.tag_id})</span>
          </button>
        );
      })}
    </div>
  );
}
