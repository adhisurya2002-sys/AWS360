import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard header for pages opened from the More menu:
 * back arrow + page title (+ optional trailing action).
 */
export function PageHeader({
  title,
  icon: Icon,
  action,
  backTo = "/dashboard",
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  backTo?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-slate-200 pb-4 mb-6", className)}>
      <Link
        to={backTo}
        aria-label="Go Back"
        className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      {Icon && <Icon className="h-5 w-5 shrink-0 text-indigo-600" />}
      <h1 className="min-w-0 flex-1 truncate text-xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h1>
      {action}
    </div>
  );
}
