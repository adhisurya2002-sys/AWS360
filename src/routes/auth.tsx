import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  LogIn,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Official Sign In · AVS 360 Surveillance Portal" },
      {
        name: "description",
        content:
          "Department of Animal Husbandry & Veterinary Services · Integrated Disease Surveillance & Decision Support System.",
      },
    ],
  }),
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Enforce pure white background & reset dark mode on auth screen
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#f8fafc";
    document.body.style.color = "#0f172a";
    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem("av360:demo_mode") === "true") {
      nav({ to: "/dashboard", replace: true });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard", replace: true });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) nav({ to: "/dashboard", replace: true });
    });
    return () => listener.subscription.unsubscribe();
  }, [nav]);

  function launchDemo() {
    localStorage.setItem("av360:demo_mode", "true");
    toast.success("Authenticated as Official Field Epidemiologist (Demo Mode)");
    nav({ to: "/dashboard", replace: true });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        if (data.session) {
          nav({ to: "/dashboard", replace: true });
        } else {
          toast.success(
            "Registration received! Check email for verification link, or use Instant Demo Mode below.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        toast.error(`Google Sign-In: ${error.message}. Please use Instant Demo Mode.`);
      }
    } catch {
      toast.error("Google OAuth is not configured. Please launch with Instant Demo Mode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-50 flex flex-col justify-between items-center px-4 py-8 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      {/* Decorative Ambient Soft Indigo Halo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Department Ribbon */}
      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Government of Karnataka · Department of Animal Husbandry</span>
        </div>
      </div>

      {/* Center Authentication Container */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
          {/* Official Brand Logo with User-Selected Shield Color */}
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
            {/* The signature royal indigo shield icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-transform hover:scale-105 duration-200">
              <Shield className="h-6 w-6 stroke-[2.2]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  AVS 360
                </span>
                <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  SURVEILLANCE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                Animal Disease Early Warning & Decision Support
              </p>
            </div>
          </div>

          {/* Mode Tabs (Sign In / Register) */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all duration-200",
                mode === "signin"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all duration-200",
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <UserPlus className="h-3.5 w-3.5" />
              New Officer
            </button>
          </div>

          <div className="mt-5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {mode === "signin" ? "Veterinarian Authentication" : "Register Official Account"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === "signin"
                ? "Access real-time disease maps, telemetry, and referral workflows."
                : "Register credentials with the state veterinary surveillance network."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@ahvs.kar.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Primary Action Button using the Royal Indigo Shield Color */}
            <button
              type="submit"
              disabled={busy}
              className={cn(
                "group relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60",
              )}
            >
              <span>
                {mode === "signin" ? "Authorize & Enter Portal" : "Create Official Account"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Clean Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
              <span className="bg-white px-2 text-slate-400">One-Click Demonstration Access</span>
            </div>
          </div>

          {/* Instant Demo Mode Button (Prominent, High-Priority, Beautiful Indigo Styling) */}
          <button
            type="button"
            onClick={launchDemo}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-xs font-bold text-indigo-700 shadow-2xs transition-all duration-200 hover:bg-indigo-100 hover:border-indigo-300 active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 transition-transform group-hover:rotate-12 duration-200" />
            <span>Launch Instant Demo Mode</span>
            <span className="rounded-md bg-indigo-200/70 px-1.5 py-0.5 text-[9px] font-bold text-indigo-800 uppercase">
              Full Access
            </span>
          </button>

          {/* Alternative Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
          >
            <Mail className="h-3.5 w-3.5 text-slate-500" />
            <span>Continue with Institutional Google</span>
          </button>
        </div>
      </div>

      {/* Security & Accreditation Footer */}
      <div className="relative z-10 w-full max-w-md text-center text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span>Integrated Livestock Health & Surveillance Protocol</span>
        </div>
        <p className="text-[11px] text-slate-400">
          State Veterinary Emergency Toll-Free Hotline:{" "}
          <strong className="text-slate-700">1800-425-0012</strong>
        </p>
      </div>
    </div>
  );
}
