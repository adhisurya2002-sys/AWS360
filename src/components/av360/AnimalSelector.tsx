import { useEffect, useState } from "react";
import { Activity, Cat, Dog, PawPrint } from "lucide-react";
import { telemetry } from "@/lib/av360/store";
import type { Animal } from "@/lib/av360/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ANIMALS: { key: Animal; label: string; icon: typeof Dog }[] = [
  { key: "DOG", label: "Canine", icon: Dog },
  { key: "CAT", label: "Feline", icon: Cat },
  { key: "COW", label: "Bovine", icon: PawPrint },
  { key: "GOAT", label: "Caprine", icon: Activity },
];

const STORAGE_KEY = "av360.animal";

export function AnimalSelector({ current }: { current: Animal | null }) {
  const [selected, setSelected] = useState<Animal | null>(current);

  useEffect(() => {
    if (current) setSelected(current);
    else {
      const saved = (typeof localStorage !== "undefined" &&
        localStorage.getItem(STORAGE_KEY)) as Animal | null;
      if (saved) {
        setSelected(saved);
        telemetry.setAnimal(saved).catch(() => undefined);
      }
    }
  }, [current]);

  const pick = async (a: Animal) => {
    setSelected(a);
    localStorage.setItem(STORAGE_KEY, a);
    try {
      await telemetry.setAnimal(a);
      toast.success(`Active profile: ${a}`);
    } catch (e) {
      toast.error(`Failed to switch profile: ${(e as Error).message}`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Animal Diagnostic Profile
        </span>
        {selected && (
          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            {selected}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ANIMALS.map(({ key, label, icon: Icon }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              onClick={() => pick(key)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs font-semibold transition-all",
                active
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
