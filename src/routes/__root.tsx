import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AlertWatcher } from "@/components/av360/AlertWatcher";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-indigo-600">404</h1>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Page not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          That route isn't part of AVS 360 National Veterinary Surveillance.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Return to Surveillance Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#ffffff" },
      { title: "AVS 360 — National Animal Disease Surveillance & Telemetry" },
      {
        name: "description",
        content:
          "Real-time BLE health monitoring and syndromic epidemic surveillance for Indian livestock.",
      },
      { property: "og:title", content: "AVS 360 — National Animal Disease Surveillance" },
      {
        property: "og:description",
        content:
          "Real time animal health monitoring system . Tracks heart rate, SpO₂, and temperature with real-time alerts and smart dashboard.”",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "AV360 Vet+ — Smart Animal Health Monitor" },
      {
        name: "description",
        content:
          "Real time animal health monitoring system . Tracks heart rate, SpO₂, and temperature with real-time alerts and smart dashboard.”",
      },
      {
        name: "twitter:description",
        content:
          "Real time animal health monitoring system . Tracks heart rate, SpO₂, and temperature with real-time alerts and smart dashboard.”",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6dcc5bb1-b156-4302-a579-757d4ff98faa",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6dcc5bb1-b156-4302-a579-757d4ff98faa",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <AlertWatcher />
      <Toaster position="top-right" theme="light" closeButton richColors />
    </>
  );
}
