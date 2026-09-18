import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && localStorage.getItem("av360:demo_mode") === "true") {
      return {
        user: {
          id: "00000000-0000-0000-0000-000000000000",
          email: "demo@av360vet.local",
          role: "authenticated",
          aud: "authenticated",
          app_metadata: { provider: "demo" },
          user_metadata: { name: "Demo Veterinarian" },
          created_at: new Date().toISOString(),
        } as unknown as import("@supabase/supabase-js").User,
      };
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
